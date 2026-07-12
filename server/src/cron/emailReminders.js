import cron from 'node-cron';
import Driver from '../models/Driver.js';

// Setup node-cron job to run every day at 8:00 AM
export const startCronJobs = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Running daily driver license expiration check...');
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // Find drivers whose license expires before 30 days from now, and hasn't already expired
      const expiringDrivers = await Driver.find({
        isDeleted: { $ne: true },
        status: { $ne: 'inactive' },
        expiryDate: {
          $gt: new Date(),
          $lte: thirtyDaysFromNow
        }
      });

      if (expiringDrivers.length === 0) {
        console.log('[Cron] No drivers with licenses expiring within 30 days.');
        return;
      }

      console.log(`[Cron] Found ${expiringDrivers.length} drivers with licenses expiring soon.`);
      
      // Mock email sending
      for (const driver of expiringDrivers) {
        console.log(`[Email Service Mock] Sending alert to ${driver.email}...`);
        console.log(`   Subject: URGENT: Driver License Expiring Soon`);
        console.log(`   Body: Dear ${driver.name}, your driver license (${driver.licenseNumber}) will expire on ${driver.expiryDate.toLocaleDateString()}. Please renew immediately to avoid suspension.`);
      }

    } catch (error) {
      console.error('[Cron] Error running license expiration check:', error.message);
    }
  });
  
  console.log('[TransitOps] Cron jobs initialized. License reminder scheduled daily at 08:00 AM.');
};
