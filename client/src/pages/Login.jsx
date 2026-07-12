import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice.js';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const [showDemoCredentials, setShowDemoCredentials] = useState(true);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      const response = await axios.post('/api/v1/auth/login', data);
      dispatch(loginSuccess(response.data));
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      dispatch(loginFailure(msg));
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* Left Side - Light Info Area */}
      <div className="hidden lg:flex w-1/2 bg-[#e4e4e7] p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded border-2 border-primary flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary opacity-20"></div>
              <div className="absolute top-1 left-1 w-2 h-2 bg-primary"></div>
              <div className="absolute bottom-1 right-1 w-2 h-2 bg-primary"></div>
              <div className="absolute top-1 right-1 w-1 h-1 bg-primary"></div>
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-primary"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-2xl text-slate-800 leading-tight tracking-tight">
                TransitOps
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            Smart Transport Operations Platform
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Available Test Roles:</h3>
          <ul className="space-y-3">
            <li 
              onClick={() => { setValue('email', 'manager@transitops.com'); setValue('password', 'password123'); }}
              className="flex items-center gap-3 text-sm text-slate-700 font-medium cursor-pointer hover:text-primary transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
              Fleet Manager
            </li>
            <li 
              onClick={() => { setValue('email', 'dispatcher@transitops.com'); setValue('password', 'password123'); }}
              className="flex items-center gap-3 text-sm text-slate-700 font-medium cursor-pointer hover:text-primary transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
              Dispatcher
            </li>
            <li 
              onClick={() => { setValue('email', 'admin@transitops.com'); setValue('password', 'password123'); }}
              className="flex items-center gap-3 text-sm text-slate-700 font-medium cursor-pointer hover:text-primary transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
              Safety Officer
            </li>
            <li 
              onClick={() => { setValue('email', 'finance@transitops.com'); setValue('password', 'password123'); }}
              className="flex items-center gap-3 text-sm text-slate-700 font-medium cursor-pointer hover:text-primary transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
              Financial Analyst
            </li>
          </ul>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} TransitOps. All rights reserved.
        </div>
      </div>

      {/* Right Side - Dark Login Form */}
      <div className="w-full lg:w-1/2 bg-brandbg-dark flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Sign in to your account</h2>
            <p className="text-sm text-zinc-400">Enter your credentials to access the platform</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  {...register('email', { required: 'Email is required' })}
                  placeholder="name@company.com" 
                  className={`w-full px-4 py-3 border rounded-lg bg-zinc-900/50 text-white text-sm focus-ring-primary placeholder-zinc-600 ${errors.email ? 'border-danger focus:border-danger' : 'border-zinc-800'}`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-danger mt-1 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••" 
                  className={`w-full px-4 py-3 border rounded-lg bg-zinc-900/50 text-white text-sm focus-ring-primary placeholder-zinc-600 ${errors.password ? 'border-danger focus:border-danger' : 'border-zinc-800'}`}
                />
              </div>
              {errors.password && <p className="text-[11px] text-danger mt-1 font-medium">{errors.password.message}</p>}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-primary focus:ring-offset-brandbg-dark" />
                <span className="text-xs text-zinc-400 font-medium">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-light transition-colors font-semibold">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Seed accounts assistance card */}
          {showDemoCredentials && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-10 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50"
            >
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-zinc-300">
                <Sparkles size={14} className="text-primary" />
                <span>Demo Workspace Information</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3 font-medium">All role passwords are <code className="font-mono text-primary font-bold">password123</code></p>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500">
                <div><span className="font-semibold text-zinc-300">Admin:</span> admin@transitops.com</div>
                <div><span className="font-semibold text-zinc-300">Dispatcher:</span> dispatcher@...</div>
                <div><span className="font-semibold text-zinc-300">Fleet Mgr:</span> manager@...</div>
                <div><span className="font-semibold text-zinc-300">Fin Analyst:</span> finance@...</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
