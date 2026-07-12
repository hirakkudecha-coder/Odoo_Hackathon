import express from 'express';
import {
  getMaintenanceRecords,
  createMaintenance,
  updateMaintenance
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMaintenanceRecords)
  .post(protect, authorize('Admin', 'Fleet Manager', 'Safety Officer'), createMaintenance);

router.route('/:id')
  .put(protect, authorize('Admin', 'Fleet Manager', 'Safety Officer'), updateMaintenance);

export default router;
