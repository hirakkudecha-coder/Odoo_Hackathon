import { body } from 'express-validator';

export const driverValidator = [
  body('name').trim().notEmpty().withMessage('Driver name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
  body('category').isIn(['Class A CDL', 'Class B CDL', 'Class C CDL', 'Standard License']).withMessage('Invalid license category'),
  body('expiryDate').isISO8601().withMessage('Expiry date must be a valid ISO date'),
  body('safetyScore').optional().isInt({ min: 0, max: 100 }).withMessage('Safety score must be between 0 and 100'),
  body('contact').trim().notEmpty().withMessage('Contact phone number is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('status').optional().isIn(['available', 'on_trip', 'suspended', 'inactive']).withMessage('Invalid driver status')
];
