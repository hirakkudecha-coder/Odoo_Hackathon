import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/index.js';
import { initTheme } from './store/slices/themeSlice.js';

// Layout & Pages
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Vehicles from './pages/Vehicles.jsx';
import Drivers from './pages/Drivers.jsx';
import Trips from './pages/Trips.jsx';
import Maintenance from './pages/Maintenance.jsx';
import FuelLogs from './pages/Fuel.jsx';
import Expenses from './pages/Expenses.jsx';
import Reports from './pages/Reports.jsx';
import SettingsPage from './pages/Settings.jsx';

function AppContent() {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.theme.mode);

  // Initialize theme from localStorage/system preferences
  useEffect(() => {
    dispatch(initTheme());
  }, [dispatch]);

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'text-xs font-semibold rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-800 dark:text-slate-100 shadow-glass',
          duration: 4000
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Portals */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Secure Layout routes */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="trips" element={<Trips />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="fuel" element={<FuelLogs />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
