import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, MapPin, Wrench, Fuel, 
  TrendingUp, Landmark, ArrowRight, ShieldAlert,
  Calendar, RefreshCw
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, 
  PointElement, LineElement, BarElement, ArcElement, 
  Title, Tooltip, Legend 
} from 'chart.js';
import apiClient from '../api/apiClient.js';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTrips, setRecentTrips] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, chartRes, tripRes] = await Promise.all([
        apiClient.get('/dashboard/summary'),
        apiClient.get('/dashboard/charts'),
        apiClient.get('/trips?limit=5').catch(err => {
          console.warn('Trips fetch skipped or not permitted:', err.message);
          return { data: { data: [] } };
        })
      ]);
      setSummary(sumRes.data.data);
      setChartsData(chartRes.data.data);
      setRecentTrips(tripRes.data.data);
    } catch (error) {
      toast.error('Failed to reload dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !summary) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Assembling TransitOps Executive Analytics...</span>
      </div>
    );
  }

  // Chart configs
  const expenseBreakdown = chartsData?.expenseBreakdown || [];
  const doughnutData = {
    labels: expenseBreakdown.map(e => e.category),
    datasets: [{
      data: expenseBreakdown.map(e => e.amount),
      backgroundColor: ['#2563EB', '#0EA5E9', '#22C55E', '#F59E0B', '#EF4444'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Monthly Volume (Trips Completed)',
      data: [35, 42, 58, 64, 75, 90, 105],
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.05)',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Operations Control</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time status reporting, fleet metrics, and expense reconciliation.</p>
        </div>
        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <RefreshCw size={14} /> Reload Feed
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Vehicles summary */}
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Fleet Status</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{summary.vehicles.total}</span>
              <span className="text-xs text-slate-400 font-medium">Vehicles</span>
            </div>
            <div className="flex gap-2 text-[10px] font-semibold text-slate-500">
              <span className="text-success">{summary.vehicles.available} Available</span>
              <span>•</span>
              <span className="text-primary">{summary.vehicles.active} On Trip</span>
            </div>
          </div>
          <div className="p-3 bg-primary-light text-primary dark:bg-primary-dark/30 dark:text-primary-light rounded-xl">
            <Truck size={24} />
          </div>
        </motion.div>

        {/* Fleet Utilization */}
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Fleet Utilization</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{summary.vehicles.utilization}%</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" 
                style={{ width: `${summary.vehicles.utilization}%` }}
              />
            </div>
          </div>
          <div className="p-3 bg-secondary-light text-secondary dark:bg-secondary/20 rounded-xl">
            <TrendingUp size={24} />
          </div>
        </motion.div>

        {/* Trips Summary */}
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Trips Dispatched</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{summary.trips.today}</span>
              <span className="text-xs text-slate-400 font-medium">Today</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">{summary.trips.pending} awaiting allocation</p>
          </div>
          <div className="p-3 bg-success-light text-success dark:bg-success/20 rounded-xl">
            <MapPin size={24} />
          </div>
        </motion.div>

        {/* Financial Profit */}
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Net Profit</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-success">${summary.financials.profit.toLocaleString()}</span>
            </div>
            <div className="flex gap-2 text-[10px] font-semibold text-slate-500">
              <span>Rev: ${summary.financials.revenue.toLocaleString()}</span>
            </div>
          </div>
          <div className="p-3 bg-warning-light text-warning dark:bg-warning/20 rounded-xl">
            <Landmark size={24} />
          </div>
        </motion.div>
      </div>

      {/* Main Charts & Expenses Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main chart */}
        <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base">Transport Dispatch Trends</h3>
              <p className="text-xs text-slate-500">Completed volume history</p>
            </div>
          </div>
          <div className="h-64">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </motion.div>

        {/* Right doughnut chart */}
        <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base">Expense Allocation</h3>
              <p className="text-xs text-slate-500">Cost distribution categories</p>
            </div>
          </div>
          <div className="h-60 flex items-center justify-center">
            {expenseBreakdown.length > 0 ? (
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <div className="text-xs text-slate-400 font-medium">No expenses logged.</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Trips & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table */}
        <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base">Active Logged Trips</h3>
              <p className="text-xs text-slate-500">Live operational dispatch monitor</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
                  <th className="py-2.5">Trip Number</th>
                  <th className="py-2.5">Route</th>
                  <th className="py-2.5">Cargo</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTrips.length > 0 ? (
                  recentTrips.map(trip => (
                    <tr key={trip._id} className="text-xs font-medium">
                      <td className="py-3 font-semibold text-primary">{trip.tripNumber}</td>
                      <td className="py-3">{trip.source} → {trip.destination}</td>
                      <td className="py-3">{trip.cargoWeightKg.toLocaleString()} kg</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          trip.status === 'completed' ? 'bg-success-light text-success' :
                          trip.status === 'dispatched' ? 'bg-primary-light text-primary' :
                          'bg-warning-light text-warning'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-slate-400">No active trips dispatched.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-base">Operational Shortcuts</h3>
          <div className="space-y-3">
            <a href="/trips" className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-primary-light/40 dark:hover:bg-primary-dark/20 border border-slate-200/50 dark:border-slate-800/50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-light text-primary dark:bg-primary/20"><MapPin size={16} /></div>
                <div className="text-left"><p className="text-xs font-bold">Dispatch New Cargo</p><p className="text-[10px] text-slate-400 font-medium">Allocate route, driver & vehicle</p></div>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-primary transition-transform group-hover:translate-x-1" />
            </a>

            <a href="/maintenance" className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-warning-light/40 dark:hover:bg-warning-dark/20 border border-slate-200/50 dark:border-slate-800/50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-warning-light text-warning dark:bg-warning/20"><Wrench size={16} /></div>
                <div className="text-left"><p className="text-xs font-bold">Schedule Repair</p><p className="text-[10px] text-slate-400 font-medium">Place vehicles in maintenance status</p></div>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-warning transition-transform group-hover:translate-x-1" />
            </a>

            <a href="/fuel" className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-success-light/40 dark:hover:bg-success-dark/20 border border-slate-200/50 dark:border-slate-800/50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-success-light text-success dark:bg-success/20"><Fuel size={16} /></div>
                <div className="text-left"><p className="text-xs font-bold">Log Fuel Station Refill</p><p className="text-[10px] text-slate-400 font-medium">Record liters & odometer readings</p></div>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-success transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
