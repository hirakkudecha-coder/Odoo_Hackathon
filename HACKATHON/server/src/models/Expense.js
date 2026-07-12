import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Fuel', 'Maintenance', 'Tolls', 'Insurance', 'Miscellaneous'],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  incurredAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null,
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid'],
    default: 'pending',
  },
  description: {
    type: String,
    required: true,
    trim: true,
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

expenseSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
