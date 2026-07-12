import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import MaintenanceRequest from '../models/MaintenanceRequest.js';
import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

const users = [
  { name: 'Amit Sharma', email: 'amit@transitops.com', password: 'password123', role: 'Admin' },
  { name: 'Sneha Patel', email: 'sneha@transitops.com', password: 'password123', role: 'Fleet Manager' },
  { name: 'Vikram Singh', email: 'vikram@transitops.com', password: 'password123', role: 'Dispatcher' },
  { name: 'Rahul Kumar', email: 'rahul@transitops.com', password: 'password123', role: 'Driver' },
  { name: 'Priya Nair', email: 'priya@transitops.com', password: 'password123', role: 'Safety Officer' },
  { name: 'Rohan Deshmukh', email: 'rohan@transitops.com', password: 'password123', role: 'Financial Analyst' }
];

const vehicles = [
  { registrationNumber: 'MH-12-PQ-5678', name: 'Tata Prima 4930.S', type: 'Box Truck', capacityKg: 12000, odometerKm: 145200, acquisitionCost: 85000, status: 'available', region: 'North' },
  { registrationNumber: 'DL-01-AB-1234', name: 'Ashok Leyland 3718', type: 'Semi-Trailer', capacityKg: 24000, odometerKm: 320400, acquisitionCost: 140000, status: 'on_trip', region: 'South' },
  { registrationNumber: 'KA-03-MM-9012', name: 'BharatBenz 3528C', type: 'Reefer', capacityKg: 20000, odometerKm: 98150, acquisitionCost: 155000, status: 'In Shop', region: 'East' },
  { registrationNumber: 'HR-55-XY-3456', name: 'Mahindra Blazo X 35', type: 'Cargo Van', capacityKg: 3500, odometerKm: 54100, acquisitionCost: 45000, status: 'available', region: 'West' },
  { registrationNumber: 'MH-43-ZZ-7890', name: 'Tata LPT 1613', type: 'Semi-Trailer', capacityKg: 25000, odometerKm: 421000, acquisitionCost: 165000, status: 'retired', region: 'North' }
];

