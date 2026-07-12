import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Sun, Moon, Bell, Search, User } from 'lucide-react';
import { toggleTheme } from '../store/slices/themeSlice.js';

export default function Navbar() {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Vehicle TX-987-AB scheduled for oil change.', time: '10m ago', unread: true },
    { id: 2, text: 'Trip TRIP-2026-001 has been dispatched.', time: '1h ago', unread: true },
    { id: 3, text: 'Driver Marcus Cooper safety score updated to 98%.', time: '1d ago', unread: false }
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-16 border-b border-slate-200/50 dark:border-slate-800/50 px-6 flex items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-64 max-w-lg hidden sm:block">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="Global system search..." 
          className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
        />
      </div>
      
      {/* Spacer for small screens */}
      <div className="sm:hidden flex-1" />

      {/* Action Items */}
      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <button 
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title="Toggle Theme"
        >
          {themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium p-4 z-50 animate-slide-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-sm">System Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline font-semibold">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="mt-3 space-y-3 max-h-60 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-2 rounded-xl text-xs space-y-1 ${n.unread ? 'bg-primary-light/30 dark:bg-primary-dark/20' : ''}`}>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{n.text}</p>
                    <span className="text-[10px] text-slate-400 font-semibold">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
            <User size={18} />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold leading-none">{user?.name}</p>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
