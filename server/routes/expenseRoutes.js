import express from 'express';
import { getExpenses, createExpense } from '../controllers/expenseController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getExpenses)
  .post(protect, authorize('Admin', 'Fleet Manager', 'Financial Analyst'), createExpense);

export default router;
