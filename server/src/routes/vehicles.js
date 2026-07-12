import express from 'express';
import multer from 'multer';
import { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle, uploadDocument } from '../controllers/vehicle.js';
import { vehicleValidator } from '../validators/vehicle.js';
import { handleValidationErrors } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(authenticate);

router.get('/', authorize('vehicle:read'), getVehicles);
router.get('/:id', authorize('vehicle:read'), getVehicleById);
router.post('/', authorize('vehicle:write'), vehicleValidator, handleValidationErrors, createVehicle);
router.patch('/:id', authorize('vehicle:write'), vehicleValidator, handleValidationErrors, updateVehicle);
router.delete('/:id', authorize('vehicle:delete'), deleteVehicle);
router.post('/:id/documents', authorize('vehicle:write'), upload.single('document'), uploadDocument);

export default router;
