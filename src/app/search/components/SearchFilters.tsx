'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Check, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  setFilterParams,
  toggleFilterParam,
  resetFilters,
  fetchVehicles
} from '@/store/slices/searchSlice';
import { filterOptions } from '@/data/filterOptions';
import { formatPrice } from '@/utils/currency';
import type { Currency } from '@/types';

interface SearchFiltersProps {
  onFilterChange?: () => void;
}

export default function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { filterParams, minPrice, maxPrice, searchParams, filteredSuppliers, filteredCategories } = useSelector((state: RootState) => state.search);
  const { code: currencyCode, rate: currencyRate } = useSelector((state: RootState) => state.currency);

  // Trigger API fetch when filters change
  useEffect(() => {
    if (onFilterChange) onFilterChange();
  }, [filterParams, onFilterChange]);

  const handleClearAll = () => {
    dispatch(resetFilters());
  };

  return (
    <>
      {/* Desktop/Tablet Sidebar - visible on md and above */}
      <div className="hidden md:block w-full space-y-0">
        <FiltersContent
          filterParams={filterParams}
          minPrice={minPrice}
          maxPrice={maxPrice}
          currencyCode={currencyCode}
          filteredSuppliers={filteredSuppliers}
          filteredCategories={filteredCategories}
          onClearAll={handleClearAll}
        />
      </div>

      {/* Mobile Filter Bar - visible below md */}
      <div className="md:hidden">
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
              className="md:hidden fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-white z-[9999] shadow-2xl flex flex-col"
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
                    currencyCode={currencyCode}
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

// Filters Content - reused for both desktop and mobile
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

  const isChecked = (key: string, value: string) => {
    const current = (filterParams as any)[key];
    return Array.isArray(current) ? current.includes(value) : current === value;
  };

  const handleToggle = (key: string, value: string) => {
    dispatch(toggleFilterParam({ key: key as any, value }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
      <div className="bg-yellow-50 px-5 py-3.5 border-b border-yellow-100 flex justify-between items-center">
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

      <div className="divide-y divide-gray-100">
        {/* Price Range - Simple & Clean */}
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

        {/* Location Types */}
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

        {/* Categories */}
        <FilterSection title="Categories" expanded>
          {filteredCategories && filteredCategories.length > 0
            ? filteredCategories.map((cat: any) => (
              <FilterOption
                key={cat.id}
                label={`${cat.name} (${cat.vehicle_count})`}
                checked={isChecked('category', String(cat.id))}
                onToggle={() => handleToggle('category', String(cat.id))}
              />
            ))
            : <div className="text-xs text-gray-500 px-2 py-1">No categories available</div>
          }
        </FilterSection>

        {/* Suppliers */}
        <FilterSection title="Suppliers">
          {filteredSuppliers && filteredSuppliers.length > 0
            ? filteredSuppliers.map((sup: any) => (
              <FilterOption
                key={sup.id}
                label={`${sup.name} (${sup.vehicle_count})`}
                checked={isChecked('supplier', String(sup.id))}
                onToggle={() => handleToggle('supplier', String(sup.id))}
              />
            ))
            : filterOptions.suppliers.map(opt => (
              <FilterOption
                key={opt.value}
                label={opt.label}
                checked={isChecked('supplier', opt.value)}
                onToggle={() => handleToggle('supplier', opt.value)}
              />
            ))
          }
        </FilterSection>

        {/* Payment Types */}
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

        {/* Number of seats */}
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

        {/* Fuel */}
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

        {/* Suitcase */}
        <FilterSection title="Suitcase">
          {filterOptions.suitcases.map(opt => (
            <FilterOption
              key={opt.value}
              label={opt.label}
              checked={isChecked('suitcases', opt.value)}
              onToggle={() => handleToggle('suitcases', opt.value)}
            />
          ))}
        </FilterSection>

        {/* Air Conditioner */}
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

        {/* Transmission */}
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

        {/* Doors */}
        <FilterSection title="Doors">
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
// SIMPLE & CLEAN PRICE RANGE SLIDER
// ═══════════════════════════════════════════════════════════════
function SimplePriceRange({
  minPrice,
  maxPrice,
  currentMin,
  currentMax,
  currencyCode,
  onChange
}: {
  minPrice: number;
  maxPrice: number;
  currentMin: number;
  currentMax: number;
  currencyCode: Currency;
  onChange: (min: number, max: number) => void;
}) {
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

    const handleMouseUp = () => {
      setDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, currentMin, currentMax, minPrice, maxPrice, onChange, getValueFromPosition]);

  // Touch support
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

    const handleTouchEnd = () => {
      setDragging(null);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging, currentMin, currentMax, minPrice, maxPrice, onChange, getValueFromPosition]);

  return (
    <div className="relative px-2 pt-8 pb-2 select-none">
      {/* Floating Price Labels - Small & Clean */}
      <div className="relative h-7 mb-1">
        {/* Min Label */}
        <div
          className="absolute top-0 -translate-x-1/2 z-10"
          style={{ left: `${minPct}%` }}
        >
          <div className={`
            px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm
            transition-colors duration-150
            ${dragging === 'min' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200'}
          `}>
            {formatPrice(currentMin, currencyCode)}
          </div>
        </div>

        {/* Max Label */}
        <div
          className="absolute top-0 -translate-x-1/2 z-10"
          style={{ left: `${maxPct}%` }}
        >
          <div className={`
            px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm
            transition-colors duration-150
            ${dragging === 'max' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200'}
          `}>
            {formatPrice(currentMax, currencyCode)}
          </div>
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-10 flex items-center cursor-pointer"
      >
        {/* Background Track */}
        <div className="absolute inset-x-0 h-1.5 bg-gray-200 rounded-full">
          {/* Active Track */}
          <div
            className="absolute h-full rounded-full bg-primary"
            style={{
              left: `${minPct}%`,
              width: `${maxPct - minPct}%`,
            }}
          />
        </div>

        {/* Min Thumb */}
        <div
          className="absolute w-5 h-5 -ml-2.5 cursor-grab active:cursor-grabbing z-20"
          style={{ left: `${minPct}%` }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={(e) => {
            e.preventDefault();
            setDragging('min');
          }}
        >
          <div className={`
            w-full h-full rounded-full border-2 shadow-md
            transition-all duration-150
            ${dragging === 'min'
              ? 'bg-primary border-primary scale-110'
              : 'bg-white border-gray-300 hover:border-primary'
            }
          `} />
        </div>

        {/* Max Thumb */}
        <div
          className="absolute w-5 h-5 -ml-2.5 cursor-grab active:cursor-grabbing z-20"
          style={{ left: `${maxPct}%` }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={(e) => {
            e.preventDefault();
            setDragging('max');
          }}
        >
          <div className={`
            w-full h-full rounded-full border-2 shadow-md
            transition-all duration-150
            ${dragging === 'max'
              ? 'bg-primary border-primary scale-110'
              : 'bg-white border-gray-300 hover:border-primary'
            }
          `} />
        </div>
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between mt-1 px-1">
        <span className="text-[11px] text-gray-400">{formatPrice(minPrice, currencyCode)}</span>
        <span className="text-[11px] text-gray-400">{formatPrice(maxPrice, currencyCode)}</span>
      </div>
    </div>
  );
}

// Accordion section with animation
function FilterSection({ title, children, badge, expanded = false }: any) {
  const [isOpen, setIsOpen] = useState(expanded);
  return (
    <div className="px-4 py-3.5 hover:bg-gray-50/50 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-gray-800 group-hover:text-primary transition-colors">{title}</span>
          {badge && (
            <span className="bg-primary/10 text-primary-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown size={16} className={`text-gray-400 transition-colors ${isOpen ? 'text-primary' : ''}`} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-1.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Animated checkbox
function FilterOption({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <label
      className="flex items-center justify-between group cursor-pointer py-1.5 px-1 rounded-lg hover:bg-gray-50 transition-colors"
      onClick={(e) => {
        e.preventDefault();
        onToggle();
      }}
    >
      <span className="text-[13px] font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>

      <div className="relative w-5 h-5">
        {/* Background/unchecked state */}
        <motion.div
          className="absolute inset-0 rounded-md border-2 border-gray-200 bg-white"
          animate={{
            borderColor: checked ? "#f4d849" : "#E5E7EB",
            backgroundColor: checked ? "#f4d849" : "#FFFFFF",
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Check mark with animation */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            scale: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            duration: 0.2
          }}
        >
          <Check size={12} className="text-gray-900" strokeWidth={3} />
        </motion.div>

        {/* Ripple effect on click */}
        <AnimatePresence>
          {checked && (
            <motion.div
              className="absolute inset-0 rounded-md bg-primary/30"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>
      </div>
    </label>
  );
}