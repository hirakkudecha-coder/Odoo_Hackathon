import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false // A driver might just be an employee without login access initially
  },
  firstName: {
    type: String,
    required: [true, 'Please add first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please add last name']
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please add license number'],
    unique: true
  },
  licenseCategory: {
    type: String,
    required: [true, 'Please add license category']
  },
  licenseExpiry: {
    type: Date,
    required: [true, 'Please add license expiry date']
  },
  safetyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  contact: {
    type: String,
    required: [true, 'Please add contact number']
  },
  address: {
    type: String
  },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'Suspended', 'Inactive'],
    default: 'Available'
  },
  licenseDocumentUrl: {
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

export default mongoose.model('Driver', driverSchema);
