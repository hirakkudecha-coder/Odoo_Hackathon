import express from 'express';
import { getTrips, getTripById, createTrip, updateTrip, dispatchTrip, completeTrip, cancelTrip } from '../controllers/trip.js';
import { tripValidator } from '../validators/trip.js';
import { handleValidationErrors } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('trip:read'), getTrips);
router.get('/:id', authorize('trip:read'), getTripById);
router.post('/', authorize('trip:write'), tripValidator, handleValidationErrors, createTrip);
router.patch('/:id', authorize('trip:write'), tripValidator, handleValidationErrors, updateTrip);
router.post('/:id/dispatch', authorize('trip:dispatch'), dispatchTrip);
router.post('/:id/complete', authorize('trip:complete'), completeTrip);
router.post('/:id/cancel', authorize('trip:cancel'), cancelTrip);

export default router;
