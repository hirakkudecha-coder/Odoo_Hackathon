import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Please select a vehicle']
  },
  type: {
    type: String,
    enum: ['Oil Change', 'Repair', 'Inspection', 'Tire Replacement', 'Other'],
    required: [true, 'Please select maintenance type']
  },
  description: {
    type: String,
    required: [true, 'Please add description']
  },
  serviceCost: {
    type: Number,
    required: [true, 'Please add service cost']
  },
  garageName: {
    type: String,
    required: [true, 'Please add garage name']
  },
  dateStarted: {
    type: Date,
    required: [true, 'Please add start date']
  },
  dateCompleted: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'In Progress'
  },
  invoiceUrl: {
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

export default mongoose.model('Maintenance', maintenanceSchema);
