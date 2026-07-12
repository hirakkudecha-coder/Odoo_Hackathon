import express from 'express';
import { login, refresh, logout, forgotPassword, resetPassword, getMe, registerUser } from '../controllers/auth.js';
import { loginValidator, forgotPasswordValidator, resetPasswordValidator } from '../validators/auth.js';
import { handleValidationErrors } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', loginValidator, handleValidationErrors, login);
router.post('/register', registerUser);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPasswordValidator, handleValidationErrors, forgotPassword);
router.post('/reset-password', resetPasswordValidator, handleValidationErrors, resetPassword);
router.get('/me', authenticate, getMe);

export default router;
