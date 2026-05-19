'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { toggleMobileMenu } from '@/store/slices/uiSlice';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { assets } from '@/config/assets';
import CurrencySelector from './CurrencySelector';

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const { isMobileMenuOpen } = useSelector((state: RootState) => state.ui);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Guard against SSR/client hydration mismatch:
  // Both server and first client render must agree on href="/login".
  // After mount, the client updates to the correct role-based route.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const getManageHref = () => {
    if (!mounted || !isAuthenticated) return '/login';
    return user?.role === 'admin' ? '/admin' : '/company';
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.07, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -10 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[var(--primary)] border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center group transition-transform active:scale-95 shrink-0">
            <img
              src={assets.logo}
              alt={siteConfig.name}
              className="h-12 sm:h-10 md:h-12 w-auto object-contain transition-all"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Links removed as per request */}
          </div>

          {/* Right side Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">

              {/* Manage Booking Button */}
              <Link
                href={getManageHref()}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-900 border-2 border-white hover:bg-gray-50 font-bold text-xs rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95"
              >
                <LayoutDashboard size={14} />
                <span>Manage Booking</span>
              </Link>

              {/* Currency Selector */}
              <div className="scale-[0.95]">
                <CurrencySelector />
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="lg:hidden p-2 bg-black/10 text-gray-900 rounded-xl transition-all active:scale-90"
            >
              <motion.div animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}>
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="lg:hidden absolute top-full left-0 right-0 bg-[var(--primary)] border-b border-black/10 p-4 space-y-4 shadow-2xl z-40"
          >
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <CurrencySelector variant="mobile-dropdown" onMobileClose={() => dispatch(toggleMobileMenu())} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                href={getManageHref()}
                onClick={() => dispatch(toggleMobileMenu())}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-gray-900 bg-white border-2 border-white rounded-xl shadow-sm active:scale-95 transition-all"
              >
                <LayoutDashboard size={16} />
                Manage Booking
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}