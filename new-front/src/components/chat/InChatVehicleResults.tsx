'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Sparkles, ChevronDown, Car as CarIcon } from 'lucide-react';
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

type FilterType = 'all' | 'budget' | 'family' | 'suv' | 'luxury' | 'free_cancel';

export default function InChatVehicleResults({
  vehicles = [],
  searchCriteria,
  onStartBooking,
}: InChatVehicleResultsProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [visibleCount, setVisibleCount] = useState<number>(4);

  // Helper to test if a vehicle is Luxury
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

  // Helper to test if a vehicle is SUV / 4x4
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
      name.includes('pajero')
    );
  };

  // Helper to test if a vehicle is Family (7+ seats or spacious)
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
      name.includes('7 seat') ||
      isSuvVehicle(v)
    );
  };

  // Helper to test if free cancellation
  const isFreeCancelVehicle = (v: Vehicle) => {
    if (v.freeCancellation) return true;
    return (v.included || []).some((i: any) =>
      (i.what_is_included || '').toLowerCase().includes('cancellation')
    );
  };

  // Filter and sort the vehicles based on selected lifestyle persona
  const filteredVehicles = useMemo(() => {
    let list = [...vehicles];

    switch (activeFilter) {
      case 'budget':
        // Sort ascending by price
        return list.sort((a, b) => {
          const pA = a.final_price ?? a.price_in_usd ?? 999999;
          const pB = b.final_price ?? b.price_in_usd ?? 999999;
          return pA - pB;
        });

      case 'family':
        return list.filter(isFamilyVehicle);

      case 'suv':
        return list.filter(isSuvVehicle);

      case 'luxury':
        return list.filter(isLuxuryVehicle);

      case 'free_cancel':
        return list.filter(isFreeCancelVehicle);

      case 'all':
      default:
        return list;
    }
  }, [vehicles, activeFilter]);

  // Compute counts for persona filter pills
  const counts = useMemo(() => {
    return {
      all: vehicles.length,
      budget: vehicles.length,
      family: vehicles.filter(isFamilyVehicle).length,
      suv: vehicles.filter(isSuvVehicle).length,
      luxury: vehicles.filter(isLuxuryVehicle).length,
      free_cancel: vehicles.filter(isFreeCancelVehicle).length,
    };
  }, [vehicles]);

  const handleFilterChange = (f: FilterType) => {
    setActiveFilter(f);
    setVisibleCount(4);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  // Navigate to main /search page with exact user location and duration
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
    if (specificVehicleId) params.set('selectedVehicle', String(specificVehicleId));

    router.push(`/search?${params.toString()}`);
  };

  const visibleVehicles = filteredVehicles.slice(0, visibleCount);
  const remainingCount = Math.max(0, filteredVehicles.length - visibleCount);

  // 100% English persona filter pills
  const filterButtons: { type: FilterType; label: string; icon: string; count: number }[] = [
    { type: 'all', label: 'All', icon: '🌟', count: counts.all },
    { type: 'budget', label: 'Best Price', icon: '💰', count: counts.budget },
    { type: 'family', label: 'Family & 7+', icon: '👨‍👩‍👧‍👦', count: counts.family },
    { type: 'suv', label: 'SUVs & 4x4', icon: '🚙', count: counts.suv },
    { type: 'luxury', label: 'Luxury VIP', icon: '💎', count: counts.luxury },
    { type: 'free_cancel', label: 'Free Cancel', icon: '🛡️', count: counts.free_cancel },
  ];

  return (
    <div className="flex flex-col gap-2.5 mt-2 w-full text-left" dir="ltr">
      {/* ── 1. Innovative Persona & Lifestyle Filter Pills (100% English) ──── */}
      <div className="bg-white/95 backdrop-blur-xs border border-gray-200/90 rounded-2xl p-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-1 mb-2 px-1">
          <span className="text-[11px] font-black text-gray-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Smart Filters:
          </span>
          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {filteredVehicles.length} {filteredVehicles.length === 1 ? 'car found' : 'cars found'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterButtons.map((btn) => {
            const isActive = activeFilter === btn.type;
            if (btn.count === 0 && btn.type !== 'all' && btn.type !== 'budget') return null;

            return (
              <button
                key={btn.type}
                onClick={() => handleFilterChange(btn.type)}
                className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#f9d602] text-neutral-950 shadow-sm ring-1 ring-amber-400 font-extrabold scale-[1.02]'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/80 hover:border-amber-300'
                }`}
              >
                <span>{btn.icon}</span>
                <span>{btn.label}</span>
                {btn.count > 0 && (
                  <span
                    className={`text-[9.5px] px-1 py-0.2 rounded-md ${
                      isActive ? 'bg-black/15 text-neutral-950 font-black' : 'bg-gray-200 text-gray-600 font-bold'
                    }`}
                  >
                    {btn.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
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

      {/* ── 3. Progressive "Load More" Button (100% English) ──────────────── */}
      {remainingCount > 0 && (
        <button
          onClick={handleShowMore}
          className="w-full bg-white hover:bg-amber-50 border border-amber-300 hover:border-amber-400 text-neutral-950 font-black text-xs py-2.5 px-3 rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <ChevronDown className="w-4 h-4 text-amber-600 group-hover:translate-y-0.5 transition-transform" />
          <span>
            + Show More Available Cars ({remainingCount} remaining) 🚗
          </span>
        </button>
      )}

      {/* ── 4. Prominent Button to View in Full Search Page (100% English) ── */}
      <button
        onClick={() => handleGoToFullSearchPage()}
        className="w-full bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 hover:from-black hover:to-neutral-900 text-white font-black text-xs py-2.5 px-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-between cursor-pointer group border border-neutral-800"
      >
        <div className="flex items-center gap-2 text-left">
          <div className="w-6 h-6 rounded-lg bg-[#f9d602] text-neutral-950 flex items-center justify-center font-bold shrink-0">
            <CarIcon className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11.5px] font-black text-[#f9d602]">
              View all {vehicles.length} cars & full details on search page
            </span>
            <span className="text-[9.5px] text-gray-300 font-medium">
              {searchCriteria?.locationName || 'Selected Location'} • {searchCriteria?.dateFrom} to {searchCriteria?.dateTo}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-200 group-hover:text-white shrink-0">
          <ExternalLink className="w-3.5 h-3.5 text-[#f9d602]" />
        </div>
      </button>
    </div>
  );
}
