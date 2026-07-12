import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useSelector } from 'react-redux';

const Topbar = ({ toggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-64 placeholder-slate-400 text-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-900 leading-none">{user?.name || 'User'}</span>
            <span className="text-xs text-slate-500 mt-1">{user?.role || 'Admin'}</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner cursor-pointer ring-2 ring-white border border-slate-100">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
