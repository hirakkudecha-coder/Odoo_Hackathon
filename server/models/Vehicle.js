import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Please add a registration number'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Please add vehicle name/model']
  },
  type: {
    type: String,
    enum: ['Truck', 'Van', 'Trailer', 'Car', 'Motorcycle'],
    required: [true, 'Please select a vehicle type']
  },
  maxCapacity: {
    type: Number,
    required: [true, 'Please add maximum capacity (kg)']
  },
  currentOdometer: {
    type: Number,
    required: [true, 'Please add current odometer reading']
  },
  acquisitionCost: {
    type: Number,
    required: [true, 'Please add acquisition cost']
  },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'Maintenance', 'Retired'],
    default: 'Available'
  },
  documents: [{
    title: String,
    url: String,
    expiryDate: Date
  }],
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

export default mongoose.model('Vehicle', vehicleSchema);
