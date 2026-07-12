import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Landmark, Plus, Check, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient.js';
import DataTable from '../components/DataTable.jsx';
import FormDrawer from '../components/FormDrawer.jsx';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/expenses', {
        params: { page, limit: 10, category: categoryFilter }
      });
      setExpenses(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const [vRes, tRes] = await Promise.all([
        apiClient.get('/vehicles?limit=100'),
        apiClient.get('/trips?limit=100')
      ]);
      setVehicles(vRes.data.data);
      setTrips(tRes.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, categoryFilter]);

  useEffect(() => {
    if (drawerOpen) fetchAssets();
  }, [drawerOpen]);

  const handleCreate = async (data) => {
    try {
      await apiClient.post('/expenses', {
        ...data,
        amount: parseFloat(data.amount),
        vehicleId: data.vehicleId || null,
        tripId: data.tripId || null
      });
      toast.success('Expense claim saved');
      setDrawerOpen(false);
      reset();
      fetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logging failed');
    }
  };

  const handleApprove = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'pending' ? 'approved' : 'paid';
      await apiClient.patch(`/expenses/${id}`, { status: nextStatus });
      toast.success(`Expense status updated to ${nextStatus}.`);
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    { header: 'Category', accessor: 'category', cell: (row) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.category}</span> },
    { header: 'Amount ($)', accessor: 'amount', cell: (row) => <span className="font-semibold text-slate-900 dark:text-slate-100">${row.amount.toLocaleString()}</span> },
    { header: 'Associated Vehicle', accessor: 'vehicleId', cell: (row) => <span>{row.vehicleId?.registrationNumber || 'Fleetwide'}</span> },
    { header: 'Description', accessor: 'description', cell: (row) => <span className="truncate max-w-xs block">{row.description}</span> },
    { header: 'Incurred Date', accessor: 'incurredAt', cell: (row) => new Date(row.incurredAt).toLocaleDateString() },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        const styles = {
          pending: 'bg-warning-light text-warning border-warning/10',
          approved: 'bg-primary-light text-primary border-primary/10',
          paid: 'bg-success-light text-success border-success/10'
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
          {row.status === 'pending' && (
            <button 
              onClick={() => handleApprove(row._id, 'pending')} 
              className="p-1.5 rounded-xl hover:bg-primary-light/40 dark:hover:bg-primary-dark/20 text-primary transition-colors"
              title="Approve Expense"
            >
              <Check size={14} />
            </button>
          )}
          {row.status === 'approved' && (
            <button 
              onClick={() => handleApprove(row._id, 'approved')} 
              className="p-1.5 rounded-xl hover:bg-success-light/40 dark:hover:bg-success-dark/20 text-success transition-colors"
              title="Pay Expense"
            >
              <CreditCard size={14} />
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
          <h1 className="text-2xl font-bold tracking-tight">Operational Expenditures</h1>
          <p className="text-sm text-slate-500">Trace tolls, oil services, driver allowances, and insurances.</p>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-premium transition-all cursor-pointer">
          <Plus size={16} /> Log Expense Claim
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
        {['', 'Fuel', 'Maintenance', 'Tolls', 'Insurance', 'Miscellaneous'].map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategoryFilter(cat); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              categoryFilter === cat 
                ? 'bg-primary border-primary text-white shadow-premium' 
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
            }`}
          >
            {cat === '' ? 'All Cost Items' : cat.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500">Loading cost books...</span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={expenses}
          meta={meta}
          onSearch={() => {}}
          onSort={() => {}}
          onPageChange={setPage}
          placeholder="Filtering costs..."
        />
      )}

      {/* New Expense Drawer */}
      <FormDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Log New Expense Statement">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Expense Classification</label>
            <select {...register('category')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none">
              {['Fuel', 'Maintenance', 'Tolls', 'Insurance', 'Miscellaneous'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Amount ($)</label>
            <input type="number" step="0.01" required {...register('amount')} placeholder="e.g. 150.00" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Description</label>
            <input type="text" required {...register('description')} placeholder="e.g. Route Toll fee NY express" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Select Vehicle (Optional)</label>
              <select {...register('vehicleId')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none">
                <option value="">None (Fleetwide)</option>
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>{v.registrationNumber} - {v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Associated Trip (Optional)</label>
              <select {...register('tripId')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none">
                <option value="">None</option>
                {trips.map(t => (
                  <option key={t._id} value={t._id}>{t.tripNumber}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Transaction Date</label>
            <input type="date" required defaultValue={new Date().toISOString().split('T')[0]} {...register('incurredAt')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={() => setDrawerOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-premium font-semibold">Log Expense</button>
          </div>
        </form>
      </FormDrawer>
    </div>
  );
}
