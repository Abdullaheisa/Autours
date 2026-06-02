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
      loc.name?.toLowerCase().includes(q)
    );
  });

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
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-start pt-16 sm:pt-20 pb-0" aria-label="Car Rental Search">
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full flex flex-col items-center">
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center justify-center gap-4 sm:gap-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-2xl tracking-tight">
            {title} <span className="text-primary">{titleHighlight}</span>
          </h1>
          {badge && (
            <div className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full bg-[#f4c400]/20 border border-[#f4c400]/30 text-[#f4c400] font-black text-xs uppercase tracking-wider backdrop-blur-sm shadow-xl">
              {badge}
            </div>
          )}
        </div>

        <div className="bg-white/35 backdrop-blur-sm py-6 px-4 sm:py-8 sm:px-6 lg:py-10 lg:px-8 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/15 w-full max-w-5xl">
          <form onSubmit={handleSearch} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(16,minmax(0,1fr))] gap-3 items-start">
              
              {/* Location Input */}
              <div className="lg:col-span-8 relative" ref={locationsRef}>
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
                    className={`w-full h-12 sm:h-14 pl-4 sm:pl-5 pr-10 bg-white/90 border rounded-2xl text-sm font-semibold text-gray-900 outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all placeholder:font-bold placeholder:text-gray-500 ${
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
    <span className="text-xs font-medium text-gray-900 line-clamp-2 leading-relaxed">
      {getLocationDisplayLabel(loc)}
    </span>
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
              <div className="lg:col-span-5 relative" ref={calendarRef}>
                <div className={`flex items-center h-12 sm:h-14 bg-white/90 border rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-primary/20 transition-all ${
                  errors.dates ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
                }`}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowCalendar(!showCalendar);
                      if (errors.dates) setErrors(prev => ({ ...prev, dates: undefined }));
                    }}
                    className="px-4 h-full flex items-center gap-2 hover:bg-white transition-all group border-r border-gray-200"
                  >
                    <Calendar size={16} className="text-gray-500 group-hover:text-primary transition-colors shrink-0" />
                    <div className="flex flex-col items-start leading-tight min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Pickup</span>
                      <span className="text-sm font-semibold text-gray-900 truncate">{startDate ? format(startDate, 'dd/MM/yyyy') : 'Select Date'}</span>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setShowCalendar(!showCalendar);
                      if (errors.dates) setErrors(prev => ({ ...prev, dates: undefined }));
                    }}
                    className="px-4 h-full flex items-center gap-2 hover:bg-white transition-all group"
                  >
                    <div className="flex flex-col items-start leading-tight min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Return</span>
                      <span className="text-sm font-semibold text-gray-900 truncate">{endDate ? format(endDate, 'dd/MM/yyyy') : 'Select Date'}</span>
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
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:col-span-3">
                <div className="relative" ref={startRef}>
                  <button 
                    type="button"
                    onClick={() => setShowStartTime(!showStartTime)}
                    className="w-full h-12 sm:h-14 px-3 bg-white/90 border border-gray-200 rounded-2xl flex items-center justify-between text-sm font-semibold text-gray-900 hover:bg-white hover:border-primary transition-all"
                  >
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Pickup</span>
                      <span>{startTime}</span>
                    </div>
                    <Clock size={14} className="text-gray-500 shrink-0" />
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
                    className="w-full h-12 sm:h-14 px-3 bg-white/90 border border-gray-200 rounded-2xl flex items-center justify-between text-sm font-semibold text-gray-900 hover:bg-white hover:border-primary transition-all"
                  >
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Return</span>
                      <span>{endTime}</span>
                    </div>
                    <Clock size={14} className="text-gray-500 shrink-0" />
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

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-5 sm:pt-6 border-t border-gray-300/50">
{/* الـ Grid يعرض عمودين في الموبايل والتابلت، و4 أعمدة في الشاشات الكبيرة */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4 w-full lg:w-auto">
    {TRUST_BADGES.map((text, i) => (
      <div key={i} className="flex items-start gap-1.5 sm:gap-2">
        {/* حجم الأيقونة يصغر سنة في الموبايل عشان يتماشى مع الخط */}
        <CheckCircle2 className="text-green-500 shrink-0 mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4" />
        
        {/* حجم الخط: صغير جداً في الموبايل [11px] ويكبر في التابلت sm:text-sm */}
        <span className="text-[10px] sm:text-[13px] font-bold text-black capitalize tracking-wider break-words whitespace-normal leading-tight">
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
                className="h-12 sm:h-14 w-full sm:w-auto px-6 sm:px-8 bg-primary hover:bg-gray-900 text-gray-900 hover:text-primary font-black text-sm uppercase tracking-wider transition-all duration-500 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shrink-0 group overflow-hidden relative"
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