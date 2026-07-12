import Vehicle from '../models/Vehicle.js';
import AuditLog from '../models/AuditLog.js';
import Trip from '../models/Trip.js';
import MaintenanceRequest from '../models/MaintenanceRequest.js';
import FuelLog from '../models/FuelLog.js';

export const getVehicles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '', status } = req.query;
    
    const query = { isDeleted: { $ne: true } };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const data = await Vehicle.find(query)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Vehicle.countDocuments(query);

    // Calculate dynamic ROI and operational metrics for each vehicle
    const calculatedData = await Promise.all(data.map(async (v) => {
      const [trips, maintenance, fuel] = await Promise.all([
        Trip.find({ vehicleId: v._id, status: 'completed' }),
        MaintenanceRequest.find({ vehicleId: v._id, status: 'completed' }),
        FuelLog.find({ vehicleId: v._id })
      ]);

      const totalRevenue = trips.reduce((acc, curr) => acc + curr.revenue, 0);
      const totalMaintenanceCost = maintenance.reduce((acc, curr) => acc + curr.cost, 0);
      const totalFuelCost = fuel.reduce((acc, curr) => acc + curr.cost, 0);
      const totalFuelLiters = fuel.reduce((acc, curr) => acc + curr.liters, 0);
      
      const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
      const fuelEfficiency = totalFuelLiters > 0 ? (v.odometerKm / totalFuelLiters) : 0;
      
      const roi = v.acquisitionCost > 0 
        ? ((totalRevenue - totalOperationalCost) / v.acquisitionCost) 
        : 0;

      return {
        ...v.toObject(),
        totalOperationalCost,
        fuelEfficiency,
        roi
      };
    }));

    res.json({
      success: true,
      data: calculatedData,
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

export const getVehicleById = async (req, res, next) => {
  try {
    const v = await Vehicle.findById(req.params.id);
    if (!v) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const [trips, maintenance, fuel] = await Promise.all([
      Trip.find({ vehicleId: v._id, status: 'completed' }),
      MaintenanceRequest.find({ vehicleId: v._id, status: 'completed' }),
      FuelLog.find({ vehicleId: v._id })
    ]);

    const totalRevenue = trips.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalMaintenanceCost = maintenance.reduce((acc, curr) => acc + curr.cost, 0);
    const totalFuelCost = fuel.reduce((acc, curr) => acc + curr.cost, 0);
    const totalFuelLiters = fuel.reduce((acc, curr) => acc + curr.liters, 0);
    
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
    const fuelEfficiency = totalFuelLiters > 0 ? (v.odometerKm / totalFuelLiters) : 0;
    
    const roi = v.acquisitionCost > 0 
      ? ((totalRevenue - totalOperationalCost) / v.acquisitionCost) 
      : 0;

    res.json({ 
      success: true, 
      data: {
        ...v.toObject(),
        totalOperationalCost,
        fuelEfficiency,
        roi
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = new Vehicle({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });
    
    const savedVehicle = await vehicle.save();
    
    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'Vehicle',
      entityId: savedVehicle._id,
      action: 'create',
      after: savedVehicle.toObject()
    });

    res.status(201).json({ success: true, data: savedVehicle });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const beforeVehicle = await Vehicle.findById(req.params.id);
    if (!beforeVehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'Vehicle',
      entityId: updatedVehicle._id,
      action: 'update',
      before: beforeVehicle.toObject(),
      after: updatedVehicle.toObject()
    });

    res.json({ success: true, data: updatedVehicle });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const beforeVehicle = await Vehicle.findById(req.params.id);
    if (!beforeVehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Soft delete: update flag and status to retired
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { 
        isDeleted: true, 
        deletedAt: new Date(), 
        status: 'retired',
        updatedBy: req.user._id 
      },
      { new: true }
    );

    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'Vehicle',
      entityId: updatedVehicle._id,
      action: 'delete',
      before: beforeVehicle.toObject(),
      after: updatedVehicle.toObject()
    });

    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const document = {
      name: req.body.name || 'Vehicle Document',
      url: req.file ? `/uploads/${req.file.filename}` : '/uploads/mock_document.pdf',
      expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null
    };

    vehicle.documents.push(document);
    vehicle.updatedBy = req.user._id;
    await vehicle.save();

    res.json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};
