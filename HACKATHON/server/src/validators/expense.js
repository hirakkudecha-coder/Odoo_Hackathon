import { body } from 'express-validator';

export const expenseValidator = [
  body('category').isIn(['Fuel', 'Maintenance', 'Tolls', 'Insurance', 'Miscellaneous']).withMessage('Invalid expense category'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('incurredAt').optional().isISO8601().withMessage('Incurred date must be a valid ISO date'),
  body('vehicleId').optional({ nullable: true }).isMongoId().withMessage('Invalid vehicle reference ID'),
  body('tripId').optional({ nullable: true }).isMongoId().withMessage('Invalid trip reference ID'),
  body('status').optional().isIn(['pending', 'approved', 'paid']).withMessage('Invalid status value'),
  body('description').trim().notEmpty().withMessage('Description is required')
];
