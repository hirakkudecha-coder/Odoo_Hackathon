import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Plus, Play, CheckCircle2, XCircle, Clock, Eye, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient.js';
import DataTable from '../components/DataTable.jsx';
import FormDrawer from '../components/FormDrawer.jsx';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const selectedVehicleId = watch('vehicleId');
  const [vehicleCapacityWarning, setVehicleCapacityWarning] = useState(null);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/trips', {
        params: { page, limit: 10, sort: sortField, order: sortOrder, search, status: statusFilter }
      });
      setTrips(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        apiClient.get('/vehicles?limit=100&status=available'),
        apiClient.get('/drivers?limit=100&status=available')
      ]);
      setVehicles(vRes.data.data);
      setDrivers(dRes.data.data);
    } catch (error) {
      console.error('Failed to fetch allocation assets', error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [page, search, sortField, sortOrder, statusFilter]);

  useEffect(() => {
    if (drawerOpen) fetchAssets();
  }, [drawerOpen]);

  // Capacity safety warning validator
  const cargoWeight = watch('cargoWeightKg');
  useEffect(() => {
    if (selectedVehicleId && cargoWeight) {
      const vehObj = vehicles.find(v => v._id === selectedVehicleId);
      if (vehObj && parseFloat(cargoWeight) > vehObj.capacityKg) {
        setVehicleCapacityWarning(`Cargo weight exceeds vehicle load capacity by ${(parseFloat(cargoWeight) - vehObj.capacityKg).toLocaleString()} kg.`);
      } else {
        setVehicleCapacityWarning(null);
      }
    } else {
      setVehicleCapacityWarning(null);
    }
  }, [selectedVehicleId, cargoWeight, vehicles]);

  const handleCreateTrip = async (data) => {
    if (vehicleCapacityWarning) {
      toast.error('Cannot save trip: Cargo exceeds vehicle capacity');
      return;
    }
    try {
      await apiClient.post('/trips', data);
      toast.success('Trip drafted successfully');
      setDrawerOpen(false);
      reset();
      fetchTrips();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Creation failed');
    }
  };

  const handleDispatch = async (id) => {
    try {
      await apiClient.post(`/trips/${id}/dispatch`);
      toast.success('Trip successfully dispatched!');
      fetchTrips();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Dispatch transition failed');
    }
  };

  const handleComplete = async (id) => {
    const endingOdometer = window.prompt('Enter ending Odometer reading (km):');
    if (endingOdometer === null) return;
    try {
      await apiClient.post(`/trips/${id}/complete`, { endingOdometerKm: parseFloat(endingOdometer) });
      toast.success('Trip marked completed! Odometer updated.');
      fetchTrips();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Completion failed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this trip?')) return;
    try {
      await apiClient.post(`/trips/${id}/cancel`, { notes: 'Cancelled by Dispatcher' });
      toast.success('Trip cancelled.');
      fetchTrips();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancellation failed');
    }
  };

  const columns = [
    { header: 'Trip Number', accessor: 'tripNumber', cell: (row) => <span className="font-semibold text-primary">{row.tripNumber}</span> },
    { header: 'Vehicle', accessor: 'vehicleId', cell: (row) => <span>{row.vehicleId?.registrationNumber || 'N/A'}</span> },
    { header: 'Driver', accessor: 'driverId', cell: (row) => <span>{row.driverId?.name || 'N/A'}</span> },
    { header: 'Route', accessor: 'route', cell: (row) => <span>{row.source} → {row.destination}</span> },
    { header: 'Cargo (kg)', accessor: 'cargoWeightKg', cell: (row) => row.cargoWeightKg.toLocaleString() },
    { header: 'Revenue ($)', accessor: 'revenue', cell: (row) => `$${row.revenue.toLocaleString()}` },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        const styles = {
          draft: 'bg-slate-100 text-slate-600 border-slate-200/50',
          scheduled: 'bg-secondary-light text-secondary border-secondary/10',
          dispatched: 'bg-primary-light text-primary border-primary/10',
          in_progress: 'bg-warning-light text-warning border-warning/10',
          completed: 'bg-success-light text-success border-success/10',
          cancelled: 'bg-danger-light text-danger border-danger/10'
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styles[row.status] || 'bg-slate-100 text-slate-800'}`}>
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
          {row.status === 'draft' && (
            <button onClick={() => handleDispatch(row._id)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-primary transition-colors" title="Dispatch"><Play size={14} /></button>
          )}
          {row.status === 'dispatched' && (
            <button onClick={() => handleComplete(row._id)} className="p-1.5 rounded-xl hover:bg-success-light dark:hover:bg-success/20 text-success transition-colors" title="Complete"><CheckCircle2 size={14} /></button>
          )}
          {(row.status === 'draft' || row.status === 'dispatched') && (
            <button onClick={() => handleCancel(row._id)} className="p-1.5 rounded-xl hover:bg-danger-light dark:hover:bg-danger/20 text-danger transition-colors" title="Cancel"><XCircle size={14} /></button>
          )}
          <button onClick={() => { setSelectedTrip(row); setTimelineDrawerOpen(true); }} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors" title="View Timeline"><Eye size={14} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trip Dispatch Management</h1>
          <p className="text-sm text-slate-500">Route cargo, allocate vehicles and CDL drivers, and trace milestones.</p>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-premium transition-all cursor-pointer">
          <Plus size={16} /> Draft New Trip
        </button>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500">Loading trips register...</span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={trips}
          meta={meta}
          searchValue={search}
          onSearch={(val) => { setSearch(val); setPage(1); }}
          onSort={(field) => {
            const nextOrder = sortField === field && sortOrder === 'desc' ? 'asc' : 'desc';
            setSortField(field);
            setSortOrder(nextOrder);
          }}
          onPageChange={setPage}
          sortField={sortField}
          sortOrder={sortOrder}
          placeholder="Search trip numbers, routes..."
        />
      )}

      {/* New Trip Drawer */}
      <FormDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Draft New Route Dispatch">
        <form onSubmit={handleSubmit(handleCreateTrip)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Trip Reference Number</label>
            <input type="text" required {...register('tripNumber')} placeholder="e.g. TRIP-2026-XYZ" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Origin Location</label>
              <input type="text" required {...register('source')} placeholder="Dallas, TX" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Destination</label>
              <input type="text" required {...register('destination')} placeholder="Chicago, IL" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Distance (km)</label>
              <input type="number" required {...register('distanceKm')} placeholder="e.g. 1500" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Agreed Revenue ($)</label>
              <input type="number" required {...register('revenue')} placeholder="e.g. 4500" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Cargo Weight (kg)</label>
            <input type="number" required {...register('cargoWeightKg')} placeholder="e.g. 12000" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Allocate Available Vehicle</label>
            <select required {...register('vehicleId')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none">
              <option value="">Select vehicle</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>{v.registrationNumber} - {v.name} ({v.capacityKg.toLocaleString()}kg Limit)</option>
              ))}
            </select>
          </div>

          {vehicleCapacityWarning && (
            <div className="p-3 bg-danger-light text-danger border border-danger/10 rounded-2xl flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{vehicleCapacityWarning}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Allocate Available Driver</label>
            <select required {...register('driverId')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none">
              <option value="">Select driver</option>
              {drivers.map(d => (
                <option key={d._id} value={d._id}>{d.name} ({d.category} - Score: {d.safetyScore}%)</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={() => setDrawerOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-premium font-semibold">Draft Trip</button>
          </div>
        </form>
      </FormDrawer>

      {/* Timeline Drawer */}
      <FormDrawer isOpen={timelineDrawerOpen} onClose={() => setTimelineDrawerOpen(false)} title="Route Milestones & Activity Feed">
        {selectedTrip && (
          <div className="space-y-6 text-xs">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-950 dark:text-slate-100">{selectedTrip.tripNumber}</h4>
              <p className="text-slate-500 mt-1">{selectedTrip.source} → {selectedTrip.destination}</p>
            </div>
            
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-6">
              {selectedTrip.timeline.map((evt, idx) => (
                <div key={evt._id || idx} className="relative">
                  <span className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-4 border-white dark:border-slate-900" />
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-primary-light text-primary text-[9px] font-bold uppercase">{evt.status}</span>
                    <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">{evt.notes}</p>
                    <span className="text-[10px] text-slate-400 font-semibold">{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={() => setTimelineDrawerOpen(false)} className="w-full py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold">Close Panel</button>
          </div>
        )}
      </FormDrawer>
    </div>
  );
}
