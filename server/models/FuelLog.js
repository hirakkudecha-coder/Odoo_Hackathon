import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Please select a vehicle']
  },
  driver: {
    type: mongoose.Schema.ObjectId,
    ref: 'Driver'
  },
  trip: {
    type: mongoose.Schema.ObjectId,
    ref: 'Trip'
  },
  fuelQuantity: {
    type: Number, // in Liters/Gallons
    required: [true, 'Please add fuel quantity']
  },
  fuelCost: {
    type: Number,
    required: [true, 'Please add total cost']
  },
  fuelStation: {
    type: String
  },
  odometerReading: {
    type: Number,
    required: [true, 'Please add current odometer reading']
  },
  date: {
    type: Date,
    default: Date.now
  },
  receiptUrl: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('FuelLog', fuelLogSchema);
