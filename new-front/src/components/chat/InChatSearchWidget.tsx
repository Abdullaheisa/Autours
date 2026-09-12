'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Search,
  ChevronDown,
  Plane,
  Building,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';
import { LocationBranch } from '@/types';
import { getLocationDisplayLabel, getLocationPickupValue } from '@/utils/location';
import { vehicleApi } from '@/services/api/vehicleApi';
import { UNIVERSAL_DESTINATION_MAP, normalizeText, isFuzzyMatch } from '@/services/aiAssistantService';

interface InChatSearchWidgetProps {
  initialLocation?: string;
  initialDateFrom?: string;
  initialDateTo?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  isEnglish?: boolean;
  onSearch: (searchData: {
    location: string | number;
    locationName: string;
    country?: string;
    dateFrom: string;
    dateTo: string;
    startTime: string;
    endTime: string;
  }) => void;
  onCancel?: () => void;
}

const TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
];

const POPULAR_COUNTRIES = [
  { label: 'All', en: null, flag: '🌐' },
  { label: '🇹🇷 Turkey', en: 'Turkey', flag: '🇹🇷' },
  { label: '🇦🇪 UAE', en: 'United Arab Emirates', flag: '🇦🇪' },
  { label: '🇪🇬 Egypt', en: 'Egypt', flag: '🇪🇬' },
  { label: '🇬🇪 Georgia', en: 'Georgia', flag: '🇬🇪' },
  { label: '🇪🇸 Spain', en: 'Spain', flag: '🇪🇸' },
  { label: '🇧🇭 Bahrain', en: 'Bahrain', flag: '🇧🇭' },
  { label: '🇯🇴 Jordan', en: 'Jordan', flag: '🇯🇴' },
  { label: '🇰🇼 Kuwait', en: 'Kuwait', flag: '🇰🇼' },
];

const AIRPORT_CODE_MAP: Record<string, string> = {
  dxb: 'dubai',
  auh: 'abu dhabi',
  shj: 'sharjah',
  cai: 'cairo',
  kwi: 'kuwait',
  ist: 'istanbul',
  saw: 'sabiha',
  ayt: 'antalya',
  esb: 'ankara',
  adb: 'izmir',
  tzx: 'trabzon',
  bah: 'bahrain',
  amm: 'amman',
  tbs: 'tbilisi',
  bus: 'batumi',
  mad: 'madrid',
  bcn: 'barcelona',
  ruh: 'riyadh',
  jed: 'jeddah',
  dmm: 'dammam',
};

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
}

