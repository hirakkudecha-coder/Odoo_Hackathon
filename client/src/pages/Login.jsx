import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice.js';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const [errorState, setErrorState] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const handleRoleChange = (e) => {
    const role = e.target.value;
    if (role === 'Fleet Manager') {
      setValue('email', 'manager@transitops.com');
      setValue('password', 'password123');
    } else if (role === 'Dispatcher') {
      setValue('email', 'dispatcher@transitops.com');
      setValue('password', 'password123');
    } else if (role === 'Safety Officer') {
      setValue('email', 'safety@transitops.com');
      setValue('password', 'password123');
    } else if (role === 'Financial Analyst') {
      setValue('email', 'finance@transitops.com');
      setValue('password', 'password123');
    }
  };

  const onSubmit = async (data) => {
    dispatch(loginStart());
    setErrorState(null);
    try {
      const response = await axios.post('/api/v1/auth/login', data);
      dispatch(loginSuccess(response.data));
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      dispatch(loginFailure(msg));
      setErrorState(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080B10]">
      {/* LEFT PANEL: Branding & Info */}
      <div className="w-full md:w-5/12 bg-slate-200 dark:bg-slate-900/50 dark:border-r dark:border-slate-800 p-8 md:p-12 flex flex-col justify-between text-slate-800 dark:text-slate-200 min-h-[40vh] md:min-h-screen">
        <div className="space-y-8">
          {/* Logo & Title */}
          <div className="flex items-start gap-4">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#EA580C" fillOpacity="0.15"/>
              <rect x="0.5" y="0.5" width="39" height="39" rx="7.5" stroke="#EA580C" strokeWidth="1.5"/>
              <path d="M10 10H30V30H10V10Z" stroke="#EA580C" strokeWidth="1.5" strokeDasharray="3 3"/>
              <path d="M15 10V30M20 10V30M25 10V30M10 15H30M10 20H30M10 25H30" stroke="#EA580C" strokeWidth="1" strokeOpacity="0.4"/>
            </svg>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">TransitOps</h1>
              <p className="text-xs text-slate-500 mt-0.5">Smart Transport Operations Platform</p>
            </div>
          </div>

          {/* List of Roles */}
          <div className="space-y-3 pt-6">
            <p className="font-semibold text-slate-700 dark:text-slate-350 text-sm">One login, four roles:</p>
            <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Fleet Manager
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Dispatcher
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Safety Officer
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Financial Analyst
              </li>
            </ul>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-slate-500 font-bold tracking-wider pt-6">
          TRANSITOPS © 2026 • RBAC ENABLED
        </div>
      </div>

      {/* RIGHT PANEL: Credentials Panel */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-8 md:p-16 relative">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Sign in to your account</h2>
            <p className="text-xs text-slate-400">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail size={14} />
                </span>
                <input 
                  type="email" 
                  {...register('email', { required: 'Email is required' })}
                  placeholder="name@company.com" 
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl bg-slate-900/60 border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-primary/55 ${errors.email ? 'border-danger' : 'focus:border-primary'}`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-danger mt-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock size={14} />
                </span>
                <input 
                  type="password" 
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••" 
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl bg-slate-900/60 border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-primary/55 ${errors.password ? 'border-danger' : 'focus:border-primary'}`}
                />
              </div>
              {errors.password && <p className="text-[10px] text-danger mt-1">{errors.password.message}</p>}
            </div>

            {/* Role select */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Role (RBAC)</label>
              <select 
                onChange={handleRoleChange}
                className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-900/60 border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-primary/55"
              >
                <option value="">Choose a role to auto-fill...</option>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
              </select>
            </div>

            {/* Checkbox and Forgot Link */}
            <div className="flex items-center justify-between font-semibold">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="w-4.5 h-4.5 rounded border-slate-800 bg-slate-900 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer accent-primary" 
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-premium disabled:opacity-50 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Access Scoping Matrix */}
          <div className="pt-4 border-t border-slate-900 text-[10px] text-slate-500 space-y-1.5 font-medium">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Access is scoped by role after login:</p>
            <div className="grid grid-cols-1 gap-1">
              <div>* Fleet Manager &arr; Fleet, Maintenance</div>
              <div>* Dispatcher &arr; Dashboard, Trips</div>
              <div>* Safety Officer &rarr; Drivers, Compliance</div>
              <div>* Financial Analyst &rarr; Fuel & Expenses, Analytics</div>
            </div>
          </div>
        </div>

        {/* Dynamic Error Status Banner */}
        {errorState && (
          <div className="absolute right-8 top-8 max-w-xs p-4 border border-dashed border-danger/45 bg-danger/5 rounded-2xl flex items-start gap-3 animate-slide-in text-xs">
            <ShieldAlert className="text-danger flex-shrink-0" size={16} />
            <div className="space-y-1">
              <p className="font-bold text-danger">Error state</p>
              <p className="text-slate-400 font-medium">{errorState}. Please check credentials.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
