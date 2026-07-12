import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Box Truck', 'Flatbed', 'Reefer', 'Semi-Trailer', 'Cargo Van', 'Sprinter Van'],
  },
  capacityKg: {
    type: Number,
    required: true,
    min: 0,
  },
  odometerKm: {
    type: Number,
    required: true,
    min: 0,
  },
  acquisitionCost: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['available', 'on_trip', 'In Shop', 'retired'],
    default: 'available',
  },
  region: {
    type: String,
    enum: ['North', 'South', 'East', 'West'],
    default: 'North',
  },
  documents: [
    {
      name: String,
      url: String,
      expiryDate: Date,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
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

vehicleSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
