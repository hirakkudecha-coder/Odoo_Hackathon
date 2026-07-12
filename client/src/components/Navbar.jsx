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
    <header className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-brandbg-dark sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-64 max-w-lg hidden sm:block">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
          <Search size={16} />
        </span>
        <input 
          type="text" 
          placeholder="Global system search..." 
          className="w-full pl-9 pr-4 py-2 border border-zinc-800 rounded-lg bg-zinc-900 focus:outline-none focus:border-primary text-sm transition-all text-white placeholder-zinc-500"
        />
      </div>
      
      {/* Spacer for small screens */}
      <div className="sm:hidden flex-1" />

      {/* Action Items */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg border border-zinc-800 hover:text-white hover:bg-zinc-800 text-zinc-400 transition-colors relative"
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-primary animate-pulse border-2 border-brandbg-dark" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-brandcard-dark border border-zinc-800 rounded-lg shadow-premium p-4 z-50 animate-slide-in">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h4 className="font-bold text-sm text-white">System Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline font-semibold">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3 rounded-lg text-xs space-y-1 ${n.unread ? 'bg-primary/10 border border-primary/20' : 'bg-zinc-900 border border-zinc-800'}`}>
                    <p className={`font-medium ${n.unread ? 'text-white' : 'text-zinc-400'}`}>{n.text}</p>
                    <span className="text-[10px] text-zinc-500 font-semibold">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
          <div className="w-8 h-8 rounded bg-primary/20 border border-primary/50 flex items-center justify-center text-primary shrink-0">
            <User size={16} />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold text-white leading-none">{user?.name}</span>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
