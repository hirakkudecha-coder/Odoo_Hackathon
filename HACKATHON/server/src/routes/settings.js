import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/settings.js';
import { profileUpdateValidator, passwordChangeValidator } from '../validators/auth.js';
import { handleValidationErrors } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.patch('/profile', profileUpdateValidator, handleValidationErrors, updateProfile);
router.patch('/password', passwordChangeValidator, handleValidationErrors, changePassword);

export default router;
