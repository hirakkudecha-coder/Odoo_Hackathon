import express from 'express';
import { getMaintenance, getMaintenanceById, createMaintenance, updateMaintenance, closeMaintenance } from '../controllers/maintenance.js';
import { maintenanceValidator } from '../validators/maintenance.js';
import { handleValidationErrors } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('maintenance:read'), getMaintenance);
router.get('/:id', authorize('maintenance:read'), getMaintenanceById);
router.post('/', authorize('maintenance:write'), maintenanceValidator, handleValidationErrors, createMaintenance);
router.patch('/:id', authorize('maintenance:write'), maintenanceValidator, handleValidationErrors, updateMaintenance);
router.post('/:id/close', authorize('maintenance:write'), closeMaintenance);

export default router;
