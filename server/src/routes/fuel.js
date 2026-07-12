import express from 'express';
import { getFuelLogs, getFuelLogById, createFuelLog, updateFuelLog, deleteFuelLog } from '../controllers/fuel.js';
import { fuelLogValidator } from '../validators/fuel.js';
import { handleValidationErrors } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('fuel:read'), getFuelLogs);
router.get('/:id', authorize('fuel:read'), getFuelLogById);
router.post('/', authorize('fuel:write'), fuelLogValidator, handleValidationErrors, createFuelLog);
router.patch('/:id', authorize('fuel:write'), fuelLogValidator, handleValidationErrors, updateFuelLog);
router.delete('/:id', authorize('fuel:delete'), deleteFuelLog);

export default router;
