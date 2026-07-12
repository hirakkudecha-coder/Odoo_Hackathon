import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Class A CDL', 'Class B CDL', 'Class C CDL', 'Standard License'],
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  safetyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  contact: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'on_trip', 'suspended', 'inactive'],
    default: 'available',
  },
  licenseDocumentUrl: {
    type: String,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  }
}, {
  timestamps: true
});

driverSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
