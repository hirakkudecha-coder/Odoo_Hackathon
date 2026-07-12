import { body } from 'express-validator';

export const vehicleValidator = [
  body('registrationNumber')
    .trim()
    .notEmpty().withMessage('Registration number is required')
    .matches(/^[A-Z0-9-]+$/i).withMessage('Registration number must contain alphanumeric characters and dashes only'),
  body('name').trim().notEmpty().withMessage('Vehicle name is required'),
  body('type').isIn(['Box Truck', 'Flatbed', 'Reefer', 'Semi-Trailer', 'Cargo Van', 'Sprinter Van']).withMessage('Invalid vehicle type'),
  body('capacityKg').isFloat({ min: 0 }).withMessage('Capacity must be a positive number'),
  body('odometerKm').isFloat({ min: 0 }).withMessage('Odometer reading must be a positive number'),
  body('acquisitionCost').isFloat({ min: 0 }).withMessage('Acquisition cost must be a positive number'),
  body('status').optional().isIn(['available', 'on_trip', 'maintenance', 'retired']).withMessage('Invalid vehicle status')
];
