import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Fuel, Plus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient.js';
import DataTable from '../components/DataTable.jsx';
import FormDrawer from '../components/FormDrawer.jsx';

export default function FuelLogs() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/fuel-logs', {
        params: { page, limit: 10 }
      });
      setLogs(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toast.error('Failed to load fuel logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const [vRes, tRes] = await Promise.all([
        apiClient.get('/vehicles?limit=100'),
        apiClient.get('/trips?limit=100&status=dispatched')
      ]);
      setVehicles(vRes.data.data);
      setTrips(tRes.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  useEffect(() => {
    if (drawerOpen) fetchAssets();
  }, [drawerOpen]);

  const handleCreate = async (data) => {
    try {
      await apiClient.post('/fuel-logs', {
        ...data,
        liters: parseFloat(data.liters),
        cost: parseFloat(data.cost),
        odometerKm: parseFloat(data.odometerKm),
        tripId: data.tripId || null
      });
      toast.success('Fuel log successfully logged');
      setDrawerOpen(false);
      reset();
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logging failed');
    }
  };

  const columns = [
    { header: 'Vehicle', accessor: 'vehicleId', cell: (row) => <span className="font-mono font-bold">{row.vehicleId?.registrationNumber || 'N/A'}</span> },
    { header: 'Trip Number', accessor: 'tripId', cell: (row) => <span className="font-semibold text-primary">{row.tripId?.tripNumber || 'Standalone'}</span> },
    { header: 'Liters Refueled', accessor: 'liters', cell: (row) => `${row.liters} L` },
    { header: 'Total Cost ($)', accessor: 'cost', cell: (row) => `$${row.cost.toLocaleString()}` },
    { header: 'Fuel Station Brand', accessor: 'fuelStation' },
    { header: 'Odometer (km)', accessor: 'odometerKm', cell: (row) => row.odometerKm.toLocaleString() },
    { header: 'Refilled Date', accessor: 'filledAt', cell: (row) => new Date(row.filledAt).toLocaleDateString() }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fuel Log Registers</h1>
          <p className="text-sm text-slate-500">Record gallons, calculate cost totals, and log station details.</p>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-premium transition-all cursor-pointer">
          <Plus size={16} /> Log Fuel Receipt
        </button>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500">Loading fuel logs...</span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          meta={meta}
          onSearch={() => {}}
          onSort={() => {}}
          onPageChange={setPage}
          placeholder="Filtering fuel receipts..."
        />
      )}

      {/* New Fuel Drawer */}
      <FormDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Log Refill Station Receipt">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Select Vehicle</label>
            <select required {...register('vehicleId')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none">
              <option value="">Select vehicle</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>{v.registrationNumber} - {v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Associated Active Trip (Optional)</label>
            <select {...register('tripId')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none">
              <option value="">None (Standalone Fill-up)</option>
              {trips.map(t => (
                <option key={t._id} value={t._id}>{t.tripNumber} ({t.source} → {t.destination})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Volume (Liters)</label>
              <input type="number" step="0.01" required {...register('liters')} placeholder="e.g. 250" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Total Receipt Cost ($)</label>
              <input type="number" step="0.01" required {...register('cost')} placeholder="e.g. 350.50" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Fuel Station Brand & Location</label>
            <input type="text" required {...register('fuelStation')} placeholder="Love's Travel Stops #448" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Current Odometer (km)</label>
              <input type="number" required {...register('odometerKm')} placeholder="e.g. 145320" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Refilled At Date</label>
              <input type="date" required defaultValue={new Date().toISOString().split('T')[0]} {...register('filledAt')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={() => setDrawerOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-premium font-semibold">Save Fuel Log</button>
          </div>
        </form>
      </FormDrawer>
    </div>
  );
}
