import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Truck, Plus, Edit2, Trash2, Eye, ShieldAlert, FileText, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient.js';
import DataTable from '../components/DataTable.jsx';
import FormDrawer from '../components/FormDrawer.jsx';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { register: registerDoc, handleSubmit: handleSubmitDoc, reset: resetDoc } = useForm();

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/vehicles', {
        params: {
          page,
          limit: 10,
          sort: sortField,
          order: sortOrder,
          search,
          status: statusFilter
        }
      });
      setVehicles(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, search, sortField, sortOrder, statusFilter]);

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editingVehicle) {
        await apiClient.patch(`/vehicles/${editingVehicle._id}`, data);
        toast.success('Vehicle updated successfully');
      } else {
        await apiClient.post('/vehicles', data);
        toast.success('Vehicle registered successfully');
      }
      setDrawerOpen(false);
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to retire/delete this vehicle?')) return;
    try {
      await apiClient.delete(`/vehicles/${id}`);
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleUploadDocument = async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.docName);
      if (data.file[0]) formData.append('document', data.file[0]);
      if (data.expiryDate) formData.append('expiryDate', data.expiryDate);

      await apiClient.post(`/vehicles/${selectedVehicle._id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded successfully');
      setDocumentModalOpen(false);
      resetDoc();
      fetchVehicles();
    } catch (error) {
      toast.error('Document upload failed');
    }
  };

  const openDrawerForNew = () => {
    setEditingVehicle(null);
    reset({
      registrationNumber: '',
      name: '',
      type: 'Box Truck',
      capacityKg: '',
      odometerKm: '',
      acquisitionCost: '',
      status: 'available'
    });
    setDrawerOpen(true);
  };

  const openDrawerForEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    reset({
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      capacityKg: vehicle.capacityKg,
      odometerKm: vehicle.odometerKm,
      acquisitionCost: vehicle.acquisitionCost,
      status: vehicle.status
    });
    setDrawerOpen(true);
  };

  const columns = [
    {
      header: 'Reg Number',
      accessor: 'registrationNumber',
      sortable: true,
      cell: (row) => <span className="font-mono font-bold text-primary">{row.registrationNumber}</span>
    },
    { header: 'Vehicle Name', accessor: 'name', sortable: true },
    { header: 'Type', accessor: 'type', sortable: true },
    { header: 'Odometer (km)', accessor: 'odometerKm', sortable: true, cell: (row) => row.odometerKm.toLocaleString() },
    { header: 'Capacity (kg)', accessor: 'capacityKg', sortable: true, cell: (row) => row.capacityKg.toLocaleString() },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => {
        const colors = {
          available: 'bg-success-light text-success border-success/10',
          on_trip: 'bg-primary-light text-primary border-primary/10',
          maintenance: 'bg-warning-light text-warning border-warning/10',
          retired: 'bg-danger-light text-danger border-danger/10'
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${colors[row.status] || 'bg-slate-100 text-slate-800'}`}>
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
          <button 
            onClick={() => openDrawerForEdit(row)} 
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            title="Edit Asset"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={() => { setSelectedVehicle(row); setDocumentModalOpen(true); }} 
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            title="Attach Document"
          >
            <Upload size={14} />
          </button>
          <button 
            onClick={() => handleDelete(row._id)} 
            className="p-1.5 rounded-xl hover:bg-danger-light dark:hover:bg-danger/20 text-danger transition-colors"
            title="Retire/Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicle Fleet Directory</h1>
          <p className="text-sm text-slate-500">Monitor active configurations, carry limits, and upload documents.</p>
        </div>
        <button 
          onClick={openDrawerForNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-premium transition-all cursor-pointer"
        >
          <Plus size={16} /> Register Vehicle
        </button>
      </div>

      {/* Filter tab row */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          {['', 'available', 'on_trip', 'maintenance', 'retired'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === status 
                  ? 'bg-primary border-primary text-white shadow-premium' 
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
              }`}
            >
              {status === '' ? 'All Fleet' : status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Fetching fleet register...</span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={vehicles}
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
          placeholder="Search registrations or names..."
        />
      )}

      {/* Edit Drawer */}
      <FormDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        title={editingVehicle ? 'Edit Fleet Configuration' : 'Register New Asset'}
      >
        <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Registration Number</label>
            <input 
              type="text" 
              {...register('registrationNumber', { required: 'Registration is required' })}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. TX-987-AB"
            />
            {errors.registrationNumber && <p className="text-[10px] text-danger mt-1 font-semibold">{errors.registrationNumber.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Asset Name</label>
            <input 
              type="text" 
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Freightliner Cascadia"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Vehicle Classification</label>
            <select 
              {...register('type')}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none"
            >
              {['Box Truck', 'Flatbed', 'Reefer', 'Semi-Trailer', 'Cargo Van', 'Sprinter Van'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Capacity (kg)</label>
              <input 
                type="number" 
                {...register('capacityKg', { required: 'Capacity is required' })}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 15000"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Odometer (km)</label>
              <input 
                type="number" 
                {...register('odometerKm', { required: 'Odometer is required' })}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 120000"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Acquisition Cost ($)</label>
            <input 
              type="number" 
              {...register('acquisitionCost', { required: 'Cost is required' })}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. 85000"
            />
          </div>

          {editingVehicle && (
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Operational Status</label>
              <select 
                {...register('status')}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none"
              >
                {['available', 'on_trip', 'maintenance', 'retired'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-premium font-semibold"
            >
              Save Asset
            </button>
          </div>
        </form>
      </FormDrawer>

      {/* Document Upload Modal */}
      {documentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDocumentModalOpen(false)} />
          <div className="glass-panel w-full max-w-sm p-6 rounded-3xl z-10 space-y-4">
            <h3 className="font-bold text-sm">Upload Vehicle Document</h3>
            <form onSubmit={handleSubmitDoc(handleUploadDocument)} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Document Name</label>
                <input 
                  type="text" 
                  {...registerDoc('docName', { required: true })}
                  placeholder="e.g. Insurance Manifest"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Expiry Date</label>
                <input 
                  type="date" 
                  {...registerDoc('expiryDate')}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">File Attachments</label>
                <input 
                  type="file" 
                  {...registerDoc('file', { required: true })}
                  className="w-full text-slate-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setDocumentModalOpen(false)} className="px-3 py-1.5 border rounded-xl">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-primary text-white rounded-xl">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
