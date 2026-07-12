import express from 'express';
import { getFuelLogs, createFuelLog } from '../controllers/fuelController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getFuelLogs)
  .post(protect, authorize('Admin', 'Fleet Manager', 'Driver'), createFuelLog);

export default router;
