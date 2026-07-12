import FuelLog from '../models/FuelLog.js';

// @desc    Get all fuel logs
// @route   GET /api/fuel
// @access  Private
export const getFuelLogs = async (req, res) => {
  try {
    const logs = await FuelLog.find({ deletedAt: null })
      .populate('vehicle', 'registrationNumber name')
      .populate('driver', 'firstName lastName')
      .sort({ date: -1 });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new fuel log
// @route   POST /api/fuel
// @access  Private
export const createFuelLog = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const log = await FuelLog.create(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
