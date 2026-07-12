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
      className={`bg-brandbg-dark border-r border-zinc-800 shrink-0 min-h-screen transition-all duration-300 flex flex-col z-30 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded border-2 border-primary flex items-center justify-center shrink-0 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="absolute top-1 left-1 w-2 h-2 bg-primary"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-primary"></div>
            <div className="absolute top-1 right-1 w-1 h-1 bg-primary"></div>
            <div className="absolute bottom-1 left-1 w-1 h-1 bg-primary"></div>
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-semibold text-lg text-white leading-tight tracking-tight">
                TransitOps
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest leading-tight">
                Smart Transport Operations Platform
              </span>
            </div>
          )}
        </div>
        <button 
          onClick={() => dispatch(toggleSidebar())} 
          className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {allowedNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium border ${
                  isActive 
                    ? 'border-primary/50 text-primary bg-primary/10' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-zinc-800 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm font-medium transition-all duration-200"
        >
          <LogOut size={18} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
