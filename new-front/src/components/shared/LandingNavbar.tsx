import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toggleMobileMenu } from '@/store/slices/uiSlice';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import CurrencySelector from './layout/CurrencySelector';

export default function LandingNavbar() {
  const dispatch = useDispatch();
  const { isMobileMenuOpen } = useSelector((state: RootState) => state.ui);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl xl:max-w-[90rem] 2xl:max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex flex-col items-start gap-0">
            <span className="text-2xl xl:text-[25px] 2xl:text-[27px] font-black text-gray-900 tracking-tighter leading-none transition-all">AUTOURS</span>
            <span className="text-[10px] xl:text-[10.5px] 2xl:text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none transition-all">Explore By Your Own!</span>
          </Link>

          {/* Desktop Navigation - Removed Links */}
          <div className="hidden lg:flex items-center gap-10">
            {/* Navigation links removed as per request */}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-10">
            <CurrencySelector 
              className="flex items-center gap-2.5 px-4 h-10 xl:h-[38px] 2xl:h-[40px] bg-white hover:bg-gray-50 rounded-full transition-all border border-gray-200 shadow-sm group min-w-[95px] xl:min-w-[105px] justify-between text-xs xl:text-xs 2xl:text-sm"
            />
            <Link 
              href="/login" 
              className="flex items-center gap-2 px-6 xl:px-7 h-10 xl:h-[38px] 2xl:h-[40px] bg-primary hover:bg-primary-hover text-gray-900 text-xs xl:text-xs 2xl:text-sm font-bold rounded-full transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <LayoutDashboard size={14} className="xl:size-[15px] 2xl:size-[16px]" />
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

