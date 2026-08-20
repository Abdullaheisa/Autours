'use client';

import { useState, useEffect, useCallback, useRef, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, AlertCircle, Search, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { setSearchParams, setFilterParams, fetchVehicles, setPage, resetFilters } from '@/store/slices/searchSlice';
import type { FilterPayload } from '@/types';
import { FILTER_SPEC_NAMES } from '@/constants/filterSpecNames';

function SearchPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const urlParams = useSearchParams();
  const currencyCode = useSelector((state: RootState) => state.currency.code);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);

  // 🔒 قفل الـ scroll لما الـ drawer يفتح
  useEffect(() => {
    if (isSearchDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchDrawerOpen]);



  const {
    searchParams,
    filterParams,
    vehicles,
    daysNumber,
    maxPrice,
    minPrice,
    isFiltering,
    filterError,
    hasSearched,
    currentPage,
    totalPages,
    perPage,
    count,
  } = useSelector((state: RootState) => state.search);

  const buildFilterPayload = useCallback((): FilterPayload | null => {
    if (!searchParams.location || !searchParams.dateFrom || !searchParams.dateTo) return null;

    const payload: FilterPayload = {
      pickupLoc: searchParams.location,
      date_from: searchParams.dateFrom,
      date_to: searchParams.dateTo,
      time_from: searchParams.startTime || '10:00',
      time_to: searchParams.endTime || '10:00',
      currency: ['USD', 'EGP', 'SAR', 'AED', 'QAR', 'OMR', 'KWD', 'BHD', 'JOD', 'MAD', 'TRY', 'GEL'].includes(currencyCode) ? currencyCode : 'AED',
      page: currentPage,
      per_page: perPage,
    };

    if (filterParams.category.length > 0) {
      payload.category = filterParams.category.map(Number).filter(id => !isNaN(id));
    }
    if (filterParams.supplier.length > 0) {
      payload.supplier = filterParams.supplier.map(Number).filter(id => !isNaN(id));
    }
    // 🚀 PAYMENT TYPE FIX: Map names ("Pay on Arrival") to integer IDs
    if (filterParams.paymentType.length > 0) {
      const PAYMENT_METHOD_MAP: Record<string, number> = {
        'Pay on Arrival': 1,
        'Pay in Full': 2,
        'Deposit Required': 3,
      };
      const mappedPaymentIds = filterParams.paymentType
        .map((name: string) => PAYMENT_METHOD_MAP[name] || parseInt(name, 10))
        .filter((id: number) => !isNaN(id) && id > 0);

      if (mappedPaymentIds.length > 0) {
        payload.payment_methods = mappedPaymentIds;
      }
    }

    // 🚀 LOCATION TYPE FIX: Map names ("Terminal", "Airport") to integer IDs
    if (filterParams.locationType.length > 0) {
      const LOCATION_TYPE_MAP: Record<string, number> = {
        'Terminal': 1,
        'Airport': 2,
        'Meet & Greet': 3,
      };

      const mappedIds = filterParams.locationType
        .map((name: string) => LOCATION_TYPE_MAP[name] || parseInt(name, 10))
        .filter((id: number) => !isNaN(id) && id > 0);

      if (mappedIds.length > 0) {
        payload.location_type_id = mappedIds;
      }
    }

    if (filterParams.priceRange) {
      payload.priceRange = filterParams.priceRange[1];
    }

    // 🚀 SPECIFICATIONS FIX: Strictly formatted array of objects, skipping empty arrays
    const specifications: { name: string; option: string[] }[] = [];

    if (filterParams.seats && filterParams.seats.length > 0) specifications.push({ name: FILTER_SPEC_NAMES.seats, option: filterParams.seats });
    if (filterParams.doors && filterParams.doors.length > 0) specifications.push({ name: FILTER_SPEC_NAMES.doors, option: filterParams.doors });

    if (filterParams.transmission && filterParams.transmission.length > 0) {
      specifications.push({ name: FILTER_SPEC_NAMES.transmission, option: filterParams.transmission });
    }

    if (filterParams.fuelType && filterParams.fuelType.length > 0) {
      const mappedFuel = filterParams.fuelType.map(f => f === 'Hybrid' ? 'Hybrid Petrol & Gas' : f);
      specifications.push({ name: FILTER_SPEC_NAMES.fuelType, option: mappedFuel });
    }

    if (filterParams.suitcases && filterParams.suitcases.length > 0) {
      const mappedSuitcases = filterParams.suitcases.map(s => s === 'Large' ? 'large' : s);
      specifications.push({ name: FILTER_SPEC_NAMES.suitcases, option: mappedSuitcases });
    }

    // Only send Air Conditioning if explicitly requested (ignore "No Air Conditioning" as it's not a DB feature)
    if (filterParams.airConditioning === 'Air Conditioning') {
      specifications.push({ name: FILTER_SPEC_NAMES.airConditioning, option: ['cool & Heat', 'Air Conditioning', 'Yes'] });
    }

    if (specifications.length > 0) {
      payload.specifications = specifications;
    }

    if (filterParams.rating !== null && filterParams.rating !== undefined) payload.rating = filterParams.rating;
    if (filterParams.sortBy) payload.sortBy = filterParams.sortBy;

    return payload;
  }, [searchParams, filterParams, currencyCode, currentPage, perPage]);

  const doFetchVehicles = useCallback(() => {
    const payload = buildFilterPayload();
    if (payload) {
      dispatch(fetchVehicles(payload));
    }
  }, [buildFilterPayload, dispatch]);

  useEffect(() => {
    const location = urlParams.get('location');
    const locationLabel = urlParams.get('locationLabel');
    const start = urlParams.get('start');
    const end = urlParams.get('end');
    const supplierParam = urlParams.get('supplier');

    if (location && start && end) {
      dispatch(setSearchParams({
        location, locationLabel: locationLabel || location, dateFrom: start, dateTo: end,
        startTime: urlParams.get('st') || '10:00', endTime: urlParams.get('et') || '10:00',
      }));
    }

    if (supplierParam) {
      dispatch(setFilterParams({ supplier: [supplierParam] }));
    }
  }, [urlParams, dispatch]);

  const lastSearchQuery = useRef<string>('');

  const backendFiltersStr = useMemo(() => {
    return JSON.stringify(filterParams);
  }, [filterParams]);

  useEffect(() => {
    if (searchParams.location && searchParams.dateFrom && searchParams.dateTo) {
      const currentQuery = `${searchParams.location}|${searchParams.dateFrom}|${searchParams.dateTo}|${searchParams.startTime}|${searchParams.endTime}`;
      
      if (lastSearchQuery.current && lastSearchQuery.current !== currentQuery) {
        lastSearchQuery.current = currentQuery;
        dispatch(resetFilters());
        return; // The filter reset will trigger the next run
      }
      
      lastSearchQuery.current = currentQuery;
      doFetchVehicles();
    }
  }, [
    searchParams.location,
    searchParams.dateFrom,
    searchParams.dateTo,
    searchParams.startTime,
    searchParams.endTime,
    backendFiltersStr,
    currencyCode,
    currentPage,
    doFetchVehicles,
    dispatch
  ]);

  const handleFilterChange = useCallback(() => {
    // No-op because the unified useEffect already watches backendFiltersStr
  }, []);

  const handleReSearch = useCallback(() => {
    setIsSearchDrawerOpen(false);
  }, []);

  const displayedVehicles = useMemo(() => {
    return vehicles;
  }, [vehicles]);



  const hasValidSearch = searchParams.location && searchParams.dateFrom && searchParams.dateTo;

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="lg:hidden">
        <Stepper currentStep={2} />
        <div className="px-4 pt-3 pb-2">
          <SearchSummary onEditClick={() => setIsSearchDrawerOpen(true)} />
        </div>
      </div>
      <div className="hidden lg:block"><Stepper currentStep={2} /></div>

      <div className="max-w-[1400px] xl:max-w-[90rem] 2xl:max-w-[95rem] mx-auto px-4 py-8">
        {!hasValidSearch ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-6">
              <AlertCircle size={32} className="text-gray-500" /> {/* 🚀 Accessibility Fix */}
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">No Search Data</h2>
            <p className="text-sm text-gray-500 max-w-md mb-6">Please go back to the home page and enter your criteria.</p>
            <a href="/" className="px-8 py-3.5 bg-[var(--primary)] text-gray-900 rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] transition-all">Go to Home</a>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <aside className="w-full lg:w-[250px] xl:w-[280px] 2xl:w-[320px] shrink-0 space-y-4">
              <div className="hidden lg:block"><SearchSummary /></div>
              <div className="hidden lg:block"><ResultsSearchBar onSearch={handleReSearch} isOpen={true} /></div>
              <div className="hidden lg:block"><SearchFilters onFilterChange={handleFilterChange} /></div>
            </aside>

            <div className="flex-1 w-full min-w-0 space-y-4">
              <CategoryFilterBar />

              <div className="lg:hidden">
                <SearchFilters onFilterChange={handleFilterChange} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900 tracking-tight">
                    {isFiltering && displayedVehicles.length === 0 ? 'Searching...' : `Showing ${displayedVehicles.length} of ${count || displayedVehicles.length} Cars`}
                  </h2>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5"> {/* 🚀 Accessibility Fix */}
                    {searchParams.locationLabel || searchParams.location} • {daysNumber} {daysNumber === 1 ? 'day' : 'days'}
                  </p>
                </div>
                {minPrice > 0 && maxPrice > 0 && !isFiltering && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Price Range</p> {/* 🚀 Accessibility Fix */}
                    <p className="text-sm font-black text-gray-900">{currencyCode} {minPrice.toFixed(0)} – {currencyCode} {maxPrice.toFixed(0)}</p>
                  </div>
                )}
              </div>

              {isFiltering && currentPage === 1 && (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => <CarCardSkeleton key={i} />)}
                </div>
              )}

              {filterError && !isFiltering && (
                <div className="bg-white border border-red-200 rounded-2xl p-6 text-center shadow-sm">
                  <AlertCircle size={24} className="text-red-500 mx-auto mb-3" />
                  <p className="text-sm font-bold text-red-700 mb-4">{filterError}</p>
                  <button onClick={doFetchVehicles} className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors">Try Again</button>
                </div>
              )}

              {!isFiltering && !filterError && hasSearched && displayedVehicles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-200">
                  <Car size={32} className="text-gray-400 mb-4" />
                  <h3 className="text-lg font-black text-gray-900 mb-1">No Cars Found</h3>
                  <p className="text-sm text-gray-500">Try adjusting your filters or selecting another category.</p>
                </div>
              )}

              {!filterError && displayedVehicles.length > 0 && !(isFiltering && currentPage === 1) && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`vehicles-${displayedVehicles.length}-${filterParams.priceRange}`}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {displayedVehicles.map((vehicle) => (
                      <CarCard key={vehicle.id} vehicle={vehicle} daysNumber={daysNumber} />
                    ))}

                    {/* See More Button */}
                    {currentPage < totalPages && (
                      <div className="pt-6 pb-4 flex justify-center items-center">
                        <button
                          onClick={() => dispatch(setPage(currentPage + 1))}
                          disabled={isFiltering}
                          className="px-10 py-3.5 bg-white border border-gray-200 text-gray-800 font-bold rounded-xl shadow-sm hover:bg-gray-50 hover:text-[var(--primary)] hover:border-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                          {isFiltering ? (
                            <>
                              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              Loading...
                            </>
                          ) : 'See More'}
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* 🔍 Mobile/Tablet Search Drawer - يفتح لما تضغط القلم */}
      <AnimatePresence>
        {isSearchDrawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm lg:hidden"
              onClick={() => setIsSearchDrawerOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-white z-[9999] shadow-2xl flex flex-col lg:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-100 bg-yellow-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Search size={16} className="text-gray-900" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">Modify Search</h3>
                </div>
                <button
                  onClick={() => setIsSearchDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                  aria-label="Close search drawer"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <ResultsSearchBar
                  onSearch={handleReSearch}
                  isOpen={true}
                  preventRedirect={false}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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