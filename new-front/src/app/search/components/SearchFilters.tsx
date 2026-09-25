'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronDown, Check, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  setFilterParams,
  toggleFilterParam,
  resetFilters
} from '@/store/slices/searchSlice';
import { filterOptions } from '@/data/filterOptions';
import { formatPrice } from '@/utils/currency';
import { getLogoUrl } from '@/utils/getImageUrl';
import { getVehicleDepositPrice } from '@/utils/vehiclePrice';
import type { Currency } from '@/types';

interface SearchFiltersProps {
  onFilterChange?: () => void;
}

export default function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { filterParams, minPrice, maxPrice, filteredSuppliers, filteredCategories } = useSelector((state: RootState) => state.search);
  const { code: currencyCode } = useSelector((state: RootState) => state.currency);

  // حارس الـ Hydration لمنع تعارض النصوص بين السيرفر والمتصفح
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🔒 قفل الـ scroll لما الـ Filter drawer يفتح
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileFilters]);

  const handleClearAll = () => {
    dispatch(resetFilters());
  };

  const displayCurrency = isMounted ? currencyCode : 'AED';

  return (
    <>
      {/* Desktop Sidebar - visible on lg and above only */}
      <div className="hidden lg:block w-full space-y-0">
        <FiltersContent
          filterParams={filterParams}
          minPrice={minPrice}
          maxPrice={maxPrice}
          currencyCode={displayCurrency}
          filteredSuppliers={filteredSuppliers}
          filteredCategories={filteredCategories}
          onClearAll={handleClearAll}
        />
      </div>

      {/* Mobile/Tablet Filter Bar - visible below lg */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <SlidersHorizontal size={18} className="text-gray-900" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold text-gray-800">Filter By</span>
              <span className="text-[10px] font-medium text-gray-400">Refine your search</span>
            </div>
          </div>
          <ChevronDown size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Mobile Filter Drawer - from right side */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-white z-[9999] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-100 bg-yellow-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <SlidersHorizontal size={16} className="text-gray-900" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">Filter By</h3>
                </div>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Filters Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-2">
                  <FiltersContent
                    filterParams={filterParams}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    currencyCode={displayCurrency}
                    filteredSuppliers={filteredSuppliers}
                    filteredCategories={filteredCategories}
                    onClearAll={handleClearAll}
                  />
                </div>
              </div>

              {/* Footer - Apply Button */}
              <div className="px-5 py-4 border-t border-gray-100 bg-white">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3 bg-primary text-gray-900 rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Content component - reused for both desktop and mobile layouts
function FiltersContent({
  filterParams,
  minPrice,
  maxPrice,
  currencyCode,
  filteredSuppliers,
  filteredCategories,
  onClearAll
}: any) {
  const dispatch = useDispatch<AppDispatch>();

  const { vehicles } = useSelector((state: RootState) => state.search);
  const { allRates } = useSelector((state: RootState) => state.currency);

  const depositCounts = useMemo(() => {
    const deposits = (vehicles || [])
      .map(v => getVehicleDepositPrice(v, currencyCode as Currency, allRates))
      .filter(d => d > 0)
      .sort((a, b) => a - b);

    if (deposits.length === 0) {
      return { low: 0, average: 0, high: 0, totalWithDeposit: 0 };
    }

    const min = deposits[0];
    const max = deposits[deposits.length - 1];
    const tier1 = min === max ? min : min + (max - min) / 3;
    const tier2 = min === max ? max : min + 2 * (max - min) / 3;

    let low = 0;
    let average = 0;
    let high = 0;

    deposits.forEach(d => {
      if (d <= tier1) low++;
      else if (d <= tier2) average++;
      else high++;
    });

    return { low, average, high, totalWithDeposit: deposits.length };
  }, [vehicles, currencyCode, allRates]);

  const isChecked = (key: string, value: string) => {
    const current = (filterParams as any)[key];
    return Array.isArray(current) ? current.includes(value) : current === value;
  };

  const handleToggle = (key: string, value: string) => {
    dispatch(toggleFilterParam({ key: key as any, value }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
      <div className="bg-yellow-50 px-5 py-3.5 border-b-2 border-yellow-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-yellow-700" />
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">Filter By</h3>
        </div>
        <button
          onClick={onClearAll}
          className="text-[10px] font-bold text-yellow-700 hover:text-yellow-900 hover:underline uppercase tracking-wider transition-colors"
        >
          Clear All
        </button>
      </div>

      <div>
        {/* 1. Price Range Slider */}
        <FilterSection title="Price Range" expanded>
          <div className="pt-2 pb-5 px-1">
            <SimplePriceRange
              minPrice={minPrice}
              maxPrice={maxPrice}
              currentMin={filterParams.priceRange ? filterParams.priceRange[0] : minPrice}
              currentMax={filterParams.priceRange ? filterParams.priceRange[1] : maxPrice}
              currencyCode={currencyCode}
              onChange={(min: number, max: number) => {
                dispatch(setFilterParams({ priceRange: [min, max] }));
              }}
            />
          </div>
        </FilterSection>

        {/* 2. Categories */}
        {filteredCategories && filteredCategories.length > 0 && (
          <FilterSection title="Categories" expanded>
            {filteredCategories.map((cat: any) => (
              <FilterOption
                key={cat.id}
                label={`${cat.name} (${cat.vehicle_count})`}
                checked={isChecked('category', String(cat.id))}
                onToggle={() => handleToggle('category', String(cat.id))}
              />
            ))}
          </FilterSection>
        )}

        {/* 3. Location Types */}
        <FilterSection title="Location Types" expanded>
          {filterOptions.locationTypes.map(opt => (
            <FilterOption
              key={opt.value}
              label={opt.label}
              checked={isChecked('locationType', opt.value)}
              onToggle={() => handleToggle('locationType', opt.value)}
            />
          ))}
        </FilterSection>

        {/* 3. Car Suppliers */}
        <FilterSection title="Suppliers" expanded>
          {filteredSuppliers && filteredSuppliers.length > 0 ? (
            filteredSuppliers.map((sup: any) => (
              <FilterOption
                key={sup.id}
                label={sup.name || sup.company || 'Supplier'}
                count={sup.vehicle_count}
                logoUrl={getLogoUrl(sup.logo || sup.company_logo)}
                checked={isChecked('supplier', String(sup.id))}
                onToggle={() => handleToggle('supplier', String(sup.id))}
              />
            ))
          ) : (
            <p className="text-xs text-gray-400 px-4 py-2">No suppliers available</p>
          )}
        </FilterSection>

        {/* 4. Deposit Filter */}
        <FilterSection title="Deposit" expanded>
          {[
            { value: 'low', label: 'Low Deposit', count: depositCounts.low, tier: 'low' as const },
            { value: 'average', label: 'Average Deposit', count: depositCounts.average, tier: 'average' as const },
            { value: 'high', label: 'High Deposit', count: depositCounts.high, tier: 'high' as const },
          ].map(opt => (
            <FilterOption
              key={opt.value}
              label={opt.label}
              count={opt.count}
              customIcon={<DepositTierIcon level={opt.tier} />}
              checked={isChecked('deposit', opt.value)}
              onToggle={() => handleToggle('deposit', opt.value)}
            />
          ))}
        </FilterSection>

        {/* 4. Transmission Filter */}
        <FilterSection title="Transmission">
          {filterOptions.transmission.map(opt => (
            <FilterOption
              key={opt.value}
              label={opt.label}
              checked={isChecked('transmission', opt.value)}
              onToggle={() => handleToggle('transmission', opt.value)}
            />
          ))}
        </FilterSection>

        {/* 5. Fuel Type Filter */}
        <FilterSection title="Fuel">
          {filterOptions.fuel.map(opt => (
            <FilterOption
              key={opt.value}
              label={opt.label}
              checked={isChecked('fuelType', opt.value)}
              onToggle={() => handleToggle('fuelType', opt.value)}
            />
          ))}
        </FilterSection>

        {/* 6. Air Conditioner */}
        <FilterSection title="Air Conditioner">
          {filterOptions.airConditioning.map(opt => (
            <FilterOption
              key={opt.value}
              label={opt.label}
              checked={filterParams.airConditioning === opt.value}
              onToggle={() => dispatch(setFilterParams({ airConditioning: filterParams.airConditioning === opt.value ? null : opt.value }))}
            />
          ))}
        </FilterSection>

        {/* 7. Number of seats */}
        <FilterSection title="Number of seats">
          {filterOptions.seats.map(opt => (
            <FilterOption
              key={opt.value}
              label={opt.label}
              checked={isChecked('seats', opt.value)}
              onToggle={() => handleToggle('seats', opt.value)}
            />
          ))}
        </FilterSection>

        {/* 8. Suitcases */}
        <FilterSection title="Suitcases">
          {filterOptions.suitcases.map(opt => (
            <FilterOption
              key={opt.value}
              label={opt.label}
              checked={isChecked('suitcases', opt.value)}
              onToggle={() => handleToggle('suitcases', opt.value)}
            />
          ))}
        </FilterSection>

        {/* 9. Payment Types */}
        <FilterSection title="Payment Types">
          {filterOptions.paymentTypes.map(opt => (
            <FilterOption
              key={opt.value}
              label={opt.label}
              checked={isChecked('paymentType', opt.value)}
              onToggle={() => handleToggle('paymentType', opt.value)}
            />
          ))}
        </FilterSection>

        {/* 10. Doors Filter */}
        <FilterSection title="Doors" isLast>
          {filterOptions.doors.map(opt => (
            <FilterOption
              key={opt.value}
              label={opt.label}
              checked={isChecked('doors', opt.value)}
              onToggle={() => handleToggle('doors', opt.value)}
            />
          ))}
        </FilterSection>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRICE RANGE SLIDER COMPONENT
// ═══════════════════════════════════════════════════════════════
function SimplePriceRange({
  minPrice,
  maxPrice,
  currentMin,
  currentMax,
  currencyCode,
  onChange
}: any) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

  const range = maxPrice - minPrice || 1;
  const minPct = ((currentMin - minPrice) / range) * 100;
  const maxPct = ((currentMax - minPrice) / range) * 100;

  const getValueFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return minPrice;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = minPrice + pct * range;
    return Math.round(rawValue / 10) * 10;
  }, [minPrice, range]);

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(thumb);
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newValue = getValueFromPosition(e.clientX);
      if (dragging === 'min') {
        const clampedMin = Math.max(minPrice, Math.min(newValue, currentMax - 10));
        onChange(clampedMin, currentMax);
      } else {
        const clampedMax = Math.max(currentMin + 10, Math.min(newValue, maxPrice));
        onChange(currentMin, clampedMax);
      }
    };
    const handleMouseUp = () => setDragging(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, currentMin, currentMax, minPrice, maxPrice, onChange, getValueFromPosition]);

  // Touch Support for Mobile
  useEffect(() => {
    if (!dragging) return;
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const newValue = getValueFromPosition(touch.clientX);
      if (dragging === 'min') {
        const clampedMin = Math.max(minPrice, Math.min(newValue, currentMax - 10));
        onChange(clampedMin, currentMax);
      } else {
        const clampedMax = Math.max(currentMin + 10, Math.min(newValue, maxPrice));
        onChange(currentMin, clampedMax);
      }
    };
    const handleTouchEnd = () => setDragging(null);

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging, currentMin, currentMax, minPrice, maxPrice, onChange, getValueFromPosition]);

  return (
    <div className="relative px-2 pt-8 pb-2 select-none">
      {/* Floating Price Labels */}
      <div className="relative h-7 mb-1">
        <div className="absolute top-0 -translate-x-1/2 z-10" style={{ left: `${minPct}%` }}>
          <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm border transition-colors ${dragging === 'min' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'}`}>
            {formatPrice(currentMin, currencyCode)}
          </div>
        </div>
        <div className="absolute top-0 -translate-x-1/2 z-10" style={{ left: `${maxPct}%` }}>
          <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm border transition-colors ${dragging === 'max' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'}`}>
            {formatPrice(currentMax, currencyCode)}
          </div>
        </div>
      </div>

      {/* Track */}
      <div ref={trackRef} className="relative h-10 flex items-center cursor-pointer">
        <div className="absolute inset-x-0 h-1.5 bg-gray-200 rounded-full">
          <div className="absolute h-full rounded-full bg-primary" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
        </div>

        {/* Min Thumb */}
        <div className="absolute w-5 h-5 -ml-2.5 cursor-grab active:cursor-grabbing z-20" style={{ left: `${minPct}%` }} onMouseDown={handleMouseDown('min')} onTouchStart={(e) => { e.preventDefault(); setDragging('min'); }}>
          <div className={`w-full h-full rounded-full border-2 shadow-md transition-all ${dragging === 'min' ? 'bg-primary border-primary scale-110' : 'bg-white border-gray-300 hover:border-primary'}`} />
        </div>

        {/* Max Thumb */}
        <div className="absolute w-5 h-5 -ml-2.5 cursor-grab active:cursor-grabbing z-20" style={{ left: `${maxPct}%` }} onMouseDown={handleMouseDown('max')} onTouchStart={(e) => { e.preventDefault(); setDragging('max'); }}>
          <div className={`w-full h-full rounded-full border-2 shadow-md transition-all ${dragging === 'max' ? 'bg-primary border-primary scale-110' : 'bg-white border-gray-300 hover:border-primary'}`} />
        </div>
      </div>

      <div className="flex justify-between mt-1 px-1">
        <span className="text-[11px] text-gray-400">{formatPrice(minPrice, currencyCode)}</span>
        <span className="text-[11px] text-gray-400">{formatPrice(maxPrice, currencyCode)}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEPOSIT TIER ICON (Matching user design: dark card + yellow strip + bar chart badge)
// ═══════════════════════════════════════════════════════════════
function DepositTierIcon({ level }: { level: 'low' | 'average' | 'high' }) {
  const isAvg = level === 'average';
  const isHigh = level === 'high';

  return (
    <svg viewBox="0 0 64 42" className="w-10 h-7 shrink-0 drop-shadow-2xs select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back Card */}
      <g transform="rotate(-6 24 16)">
        <rect x="6" y="5" width="38" height="23" rx="3.5" fill="#1e293b" />
        <rect x="6" y="8" width="38" height="3" fill="#f59e0b" />
      </g>
      {/* Front Card */}
      <rect x="4" y="9" width="42" height="26" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
      {/* Yellow top stripe */}
      <path d="M4 14.5H46" stroke="#f59e0b" strokeWidth="2.5" />
      {/* Chip */}
      <rect x="8" y="19" width="7" height="5" rx="1" fill="#f59e0b" />
      <rect x="9.5" y="20.5" width="4" height="2" rx="0.5" fill="#d97706" />

      {/* Circle Badge */}
      <circle cx="45" cy="27" r="12" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />

      {/* Bar 1 (Low) */}
      <rect x="38" y="28" width="3" height="5" rx="1.2" fill="#f59e0b" />

      {/* Bar 2 (Average) */}
      <rect x="43.5" y="24" width="3" height="9" rx="1.2" fill={isAvg || isHigh ? '#f59e0b' : '#cbd5e1'} />

      {/* Bar 3 (High) */}
      <rect x="49" y="20" width="3" height="13" rx="1.2" fill={isHigh ? '#f59e0b' : '#cbd5e1'} />
    </svg>
  );
}

// Accordion Component with Distinct Heading Styling
function FilterSection({ title, children, badge, expanded = false, isLast = false }: any) {
  const [isOpen, setIsOpen] = useState(expanded);
  return (
    <div className={`px-4 pt-3.5 pb-0 transition-colors ${!isLast ? 'border-b-2 border-gray-150' : ''}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between group pb-3.5">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-black text-gray-900 tracking-tight uppercase group-hover:text-amber-600 transition-colors">
            {title}
          </span>
          {badge && <span className="bg-primary/10 text-primary-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className={`text-gray-400 ${isOpen ? 'text-yellow-500' : ''}`} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-1 pb-4 space-y-1.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Fast, responsive Checkbox Option without Framer Motion overhead
function FilterOption({
  label,
  checked,
  onToggle,
  logoUrl,
  customIcon,
  count,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  logoUrl?: string;
  customIcon?: React.ReactNode;
  count?: number;
}) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      className="flex items-center justify-between group cursor-pointer py-2 px-2 rounded-xl select-none hover:bg-yellow-50/70 transition-colors"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
        {customIcon ? (
          <div className="shrink-0 flex items-center justify-center">
            {customIcon}
          </div>
        ) : logoUrl !== undefined ? (
          <div className="relative w-16 h-8.5 rounded-lg overflow-hidden bg-white border border-gray-200/90 shadow-2xs shrink-0 flex items-center justify-center px-1.5 py-0.5">
            {logoUrl ? (
              <img src={logoUrl} alt={label} className="w-full h-full object-contain max-h-full max-w-full" />
            ) : (
              <span className="text-xs font-black text-gray-500">{label.charAt(0)}</span>
            )}
          </div>
        ) : null}
        <span className="text-[13px] font-semibold text-gray-800 group-hover:text-gray-950 transition-colors truncate">
          {label}
          {count !== undefined && <span className="text-gray-400 font-normal ml-1.5 text-xs">({count})</span>}
        </span>
      </div>
      <div className="relative w-5 h-5 shrink-0">
        <div
          className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
            checked ? 'bg-yellow-500 border-yellow-500' : 'bg-white border-gray-300 group-hover:border-yellow-400'
          }`}
        >
          {checked && <Check size={12} className="text-white" strokeWidth={3.5} />}
        </div>
      </div>
    </div>
  );
}