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
import { setSearchParams, fetchVehicles, setPage } from '@/store/slices/searchSlice';
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

  const searchParamsRef = useRef(searchParams);
  const filterParamsRef = useRef(filterParams);
  const currencyCodeRef = useRef(currencyCode);
  const currentPageRef = useRef(currentPage);
  const perPageRef = useRef(perPage);

  searchParamsRef.current = searchParams;
  filterParamsRef.current = filterParams;
  currencyCodeRef.current = currencyCode;
  currentPageRef.current = currentPage;
  perPageRef.current = perPage;

  const buildFilterPayload = useCallback((): FilterPayload | null => {
    const sp = searchParamsRef.current;
    const fp = filterParamsRef.current;
    const cc = currencyCodeRef.current;

    if (!sp.location || !sp.dateFrom || !sp.dateTo) return null;

    const payload: FilterPayload = {
      pickupLoc: sp.location,
      date_from: sp.dateFrom,
      date_to: sp.dateTo,
      time_from: sp.startTime || '10:00',
      time_to: sp.endTime || '10:00',
      currency: ['USD', 'EGP', 'SAR', 'AED', 'QAR', 'OMR', 'KWD', 'BHD', 'JOD'].includes(cc) ? cc : 'AED',
      page: currentPageRef.current,
      per_page: perPageRef.current,
    };

    if (fp.category.length > 0) {
      payload.category = fp.category.map(Number).filter(id => !isNaN(id));
    }
    if (fp.supplier.length > 0) {
      payload.supplier = fp.supplier.map(Number).filter(id => !isNaN(id));
    }
    // 🚀 PAYMENT TYPE FIX: Map names ("Pay on Arrival") to integer IDs
    if (fp.paymentType.length > 0) {
      const PAYMENT_METHOD_MAP: Record<string, number> = {
        'Pay on Arrival': 1,
        'Pay in Full': 2,
        'Deposit Required': 3,
      };
      const mappedPaymentIds = fp.paymentType
        .map((name: string) => PAYMENT_METHOD_MAP[name] || parseInt(name, 10))
        .filter((id: number) => !isNaN(id) && id > 0);

      if (mappedPaymentIds.length > 0) {
        payload.payment_methods = mappedPaymentIds;
      }
    }

    // 🚀 LOCATION TYPE FIX: Map names ("Terminal", "Airport") to integer IDs
    if (fp.locationType.length > 0) {
      const LOCATION_TYPE_MAP: Record<string, number> = {
        'Terminal': 1,
        'Airport': 2,
        'Meet & Greet': 3,
      };

      const mappedIds = fp.locationType
        .map((name: string) => LOCATION_TYPE_MAP[name] || parseInt(name, 10))
        .filter((id: number) => !isNaN(id) && id > 0);

      if (mappedIds.length > 0) {
        payload.location_type_id = mappedIds;
      }
    }

    if (fp.priceRange) {
      payload.priceRange = fp.priceRange[1];
    }

    // 🚀 SPECIFICATIONS FIX: Strictly formatted array of objects, skipping empty arrays
    const specifications: { name: string; option: string[] }[] = [];

    if (fp.seats && fp.seats.length > 0) specifications.push({ name: FILTER_SPEC_NAMES.seats, option: fp.seats });
    if (fp.doors && fp.doors.length > 0) specifications.push({ name: FILTER_SPEC_NAMES.doors, option: fp.doors });

    if (fp.transmission && fp.transmission.length > 0) {
      specifications.push({ name: FILTER_SPEC_NAMES.transmission, option: fp.transmission });
    }

    if (fp.fuelType && fp.fuelType.length > 0) {
      const mappedFuel = fp.fuelType.map(f => f === 'Hybrid' ? 'Hybrid Petrol & Gas' : f);
      specifications.push({ name: FILTER_SPEC_NAMES.fuelType, option: mappedFuel });
    }

    if (fp.suitcases && fp.suitcases.length > 0) {
      const mappedSuitcases = fp.suitcases.map(s => s === 'Large' ? 'large' : s);
      specifications.push({ name: FILTER_SPEC_NAMES.suitcases, option: mappedSuitcases });
    }

    // Only send Air Conditioning if explicitly requested (ignore "No Air Conditioning" as it's not a DB feature)
    if (fp.airConditioning === 'Air Conditioning') {
      specifications.push({ name: FILTER_SPEC_NAMES.airConditioning, option: ['cool & Heat', 'Air Conditioning', 'Yes'] });
    }

    if (specifications.length > 0) {
      payload.specifications = specifications;
    }

    if (fp.rating !== null && fp.rating !== undefined) payload.rating = fp.rating;
    if (fp.sortBy) payload.sortBy = fp.sortBy;

    return payload;
  }, []);

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
    if (location && start && end) {
      dispatch(setSearchParams({
        location, locationLabel: locationLabel || location, dateFrom: start, dateTo: end,
        startTime: urlParams.get('st') || '10:00', endTime: urlParams.get('et') || '10:00',
      }));
    }
  }, [urlParams, dispatch]);

  useEffect(() => {
    if (searchParams.location && searchParams.dateFrom && searchParams.dateTo) {
      doFetchVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.location, searchParams.dateFrom, searchParams.dateTo]);

  const backendFiltersStr = useMemo(() => {
    // Include all filter params (including category) to trigger backend re-fetch on any change
    return JSON.stringify(filterParams);
  }, [filterParams]);

  const isFirstFilterRender = useRef(true);
  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    doFetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendFiltersStr, currentPage]);

  const handleFilterChange = useCallback(() => {
    doFetchVehicles();
  }, [doFetchVehicles]);

  const handleReSearch = useCallback(() => {
    setTimeout(() => { doFetchVehicles(); }, 100);
    setIsSearchDrawerOpen(false);
  }, [doFetchVehicles]);

  const displayedVehicles = useMemo(() => {
    let result = vehicles;

    // 1. Price Range Client Filter
    if (filterParams.priceRange) {
      const [min, max] = filterParams.priceRange;
      result = result.filter((vehicle: any) => {
        const price = Number(vehicle.final_price || vehicle.price || 0);
        return price >= min && price <= max;
      });
    }

    // 2. 🚀 STRICT CLIENT-SIDE ENFORCEMENT: Fix Legacy "Fail-Open" Bug
    const hasSpec = (vehicle: any, specName: string, selectedOptions: string[]) => {
      if (!selectedOptions || selectedOptions.length === 0) return true;
      const vehicleSpec = vehicle.specifications?.find((s: any) => s.name === specName);
      if (!vehicleSpec) return false;

      const val = vehicleSpec.option || vehicleSpec.value;
      if (!val) return false;

      // Strict exact match
      if (selectedOptions.includes(val)) return true;

      // Fallback: Handle numerical matches (e.g., '4' vs '4 Seats') just in case
      return selectedOptions.some(opt => String(opt).trim() === String(val).trim() || String(val).includes(String(opt).trim()));
    };

    if (filterParams.seats && filterParams.seats.length > 0) {
      result = result.filter((v: any) => {
        const vSeats = v.seats ? String(v.seats) : '';
        return filterParams.seats.includes(vSeats) || filterParams.seats.some(opt => vSeats.includes(opt));
      });
    }
    if (filterParams.doors && filterParams.doors.length > 0) {
      result = result.filter((v: any) => {
        const vDoors = v.doors ? String(v.doors) : '';
        return filterParams.doors.includes(vDoors) || filterParams.doors.some(opt => vDoors.includes(opt));
      });
    }
    if (filterParams.transmission && filterParams.transmission.length > 0) {
      result = result.filter((v: any) => {
        // First check the normalized transmission property
        if (v.transmission && filterParams.transmission.some(t => v.transmission.toLowerCase().includes(t.toLowerCase()))) {
          return true;
        }
        // Fallback to strict spec match
        const mappedTrans = filterParams.transmission.map(t => t === 'Automatic' ? 'Automatic Transmission' : 'Manual Transmission');
        return hasSpec(v, FILTER_SPEC_NAMES.transmission, mappedTrans);
      });
    }
    if (filterParams.fuelType && filterParams.fuelType.length > 0) {
      const mappedFuel = filterParams.fuelType.map(f => f === 'Hybrid' ? 'Hybrid Petrol & Gas' : f);
      result = result.filter((v: any) => hasSpec(v, FILTER_SPEC_NAMES.fuelType, mappedFuel));
    }
    if (filterParams.suitcases && filterParams.suitcases.length > 0) {
      const mappedSuitcases = filterParams.suitcases.map(s => s === 'Large' ? 'large' : s);
      result = result.filter((v: any) => hasSpec(v, FILTER_SPEC_NAMES.suitcases, mappedSuitcases));
    }

    // Air Conditioning Strict Client-Side check
    if (filterParams.airConditioning === 'Air Conditioning') {
      result = result.filter((v: any) => {
        const acSpec = v.specifications?.find((s: any) => s.name === FILTER_SPEC_NAMES.airConditioning);
        if (!acSpec) return false;
        const val = acSpec.option || acSpec.value;
        return val === 'cool & Heat' || val === 'Air Conditioning' || val === 'Yes';
      });
    } else if (filterParams.airConditioning === 'No Air Conditioning') {
      result = result.filter((v: any) => {
        const acSpec = v.specifications?.find((s: any) => s.name === FILTER_SPEC_NAMES.airConditioning);
        if (!acSpec) return true;
        const val = acSpec.option || acSpec.value;
        return val !== 'cool & Heat' && val !== 'Air Conditioning' && val !== 'Yes';
      });
    }



    return result;
  }, [vehicles, filterParams]);



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

              {isFiltering && displayedVehicles.length === 0 && (
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

              {!filterError && displayedVehicles.length > 0 && (
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