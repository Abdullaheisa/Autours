'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Car as CarIcon,
  SlidersHorizontal,
  RotateCcw,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Vehicle } from '@/types';
import ChatCarCard from './ChatCarCard';

interface InChatVehicleResultsProps {
  vehicles: Vehicle[];
  searchCriteria?: {
    location?: string | number;
    locationName?: string;
    dateFrom?: string;
    dateTo?: string;
    startTime?: string;
    endTime?: string;
    currency?: string;
    country?: string;
  };
  onStartBooking: (vehicle: Vehicle) => void;
}

type CategoryType = 'all' | 'economy' | 'sedan' | 'suv' | 'luxury' | 'family';
type TransmissionType = 'all' | 'automatic' | 'manual';
type SeatsType = 'all' | '4-5' | '7+';
type SortType = 'default' | 'price_asc' | 'price_desc';

export default function InChatVehicleResults({
  vehicles = [],
  searchCriteria,
  onStartBooking,
}: InChatVehicleResultsProps) {
  const router = useRouter();

  // ── Filter States ──────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedTransmission, setSelectedTransmission] = useState<TransmissionType>('all');
  const [selectedSeats, setSelectedSeats] = useState<SeatsType>('all');
  const [selectedSort, setSelectedSort] = useState<SortType>('default');
  const [freeCancelOnly, setFreeCancelOnly] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Pagination inside chat
  const [visibleCount, setVisibleCount] = useState<number>(4);

  // ── Classification Helpers ────────────────────────────────────────────────
  const isEconomyVehicle = (v: Vehicle) => {
    const name = (v.name || '').toLowerCase();
    const cat = (v.category || v.type || '').toLowerCase();
    return (
      cat.includes('econ') ||
      cat.includes('compact') ||
      cat.includes('mini') ||
      cat.includes('small') ||
      name.includes('sunny') ||
      name.includes('yaris') ||
      name.includes('peugeot') ||
      name.includes('accent') ||
      name.includes('rio') ||
      name.includes('picanto') ||
      name.includes('atos') ||
      name.includes('swift')
    );
  };

  const isSedanVehicle = (v: Vehicle) => {
    const name = (v.name || '').toLowerCase();
    const cat = (v.category || v.type || '').toLowerCase();
    return (
      cat.includes('sedan') ||
      cat.includes('saloon') ||
      cat.includes('standard') ||
      name.includes('camry') ||
      name.includes('accord') ||
      name.includes('altima') ||
      name.includes('elantra') ||
      name.includes('civic') ||
      name.includes('corolla') ||
      name.includes('sonata') ||
      name.includes('optima') ||
      name.includes('k5')
    );
  };

  const isSuvVehicle = (v: Vehicle) => {
    const name = (v.name || '').toLowerCase();
    const cat = (v.category || v.type || '').toLowerCase();
    return (
      cat.includes('suv') ||
      cat.includes('4x4') ||
      cat.includes('crossover') ||
      name.includes('patrol') ||
      name.includes('land cruiser') ||
      name.includes('prado') ||
      name.includes('tucson') ||
      name.includes('sportage') ||
      name.includes('cherokee') ||
      name.includes('duster') ||
      name.includes('rav4') ||
      name.includes('pajero') ||
      name.includes('tahoe') ||
      name.includes('explorer')
    );
  };

  const isLuxuryVehicle = (v: Vehicle) => {
    const name = (v.name || '').toLowerCase();
    const cat = (v.category || v.type || '').toLowerCase();
    return (
      cat.includes('lux') ||
      cat.includes('prem') ||
      cat.includes('vip') ||
      name.includes('mercedes') ||
      name.includes('benz') ||
      name.includes('bmw') ||
      name.includes('audi') ||
      name.includes('porsche') ||
      name.includes('range rover') ||
      name.includes('land rover') ||
      name.includes('lexus') ||
      name.includes('genesis') ||
      name.includes('cadillac') ||
      name.includes('jaguar')
    );
  };

  const isFamilyVehicle = (v: Vehicle) => {
    const name = (v.name || '').toLowerCase();
    const seats = parseInt(String(v.seats || 0), 10);
    const cat = (v.category || v.type || '').toLowerCase();
    return (
      seats >= 7 ||
      cat.includes('van') ||
      cat.includes('minivan') ||
      name.includes('carnival') ||
      name.includes('innova') ||
      name.includes('hiace') ||
      name.includes('staria') ||
      name.includes('urvan') ||
      name.includes('7 seat')
    );
  };

  const isFreeCancelVehicle = (v: Vehicle) => {
    if (v.freeCancellation) return true;
    return (v.included || []).some((i: any) =>
      (i.what_is_included || '').toLowerCase().includes('cancellation')
    );
  };

  const isAutomaticVehicle = (v: Vehicle) => {
    const trans = (v.transmission || '').toLowerCase();
    return trans.includes('auto') || trans.includes('اتوماتيك') || trans.includes('أوتوماتيك');
  };

  const isManualVehicle = (v: Vehicle) => {
    const trans = (v.transmission || '').toLowerCase();
    return trans.includes('man') || trans.includes('يدوي');
  };

  // ── Compute Counts for Category Tabs ───────────────────────────────────────
  const counts = useMemo(() => {
    return {
      all: vehicles.length,
      economy: vehicles.filter(isEconomyVehicle).length,
      sedan: vehicles.filter(isSedanVehicle).length,
      suv: vehicles.filter(isSuvVehicle).length,
      luxury: vehicles.filter(isLuxuryVehicle).length,
      family: vehicles.filter(isFamilyVehicle).length,
    };
  }, [vehicles]);

  // ── Count active advanced filters ──────────────────────────────────────────
  const activeAdvancedCount = useMemo(() => {
    let count = 0;
    if (selectedTransmission !== 'all') count++;
    if (selectedSeats !== 'all') count++;
    if (selectedSort !== 'default') count++;
    if (freeCancelOnly) count++;
    return count;
  }, [selectedTransmission, selectedSeats, selectedSort, freeCancelOnly]);

  // ── Multi-criteria Filtering & Sorting ─────────────────────────────────────
  const filteredVehicles = useMemo(() => {
    let list = [...vehicles];

    // 1. Category
    if (selectedCategory === 'economy') list = list.filter(isEconomyVehicle);
    else if (selectedCategory === 'sedan') list = list.filter(isSedanVehicle);
    else if (selectedCategory === 'suv') list = list.filter(isSuvVehicle);
    else if (selectedCategory === 'luxury') list = list.filter(isLuxuryVehicle);
    else if (selectedCategory === 'family') list = list.filter(isFamilyVehicle);

    // 2. Transmission
    if (selectedTransmission === 'automatic') list = list.filter(isAutomaticVehicle);
    else if (selectedTransmission === 'manual') list = list.filter(isManualVehicle);

    // 3. Seats
    if (selectedSeats === '4-5') {
      list = list.filter((v) => {
        const s = parseInt(String(v.seats || 5), 10);
        return s >= 4 && s <= 5;
      });
    } else if (selectedSeats === '7+') {
      list = list.filter((v) => {
        const s = parseInt(String(v.seats || 0), 10);
        return s >= 7 || isFamilyVehicle(v);
      });
    }

    // 4. Free Cancellation
    if (freeCancelOnly) {
      list = list.filter(isFreeCancelVehicle);
    }

    // 5. Sorting
    if (selectedSort === 'price_asc') {
      list.sort((a, b) => {
        const pA = a.final_price ?? a.price_in_usd ?? 999999;
        const pB = b.final_price ?? b.price_in_usd ?? 999999;
        return pA - pB;
      });
    } else if (selectedSort === 'price_desc') {
      list.sort((a, b) => {
        const pA = a.final_price ?? a.price_in_usd ?? 0;
        const pB = b.final_price ?? b.price_in_usd ?? 0;
        return pB - pA;
      });
    }

    return list;
  }, [
    vehicles,
    selectedCategory,
    selectedTransmission,
    selectedSeats,
    freeCancelOnly,
    selectedSort,
  ]);

  const handleCategoryChange = (cat: CategoryType) => {
    setSelectedCategory(cat);
    setVisibleCount(4);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedTransmission('all');
    setSelectedSeats('all');
    setSelectedSort('default');
    setFreeCancelOnly(false);
    setVisibleCount(4);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  // ── Navigate to main /search page with all criteria preserved ─────────────
  const handleGoToFullSearchPage = (specificVehicleId?: string | number) => {
    const params = new URLSearchParams();

    const loc = searchCriteria?.location ? String(searchCriteria.location) : '';
    const locLabel = searchCriteria?.locationName || loc;
    const start = searchCriteria?.dateFrom || '';
    const end = searchCriteria?.dateTo || '';
    const st = searchCriteria?.startTime || '10:00';
    const et = searchCriteria?.endTime || '10:00';
    const curr = searchCriteria?.currency || 'AED';

    if (loc) params.set('location', loc);
    if (locLabel) params.set('locationLabel', locLabel);
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    if (st) params.set('st', st);
    if (et) params.set('et', et);
    if (curr) params.set('currency', curr);
    if (searchCriteria?.country) params.set('countryName', searchCriteria.country);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedTransmission !== 'all') params.set('transmission', selectedTransmission);
    if (specificVehicleId) params.set('selectedVehicle', String(specificVehicleId));

    router.push(`/search?${params.toString()}`);
  };

  const visibleVehicles = filteredVehicles.slice(0, visibleCount);
  const remainingCount = Math.max(0, filteredVehicles.length - visibleCount);
  const progressPercent = filteredVehicles.length > 0
    ? Math.min(100, Math.round((visibleVehicles.length / filteredVehicles.length) * 100))
    : 0;

  // Category quick tabs (no star symbol)
  const categoryTabs: { type: CategoryType; label: string; icon?: string; count: number }[] = [
    { type: 'all', label: 'All Fleet', count: counts.all },
    { type: 'economy', label: 'Economy', icon: '⚡', count: counts.economy },
    { type: 'sedan', label: 'Sedan', icon: '🚗', count: counts.sedan },
    { type: 'suv', label: 'SUVs & 4x4', icon: '🚙', count: counts.suv },
    { type: 'luxury', label: 'Luxury VIP', icon: '💎', count: counts.luxury },
    { type: 'family', label: 'Family 7+', icon: '🚐', count: counts.family },
  ];

  return (
    <div className="flex flex-col gap-3 mt-2 w-full text-left" dir="ltr">
      {/* ── 1. Smart Chat-Friendly Filter Bar (Matching SearchFilters) ─────── */}
      <div className="bg-white/95 backdrop-blur-xs border border-gray-200/90 rounded-2xl p-2.5 shadow-xs flex flex-col gap-2">
        {/* Header Row: Title + Toggle Drawer + Clear All */}
        <div className="flex items-center justify-between gap-1 px-1">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11.5px] font-black text-gray-900">
              Fleet Filters
            </span>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredVehicles.length} {filteredVehicles.length === 1 ? 'car' : 'cars'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Clear Filters Button (shown only when any active filter) */}
            {(selectedCategory !== 'all' || activeAdvancedCount > 0) && (
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-bold text-gray-500 hover:text-amber-700 flex items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Expand / Collapse Advanced Filters */}
            <button
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className={`flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                showAdvancedFilters || activeAdvancedCount > 0
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3 text-amber-400" />
              <span>More Filters</span>
              {activeAdvancedCount > 0 && (
                <span className="bg-amber-400 text-neutral-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {activeAdvancedCount}
                </span>
              )}
              {showAdvancedFilters ? (
                <ChevronUp className="w-3 h-3 text-gray-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Category Horizontal Quick Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {categoryTabs.map((tab) => {
            const isActive = selectedCategory === tab.type;
            if (tab.count === 0 && tab.type !== 'all') return null;

            return (
              <button
                key={tab.type}
                onClick={() => handleCategoryChange(tab.type)}
                className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#f9d602] text-neutral-950 shadow-xs ring-1 ring-amber-400 font-extrabold scale-[1.02]'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/80 hover:border-amber-300'
                }`}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? 'bg-neutral-950/15 text-neutral-950 font-black'
                        : 'bg-gray-200 text-gray-600 font-semibold'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Expandable Card (Transmission, Seats, Price Sort, Free Cancel) */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-2 border-t border-gray-100 flex flex-col gap-2.5"
            >
              {/* Transmission Section */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                  Transmission
                </span>
                <div className="flex gap-1.5">
                  {(['all', 'automatic', 'manual'] as TransmissionType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setSelectedTransmission(t);
                        setVisibleCount(4);
                      }}
                      className={`text-[10.5px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer capitalize ${
                        selectedTransmission === t
                          ? 'bg-neutral-900 text-white ring-1 ring-neutral-800'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {t === 'all' ? 'All' : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seats Section */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                  Seats Capacity
                </span>
                <div className="flex gap-1.5">
                  {(['all', '4-5', '7+'] as SeatsType[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSelectedSeats(s);
                        setVisibleCount(4);
                      }}
                      className={`text-[10.5px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        selectedSeats === s
                          ? 'bg-neutral-900 text-white ring-1 ring-neutral-800'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {s === 'all' ? 'All Seats' : s === '4-5' ? '4-5 Seats' : '7+ Seats'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By Price Section */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                  Price Sorting
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { val: 'default', label: 'Recommended' },
                    { val: 'price_asc', label: 'Lowest Price' },
                    { val: 'price_desc', label: 'Highest Price' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => {
                        setSelectedSort(opt.val as SortType);
                        setVisibleCount(4);
                      }}
                      className={`text-[10.5px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        selectedSort === opt.val
                          ? 'bg-neutral-900 text-white ring-1 ring-neutral-800'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Perquisites (Free Cancellation) */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    setFreeCancelOnly((prev) => !prev);
                    setVisibleCount(4);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    freeCancelOnly
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-300'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className={`w-4 h-4 ${freeCancelOnly ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span>Free Cancellation Only</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      freeCancelOnly
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {freeCancelOnly && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 2. Render Vehicle Cards ─────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        <div className="flex flex-col gap-2.5">
          {visibleVehicles.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="relative group"
            >
              <ChatCarCard
                vehicle={v}
                searchCriteria={searchCriteria}
                onStartBooking={onStartBooking}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Empty State when filters yield 0 matches */}
      {filteredVehicles.length === 0 && (
        <div className="bg-white rounded-2xl p-5 border border-dashed border-gray-300 text-center flex flex-col items-center gap-2">
          <CarIcon className="w-8 h-8 text-gray-300" />
          <p className="text-xs font-bold text-gray-700">
            No vehicles match the selected filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="text-xs font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ── 3. Innovative Fleet Discovery & Booking Deck ─────────────────────── */}
      {/* (Replaces the two clunky stacked buttons with a single unified, luxury card) */}
      <div className="bg-neutral-950 text-white rounded-2xl p-3.5 border border-neutral-800 shadow-xl flex flex-col gap-3">
        {/* Progress & Location Summary */}
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-gray-300">
              Showing <strong className="text-white">{visibleVehicles.length}</strong> of{' '}
              <strong className="text-amber-400">{filteredVehicles.length}</strong> cars
            </span>
          </div>

          <span className="text-[10px] text-gray-400 truncate max-w-[170px] bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
            {searchCriteria?.locationName || 'Selected Location'}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Interactive Action Hub */}
        {remainingCount > 0 ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Button 1: Progressive In-Chat Load */}
            <button
              onClick={handleShowMore}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800/90 border border-neutral-700/80 hover:border-amber-400/60 transition-all text-center group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-black text-white group-hover:text-amber-300">
                <ChevronDown className="w-3.5 h-3.5 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
                <span>Load {Math.min(4, remainingCount)} More</span>
              </div>
              <span className="text-[9.5px] text-gray-400 mt-0.5 font-medium">
                +{remainingCount} more in chat
              </span>
            </button>

            {/* Button 2: Full Fleet on Search Page */}
            <button
              onClick={() => handleGoToFullSearchPage()}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black transition-all text-center shadow-md hover:shadow-amber-500/20 group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-black">
                <span>Full Fleet ({vehicles.length})</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <span className="text-[9.5px] text-neutral-900/80 mt-0.5 font-semibold">
                Open Search Page
              </span>
            </button>
          </div>
        ) : (
          /* When all cars in this filter are displayed: Single Full-Width Gold CTA */
          <button
            onClick={() => handleGoToFullSearchPage()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:brightness-105 text-neutral-950 font-black text-xs transition-all flex items-center justify-between shadow-md cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <CarIcon className="w-4 h-4" />
              <span>Explore All {vehicles.length} Cars on Search Page</span>
            </div>
            <ExternalLink className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}
