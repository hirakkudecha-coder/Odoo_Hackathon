import express from 'express';
import multer from 'multer';
import { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver, uploadLicense } from '../controllers/driver.js';
import { driverValidator } from '../validators/driver.js';
import { handleValidationErrors } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.use(authenticate);

router.get('/', authorize('driver:read'), getDrivers);
router.get('/:id', authorize('driver:read'), getDriverById);
router.post('/', authorize('driver:write'), driverValidator, handleValidationErrors, createDriver);
router.patch('/:id', authorize('driver:write'), driverValidator, handleValidationErrors, updateDriver);
router.delete('/:id', authorize('driver:write'), deleteDriver);
router.post('/:id/license', authorize('driver:write'), upload.single('license'), uploadLicense);

export default router;