const drivers = [
  { name: 'Rahul Kumar', email: 'rahul@transitops.com', licenseNumber: 'DL-1420180098765', category: 'Class A CDL', expiryDate: new Date('2028-10-15'), safetyScore: 98, contact: '+91-98765-01990', address: 'Sector 15, Noida, Uttar Pradesh', status: 'on_trip' },
  { name: 'Rajesh Yadav', email: 'rajesh@transitops.com', licenseNumber: 'MH-1220150034567', category: 'Class B CDL', expiryDate: new Date('2027-04-20'), safetyScore: 85, contact: '+91-98765-01440', address: 'Andheri East, Mumbai, Maharashtra', status: 'available' },
  { name: 'Jaspreet Singh', email: 'jaspreet@transitops.com', licenseNumber: 'PB-6520190012345', category: 'Class A CDL', expiryDate: new Date('2029-01-12'), safetyScore: 92, contact: '+91-98765-01770', address: 'Indiranagar, Bangalore, Karnataka', status: 'available' },
  { name: 'Sanjay Dutt', email: 'sanjay@transitops.com', licenseNumber: 'MH-0120100077777', category: 'Standard License', expiryDate: new Date('2025-12-31'), safetyScore: 45, contact: '+91-98765-01880', address: 'Salt Lake, Kolkata, West Bengal', status: 'suspended' },
  { name: 'Kiran Bedi', email: 'kiran@transitops.com', licenseNumber: 'DL-0420050011111', category: 'Class B CDL', expiryDate: new Date('2026-02-14'), safetyScore: 100, contact: '+91-98765-01110', address: 'Anna Nagar, Chennai, Tamil Nadu', status: 'available' }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Driver.deleteMany({});
    await Trip.deleteMany({});
    await MaintenanceRequest.deleteMany({});
    await FuelLog.deleteMany({});
    await Expense.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Cleared existing data.');

    // Seed Users
    const seededUsers = [];
    for (const u of users) {
      const userObj = new User(u);
      const savedUser = await userObj.save();
      seededUsers.push(savedUser);
    }
    console.log(`Seeded ${seededUsers.length} users.`);

    const adminUser = seededUsers.find(u => u.role === 'Admin');

    // Seed Vehicles
    const seededVehicles = [];
    for (const v of vehicles) {
      v.createdBy = adminUser._id;
      v.updatedBy = adminUser._id;
      const vehicleObj = new Vehicle(v);
      const saved = await vehicleObj.save();
      seededVehicles.push(saved);
    }
    console.log(`Seeded ${seededVehicles.length} vehicles.`);

    // Seed Drivers
    const seededDrivers = [];
    const driverUser = seededUsers.find(u => u.role === 'Driver');
    for (const d of drivers) {
      d.createdBy = adminUser._id;
      d.updatedBy = adminUser._id;
      if (d.email === 'rahul@transitops.com' && driverUser) {
        d.userId = driverUser._id;
      }
      const driverObj = new Driver(d);
      const saved = await driverObj.save();
      seededDrivers.push(saved);
    }
    console.log(`Seeded ${seededDrivers.length} drivers.`);

    // Seed Trips
    const vehicleOnTrip = seededVehicles.find(v => v.status === 'on_trip');
    const driverOnTrip = seededDrivers.find(d => d.status === 'on_trip');

    const tripData = [
      {
        tripNumber: 'TRIP-2026-001',
        vehicleId: vehicleOnTrip._id,
        driverId: driverOnTrip._id,
        source: 'Nhava Sheva Port, Mumbai',
        destination: 'Sanjay Gandhi Transport Nagar, Delhi',
        distanceKm: 1420,
        cargoWeightKg: 18500,
        status: 'dispatched',
        revenue: 4500,
        createdBy: adminUser._id,
        updatedBy: adminUser._id,
        timeline: [
          { status: 'draft', notes: 'Trip route planned and drafted', updatedBy: adminUser._id },
          { status: 'scheduled', notes: 'Vehicle and driver allocated', updatedBy: adminUser._id },
          { status: 'dispatched', notes: 'Trip dispatched, driver en route to pick up cargo', updatedBy: adminUser._id }
        ]
      },
      {
        tripNumber: 'TRIP-2026-002',
        vehicleId: seededVehicles.find(v => v.status === 'available')._id,
        driverId: seededDrivers.find(d => d.status === 'available')._id,
        source: 'Chennai Port, Chennai',
        destination: 'Whitefield Warehouse, Bangalore',
        distanceKm: 350,
        cargoWeightKg: 8500,
        status: 'completed',
        revenue: 3200,
        createdBy: adminUser._id,
        updatedBy: adminUser._id,
        actualDurationHours: 14.5,
        timeline: [
          { status: 'draft', notes: 'Trip drafted', updatedBy: adminUser._id },
          { status: 'dispatched', notes: 'Trip dispatched', updatedBy: adminUser._id },
          { status: 'in_progress', notes: 'Cargo loaded, driver on route', updatedBy: adminUser._id },
          { status: 'completed', notes: 'Cargo delivered, clean manifest sign-off', updatedBy: adminUser._id }
        ]
      }
    ];

    const seededTrips = [];
    for (const t of tripData) {
      const tripObj = new Trip(t);
      const saved = await tripObj.save();
      seededTrips.push(saved);
    }
    console.log(`Seeded ${seededTrips.length} trips.`);

    // Seed Maintenance Request
    const maintenanceVehicle = seededVehicles.find(v => v.status === 'In Shop');
    const maintenanceReq = new MaintenanceRequest({
      vehicleId: maintenanceVehicle._id,
      type: 'Repair',
      status: 'in_progress',
      description: 'Replace front brake rotors and pads, fluid flush',
      cost: 1450,
      garage: 'TVS Cargo Garage & Services',
      scheduledDate: new Date('2026-07-10'),
      createdBy: adminUser._id,
      updatedBy: adminUser._id
    });
    await maintenanceReq.save();
    console.log('Seeded maintenance request.');

    // Seed Fuel Logs
    const fuelLog = new FuelLog({
      vehicleId: vehicleOnTrip._id,
      tripId: seededTrips[0]._id,
      liters: 320,
      cost: 512,
      fuelStation: 'IndianOil Refuel Depot #108',
      odometerKm: 145320,
      filledAt: new Date(),
      createdBy: adminUser._id,
      updatedBy: adminUser._id
    });
    await fuelLog.save();
    console.log('Seeded fuel log.');

    // Seed Expenses
    const expenses = [
      { category: 'Fuel', amount: 512, incurredAt: new Date(), vehicleId: vehicleOnTrip._id, tripId: seededTrips[0]._id, status: 'approved', description: 'Fuel Refill at IndianOil Depot', createdBy: adminUser._id, updatedBy: adminUser._id },
      { category: 'Maintenance', amount: 1450, incurredAt: new Date('2026-07-10'), vehicleId: maintenanceVehicle._id, status: 'pending', description: 'Brake service and rotors replacement', createdBy: adminUser._id, updatedBy: adminUser._id },
      { category: 'Tolls', amount: 120, incurredAt: new Date(), vehicleId: vehicleOnTrip._id, tripId: seededTrips[0]._id, status: 'paid', description: 'NH-48 National Toll Expressway', createdBy: adminUser._id, updatedBy: adminUser._id },
      { category: 'Insurance', amount: 2400, incurredAt: new Date('2026-07-01'), status: 'paid', description: 'Monthly Fleet Auto Liability', createdBy: adminUser._id, updatedBy: adminUser._id }
    ];

    for (const exp of expenses) {
      const expObj = new Expense(exp);
      await expObj.save();
    }
    console.log('Seeded expenses.');

    console.log('Seeding complete! Closing connection...');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
