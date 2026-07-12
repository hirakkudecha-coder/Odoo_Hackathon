import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Fuel', 'Maintenance', 'Tolls', 'Insurance', 'Miscellaneous'],
    required: [true, 'Please select expense type']
  },
  amount: {
    type: Number,
    required: [true, 'Please add expense amount']
  },
  description: {
    type: String,
    required: [true, 'Please add description']
  },
  date: {
    type: Date,
    default: Date.now
  },
  vehicle: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle'
  },
  trip: {
    type: mongoose.Schema.ObjectId,
    ref: 'Trip'
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

export default mongoose.model('Expense', expenseSchema);
