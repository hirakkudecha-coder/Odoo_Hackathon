import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import FuelExpenses from './pages/FuelExpenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          
          <Route path="/" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="trips" element={<Trips />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="fuel-expenses" element={<FuelExpenses />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            {/* Other routes will go here */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;