'use client';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Search, MapPin, Calendar, Clock, CheckCircle2, 
  Plane, Building, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import CalendarRangePicker from '@/components/shared/CalendarRangePicker';
import { assets } from '@/config/assets';
import { RootState, AppDispatch } from '@/store';
import { setSearchParams } from '@/store/slices/searchSlice';
import { vehicleApi } from '@/services/api/vehicleApi';
import { referenceApi } from '@/services/api';
import { LocationBranch } from '@/types';
import { getLocationDisplayLabel, getLocationPickupValue } from '@/utils/location';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function resolveImageUrl(path: string | undefined, fallback: string): string {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
}

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => 
  `${i.toString().padStart(2, '0')}:00`
);

const TRUST_BADGES = [
  'Free Cancellation',
  'No Credit card fees',
  'No hidden fees',
  'Free amendment',
];

interface HeroSearchProps {
  title?: string;
  titleHighlight?: string;
  bottomText?: string;
  badge?: string;
}

export default function HeroSearch({
  title = "Car Rentals - ",
  titleHighlight = "Search, Book & Enjoy.",
  bottomText = "Looking for a vehicle? You're at the right place!",
  badge
}: HeroSearchProps = {}) {
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
      .catch(() => {/* fallback to static */});
  }, []);

  const locationsRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    dispatch(setSearchParams({
      location: pickup,
      locationLabel: label,
      dateFrom,
      dateTo,
      startTime,
      endTime,
    }));

    const params = new URLSearchParams();
    params.set('location', pickup);
    params.set('locationLabel', label);
    params.set('start', dateFrom);
    params.set('end', dateTo);
    params.set('st', startTime);
    params.set('et', endTime);
    params.set('currency', currencyCode);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative h-auto sm:h-[calc(100vh-80px)] min-h-[580px] sm:min-h-[620px] md:min-h-[660px] flex flex-col items-center justify-start pt-16 pb-12 sm:justify-center sm:pt-0 sm:pb-0 sm:overflow-hidden" aria-label="Car Rental Search">
      {/* 🚀 السر كله هنا: تحويل الخلفية لـ next/image مضغوطة بالكامل */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gray-900">
        <Image
          src={heroBg}
          alt="Autours Car Rental Search"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={75}
          className="object-cover transition-transform duration-[10s] hover:scale-105"
          style={{ filter: 'brightness(0.65) contrast(1.05)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/50" />
      </div>

      <div className="relative z-10 max-w-7xl xl:max-w-[90rem] 2xl:max-w-[95rem] mx-auto px-4 w-full flex flex-col items-center">
        <div className="text-center mb-4 sm:mb-6 md:mb-8 flex flex-col items-center justify-center gap-2.5 sm:gap-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-2xl tracking-tight">
            {title} <span className="text-primary">{titleHighlight}</span>
          </h1>
          {badge && (
            <div className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full bg-[#f4c400]/20 border border-[#f4c400]/30 text-[#f4c400] font-black text-xs uppercase tracking-wider backdrop-blur-sm shadow-xl">
              {badge}
            </div>
          )}
        </div>

        <div className="bg-white/35 backdrop-blur-sm pt-6 pb-5 px-4 sm:pt-8 sm:pb-7 sm:px-6 md:pt-10 md:pb-8 md:px-8 lg:py-16 lg:px-10 rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.45)] border border-white/20 w-full max-w-[94%] lg:max-w-[90%] xl:max-w-[68rem] 2xl:max-w-[72rem] 3xl:max-w-[88rem]">
          <form onSubmit={handleSearch} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5 md:gap-2 lg:gap-3 items-start">
              
              {/* Location Input */}
              <div className="sm:col-span-1 md:col-span-4 relative" ref={locationsRef}>
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
                    className={`w-full h-12 md:h-14 lg:h-16 pl-5 md:pl-5 lg:pl-6 pr-12 bg-white/95 border rounded-xl md:rounded-[1.25rem] text-[14px] md:text-[13px] lg:text-base font-semibold text-gray-900 outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all placeholder:font-bold placeholder:text-gray-500 ${
                      errors.location ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <Search size={18} aria-hidden="true" />
                  </div>

                  {showLocations && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[280px] overflow-y-auto z-[60]">
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
  
  className="w-full px-5 py-3.5 text-left hover:bg-primary/5 transition-all flex items-center gap-4 border-b border-gray-200 last:border-b-0"
>
  {/* مربع الأيقونة - ضفنا shrink-0 علشان الأيقونة متتصغرش لو النص طويل */}
  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
    {loc.location_type?.toLowerCase().includes('airport') ? <Plane size={18} /> : <Building size={18} />}
  </div>
  
  {/* النصوص */}
  <div className="flex flex-col min-w-0 text-left">
    <div className="flex items-center flex-wrap gap-1.5">
      <span className="text-xs font-medium text-gray-900 line-clamp-2 leading-relaxed">
        {getLocationDisplayLabel(loc).replace(new RegExp(`\\s*-\\s*${loc.abriviation}$`), '')}
      </span>
      {loc.abriviation && (
        <span className="text-[9px] font-black text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
          {loc.abriviation}
        </span>
      )}
    </div>
    {loc.country && (
      <span className="text-[10px] font-medium text-gray-500 mt-0.5">
        {loc.country}
      </span>
    )}
  </div>
</button>
                        ))
                      ) : (
                        <div className="px-5 py-8 text-center">
                          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-3">
                            <MapPin size={24} />
                          </div>
                          <p className="text-sm font-black text-gray-500">No locations available</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Try a different search term</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.location && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs font-black text-red-500 flex items-center gap-1 pl-1 mt-1"
                    >
                      <AlertCircle size={12} />
                      {errors.location}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Date Range Picker */}
              <div className="sm:col-span-1 md:col-span-4 relative" ref={calendarRef}>
                <div className={`flex items-center h-12 md:h-14 lg:h-16 bg-white/95 border rounded-xl md:rounded-[1.25rem] overflow-hidden focus-within:ring-4 focus-within:ring-primary/20 transition-all ${
                  errors.dates ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
                }`}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowCalendar(!showCalendar);
                      if (errors.dates) setErrors(prev => ({ ...prev, dates: undefined }));
                    }}
                    className="flex-1 px-3.5 md:px-3 lg:px-4 h-full flex items-center gap-1.5 md:gap-1 lg:gap-2 hover:bg-white transition-all group border-r border-gray-200"
                  >
                    <Calendar size={16} className="text-gray-500 group-hover:text-primary transition-colors shrink-0" />
                    <div className="flex flex-col items-start leading-tight min-w-0">
                      <span className="text-[12px] md:text-[11px] lg:text-[11px] font-black uppercase tracking-wider text-gray-500">Pickup</span>
                      <span className="text-[14px] md:text-[13px] lg:text-base font-semibold text-gray-900 truncate">{startDate ? format(startDate, 'dd/MM/yyyy') : 'Select Date'}</span>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setShowCalendar(!showCalendar);
                      if (errors.dates) setErrors(prev => ({ ...prev, dates: undefined }));
                    }}
                    className="flex-1 px-3.5 md:px-3 lg:px-4 h-full flex items-center gap-1.5 md:gap-1 lg:gap-2 hover:bg-white transition-all group"
                  >
                    <div className="flex flex-col items-start leading-tight min-w-0">
                      <span className="text-[12px] md:text-[11px] lg:text-[11px] font-black uppercase tracking-wider text-gray-500">Return</span>
                      <span className="text-[14px] md:text-[13px] lg:text-base font-semibold text-gray-900 truncate">{endDate ? format(endDate, 'dd/MM/yyyy') : 'Select Date'}</span>
                    </div>
                  </button>
                </div>

                <AnimatePresence>
                  {errors.dates && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs font-black text-red-500 flex items-center gap-1 pl-1 mt-1"
                    >
                      <AlertCircle size={12} />
                      {errors.dates}
                    </motion.p>
                  )}
                </AnimatePresence>

                {showCalendar && (
                  <>
                    <div 
                      className="fixed inset-0 bg-black/40 z-[55] lg:hidden"
                      onClick={() => setShowCalendar(false)}
                    />
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
              <div className="grid grid-cols-2 gap-2 md:gap-1.5 lg:gap-3 sm:col-span-2 md:col-span-4">
                <div className="relative" ref={startRef}>
                  <button 
                    type="button"
                    onClick={() => setShowStartTime(!showStartTime)}
                    className="w-full h-12 md:h-14 lg:h-16 pl-3.5 pr-8 md:pl-2.5 md:pr-7 lg:pl-4 lg:pr-9 bg-white/95 border border-gray-250 rounded-xl md:rounded-[1.25rem] flex items-center justify-start relative text-[14px] md:text-[13px] lg:text-base font-semibold text-gray-900 hover:bg-white hover:border-primary transition-all"
                  >
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[12px] md:text-[11px] lg:text-[11px] font-black uppercase tracking-wider text-gray-500">Pickup</span>
                      <span>{startTime}</span>
                    </div>
                    <Clock size={14} className="absolute right-2.5 md:right-2 lg:right-3.5 top-1/2 -translate-y-1/2 text-gray-500 shrink-0" />
                  </button>
                  {showStartTime && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[200px] overflow-y-auto z-[60]">
                      {TIME_OPTIONS.map((time) => (
                        <button key={time} type="button" onClick={() => { setStartTime(time); setShowStartTime(false); }} className={`w-full px-4 py-3 text-left text-xs font-medium hover:bg-primary/10 transition-all ${startTime === time ? 'bg-primary/10 text-gray-900' : ''}`}>{time}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative" ref={endRef}>
                  <button 
                    type="button"
                    onClick={() => setShowEndTime(!showEndTime)}
                    className="w-full h-12 md:h-14 lg:h-16 pl-3.5 pr-8 md:pl-2.5 md:pr-7 lg:pl-4 lg:pr-9 bg-white/95 border border-gray-250 rounded-xl md:rounded-[1.25rem] flex items-center justify-start relative text-[14px] md:text-[13px] lg:text-base font-semibold text-gray-900 hover:bg-white hover:border-primary transition-all"
                  >
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[12px] md:text-[11px] lg:text-[11px] font-black uppercase tracking-wider text-gray-500">Return</span>
                      <span>{endTime}</span>
                    </div>
                    <Clock size={14} className="absolute right-2.5 md:right-2 lg:right-3.5 top-1/2 -translate-y-1/2 text-gray-500 shrink-0" />
                  </button>
                  {showEndTime && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[200px] overflow-y-auto z-[60]">
                      {TIME_OPTIONS.map((time) => (
                        <button key={time} type="button" onClick={() => { setEndTime(time); setShowEndTime(false); }} className={`w-full px-4 py-3 text-left text-xs font-medium hover:bg-primary/10 transition-all ${endTime === time ? 'bg-primary/10 text-gray-900' : ''}`}>{time}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-5 pt-5 sm:pt-6 border-t border-white/10">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full sm:flex sm:flex-wrap sm:items-center sm:justify-center lg:justify-start lg:gap-x-5 lg:gap-y-3 lg:w-auto">
                {TRUST_BADGES.map((text, i) => (
                  <div key={i} className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="text-primary shrink-0 w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6" />
                    <span className="text-xs xs:text-[13px] sm:text-[14px] md:text-[15px] lg:text-base xl:text-[17px] 2xl:text-[18px] font-bold text-white capitalize tracking-wide leading-tight sm:whitespace-nowrap truncate sm:overflow-visible">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <motion.button
                type="submit"
                disabled={isSearching}
                whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.97 }}
                className="h-14 sm:h-16 w-full lg:w-auto px-6 sm:px-10 bg-primary hover:bg-gray-900 text-gray-900 hover:text-primary font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-500 rounded-[1.25rem] shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shrink-0 group overflow-hidden relative"
              >
                <span className="absolute inset-0 bg-gray-900 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                {isSearching ? (
                  <div className="relative z-10 w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Search size={18} className="relative z-10 group-hover:text-primary transition-colors duration-500" />
                    <span className="relative z-10 group-hover:text-primary transition-colors duration-500">SEARCH CARS</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>

        <p className="mt-6 sm:mt-8 mb-2 pb-6 relative z-[-1] text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white text-center drop-shadow-lg tracking-tight">
          {bottomText}
        </p>
      </div>
    </section>
  );
}