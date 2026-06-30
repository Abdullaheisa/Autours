'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { User, Mail, Globe, Phone, Lock, ArrowRight, X, Loader2, Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import SectionDivider from '@/components/sections/SectionDivider';
import { worldCountries } from '@/data/worldCountries';
import { AppDispatch, RootState } from '@/store';
import { registerThunk } from '@/store/slices/authSlice';
import { getPostLoginPath } from '@/utils/auth';

interface RegistrationLayoutProps {
  supplierMode: boolean;
  leftContent: React.ReactNode;
  formTitle: string;
  loginLinkText: string;
}

export default function RegistrationLayout({
  supplierMode,
  leftContent,
  formTitle,
  loginLinkText
}: RegistrationLayoutProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [phoneCode, setPhoneCode] = useState('+20');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const countryName = worldCountries.find((c) => c.iso === country)?.name || country;
    const result = await dispatch(
      registerThunk({
        fullName,
        email,
        password,
        phone: `${phoneCode}${phone}`,
        country: countryName,
        supplier: supplierMode ? 1 : 0,
      })
    );

    if (registerThunk.fulfilled.match(result)) {
      const payload = result.payload as unknown as { user?: { role: string } };

      if (payload.user && payload.user.role) {
        router.replace(getPostLoginPath(payload.user.role));
      } else {
        router.replace('/login');
      }
    }
  };

  return (
    <div className="flex flex-col bg-white" dir="ltr">
      <Navbar />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-supplier-scroll::-webkit-scrollbar {
          width: 14px;
        }
        .custom-supplier-scroll::-webkit-scrollbar-track {
          background: #ffffff;
          border-radius: 99px;
          border: 4px solid var(--primary);
        }
        .custom-supplier-scroll::-webkit-scrollbar-thumb {
          background: #a1a1aa;
          border-radius: 99px;
          border: 4px solid #ffffff;
        }
        .custom-supplier-scroll::-webkit-scrollbar-thumb:hover {
          background: #71717a;
        }
      `}} />

      <section className="flex flex-col lg:flex-row lg:h-[calc(100vh-56px)] lg:overflow-hidden">
        {/* ── LEFT: Text Section (Yellow) ── */}
        <div className="w-full lg:w-1/2 lg:h-full bg-[var(--primary)] overflow-y-auto order-2 lg:order-1 p-8 sm:p-10 lg:p-14 custom-supplier-scroll">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Desktop View: Full Text */}
            <div
              className="hidden lg:block text-gray-900 text-[16.5px] font-bold leading-relaxed space-y-8 max-w-xl mx-auto lg:mx-0"
              style={{ fontFamily: 'var(--font-family)' }}
            >
              {leftContent}
            </div>

            {/* Mobile View: Truncated Text + Read More */}
            <div className="lg:hidden text-gray-900 text-base font-bold leading-relaxed max-w-xl mx-auto space-y-4" style={{ fontFamily: 'var(--font-family)' }}>
              <div className="relative h-32 overflow-hidden">
                <div className="space-y-6">
                  {leftContent}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--primary)] to-transparent" />
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-gray-900 font-black uppercase tracking-widest text-sm underline underline-offset-4"
              >
                Read More
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT: Form Section (White Background) ── */}
        <div className="w-full lg:w-1/2 lg:h-full bg-white flex items-start lg:items-center justify-center lg:overflow-hidden order-1 lg:order-2 p-4 sm:p-6 lg:p-10 pt-6 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-white rounded-[2rem] p-6 sm:p-7 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100"
          >
            <h2
              className="text-2xl font-black text-gray-900 mb-5 tracking-tight uppercase"
              style={{ fontFamily: 'var(--title-font)' }}
            >
              {formTitle}
            </h2>

            <form className="space-y-2.5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 text-sm font-bold outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail address"
                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 text-sm font-bold outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <select
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 text-sm font-bold outline-none focus:border-[var(--primary)] focus:bg-white transition-all appearance-none text-gray-700"
                >
                  <option value="">Your Country</option>
                  {worldCountries.map((c) => (
                    <option key={c.iso} value={c.iso}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2.5">
                <select
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  className="w-24 h-11 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-center outline-none focus:border-[var(--primary)] transition-all appearance-none"
                >
                  {worldCountries.map((c) => (
                    <option key={c.iso} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 text-sm font-bold outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-10 text-sm font-bold outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[var(--primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-600 font-bold text-center px-1">{error}</p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[var(--primary)] hover:brightness-105 disabled:opacity-60 text-gray-900 font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] group text-sm uppercase tracking-widest shadow-sm border-2 border-transparent"
                  style={{ fontFamily: 'var(--title-font)' }}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Register Now
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-0.5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-black text-gray-400 hover:text-gray-700 transition-colors uppercase tracking-widest group"
                >
                  {loginLinkText}
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Mobile Modal for Read More */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[85vh] relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900"
              >
                <X size={20} />
              </button>
              
              <div 
                className="text-gray-900 text-base font-bold leading-relaxed space-y-6 pr-4 pt-4"
                style={{ fontFamily: 'var(--font-family)' }}
              >
                {leftContent}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SectionDivider />
      <Footer />
    </div>
  );
}
