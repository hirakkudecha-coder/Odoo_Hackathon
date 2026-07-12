import express from 'express';
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getVehicles)
  .post(protect, authorize('Admin', 'Fleet Manager'), createVehicle);

router.route('/:id')
  .get(protect, getVehicle)
  .put(protect, authorize('Admin', 'Fleet Manager'), updateVehicle)
  .delete(protect, authorize('Admin', 'Fleet Manager'), deleteVehicle);

export default router;
