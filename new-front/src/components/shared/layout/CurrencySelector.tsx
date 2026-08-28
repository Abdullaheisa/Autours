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
  category: 'arab' | 'major' | 'europe' | 'asia_world';
}

export const currencies: CurrencyItem[] = [
  // ── Popular & GCC / Arab Countries ──────────────────────
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: 'ae', category: 'arab' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', flag: 'sa', category: 'arab' },
  { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', flag: 'qa', category: 'arab' },
  { code: 'KWD', symbol: 'KWD', name: 'Kuwaiti Dinar', flag: 'kw', category: 'arab' },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial', flag: 'om', category: 'arab' },
  { code: 'BHD', symbol: 'BHD', name: 'Bahraini Dinar', flag: 'bh', category: 'arab' },
  { code: 'EGP', symbol: 'EGP', name: 'Egyptian Pound', flag: 'eg', category: 'arab' },
  { code: 'JOD', symbol: 'JOD', name: 'Jordanian Dinar', flag: 'jo', category: 'arab' },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham', flag: 'ma', category: 'arab' },
  { code: 'LBP', symbol: 'LBP', name: 'Lebanese Pound', flag: 'lb', category: 'arab' },
  { code: 'IQD', symbol: 'IQD', name: 'Iraqi Dinar', flag: 'iq', category: 'arab' },
  { code: 'DZD', symbol: 'DZD', name: 'Algerian Dinar', flag: 'dz', category: 'arab' },
  { code: 'TND', symbol: 'TND', name: 'Tunisian Dinar', flag: 'tn', category: 'arab' },
  { code: 'LYD', symbol: 'LYD', name: 'Libyan Dinar', flag: 'ly', category: 'arab' },
  { code: 'SDG', symbol: 'SDG', name: 'Sudanese Pound', flag: 'sd', category: 'arab' },
  { code: 'YER', symbol: 'YER', name: 'Yemeni Rial', flag: 'ye', category: 'arab' },
  { code: 'SYP', symbol: 'SYP', name: 'Syrian Pound', flag: 'sy', category: 'arab' },
  { code: 'MRU', symbol: 'MRU', name: 'Mauritanian Ouguiya', flag: 'mr', category: 'arab' },

  // ── Global Major ───────────────────────────────────────
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: 'us', category: 'major' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: 'eu', category: 'major' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: 'gb', category: 'major' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: 'ch', category: 'major' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: 'ca', category: 'major' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', flag: 'au', category: 'major' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: 'nz', category: 'major' },

  // ── Key Destinations & Europe ───────────────────────────
  { code: 'TRY', symbol: 'TRY', name: 'Turkish Lira', flag: 'tr', category: 'europe' },
  { code: 'GEL', symbol: 'GEL', name: 'Georgian Lari', flag: 'ge', category: 'europe' },
  { code: 'AZN', symbol: 'AZN', name: 'Azerbaijani Manat', flag: 'az', category: 'europe' },
  { code: 'BAM', symbol: 'BAM', name: 'Bosnian Mark', flag: 'ba', category: 'europe' },
  { code: 'SEK', symbol: 'SEK', name: 'Swedish Krona', flag: 'se', category: 'europe' },
  { code: 'NOK', symbol: 'NOK', name: 'Norwegian Krone', flag: 'no', category: 'europe' },
  { code: 'DKK', symbol: 'DKK', name: 'Danish Krone', flag: 'dk', category: 'europe' },
  { code: 'PLN', symbol: 'PLN', name: 'Polish Zloty', flag: 'pl', category: 'europe' },
  { code: 'CZK', symbol: 'CZK', name: 'Czech Koruna', flag: 'cz', category: 'europe' },
  { code: 'HUF', symbol: 'HUF', name: 'Hungarian Forint', flag: 'hu', category: 'europe' },
  { code: 'RON', symbol: 'RON', name: 'Romanian Leu', flag: 'ro', category: 'europe' },
  { code: 'BGN', symbol: 'BGN', name: 'Bulgarian Lev', flag: 'bg', category: 'europe' },
  { code: 'RSD', symbol: 'RSD', name: 'Serbian Dinar', flag: 'rs', category: 'europe' },
  { code: 'ALL', symbol: 'ALL', name: 'Albanian Lek', flag: 'al', category: 'europe' },
  { code: 'MKD', symbol: 'MKD', name: 'Macedonian Denar', flag: 'mk', category: 'europe' },
  { code: 'MDL', symbol: 'MDL', name: 'Moldovan Leu', flag: 'md', category: 'europe' },
  { code: 'UAH', symbol: 'UAH', name: 'Ukrainian Hryvnia', flag: 'ua', category: 'europe' },
  { code: 'RUB', symbol: 'RUB', name: 'Russian Ruble', flag: 'ru', category: 'europe' },
  { code: 'AMD', symbol: 'AMD', name: 'Armenian Dram', flag: 'am', category: 'europe' },

  // ── Asia & Africa & Latin America ───────────────────────
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: 'jp', category: 'asia_world' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: 'cn', category: 'asia_world' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: 'in', category: 'asia_world' },
  { code: 'PKR', symbol: 'PKR', name: 'Pakistani Rupee', flag: 'pk', category: 'asia_world' },
  { code: 'MYR', symbol: 'MYR', name: 'Malaysian Ringgit', flag: 'my', category: 'asia_world' },
  { code: 'IDR', symbol: 'IDR', name: 'Indonesian Rupiah', flag: 'id', category: 'asia_world' },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar', flag: 'sg', category: 'asia_world' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: 'th', category: 'asia_world' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: 'ph', category: 'asia_world' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: 'kr', category: 'asia_world' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: 'hk', category: 'asia_world' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: 'br', category: 'asia_world' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', flag: 'mx', category: 'asia_world' },
  { code: 'ARS', symbol: 'ARS', name: 'Argentine Peso', flag: 'ar', category: 'asia_world' },
  { code: 'CLP', symbol: 'CLP', name: 'Chilean Peso', flag: 'cl', category: 'asia_world' },
  { code: 'COP', symbol: 'COP', name: 'Colombian Peso', flag: 'co', category: 'asia_world' },
  { code: 'ZAR', symbol: 'ZAR', name: 'South African Rand', flag: 'za', category: 'asia_world' },
  { code: 'KES', symbol: 'KES', name: 'Kenyan Shilling', flag: 'ke', category: 'asia_world' },
  { code: 'MUR', symbol: 'MUR', name: 'Mauritian Rupee', flag: 'mu', category: 'asia_world' },
  { code: 'UZS', symbol: 'UZS', name: 'Uzbekistani Som', flag: 'uz', category: 'asia_world' },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'arab', label: 'Arab & GCC' },
  { id: 'major', label: 'Global' },
  { id: 'europe', label: 'Europe' },
  { id: 'asia_world', label: 'Asia & More' },
] as const;

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
    let list = currencies;
    if (selectedCategory !== 'all') {
      list = list.filter(c => c.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(c => 
        c.code.toLowerCase().includes(q) || 
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, selectedCategory]);

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
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Currency</p>
          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{currencies.length} Available</span>
        </div>

        {/* Mobile Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search currency or country..."
            className="w-full pl-9 pr-8 py-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-xl text-xs font-bold border border-gray-200 focus:outline-none focus:border-amber-400 focus:bg-white"
          />
          {search && (
            <button 
              type="button" 
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredCurrencies.map((curr) => (
            <button
              key={curr.code}
              type="button"
              onClick={() => handleCurrencySelect(curr.code)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all text-left ${
                mounted && currentCode === curr.code
                  ? 'border-amber-400 bg-amber-400/10 text-gray-900 shadow-xs'
                  : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
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
                <div className="flex items-center gap-1 w-full">
                  <span className="text-xs font-black truncate">{curr.code}</span>
                  <span className="text-[9px] font-bold text-gray-400">{curr.symbol}</span>
                </div>
                <span className="text-[9px] font-medium text-gray-400 truncate w-full">{curr.name}</span>
              </div>
              {mounted && currentCode === curr.code && (
                <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                  <Check size={10} className="text-black stroke-[3]" />
                </div>
              )}
            </button>
          ))}
          {filteredCurrencies.length === 0 && (
            <p className="col-span-2 text-center text-xs text-gray-400 py-4">No currencies found</p>
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
            className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2.5 z-[100] overflow-hidden"
          >
            {/* Header & Search */}
            <div className="px-3.5 pb-2.5 mb-2 border-b border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Globe size={13} className="text-amber-500" />
                  <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">Select Currency</span>
                </div>
                <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{currencies.length} Available</span>
              </div>
              
              {/* Search Box */}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search currency, country, or symbol..."
                  autoFocus
                  className="w-full pl-8 pr-7 py-1.5 bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-xl text-xs font-bold border border-gray-200 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                />
                {search && (
                  <button 
                    type="button" 
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none pt-0.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Currencies List */}
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar px-1.5 space-y-0.5">
              {filteredCurrencies.map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => handleCurrencySelect(curr.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${
                    mounted && currentCode === curr.code 
                      ? 'bg-amber-400/15 text-gray-900 font-bold border border-amber-400/40' 
                      : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-4.5 rounded overflow-hidden shadow-xs border border-gray-200/80 shrink-0 bg-white flex items-center justify-center">
                      <Image
                        src={`https://flagcdn.com/w80/${curr.flag}.png`} 
                        alt={curr.name}
                        width={24}
                        height={18}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black ${mounted && currentCode === curr.code ? 'text-gray-900' : 'text-gray-800'}`}>{curr.code}</span>
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded">{curr.symbol}</span>
                      </div>
                      <span className="text-[10px] font-medium text-gray-400 truncate max-w-[170px]">{curr.name}</span>
                    </div>
                  </div>
                  {mounted && currentCode === curr.code && (
                    <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shrink-0 shadow-xs">
                      <Check size={9} className="text-black stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
              {filteredCurrencies.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-6">No currencies found</p>
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
    let list = currencies;
    if (selectedCategory !== 'all') {
      list = list.filter(c => c.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(c => 
        c.code.toLowerCase().includes(q) || 
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, selectedCategory]);

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
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-gray-900">{currentCurrency.code}</span>
              <span className="text-xs font-bold text-gray-400">{currentCurrency.symbol}</span>
            </div>
            <span className="text-xs font-medium text-gray-400">{currentCurrency.name}</span>
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
            <div className="px-3.5 pb-2.5 mb-2 border-b border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">Choose Currency</span>
                <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{currencies.length} Available</span>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search currency, country, or symbol..."
                  autoFocus
                  className="w-full pl-8 pr-7 py-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-xl text-xs font-bold border border-gray-200 focus:outline-none focus:border-amber-400 focus:bg-white"
                />
                {search && (
                  <button 
                    type="button" 
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[280px] overflow-y-auto scrollbar-mobile px-1.5 space-y-0.5">
              {filteredCurrencies.map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => {
                    onSelect(curr.code);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors group ${
                    mounted && currentCode === curr.code ? 'bg-amber-400/15 border border-amber-400/40' : 'hover:bg-gray-50'
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
                    <div className="flex flex-col items-start min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black ${mounted && currentCode === curr.code ? 'text-gray-900' : 'text-gray-700'}`}>{curr.code}</span>
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded">{curr.symbol}</span>
                      </div>
                      <span className="text-[10px] font-medium text-gray-400 truncate max-w-[200px]">{curr.name}</span>
                    </div>
                  </div>
                  {mounted && currentCode === curr.code && (
                    <div className="w-4.5 h-4.5 bg-amber-400 rounded-full flex items-center justify-center shrink-0 shadow-xs">
                      <Check size={10} className="text-black stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
              {filteredCurrencies.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-6">No currencies found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}