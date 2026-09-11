'use client';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search, MapPin, Calendar, Clock,
  Plane, Building, AlertCircle, Check, X, ChevronDown,
  Minus, Plus, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import CalendarRangePicker from '@/components/shared/CalendarRangePicker';
import { assets } from '@/config/assets';
import { RootState, AppDispatch } from '@/store';
import { setSearchParams } from '@/store/slices/searchSlice';
import { setCurrency } from '@/store/slices/currencySlice';
import { vehicleApi } from '@/services/api/vehicleApi';
import { referenceApi } from '@/services/api';
import { LocationBranch } from '@/types';
import { getLocationDisplayLabel, getLocationPickupValue } from '@/utils/location';
import { worldCountries, WorldCountry } from '@/data/worldCountries';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function resolveImageUrl(path: string | undefined, fallback: string): string {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
}

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, '0')}:00`
);

const DEFAULT_COUNTRY: WorldCountry = {
  name: "Egypt",
  code: "+20",
  iso: "EG",
  currency: "EGP"
};

const TRUST_BADGES = [
  'Free Cancelation',
  'Free Amendment',
  'No Credit Card Fees',
  'No Hidden Fees',
];

interface HeroSearchProps {
  title?: string;
  titleHighlight?: string;
  bottomText?: string;
  badge?: string;
}

export default function HeroSearch({
  title = "Car Rentals - ",
  titleHighlight = "Search, Compare, Book & Enjoy",
  bottomText = "Looking for a vehicle? You're at the right place!",
  badge
}: HeroSearchProps = {}) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const currencyCode = useSelector((state: RootState) => state.currency.code);
  const { isSearching, searchParams } = useSelector((state: RootState) => state.search);

  // Form State
  const [location, setLocation] = useState('');
  const [driverAge25to70, setDriverAge25to70] = useState(true);
  const [driverAge, setDriverAge] = useState(30);

  // Country Selection State
  const [selectedCountry, setSelectedCountry] = useState<WorldCountry>(DEFAULT_COUNTRY);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const [locations, setLocations] = useState<LocationBranch[]>([]);
  const [showLocations, setShowLocations] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:00');

  const [errors, setErrors] = useState<{ location?: string; dates?: string }>({});
  const [heroBg, setHeroBg] = useState<string>(assets.hero.background);

  useEffect(() => {
    referenceApi.getBackgrounds()
      .then((res: any) => {
        const data = res?.data || res || {};
        if (data['banner']) {
          setHeroBg(resolveImageUrl(data['banner'], assets.hero.background));
        }
      })
      .catch(() => {/* fallback to static */ });
  }, []);

  useEffect(() => {
    if (searchParams?.locationLabel) {
      setLocation(searchParams.locationLabel);
    }
  }, [searchParams?.locationLabel]);

  useEffect(() => {
    if (typeof window !== 'undefined' && locations.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const pickupParam = params.get('pickup') || params.get('pickup_loc') || params.get('location') || params.get('search');
      if (pickupParam) {
        const decoded = decodeURIComponent(pickupParam).toLowerCase().trim();
        const matched = locations.find((loc) => {
          return (
            loc.name?.toLowerCase().trim() === decoded ||
            getLocationDisplayLabel(loc).toLowerCase().trim().includes(decoded) ||
            loc.location?.toLowerCase().trim() === decoded
          );
        });

        if (matched) {
          const display = getLocationDisplayLabel(matched);
          const pickupVal = getLocationPickupValue(matched);
          setLocation(display);
          dispatch(setSearchParams({
            location: pickupVal,
            locationLabel: display,
          }));
        } else {
          setLocation(decodeURIComponent(pickupParam));
        }
      }
    }
  }, [locations, dispatch]);

  const locationsRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  const filteredCountries = worldCountries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.iso.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredLocations = locations.filter((loc) => {
    const q = location.toLowerCase();
    const display = getLocationDisplayLabel(loc).toLowerCase();
    return (
      display.includes(q) ||
      loc.location?.toLowerCase().includes(q) ||
      loc.adresse?.toLowerCase().includes(q) ||
      loc.name?.toLowerCase().includes(q) ||
      loc.country?.toLowerCase().includes(q)
    );
  }).reduce((unique, loc) => {
    const display = getLocationDisplayLabel(loc);
    if (!unique.some(l => getLocationDisplayLabel(l) === display)) {
      unique.push(loc);
    }
    return unique;
  }, [] as LocationBranch[]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await vehicleApi.getLocations();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationsRef.current && !locationsRef.current.contains(event.target as Node)) setShowLocations(false);
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setShowCalendar(false);
      if (startRef.current && !startRef.current.contains(event.target as Node)) setShowStartTime(false);
      if (endRef.current && !endRef.current.contains(event.target as Node)) setShowEndTime(false);
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) setShowCountryDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (c: WorldCountry) => {
    setSelectedCountry(c);
    setShowCountryDropdown(false);
    setCountrySearch('');
    if (c.currency) {
      dispatch(setCurrency(c.currency as any));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { location?: string; dates?: string } = {};
    if (!location.trim()) newErrors.location = 'Please select a pickup location';
    if (!startDate || !endDate) newErrors.dates = 'Please select pickup and return dates';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;

    const dateFrom = format(startDate!, 'yyyy-MM-dd');
    const dateTo = format(endDate!, 'yyyy-MM-dd');

    const matched = locations.find(
      (loc) => getLocationDisplayLabel(loc).toLowerCase() === location.trim().toLowerCase()
    );
    const pickup = matched ? getLocationPickupValue(matched) : location.trim();
    const label = location.trim();
    const finalAge = driverAge25to70 ? 30 : driverAge;
    const activeCurrency = (selectedCountry.currency || currencyCode) as string;

    dispatch(setSearchParams({
      location: pickup,
      locationLabel: label,
      dateFrom,
      dateTo,
      startTime,
      endTime,
      driverAge: finalAge,
      driverAge25to70,
      residenceCountry: selectedCountry.name,
    }));

    const params = new URLSearchParams();
    params.set('location', pickup);
    params.set('locationLabel', label);
    params.set('start', dateFrom);
    params.set('end', dateTo);
    params.set('st', startTime);
    params.set('et', endTime);
    params.set('currency', activeCurrency);
    params.set('country', selectedCountry.iso);
    params.set('countryName', selectedCountry.name);
    params.set('residence_country', selectedCountry.name);
    params.set('driver_age', String(finalAge));
    if (!driverAge25to70) {
      params.set('age', String(driverAge));
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative h-auto min-h-[620px] lg:min-h-[680px] flex flex-col items-center justify-center pt-8 sm:pt-10 md:pt-12 pb-10 sm:pb-12 md:pb-14 px-4 sm:px-6 overflow-visible" aria-label="Car Rental Search">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gray-950">
        <Image
          src={heroBg}
          alt="Autours Car Rental Search"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={80}
          className="object-cover"
          style={{ filter: 'brightness(0.60) contrast(1.05)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/50" />
      </div>

      <div className="relative z-10 max-w-4xl lg:max-w-5xl xl:max-w-5xl mx-auto w-full flex flex-col items-center px-2 sm:px-4">
        
        {/* Main Headline */}
        <div className="text-center mb-5 sm:mb-7 md:mb-8 flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-black text-white leading-tight drop-shadow-2xl tracking-tight">
            {title}<span className="text-[#f9d602]">{titleHighlight}</span>
          </h1>
          {badge && (
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#f9d602]/20 border border-[#f9d602]/40 text-[#f9d602] font-black text-xs uppercase tracking-wider backdrop-blur-md shadow-lg">
              {badge}
            </div>
          )}
        </div>

        {/* Search Box Glass Container */}
        <div className="relative z-30 bg-black/40 backdrop-blur-[2px] py-5 sm:py-6 lg:py-7 px-5 sm:px-7 md:px-8 rounded-3xl sm:rounded-[2.2rem] shadow-[0_25px_80px_rgba(0,0,0,0.5)] border border-white/20 w-full">
          <form onSubmit={handleSearch} className="space-y-3.5 sm:space-y-4 lg:space-y-5">
            
            {/* 1. Pick-up Location */}
            <div className="relative z-50" ref={locationsRef}>
              <label className="block text-xs sm:text-sm font-extrabold text-white mb-1.5 drop-shadow-sm">
                Pick-up Location
              </label>
              <div className={`h-11 sm:h-12 md:h-12.5 bg-white rounded-xl sm:rounded-2xl border-2 transition-all px-3.5 sm:px-4 flex items-center justify-between shadow-xs group ${
                errors.location 
                  ? 'border-red-400 ring-4 ring-red-400/20' 
                  : 'border-white hover:border-[#f9d602] focus-within:border-[#f9d602] focus-within:ring-4 focus-within:ring-[#f9d602]/25'
              }`}>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowLocations(e.target.value.length > 0);
                    if (errors.location) setErrors(prev => ({ ...prev, location: undefined }));
                  }}
                  onFocus={() => location.length > 0 && setShowLocations(true)}
                  placeholder="Enter airport, city or location"
                  className="w-full pr-3 text-xs sm:text-sm md:text-[15px] font-extrabold text-gray-900 placeholder:text-gray-400 placeholder:font-medium outline-none bg-transparent"
                />
                {location ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLocation('');
                      setShowLocations(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer transition-colors"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <MapPin size={18} className="text-[#f9d602] shrink-0" />
                )}
              </div>

              {/* Location Dropdown */}
              {showLocations && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-gray-100 max-h-[290px] overflow-y-auto z-[100]">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          const display = getLocationDisplayLabel(loc);
                          const pickup = getLocationPickupValue(loc);
                          setLocation(display);
                          dispatch(setSearchParams({
                            location: pickup,
                            locationLabel: display,
                          }));
                          setShowLocations(false);
                          if (errors.location) setErrors(prev => ({ ...prev, location: undefined }));
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-[#f9d602]/15 transition-all flex items-center gap-3 border-b border-gray-100 last:border-b-0 group cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-[#f9d602] group-hover:text-gray-950 transition-colors shrink-0">
                          {loc.location_type?.toLowerCase().includes('airport') ? <Plane size={15} /> : <Building size={15} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-gray-900 truncate">
                            {getLocationDisplayLabel(loc)}
                          </span>
                          {loc.country && (
                            <span className="text-[10px] font-medium text-gray-400">
                              {loc.country}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-400 font-bold">
                      No matching locations found
                    </div>
                  )}
                </div>
              )}

              {errors.location && (
                <p className="text-xs font-black text-red-400 flex items-center gap-1 pl-1 mt-1.5 drop-shadow-sm">
                  <AlertCircle size={12} />
                  {errors.location}
                </p>
              )}
            </div>

            {/* 2. Date & Time Row (Pick-up Date, Time, Drop-off Date, Time) */}
            <div className="grid grid-cols-12 gap-2.5 sm:gap-3 items-start relative z-20" ref={calendarRef}>
              
              {/* Pick-up Date (Col 1) */}
              <div className="col-span-7 sm:col-span-6 lg:col-span-4 relative z-30">
                <label className="block text-xs sm:text-sm font-extrabold text-white mb-1.5 drop-shadow-sm truncate">
                  Pick-up Date
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowCalendar(!showCalendar);
                    setShowStartTime(false);
                    setShowEndTime(false);
                    if (errors.dates) setErrors(prev => ({ ...prev, dates: undefined }));
                  }}
                  className={`w-full h-11 sm:h-12 md:h-12.5 bg-white rounded-xl sm:rounded-2xl border-2 transition-all px-3.5 sm:px-4 flex items-center justify-between text-left shadow-xs cursor-pointer ${
                    errors.dates 
                      ? 'border-red-400 ring-4 ring-red-400/20' 
                      : 'border-white hover:border-[#f9d602]'
                  }`}
                >
                  <span className={`text-xs sm:text-sm font-extrabold truncate ${
                    startDate ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {startDate ? format(startDate, 'dd/MM/yyyy') : 'From'}
                  </span>
                  <Calendar size={17} className="text-gray-400 shrink-0" />
                </button>
              </div>

              {/* Pick-up Time (Col 2) */}
              <div className="col-span-5 sm:col-span-6 lg:col-span-2 relative z-25" ref={startRef}>
                <label className="block text-xs sm:text-sm font-extrabold text-white mb-1.5 drop-shadow-sm">
                  Time
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowStartTime(!showStartTime);
                    setShowEndTime(false);
                    setShowCalendar(false);
                  }}
                  className="relative w-full h-11 sm:h-12 md:h-12.5 bg-white rounded-xl sm:rounded-2xl border-2 border-white hover:border-[#f9d602] transition-all flex items-center justify-center shadow-xs cursor-pointer group"
                >
                  <span className="w-full text-center text-xs sm:text-sm font-extrabold text-gray-900 select-none -translate-x-2.5 sm:-translate-x-3">
                    {startTime}
                  </span>
                  <Clock size={16} className="text-gray-400 shrink-0 absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </button>

                {showStartTime && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[220px] overflow-y-auto z-[150] w-32 py-1 animate-fadeIn">
                    {TIME_OPTIONS.map((time) => (
                      <button
                        key={`st-${time}`}
                        type="button"
                        onClick={() => {
                          setStartTime(time);
                          setShowStartTime(false);
                        }}
                        className={`w-full px-3.5 py-2 text-center text-xs font-extrabold hover:bg-[#f9d602]/20 transition-all cursor-pointer ${
                          startTime === time ? 'bg-[#f9d602] text-gray-950 font-black' : 'text-gray-700'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Drop-off Date (Col 3) */}
              <div className="col-span-7 sm:col-span-6 lg:col-span-4 relative z-30">
                <label className="block text-xs sm:text-sm font-extrabold text-white mb-1.5 drop-shadow-sm truncate">
                  Drop-off Date
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowCalendar(!showCalendar);
                    setShowStartTime(false);
                    setShowEndTime(false);
                    if (errors.dates) setErrors(prev => ({ ...prev, dates: undefined }));
                  }}
                  className={`w-full h-11 sm:h-12 md:h-12.5 bg-white rounded-xl sm:rounded-2xl border-2 transition-all px-3.5 sm:px-4 flex items-center justify-between text-left shadow-xs cursor-pointer ${
                    errors.dates 
                      ? 'border-red-400 ring-4 ring-red-400/20' 
                      : 'border-white hover:border-[#f9d602]'
                  }`}
                >
                  <span className={`text-xs sm:text-sm font-extrabold truncate ${
                    endDate ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {endDate ? format(endDate, 'dd/MM/yyyy') : 'To'}
                  </span>
                  <Calendar size={17} className="text-gray-400 shrink-0" />
                </button>
              </div>

              {/* Drop-off Time (Col 4) */}
              <div className="col-span-5 sm:col-span-6 lg:col-span-2 relative z-20" ref={endRef}>
                <label className="block text-xs sm:text-sm font-extrabold text-white mb-1.5 drop-shadow-sm">
                  Time
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowEndTime(!showEndTime);
                    setShowStartTime(false);
                    setShowCalendar(false);
                  }}
                  className="relative w-full h-11 sm:h-12 md:h-12.5 bg-white rounded-xl sm:rounded-2xl border-2 border-white hover:border-[#f9d602] transition-all flex items-center justify-center shadow-xs cursor-pointer group"
                >
                  <span className="w-full text-center text-xs sm:text-sm font-extrabold text-gray-900 select-none -translate-x-2.5 sm:-translate-x-3">
                    {endTime}
                  </span>
                  <Clock size={16} className="text-gray-400 shrink-0 absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </button>

                {showEndTime && (
                  <div className="absolute top-full right-0 lg:left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[220px] overflow-y-auto z-[150] w-32 py-1 animate-fadeIn">
                    {TIME_OPTIONS.map((time) => (
                      <button
                        key={`et-${time}`}
                        type="button"
                        onClick={() => {
                          setEndTime(time);
                          setShowEndTime(false);
                        }}
                        className={`w-full px-3.5 py-2 text-center text-xs font-extrabold hover:bg-[#f9d602]/20 transition-all cursor-pointer ${
                          endTime === time ? 'bg-[#f9d602] text-gray-950 font-black' : 'text-gray-700'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Calendar Range Picker Modal */}
              {showCalendar && (
                <>
                  <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[140] sm:hidden"
                    onClick={() => setShowCalendar(false)}
                  />
                  <div className="fixed sm:absolute top-1/2 -translate-y-1/2 sm:translate-y-0 sm:top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-0 sm:mt-2 z-[150] w-fit flex justify-center animate-fadeIn">
                    <CalendarRangePicker
                      startDate={startDate}
                      endDate={endDate}
                      onSelect={(s, e) => {
                        setStartDate(s);
                        setEndDate(e);
                        if (errors.dates) setErrors(prev => ({ ...prev, dates: undefined }));
                      }}
                      onClose={() => setShowCalendar(false)}
                    />
                  </div>
                </>
              )}

            </div>

            {errors.dates && (
              <p className="text-xs font-black text-red-400 flex items-center gap-1 pl-1 drop-shadow-sm">
                <AlertCircle size={12} />
                {errors.dates}
              </p>
            )}

            {/* 3. Driver Details & Country Selection Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pt-1">
              
              {/* I live in: Country Selector */}
              <div className="relative" ref={countryRef}>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <span className="text-white font-medium drop-shadow-sm">I live in:</span>
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="inline-flex items-center gap-1.5 text-[#f9d602] font-black hover:underline cursor-pointer group"
                  >
                    <img
                      src={`https://flagcdn.com/w40/${selectedCountry.iso.toLowerCase()}.png`}
                      alt={selectedCountry.name}
                      className="w-4.5 h-3 object-cover rounded-xs shadow-2xs shrink-0"
                    />
                    <span className="truncate max-w-[150px] sm:max-w-[140px]">{selectedCountry.name}</span>
                    <ChevronDown size={14} className="text-[#f9d602] group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </div>

                {/* Searchable Country Dropdown */}
                {showCountryDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 sm:w-80 max-h-[320px] flex flex-col z-[160] overflow-hidden animate-fadeIn">
                    <div className="p-2.5 border-b border-gray-100 bg-gray-50/90">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5 px-0.5">
                        Where do you currently live?
                      </p>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search your country..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs font-bold text-gray-900 bg-white rounded-xl border border-gray-200 outline-none focus:border-[#f9d602]"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-[240px] p-1.5 space-y-0.5">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((c) => (
                          <button
                            key={c.iso}
                            type="button"
                            onClick={() => handleCountrySelect(c)}
                            className={`w-full px-3 py-2 text-left text-xs font-extrabold flex items-center justify-between rounded-xl transition-all cursor-pointer ${
                              selectedCountry.iso === c.iso
                                ? 'bg-[#f9d602] text-gray-950 font-black'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={`https://flagcdn.com/w40/${c.iso.toLowerCase()}.png`}
                                alt={c.name}
                                className="w-5 h-3.5 object-cover rounded-xs shadow-2xs shrink-0"
                              />
                              <span className="truncate">{c.name}</span>
                            </div>
                            {selectedCountry.iso === c.iso && (
                              <Check size={14} strokeWidth={3} className="text-gray-950 shrink-0" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-gray-400 font-bold">
                          No matching countries
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Driver's age Checkbox & Age Stepper */}
              <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer select-none group shrink-0">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                    driverAge25to70 
                      ? 'bg-[#f9d602] border-[#f9d602] text-gray-950 shadow-md shadow-yellow-500/20' 
                      : 'bg-white/10 border-white/80 group-hover:border-[#f9d602] group-hover:bg-white/20'
                  }`}>
                    {driverAge25to70 && <Check size={13} strokeWidth={3.5} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={driverAge25to70}
                    onChange={(e) => setDriverAge25to70(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-xs sm:text-sm font-extrabold text-white drop-shadow-sm group-hover:text-[#f9d602] transition-colors whitespace-nowrap">
                    Driver's age between 30-65?
                  </span>
                </label>

                {/* Custom Age Stepper when unchecked */}
                {!driverAge25to70 && (
                  <div className="flex items-center bg-white rounded-xl p-1 shadow-md border border-white/60 animate-fadeIn shrink-0">
                    <span className="text-[10px] font-extrabold text-gray-500 px-1.5 uppercase tracking-wider">
                      Age
                    </span>
                    <div className="flex items-center gap-1 bg-gray-100 px-1 py-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setDriverAge(prev => Math.max(18, prev - 1))}
                        className="w-5 h-5 rounded-md bg-white hover:bg-[#f9d602] text-gray-900 font-black flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      >
                        <Minus size={11} strokeWidth={3} />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={driverAge}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val === '') setDriverAge(18);
                          else setDriverAge(Math.min(99, Math.max(18, Number(val))));
                        }}
                        className="w-7 text-center text-xs font-black text-gray-950 bg-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setDriverAge(prev => Math.min(99, prev + 1))}
                        className="w-5 h-5 rounded-md bg-white hover:bg-[#f9d602] text-gray-900 font-black flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      >
                        <Plus size={11} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* 4. Large Yellow SEARCH CAR Button */}
            <div className="pt-1.5">
              <motion.button
                type="submit"
                disabled={isSearching}
                whileHover={{ scale: 1.008 }}
                whileTap={{ scale: 0.985 }}
                className="w-full h-11 sm:h-12 md:h-12.5 bg-[#f9d602] hover:bg-yellow-400 text-gray-950 font-black text-sm sm:text-base md:text-[17px] uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-xl shadow-yellow-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed border-2 border-yellow-300 active:scale-95 cursor-pointer"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Search size={18} className="stroke-[3]" />
                    <span>SEARCH CAR</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* 5. Trust Badges */}
            <div className="pt-3.5 border-t border-white/15 flex flex-wrap items-center justify-center gap-y-2.5">
              {TRUST_BADGES.map((text, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex items-center gap-2 px-2.5 sm:px-3.5 md:px-4 text-white drop-shadow-sm">
                    <div className="w-4.5 h-4.5 rounded-full bg-[#f9d602] flex items-center justify-center shrink-0 shadow-xs">
                      <Check size={11} strokeWidth={3.5} className="text-gray-950" />
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold tracking-tight whitespace-nowrap">
                      {text}
                    </span>
                  </div>
                  {i < TRUST_BADGES.length - 1 && (
                    <div className="hidden md:block h-3.5 w-px bg-white/25" />
                  )}
                </div>
              ))}
            </div>

          </form>
        </div>

        {/* Bottom Sub-title */}
        {bottomText && (
          <p className="mt-7 sm:mt-9 md:mt-12 text-sm sm:text-base md:text-xl lg:text-2xl font-black text-white text-center drop-shadow-lg tracking-tight relative z-0 pointer-events-none px-4">
            {bottomText}
          </p>
        )}

      </div>
    </section>
  );
}