import MaintenanceRequest from '../models/MaintenanceRequest.js';
import Vehicle from '../models/Vehicle.js';
import AuditLog from '../models/AuditLog.js';
import Expense from '../models/Expense.js';
import { runTransaction } from '../utils/transaction.js';

export const getMaintenance = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', status } = req.query;

    const query = { isDeleted: { $ne: true } };

    if (status) {
      query.status = status;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const data = await MaintenanceRequest.find(query)
      .populate('vehicleId')
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MaintenanceRequest.countDocuments(query);

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

export const getMaintenanceById = async (req, res, next) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id).populate('vehicleId');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const createMaintenance = async (req, res, next) => {
  try {
    const result = await runTransaction(async (session) => {
      const { vehicleId } = req.body;
      const vehicle = await Vehicle.findById(vehicleId).session(session);
      if (!vehicle) {
        throw { status: 404, message: 'Vehicle not found' };
      }

      if (vehicle.status === 'on_trip') {
        throw { status: 409, message: 'Vehicle is currently on a trip and cannot be scheduled for maintenance' };
      }

      // Automatically change vehicle status to maintenance
      vehicle.status = 'maintenance';
      await vehicle.save({ session });

      const request = new MaintenanceRequest({
        ...req.body,
        status: 'scheduled',
        createdBy: req.user._id,
        updatedBy: req.user._id
      });
      const savedRequest = await request.save({ session });

      // Automatically log a pending expense for the maintenance cost
      if (savedRequest.cost > 0) {
        await Expense.create([{
          category: 'Maintenance',
          amount: savedRequest.cost,
          vehicleId: vehicle._id,
          status: 'pending',
          description: `Scheduled maintenance: ${savedRequest.type} - ${savedRequest.description}`,
          incurredAt: savedRequest.scheduledDate,
          createdBy: req.user._id,
          updatedBy: req.user._id
        }], { session });
      }

      await AuditLog.create([{
        actorId: req.user._id,
        entityType: 'MaintenanceRequest',
        entityId: savedRequest._id,
        action: 'create',
        after: savedRequest.toObject()
      }], { session });

      return savedRequest;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const closeMaintenance = async (req, res, next) => {
  try {
    const { cost, completedDate } = req.body;

    const result = await runTransaction(async (session) => {
      const request = await MaintenanceRequest.findById(req.params.id).session(session);
      if (!request) {
        throw { status: 404, message: 'Maintenance record not found' };
      }

      if (request.status === 'completed' || request.status === 'cancelled') {
        throw { status: 400, message: `Maintenance is already ${request.status}` };
      }

      const vehicle = await Vehicle.findById(request.vehicleId).session(session);

      const beforeRequest = request.toObject();
      request.status = 'completed';
      request.cost = cost || request.cost;
      request.completedDate = completedDate ? new Date(completedDate) : new Date();
      request.updatedBy = req.user._id;
      await request.save({ session });

      // Automatically update the matching expense to 'approved' or 'paid'
      if (vehicle) {
        // Check if there are other open maintenance requests for this vehicle
        const otherOpen = await MaintenanceRequest.findOne({
          vehicleId: vehicle._id,
          status: { $in: ['scheduled', 'in_progress'] },
          _id: { $ne: request._id }
        }).session(session);

        // If no other open maintenance, restore vehicle to available
        if (!otherOpen) {
          vehicle.status = 'available';
          await vehicle.save({ session });
        }
      }

      // Register or update expense
      await Expense.findOneAndUpdate(
        { vehicleId: request.vehicleId, description: new RegExp(request.description, 'i') },
        { status: 'approved', amount: request.cost, incurredAt: request.completedDate },
        { session }
      );

      await AuditLog.create([{
        actorId: req.user._id,
        entityType: 'MaintenanceRequest',
        entityId: request._id,
        action: 'close',
        before: beforeRequest,
        after: request.toObject()
      }], { session });

      return request;
    });

    res.json({ success: true, message: 'Maintenance closed successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateMaintenance = async (req, res, next) => {
  try {
    const beforeRequest = await MaintenanceRequest.findById(req.params.id);
    if (!beforeRequest) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    const updated = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'MaintenanceRequest',
      entityId: updated._id,
      action: 'update',
      before: beforeRequest.toObject(),
      after: updated.toObject()
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
