'use client';

import Link from 'next/link';
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

  const getManageHref = () => {
    if (!isAuthenticated) return "/login";
    return user?.role === 'admin' ? "/admin" : "/company-dashboard";
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -10 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo - Large */}
          <Link href="/" className="flex items-center group transition-transform active:scale-95 shrink-0">
            <img
              src={assets.logo}
              alt={siteConfig.name}
              className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto object-contain transition-all"
            />
          </Link>

          {/* Desktop Navigation - Removed links */}
          <div className="hidden md:flex items-center gap-8">
            {/* Links removed as per request */}
          </div>

          {/* Right side Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              {/* Manage Button - Bigger */}
              <Link
                href={getManageHref()}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-gray-900 border-2 border-primary hover:bg-white font-bold text-xs rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95"
              >
                <LayoutDashboard size={14} />
                <span>Manage</span>
              </Link>

              {/* Currency Selector - Small, no flag, code only */}
              <div className="scale-[0.85] origin-right">
                <CurrencySelector />
              </div>
            </div>

            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="lg:hidden p-2 bg-gray-50 text-gray-900 rounded-xl transition-all active:scale-90"
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
            className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-4 space-y-4 shadow-2xl z-40 overflow-hidden"
          >
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <CurrencySelector variant="mobile" onMobileClose={() => dispatch(toggleMobileMenu())} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                href={getManageHref()}
                onClick={() => dispatch(toggleMobileMenu())}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-gray-900 bg-primary border-2 border-primary rounded-xl shadow-sm active:scale-95 transition-all"
              >
                <LayoutDashboard size={16} />
                Manage
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}