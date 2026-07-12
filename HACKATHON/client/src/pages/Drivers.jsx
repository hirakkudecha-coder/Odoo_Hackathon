import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Users, Plus, Edit2, Trash2, ShieldAlert, Award, FileText, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient.js';
import DataTable from '../components/DataTable.jsx';
import FormDrawer from '../components/FormDrawer.jsx';

export default function Drivers() {
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
  const [editingDriver, setEditingDriver] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerDoc, handleSubmit: handleSubmitDoc, reset: resetDoc } = useForm();

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/drivers', {
        params: {
          page,
          limit: 10,
          sort: sortField,
          order: sortOrder,
          search,
          status: statusFilter
        }
      });
      setDrivers(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, search, sortField, sortOrder, statusFilter]);

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editingDriver) {
        await apiClient.patch(`/drivers/${editingDriver._id}`, data);
        toast.success('Driver profile updated');
      } else {
        await apiClient.post('/drivers', data);
        toast.success('Driver registered successfully');
      }
      setDrawerOpen(false);
      fetchDrivers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to suspend or delete this driver?')) return;
    try {
      await apiClient.delete(`/drivers/${id}`);
      toast.success('Driver record soft-deleted');
      fetchDrivers();
    } catch (error) {
      toast.error('Failed to update driver status');
    }
  };

  const handleUploadLicense = async (data) => {
    try {
      const formData = new FormData();
      if (data.file[0]) formData.append('license', data.file[0]);

      await apiClient.post(`/drivers/${selectedDriver._id}/license`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('License document uploaded');
      setLicenseModalOpen(false);
      resetDoc();
      fetchDrivers();
    } catch (error) {
      toast.error('License upload failed');
    }
  };

  const openDrawerForNew = () => {
    setEditingDriver(null);
    reset({
      name: '',
      email: '',
      licenseNumber: '',
      category: 'Class A CDL',
      expiryDate: '',
      safetyScore: '100',
      contact: '',
      address: '',
      status: 'available'
    });
    setDrawerOpen(true);
  };

  const openDrawerForEdit = (driver) => {
    setEditingDriver(driver);
    reset({
      name: driver.name,
      email: driver.email,
      licenseNumber: driver.licenseNumber,
      category: driver.category,
      expiryDate: new Date(driver.expiryDate).toISOString().split('T')[0],
      safetyScore: driver.safetyScore,
      contact: driver.contact,
      address: driver.address,
      status: driver.status
    });
    setDrawerOpen(true);
  };

  const columns = [
    {
      header: 'Driver Name',
      accessor: 'name',
      sortable: true,
      cell: (row) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.name}</span>
    },
    { header: 'License Number', accessor: 'licenseNumber', cell: (row) => <span className="font-mono text-xs">{row.licenseNumber}</span> },
    { header: 'Category', accessor: 'category' },
    {
      header: 'License Expiry',
      accessor: 'expiryDate',
      sortable: true,
      cell: (row) => {
        const expired = new Date(row.expiryDate) < new Date();
        return (
          <span className={`font-semibold ${expired ? 'text-danger flex items-center gap-1' : ''}`}>
            {expired && <ShieldAlert size={12} />}
            {new Date(row.expiryDate).toLocaleDateString()}
          </span>
        );
      }
    },
    {
      header: 'Safety Score',
      accessor: 'safetyScore',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-bold">
          <Award size={14} className="text-secondary" />
          <span className={row.safetyScore > 80 ? 'text-success' : 'text-danger'}>{row.safetyScore}%</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => {
        const colors = {
          available: 'bg-success-light text-success border-success/10',
          on_trip: 'bg-primary-light text-primary border-primary/10',
          suspended: 'bg-danger-light text-danger border-danger/10',
          'Off Duty': 'bg-slate-100 text-slate-850'
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${colors[row.status] || 'bg-slate-100 text-slate-800'}`}>
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
          <button onClick={() => openDrawerForEdit(row)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors" title="Edit Profile"><Edit2 size={14} /></button>
          <button onClick={() => { setSelectedDriver(row); setLicenseModalOpen(true); }} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors" title="Upload CDL License"><Upload size={14} /></button>
          <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-xl hover:bg-danger-light dark:hover:bg-danger/20 text-danger transition-colors" title="Suspend/Delete"><Trash2 size={14} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Driver Control Registry</h1>
          <p className="text-sm text-slate-500">Track CDL compliance parameters, license expiries, and driver safety logs.</p>
        </div>
        <button onClick={openDrawerForNew} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-premium transition-all cursor-pointer">
          <Plus size={16} /> Register Driver
        </button>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500">Fetching drivers database...</span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={drivers}
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
          placeholder="Search names, license numbers..."
        />
      )}

      {/* Edit Drawer */}
      <FormDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingDriver ? 'Edit Driver Profile' : 'Register New Fleet Driver'}>
        <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Driver Full Name</label>
            <input type="text" required {...register('name')} placeholder="e.g. John Doe" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email Address</label>
            <input type="email" required {...register('email')} placeholder="e.g. john@company.com" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">License Number</label>
              <input type="text" required {...register('licenseNumber')} placeholder="DL-12345" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">CDL Category</label>
              <select {...register('category')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none">
                {['Class A CDL', 'Class B CDL', 'Class C CDL', 'Standard License'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Expiry Date</label>
              <input type="date" required {...register('expiryDate')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Contact Phone</label>
              <input type="text" required {...register('contact')} placeholder="+1-555-0100" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Permanent Address</label>
            <input type="text" required {...register('address')} placeholder="123 Road Ave, City" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none" />
          </div>

          {editingDriver && (
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Status</label>
              <select {...register('status')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900 focus:outline-none">
                {['available', 'on_trip', 'suspended', 'Off Duty'].map(s => (
                  <option key={s} value={s}>{s.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={() => setDrawerOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-premium font-semibold">Save Profile</button>
          </div>
        </form>
      </FormDrawer>

      {/* License Document Upload Modal */}
      {licenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setLicenseModalOpen(false)} />
          <div className="glass-panel w-full max-w-sm p-6 rounded-3xl z-10 space-y-4">
            <h3 className="font-bold text-sm">Upload CDL Document</h3>
            <form onSubmit={handleSubmitDoc(handleUploadLicense)} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">License File Attachment</label>
                <input type="file" required {...registerDoc('file')} className="w-full text-slate-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setLicenseModalOpen(false)} className="px-3 py-1.5 border rounded-xl">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-primary text-white rounded-xl">Upload License</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
