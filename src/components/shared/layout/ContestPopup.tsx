'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { registerContestUser, fetchContestSettings } from '@/store/slices/contestSlice';
import { features } from '@/config/features';
import { X, Gift, User, Phone, Mail, Globe, Sparkles } from 'lucide-react';
import { countries } from '@/lib/data';

export default function ContestPopup() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  
  const contestState = useSelector((state: RootState) => state.contest);
  const enabled = contestState?.enabled ?? true;
  const campaignVersion = contestState?.campaignVersion ?? 1;
  const forceInteraction = contestState?.forceInteraction ?? false;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch(fetchContestSettings());
  }, [dispatch]);

  useEffect(() => {
    if (!mounted) return;

    // 1. If explicitly disabled in state, it MUST NEVER show
    if (!enabled) {
      setIsVisible(false);
      return;
    }

    // 2. Path and feature check
    if (!features.contestPopup || pathname !== '/') {
      setIsVisible(false);
      return;
    }

    // 3. Version logic check
    const registeredVersion = localStorage.getItem('contest_registered_version');
    if (!registeredVersion || registeredVersion !== String(campaignVersion)) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [mounted, enabled, campaignVersion, pathname]);

  // Lock scroll while the gate is visible
  useEffect(() => {
    const shouldLock = mounted && isVisible;
    document.body.style.overflow = shouldLock ? 'hidden' : '';
    if (shouldLock) {
      document.body.style.height = '100vh';
    } else {
      document.body.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [mounted, isVisible]);

  const handleClose = () => {
    if (forceInteraction) return; // cannot close if forced
    setIsVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) return;
    
    setLoading(true);
    
    const action = await dispatch(registerContestUser({ name, phone, email, country }));
    if (registerContestUser.fulfilled.match(action)) {
      localStorage.setItem('contest_registered_version', String(campaignVersion));
      setLoading(false);
      setIsVisible(false);
    } else {
      setLoading(false);
      // Optional error handling
    }
  };

  if (!mounted || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto transition-all duration-500">
      <div 
        className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-8 relative overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-500"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.05)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-[3rem] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-amber-500/10 rounded-full blur-[3rem] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-amber-500 to-primary" />

        {/* Close button */}
        {!forceInteraction && (
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all active:scale-95 z-10"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Gift className="w-8 h-8 text-primary" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight font-title mb-2 flex items-center justify-center gap-2">
            Win Exclusive Rewards <Sparkles className="w-5 h-5 text-amber-500" />
          </h2>
          <p className="text-sm text-gray-500 font-medium px-4">
            Register now for a chance to win premium travel rewards and exclusive car rental upgrades for your next journey!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text" required value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-11 pr-4 py-3.5 text-sm bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="tel" required value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 890"
                  className="w-full pl-11 pr-4 py-3.5 text-sm bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 text-sm bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pb-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Country (Optional)</label>
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 text-sm bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-gray-800 appearance-none"
              >
                <option value="">Select your country</option>
                {countries.map(c => (
                  <option key={c.id} value={c.nameEn}>{c.flag} {c.nameEn}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-primary text-gray-900 hover:bg-primary-600 font-black py-4 rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-70 mt-4 group"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                Register to Win
                <Gift className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
