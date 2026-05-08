'use client';

import { useState, useEffect } from 'react';
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
  const { filterParams, minPrice, maxPrice, searchParams } = useSelector((state: RootState) => state.search);
  const { code: currencyCode, rate: currencyRate } = useSelector((state: RootState) => state.currency);

  // Trigger API fetch when filters change
  useEffect(() => {
    if (onFilterChange) onFilterChange();
    
    // We don't call fetchVehicles directly here to avoid infinite loops 
    // if onFilterChange also triggers a fetch. 
    // The Results page should handle the orchestration.
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
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
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
  onClearAll 
}: any) {
  const dispatch = useDispatch<AppDispatch>();

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Current priceRange is [min, max]
    const val = parseInt(e.target.value);
    dispatch(setFilterParams({ priceRange: [minPrice, val] }));
  };

  const isChecked = (key: string, value: string) => {
    const current = (filterParams as any)[key];
    return Array.isArray(current) ? current.includes(value) : current === value;
  };

  const handleToggle = (key: string, value: string) => {
    dispatch(toggleFilterParam({ key: key as any, value }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-300/40 overflow-hidden">
      <div className="bg-gray-100 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Filter By</h3>
        <button 
          onClick={onClearAll}
          className="text-[10px] font-bold text-primary-600 hover:underline uppercase tracking-wider"
        >
          Clear All
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {/* Price Range */}
        <FilterSection 
          title="Price Range" 
          expanded
        >
          <div className="pt-6 pb-4 px-2">
            {/* Current value bubble with arrow */}
            {(() => {
              const currentVal = filterParams.priceRange ? filterParams.priceRange[1] : maxPrice;
              const range = maxPrice - minPrice || 1;
              const pct = ((currentVal - minPrice) / range) * 100;
              const clampedPct = Math.min(Math.max(pct, 0), 100);
              const offset = `calc(${clampedPct}% - ${clampedPct * 0.18}px)`;
              return (
                <div className="relative mb-5 h-7">
                  <div
                    className="absolute -top-0 flex flex-col items-center pointer-events-none"
                    style={{ left: offset, transform: 'translateX(-50%)' }}
                  >
                    <div className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg">
                      {formatPrice(currentVal, currencyCode)}
                    </div>
                    {/* Arrow */}
                    <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-900" />
                  </div>
                </div>
              );
            })()}

            {/* Slider with filled track */}
            {(() => {
              const currentVal = filterParams.priceRange ? filterParams.priceRange[1] : maxPrice;
              const range = maxPrice - minPrice || 1;
              const pct = Math.min(Math.max(((currentVal - minPrice) / range) * 100, 0), 100);
              return (
                <div className="relative">
                  {/* Background track */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full" />
                  {/* Filled track */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 left-0 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                    style={{ width: `${pct}%` }}
                  />
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={currentVal}
                    onChange={handlePriceChange}
                    className="relative w-full h-2 bg-transparent rounded-full appearance-none cursor-pointer accent-yellow-400 z-10"
                    style={{ WebkitAppearance: 'none' } as any}
                  />
                </div>
              );
            })()}

            {/* Min / Max labels */}
            <div className="flex justify-between mt-3">
              <div className="text-center">
                <div className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Min</div>
                <div className="text-[11px] font-bold text-gray-700">{formatPrice(minPrice, currencyCode)}</div>
              </div>
              <div className="text-center">
                <div className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Max</div>
                <div className="text-[11px] font-bold text-gray-700">{formatPrice(maxPrice, currencyCode)}</div>
              </div>
            </div>
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

        {/* Suppliers */}
        <FilterSection title="Suppliers">
          {filterOptions.suppliers.map(opt => (
            <FilterOption 
              key={opt.value} 
              label={opt.label} 
              checked={isChecked('supplier', opt.value)}
              onToggle={() => handleToggle('supplier', opt.value)}
            />
          ))}
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