import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import AuditLog from '../models/AuditLog.js';
import { runTransaction } from '../utils/transaction.js';

export const getTrips = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '', status } = req.query;

    const query = { isDeleted: { $ne: true } };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { tripNumber: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Populate driver and vehicle references
    const data = await Trip.find(query)
      .populate('vehicleId')
      .populate('driverId')
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Trip.countDocuments(query);

    res.json({
      success: true,
      data,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicleId')
      .populate('driverId');
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    res.json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

export const createTrip = async (req, res, next) => {
  try {
    const { vehicleId, driverId, cargoWeightKg } = req.body;

    // Fetch vehicle & driver to validate capacity and basic presence
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Cargo weight cannot exceed vehicle capacity
    if (cargoWeightKg > vehicle.capacityKg) {
      return res.status(422).json({
        success: false,
        message: `Cargo weight (${cargoWeightKg}kg) exceeds vehicle capacity (${vehicle.capacityKg}kg)`
      });
    }

    const trip = new Trip({
      ...req.body,
      status: 'draft',
      createdBy: req.user._id,
      updatedBy: req.user._id,
      timeline: [{ status: 'draft', notes: 'Trip created in draft mode', updatedBy: req.user._id }]
    });

    const savedTrip = await trip.save();

    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'Trip',
      entityId: savedTrip._id,
      action: 'create',
      after: savedTrip.toObject()
    });

    res.status(201).json({ success: true, data: savedTrip });
  } catch (error) {
    next(error);
  }
};

export const dispatchTrip = async (req, res, next) => {
  try {
    const result = await runTransaction(async (session) => {
      const trip = await Trip.findById(req.params.id).session(session);
      if (!trip) {
        throw { status: 404, message: 'Trip not found' };
      }

      if (trip.status !== 'draft' && trip.status !== 'scheduled') {
        throw { status: 400, message: `Cannot dispatch trip in ${trip.status} status` };
      }

      const vehicle = await Vehicle.findById(trip.vehicleId).session(session);
      if (!vehicle) {
        throw { status: 404, message: 'Assigned vehicle not found' };
      }

      // Check vehicle invariants
      if (vehicle.status === 'retired' || vehicle.status === 'In Shop') {
        throw { status: 409, message: `Vehicle is currently in ${vehicle.status} status and cannot be assigned` };
      }
      if (vehicle.status === 'on_trip') {
        throw { status: 409, message: 'Vehicle is already on an active trip' };
      }

      const driver = await Driver.findById(trip.driverId).session(session);
      if (!driver) {
        throw { status: 404, message: 'Assigned driver not found' };
      }

      // Check driver invariants
      if (driver.status === 'suspended' || driver.status === 'Off Duty') {
        throw { status: 409, message: `Driver is currently ${driver.status} and cannot be assigned` };
      }
      if (driver.status === 'on_trip') {
        throw { status: 409, message: 'Driver is already on an active trip' };
      }
      if (new Date(driver.expiryDate) < new Date()) {
        throw { status: 409, message: 'Driver license has expired' };
      }

      // Transition vehicle and driver statuses to on_trip
      vehicle.status = 'on_trip';
      await vehicle.save({ session });

      driver.status = 'on_trip';
      await driver.save({ session });

      // Transition trip status to dispatched
      const beforeTrip = trip.toObject();
      trip.status = 'dispatched';
      trip.timeline.push({ status: 'dispatched', notes: 'Trip dispatched successfully', updatedBy: req.user._id });
      trip.updatedBy = req.user._id;
      await trip.save({ session });

      await AuditLog.create([{
        actorId: req.user._id,
        entityType: 'Trip',
        entityId: trip._id,
        action: 'dispatch',
        before: beforeTrip,
        after: trip.toObject()
      }], { session });

      return trip;
    });

    res.json({ success: true, message: 'Trip dispatched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const completeTrip = async (req, res, next) => {
  try {
    const { actualDurationHours, notes } = req.body;

    const result = await runTransaction(async (session) => {
      const trip = await Trip.findById(req.params.id).session(session);
      if (!trip) {
        throw { status: 404, message: 'Trip not found' };
      }

      if (trip.status !== 'dispatched' && trip.status !== 'in_progress') {
        throw { status: 400, message: `Cannot complete trip in ${trip.status} status` };
      }

      const vehicle = await Vehicle.findById(trip.vehicleId).session(session);
      const driver = await Driver.findById(trip.driverId).session(session);

      // Revert vehicle & driver to available
      if (vehicle) {
        vehicle.status = 'available';
        // Increment odometer by trip distance or provided final odometer reading
        if (req.body.endingOdometerKm && req.body.endingOdometerKm > vehicle.odometerKm) {
          vehicle.odometerKm = req.body.endingOdometerKm;
        } else {
          vehicle.odometerKm += trip.distanceKm;
        }
        await vehicle.save({ session });
      }

      if (driver) {
        driver.status = 'available';
        // Add random slight boost or penalty to safety score if completing successfully
        if (req.body.safetyScoreChange) {
          driver.safetyScore = Math.max(0, Math.min(100, driver.safetyScore + parseInt(req.body.safetyScoreChange)));
        }
        await driver.save({ session });
      }

      const beforeTrip = trip.toObject();
      trip.status = 'completed';
      trip.actualDurationHours = actualDurationHours || Math.round(trip.distanceKm / 70); // Estimate if not provided
      trip.notes = notes || trip.notes;
      trip.timeline.push({ status: 'completed', notes: notes || 'Trip completed, vehicle and driver released', updatedBy: req.user._id });
      trip.updatedBy = req.user._id;
      await trip.save({ session });

      await AuditLog.create([{
        actorId: req.user._id,
        entityType: 'Trip',
        entityId: trip._id,
        action: 'complete',
        before: beforeTrip,
        after: trip.toObject()
      }], { session });

      return trip;
    });

    res.json({ success: true, message: 'Trip completed successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const cancelTrip = async (req, res, next) => {
  try {
    const result = await runTransaction(async (session) => {
      const trip = await Trip.findById(req.params.id).session(session);
      if (!trip) {
        throw { status: 404, message: 'Trip not found' };
      }

      if (trip.status === 'completed' || trip.status === 'cancelled') {
        throw { status: 400, message: `Cannot cancel trip in ${trip.status} status` };
      }

      const vehicle = await Vehicle.findById(trip.vehicleId).session(session);
      const driver = await Driver.findById(trip.driverId).session(session);

      // Revert vehicle & driver to available if they were marked as on_trip
      if (trip.status === 'dispatched' || trip.status === 'in_progress') {
        if (vehicle && vehicle.status === 'on_trip') {
          vehicle.status = 'available';
          await vehicle.save({ session });
        }
        if (driver && driver.status === 'on_trip') {
          driver.status = 'available';
          await driver.save({ session });
        }
      }

      const beforeTrip = trip.toObject();
      trip.status = 'cancelled';
      trip.timeline.push({ 
        status: 'cancelled', 
        notes: req.body.notes || 'Trip cancelled by dispatcher', 
        updatedBy: req.user._id 
      });
      trip.updatedBy = req.user._id;
      await trip.save({ session });

      await AuditLog.create([{
        actorId: req.user._id,
        entityType: 'Trip',
        entityId: trip._id,
        action: 'cancel',
        before: beforeTrip,
        after: trip.toObject()
      }], { session });

      return trip;
    });

    res.json({ success: true, message: 'Trip cancelled successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const beforeTrip = await Trip.findById(req.params.id);
    if (!beforeTrip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Only allow details updates in draft/scheduled modes
    if (beforeTrip.status !== 'draft' && beforeTrip.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: 'Can only modify details of draft or scheduled trips' });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'Trip',
      entityId: updatedTrip._id,
      action: 'update',
      before: beforeTrip.toObject(),
      after: updatedTrip.toObject()
    });

    res.json({ success: true, data: updatedTrip });
  } catch (error) {
    next(error);
  }
};
