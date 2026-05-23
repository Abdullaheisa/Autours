import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toggleMobileMenu } from '@/store/slices/uiSlice';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import CurrencySelector from './layout/CurrencySelector';

export default function LandingNavbar() {
  const dispatch = useDispatch();
  const { currentLanguage, isMobileMenuOpen } = useSelector((state: RootState) => state.ui);
  const isRTL = currentLanguage === 'ar';

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-start gap-0">
            <span className="text-2xl font-black text-gray-900 tracking-tighter leading-none">AUTOURS</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Explore By Your Own!</span>
          </Link>

          {/* Desktop Navigation - Removed Links */}
          <div className="hidden lg:flex items-center gap-10">
            {/* Navigation links removed as per request */}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <CurrencySelector />
            <Link 
              href="/login" 
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-gray-900 text-sm font-bold rounded-full transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <LayoutDashboard size={18} />
              <span>Manage</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <button 
              onClick={() => dispatch(toggleMobileMenu())}
              className="p-2 text-gray-700"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 pb-8 px-4 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="py-4">
            <CurrencySelector variant="mobile" onMobileClose={() => dispatch(toggleMobileMenu())} />
          </div>
          <div className="pt-4 flex flex-col gap-4">
            <Link 
              href="/login" 
              onClick={() => dispatch(toggleMobileMenu())}
              className="w-full py-4 flex items-center justify-center gap-2 font-bold text-gray-900 bg-primary rounded-2xl shadow-lg shadow-primary/20"
            >
              <LayoutDashboard size={20} />
              Manage
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

