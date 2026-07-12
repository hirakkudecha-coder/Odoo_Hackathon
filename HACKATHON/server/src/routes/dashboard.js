import express from 'express';
import { getSummary, getCharts } from '../controllers/dashboard.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/summary', getSummary);
router.get('/charts', getCharts);

export default router;
