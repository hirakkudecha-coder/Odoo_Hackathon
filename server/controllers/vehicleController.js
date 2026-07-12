import Vehicle from '../models/Vehicle.js';

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ deletedAt: null }).sort({ createdAt: -1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, deletedAt: null });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private
export const createVehicle = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Check unique registration
    const existing = await Vehicle.findOne({ registrationNumber: req.body.registrationNumber.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Vehicle with this registration already exists' });
    }

    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
export const updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findOne({ _id: req.params.id, deletedAt: null });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    req.body.updatedBy = req.user.id;
    
    // Make sure we don't accidentally update status to something invalid without checks
    // But since this is a general update, we'll allow it for now and handle status specific logic elsewhere if needed

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete vehicle (Soft Delete)
// @route   DELETE /api/vehicles/:id
// @access  Private
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, deletedAt: null });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Business rule: Cannot delete if on trip or in maintenance
    if (vehicle.status === 'On Trip' || vehicle.status === 'Maintenance') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete a vehicle that is currently on a trip or in maintenance' 
      });
    }

    vehicle.deletedAt = new Date();
    vehicle.status = 'Retired';
    vehicle.updatedBy = req.user.id;
    await vehicle.save();

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
