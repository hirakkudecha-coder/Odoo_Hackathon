import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LayoutDashboard, Truck, Users, MapPin, 
  Wrench, Fuel, Landmark, FileBarChart2, 
  Settings, ChevronLeft, ChevronRight, LogOut 
} from 'lucide-react';
import { toggleSidebar } from '../store/slices/layoutSlice.js';
import { logoutSuccess } from '../store/slices/authSlice.js';
import apiClient from '../api/apiClient.js';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vehicles', label: 'Vehicles', icon: Truck, permission: 'vehicle:read' },
  { path: '/drivers', label: 'Drivers', icon: Users, permission: 'driver:read' },
  { path: '/trips', label: 'Trips', icon: MapPin, permission: 'trip:read' },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench, permission: 'maintenance:read' },
  { path: '/fuel', label: 'Fuel Logs', icon: Fuel, permission: 'fuel:read' },
  { path: '/expenses', label: 'Expenses', icon: Landmark, permission: 'expense:read' },
  { path: '/reports', label: 'Reports', icon: FileBarChart2, permission: 'report:read' },
  { path: '/settings', label: 'Settings', icon: Settings, permission: 'settings:read' },
];

// Helper to check if a user role has the required permission
const hasPermission = (userRole, requiredPermission) => {
  if (!requiredPermission) return true;
  if (userRole === 'Admin') return true;

  const permissionsByRole = {
    'Fleet Manager': ['vehicle:read', 'maintenance:read', 'fuel:read', 'trip:read', 'dashboard:fleet', 'settings:read'],
    'Dispatcher': ['vehicle:read', 'driver:read', 'trip:read', 'dashboard:fleet', 'settings:read'],
    'Driver': ['trip:read', 'vehicle:read', 'settings:read'],
    'Safety Officer': ['driver:read', 'settings:read'],
    'Financial Analyst': ['expense:read', 'fuel:read', 'report:read', 'trip:read', 'dashboard:finance', 'settings:read']
  };

  const userPermissions = permissionsByRole[userRole] || [];
  return userPermissions.includes(requiredPermission);
};

export default function Sidebar() {
  const sidebarOpen = useSelector((state) => state.layout.sidebarOpen);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      dispatch(logoutSuccess());
      toast.success('Logged out successfully');
    } catch (error) {
      dispatch(logoutSuccess());
    }
  };

  const allowedNav = navItems.filter(item => hasPermission(user?.role, item.permission));

  return (
    <aside 
      className={`glass-panel border-r shrink-0 min-h-screen transition-all duration-300 flex flex-col z-30 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-lg shadow-premium shrink-0">
            TO
          </div>
          {sidebarOpen && (
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight whitespace-nowrap">
              TransitOps
            </span>
          )}
        </div>
        <button 
          onClick={() => dispatch(toggleSidebar())} 
          className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {allowedNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium ${
                  isActive 
                    ? 'bg-primary text-white shadow-premium' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50 space-y-2">
        {sidebarOpen && (
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-800/30">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-primary-light text-primary dark:bg-primary-dark/30 dark:text-primary-light uppercase">
              {user?.role}
            </span>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-danger hover:bg-danger-light dark:hover:bg-danger-light/10 text-sm font-medium transition-all duration-200"
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
