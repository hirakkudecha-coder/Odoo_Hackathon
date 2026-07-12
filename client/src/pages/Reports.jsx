import React from 'react';
import { Download, FileText, PieChart, TrendingUp, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const expenseData = {
    labels: ['Fuel', 'Maintenance', 'Tolls', 'Insurance', 'Miscellaneous'],
    datasets: [
      {
        data: [45, 25, 10, 15, 5],
        backgroundColor: [
          '#3b82f6', // blue-500
          '#f59e0b', // amber-500
          '#10b981', // emerald-500
          '#8b5cf6', // violet-500
          '#64748b', // slate-500
        ],
        borderWidth: 0,
      },
    ],
  };

  const utilizationData = {
    labels: ['Trucks', 'Vans', 'Trailers'],
    datasets: [
      {
        label: 'Utilization %',
        data: [85, 92, 78],
        backgroundColor: '#2563eb', // blue-600
        borderRadius: 4,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  const ReportCard = ({ title, description, icon: Icon }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col items-start h-full">
      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 text-sm mt-2 flex-1">{description}</p>
      <button className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
        <Download className="h-4 w-4" />
        Export CSV
      </button>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Generate comprehensive reports and analyze fleet performance.</p>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
             <PieChart className="h-5 w-5 text-slate-400" />
             Expense Breakdown
           </h3>
           <div className="h-64 flex justify-center">
             <Doughnut data={expenseData} options={{ maintainAspectRatio: false, cutout: '70%' }} />
           </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
             <BarChart3 className="h-5 w-5 text-slate-400" />
             Fleet Utilization by Type
           </h3>
           <div className="h-64">
             <Bar data={utilizationData} options={barOptions} />
           </div>
        </div>
      </div>

      {/* Exportable Reports */}
      <h3 className="text-lg font-bold text-slate-900 pt-4">Exportable Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard 
          title="Vehicle Performance" 
          description="Detailed metrics on fuel efficiency, maintenance frequency, and uptime for each vehicle."
          icon={FileText} 
        />
        <ReportCard 
          title="Driver Analytics" 
          description="Safety scores, trip completion rates, and driving hours logs."
          icon={TrendingUp} 
        />
        <ReportCard 
          title="Financial Summary" 
          description="Aggregated view of all expenses, fuel costs, and generated revenue."
          icon={PieChart} 
        />
        <ReportCard 
          title="Maintenance Log" 
          description="Historical record of all maintenance performed, including costs and garages used."
          icon={FileText} 
        />
      </div>

    </motion.div>
  );
};

export default Reports;
