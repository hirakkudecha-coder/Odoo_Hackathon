import express from 'express';
import { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } from '../controllers/expense.js';
import { expenseValidator } from '../validators/expense.js';
import { handleValidationErrors } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('expense:read'), getExpenses);
router.get('/:id', authorize('expense:read'), getExpenseById);
router.post('/', authorize('expense:write'), expenseValidator, handleValidationErrors, createExpense);
router.patch('/:id', authorize('expense:write'), expenseValidator, handleValidationErrors, updateExpense);
router.delete('/:id', authorize('expense:delete'), deleteExpense);

export default router;
