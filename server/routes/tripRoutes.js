import express from 'express';
import {
  getTrips,
  getTrip,
  createTrip,
  completeTrip
} from '../controllers/tripController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTrips)
  .post(protect, authorize('Admin', 'Fleet Manager', 'Dispatcher'), createTrip);

router.route('/:id')
  .get(protect, getTrip);

router.route('/:id/complete')
  .put(protect, authorize('Admin', 'Fleet Manager', 'Dispatcher'), completeTrip);

export default router;
