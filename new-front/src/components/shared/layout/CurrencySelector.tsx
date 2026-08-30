'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { RootState, AppDispatch } from '@/store';
import { setCurrency, fetchExchangeRates } from '@/store/slices/currencySlice';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, X, Globe, Sparkles } from 'lucide-react';

export interface CurrencyItem {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

// ── Top currencies (AUD, CAD, EUR, GBP, USD) ──────────────────────────────────
export const topCurrencies: CurrencyItem[] = [
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', flag: 'au' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: 'ca' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: 'eu' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: 'gb' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: 'us' },
];

// ── All currencies sorted alphabetically (A-Z) ──────────────────────────────────
export const currencies: CurrencyItem[] = [
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: 'ae' },
  { code: 'AFN', symbol: 'AFN', name: 'Afghan Afghani', flag: 'af' },
  { code: 'ALL', symbol: 'ALL', name: 'Albanian Lek', flag: 'al' },
  { code: 'AMD', symbol: 'AMD', name: 'Armenian Dram', flag: 'am' },
  { code: 'ARS', symbol: 'ARS', name: 'Argentine Peso', flag: 'ar' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', flag: 'au' },
  { code: 'AZN', symbol: 'AZN', name: 'Azerbaijani Manat', flag: 'az' },
  { code: 'BAM', symbol: 'BAM', name: 'Bosnian Mark', flag: 'ba' },
  { code: 'BGN', symbol: 'BGN', name: 'Bulgarian Lev', flag: 'bg' },
  { code: 'BHD', symbol: 'BHD', name: 'Bahraini Dinar', flag: 'bh' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: 'br' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: 'ca' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: 'ch' },
  { code: 'CLP', symbol: 'CLP', name: 'Chilean Peso', flag: 'cl' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: 'cn' },
  { code: 'COP', symbol: 'COP', name: 'Colombian Peso', flag: 'co' },
  { code: 'CZK', symbol: 'CZK', name: 'Czech Koruna', flag: 'cz' },
  { code: 'DKK', symbol: 'DKK', name: 'Danish Krone', flag: 'dk' },
  { code: 'DZD', symbol: 'DZD', name: 'Algerian Dinar', flag: 'dz' },
  { code: 'EGP', symbol: 'EGP', name: 'Egyptian Pound', flag: 'eg' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: 'eu' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: 'gb' },
  { code: 'GEL', symbol: 'GEL', name: 'Georgian Lari', flag: 'ge' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: 'hk' },
  { code: 'HUF', symbol: 'HUF', name: 'Hungarian Forint', flag: 'hu' },
  { code: 'IDR', symbol: 'IDR', name: 'Indonesian Rupiah', flag: 'id' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: 'in' },
  { code: 'IQD', symbol: 'IQD', name: 'Iraqi Dinar', flag: 'iq' },
  { code: 'JOD', symbol: 'JOD', name: 'Jordanian Dinar', flag: 'jo' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: 'jp' },
  { code: 'KES', symbol: 'KES', name: 'Kenyan Shilling', flag: 'ke' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: 'kr' },
  { code: 'KWD', symbol: 'KWD', name: 'Kuwaiti Dinar', flag: 'kw' },
  { code: 'LBP', symbol: 'LBP', name: 'Lebanese Pound', flag: 'lb' },
  { code: 'LYD', symbol: 'LYD', name: 'Libyan Dinar', flag: 'ly' },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham', flag: 'ma' },
  { code: 'MDL', symbol: 'MDL', name: 'Moldovan Leu', flag: 'md' },
  { code: 'MKD', symbol: 'MKD', name: 'Macedonian Denar', flag: 'mk' },
  { code: 'MRU', symbol: 'MRU', name: 'Mauritanian Ouguiya', flag: 'mr' },
  { code: 'MUR', symbol: 'MUR', name: 'Mauritian Rupee', flag: 'mu' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', flag: 'mx' },
  { code: 'MYR', symbol: 'MYR', name: 'Malaysian Ringgit', flag: 'my' },
  { code: 'NOK', symbol: 'NOK', name: 'Norwegian Krone', flag: 'no' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: 'nz' },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial', flag: 'om' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: 'ph' },
  { code: 'PKR', symbol: 'PKR', name: 'Pakistani Rupee', flag: 'pk' },
  { code: 'PLN', symbol: 'PLN', name: 'Polish Zloty', flag: 'pl' },
  { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', flag: 'qa' },
  { code: 'RON', symbol: 'RON', name: 'Romanian Leu', flag: 'ro' },
  { code: 'RSD', symbol: 'RSD', name: 'Serbian Dinar', flag: 'rs' },
  { code: 'RUB', symbol: 'RUB', name: 'Russian Ruble', flag: 'ru' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', flag: 'sa' },
  { code: 'SDG', symbol: 'SDG', name: 'Sudanese Pound', flag: 'sd' },
  { code: 'SEK', symbol: 'SEK', name: 'Swedish Krona', flag: 'se' },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar', flag: 'sg' },
  { code: 'SYP', symbol: 'SYP', name: 'Syrian Pound', flag: 'sy' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: 'th' },
  { code: 'TND', symbol: 'TND', name: 'Tunisian Dinar', flag: 'tn' },
  { code: 'TRY', symbol: 'TRY', name: 'Turkish Lira', flag: 'tr' },
  { code: 'UAH', symbol: 'UAH', name: 'Ukrainian Hryvnia', flag: 'ua' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: 'us' },
  { code: 'UZS', symbol: 'UZS', name: 'Uzbekistani Som', flag: 'uz' },
  { code: 'YER', symbol: 'YER', name: 'Yemeni Rial', flag: 'ye' },
  { code: 'ZAR', symbol: 'ZAR', name: 'South African Rand', flag: 'za' },
];

interface CurrencySelectorProps {
  variant?: 'desktop' | 'mobile' | 'mobile-dropdown';
  onMobileClose?: () => void;
  className?: string;
}

export default function CurrencySelector({ 
  variant = 'desktop',
  onMobileClose,
  className
}: CurrencySelectorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { code: currentCode } = useSelector((state: RootState) => state.currency);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
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
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCurrencySelect = (currencyCode: string) => {
    dispatch(setCurrency(currencyCode as any));
    setIsOpen(false);
    setSearch('');
    if (onMobileClose) onMobileClose();
  };

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    return currencies.filter(c => 
      c.code.toLowerCase().includes(q) || 
      c.name.toLowerCase().includes(q)
    );
  }, [search]);

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
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#f9d602] flex items-center justify-center shadow-xs">
              <Globe size={12} className="text-gray-950 stroke-[2.5]" />
            </div>
            <p className="text-xs font-black text-gray-900 uppercase tracking-wider">Select Currency</p>
          </div>
          <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200/60">
            {currencies.length} Available
          </span>
        </div>

        {/* Mobile Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search currency, country, or code..."
            className="w-full pl-10 pr-8 py-2.5 bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-xl text-xs font-bold border border-gray-200 focus:outline-none focus:border-[#f9d602] focus:ring-2 focus:ring-[#f9d602]/25 focus:bg-white transition-all shadow-xs"
          />
          {search && (
            <button 
              type="button" 
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="max-h-[350px] overflow-y-auto pr-1 custom-scrollbar space-y-3">
          {search.trim() ? (
            /* Search Results */
            <div className="grid grid-cols-2 gap-2">
              {filteredCurrencies.map((curr) => {
                const isSelected = mounted && currentCode === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => handleCurrencySelect(curr.code)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-150 text-left group ${
                      isSelected
                        ? 'border-[#f9d602] bg-[#f9d602]/15 shadow-xs ring-1 ring-[#f9d602]'
                        : 'border-gray-100 bg-white hover:border-[#f9d602]/40 hover:bg-[#f9d602]/10'
                    }`}
                  >
                    <div className="w-6 h-4.5 rounded overflow-hidden shadow-xs border border-gray-200 shrink-0 bg-white flex items-center justify-center">
                      <Image
                        src={`https://flagcdn.com/w80/${curr.flag}.png`} 
                        alt={curr.name}
                        width={24}
                        height={18}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-xs font-black text-gray-900 border-b-2 border-[#f9d602] pb-[1px] leading-none shrink-0 group-hover:border-black transition-colors">
                        {curr.code}
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 truncate w-full mt-1">{curr.name}</span>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#f9d602] text-black flex items-center justify-center shrink-0 shadow-xs">
                        <Check size={10} className="stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
              {filteredCurrencies.length === 0 && (
                <p className="col-span-2 text-center text-xs text-gray-400 py-6">No currencies found</p>
              )}
            </div>
          ) : (
            /* Grouped View: Top Currencies then All Currencies */
            <>
              {/* TOP CURRENCIES */}
              <div>
                <div className="flex items-center gap-1.5 px-1 mb-2">
                  <Sparkles size={12} className="text-[#f9d602]" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Top Currencies</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {topCurrencies.map((curr) => {
                    const isSelected = mounted && currentCode === curr.code;
                    return (
                      <button
                        key={`mob-top-${curr.code}`}
                        type="button"
                        onClick={() => handleCurrencySelect(curr.code)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-150 text-left group ${
                          isSelected
                            ? 'border-[#f9d602] bg-[#f9d602]/15 shadow-xs ring-1 ring-[#f9d602]'
                            : 'border-gray-100 bg-white hover:border-[#f9d602]/40 hover:bg-[#f9d602]/10'
                        }`}
                      >
                        <div className="w-6 h-4.5 rounded overflow-hidden shadow-xs border border-gray-200 shrink-0 bg-white flex items-center justify-center">
                          <Image
                            src={`https://flagcdn.com/w80/${curr.flag}.png`} 
                            alt={curr.name}
                            width={24}
                            height={18}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <span className="text-xs font-black text-gray-900 border-b-2 border-[#f9d602] pb-[1px] leading-none shrink-0 group-hover:border-black transition-colors">
                            {curr.code}
                          </span>
                          <span className="text-[10px] font-medium text-gray-500 truncate w-full mt-1">{curr.name}</span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#f9d602] text-black flex items-center justify-center shrink-0 shadow-xs">
                            <Check size={10} className="stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ALL CURRENCIES */}
              <div>
                <div className="flex items-center gap-1.5 px-1 mb-2 pt-2 border-t border-gray-100">
                  <Globe size={11} className="text-gray-400" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">All Currencies</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {currencies.map((curr) => {
                    const isSelected = mounted && currentCode === curr.code;
                    return (
                      <button
                        key={`mob-all-${curr.code}`}
                        type="button"
                        onClick={() => handleCurrencySelect(curr.code)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-150 text-left group ${
                          isSelected
                            ? 'border-[#f9d602] bg-[#f9d602]/15 shadow-xs ring-1 ring-[#f9d602]'
                            : 'border-gray-100 bg-white hover:border-[#f9d602]/40 hover:bg-[#f9d602]/10'
                        }`}
                      >
                        <div className="w-6 h-4.5 rounded overflow-hidden shadow-xs border border-gray-200 shrink-0 bg-white flex items-center justify-center">
                          <Image
                            src={`https://flagcdn.com/w80/${curr.flag}.png`} 
                            alt={curr.name}
                            width={24}
                            height={18}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <span className="text-xs font-black text-gray-900 border-b-2 border-[#f9d602] pb-[1px] leading-none shrink-0 group-hover:border-black transition-colors">
                            {curr.code}
                          </span>
                          <span className="text-[10px] font-medium text-gray-500 truncate w-full mt-1">{curr.name}</span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#f9d602] text-black flex items-center justify-center shrink-0 shadow-xs">
                            <Check size={10} className="stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setSearch('');
        }}
        className={className || "flex items-center gap-2.5 px-3 py-2 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200 shadow-sm group min-w-[105px] justify-between"}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-3.5 rounded-sm overflow-hidden shadow-xs border border-gray-200 shrink-0 bg-white flex items-center justify-center">
            <Image
              src={`https://flagcdn.com/w80/${currentCurrency.flag}.png`} 
              alt={currentCurrency.name}
              width={20}
              height={14}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-extrabold text-gray-900 text-xs tracking-tight">{currentCurrency.code}</span>
        </div>
        <ChevronDown 
          className={`text-gray-400 transition-transform duration-300 w-3.5 h-3.5 xl:w-4 xl:h-4 ${isOpen ? 'rotate-180 text-gray-700' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', damping: 24, stiffness: 350 }}
            className="absolute right-0 mt-2 w-76 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-[100] overflow-hidden"
          >
            {/* Header & Search */}
            <div className="px-3.5 pb-2.5 mb-1.5 border-b border-gray-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#f9d602] flex items-center justify-center shadow-xs">
                    <Globe size={12} className="text-gray-950 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">Select Currency</span>
                </div>
                <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200/60">
                  {currencies.length} Available
                </span>
              </div>
              
              {/* Search Box */}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search currency, country, code..."
                  autoFocus
                  className="w-full pl-8 pr-7 py-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-xl text-xs font-semibold border border-gray-200 focus:outline-none focus:border-[#f9d602] focus:ring-2 focus:ring-[#f9d602]/25 focus:bg-white transition-all shadow-xs"
                />
                {search && (
                  <button 
                    type="button" 
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Currencies List */}
            <div className="max-h-[310px] overflow-y-auto custom-scrollbar px-1.5 space-y-2">
              {search.trim() ? (
                /* Search Results */
                <div className="space-y-0.5">
                  {filteredCurrencies.map((curr) => {
                    const isSelected = mounted && currentCode === curr.code;
                    return (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => handleCurrencySelect(curr.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 group ${
                          isSelected 
                            ? 'bg-[#f9d602]/15 border border-[#f9d602] shadow-xs' 
                            : 'hover:bg-[#f9d602]/10 border border-transparent hover:border-[#f9d602]/30'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-4.5 rounded overflow-hidden shadow-xs border border-gray-200 shrink-0 bg-white flex items-center justify-center">
                            <Image
                              src={`https://flagcdn.com/w80/${curr.flag}.png`} 
                              alt={curr.name}
                              width={24}
                              height={18}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-baseline gap-2 min-w-0">
                            <span className="text-xs font-black text-gray-900 border-b-2 border-[#f9d602] pb-[1px] tracking-tight shrink-0 group-hover:border-black transition-colors">
                              {curr.code}
                            </span>
                            <span className="text-xs font-medium text-gray-600 truncate group-hover:text-gray-900 transition-colors max-w-[145px]">
                              {curr.name}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-4.5 h-4.5 bg-[#f9d602] rounded-full flex items-center justify-center shrink-0 shadow-xs">
                            <Check size={10} className="text-black stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {filteredCurrencies.length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-6">No currencies found</p>
                  )}
                </div>
              ) : (
                /* Grouped: Top Currencies (AUD, CAD, EUR, GBP, USD) then All Currencies */
                <>
                  {/* TOP CURRENCIES */}
                  <div>
                    <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Sparkles size={11} className="text-[#f9d602]" />
                      <span>Top currencies</span>
                    </div>
                    <div className="space-y-0.5 mt-0.5">
                      {topCurrencies.map((curr) => {
                        const isSelected = mounted && currentCode === curr.code;
                        return (
                          <button
                            key={`top-${curr.code}`}
                            type="button"
                            onClick={() => handleCurrencySelect(curr.code)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 group ${
                              isSelected 
                                ? 'bg-[#f9d602]/15 border border-[#f9d602] shadow-xs' 
                                : 'hover:bg-[#f9d602]/10 border border-transparent hover:border-[#f9d602]/30'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-6 h-4.5 rounded overflow-hidden shadow-xs border border-gray-200 shrink-0 bg-white flex items-center justify-center">
                                <Image
                                  src={`https://flagcdn.com/w80/${curr.flag}.png`} 
                                  alt={curr.name}
                                  width={24}
                                  height={18}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex items-baseline gap-2 min-w-0">
                                <span className="text-xs font-black text-gray-900 border-b-2 border-[#f9d602] pb-[1px] tracking-tight shrink-0 group-hover:border-black transition-colors">
                                  {curr.code}
                                </span>
                                <span className="text-xs font-medium text-gray-600 truncate group-hover:text-gray-900 transition-colors max-w-[145px]">
                                  {curr.name}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-4.5 h-4.5 bg-[#f9d602] rounded-full flex items-center justify-center shrink-0 shadow-xs">
                                <Check size={10} className="text-black stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ALL CURRENCIES */}
                  <div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-t border-gray-100 pt-2">
                      <Globe size={11} className="text-gray-400" />
                      <span>All currencies</span>
                    </div>
                    <div className="space-y-0.5 mt-0.5">
                      {currencies.map((curr) => {
                        const isSelected = mounted && currentCode === curr.code;
                        return (
                          <button
                            key={`all-${curr.code}`}
                            type="button"
                            onClick={() => handleCurrencySelect(curr.code)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 group ${
                              isSelected 
                                ? 'bg-[#f9d602]/15 border border-[#f9d602] shadow-xs' 
                                : 'hover:bg-[#f9d602]/10 border border-transparent hover:border-[#f9d602]/30'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-6 h-4.5 rounded overflow-hidden shadow-xs border border-gray-200 shrink-0 bg-white flex items-center justify-center">
                                <Image
                                  src={`https://flagcdn.com/w80/${curr.flag}.png`} 
                                  alt={curr.name}
                                  width={24}
                                  height={18}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex items-baseline gap-2 min-w-0">
                                <span className="text-xs font-black text-gray-900 border-b-2 border-[#f9d602] pb-[1px] tracking-tight shrink-0 group-hover:border-black transition-colors">
                                  {curr.code}
                                </span>
                                <span className="text-xs font-medium text-gray-600 truncate group-hover:text-gray-900 transition-colors max-w-[145px]">
                                  {curr.name}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-4.5 h-4.5 bg-[#f9d602] rounded-full flex items-center justify-center shrink-0 shadow-xs">
                                <Check size={10} className="text-black stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentCurrency = currencies.find(c => c.code === currentCode) || currencies[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    return currencies.filter(c => 
      c.code.toLowerCase().includes(q) || 
      c.name.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setSearch('');
        }}
        className="w-full flex items-center justify-between gap-2.5 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-4.5 rounded-sm overflow-hidden shadow-xs border border-gray-200 shrink-0 bg-white flex items-center justify-center">
            <Image
              src={`https://flagcdn.com/w80/${currentCurrency.flag}.png`} 
              alt={currentCurrency.name}
              width={24}
              height={18}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-gray-900 border-b-2 border-[#f9d602] pb-[1px] leading-none shrink-0">{currentCurrency.code}</span>
            <span className="text-xs font-medium text-gray-500">{currentCurrency.name}</span>
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
            className="fixed left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-[9999] overflow-hidden max-w-md mx-auto"
          >
            <div className="px-3.5 pb-2.5 mb-2 border-b border-gray-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#f9d602] flex items-center justify-center shadow-xs">
                    <Globe size={12} className="text-gray-950 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">Select Currency</span>
                </div>
                <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200/60">
                  {currencies.length} Available
                </span>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search currency, country, code..."
                  autoFocus
                  className="w-full pl-8 pr-7 py-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-xl text-xs font-semibold border border-gray-200 focus:outline-none focus:border-[#f9d602] focus:ring-2 focus:ring-[#f9d602]/25 focus:bg-white transition-all shadow-xs"
                />
                {search && (
                  <button 
                    type="button" 
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[290px] overflow-y-auto scrollbar-mobile px-1.5 space-y-2">
              {search.trim() ? (
                /* Search Results */
                <div className="space-y-0.5">
                  {filteredCurrencies.map((curr) => {
                    const isSelected = mounted && currentCode === curr.code;
                    return (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => {
                          onSelect(curr.code);
                          setIsOpen(false);
                          setSearch('');
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 group ${
                          isSelected ? 'bg-[#f9d602]/15 border border-[#f9d602] shadow-xs' : 'hover:bg-[#f9d602]/10 hover:border-[#f9d602]/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-5 rounded overflow-hidden shadow-xs border border-gray-200 shrink-0 bg-white flex items-center justify-center">
                            <Image
                              src={`https://flagcdn.com/w80/${curr.flag}.png`} 
                              alt={curr.name}
                              width={28}
                              height={20}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-baseline gap-2 min-w-0">
                            <span className="text-xs font-black text-gray-900 border-b-2 border-[#f9d602] pb-[1px] leading-none shrink-0 group-hover:border-black transition-colors">
                              {curr.code}
                            </span>
                            <span className="text-[10px] font-medium text-gray-500 truncate max-w-[180px] group-hover:text-gray-900 transition-colors">
                              {curr.name}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-4.5 h-4.5 bg-[#f9d602] rounded-full flex items-center justify-center shrink-0 shadow-xs">
                            <Check size={10} className="text-black stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {filteredCurrencies.length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-6">No currencies found</p>
                  )}
                </div>
              ) : (
                /* Grouped: Top then All */
                <>
                  {/* TOP CURRENCIES */}
                  <div>
                    <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Sparkles size={11} className="text-[#f9d602]" />
                      <span>Top currencies</span>
                    </div>
                    <div className="space-y-0.5 mt-0.5">
                      {topCurrencies.map((curr) => {
                        const isSelected = mounted && currentCode === curr.code;
                        return (
                          <button
                            key={`mob-drop-top-${curr.code}`}
                            type="button"
                            onClick={() => {
                              onSelect(curr.code);
                              setIsOpen(false);
                              setSearch('');
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 group ${
                              isSelected ? 'bg-[#f9d602]/15 border border-[#f9d602] shadow-xs' : 'hover:bg-[#f9d602]/10 hover:border-[#f9d602]/30'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-7 h-5 rounded overflow-hidden shadow-xs border border-gray-200 shrink-0 bg-white flex items-center justify-center">
                                <Image
                                  src={`https://flagcdn.com/w80/${curr.flag}.png`} 
                                  alt={curr.name}
                                  width={28}
                                  height={20}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex items-baseline gap-2 min-w-0">
                                <span className="text-xs font-black text-gray-900 border-b-2 border-[#f9d602] pb-[1px] leading-none shrink-0 group-hover:border-black transition-colors">
                                  {curr.code}
                                </span>
                                <span className="text-[10px] font-medium text-gray-500 truncate max-w-[180px] group-hover:text-gray-900 transition-colors">
                                  {curr.name}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-4.5 h-4.5 bg-[#f9d602] rounded-full flex items-center justify-center shrink-0 shadow-xs">
                                <Check size={10} className="text-black stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ALL CURRENCIES */}
                  <div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-t border-gray-100 pt-2">
                      <Globe size={11} className="text-gray-400" />
                      <span>All currencies</span>
                    </div>
                    <div className="space-y-0.5 mt-0.5">
                      {currencies.map((curr) => {
                        const isSelected = mounted && currentCode === curr.code;
                        return (
                          <button
                            key={`mob-drop-all-${curr.code}`}
                            type="button"
                            onClick={() => {
                              onSelect(curr.code);
                              setIsOpen(false);
                              setSearch('');
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 group ${
                              isSelected ? 'bg-[#f9d602]/15 border border-[#f9d602] shadow-xs' : 'hover:bg-[#f9d602]/10 hover:border-[#f9d602]/30'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-7 h-5 rounded overflow-hidden shadow-xs border border-gray-200 shrink-0 bg-white flex items-center justify-center">
                                <Image
                                  src={`https://flagcdn.com/w80/${curr.flag}.png`} 
                                  alt={curr.name}
                                  width={28}
                                  height={20}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex items-baseline gap-2 min-w-0">
                                <span className="text-xs font-black text-gray-900 border-b-2 border-[#f9d602] pb-[1px] leading-none shrink-0 group-hover:border-black transition-colors">
                                  {curr.code}
                                </span>
                                <span className="text-[10px] font-medium text-gray-500 truncate max-w-[180px] group-hover:text-gray-900 transition-colors">
                                  {curr.name}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-4.5 h-4.5 bg-[#f9d602] rounded-full flex items-center justify-center shrink-0 shadow-xs">
                                <Check size={10} className="text-black stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}