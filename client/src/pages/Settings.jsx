import React from 'react';
import { User, Lock, Bell, Globe, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          <button className="px-6 py-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600 whitespace-nowrap flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </button>
          <button className="px-6 py-4 text-sm font-medium text-slate-500 hover:text-slate-700 whitespace-nowrap flex items-center gap-2">
            <Lock className="h-4 w-4" /> Security
          </button>
          <button className="px-6 py-4 text-sm font-medium text-slate-500 hover:text-slate-700 whitespace-nowrap flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </button>
          <button className="px-6 py-4 text-sm font-medium text-slate-500 hover:text-slate-700 whitespace-nowrap flex items-center gap-2">
            <Globe className="h-4 w-4" /> Preferences
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
            <p className="text-sm text-slate-500 mt-1">Update your personal details here.</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input type="text" defaultValue="Super" className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input type="text" defaultValue="Admin" className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" defaultValue="admin@transitops.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-500 cursor-not-allowed shadow-sm" disabled />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          <div>
            <h3 className="text-lg font-bold text-slate-900">Role & Access</h3>
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-4">
               <div className="p-2 bg-blue-600 rounded-lg text-white">
                 <Lock className="h-5 w-5" />
               </div>
               <div>
                 <h4 className="font-semibold text-blue-900">System Administrator</h4>
                 <p className="text-sm text-blue-700 mt-1">You have full access to all modules, settings, and user management capabilities.</p>
               </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-600/20 transition-all active:scale-95">
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
