import React from 'react';
import { Truck, Map, DollarSign, Wrench, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      {trend === 'up' ? (
        <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
      ) : trend === 'down' ? (
        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
      ) : (
        <span className="h-4 w-4 mr-1">-</span>
      )}
      <span className={trend === 'up' ? 'text-emerald-500 font-medium' : trend === 'down' ? 'text-red-500 font-medium' : 'text-slate-500 font-medium'}>
        {trendValue}
      </span>
      <span className="text-slate-500 ml-2">vs last month</span>
    </div>
  </div>
);

const Dashboard = () => {
  // Mock Data for Charts
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenue',
        data: [45000, 52000, 48000, 61000, 59000, 75000, 82000],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses',
        data: [30000, 32000, 31000, 38000, 36000, 42000, 41000],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.0)',
        borderWidth: 2,
        tension: 0.4,
        borderDash: [5, 5],
      }
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 6 } },
      tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(15, 23, 42, 0.9)' }
    },
    scales: {
      y: { border: { display: false }, grid: { color: '#f1f5f9', drawTicks: false } },
      x: { border: { display: false }, grid: { display: false } }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  };

  const recentTrips = [
    { id: 'TRP-1029', driver: 'John Doe', destination: 'New York, NY', status: 'Completed', amount: '$1,200', date: 'Today, 10:30 AM' },
    { id: 'TRP-1030', driver: 'Sarah Smith', destination: 'Chicago, IL', status: 'In Transit', amount: '$2,400', date: 'Today, 08:15 AM' },
    { id: 'TRP-1031', driver: 'Mike Johnson', destination: 'Miami, FL', status: 'Pending', amount: '$3,100', date: 'Yesterday' },
    { id: 'TRP-1032', driver: 'Emily Brown', destination: 'Dallas, TX', status: 'Completed', amount: '$1,800', date: 'Yesterday' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here's what's happening with your fleet today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Vehicles" value="42 / 50" icon={Truck} trend="up" trendValue="12%" colorClass="bg-blue-600" />
        <StatCard title="Trips Today" value="18" icon={Map} trend="up" trendValue="8%" colorClass="bg-sky-500" />
        <StatCard title="Total Revenue" value="$82,450" icon={DollarSign} trend="up" trendValue="24%" colorClass="bg-emerald-500" />
        <StatCard title="In Maintenance" value="3" icon={Wrench} trend="down" trendValue="2 less" colorClass="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Revenue vs Expenses</h3>
            <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 outline-none">
              <option>Last 7 months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-80">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Recent Trips</h3>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <ul className="divide-y divide-slate-100">
              {recentTrips.map((trip) => (
                <li key={trip.id} className="p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        trip.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                        trip.status === 'In Transit' ? 'bg-blue-100 text-blue-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {trip.status === 'Completed' ? <CheckCircle className="h-5 w-5" /> :
                         trip.status === 'In Transit' ? <Truck className="h-5 w-5" /> :
                         <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{trip.destination}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{trip.id} • {trip.driver}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{trip.amount}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{trip.date}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