function addDaysToDate(dateStr: string, days: number): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function InChatSearchWidget({
  initialLocation = '',
  initialDateFrom,
  initialDateTo,
  initialStartTime = '10:00',
  initialEndTime = '10:00',
  onSearch,
  onCancel,
}: InChatSearchWidgetProps) {
  const [locations, setLocations] = useState<LocationBranch[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Form State
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [locationSearchInput, setLocationSearchInput] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string | null>(null);

  // Dates & Times
  const defaultDateFrom = initialDateFrom || addDaysToDate('', 1);
  const defaultDateTo = initialDateTo || addDaysToDate(defaultDateFrom, 3);

  const [dateFrom, setDateFrom] = useState(defaultDateFrom);
  const [dateTo, setDateTo] = useState(defaultDateTo);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch available live locations from vehicleApi or candidate URLs
  useEffect(() => {
    let isMounted = true;
    async function loadLocs() {
      try {
        const data = await vehicleApi.getLocations().catch(() => null);
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setLocations(data);
          setLoadingLocations(false);
          return;
        }

        const candidateUrls = [
          '/api/backend/get/locations',
          '/api/backend/api/get/locations',
          'https://www.autours.net/api/backend/get/locations',
          '/get/locations',
        ];
        for (const url of candidateUrls) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              const resJson = await res.json();
              const list = Array.isArray(resJson) ? resJson : resJson.data || [];
              if (isMounted && list.length > 0) {
                setLocations(list);
                setLoadingLocations(false);
                return;
              }
            }
          } catch {
            // try next
          }
        }
      } catch (err) {
        console.warn('Failed to load locations in InChatSearchWidget:', err);
      } finally {
        if (isMounted) setLoadingLocations(false);
      }
    }
    loadLocs();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Pre-fill initial location from customer message
  useEffect(() => {
    if (!initialLocation) return;
    
    let canonicalCountry: string | null = null;
    for (const [alias, canonical] of Object.entries(UNIVERSAL_DESTINATION_MAP)) {
      if (
        normalizeText(initialLocation).includes(normalizeText(alias)) ||
        isFuzzyMatch(initialLocation, alias)
      ) {
        canonicalCountry = canonical;
        break;
      }
    }

    const searchTerm = canonicalCountry || initialLocation;

    if (locations.length > 0) {
      const match = locations.find((l) => {
        const name = (l.name || '').toLowerCase();
        const city = ((l as any).city || l.location || '').toLowerCase();
        const country = (l.country || '').toLowerCase();
        const loc = (l.location || '').toLowerCase();
        const s = searchTerm.toLowerCase();
        return name.includes(s) || city.includes(s) || country.includes(s) || loc.includes(s);
      });

      if (match) {
        setSelectedLocation(match);
        setLocationSearchInput(getLocationDisplayLabel(match));
        if (match.country) setSelectedCountryFilter(match.country);
        return;
      }
    }

    setSelectedLocation({
      id: searchTerm,
      name: searchTerm,
      country: canonicalCountry || searchTerm,
    });
    setLocationSearchInput(searchTerm);
    if (canonicalCountry) setSelectedCountryFilter(canonicalCountry);
  }, [initialLocation, locations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate rental duration
  const calculatedDays = React.useMemo(() => {
    if (!dateFrom || !dateTo) return 1;
    const d1 = new Date(dateFrom);
    const d2 = new Date(dateTo);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [dateFrom, dateTo]);

  const handleSelectDuration = (days: number) => {
    setDateTo(addDaysToDate(dateFrom, days));
  };

  const handleSelectLocation = (loc: LocationBranch) => {
    setSelectedLocation(loc);
    setLocationSearchInput(getLocationDisplayLabel(loc));
    setShowLocationDropdown(false);
  };

  const handleSelectCountryPreset = (countryEn: string | null) => {
    setSelectedCountryFilter(countryEn);
    if (!countryEn) return;

    const countryBranch = locations.find(
      (l) => (l.country || '').toLowerCase() === countryEn.toLowerCase()
    );
    if (countryBranch) {
      setSelectedLocation(countryBranch);
      setLocationSearchInput(getLocationDisplayLabel(countryBranch));
    } else {
      setSelectedLocation({ id: countryEn, name: countryEn, country: countryEn });
      setLocationSearchInput(countryEn);
    }
  };

  // Filtered locations with resilient Airport Code (DXB, IST, CAI, etc.) support matching HeroSearch
  const filteredLocations = React.useMemo(() => {
    const rawQ = locationSearchInput.toLowerCase().trim();
    const cleanQ = rawQ.replace(/[^a-z0-9\s]/gi, '').trim();
    const mappedAirport = AIRPORT_CODE_MAP[cleanQ] || '';

    // If typing a search query, search globally across ALL locations (like HeroSearch).
    // If no query typed, respect the selected country filter tab if chosen.
    const list = locations.filter((loc) => {
      const display = getLocationDisplayLabel(loc).toLowerCase();
      const name = (loc.name || '').toLowerCase();
      const city = ((loc as any).city || loc.location || '').toLowerCase();
      const country = (loc.country || '').toLowerCase();
      const locField = (loc.location || '').toLowerCase();
      const addr = ((loc as any).adresse || '').toLowerCase();
      const station = ((loc as any).station_id || '').toLowerCase();
      const abbrev = ((loc as any).abriviation || '').toLowerCase();

      if (cleanQ) {
        return (
          display.includes(cleanQ) ||
          name.includes(cleanQ) ||
          city.includes(cleanQ) ||
          country.includes(cleanQ) ||
          locField.includes(cleanQ) ||
          addr.includes(cleanQ) ||
          station.includes(cleanQ) ||
          abbrev.includes(cleanQ) ||
          (mappedAirport &&
            (display.includes(mappedAirport) ||
              city.includes(mappedAirport) ||
              country.includes(mappedAirport) ||
              name.includes(mappedAirport)))
        );
      }

      if (selectedCountryFilter) {
        return country === selectedCountryFilter.toLowerCase();
      }

      return true;
    });

    return list.reduce((unique, loc) => {
      const display = getLocationDisplayLabel(loc);
      if (!unique.some((l) => getLocationDisplayLabel(l) === display)) {
        unique.push(loc);
      }
      return unique;
    }, [] as LocationBranch[]);
  }, [locations, locationSearchInput, selectedCountryFilter]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const locVal = selectedLocation?.id || selectedLocation?.name || locationSearchInput.trim() || 'Dubai';
    const locName = selectedLocation ? getLocationDisplayLabel(selectedLocation) : locationSearchInput.trim() || 'Dubai';

    onSearch({
      location: locVal,
      locationName: locName,
      country: selectedLocation?.country,
      dateFrom,
      dateTo,
      startTime,
      endTime,
    });
  };

  return (
    <div className="w-full bg-white border-2 border-amber-400/90 rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-amber-500/10 text-gray-900 transition-all duration-300 font-sans" dir="ltr">
      {/* Header (Matching HeroSearch English Tone) */}
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-900 flex items-center justify-center font-bold shadow-2xs shrink-0">
            <Calendar className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h4 className="text-[13px] font-black text-gray-950 leading-tight">
              Select Destination & Dates
            </h4>
            <p className="text-[10.5px] text-gray-500 font-medium">
              Choose location & duration to view live prices
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSearchSubmit} className="space-y-3">
        {/* 1. Pick-up Location Box */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-[11px] font-extrabold text-gray-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Pick-up Location</span>
          </label>

          <div
            onClick={() => setShowLocationDropdown(true)}
            className="w-full flex items-center justify-between bg-amber-50/40 hover:bg-amber-50/70 border border-amber-300/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400/20 rounded-xl px-3 py-2 cursor-pointer transition-all shadow-2xs"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-amber-700 font-bold text-xs shrink-0">
                {selectedLocation?.location_type === 'Airport' || selectedLocation?.airport_id ? '✈️' : '📍'}
              </span>
              <input
                type="text"
                value={locationSearchInput}
                onChange={(e) => {
                  setLocationSearchInput(e.target.value);
                  setShowLocationDropdown(true);
                }}
                onFocus={() => setShowLocationDropdown(true)}
                placeholder="Enter airport, city or location (e.g. DXB, Dubai)"
                className="w-full bg-transparent text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>
            {locationSearchInput ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocationSearchInput('');
                  setSelectedLocation(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${showLocationDropdown ? 'rotate-180' : ''}`} />
            )}
          </div>

          {/* Location Dropdown Modal/List */}
          {showLocationDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2 max-h-64 overflow-y-auto space-y-2">
              {/* Country Filter Quick Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1.5 border-b border-gray-100 scrollbar-none">
                {POPULAR_COUNTRIES.map((c) => {
                  const isActive = selectedCountryFilter === c.en;
                  return (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => handleSelectCountryPreset(c.en)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-bold whitespace-nowrap flex items-center gap-1 transition-colors ${
                        isActive
                          ? 'bg-[#f9d602] text-neutral-950 shadow-2xs font-black'
                          : 'bg-gray-100 text-gray-700 hover:bg-amber-100'
                      }`}
                    >
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Locations List */}
              <div className="space-y-1">
                {filteredLocations.length > 0 ? (
                  filteredLocations.slice(0, 25).map((loc) => {
                    const isAirport = loc.location_type === 'Airport' || loc.airport_id != null;
                    const label = getLocationDisplayLabel(loc);
                    const isSelected = selectedLocation?.id === loc.id;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => handleSelectLocation(loc)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? 'bg-amber-100 text-amber-950 font-bold'
                            : 'hover:bg-gray-50 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0 text-sm">
                            {isAirport ? '✈️' : '🏢'}
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-[11.5px] truncate">{label}</p>
                            <p className="text-[10px] text-gray-500">{((loc as any).city || loc.location || loc.country)}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-3 text-xs text-gray-400 font-bold">
                    No matching locations found
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. Pick-up Date, Return Date & Times */}
        <div className="grid grid-cols-2 gap-2">
          {/* Pickup Date & Time */}
          <div className="bg-gray-50/90 border border-gray-200 rounded-xl p-2 space-y-1.5 shadow-2xs">
            <label className="block text-[10px] font-extrabold text-gray-700 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Pick-up Date</span>
            </label>
            <input
              type="date"
              value={dateFrom}
              min={addDaysToDate('', 0)}
              onChange={(e) => {
                setDateFrom(e.target.value);
                if (e.target.value >= dateTo) {
                  setDateTo(addDaysToDate(e.target.value, 3));
                }
              }}
              className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1 text-[11px] font-bold text-gray-900 focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-1.5 py-0.5">
              <Clock className="w-2.5 h-2.5 text-gray-400 shrink-0" />
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-transparent text-[10.5px] font-bold text-gray-800 focus:outline-none cursor-pointer"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Return Date & Time */}
          <div className="bg-gray-50/90 border border-gray-200 rounded-xl p-2 space-y-1.5 shadow-2xs">
            <label className="block text-[10px] font-extrabold text-gray-700 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Return Date</span>
            </label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || addDaysToDate('', 1)}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1 text-[11px] font-bold text-gray-900 focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-1.5 py-0.5">
              <Clock className="w-2.5 h-2.5 text-gray-400 shrink-0" />
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-transparent text-[10.5px] font-bold text-gray-800 focus:outline-none cursor-pointer"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Quick Duration Preset Buttons */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-[11px] font-black text-gray-600 shrink-0">
            Duration:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-1">
            {[3, 5, 7, 10, 14].map((days) => {
              const isActive = calculatedDays === days;
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleSelectDuration(days)}
                  className={`text-[10.5px] px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#f9d602] text-neutral-950 shadow-xs border border-amber-500 scale-102 font-black'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200/80'
                  }`}
                >
                  {days} Days
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Search Summary & Submit Button */}
        <div className="pt-1 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] bg-amber-50/70 px-3 py-1.5 rounded-xl border border-amber-200/80 gap-2">
            <div className="flex items-center gap-1.5 font-bold text-gray-900 truncate">
              <span className="bg-amber-400/20 text-amber-950 px-2 py-0.5 rounded-md text-[10.5px] font-black shrink-0">
                {calculatedDays} Days Rental
              </span>
              <span className="text-gray-600 text-[10.5px] truncate">
                {formatDisplayDate(dateFrom)} - {formatDisplayDate(dateTo)}
              </span>
            </div>
            <div className="text-emerald-700 font-extrabold flex items-center gap-1 text-[10.5px] bg-emerald-100/50 px-2 py-0.5 rounded-md shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Free Cancellation</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#f9d602] hover:bg-[#e6c502] active:scale-[0.98] text-neutral-950 font-black py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-400/25 flex items-center justify-center gap-2 text-xs sm:text-[13px] cursor-pointer"
          >
            <Search className="w-4 h-4 text-neutral-950 stroke-[2.5]" />
            <span>Find Available Cars Now</span>
          </button>
        </div>
      </form>
    </div>
  );
}
