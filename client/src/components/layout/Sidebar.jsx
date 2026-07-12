import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  Fuel, 
  PieChart, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout, reset } from '../../store/slices/authSlice';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/vehicles', icon: Truck, label: 'Vehicles' },
  { path: '/drivers', icon: Users, label: 'Drivers' },
  { path: '/trips', icon: Map, label: 'Trips' },
  { path: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { path: '/fuel-expenses', icon: Fuel, label: 'Fuel & Expenses' },
  { path: '/reports', icon: PieChart, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        className={`fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 flex flex-col lg:translate-x-0 lg:static transition-transform duration-300`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100 justify-between lg:justify-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-linear-to-tr from-blue-600 to-sky-400 rounded-lg flex items-center justify-center shadow-md">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">TransitOps</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
