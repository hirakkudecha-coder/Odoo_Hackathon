import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Wrench, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient.js';
import DataTable from '../components/DataTable.jsx';
import FormDrawer from '../components/FormDrawer.jsx';

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/maintenance', {
        params: { page, limit: 10, status: statusFilter }
      });
      setLogs(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toast.error('Failed to load maintenance logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get('/vehicles?limit=100');
      // Filter out retired vehicles
      setVehicles(response.data.data.filter(v => v.status !== 'retired'));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, statusFilter]);

  useEffect(() => {
    if (drawerOpen) fetchVehicles();
  }, [drawerOpen]);

  const handleCreate = async (data) => {
    try {
      await apiClient.post('/maintenance', data);
      toast.success('Maintenance scheduled successfully');
      setDrawerOpen(false);
      reset();
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule');
    }
  };

  const handleCloseRequest = async (id) => {
    const finalCost = window.prompt('Confirm final maintenance service cost ($):');
    if (finalCost === null) return;
    try {
      await apiClient.post(`/maintenance/${id}/close`, { cost: parseFloat(finalCost) });
      toast.success('Service request completed, vehicle status restored.');
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const columns = [
    { header: 'Vehicle', accessor: 'vehicleId', cell: (row) => <span className="font-mono font-bold">{row.vehicleId?.registrationNumber || 'N/A'}</span> },
    { header: 'Type', accessor: 'type' },
    { header: 'Description', accessor: 'description', cell: (row) => <span className="truncate max-w-xs block">{row.description}</span> },
    { header: 'Cost ($)', accessor: 'cost', cell: (row) => `$${row.cost.toLocaleString()}` },
    { header: 'Garage Workshop', accessor: 'garage' },
    { header: 'Scheduled Date', accessor: 'scheduledDate', cell: (row) => new Date(row.scheduledDate).toLocaleDateString() },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        const styles = {
          scheduled: 'bg-primary-light text-primary border-primary/10',
          in_progress: 'bg-warning-light text-warning border-warning/10',
          completed: 'bg-success-light text-success border-success/10',
          cancelled: 'bg-danger-light text-danger border-danger/10'
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${styles[row.status] || 'bg-slate-100'}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status !== 'completed' && row.status !== 'cancelled' && (
            <button 
              onClick={() => handleCloseRequest(row._id)} 
              className="p-1.5 rounded-xl hover:bg-success-light dark:hover:bg-success/20 text-success transition-colors"
              title="Close/Complete Repair"
            >
              <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance Logs</h1>
          <p className="text-sm text-slate-500">Track oil changes, breakdowns, repairs, and scheduled diagnostics.</p>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-premium transition-all cursor-pointer">
          <Plus size={16} /> Schedule Maintenance
        </button>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500">Loading service list...</span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          meta={meta}
          onSearch={() => {}}
          onSort={() => {}}
          onPageChange={setPage}
          placeholder="Filtering logs..."
        />
      )}

      {/* New Maintenance Drawer */}
      <FormDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Schedule Vehicle Service Request">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Select Vehicle</label>
            <select required {...register('vehicleId')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none">
              <option value="">Select vehicle</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>{v.registrationNumber} - {v.name} ({v.status})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Service Type</label>
            <select {...register('type')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none">
              {['Oil Change', 'Repair', 'Inspection', 'Routine Service', 'Preventive Maintenance'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Garage Workshop</label>
              <input type="text" required {...register('garage')} placeholder="Rapid Fleet Services" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Scheduled Date</label>
              <input type="date" required {...register('scheduledDate')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Estimated Cost ($)</label>
            <input type="number" required {...register('cost')} placeholder="e.g. 500" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Issue/Job Description</label>
            <textarea required {...register('description')} rows="3" placeholder="Brake pads thin, oil filter replacement..." className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={() => setDrawerOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-premium font-semibold">Schedule Service</button>
          </div>
        </form>
      </FormDrawer>
    </div>
  );
}
