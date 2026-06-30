'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '@/services/api';
import Link from 'next/link';
import { Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';

function NewPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const key = searchParams.get('key');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const validateKey = async () => {
      if (!key) {
        setIsValidating(false);
        setIsValid(false);
        return;
      }
      try {
        const formData = new FormData();
        formData.append('key', key);
        
        const res: any = await authApi.validateResetKey(formData);
        if (res.status === true || res.status === 'true') {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch (e) {
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };
    validateKey();
  }, [key]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!key) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('newPassword', newPassword);
      formData.append('confirmPassword', confirmPassword);
      formData.append('key', key);
      
      const res: any = await authApi.saveNewPassword(formData);
      if (res.status === true || res.status === 'true') {
        setIsSuccess(true);
        toast.success('Password has been reset successfully!');
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      } else {
        toast.error(res.message || 'Failed to reset password');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="mt-4 text-gray-500 font-bold">Validating reset link...</p>
      </div>
    );
  }

  if (!isValid && !isSuccess) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Invalid or Expired Link</h2>
        <p className="text-gray-500 mb-8">This password reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="text-primary hover:underline font-bold">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-4">Password Reset Successful!</h2>
        <p className="text-sm font-bold text-gray-500 leading-relaxed mb-8">
          Your password has been changed successfully. Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">New Password</h1>
        <p className="text-sm font-bold text-gray-500">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-700 uppercase tracking-widest ml-1">New Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={8}
              className="w-full h-14 bg-gray-50 border-2 border-gray-50 rounded-2xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-700 uppercase tracking-widest ml-1">Confirm New Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={8}
              className="w-full h-14 bg-gray-50 border-2 border-gray-50 rounded-2xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-primary transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-primary hover:bg-primary-hover text-gray-900 font-black rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : 'RESET PASSWORD'}
        </button>
      </form>
    </>
  );
}

export default function NewPasswordFormPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-20">
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 sm:p-12 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
          
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <Loader2 size={40} className="animate-spin text-primary" />
              <p className="mt-4 text-gray-500 font-bold">Loading...</p>
            </div>
          }>
            <NewPasswordContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
