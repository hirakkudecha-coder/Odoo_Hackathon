import Maintenance from '../models/Maintenance.js';
import Vehicle from '../models/Vehicle.js';

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private
export const getMaintenanceRecords = async (req, res) => {
  try {
    const records = await Maintenance.find({ deletedAt: null })
      .populate('vehicle', 'registrationNumber name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new maintenance record
// @route   POST /api/maintenance
// @access  Private
export const createMaintenance = async (req, res) => {
  try {
    const { vehicle: vehicleId } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.deletedAt) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (vehicle.status === 'On Trip') {
      return res.status(400).json({ success: false, message: 'Cannot service a vehicle that is currently on a trip' });
    }

    req.body.createdBy = req.user.id;
    
    // If status is In Progress, automatically update vehicle status
    if (req.body.status === 'In Progress') {
      vehicle.status = 'Maintenance';
      await vehicle.save();
    }

    const record = await Maintenance.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update maintenance record (Complete it)
// @route   PUT /api/maintenance/:id
// @access  Private
export const updateMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findOne({ _id: req.params.id, deletedAt: null });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // If status is changing to Completed
    if (req.body.status === 'Completed' && record.status !== 'Completed') {
      req.body.dateCompleted = new Date();
      
      const vehicle = await Vehicle.findById(record.vehicle);
      if (vehicle) {
        vehicle.status = 'Available';
        await vehicle.save();
      }
    }

    req.body.updatedBy = req.user.id;

    const updatedRecord = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: updatedRecord });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
