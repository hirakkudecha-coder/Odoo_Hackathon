import FuelLog from '../models/FuelLog.js';
import Vehicle from '../models/Vehicle.js';
import Expense from '../models/Expense.js';
import AuditLog from '../models/AuditLog.js';
import { runTransaction } from '../utils/transaction.js';

export const getFuelLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'filledAt', order = 'desc' } = req.query;

    const query = { isDeleted: { $ne: true } };

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const data = await FuelLog.find(query)
      .populate('vehicleId')
      .populate('tripId')
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FuelLog.countDocuments(query);

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

export const getFuelLogById = async (req, res, next) => {
  try {
    const log = await FuelLog.findById(req.params.id).populate('vehicleId').populate('tripId');
    if (!log) {
      return res.status(404).json({ success: false, message: 'Fuel log not found' });
    }
    res.json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

export const createFuelLog = async (req, res, next) => {
  try {
    const result = await runTransaction(async (session) => {
      const { vehicleId, odometerKm, cost, liters, fuelStation, tripId } = req.body;

      const vehicle = await Vehicle.findById(vehicleId).session(session);
      if (!vehicle) {
        throw { status: 404, message: 'Vehicle not found' };
      }

      // Check odometer logic (should be higher or equal to current odometer)
      if (odometerKm < vehicle.odometerKm) {
        throw { status: 422, message: `New odometer (${odometerKm} km) cannot be less than current odometer (${vehicle.odometerKm} km)` };
      }

      // Update vehicle odometer
      vehicle.odometerKm = odometerKm;
      await vehicle.save({ session });

      const log = new FuelLog({
        ...req.body,
        createdBy: req.user._id,
        updatedBy: req.user._id
      });
      const saved = await log.save({ session });

      // Create an automatic matching approved expense
      await Expense.create([{
        category: 'Fuel',
        amount: cost,
        vehicleId: saved.vehicleId,
        tripId: tripId || null,
        status: 'approved',
        description: `Fuel refill - ${liters}L at ${fuelStation}`,
        incurredAt: saved.filledAt,
        createdBy: req.user._id,
        updatedBy: req.user._id
      }], { session });

      await AuditLog.create([{
        actorId: req.user._id,
        entityType: 'FuelLog',
        entityId: saved._id,
        action: 'create',
        after: saved.toObject()
      }], { session });

      return saved;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateFuelLog = async (req, res, next) => {
  try {
    const beforeLog = await FuelLog.findById(req.params.id);
    if (!beforeLog) {
      return res.status(404).json({ success: false, message: 'Fuel log not found' });
    }

    const updated = await FuelLog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'FuelLog',
      entityId: updated._id,
      action: 'update',
      before: beforeLog.toObject(),
      after: updated.toObject()
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteFuelLog = async (req, res, next) => {
  try {
    const beforeLog = await FuelLog.findById(req.params.id);
    if (!beforeLog) {
      return res.status(404).json({ success: false, message: 'Fuel log not found' });
    }

    await FuelLog.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });

    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'FuelLog',
      entityId: beforeLog._id,
      action: 'delete',
      before: beforeLog.toObject(),
      after: { ...beforeLog.toObject(), isDeleted: true }
    });

    res.json({ success: true, message: 'Fuel log deleted successfully' });
  } catch (error) {
    next(error);
  }
};
