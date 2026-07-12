import { body } from 'express-validator';

export const tripValidator = [
  body('tripNumber').trim().notEmpty().withMessage('Trip number is required'),
  body('vehicleId').isMongoId().withMessage('Invalid vehicle reference ID'),
  body('driverId').isMongoId().withMessage('Invalid driver reference ID'),
  body('source').trim().notEmpty().withMessage('Source location is required'),
  body('destination').trim().notEmpty().withMessage('Destination location is required'),
  body('distanceKm').isFloat({ min: 0 }).withMessage('Distance must be a positive number'),
  body('cargoWeightKg').isFloat({ min: 0 }).withMessage('Cargo weight must be a positive number'),
  body('revenue').isFloat({ min: 0 }).withMessage('Revenue must be a positive number'),
  body('status').optional().isIn(['draft', 'scheduled', 'dispatched', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid trip status')
];
