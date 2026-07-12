import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { startCronJobs } from './cron/emailReminders.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[TransitOps] API Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    startCronJobs();
  });
}).catch(err => {
  console.error('Failed to initialize application due to DB connection error:', err);
  process.exit(1);
});
