'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';
import {
  Search, MapPin, Calendar, Clock, Plane, Building, X, SlidersHorizontal
} from 'lucide-react';
import CalendarRangePicker from '@/components/shared/CalendarRangePicker';
import { RootState, AppDispatch } from '@/store';
import { setSearchParams, initiateSearch } from '@/store/slices/searchSlice';
import { vehicleApi } from '@/services/api/vehicleApi';
import { LocationBranch } from '@/types';

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, '0')}:00`
);

interface ResultsSearchBarProps {
  onSearch: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  buttonText?: string;
  readOnlyLocation?: boolean;
  preventRedirect?: boolean;
}

export default function ResultsSearchBar({ 
  onSearch, 
  isOpen = true, 
  onClose,
  buttonText = "Search Again",
  readOnlyLocation = false,
  preventRedirect = false
}: ResultsSearchBarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSelector((state: RootState) => state.search.searchParams);
  const currencyCode = useSelector((state: RootState) => state.currency.code);
  const { isSearching } = useSelector((state: RootState) => state.search);

  const [location, setLocation] = useState(searchParams.location || '');
  const [locations, setLocations] = useState<LocationBranch[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(
    searchParams.dateFrom ? new Date(searchParams.dateFrom) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    searchParams.dateTo ? new Date(searchParams.dateTo) : null
  );
  const [startTime, setStartTime] = useState(searchParams.startTime || '10:00');
  const [endTime, setEndTime] = useState(searchParams.endTime || '10:00');

  const [showLocations, setShowLocations] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  const locationsRef = useRef<HTMLDivElement>(null);
  const datesRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Sync with Redux
  useEffect(() => {
    setLocation(searchParams.location || '');
    if (searchParams.dateFrom) setStartDate(new Date(searchParams.dateFrom));
    if (searchParams.dateTo) setEndDate(new Date(searchParams.dateTo));
    if (searchParams.startTime) setStartTime(searchParams.startTime);
    if (searchParams.endTime) setEndTime(searchParams.endTime);
  }, [searchParams]);

  // Fetch locations
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

  const filteredLocations = locations.filter(loc =>
    loc.location.toLowerCase().includes(location.toLowerCase()) ||
    loc.country.toLowerCase().includes(location.toLowerCase()) ||
    loc.name.toLowerCase().includes(location.toLowerCase())
  );

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideLocations = locationsRef.current?.contains(target) ?? false;
      const isInsideDates = datesRef.current?.contains(target) ?? false;
      const isInsideStart = startRef.current?.contains(target) ?? false;
      const isInsideEnd = endRef.current?.contains(target) ?? false;
      const calendarElement = document.querySelector('[data-calendar-root]');
      const isInsideCalendar = calendarElement ? calendarElement.contains(target) : false;

      if (!isInsideLocations) setShowLocations(false);
      if (!isInsideDates && !isInsideCalendar) setShowCalendar(false);
      if (!isInsideStart) setShowStartTime(false);
      if (!isInsideEnd) setShowEndTime(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !startDate || !endDate) return;

    const dateFrom = format(startDate, 'yyyy-MM-dd');
    const dateTo = format(endDate, 'yyyy-MM-dd');

    dispatch(setSearchParams({
      location: location.trim(),
      dateFrom,
      dateTo,
      startTime,
      endTime,
    }));

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
      // Continue anyway
    }

    const params = new URLSearchParams();
    params.set('location', location.trim());
    params.set('start', dateFrom);
    params.set('end', dateTo);
    params.set('st', startTime);
    params.set('et', endTime);
    params.set('currency', currencyCode);
    if (!preventRedirect) {
      router.replace(`/search?${params.toString()}`);
    }

    onSearch();
    onClose?.();
  };

  return (
    <div className={`bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 overflow-hidden
      transition-all duration-300 ease-in-out
      ${isOpen ? 'block' : 'hidden'}
    `}>
      {/* Mobile Header with Close (only when inside drawer) */}
      {onClose && (
        <div className="md:hidden flex items-center justify-between bg-yellow-50 px-5 py-3 border-b border-yellow-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-yellow-700" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-800">Modify Search</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>
      )}

      {/* Desktop + Tablet Header */}
      <div className="hidden md:flex items-center justify-between bg-yellow-50 px-5 py-3.5 border-b border-yellow-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-yellow-700" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-800">Modify Search</h3>
        </div>
      </div>

      <form onSubmit={handleReSearch} className="p-5 space-y-3">
        {/* Location */}
        <div className="relative" ref={locationsRef}>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={location}
              disabled={readOnlyLocation}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocations(e.target.value.length > 0);
              }}
              onFocus={() => !readOnlyLocation && location.length > 0 && setShowLocations(true)}
              placeholder="Pickup Location"
              className={`w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none transition-all ${readOnlyLocation ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
            />
          </div>
          {showLocations && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[200px] overflow-y-auto z-[60]">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => { setLocation(loc.location); setShowLocations(false); }}
                    className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-all flex items-center gap-3 border-b border-gray-50 last:border-0"
                  >
                    <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                      {loc.location_type?.toLowerCase().includes('airport') ? <Plane size={12} /> : <Building size={12} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800">{loc.location}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{loc.country} • {loc.name}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs font-bold text-gray-400">No locations available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="relative" ref={datesRef}>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-2 px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:border-primary transition-all"
            >
              <Calendar size={14} className="text-gray-400" />
              {startDate ? format(startDate, 'yyyy/MM/dd') : 'Pickup'}
            </button>
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-2 px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:border-primary transition-all"
            >
              <Calendar size={14} className="text-gray-400" />
              {endDate ? format(endDate, 'yyyy/MM/dd') : 'Return'}
            </button>
          </div>
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative" ref={startRef}>
            <button
              type="button"
              onClick={() => setShowStartTime(!showStartTime)}
              className="w-full flex items-center justify-between px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:border-primary transition-all"
            >
              <span>{startTime}</span>
              <Clock size={12} className="text-gray-300" />
            </button>
            {showStartTime && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[160px] overflow-y-auto z-[60]">
                {TIME_OPTIONS.map((time) => (
                  <button key={time} type="button" onClick={() => { setStartTime(time); setShowStartTime(false); }}
                    className={`w-full px-3 py-2 text-left text-[10px] font-bold hover:bg-primary/10 transition-all ${startTime === time ? 'bg-primary/10 text-gray-900' : ''}`}
                  >{time}</button>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={endRef}>
            <button
              type="button"
              onClick={() => setShowEndTime(!showEndTime)}
              className="w-full flex items-center justify-between px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:border-primary transition-all"
            >
              <span>{endTime}</span>
              <Clock size={12} className="text-gray-300" />
            </button>
            {showEndTime && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[160px] overflow-y-auto z-[60]">
                {TIME_OPTIONS.map((time) => (
                  <button key={time} type="button" onClick={() => { setEndTime(time); setShowEndTime(false); }}
                    className={`w-full px-3 py-2 text-left text-[10px] font-bold hover:bg-primary/10 transition-all ${endTime === time ? 'bg-primary/10 text-gray-900' : ''}`}
                  >{time}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={isSearching || !location.trim() || !startDate || !endDate}
          className="w-full py-3.5 bg-primary text-gray-900 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
          ) : (
            <>
              <Search size={14} />
              {buttonText}
            </>
          )}
        </button>
      </form>

      {/* Calendar Portal */}
      {showCalendar && typeof document !== 'undefined' && createPortal(
        <CalendarDropdown
          startDate={startDate}
          endDate={endDate}
          onSelect={(s, e) => { setStartDate(s); setEndDate(e); }}
          onClose={() => setShowCalendar(false)}
          triggerRef={datesRef}
        />,
        document.body
      )}
    </div>
  );
}

// CalendarDropdown component
interface CalendarDropdownProps {
  startDate: Date | null;
  endDate: Date | null;
  onSelect: (start: Date, end: Date) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

function CalendarDropdown({ startDate, endDate, onSelect, onClose, triggerRef }: CalendarDropdownProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const calendarWidth = 600;

      let left = rect.left;
      if (left + calendarWidth > window.innerWidth - 20) {
        left = Math.max(20, rect.right - calendarWidth);
      }
      if (left < 20) left = 20;

      setPosition({
        top: rect.bottom + 8,
        left: left,
      });
      setIsVisible(true);
    }
  }, [triggerRef]);

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [updatePosition]);

  if (!isVisible) return null;

  return (
    <div data-calendar-root onMouseDown={(e) => e.stopPropagation()}>
      <div
        className="fixed z-[9999]"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <CalendarRangePicker
          startDate={startDate}
          endDate={endDate}
          onSelect={onSelect}
          onClose={onClose}
          singleMonth={false}
        />
      </div>
    </div>
  );
}