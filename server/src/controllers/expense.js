import Expense from '../models/Expense.js';
import AuditLog from '../models/AuditLog.js';

export const getExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'incurredAt', order = 'desc', category } = req.query;

    const query = { isDeleted: { $ne: true } };

    if (category) {
      query.category = category;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const data = await Expense.find(query)
      .populate('vehicleId')
      .populate('tripId')
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(query);

    res.json({
      success: true,
      data,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('vehicleId').populate('tripId');
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const expense = new Expense({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    const saved = await expense.save();

    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'Expense',
      entityId: saved._id,
      action: 'create',
      after: saved.toObject()
    });

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const beforeExpense = await Expense.findById(req.params.id);
    if (!beforeExpense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'Expense',
      entityId: updated._id,
      action: 'update',
      before: beforeExpense.toObject(),
      after: updated.toObject()
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const beforeExpense = await Expense.findById(req.params.id);
    if (!beforeExpense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await Expense.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });

    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'Expense',
      entityId: beforeExpense._id,
      action: 'delete',
      before: beforeExpense.toObject(),
      after: { ...beforeExpense.toObject(), isDeleted: true }
    });

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};
