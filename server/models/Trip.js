import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  tripNumber: {
    type: String,
    unique: true,
    required: true
  },
  vehicle: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Please assign a vehicle']
  },
  driver: {
    type: mongoose.Schema.ObjectId,
    ref: 'Driver',
    required: [true, 'Please assign a driver']
  },
  source: {
    type: String,
    required: [true, 'Please add source location']
  },
  destination: {
    type: String,
    required: [true, 'Please add destination']
  },
  distance: {
    type: Number,
    required: [true, 'Please add estimated distance']
  },
  cargoWeight: {
    type: Number,
    required: [true, 'Please add cargo weight']
  },
  status: {
    type: String,
    enum: ['Pending', 'Dispatched', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  dispatchTime: {
    type: Date
  },
  completionTime: {
    type: Date
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
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

// Generate trip number before saving if new
tripSchema.pre('validate', function(next) {
  if (this.isNew && !this.tripNumber) {
    this.tripNumber = 'TRP-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  }
  next();
});

export default mongoose.model('Trip', tripSchema);
