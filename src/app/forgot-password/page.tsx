'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetPasswordThunk } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await dispatch(resetPasswordThunk(email));
    setLoading(false);
    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-20">
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 sm:p-12 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
          
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>

          {!isSent ? (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-gray-900 mb-2">Reset Password</h1>
                <p className="text-sm font-bold text-gray-500">Enter your email to receive a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      className="w-full h-14 bg-gray-50 border-2 border-gray-50 rounded-2xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-primary hover:bg-primary-hover text-gray-900 font-black rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'SEND RESET LINK'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">Email Sent!</h2>
              <p className="text-sm font-bold text-gray-500 leading-relaxed mb-8">
                If an account exists for <span className="text-gray-900">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <button 
                onClick={() => setIsSent(false)}
                className="text-sm font-black text-primary hover:underline"
              >
                Try another email
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
