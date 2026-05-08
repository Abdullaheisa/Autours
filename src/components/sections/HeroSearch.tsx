'use client';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { 
  Search, MapPin, Calendar, Clock, CheckCircle2, ChevronDown, 
  Plane, Building, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import CalendarRangePicker from '@/components/shared/CalendarRangePicker';
import { assets } from '@/config/assets';
import { RootState, AppDispatch } from '@/store';
import { initiateSearch, setSearchParams } from '@/store/slices/searchSlice';

import { vehicleApi } from '@/services/api/vehicleApi';
import { LocationBranch } from '@/types';
const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => 
  `${i.toString().padStart(2, '0')}:00`
);

const TRUST_BADGES = [
  'Free Cancellation',
  'No Credit card fees',
  'No hidden fees',
  'Free amendment',
];

export default function HeroSearch() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const currencyCode = useSelector((state: RootState) => state.currency.code);
  const { isSearching } = useSelector((state: RootState) => state.search);

  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState<LocationBranch[]>([]);
  const [showLocations, setShowLocations] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:00');

  // Validation errors
  const [errors, setErrors] = useState<{ location?: string; dates?: string }>({});

  const locationsRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const filteredLocations = locations.filter(loc => 
    loc.location?.toLowerCase().includes(location.toLowerCase()) || 
    loc.country?.toLowerCase().includes(location.toLowerCase()) ||
    loc.name?.toLowerCase().includes(location.toLowerCase())
  );

  useEffect(() => {
    console.log(`[HeroSearch] Locations loaded: ${locations.length}`);
  }, [locations]);

  useEffect(() => {
    if (location.length > 0) {
      console.log(`[HeroSearch] Filtering for "${location}", found ${filteredLocations.length} matches.`);
    }
  }, [location, filteredLocations.length]);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { location?: string; dates?: string } = {};

    if (!location.trim()) {
      newErrors.location = 'Please select a pickup location';
    }
    if (!startDate || !endDate) {
      newErrors.dates = 'Please select pickup and return dates';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate inputs
    if (!validateForm()) return;

    const dateFrom = format(startDate!, 'yyyy-MM-dd');
    const dateTo = format(endDate!, 'yyyy-MM-dd');

    // Save search params in Redux
    dispatch(setSearchParams({
      location: location.trim(),
      dateFrom,
      dateTo,
      startTime,
      endTime,
    }));

    // Call the search API to save session on backend
    try {
      await dispatch(initiateSearch({
        pickupLoc: location.trim(),
        date_from: dateFrom,
        date_to: dateTo,
        time_from: startTime,
        time_to: endTime,
        currency: currencyCode,
      })).unwrap();
    } catch {
      // Even if the session-save fails, we still navigate so the
      // filter endpoint can be called from the results page.
    }

    // Navigate to results page with search params in URL
    const params = new URLSearchParams();
    params.set('location', location.trim());
    params.set('start', dateFrom);
    params.set('end', dateTo);
    params.set('st', startTime);
    params.set('et', endTime);
    params.set('currency', currencyCode);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <>
      {/* ==== HERO SECTION ==== */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-start pt-20 pb-0" aria-label="Car Rental Search">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed transition-transform duration-[10s] hover:scale-105"
            style={{
              backgroundImage: `url(${assets.hero.background})`,
              filter: 'brightness(0.5) contrast(1.1)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 w-full flex flex-col items-center">
              {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-white leading-tight drop-shadow-2xl">
              Car Rentals - <span className="text-primary">Search, Book & Enjoy.</span>
            </h1>
          </div>

          {/* Search Form */}
          <div className="bg-white/70 backdrop-blur-sm p-3 lg:p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 w-full max-w-7xl">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="mb-1">
                <span className="text-sm font-semibold text-gray-700">Select Pickup Location</span>
              </div>

              {/* ==== صف الحقول فقط ==== */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-1.5 items-end">
                {/* Location Input */}
                <div className="lg:col-span-5 relative space-y-2" ref={locationsRef}>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setShowLocations(e.target.value.length > 0);
                        if (errors.location) setErrors(prev => ({ ...prev, location: undefined }));
                      }}
                      onFocus={() => location.length > 0 && setShowLocations(true)}
                      placeholder="Enter your Location"
                      className={`w-full h-11 pl-5 pr-10 bg-gray-50 border rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all ${
                        errors.location ? 'border-red-400 bg-red-50/50' : 'border-gray-100'
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                      <Search size={18} />
                    </div>

                    {showLocations && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[300px] overflow-y-auto z-[60]">
                        {filteredLocations.length > 0 ? (
                          filteredLocations.map((loc) => (
                            <button
                              key={loc.id}
                              type="button"
                              onClick={() => {
                                setLocation(loc.location);
                                setShowLocations(false);
                                if (errors.location) setErrors(prev => ({ ...prev, location: undefined }));
                              }}
                              className="w-full px-5 py-4 text-left hover:bg-primary/10 transition-all flex items-center gap-4 border-b border-gray-50 last:border-0"
                            >
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                {loc.location_type?.toLowerCase().includes('airport') ? <Plane size={18} /> : <Building size={18} />}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800">{loc.location}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{loc.country} • {loc.name}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-5 py-8 text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-3">
                              <MapPin size={24} />
                            </div>
                            <p className="text-sm font-bold text-gray-400">No locations available</p>
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">Try a different search term</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Location error */}
                  <AnimatePresence>
                    {errors.location && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs font-bold text-red-500 flex items-center gap-1 pl-1"
                      >
                        <AlertCircle size={12} />
                        {errors.location}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Date Range Picker - Split into Pickup/Return */}
                <div className="lg:col-span-5 relative" ref={calendarRef}>
                  <div className={`flex items-center h-11 bg-gray-50 border rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 transition-all ${
                    errors.dates ? 'border-red-400 bg-red-50/50' : 'border-gray-100'
                  }`}>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowCalendar(!showCalendar);
                        if (errors.dates) setErrors(prev => ({ ...prev, dates: undefined }));
                      }}
                      className="flex-1 px-5 h-full flex items-center gap-3 hover:bg-white transition-all group border-r border-gray-100"
                    >
                      <Calendar size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Pickup</span>
                        <span className="text-sm font-bold text-gray-700">{startDate ? format(startDate, 'MMM dd') : 'Select Date'}</span>
                      </div>
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        setShowCalendar(!showCalendar);
                        if (errors.dates) setErrors(prev => ({ ...prev, dates: undefined }));
                      }}
                      className="flex-1 px-5 h-full flex items-center gap-3 hover:bg-white transition-all group"
                    >
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Return</span>
                        <span className="text-sm font-bold text-gray-700">{endDate ? format(endDate, 'MMM dd') : 'Select Date'}</span>
                      </div>
                    </button>
                  </div>

                  {/* Date error */}
                  <AnimatePresence>
                    {errors.dates && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs font-bold text-red-500 flex items-center gap-1 pl-1 mt-2"
                      >
                        <AlertCircle size={12} />
                        {errors.dates}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {showCalendar && (
                    <>
                      {/* Mobile/Tablet Backdrop - light dark overlay */}
                      <div 
                        className="fixed inset-0 bg-black/40 z-[55] lg:hidden"
                        onClick={() => setShowCalendar(false)}
                      />

                      {/* Calendar Wrapper - both months visible on all screens */}
                      <div className="fixed lg:absolute top-[5%] lg:top-full left-1/2 -translate-x-1/2 mt-3 z-[60] w-[95vw] lg:w-fit flex justify-center">
                        <div className="scale-[0.78] sm:scale-90 md:scale-95 origin-top">
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
                      </div>
                    </>
                  )}
                </div>

                {/* Time Pickers */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-1.5">
                  <div className="relative" ref={startRef}>
                    <button 
                      type="button"
                      onClick={() => setShowStartTime(!showStartTime)}
                      className="w-full h-11 px-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between text-sm font-bold text-gray-700 hover:bg-white hover:border-primary transition-all"
                    >
                      <span>{startTime}</span>
                      <Clock size={14} className="text-gray-300" />
                    </button>
                    {showStartTime && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[200px] overflow-y-auto z-[60]">
                        {TIME_OPTIONS.map((time) => (
                          <button key={time} type="button" onClick={() => { setStartTime(time); setShowStartTime(false); }} className={`w-full px-4 py-3 text-left text-xs font-bold hover:bg-primary/10 transition-all ${startTime === time ? 'bg-primary/10 text-gray-900' : ''}`}>{time}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative" ref={endRef}>
                    <button 
                      type="button"
                      onClick={() => setShowEndTime(!showEndTime)}
                      className="w-full h-11 px-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between text-sm font-bold text-gray-700 hover:bg-white hover:border-primary transition-all"
                    >
                      <span>{endTime}</span>
                      <Clock size={14} className="text-gray-300" />
                    </button>
                    {showEndTime && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[200px] overflow-y-auto z-[60]">
                        {TIME_OPTIONS.map((time) => (
                          <button key={time} type="button" onClick={() => { setEndTime(time); setShowEndTime(false); }} className={`w-full px-4 py-3 text-left text-xs font-bold hover:bg-primary/10 transition-all ${endTime === time ? 'bg-primary/10 text-gray-900' : ''}`}>{time}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ==== الصف التاني: Search Button + Trust Badges ==== */}
              {/* الزرار على اليمين في الشاشات الكبيرة، وقبل الفيتشرز في الشاشات الصغيرة */}
              <div className="flex flex-col lg:flex-row-reverse lg:items-center lg:justify-between gap-4 pt-3 border-t border-gray-50">

                {/* Search Button - يظهر أولاً في الشاشات الصغيرة (الترتيب الطبيعي) */}
                <button
                  type="submit"
                  disabled={isSearching}
                  className="h-11 w-full lg:w-auto px-8 bg-primary hover:bg-primary-600 text-black font-bold text-xs uppercase tracking-wide transition-all rounded-2xl shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search size={18} />
                      SEARCH CARS
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 md:gap-6">
                  {TRUST_BADGES.map((text, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-primary" />
                      <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

            {/* ==== الجملة اتنقلت هنا جوه الهيرو مباشرة ==== */}
            <p 
              className="mt-8 mb-2 pb-6 relative z-[-1] text-xl md:text-2xl lg:text-3xl font-medium text-white text-center drop-shadow-lg"
            >
              Looking for a vehicle? You're at the right place!
            </p>
          </div>
      </section>


    </>
  );
}