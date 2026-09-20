'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Info,
  MapPin,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { RootState } from '@/store';
import { Vehicle, Currency } from '@/types';
import { getVehicleImageUrl, getLogoUrl } from '@/utils/getImageUrl';
import { getVehicleDisplayPrice } from '@/utils/vehiclePrice';
import { assets } from '@/config/assets';

interface ChatCarCardProps {
  vehicle: Vehicle;
  searchCriteria?: {
    location?: string | number;
    locationName?: string;
    dateFrom?: string;
    dateTo?: string;
    startTime?: string;
    endTime?: string;
    currency?: string;
  };
  onStartBooking?: (vehicle: Vehicle) => void;
}

export default function ChatCarCard({
  vehicle,
  searchCriteria,
  onStartBooking,
}: ChatCarCardProps) {
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  // Connect to active currency in Redux store
  const { code: reduxCurrencyCode, allRates } = useSelector((state: RootState) => state.currency);

  const dateFrom = searchCriteria?.dateFrom || '';
  const dateTo = searchCriteria?.dateTo || '';

  const handleGoToSearch = () => {
    const params = new URLSearchParams();
    const loc = searchCriteria?.location ? String(searchCriteria.location) : '';
    const locLabel = searchCriteria?.locationName || loc;
    const start = searchCriteria?.dateFrom || '';
    const end = searchCriteria?.dateTo || '';
    const st = searchCriteria?.startTime || '10:00';
    const et = searchCriteria?.endTime || '10:00';
    const curr = reduxCurrencyCode || searchCriteria?.currency || vehicle.baseCurrency || 'AED';

    if (loc) params.set('location', loc);
    if (locLabel) params.set('locationLabel', locLabel);
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    if (st) params.set('st', st);
    if (et) params.set('et', et);
    if (curr) params.set('currency', curr);
    params.set('selectedVehicle', String(vehicle.id));

    router.push(`/search?${params.toString()}`);
  };
  
  // Calculate rental days
  let days = 3;
  if (dateFrom && dateTo) {
    const d1 = new Date(dateFrom).getTime();
    const d2 = new Date(dateTo).getTime();
    const diffDays = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) days = diffDays;
  }

  const activeCurrency = (reduxCurrencyCode || searchCriteria?.currency || vehicle.baseCurrency || 'AED') as Currency;
  const fetchedCurrency = searchCriteria?.currency || vehicle.baseCurrency || 'AED';

  // Dynamic Total Price reactive to currency switching
  const totalPrice = getVehicleDisplayPrice(
    vehicle,
    activeCurrency,
    allRates,
    days,
    fetchedCurrency
  );
  const dailyPrice = days > 0 ? Math.round(totalPrice / days) : totalPrice;

  const rawPhoto = vehicle.photo || vehicle.image || (vehicle as any).car_photo;
  const vehicleImageUrl = getVehicleImageUrl(rawPhoto);
  const supplierLogoUrl = getLogoUrl(vehicle.supplier?.logo);

  // Helper to extract specs directly from vehicle / backend specifications
  const getSpec = (name: string) => {
    const safeString = (val: any) => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'string') return val.trim();
      if (typeof val === 'number') return String(val);
      if (typeof val === 'object') return (val.name || val.label || val.option || val.title || '').toString().trim();
      return null;
    };

    const specItem = (vehicle.specifications as any[])?.find((s: any) => {
      const sName = s.name?.toLowerCase() || '';
      const target = name.toLowerCase();
      const isAc = (target.includes('air') || target.includes('ac')) && (sName.includes('air') || sName.includes('ac'));
      const isLuggage = (target.includes('bag') || target.includes('luggage') || target.includes('suitcase')) &&
                        (sName.includes('bag') || sName.includes('luggage') || sName.includes('suitcase'));
      return (
        sName.includes(target) ||
        target.includes(sName) ||
        isAc ||
        isLuggage
      );
    });

    const fromSpec = specItem?.option ?? specItem?.value;

    if (fromSpec !== undefined && fromSpec !== null) return safeString(fromSpec) || fromSpec;

    const key = name.toLowerCase();
    const v = vehicle as any;
    const targets = [v, v.car, v.vehicle, v.details].filter(Boolean);
    let result: any = null;

    for (const t of targets) {
      if (key.includes('seat')) {
        const val = t.seats ?? t.passenger_count ?? t.passengers ?? t.capacity ?? t.seats_count ?? t.no_of_seats ?? t.seatsCount;
        if (val !== undefined && val !== null) result = val;
      } else if (key.includes('door')) {
        const val = t.doors ?? t.door_count ?? t.doors_count ?? t.no_of_doors ?? t.doorsCount;
        if (val !== undefined && val !== null) result = val;
      } else if (key.includes('transmission')) {
        result = t.transmission ?? t.gearbox ?? t.shifter ?? t.trans ?? t.transmissionType;
      } else if (key.includes('fuel')) {
        result = t.fuelType ?? t.fuel_type ?? t.fuel ?? t.engine_type ?? t.fuel_policy;
      } else if (key.includes('luggage') || key.includes('bag') || key.includes('suitcase')) {
        result = t.suitcases ?? t.luggage ?? t.bags ?? t.baggage ?? t.luggage_capacity ?? t.suitcasesCount;
      } else if (key.includes('air conditioning') || key.includes('ac')) {
        const val = t.ac ?? t.air_conditioning ?? t.aircon ?? t.has_ac;
        if (val !== undefined && val !== null) {
          result = (val === 1 || val === true || val === 'Yes' || val === 'available') ? 'Air Conditioning' : 'No A/C';
        }
      } else if (key.includes('type')) {
        result = t.type ?? t.category ?? t.class ?? t.vehicle_type ?? t.car_type ?? t.vehicleType;
      }
      if (result !== null && result !== undefined) break;
    }
    return safeString(result) || 'N/A';
  };

  // Extract raw backend spec strings (in English)
  const rawSeats = getSpec('seats');
  const seats = rawSeats !== 'N/A'
    ? (String(rawSeats).toLowerCase().includes('seat') ? rawSeats : `${rawSeats} Seats`)
    : (vehicle.seats ? `${vehicle.seats} Seats` : '5 Seats');

  const rawDoors = getSpec('doors');
  const doors = rawDoors !== 'N/A'
    ? (String(rawDoors).toLowerCase().includes('door') ? rawDoors : `${rawDoors} Doors`)
    : (vehicle.doors ? `${vehicle.doors} Doors` : '5 Doors');

  const rawSuitcase = getSpec('suitcase') !== 'N/A'
    ? getSpec('suitcase')
    : (getSpec('bags') !== 'N/A' ? getSpec('bags') : getSpec('luggage'));
  const validSuitcase = (rawSuitcase && rawSuitcase !== '0' && rawSuitcase !== 0 && rawSuitcase !== 'N/A')
    ? rawSuitcase
    : (vehicle.suitcases || 'Medium');
  const suitcases = String(validSuitcase).toLowerCase().includes('suitcase') || String(validSuitcase).toLowerCase().includes('bag')
    ? validSuitcase
    : `${validSuitcase} Suitcase`;

  const rawAc = getSpec('ac');
  const acText = rawAc !== 'N/A' ? rawAc : (vehicle.ac !== false ? 'Air Conditioning' : 'No A/C');

  const rawFuel = getSpec('fuel');
  const fuelType = rawFuel !== 'N/A'
    ? (rawFuel.toLowerCase().includes('diesel') ? 'Diesel' : rawFuel.toLowerCase().includes('electric') ? 'Electric' : rawFuel.toLowerCase().includes('hybrid') ? 'Hybrid' : 'Petrol')
    : (vehicle.fuelType || 'Petrol');

  const rawTrans = getSpec('transmission');
  const transmission = rawTrans !== 'N/A'
    ? (rawTrans.toLowerCase().includes('manual') || rawTrans.includes('يدوي') ? 'Manual' : 'Automatic')
    : (vehicle.transmission === 'Manual' || vehicle.transmission === 'يدوي' ? 'Manual' : 'Automatic');

  const categoryName = vehicle.category || vehicle.type || 'ECONOMY';

  // Single Location Source (Show ONLY once)
  const branchObj = vehicle.branch || (vehicle.available_branches && vehicle.available_branches[0]);
  const displayLocation =
    searchCriteria?.locationName ||
    branchObj?.name ||
    branchObj?.adresse ||
    branchObj?.city ||
    vehicle.location ||
    'Pickup Location';

  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.07)] border border-gray-200/90 text-gray-900 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] relative overflow-hidden flex flex-col gap-2.5 group w-full font-sans">
      {/* ── Top Row: Single Location Tag (Left) & Category Badge (Right) ───── */}
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full max-w-[65%] truncate shadow-2xs"
          title={displayLocation}
        >
          <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="truncate">{displayLocation}</span>
        </div>

        <span className="bg-[#f9d602] text-neutral-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs shrink-0">
          {categoryName}
        </span>
      </div>

      {/* ── Car Image Showcase (Clickable to full search page) ────────────── */}
      <div
        onClick={handleGoToSearch}
        title="View full car details & all offers on search page"
        className="w-full h-28 bg-gray-50/90 rounded-xl p-1.5 flex items-center justify-center border border-gray-100 overflow-hidden relative cursor-pointer group/img hover:border-amber-300 transition-colors"
      >
        {!imgError && vehicleImageUrl ? (
          <img
            src={vehicleImageUrl}
            alt={vehicle.name}
            className="max-h-full max-w-full object-contain group-hover/img:scale-105 transition-transform duration-200 drop-shadow-sm"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-3xl">🚗</div>
        )}
      </div>

      {/* ── Car Title + Category + Link to Search Page ───────────────────────── */}
      <div className="flex items-baseline justify-between gap-1 -mt-0.5">
        <div
          onClick={handleGoToSearch}
          title="View full car details & all offers on search page"
          className="flex items-center gap-1.5 min-w-0 cursor-pointer group/title"
        >
          <span
            className="inline-flex items-center text-amber-500 shrink-0"
            title="Car specifications and info"
          >
            <Info className="w-3.5 h-3.5 fill-amber-500 text-white" />
          </span>
          <h4 className="font-black text-gray-900 text-xs sm:text-sm leading-tight truncate group-hover/title:text-amber-600 transition-colors">
            {vehicle.name}
          </h4>
          <ExternalLink className="w-3 h-3 text-gray-400 group-hover/title:text-amber-600 shrink-0" />
        </div>
        <span className="text-blue-600 font-bold text-[10px] uppercase tracking-wide shrink-0">
          {categoryName}
        </span>
      </div>

      {/* ── 6 Specifications Chips Using Backend Strings (in English) ──────── */}
      <div className="grid grid-cols-3 gap-1.5 text-xs text-gray-800 font-bold" dir="ltr">
        {/* 1. Seats */}
        <div className="bg-gray-50 border border-gray-200/90 rounded-lg py-1.5 px-1.5 flex items-center justify-center gap-1.5 shadow-2xs">
          <img src={assets.icons.seats} alt="Seats" className="w-5 h-5 object-contain shrink-0" />
          <span className="text-[10.5px] whitespace-nowrap truncate">{seats}</span>
        </div>

        {/* 2. Doors */}
        <div className="bg-gray-50 border border-gray-200/90 rounded-lg py-1.5 px-1.5 flex items-center justify-center gap-1.5 shadow-2xs">
          <img src={assets.icons.doors} alt="Doors" className="w-[18px] h-[18px] object-contain shrink-0" />
          <span className="text-[10.5px] whitespace-nowrap truncate">{doors}</span>
        </div>

        {/* 3. Suitcases (Exact Backend Detail) */}
        <div className="bg-gray-50 border border-gray-200/90 rounded-lg py-1.5 px-1.5 flex items-center justify-center gap-1.5 shadow-2xs">
          <img src={assets.icons.bags} alt="Suitcases" className="w-5 h-5 object-contain shrink-0" />
          <span className="text-[10.5px] whitespace-nowrap truncate">{suitcases}</span>
        </div>

        {/* 4. Transmission */}
        <div className="bg-gray-50 border border-gray-200/90 rounded-lg py-1.5 px-1.5 flex items-center justify-center gap-1.5 shadow-2xs">
          <img src={assets.icons.transmission} alt="Transmission" className="w-[18px] h-[18px] object-contain shrink-0" />
          <span className="text-[10.5px] whitespace-nowrap truncate">{transmission}</span>
        </div>

        {/* 5. Fuel */}
        <div className="bg-gray-50 border border-gray-200/90 rounded-lg py-1.5 px-1.5 flex items-center justify-center gap-1.5 shadow-2xs">
          <img src={assets.icons.fuel} alt="Fuel" className="w-5 h-5 object-contain shrink-0" />
          <span className="text-[10.5px] whitespace-nowrap truncate">{fuelType}</span>
        </div>

        {/* 6. A/C */}
        <div className="bg-gray-50 border border-gray-200/90 rounded-lg py-1.5 px-1.5 flex items-center justify-center gap-1.5 shadow-2xs">
          <img src={assets.icons.ac} alt="A/C" className="w-5 h-5 object-contain shrink-0" />
          <span className="text-[10.5px] whitespace-nowrap truncate">{acText === 'Air Conditioning' ? 'Air Cond.' : acText}</span>
        </div>
      </div>

      {/* ── Bottom Row: Book Now Button + Clear Pricing + Supplier Logo ─────── */}
      <div className="flex items-center justify-between gap-1.5 pt-2.5 border-t border-gray-100 mt-0.5">
        {/* Book Now Button in English */}
        <button
          onClick={() => onStartBooking?.(vehicle)}
          className="bg-[#f9d602] hover:bg-amber-400 text-neutral-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-[0_2px_8px_rgba(249,214,2,0.4)] hover:shadow-[0_4px_12px_rgba(249,214,2,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>Book Now</span>
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180 ltr:rotate-0" />
        </button>

        {/* Clear Prominent Total-Only Pricing Info */}
        <div className="text-center flex flex-col justify-center px-1">
          <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider leading-none">
            Total Price
          </span>
          <div className="text-sm sm:text-base font-black text-gray-950 font-sans tracking-tight leading-tight mt-0.5">
            {totalPrice}{' '}
            <span className="text-xs font-black text-amber-600">
              {activeCurrency}
            </span>
          </div>
        </div>

        {/* Supplier Logo (Larger, crisp, well-padded) */}
        <div className="flex items-center shrink-0">
          {supplierLogoUrl ? (
            <div className="w-[84px] h-[30px] sm:w-[92px] sm:h-[32px] bg-white rounded-lg p-1 flex items-center justify-center overflow-hidden border border-gray-200 shadow-2xs">
              <img
                src={supplierLogoUrl}
                alt={vehicle.supplier?.company || 'Supplier'}
                className="w-full h-full object-contain max-h-full"
                onError={(e) => {
                  const parent = (e.target as HTMLElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-[10px] font-bold text-gray-900 px-1 truncate">${vehicle.supplier?.company || 'Autours'}</span>`;
                  }
                }}
              />
            </div>
          ) : (
            <div className="w-[84px] h-[30px] sm:w-[92px] sm:h-[32px] bg-gray-50 rounded-lg px-1 flex items-center justify-center border border-gray-200 text-[10px] font-bold text-gray-800">
              {vehicle.supplier?.company || 'Autours'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



