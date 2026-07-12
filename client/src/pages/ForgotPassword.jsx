import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [mockToken, setMockToken] = useState('');
  
  const { register: registerForgot, handleSubmit: handleForgotSubmit } = useForm();
  const { register: registerReset, handleSubmit: handleResetSubmit } = useForm();

  const onForgotSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/auth/forgot-password', data);
      setResetSent(true);
      setMockToken(response.data.resetToken || 'RESET_TOKEN_MOCK_12345');
      toast.success('Reset guidelines issued!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post('/api/v1/auth/reset-password', {
        token: data.token,
        password: data.password
      });
      toast.success('Password updated! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brandbg-light dark:bg-brandbg-dark px-4 py-12">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-panel rounded-3xl p-8 shadow-premium">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-2xl shadow-premium mb-3">
              TO
            </div>
            <h2 className="text-xl font-bold tracking-tight">Reset Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">TransitOps Security Vault</p>
          </div>

          {!resetSent ? (
            <form onSubmit={handleForgotSubmit(onForgotSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Registered Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input 
                    type="email" 
                    required
                    {...registerForgot('email')}
                    placeholder="name@company.com" 
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-premium disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={16} /> Send Reset Link</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-5">
              <div className="p-3 bg-warning-light/30 border border-warning/10 rounded-2xl text-[11px] text-warning font-semibold">
                Copy mock token: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 font-bold">{mockToken}</code>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Reset Token</label>
                <input 
                  type="text" 
                  required
                  {...registerReset('token')}
                  placeholder="Paste token here" 
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                <input 
                  type="password" 
                  required
                  {...registerReset('password')}
                  placeholder="Min 6 characters" 
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-premium disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><KeyRound size={16} /> Update Password</>}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-center">
            <Link to="/login" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
