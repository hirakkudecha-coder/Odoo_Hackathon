import Driver from '../models/Driver.js';
import AuditLog from '../models/AuditLog.js';

export const getDrivers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '', status } = req.query;

    const query = { isDeleted: { $ne: true } };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const data = await Driver.find(query)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Driver.countDocuments(query);

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

export const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

export const createDriver = async (req, res, next) => {
  try {
    const driver = new Driver({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    const savedDriver = await driver.save();

    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'Driver',
      entityId: savedDriver._id,
      action: 'create',
      after: savedDriver.toObject()
    });

    res.status(201).json({ success: true, data: savedDriver });
  } catch (error) {
    next(error);
  }
};

export const updateDriver = async (req, res, next) => {
  try {
    const beforeDriver = await Driver.findById(req.params.id);
    if (!beforeDriver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'Driver',
      entityId: updatedDriver._id,
      action: 'update',
      before: beforeDriver.toObject(),
      after: updatedDriver.toObject()
    });

    res.json({ success: true, data: updatedDriver });
  } catch (error) {
    next(error);
  }
};

export const deleteDriver = async (req, res, next) => {
  try {
    const beforeDriver = await Driver.findById(req.params.id);
    if (!beforeDriver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      { 
        isDeleted: true, 
        deletedAt: new Date(), 
        status: 'inactive',
        updatedBy: req.user._id 
      },
      { new: true }
    );

    await AuditLog.create({
      actorId: req.user._id,
      entityType: 'Driver',
      entityId: updatedDriver._id,
      action: 'delete',
      before: beforeDriver.toObject(),
      after: updatedDriver.toObject()
    });

    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const uploadLicense = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    driver.licenseDocumentUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/mock_license.pdf';
    driver.updatedBy = req.user._id;
    await driver.save();

    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};
