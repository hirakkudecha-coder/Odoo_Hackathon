import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Access mapping by role
const ROLE_PERMISSIONS = {
  'Admin': ['*'],
  'Fleet Manager': [
    'vehicle:read', 'vehicle:write', 'vehicle:delete',
    'maintenance:read', 'maintenance:write', 'maintenance:delete',
    'fuel:read', 'fuel:write', 'fuel:delete',
    'trip:read',
    'dashboard:fleet', 'settings:read', 'settings:write'
  ],
  'Dispatcher': [
    'vehicle:read', 'driver:read',
    'trip:read', 'trip:write', 'trip:dispatch', 'trip:cancel', 'trip:complete',
    'dashboard:fleet', 'settings:read', 'settings:write'
  ],
  'Driver': [
    'trip:read', 'trip:own',
    'vehicle:read',
    'settings:read', 'settings:write'
  ],
  'Safety Officer': [
    'driver:read', 'driver:write', 'driver:safety',
    'trip:read',
    'settings:read', 'settings:write'
  ],
  'Financial Analyst': [
    'expense:read', 'expense:write', 'expense:delete',
    'fuel:read', 'fuel:write', 'fuel:delete',
    'trip:read',
    'report:read', 'report:export',
    'dashboard:finance', 'settings:read', 'settings:write'
  ]
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token missing or invalid format' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user || user.status === 'inactive') {
      return res.status(401).json({ success: false, message: 'User account is inactive or not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Access token has expired' });
    }
    return res.status(401).json({ success: false, message: 'Authentication failed: Invalid token' });
  }
};

export const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userRole = req.user.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];

    // Admins have wildcard access
    if (permissions.includes('*')) {
      return next();
    }

    if (permissions.includes(requiredPermission)) {
      return next();
    }

    return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
  };
};
