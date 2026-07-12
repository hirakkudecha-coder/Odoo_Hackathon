import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
export const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ deletedAt: null })
      .populate('vehicle', 'registrationNumber name type')
      .populate('driver', 'firstName lastName licenseNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: trips.length, data: trips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
export const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, deletedAt: null })
      .populate('vehicle')
      .populate('driver')
      .populate('timeline.user', 'name');
      
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    res.json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new trip & dispatch
// @route   POST /api/trips
// @access  Private
export const createTrip = async (req, res) => {
  try {
    const { vehicle: vehicleId, driver: driverId, cargoWeight } = req.body;

    // Validate Vehicle
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.deletedAt) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    if (vehicle.status !== 'Available') {
      return res.status(400).json({ success: false, message: `Vehicle is currently ${vehicle.status}` });
    }
    if (cargoWeight > vehicle.maxCapacity) {
      return res.status(400).json({ success: false, message: `Cargo weight exceeds vehicle capacity of ${vehicle.maxCapacity}kg` });
    }

    // Validate Driver
    const driver = await Driver.findById(driverId);
    if (!driver || driver.deletedAt) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    if (driver.status !== 'Available') {
      return res.status(400).json({ success: false, message: `Driver is currently ${driver.status}` });
    }

    req.body.createdBy = req.user.id;
    req.body.status = 'Dispatched';
    req.body.dispatchTime = new Date();
    req.body.timeline = [{
      status: 'Dispatched',
      notes: 'Trip initiated and dispatched',
      user: req.user.id
    }];

    const trip = await Trip.create(req.body);

    // Update Vehicle and Driver Statuses automatically
    vehicle.status = 'On Trip';
    await vehicle.save();

    driver.status = 'On Trip';
    await driver.save();

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Complete trip
// @route   PUT /api/trips/:id/complete
// @access  Private
export const completeTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, deletedAt: null });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.status === 'Completed' || trip.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: `Trip is already ${trip.status}` });
    }

    trip.status = 'Completed';
    trip.completionTime = new Date();
    trip.updatedBy = req.user.id;
    trip.timeline.push({
      status: 'Completed',
      notes: req.body.notes || 'Trip completed successfully',
      user: req.user.id
    });

    await trip.save();

    // Restore Vehicle and Driver statuses
    const vehicle = await Vehicle.findById(trip.vehicle);
    if (vehicle) {
      vehicle.status = 'Available';
      await vehicle.save();
    }

    const driver = await Driver.findById(trip.driver);
    if (driver) {
      driver.status = 'Available';
      await driver.save();
    }

    res.json({ success: true, data: trip });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
