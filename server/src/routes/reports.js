import express from 'express';
import { getReportData, exportReport, getAnalytics } from '../controllers/report.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/analytics/roi', authorize('report:read'), getAnalytics);
router.get('/:type', authorize('report:read'), getReportData);
router.get('/:type/export', authorize('report:export'), exportReport);

export default router;
