'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { loginThunk } from '@/store/slices/authSlice';
import { AppDispatch, RootState } from '@/store';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowRight, Car } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginThunk({ email, password }));

    if (loginThunk.fulfilled.match(result)) {
      const user = result.payload.user;
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/company');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex flex-col items-center gap-2 mb-6 group">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Car size={24} className="text-gray-900" />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tighter">AUTOURS</span>
        </Link>
        <h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Manage your fleet and bookings efficiently
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-[2rem] sm:px-10 border border-gray-100"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 text-gray-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  placeholder="admin@autours.net"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 text-gray-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs text-red-600 font-bold text-center">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-gray-500">
                  Remember me
                </label>
              </div>

              <div className="text-xs">
                <Link href="/forgot-password" className="font-bold text-primary hover:text-primary-600">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-primary hover:bg-primary-600 disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 text-sm font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                <span className="px-4 bg-white text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className="w-full inline-flex justify-center py-4 px-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Create new account
              </Link>
            </div>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-xs text-gray-400 font-medium">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
