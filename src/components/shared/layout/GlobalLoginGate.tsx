'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { loginThunk, clearError } from '@/store/slices/authSlice';
import { features } from '@/config/features';
import { Mail, Lock, AlertCircle, RefreshCw, KeyRound, X, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function GlobalLoginGate() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // `dismissed` resets on every page load (component state, NOT localStorage)
  // so the popup re-appears on every refresh of the homepage.
  const [dismissed, setDismissed] = useState(false);
  // Prevent SSR hydration flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Lock scroll while the gate is visible
  useEffect(() => {
    const shouldLock = mounted && shouldShow;
    document.body.style.overflow = shouldLock ? 'hidden' : '';
    document.body.style.height  = shouldLock ? '100vh'  : '';
    return () => {
      document.body.style.overflow = '';
      document.body.style.height   = '';
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginThunk({ email, password })).then((result: any) => {
      if (result.meta.requestStatus === 'fulfilled') setDismissed(true);
    });
  };

  const handleQuickLogin = (role: 'admin' | 'supplier') => {
    dispatch(clearError());
    const credentials = {
      email:    role === 'admin' ? 'admin@autours.net' : 'supplier@autours.net',
      password: 'password',
    };
    setEmail(credentials.email);
    setPassword(credentials.password);
    dispatch(loginThunk(credentials)).then((result: any) => {
      if (result.meta.requestStatus === 'fulfilled') setDismissed(true);
    });
  };

  // ── Visibility rules ──────────────────────────────────────────────────────
  // 1. Feature flag must be ON
  // 2. Must be on the homepage only (pathname === '/')
  // 3. Must not have been dismissed this session
  const shouldShow =
    mounted &&
    !!features.loginGate &&
    pathname === '/' &&
    !dismissed;

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 relative overflow-hidden my-auto">

        {/* Accent glows */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all active:scale-90"
          aria-label="Skip login"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20 rotate-3">
            <span className="text-xl font-black text-black tracking-tighter">A</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight font-title">
            Welcome to Autours
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Sign in to manage your bookings and access your dashboard.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs font-semibold text-red-700">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-gray-800"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-gray-800"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="btn-primary w-full bg-primary text-black font-black py-3.5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-5 flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-500 font-medium">Don't have an account?</span>
          <Link
            href="/register"
            onClick={() => setDismissed(true)}
            className="font-black text-gray-900 hover:text-primary transition-colors flex items-center gap-1"
          >
            <UserPlus size={14} />
            Register
          </Link>
        </div>

        {/* Skip link */}
        <div className="mt-3 text-center">
          <button
            onClick={() => setDismissed(true)}
            className="text-xs text-gray-400 hover:text-gray-600 font-semibold transition-colors underline underline-offset-2"
          >
            Continue as Guest
          </button>
        </div>

        {/* Dev Quick Login */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-1.5 justify-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            <KeyRound size={13} />
            <span>Developer Quick Login</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button" onClick={() => handleQuickLogin('admin')} disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 text-xs font-bold text-gray-700 transition-all active:scale-95 disabled:opacity-40"
            >
              Admin Dashboard
            </button>
            <button
              type="button" onClick={() => handleQuickLogin('supplier')} disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 text-xs font-bold text-gray-700 transition-all active:scale-95 disabled:opacity-40"
            >
              Supplier Hub
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
