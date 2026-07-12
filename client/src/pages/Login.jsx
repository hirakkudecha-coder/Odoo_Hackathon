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

  const { register, handleSubmit, formState: { errors } } = useForm();

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brandbg-light dark:bg-brandbg-dark px-4 py-12">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-panel rounded-3xl p-8 shadow-premium">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-2xl shadow-premium mb-3">
              TO
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome to TransitOps</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Smart Transport Operations Platform</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input 
                  type="email" 
                  {...register('email', { required: 'Email is required' })}
                  placeholder="name@company.com" 
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.email ? 'border-danger focus:border-danger' : 'border-slate-200 dark:border-slate-800 focus:border-primary'}`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-danger mt-1 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-semibold">Forgot?</Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <input 
                  type="password" 
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••" 
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.password ? 'border-danger focus:border-danger' : 'border-slate-200 dark:border-slate-800 focus:border-primary'}`}
                />
              </div>
              {errors.password && <p className="text-[11px] text-danger mt-1 font-medium">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-premium disabled:opacity-50 transition-all cursor-pointer"
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

          {/* Seed accounts assistance card */}
          {showDemoCredentials && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 p-4 rounded-2xl bg-primary-light/30 dark:bg-primary-dark/20 border border-primary/10"
            >
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-primary">
                <Sparkles size={14} />
                <span>Demo Workspace Credentials</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2 font-medium">All role passwords are <code className="font-mono text-primary font-bold">password123</code></p>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div><span className="font-semibold">Admin:</span> <span className="font-mono">admin@transitops.com</span></div>
                <div><span className="font-semibold">Dispatcher:</span> <span className="font-mono">dispatcher@transitops.com</span></div>
                <div><span className="font-semibold">Fleet Mgr:</span> <span className="font-mono">manager@transitops.com</span></div>
                <div><span className="font-semibold">Fin Analyst:</span> <span className="font-mono">finance@transitops.com</span></div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
