import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Expense from '../models/Expense.js';
import FuelLog from '../models/FuelLog.js';
import MaintenanceRequest from '../models/MaintenanceRequest.js';

export const getSummary = async (req, res, next) => {
  try {
    // 1. Vehicle counts
    const activeVehicles = await Vehicle.countDocuments({ status: 'on_trip' });
    const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'maintenance' });
    const totalVehicles = await Vehicle.countDocuments({ status: { $ne: 'retired' } });

    // 2. Trip counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripsToday = await Trip.countDocuments({ createdAt: { $gte: today } });
    const pendingTrips = await Trip.countDocuments({ status: { $in: ['draft', 'scheduled'] } });

    // 3. Financial calculations
    const expensesGrouped = await Expense.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    const expenseMap = {};
    expensesGrouped.forEach(e => {
      expenseMap[e._id] = e.total;
    });

    const fuelCost = expenseMap['Fuel'] || 0;
    const maintenanceCost = expenseMap['Maintenance'] || 0;
    const totalExpenses = expensesGrouped.reduce((acc, curr) => acc + curr.total, 0);

    const tripRevenueAggregation = await Trip.aggregate([
      { $match: { status: { $in: ['dispatched', 'in_progress', 'completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$revenue' } } }
    ]);
    const revenue = tripRevenueAggregation[0]?.totalRevenue || 0;
    const profit = revenue - totalExpenses;

    const fleetUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

    res.json({
      success: true,
      data: {
        vehicles: {
          active: activeVehicles,
          available: availableVehicles,
          maintenance: maintenanceVehicles,
          total: totalVehicles,
          utilization: fleetUtilization
        },
        trips: {
          today: tripsToday,
          pending: pendingTrips
        },
        financials: {
          revenue,
          expenses: totalExpenses,
          profit,
          fuelCost,
          maintenanceCost
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCharts = async (req, res, next) => {
  try {
    // 1. Trip status distribution
    const tripStatusData = await Trip.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 2. Fuel consumption trends (group by month)
    const fuelTrends = await FuelLog.aggregate([
      {
        $group: {
          _id: { $month: '$filledAt' },
          totalLiters: { $sum: '$liters' },
          totalCost: { $sum: '$cost' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Expense category analysis
    const expenseCategories = await Expense.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    // 4. Vehicle Type Utilization
    const vehiclePerformance = await Trip.aggregate([
      { $lookup: { from: 'vehicles', localField: 'vehicleId', foreignField: '_id', as: 'vehicle' } },
      { $unwind: '$vehicle' },
      { $group: { _id: '$vehicle.type', count: { $sum: 1 }, totalRevenue: { $sum: '$revenue' } } }
    ]);

    res.json({
      success: true,
      data: {
        tripStatusDistribution: tripStatusData.map(item => ({ name: item._id, value: item.count })),
        fuelTrends: fuelTrends.map(f => ({ month: f._id, liters: f.totalLiters, cost: f.totalCost })),
        expenseBreakdown: expenseCategories.map(c => ({ category: c._id, amount: c.total })),
        vehiclePerformance: vehiclePerformance.map(vp => ({ type: vp._id, trips: vp.count, revenue: vp.totalRevenue }))
      }
    });
  } catch (error) {
    next(error);
  }
};
