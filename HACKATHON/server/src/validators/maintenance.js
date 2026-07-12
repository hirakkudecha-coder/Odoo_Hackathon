import { body } from 'express-validator';

export const maintenanceValidator = [
  body('vehicleId').isMongoId().withMessage('Invalid vehicle reference ID'),
  body('type').isIn(['Oil Change', 'Repair', 'Inspection', 'Routine Service', 'Preventive Maintenance']).withMessage('Invalid service type'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('garage').trim().notEmpty().withMessage('Garage name is required'),
  body('scheduledDate').isISO8601().withMessage('Scheduled date must be a valid ISO date'),
  body('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status value')
];
