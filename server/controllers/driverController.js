import Driver from '../models/Driver.js';

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
export const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ deletedAt: null }).sort({ createdAt: -1 });
    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private
export const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, deletedAt: null });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new driver
// @route   POST /api/drivers
// @access  Private
export const createDriver = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    // Check unique license number
    const existing = await Driver.findOne({ licenseNumber: req.body.licenseNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Driver with this license number already exists' });
    }

    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private
export const updateDriver = async (req, res) => {
  try {
    let driver = await Driver.findOne({ _id: req.params.id, deletedAt: null });

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    req.body.updatedBy = req.user.id;

    driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete driver (Soft Delete)
// @route   DELETE /api/drivers/:id
// @access  Private
export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, deletedAt: null });

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (driver.status === 'On Trip') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete a driver that is currently on a trip' 
      });
    }

    driver.deletedAt = new Date();
    driver.status = 'Inactive';
    driver.updatedBy = req.user.id;
    await driver.save();

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
