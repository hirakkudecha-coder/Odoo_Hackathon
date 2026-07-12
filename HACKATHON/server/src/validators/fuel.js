import { body } from 'express-validator';

export const fuelLogValidator = [
  body('vehicleId').isMongoId().withMessage('Invalid vehicle reference ID'),
  body('tripId').optional({ nullable: true }).isMongoId().withMessage('Invalid trip reference ID'),
  body('liters').isFloat({ min: 0 }).withMessage('Liters must be a positive number'),
  body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('fuelStation').trim().notEmpty().withMessage('Fuel station name is required'),
  body('odometerKm').isFloat({ min: 0 }).withMessage('Odometer reading must be a positive number'),
  body('filledAt').optional().isISO8601().withMessage('Filled at must be a valid ISO date')
];
