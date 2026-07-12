import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice.js';
import ImageCarousel from '../components/ImageCarousel.jsx';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const [errorState, setErrorState] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const handleRoleChange = (e) => {
    const role = e.target.value;
    if (role) {
      setValue('email', 'transitops@common.com');
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
      {/* LEFT PANEL: Carousel */}
      <div className="w-full md:w-5/12 min-h-[40vh] md:min-h-screen relative">
        <ImageCarousel />
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
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
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
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
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
                {...register('role')}
                onChange={(e) => {
                  register('role').onChange(e);
                  handleRoleChange(e);
                }}
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

          {/* Link to Register */}
          <div className="text-center font-medium">
            <p className="text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Sign Up
              </Link>
            </p>
          </div>

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
