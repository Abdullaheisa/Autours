'use client';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setCurrency, fetchExchangeRates } from '@/store/slices/currencySlice';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: 'us' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: 'eu' },
  { code: 'GBP', symbol: '£', name: 'Pound Sterling', flag: 'gb' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: 'ae' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', flag: 'sa' },
  { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', flag: 'qa' },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial', flag: 'om' },
  { code: 'KWD', symbol: 'KWD', name: 'Kuwaiti Dinar', flag: 'kw' },
  { code: 'BHD', symbol: 'BHD', name: 'Bahraini Dinar', flag: 'bh' },
  { code: 'EGP', symbol: 'EGP', name: 'Egyptian Pound', flag: 'eg' },
  { code: 'JOD', symbol: 'JOD', name: 'Jordanian Dinar', flag: 'jo' },
];

interface CurrencySelectorProps {
  variant?: 'desktop' | 'mobile' | 'mobile-dropdown';
  onMobileClose?: () => void;
}

export default function CurrencySelector({ 
  variant = 'desktop',
  onMobileClose 
}: CurrencySelectorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { code: currentCode } = useSelector((state: RootState) => state.currency);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fix hydration mismatch by only showing dynamic data after mount
  useEffect(() => {
    setMounted(true);
    dispatch(fetchExchangeRates(false));
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCurrencySelect = (currencyCode: any) => {
    dispatch(setCurrency(currencyCode));
    setIsOpen(false);
    if (onMobileClose) onMobileClose();
  };

  // Base currency for initial server render to match Redux initialState
  const displayCode = mounted ? currentCode : 'AED';
  const currentCurrency = currencies.find(c => c.code === displayCode) || currencies[0];

  if (variant === 'mobile-dropdown') {
    return (
      <MobileDropdownCurrency 
        currentCode={mounted ? currentCode : 'AED'}
        onSelect={handleCurrencySelect}
        mounted={mounted}
      />
    );
  }

  if (variant === 'mobile') {
    return (
      <div className="space-y-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Currency</p>
        <div className="grid grid-cols-2 gap-2">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => handleCurrencySelect(curr.code as any)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                mounted && currentCode === curr.code
                  ? 'border-primary bg-primary/5 text-gray-900'
                  : 'border-gray-100 text-gray-500 hover:border-gray-200'
              }`}
            >
              <img 
                src={`https://flagcdn.com/w40/${curr.flag}.png`} 
                alt={curr.code}
                className="w-5 h-auto rounded-sm shadow-sm"
              />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-xs font-black truncate w-full">{curr.code}</span>
                <span className="text-[9px] font-bold opacity-60">{curr.symbol}</span>
              </div>
              {mounted && currentCode === curr.code && <Check size={14} className="text-primary ml-auto shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200 shadow-sm group min-w-[100px] justify-between"
      >
        <div className="flex items-center gap-2">
          <img 
            src={`https://flagcdn.com/w40/${currentCurrency.flag}.png`} 
            alt={currentCurrency.code}
            className="w-5 h-auto rounded-sm"
          />
          <span className="text-xs font-black text-gray-900 tracking-tight">{currentCurrency.code}</span>
        </div>
        <ChevronDown 
          size={14} 
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100] overflow-hidden"
          >
            <div className="px-3 pb-2 mb-2 border-b border-gray-50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Choose Currency</span>
            </div>
            
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleCurrencySelect(curr.code as any)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors group ${
                    mounted && currentCode === curr.code ? 'bg-primary/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-6 flex items-center justify-center overflow-hidden rounded shadow-sm border border-gray-100">
                      <img 
                        src={`https://flagcdn.com/w40/${curr.flag}.png`} 
                        alt={curr.code}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className={`text-xs font-black ${mounted && currentCode === curr.code ? 'text-gray-900' : 'text-gray-600'}`}>{curr.code}</span>
                      <span className="text-[10px] font-bold text-gray-400">{curr.name}</span>
                    </div>
                  </div>
                  {mounted && currentCode === curr.code && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check size={10} className="text-gray-900" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );


// ========== Mobile Dropdown Currency Component ==========
function MobileDropdownCurrency({ 
  currentCode, 
  onSelect, 
  mounted 
}: { 
  currentCode: string; 
  onSelect: (code: string) => void;
  mounted: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentCurrency = currencies.find(c => c.code === currentCode) || currencies[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2.5 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <img 
            src={`https://flagcdn.com/w40/${currentCurrency.flag}.png`} 
            alt={currentCurrency.code}
            className="w-6 h-auto rounded-sm"
          />
          <div className="flex flex-col items-start">
            <span className="text-sm font-black text-gray-900">{currentCurrency.code}</span>
            <span className="text-xs font-bold text-gray-400">{currentCurrency.name}</span>
          </div>
        </div>
        <ChevronDown 
          size={18} 
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[9999] overflow-hidden max-w-md mx-auto"
          >
            <div className="px-3 pb-2 mb-2 border-b border-gray-50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Choose Currency</span>
            </div>

            <div className="max-h-[280px] overflow-y-auto scrollbar-mobile">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    onSelect(curr.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-colors group ${
                    mounted && currentCode === curr.code ? 'bg-primary/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-6 flex items-center justify-center overflow-hidden rounded shadow-sm border border-gray-100">
                      <img 
                        src={`https://flagcdn.com/w40/${curr.flag}.png`} 
                        alt={curr.code}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className={`text-sm font-black ${mounted && currentCode === curr.code ? 'text-gray-900' : 'text-gray-600'}`}>{curr.code}</span>
                      <span className="text-xs font-bold text-gray-400">{curr.name}</span>
                    </div>
                  </div>
                  {mounted && currentCode === curr.code && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check size={10} className="text-gray-900" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
}