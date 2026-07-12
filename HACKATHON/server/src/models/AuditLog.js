import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  entityType: {
    type: String,
    required: true,
    enum: ['User', 'Vehicle', 'Driver', 'Trip', 'MaintenanceRequest', 'FuelLog', 'Expense'],
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  before: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  after: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
