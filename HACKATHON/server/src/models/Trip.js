import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  notes: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

const tripSchema = new mongoose.Schema({
  tripNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
  },
  source: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  distanceKm: {
    type: Number,
    required: true,
    min: 0,
  },
  cargoWeightKg: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'dispatched', 'in_progress', 'completed', 'cancelled'],
    default: 'draft',
  },
  timeline: [timelineEventSchema],
  actualDurationHours: {
    type: Number,
    default: null,
  },
  revenue: {
    type: Number,
    required: true,
    min: 0,
  },
  notes: String,
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

tripSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
