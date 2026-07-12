import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@transitops.com' });
    
    if (adminExists) {
      console.log('Admin user already exists.');
    } else {
      await User.create({
        name: 'Super Admin',
        email: 'admin@transitops.com',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'Admin'
      });
      console.log('Admin user seeded successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
