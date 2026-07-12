import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice.js';
import ImageCarousel from '../components/ImageCarousel.jsx';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorState(null);
    dispatch(loginStart());
    try {
      const response = await axios.post('/api/v1/auth/register', data);
      dispatch(loginSuccess(response.data));
      toast.success('Registered & Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      dispatch(loginFailure(msg));
      setErrorState(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080B10]">
      {/* LEFT PANEL: Carousel */}
      <div className="w-full md:w-5/12 min-h-[40vh] md:min-h-screen relative">
        <ImageCarousel />
      </div>

      {/* RIGHT PANEL: Registration Form */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-8 md:p-16 relative">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Create your account</h2>
            <p className="text-xs text-slate-400">Sign up to get started with TransitOps</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            {/* Name Field */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User size={14} />
                </span>
                <input 
                  type="text" 
                  {...register('name', { required: 'Name is required' })}
                  placeholder="John Doe" 
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl bg-slate-900/60 border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-primary/55 ${errors.name ? 'border-danger' : 'focus:border-primary'}`}
                />
              </div>
              {errors.name && <p className="text-[10px] text-danger mt-1">{errors.name.message}</p>}
            </div>

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
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                  placeholder="••••••••" 
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl bg-slate-900/60 border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-primary/55 ${errors.password ? 'border-danger' : 'focus:border-primary'}`}
                />
              </div>
              {errors.password && <p className="text-[10px] text-danger mt-1">{errors.password.message}</p>}
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Role (RBAC)</label>
              <select 
                {...register('role', { required: 'Role is required' })}
                className={`w-full px-3.5 py-2.5 border rounded-xl bg-slate-900/60 border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-primary/55 ${errors.role ? 'border-danger' : 'focus:border-primary'}`}
              >
                <option value="">Select a role...</option>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
              </select>
              {errors.role && <p className="text-[10px] text-danger mt-1">{errors.role.message}</p>}
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
                  <UserPlus size={16} />
                  Register Account
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="text-center font-medium">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Dynamic Error Status Banner */}
        {errorState && (
          <div className="absolute right-8 top-8 max-w-xs p-4 border border-dashed border-danger/45 bg-danger/5 rounded-2xl flex items-start gap-3 animate-slide-in text-xs">
            <ShieldAlert className="text-danger flex-shrink-0" size={16} />
            <div className="space-y-1">
              <p className="font-bold text-danger">Registration Error</p>
              <p className="text-slate-400 font-medium">{errorState}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
