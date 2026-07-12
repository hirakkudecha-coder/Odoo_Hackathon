import React, { useState } from 'react';
import { FileText, Download, Table, AlertCircle, FileBarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient.js';

export default function Reports() {
  const [reportType, setReportType] = useState('vehicles');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  const [activeTab, setActiveTab] = useState('export');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'analytics' && analyticsData.length === 0) {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await apiClient.get('/reports/analytics/roi');
      setAnalyticsData(response.data.data);
    } catch (error) {
      toast.error('Failed to load advanced analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleFetchPreview = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/reports/${reportType}`);
      setPreviewData(response.data.data);
      toast.success('Report preview compiled successfully');
    } catch (error) {
      toast.error('Failed to compile report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    const token = localStorage.getItem('accessToken');
    // Direct URL trigger with accessToken appended or using normal window.open
    const downloadUrl = `/api/v1/reports/${reportType}/export?format=${format}&token=${token}`;
    
    // To respect auth middlewares in simple window.open downloads, let's create a temporary hidden anchor
    // or trigger download via Axios to preserve Bearer headers. Let's do Axios download!
    toast.promise(
      apiClient.get(`/reports/${reportType}/export`, {
        params: { format },
        responseType: 'blob'
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `transitops_report_${reportType}.${format === 'csv' ? 'csv' : 'html'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }),
      {
        loading: `Generating ${format.toUpperCase()} report...`,
        success: 'Report downloaded successfully!',
        error: 'Export failed'
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytical Reports</h1>
        <p className="text-sm text-slate-500">Query operational registries and export compliant CSV or PDF files.</p>
      </div>

      <div className="flex gap-6 border-b border-zinc-800 pt-2">
        <button 
          onClick={() => setActiveTab('export')}
          className={`pb-3 font-semibold text-sm transition-colors ${activeTab === 'export' ? 'text-primary border-b-2 border-primary' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Data Export Engine
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 font-semibold text-sm transition-colors ${activeTab === 'analytics' ? 'text-primary border-b-2 border-primary' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Vehicle Analytics & ROI
        </button>
      </div>

      {activeTab === 'export' ? (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Parameters card */}
        <div className="glass-panel rounded-3xl p-6 space-y-4 h-fit">
          <h3 className="font-bold text-sm border-b pb-2 border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <FileBarChart2 size={16} className="text-primary" /> Report Parameters
          </h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Select Operational Category</label>
              <select 
                value={reportType} 
                onChange={(e) => { setReportType(e.target.value); setPreviewData([]); }}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none"
              >
                <option value="vehicles">Vehicles Inventory Register</option>
                <option value="drivers">Driver License & Safety Registry</option>
                <option value="trips">Trip Route History Logs</option>
                <option value="fuel">Fuel Log Stations & Refills</option>
                <option value="expenses">Expense & Ledger Entries</option>
                <option value="maintenance">Maintenance Service Bookings</option>
              </select>
            </div>

            <button 
              onClick={handleFetchPreview}
              disabled={loading}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-250 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Table size={14} /> Preview Query Results
            </button>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="block font-semibold text-slate-650 dark:text-slate-450 uppercase tracking-wider text-[10px]">Export Format</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleExport('csv')}
                  className="py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-premium cursor-pointer"
                >
                  <Download size={12} /> CSV Log
                </button>
                <button 
                  onClick={() => handleExport('pdf')}
                  className="py-2 bg-secondary hover:bg-secondary-hover text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-premium cursor-pointer"
                >
                  <FileText size={12} /> PDF Sheet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Preview grid */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm border-b pb-2 border-slate-100 dark:border-slate-800">
            Query Preview Matrix
          </h3>

          {previewData.length > 0 ? (
            <div className="overflow-x-auto max-h-[60vh] rounded-xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-[11px] font-medium border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-3">Field Title</th>
                    <th className="p-3">Metadata Info</th>
                    <th className="p-3">Reference / Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {previewData.map((row, idx) => (
                    <tr key={row._id || idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {row.registrationNumber || row.name || row.tripNumber || row.category || 'Record'}
                      </td>
                      <td className="p-3 text-slate-500">
                        {row.type || row.email || row.source || row.fuelStation || row.description}
                      </td>
                      <td className="p-3 font-bold text-primary">
                        {row.cost ? `$${row.cost}` : row.amount ? `$${row.amount}` : row.revenue ? `$${row.revenue}` : row.status || 'Active'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <AlertCircle size={32} className="stroke-1" />
              <p className="text-xs font-semibold">Select criteria and trigger preview to populate rows.</p>
            </div>
          )}
        </div>
      </div>
      ) : (
        <div className="glass-panel rounded-3xl p-6 space-y-4 min-h-[50vh]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm">Vehicle Fleet Analytics (Per Unit)</h3>
            <button onClick={fetchAnalytics} className="text-primary hover:text-primary-hover text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/10 transition-colors">
              Refresh Data
            </button>
          </div>
          
          {analyticsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Computing complex ROI formulas...</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-[11px] font-medium border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Revenue</th>
                    <th className="p-3 text-rose-500">Fuel Cost</th>
                    <th className="p-3 text-rose-500">Maint. Cost</th>
                    <th className="p-3 font-bold text-rose-600">Total Ops Cost</th>
                    <th className="p-3">Fuel Efficiency</th>
                    <th className="p-3 font-bold text-emerald-500">ROI (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {analyticsData.map(v => (
                    <tr key={v.vehicleId} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {v.registrationNumber} <span className="block text-[10px] text-slate-500 font-normal">{v.name}</span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">${v.revenue.toLocaleString()}</td>
                      <td className="p-3 text-rose-500/80">${v.fuelCost.toLocaleString()}</td>
                      <td className="p-3 text-rose-500/80">${v.maintenanceCost.toLocaleString()}</td>
                      <td className="p-3 font-bold text-rose-500">${v.operationalCost.toLocaleString()}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {v.fuelEfficiency} <span className="text-[10px] text-slate-400 font-normal">km/L</span>
                      </td>
                      <td className={`p-3 font-bold ${v.roi > 0 ? 'text-emerald-500' : v.roi < 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                        {v.roi > 0 ? '+' : ''}{v.roi}%
                      </td>
                    </tr>
                  ))}
                  {analyticsData.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-10 text-center text-slate-400">No vehicle data available for analytics</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
