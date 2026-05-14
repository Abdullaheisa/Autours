'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, AlertCircle, Search, X } from 'lucide-react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import Stepper from './components/Stepper';
import SearchSummary from './components/SearchSummary';
import ResultsSearchBar from './components/ResultsSearchBar';
import SearchFilters from './components/SearchFilters';
import CarCard from './components/CarCard';
import CarCardSkeleton from './components/CarCardSkeleton';
import CategoryFilterBar from './components/CategoryFilterBar';
import { RootState, AppDispatch } from '@/store';
import {
  setSearchParams,
  fetchVehicles,
} from '@/store/slices/searchSlice';
import type { FilterPayload } from '@/types';

function SearchPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const urlParams = useSearchParams();
  const currencyCode = useSelector((state: RootState) => state.currency.code);

  // Mobile drawers state
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);

  const {
    searchParams,
    filterParams,
    vehicles,
    count,
    daysNumber,
    maxPrice,
    minPrice,
    isFiltering,
    filterError,
    hasSearched,
  } = useSelector((state: RootState) => state.search);

  const buildFilterPayload = useCallback((): FilterPayload | null => {
    const loc = searchParams.location;
    const from = searchParams.dateFrom;
    const to = searchParams.dateTo;

    if (!loc || !from || !to) return null;

    const payload: FilterPayload = {
      pickupLoc: loc,
      date_from: from,
      date_to: to,
      time_from: searchParams.startTime || '10:00',
      time_to: searchParams.endTime || '10:00',
      currency: currencyCode,
    };

    if (filterParams.priceRange) payload.priceRange = filterParams.priceRange[1];
    if (filterParams.category.length > 0) payload.category = filterParams.category;
    if (filterParams.supplier.length > 0) payload.supplier = filterParams.supplier;
    if (filterParams.locationType.length > 0) payload.location_type_id = filterParams.locationType;
    if (filterParams.paymentType.length > 0) payload.payment_methods = filterParams.paymentType;

    // Group specifications
    const specifications: { name: string; option: string[] }[] = [];
    if (filterParams.seats.length > 0) specifications.push({ name: 'seats', option: filterParams.seats });
    if (filterParams.doors.length > 0) specifications.push({ name: 'doors', option: filterParams.doors });
    if (filterParams.transmission.length > 0) specifications.push({ name: 'transmission', option: filterParams.transmission });
    if (filterParams.fuelType.length > 0) specifications.push({ name: 'fuel_type', option: filterParams.fuelType });
    if (filterParams.suitcases.length > 0) specifications.push({ name: 'suitcases', option: filterParams.suitcases });
    if (filterParams.airConditioning) specifications.push({ name: 'ac', option: [filterParams.airConditioning] });

    if (specifications.length > 0) payload.specifications = specifications;

    if (filterParams.rating !== null) payload.rating = filterParams.rating;
    if (filterParams.sortBy) payload.sortBy = filterParams.sortBy;

    return payload;
  }, [searchParams, filterParams, currencyCode]);

  const doFetchVehicles = useCallback(() => {
    const payload = buildFilterPayload();
    if (payload) {
      dispatch(fetchVehicles(payload));
    }
  }, [buildFilterPayload, dispatch]);

  useEffect(() => {
    const location = urlParams.get('location');
    const start = urlParams.get('start');
    const end = urlParams.get('end');
    const st = urlParams.get('st');
    const et = urlParams.get('et');

    if (location && start && end) {
      dispatch(setSearchParams({
        location,
        dateFrom: start,
        dateTo: end,
        startTime: st || '10:00',
        endTime: et || '10:00',
      }));
    }
  }, [urlParams, dispatch]);

  useEffect(() => {
    if (searchParams.location && searchParams.dateFrom && searchParams.dateTo) {
      doFetchVehicles();
    }
  }, [searchParams.location, searchParams.dateFrom, searchParams.dateTo, currencyCode]);

  const handleFilterChange = useCallback(() => {
    setTimeout(() => {
      doFetchVehicles();
    }, 50);
  }, [doFetchVehicles]);

  const handleReSearch = useCallback(() => {
    setTimeout(() => {
      doFetchVehicles();
    }, 100);
    setIsSearchDrawerOpen(false);
  }, [doFetchVehicles]);

  const hasValidSearch = searchParams.location && searchParams.dateFrom && searchParams.dateTo;

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="md:hidden">
        <Stepper currentStep={2} />
        <div className="px-4 pt-3 pb-2">
          <SearchSummary
            onEditClick={() => setIsSearchDrawerOpen(true)}
          />
        </div>
      </div>

      <div className="hidden md:block">
        <Stepper currentStep={2} />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {!hasValidSearch ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-6">
              <AlertCircle size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">No Search Data</h2>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              Please go back to the home page and enter your pickup location and dates to search for available cars.
            </p>
            <a
              href="/"
              className="px-8 py-3.5 bg-primary text-gray-900 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Go to Home Page
            </a>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <aside className="w-full md:w-[280px] lg:w-[320px] shrink-0 space-y-4">
              <div className="hidden md:block">
                <SearchSummary />
              </div>
              <div className="hidden md:block">
                <ResultsSearchBar
                  onSearch={handleReSearch}
                  isOpen={true}
                />
              </div>
              <div className="hidden md:block">
                <SearchFilters onFilterChange={handleFilterChange} />
              </div>
            </aside>

            <div className="flex-1 w-full min-w-0 space-y-4">
              <CategoryFilterBar onFilterChange={handleFilterChange} />

              <div className="md:hidden">
                <SearchFilters onFilterChange={handleFilterChange} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900 tracking-tight">
                    {isFiltering ? 'Searching...' : `${count} Cars Available`}
                  </h2>
                  <p className="text-xs font-semibold text-gray-400 mt-0.5">
                    {searchParams.location} • {daysNumber} {daysNumber === 1 ? 'day' : 'days'}
                  </p>
                </div>

                {minPrice > 0 && maxPrice > 0 && !isFiltering && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price Range</p>
                    <p className="text-sm font-black text-gray-900">
                      {currencyCode} {minPrice.toFixed(0)} – {currencyCode} {maxPrice.toFixed(0)}
                    </p>
                  </div>
                )}
              </div>

              {isFiltering && (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <CarCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {filterError && !isFiltering && (
                <div className="bg-white border border-red-200 rounded-2xl p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                  <AlertCircle size={24} className="text-red-500 mx-auto mb-3" />
                  <p className="text-sm font-bold text-red-700 mb-1">Failed to load vehicles</p>
                  <p className="text-xs text-red-500 mb-4">{filterError}</p>
                  <button
                    onClick={doFetchVehicles}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!isFiltering && !filterError && hasSearched && vehicles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-6">
                    <Car size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">No Cars Found</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    We couldn't find any cars matching your criteria. Try adjusting your dates, location, or filters.
                  </p>
                </div>
              )}

              {!isFiltering && !filterError && vehicles.length > 0 && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`vehicles-${vehicles.length}-${filterParams.priceRange}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {vehicles.map((vehicle) => (
                      <CarCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        daysNumber={daysNumber}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isSearchDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm"
              onClick={() => setIsSearchDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-white z-[9999] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Search size={16} className="text-gray-900" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">Modify Search</h3>
                </div>
                <button onClick={() => setIsSearchDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ResultsSearchBar
                  onSearch={handleReSearch}
                  isOpen={true}
                  onClose={() => setIsSearchDrawerOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}