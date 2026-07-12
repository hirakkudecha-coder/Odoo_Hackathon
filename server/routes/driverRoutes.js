import express from 'express';
import {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver
} from '../controllers/driverController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getDrivers)
  .post(protect, authorize('Admin', 'Fleet Manager', 'Safety Officer'), createDriver);

router.route('/:id')
  .get(protect, getDriver)
  .put(protect, authorize('Admin', 'Fleet Manager', 'Safety Officer'), updateDriver)
  .delete(protect, authorize('Admin', 'Fleet Manager'), deleteDriver);

export default router;
