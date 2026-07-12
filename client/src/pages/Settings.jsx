import React from 'react';
import { useForm } from 'react-hook-form';
import { Settings, ShieldAlert, KeyRound, User } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient.js';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileSuccess } from '../store/slices/authSlice.js';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const { register: registerProfile, handleSubmit: handleSubmitProfile } = useForm({
    defaultValues: { name: user?.name, email: user?.email }
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword } = useForm();

  const handleUpdateProfile = async (data) => {
    try {
      const response = await apiClient.patch('/settings/profile', data);
      dispatch(updateProfileSuccess(response.data.data));
      toast.success('Profile details updated!');
    } catch (error) {
      toast.error('Failed to save profile changes');
    }
  };

  const handleUpdatePassword = async (data) => {
    try {
      await apiClient.patch('/settings/password', data);
      toast.success('Credentials updated! Please log in again.');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update credentials');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account & Configuration Settings</h1>
        <p className="text-sm text-slate-500">Edit access emails, customize credentials, and configure notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column Profile info */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm border-b pb-2 border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <User size={16} className="text-primary" /> Profile Parameters
          </h3>
          <form onSubmit={handleSubmitProfile(handleUpdateProfile)} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-650 dark:text-slate-400 mb-1.5">User Full Name</label>
              <input type="text" required {...registerProfile('name')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-650 dark:text-slate-400 mb-1.5">Email Address</label>
              <input type="email" required {...registerProfile('email')} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none" />
            </div>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-premium font-semibold cursor-pointer">
              Save Profile
            </button>
          </form>
        </div>

        {/* Right Column Password config */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm border-b pb-2 border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <KeyRound size={16} className="text-secondary" /> Credentials Vault
          </h3>
          <form onSubmit={handleSubmitPassword(handleUpdatePassword)} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-650 dark:text-slate-400 mb-1.5">Current Password</label>
              <input type="password" required {...registerPassword('currentPassword')} placeholder="••••••••" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-650 dark:text-slate-400 mb-1.5">New Password</label>
              <input type="password" required {...registerPassword('newPassword')} placeholder="Min 6 characters" className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none" />
            </div>
            <button type="submit" className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-white rounded-xl shadow-premium font-semibold cursor-pointer">
              Change Credentials
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
