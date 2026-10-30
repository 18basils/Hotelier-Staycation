import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginSchema, registerSchema } from '../schemas/authSchemas';
import { X, Lock, User, Mail, ShieldAlert, Sparkles, Key } from 'lucide-react';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authModalMode, setAuthModalMode, login, register } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear all input fields and error state whenever the modal opens or switches modes
  useEffect(() => {
    if (authModalOpen) {
      resetFields();
    }
  }, [authModalOpen, authModalMode]);

  const resetFields = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setFullName('');
    setError('');
  };

  const handleClose = () => {
    resetFields();
    setAuthModalOpen(false);
  };

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        const parsed = loginSchema.safeParse({ username, password });
        if (!parsed.success) {
          setError(parsed.error.errors?.[0]?.message || 'Invalid login details');
          setLoading(false);
          return;
        }
        await login(username, password);
      } else {
        const parsed = registerSchema.safeParse({ username, password, email, fullName });
        if (!parsed.success) {
          setError(parsed.error.errors?.[0]?.message || 'Invalid registration details');
          setLoading(false);
          return;
        }
        await register(username, password, email, fullName);
      }
      resetFields();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoUser, demoPass) => {
    setError('');
    setLoading(true);
    try {
      await login(demoUser, demoPass);
      resetFields();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {authModalMode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {authModalMode === 'login'
                ? 'Sign in to manage bookings and reserve rooms'
                : 'Join Hotelier to book handpicked stays'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Demo Login Helper */}
        {authModalMode === 'login' && (
          <div className="px-6 pt-4 pb-3 bg-emerald-50/60 dark:bg-emerald-950/30 border-b border-emerald-100/60 dark:border-emerald-900/40">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Instant Demo Guest Access:</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">No signup required</span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickLogin('user', 'user123')}
              className="w-full py-2 px-3 text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 rounded-xl hover:bg-emerald-100/60 dark:hover:bg-slate-700/60 transition-colors shadow-xs flex items-center justify-between"
            >
              <span>👤 Continue as Guest</span>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800">
                user / user123
              </span>
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                autoComplete="off"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  autoComplete="off"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : authModalMode === 'login' ? (
              <>
                <Key size={16} />
                <span>Sign In</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center">
          {authModalMode === 'login' ? (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setAuthModalMode('register');
                }}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setAuthModalMode('login');
                }}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
