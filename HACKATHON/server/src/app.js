import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Middlewares
import { errorHandler } from './middlewares/error.js';

// Import Routes
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import driverRoutes from './routes/drivers.js';
import tripRoutes from './routes/trips.js';
import maintenanceRoutes from './routes/maintenance.js';
import fuelRoutes from './routes/fuel.js';
import expenseRoutes from './routes/expenses.js';
import dashboardRoutes from './routes/dashboard.js';
import reportRoutes from './routes/reports.js';
import settingsRoutes from './routes/settings.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Security & Utility Middlewares
app.use(helmet());
app.use(cors({
  origin: true, // Allow frontend origin
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Custom lightweight cookie parser
app.use((req, res, next) => {
  const cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      cookies[parts[0].trim()] = decodeURIComponent((parts[1] || '').trim());
    });
  }
  req.cookies = cookies;
  next();
});

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Bind routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/fuel-logs', fuelRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Base route / health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'TransitOps Platform API is online and healthy.', timestamp: new Date() });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use(errorHandler);

export default app;
