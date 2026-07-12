import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
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
  const user = useSelector((state) => state.auth.user);
  const [summary, setSummary] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTrips, setRecentTrips] = useState([]);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, chartRes, tripRes] = await Promise.all([
        apiClient.get('/dashboard/summary', { params: { vehicleType: vehicleTypeFilter, vehicleStatus: vehicleStatusFilter } }),
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
  }, [vehicleTypeFilter, vehicleStatusFilter]);

  if (loading || !summary) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Assembling TransitOps Executive Analytics...</span>
      </div>
    );
  }

  // Reusable card styles
  const cardStyle = "bg-brandcard-dark border border-zinc-800 rounded-3xl p-6 shadow-glass";
  const headerStyle = "font-bold text-base text-white";
  const subtextStyle = "text-xs text-zinc-400";
  const tableHeaderStyle = "border-b border-zinc-800 text-xs font-semibold text-zinc-500";
  const tableRowStyle = "text-xs font-medium border-b border-zinc-800/50 last:border-0 text-white";

  // Role checks
  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Fleet Manager';
  const isDispatcher = user?.role === 'Dispatcher';
  const isFinance = user?.role === 'Financial Analyst';

  const showOperations = isAdmin || isManager || isDispatcher;
  const showFinance = isAdmin || isFinance;
  const showFleet = isAdmin || isManager;

  // Chart configs
  const expenseBreakdown = chartsData?.expenseBreakdown || [];
  const doughnutData = {
    labels: expenseBreakdown.map(e => e.category),
    datasets: [{
      data: expenseBreakdown.map(e => e.amount),
      backgroundColor: ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Monthly Volume (Trips Completed)',
      data: [35, 42, 58, 64, 75, 90, 105],
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">System Operations Control</h1>
          <p className="text-sm text-zinc-400 mt-1">Real-time status reporting and metrics for {user?.role}.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={vehicleTypeFilter} 
            onChange={(e) => setVehicleTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-brandcard-dark border border-zinc-700 text-white rounded-xl focus:outline-none focus:border-primary"
          >
            <option value="">All Vehicle Types</option>
            <option value="Box Truck">Box Truck</option>
            <option value="Flatbed">Flatbed</option>
            <option value="Reefer">Reefer</option>
            <option value="Semi-Trailer">Semi-Trailer</option>
            <option value="Cargo Van">Cargo Van</option>
            <option value="Sprinter Van">Sprinter Van</option>
          </select>
          <select 
            value={vehicleStatusFilter} 
            onChange={(e) => setVehicleStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-brandcard-dark border border-zinc-700 text-white rounded-xl focus:outline-none focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="maintenance">In Shop</option>
          </select>
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-zinc-700 text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw size={14} /> Reload
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Vehicles summary (Fleet/Admin) */}
        {showFleet && (
          <motion.div variants={itemVariants} className={`${cardStyle} flex items-center justify-between`}>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Fleet Status</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{summary.vehicles.total}</span>
                <span className="text-xs text-zinc-400 font-medium">Vehicles</span>
              </div>
              <div className="flex gap-2 text-[10px] font-semibold text-zinc-500">
                <span className="text-emerald-500">{summary.vehicles.available} Available</span>
                <span>•</span>
                <span className="text-primary">{summary.vehicles.active} On Trip</span>
              </div>
            </div>
            <div className="p-3 bg-primary/20 text-primary border border-primary/30 rounded-xl">
              <Truck size={24} />
            </div>
          </motion.div>
        )}

        {/* Vehicles in Shop (Fleet/Admin) */}
        {showFleet && (
          <motion.div variants={itemVariants} className={`${cardStyle} flex items-center justify-between`}>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Vehicles In Shop</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{summary.vehicles.maintenance}</span>
                <span className="text-xs text-zinc-400 font-medium">Under Maintenance</span>
              </div>
              <div className="text-[10px] font-semibold text-zinc-500">
                Unavailable for dispatch
              </div>
            </div>
            <div className="p-3 bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl">
              <Wrench size={24} />
            </div>
          </motion.div>
        )}

        {/* Drivers On Duty (Operations/Admin) */}
        {showOperations && (
          <motion.div variants={itemVariants} className={`${cardStyle} flex items-center justify-between`}>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Drivers On Duty</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{summary.drivers?.onDuty || 0}</span>
                <span className="text-xs text-zinc-400 font-medium">Active Drivers</span>
              </div>
              <div className="text-[10px] font-semibold text-zinc-500">
                Currently on route
              </div>
            </div>
            <div className="p-3 bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded-xl">
              <MapPin size={24} />
            </div>
          </motion.div>
        )}

        {/* Fleet Utilization (Fleet/Admin) */}
        {showFleet && (
          <motion.div variants={itemVariants} className={`${cardStyle} flex items-center justify-between`}>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Fleet Utilization</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{summary.vehicles.utilization}%</span>
              </div>
              <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${summary.vehicles.utilization}%` }}
                />
              </div>
            </div>
            <div className="p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </motion.div>
        )}

        {/* Trips Summary (Ops/Admin) */}
        {showOperations && (
          <motion.div variants={itemVariants} className={`${cardStyle} flex items-center justify-between`}>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Trips Dispatched</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{summary.trips.today}</span>
                <span className="text-xs text-zinc-400 font-medium">Today</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-semibold">{summary.trips.pending} pending</p>
            </div>
            <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <MapPin size={24} />
            </div>
          </motion.div>
        )}

        {/* Financial Profit (Finance/Admin) */}
        {showFinance && (
          <motion.div variants={itemVariants} className={`${cardStyle} flex items-center justify-between`}>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Net Profit</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-400">${summary.financials.profit.toLocaleString()}</span>
              </div>
              <div className="flex gap-2 text-[10px] font-semibold text-zinc-500">
                <span>Rev: ${summary.financials.revenue.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <Landmark size={24} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Charts & Expenses Layout */}
      <div className={`grid grid-cols-1 ${showFinance && showOperations ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
        {/* Left main chart (Ops/Admin) */}
        {showOperations && (
          <motion.div variants={itemVariants} className={`${cardStyle} ${showFinance ? 'lg:col-span-2' : 'lg:col-span-2'} space-y-4`}>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className={headerStyle}>Transport Dispatch Trends</h3>
                <p className={subtextStyle}>Completed volume history</p>
              </div>
            </div>
            <div className="h-64">
              <Line data={lineData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa' } },
                  y: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa' } }
                },
                plugins: { legend: { labels: { color: '#a1a1aa' } } }
              }} />
            </div>
          </motion.div>
        )}

        {/* Right doughnut chart (Finance/Admin) */}
        {showFinance && (
          <motion.div variants={itemVariants} className={`${cardStyle} ${!showOperations ? 'lg:col-span-2' : ''} space-y-4`}>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className={headerStyle}>Expense Allocation</h3>
                <p className={subtextStyle}>Cost distribution categories</p>
              </div>
            </div>
            <div className="h-60 flex items-center justify-center">
              {expenseBreakdown.length > 0 ? (
                <Doughnut data={doughnutData} options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa' } } }
                }} />
              ) : (
                <div className="text-xs text-zinc-500 font-medium">No expenses logged.</div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent Trips & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table (Ops/Admin) */}
        {showOperations && (
          <motion.div variants={itemVariants} className={`${cardStyle} lg:col-span-2 space-y-4`}>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className={headerStyle}>Active Logged Trips</h3>
                <p className={subtextStyle}>Live operational dispatch monitor</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={tableHeaderStyle}>
                    <th className="py-2.5">Trip Number</th>
                    <th className="py-2.5">Route</th>
                    <th className="py-2.5">Cargo</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.length > 0 ? (
                    recentTrips.map(trip => (
                      <tr key={trip._id} className={tableRowStyle}>
                        <td className="py-3 font-semibold text-primary">{trip.tripNumber}</td>
                        <td className="py-3 text-zinc-300">{trip.source} → {trip.destination}</td>
                        <td className="py-3 text-zinc-400">{trip.cargoWeightKg.toLocaleString()} kg</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border ${
                            trip.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            trip.status === 'dispatched' ? 'bg-primary/10 text-primary border-primary/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-zinc-500">No active trips dispatched.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Quick Actions Panel (Ops/Manager/Admin) */}
        {showFleet && (
          <motion.div variants={itemVariants} className={`${cardStyle} space-y-4`}>
            <h3 className={headerStyle}>Operational Shortcuts</h3>
            <div className="space-y-3">
              <a href="/trips" className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded border border-primary/30 bg-primary/10 text-primary"><MapPin size={16} /></div>
                  <div className="text-left"><p className="text-xs font-bold text-white">Dispatch New Cargo</p><p className="text-[10px] text-zinc-500 font-medium">Allocate route, driver & vehicle</p></div>
                </div>
                <ArrowRight size={14} className="text-zinc-500 group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </a>

              <a href="/maintenance" className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded border border-amber-500/30 bg-amber-500/10 text-amber-500"><Wrench size={16} /></div>
                  <div className="text-left"><p className="text-xs font-bold text-white">Schedule Repair</p><p className="text-[10px] text-zinc-500 font-medium">Place vehicles in maintenance</p></div>
                </div>
                <ArrowRight size={14} className="text-zinc-500 group-hover:text-amber-500 transition-transform group-hover:translate-x-1" />
              </a>

              <a href="/fuel" className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"><Fuel size={16} /></div>
                  <div className="text-left"><p className="text-xs font-bold text-white">Log Fuel Station Refill</p><p className="text-[10px] text-zinc-500 font-medium">Record liters & odometer readings</p></div>
                </div>
                <ArrowRight size={14} className="text-zinc-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
