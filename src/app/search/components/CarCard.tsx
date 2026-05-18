'use client';

import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  Check, Info, X, ChevronDown, ChevronUp,
  Globe,
  Fuel,
  Handshake,
  Plane,
  Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Vehicle } from '@/types';
import { getImageUrl } from '@/utils/getImageUrl';
import { assets } from '@/config/assets';
import { formatPrice } from '@/utils/currency';
import type { Currency } from '@/types';

interface CarCardProps {
  vehicle: Vehicle;
  daysNumber: number;
  hideBookingControls?: boolean;
}

function PickupIcon({ pickupType }: { pickupType: string }) {
  const type = pickupType?.toLowerCase().trim() || '';
  if (type.includes('meet') || type.includes('greet') || type.includes('hand') || type.includes('handover')) {
    return <Handshake size={16} className="text-blue-600 shrink-0 mt-0.5" />;
  }
  if (type.includes('airport') || type.includes('terminal') || type.includes('plane') || type.includes('flight')) {
    return <Plane size={16} className="text-blue-600 shrink-0 mt-0.5" />;
  }
  if (type.includes('mineral') || type.includes('water') || type.includes('drop')) {
    return <Droplets size={16} className="text-blue-600 shrink-0 mt-0.5" />;
  }
  return <Handshake size={16} className="text-blue-600 shrink-0 mt-0.5" />;
}

function PickupLabel({ pickupType }: { pickupType: string }) {
  const type = pickupType?.toLowerCase().trim() || '';
  if (type.includes('meet') || type.includes('greet')) return 'Meet & Greet';
  if (type.includes('airport') || type.includes('terminal')) return 'Airport Pickup';
  if (type.includes('mineral') || type.includes('water')) return 'Mineral Water';
  if (type.includes('handover')) return 'Handover';
  return pickupType.charAt(0).toUpperCase() + pickupType.slice(1);
}

export default function CarCard({ vehicle, daysNumber, hideBookingControls = false }: CarCardProps) {
  const [showTerms, setShowTerms] = useState(false);
  const [showAllInclusions, setShowAllInclusions] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [showInstantTooltip, setShowInstantTooltip] = useState(false);

  const currencyState = useSelector((state: RootState) => state.currency);
  const { code: currencyCode, rate: currencyRate, allRates } = currencyState;

  const getSpec = (name: string) => {
    const safeString = (val: any) => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'string') return val.trim();
      if (typeof val === 'number') return String(val);
      if (typeof val === 'object') return (val.name || val.label || val.option || val.title || '').toString().trim();
      return null;
    };

    const fromSpec = vehicle.specifications?.find(s =>
      s.name?.toLowerCase().includes(name.toLowerCase())
    )?.option;

    if (fromSpec) return safeString(fromSpec) || fromSpec;

    const key = name.toLowerCase();
    const v = vehicle as any;
    const targets = [v, v.car, v.vehicle, v.details].filter(Boolean);
    let result: any = null;

    for (const t of targets) {
      if (key.includes('seat')) {
        const val = t.seats ?? t.passenger_count ?? t.passengers ?? t.capacity ?? t.seats_count ?? t.no_of_seats ?? t.seatsCount;
        if (val !== undefined && val !== null) result = val;
      }
      else if (key.includes('door')) {
        const val = t.doors ?? t.door_count ?? t.doors_count ?? t.no_of_doors ?? t.doorsCount;
        if (val !== undefined && val !== null) result = val;
      }
      else if (key.includes('transmission')) {
        result = t.transmission ?? t.gearbox ?? t.shifter ?? t.trans ?? t.transmissionType;
      }
      else if (key.includes('fuel')) {
        result = t.fuelType ?? t.fuel_type ?? t.fuel ?? t.engine_type ?? t.fuel_policy;
      }
      else if (key.includes('luggage') || key.includes('bag')) {
        result = t.luggage ?? t.bags ?? t.baggage ?? t.suitcases ?? t.luggage_capacity ?? t.suitcasesCount;
      }
      else if (key.includes('air conditioning') || key.includes('ac')) {
        const val = t.ac ?? t.air_conditioning ?? t.aircon ?? t.has_ac;
        if (val !== undefined && val !== null) {
          result = (val === 1 || val === true || val === 'Yes' || val === 'available') ? 'Yes' : 'No';
        }
      }
      else if (key.includes('type')) {
        result = t.type ?? t.category ?? t.class ?? t.vehicle_type ?? t.car_type ?? t.vehicleType;
      }
      if (result !== null && result !== undefined) break;
    }
    return safeString(result) || 'N/A';
  };

  const carData = useMemo(() => {
    const v = vehicle as any;
    const targets = [v, v.car, v.vehicle, v.details].filter(Boolean);

    const rawName = vehicle.name || targets.map(t => t.name || t.car_name || t.title).find(Boolean) || 'Car';
    const trimmedName = typeof rawName === 'string' ? rawName.trim() : 'Car';

    const imgSource = targets.map(t => t.photo || t.image || t.car_photo || t.main_image || t.thumbnail || t.car_image).find(Boolean);
    const supplierSource = targets.map(t => t.supplier || t.company || t.rental_company).find(Boolean);

    const pickupType = (
      v.pickup_type ??
      v.delivery_type ??
      v.meet_and_greet ??
      v.location_type ??
      v.pickup_location_type ??
      'meet_and_greet'
    );

    const inclusions = (vehicle.included || [])
      .map((i: any) => {
        if (!i) return '';
        if (typeof i === 'string') return i.trim();
        return (i.what_is_included || i.description || '').toString().trim();
      })
      .filter(Boolean);

    const basePriceUsd = vehicle.price_in_usd || (vehicle as any).price || 0;
    const convertedAmount = basePriceUsd * (allRates[currencyCode] || currencyRate) * daysNumber;

    return {
      name: trimmedName,
      type: getSpec('type') !== 'N/A' ? getSpec('type') : 'Economy',
      image: getImageUrl(imgSource),
      transmission: getSpec('transmission'),
      fuelType: getSpec('fuel'),
      seats: getSpec('seats'),
      doors: getSpec('doors'),
      suitcases: getSpec('bags') !== 'N/A' ? getSpec('bags') : getSpec('luggage'),
      ac: getSpec('air conditioning') !== 'No' ? 'Air Conditioning' : 'No A/C',
      supplier: {
        name: (supplierSource?.company || supplierSource?.name || vehicle.supplier?.company || 'Supplier').toString().trim(),
        logo: getImageUrl(supplierSource?.logo || vehicle.supplier?.logo),
        rating: supplierSource?.rating || supplierSource?.rate || 0,
        reviewsCount: supplierSource?.reviewsCount || supplierSource?.reviews_count || 0,
        rentalTerms: (supplierSource?.rentalTerms || supplierSource?.terms || 'General rental terms apply.').toString().trim(),
        instantConfirmation: supplierSource?.instantConfirmation ?? true,
        address: (supplierSource?.address || 'Airport Terminal / City Center').toString().trim(),
        lat: supplierSource?.lat || 25.2532,
        lng: supplierSource?.lng || 55.3657,
      },
      price: {
        amount: convertedAmount,
        currency: currencyCode,
        totalDays: daysNumber || 1,
      },
      inclusions,
      fuelPolicy: 'Full to Full',
      locationType: 'Airport',
      pickupType: pickupType,
      freeCancellation: inclusions.some(i => i.toLowerCase().includes('cancel')),
      freeCancellationHours: 24,
    };
  }, [vehicle, daysNumber, currencyCode, currencyRate, allRates]);

  const openMap = () => {
    window.open(`https://www.google.com/maps?q=${carData.supplier.lat},${carData.supplier.lng}`, '_blank');
  };

  const displayedInclusions = showAllInclusions
    ? carData.inclusions
    : carData.inclusions.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl border-2 shadow-md border-gray-100 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-300 w-full overflow-hidden text-sm"
    >
      {/* ═══════════════════════════════════════════════════════════
          MOBILE (< 768px): Compact stacked layout - HIDDEN DETAILS
          ═══════════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        {/* Image */}
        <div className="p-4 pb-2 flex justify-center">
          <img
            src={carData.image}
            alt={carData.name}
            className="w-full max-w-[240px] h-auto max-h-[140px] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x180?text=No+Image';
            }}
          />
        </div>

        {/* Name & Type */}
        <div className="px-4 pb-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base font-black text-gray-900 leading-tight">
              {carData.name}
            </h3>

            <span className="text-xs font-normal text-gray-500">or Similar</span>
                        <div
              className="relative"
              onMouseEnter={() => setShowInfoTooltip(true)}
              onMouseLeave={() => setShowInfoTooltip(false)}
            >
              <div className="w-4 h-4 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #f4d849 0%, #e5c73a 100%)' }}
              >
                <Info size={9} className="text-gray-900" strokeWidth={3} />
              </div>
              <AnimatePresence>
                {showInfoTooltip && (
                  <motion.div
 initial={{ opacity: 0, y: 5, x: "-50%" }}
  animate={{ opacity: 1, y: 0, x: "-50%" }}
  exit={{ opacity: 0, y: 5, x: "-50%" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl"
                  >
                    <div className="absolute -top-1 left-1/2 translate-x-[-50%]  w-2 h-2 bg-gray-900 rotate-45" />
                    The supplier will provide a car with same class and specifications, though the make may vary.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-xs font-black text-gray-500 mt-0.5">{carData.type}</p>
        </div>

        {/* Features - Full specs in 3 columns */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2">
              <img src={assets.icons.seats} alt="Seats" className="w-5 h-5" />
              <span className="text-[10px] font-black text-gray-600">{carData.seats} Seats</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2">
              <img src={assets.icons.doors} alt="Doors" className="w-5 h-5" />
              <span className="text-[10px] font-black text-gray-600">{carData.doors} Doors</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2">
              <img src={assets.icons.bags} alt="Bags" className="w-5 h-5" />
              <span className="text-[10px] font-black text-gray-600">{carData.suitcases} Bags</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2">
              <img src={assets.icons.ac} alt="AC" className="w-5 h-5" />
              <span className="text-[10px] font-black text-gray-600">{carData.ac}</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2">
              <img src={assets.icons.fuel} alt="Fuel" className="w-5 h-5" />
              <span className="text-[10px] font-black text-gray-600">{carData.fuelType}</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2">
              <img src={assets.icons.transmission} alt="Transmission" className="w-5 h-5" />
              <span className="text-[10px] font-black text-gray-600">{carData.transmission}</span>
            </div>
          </div>
        </div>

        {/* Supplier Box - COMPACT INLINE */}
        <div className="mx-4 mb-2">
          <div className="w-full bg-gray-100 rounded-xl px-3 py-2.5 flex items-center gap-x-6 gap-y-3  flex-wrap">
            {/* Logo */}
            <div className="bg-white p-1 rounded-lg flex items-center justify-center w-20 h-10 shrink-0 shadow-sm">
              <img
                src={carData.supplier.logo}
                alt=""
                className="h-10 w-auto max-w-[80px] object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>

            {/* Name + Terms */}
            <div className="min-w-0 ">
              <span className="text-xs font-black text-gray-800 block truncate">{carData.supplier.name}</span>
              <button
                onClick={() => setShowTerms(true)}
                className="text-[10px] font-black text-blue-600 underline hover:text-blue-800 leading-none"
              >
                Rental Terms
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="bg-[var(--primary)] text-gray-900 px-1.5 py-0.5 rounded text-xs font-black">{carData.supplier.rating}/10</span>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black text-gray-700">Excellent</span>
                <span className="text-[9px] font-black text-gray-500">({carData.supplier.reviewsCount}+)</span>
              </div>
            </div>

            {/* Instant Confirmation */}
            {carData.supplier.instantConfirmation && (
              <div className="flex items-center gap-1 shrink-0">
                <img src={assets.icons.instant} alt="Instant" className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-black text-gray-700">Instant confirmation</span>
              <div
                  className="relative"
                  onMouseEnter={() => setShowInstantTooltip(true)}
                  onMouseLeave={() => setShowInstantTooltip(false)}
                >
                  <div className="w-4 h-4 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{ background: 'linear-gradient(135deg, #f4d849 0%, #e5c73a 100%)' }}
                  >
                    <Info size={10} className="text-gray-900" strokeWidth={3} />
                  </div>
                  <AnimatePresence>
                    {showInstantTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full right-[-60px] mt-2 w-56 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl z-50"
                      >
                        <div className="absolute -top-1 right-[63px] w-2 h-2 bg-gray-900 rotate-45" />
                        Receive instant booking confirmation!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Free Cancellation - OUTSIDE BOX */}
        {carData.freeCancellation && (
          <div className="mx-4 mb-2 flex items-center gap-1.5 text-green-700">
            <Check size={14} className="stroke-[2.5] shrink-0" />
            <span className="text-xs font-black">Free Cancellation ({carData.freeCancellationHours}h)</span>
          </div>
        )}

        {/* MORE DETAILS BUTTON - MOBILE */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setShowMobileDetails(!showMobileDetails)}
            className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-black text-xs uppercase hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {showMobileDetails ? (
              <>
                <ChevronUp size={16} />
                Less Details
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                More Details
              </>
            )}
          </button>
        </div>

        {/* COLLAPSIBLE SECTION - What's Included + Details */}
        <AnimatePresence>
          {showMobileDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {/* What's Included - Expandable */}
              <div className="px-4 pb-2.5">
                <div className="bg-green-50/50 rounded-xl px-3 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-black text-green-700">What is Included</h4>

                  </div>
                    <div className="mt-2 h-0.5 bg-yellow-400 w-full" />

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-3">
                    {displayedInclusions.map((inc, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check size={12} className="text-green-600 shrink-0" />
                        <span className="text-xs font-black text-gray-600">{inc}</span>
                      </div>
                    ))}
                    
                  </div>
                                      {carData.inclusions.length > 4 && (
                      <button
                        onClick={() => setShowAllInclusions(!showAllInclusions)}
                        className="text-xs text-end w-full py-3 pr-5 font-black text-gray-600 underline hover:text-gray-800"
                      >
                        {showAllInclusions ? 'Show Less' : 'More +'}
                      </button>
                    )}
                </div>
              </div>

              {/* Details: Address → Fuel Policy → Pick-up */}
              <div className="px-4 pb-4 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <button onClick={openMap} className="shrink-0 pt-0.5">
                    <Globe size={16} className="text-blue-600" />
                  </button>
                  <div>
                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider ">Address: </span>
                    <span className="text-sm font-black text-gray-800">{carData.supplier.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Fuel size={17} className="text-blue-600 shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Fuel Policy: </span>
                    <span className="text-sm font-black text-gray-800">{carData.fuelPolicy}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <PickupIcon pickupType={carData.pickupType} />
                  <div>
                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Pick-up: </span>
                    <span className="text-sm font-black text-gray-800">
                      <PickupLabel pickupType={carData.pickupType} />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom: Price + Book */}
        <div className="p-4 pt-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-gray-500 block mb-0.5">for {carData.price.totalDays} days</span>
              <div className="flex items-baseline">
                <span className="text-2xl font-black text-gray-900">
                  {formatPrice(carData.price.amount, carData.price.currency as Currency)}
                </span>
              </div>
            </div>
            {!hideBookingControls && (
              <Link
                href={`/booking?vehicleId=${vehicle.id}`}
                className="px-6 py-3 bg-[var(--primary)] text-gray-900 rounded-xl font-black text-sm uppercase hover:bg-[var(--primary-600)] active:scale-95 transition-all shrink-0 text-center shadow-md"
              >
                Book Now
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TABLET (768px - 1023px): Stacked layout with hidden details
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex lg:hidden flex-col">
        {/* Image */}
        <div className="p-4 pb-2 flex justify-center">
          <img
            src={carData.image}
            alt={carData.name}
            className="w-full max-w-[260px] h-auto max-h-[150px] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x180?text=No+Image';
            }}
          />
        </div>

        {/* Name & Type */}
        <div className="px-4 pb-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-black text-gray-900 leading-tight">
              {carData.name}
            </h3>

            <span className="text-sm font-normal text-gray-500">or Similar</span>
                        <div
              className="relative"
              onMouseEnter={() => setShowInfoTooltip(true)}
              onMouseLeave={() => setShowInfoTooltip(false)}
            >
              <div className="w-4 h-4 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #f4d849 0%, #e5c73a 100%)' }}
              >
                <Info size={9} className="text-gray-900" strokeWidth={3} />
              </div>
              <AnimatePresence>
                {showInfoTooltip && (
                  <motion.div
 initial={{ opacity: 0, y: 5, x: "-50%" }}
  animate={{ opacity: 1, y: 0, x: "-50%" }}
  exit={{ opacity: 0, y: 5, x: "-50%" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl"
                  >
                    <div className="absolute -top-1 left-1/2 translate-x-[-50%]  w-2 h-2 bg-gray-900 rotate-45" />
                    The supplier will provide a car with same class and specifications, though the make may vary.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-sm font-black text-gray-500 mt-1">{carData.type}</p>
        </div>

        {/* Features - Full specs in 3 columns */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2.5">
              <img src={assets.icons.seats} alt="Seats" className="w-5 h-5" />
              <span className="text-[11px] font-black text-gray-600">{carData.seats} Seats</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2.5">
              <img src={assets.icons.doors} alt="Doors" className="w-5 h-5" />
              <span className="text-[11px] font-black text-gray-600">{carData.doors} Doors</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2.5">
              <img src={assets.icons.bags} alt="Bags" className="w-5 h-5" />
              <span className="text-[11px] font-black text-gray-600">{carData.suitcases} Bags</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2.5">
              <img src={assets.icons.ac} alt="AC" className="w-5 h-5" />
              <span className="text-[11px] font-black text-gray-600">{carData.ac}</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2.5">
              <img src={assets.icons.fuel} alt="Fuel" className="w-5 h-5" />
              <span className="text-[11px] font-black text-gray-600">{carData.fuelType}</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2.5">
              <img src={assets.icons.transmission} alt="Transmission" className="w-5 h-5" />
              <span className="text-[11px] font-black text-gray-600">{carData.transmission}</span>
            </div>
          </div>
        </div>

        {/* Supplier Box - COMPACT INLINE */}
        <div className="mx-4 mb-2.5">
          <div className="w-full bg-gray-100 rounded-xl px-3 py-2.5 flex items-center gap-x-6 gap-y-3  flex-wrap">
            {/* Logo */}
            <div className="bg-white p-1 rounded-lg flex items-center justify-center w-20 h-10 shrink-0 shadow-sm">
              <img
                src={carData.supplier.logo}
                alt=""
                className="h-10 w-auto max-w-[80px] object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>

            {/* Name + Terms */}
            <div className="min-w-0 ">
              <span className="text-sm font-black text-gray-800 block truncate">{carData.supplier.name}</span>
              <button
                onClick={() => setShowTerms(true)}
                className="text-xs font-black text-blue-600 underline hover:text-blue-800 leading-none"
              >
                Rental Terms
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="bg-[var(--primary)] text-gray-900 px-2 py-1 rounded-md text-sm font-black">{carData.supplier.rating}/10</span>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-black text-gray-700">Excellent</span>
                <span className="text-[10px] font-black text-gray-500">({carData.supplier.reviewsCount}+)</span>
              </div>
            </div>

            {/* Instant Confirmation */}
            {carData.supplier.instantConfirmation && (
              <div className="flex items-center gap-1.5 shrink-0">
                <img src={assets.icons.instant} alt="Instant" className="w-5 h-5 shrink-0" />
                <span className="text-xs font-black text-gray-700">Instant Confirmation</span>
                                                <div
                  className="relative"
                  onMouseEnter={() => setShowInstantTooltip(true)}
                  onMouseLeave={() => setShowInstantTooltip(false)}
                >
                  <div className="w-4 h-4 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{ background: 'linear-gradient(135deg, #f4d849 0%, #e5c73a 100%)' }}
                  >
                    <Info size={10} className="text-gray-900" strokeWidth={3} />
                  </div>
                  <AnimatePresence>
                    {showInstantTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full right-[-60px] mt-2 w-56 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl z-50"
                      >
                        <div className="absolute -top-1 right-[63px] w-2 h-2 bg-gray-900 rotate-45" />
                        Receive instant booking confirmation!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Free Cancellation - OUTSIDE BOX */}
        {carData.freeCancellation && (
          <div className="mx-4 mb-2.5 flex items-center gap-2 text-green-700">
            <Check size={16} className="stroke-[2.5] shrink-0" />
            <span className="text-sm font-black">Free Cancellation ({carData.freeCancellationHours}h)</span>
          </div>
        )}

        {/* MORE DETAILS BUTTON - TABLET */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setShowMobileDetails(!showMobileDetails)}
            className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-black text-xs uppercase hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {showMobileDetails ? (
              <>
                <ChevronUp size={16} />
                Less Details
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                More Details
              </>
            )}
          </button>
        </div>

        {/* COLLAPSIBLE SECTION - What's Included + Details */}
        <AnimatePresence>
          {showMobileDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {/* What's Included - Expandable */}
              <div className="px-4 pb-2.5">
                <div className="bg-green-50/50 rounded-xl px-3 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-black text-green-700">What is Included</h4>

                  </div>
                    <div className="mt-2 h-0.5 bg-yellow-400 w-full" />

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-3">
                    {displayedInclusions.map((inc, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check size={12} className="text-green-600 shrink-0" />
                        <span className="text-xs font-black text-gray-600">{inc}</span>
                      </div>
                    ))}
                    
                  </div>
                                      {carData.inclusions.length > 4 && (
                      <button
                        onClick={() => setShowAllInclusions(!showAllInclusions)}
                        className="text-xs text-end w-full py-3 pr-5 font-black text-gray-600 underline hover:text-gray-800"
                      >
                        {showAllInclusions ? 'Show Less' : 'More +'}
                      </button>
                    )}
                </div>
              </div>

                {/* Details: Address → Fuel Policy → Pick-up */}
              <div className="px-4 pb-4 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <button onClick={openMap} className="shrink-0 pt-0.5">
                    <Globe size={16} className="text-blue-600" />
                  </button>
                  <div>
                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider ">Address: </span>
                    <span className="text-sm font-black text-gray-800">{carData.supplier.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Fuel size={17} className="text-blue-600 shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Fuel Policy: </span>
                    <span className="text-sm font-black text-gray-800">{carData.fuelPolicy}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <PickupIcon pickupType={carData.pickupType} />
                  <div>
                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Pick-up: </span>
                    <span className="text-sm font-black text-gray-800">
                      <PickupLabel pickupType={carData.pickupType} />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom: Price + Book */}
        <div className="p-4 pt-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-gray-500 block mb-1">for {carData.price.totalDays} days</span>
              <div className="flex items-baseline">
                <span className="text-3xl font-black text-gray-900">
                  {formatPrice(carData.price.amount, carData.price.currency as Currency)}
                </span>
              </div>
            </div>
            {!hideBookingControls && (
              <Link
                href={`/booking?vehicleId=${vehicle.id}`}
                className="px-8 py-3.5 bg-[var(--primary)] text-gray-900 rounded-xl font-black text-sm uppercase hover:bg-[var(--primary-600)] active:scale-95 transition-all shrink-0 text-center shadow-md"
              >
                Book Now
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP (1024px+): Full detailed layout - COMPACT SUPPLIER BOX
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block">
        {/* ROW 1: Image + Details */}
        <div className="flex items-start">
          <div className="w-[300px] shrink-0 p-5 flex items-center justify-center">
            <img
              src={carData.image}
              alt={carData.name}
              className="w-full h-auto max-h-[200px] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250?text=No+Image';
              }}
            />
          </div>

          <div className="flex-1 p-5 pl-10 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-black text-gray-900">{carData.name}</h3>

                <span className="text-xs font-normal text-gray-500">or Similar</span>
                                <div
                  className="relative"
                  onMouseEnter={() => setShowInfoTooltip(true)}
                  onMouseLeave={() => setShowInfoTooltip(false)}
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #f4d849 0%, #e5c73a 100%)' }}
                  >
                    <Info size={11} className="text-gray-900" strokeWidth={3} />
                  </div>
                  <AnimatePresence>
                    {showInfoTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl z-50"
                      >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                        The supplier will provide a car with same class and specifications, though the make may vary.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <p className="text-xs font-black text-gray-500 mb-4">{carData.type}</p>

              <div className="grid grid-cols-2 w-[80%] justify-between gap-x-0 gap-y-2">
                <div className="flex items-center gap-2">
                  <img src={assets.icons.seats} alt="Seats" className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black text-gray-700">{carData.seats} Seats</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={assets.icons.doors} alt="Doors" className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black text-gray-700">{carData.doors} Doors</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={assets.icons.bags} alt="Bags" className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black text-gray-700">{carData.suitcases} Suitcase</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={assets.icons.ac} alt="AC" className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black text-gray-700">{carData.ac}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={assets.icons.fuel} alt="Fuel" className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black text-gray-700">{carData.fuelType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={assets.icons.transmission} alt="Transmission" className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black text-gray-700">{carData.transmission}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Box - DESKTOP - COMPACT INLINE LAYOUT */}
        <div className="mx-5 mb-2 flex ">
          <div className="w-[74%] bg-gray-100 rounded-xl px-4 py-2.5 flex items-center  gap-x-8 gap-y-4 flex-wrap">
            {/* Logo */}
            <div className="bg-white p-1.5 rounded-lg flex items-center justify-center w-20 h-10 shrink-0 shadow-sm">
              <img
                src={carData.supplier.logo}
                alt=""
                className="h-7 w-auto max-w-[65px] object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>

            {/* Name + Terms */}
            <div className="min-w-0 ">
              <span className="text-sm font-black text-gray-800 block truncate">{carData.supplier.name}</span>
              <button onClick={() => setShowTerms(true)} className="text-xs font-black text-blue-600 underline hover:text-blue-800 leading-none">Rental Terms</button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="bg-[var(--primary)] text-gray-900 px-2 py-1 rounded-md text-sm font-black">{carData.supplier.rating}/10</span>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-black text-gray-700">Excellent</span>
                <span className="text-[10px] font-black text-gray-500">({carData.supplier.reviewsCount}+ reviews)</span>
              </div>
            </div>

            {/* Instant Confirmation */}
            {carData.supplier.instantConfirmation && (
              <div className="flex items-center gap-1.5 shrink-0">
                <img src={assets.icons.instant} alt="Instant" className="w-5 h-5 shrink-0" />
                <span className="text-xs font-black text-gray-700 whitespace-nowrap">Instant Confirmation</span>
                <div
                  className="relative"
                  onMouseEnter={() => setShowInstantTooltip(true)}
                  onMouseLeave={() => setShowInstantTooltip(false)}
                >
                  <div className="w-4 h-4 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{ background: 'linear-gradient(135deg, #f4d849 0%, #e5c73a 100%)' }}
                  >
                    <Info size={10} className="text-gray-900" strokeWidth={3} />
                  </div>
                  <AnimatePresence>
                    {showInstantTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl z-50"
                      >
                        <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 rotate-45" />
                        Receive instant booking confirmation!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
          {/* Free Cancellation - OUTSIDE BOX - DESKTOP */}
          {carData.freeCancellation && (
            <div className="mx-5 mb-2 flex items-center gap-2 text-green-700">
              <Check size={16} className="stroke-[2.5] shrink-0" />
              <span className="text-sm font-bold">Free Cancellation ({carData.freeCancellationHours}h)</span>
            </div>
          )}
        </div>



        {/* ROW 3: Inclusions + Details + Price */}
        <div className="flex ">
          <div className='flex bg-green-100/35 rounded-xl mx-4 mb-4 w-[75%]'>
          {/* What's Included */}
          <div className="w-[50%] p-5 pt-3 ">
          <div className=" ">
                          <div className="mb-2 ">
              <h4 className="text-xs font-black text-green-700">What is Included!</h4>
              <div className="mt-2 h-0.5 bg-yellow-400 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-3">
              {displayedInclusions.map((inc, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Check size={11} className="text-green-600 shrink-0" />
                  <span className="text-[11px] font-black text-gray-700">{inc}</span>
                </div>
              ))}
            </div>
            {carData.inclusions.length > 4 && (
              <button onClick={() => setShowAllInclusions(!showAllInclusions)} className="mt-2 text-[11px] font-black text-gray-800 underline hover:text-gray-600">
                {showAllInclusions ? 'Show Less' : 'Show More +'}
              </button>
            )}
          </div>
          </div>


          {/* Details - Lucide Icons */}
          <div className="w-[50%] p-5 pt-14 space-y-3">
            <div className="flex items-start gap-2">
              <button onClick={openMap} className="shrink-0 pt-0.5">
                <Globe size={14} className="text-blue-600" />
              </button>
              <div className="flex items-start gap-1.5">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider shrink-0">Address</span>
                <span className="text-xs font-black text-gray-800">{carData.supplier.address}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Fuel size={16} className="text-blue-600 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Fuel Policy</span>
                <span className="text-xs font-black text-gray-800">{carData.fuelPolicy}</span>
              </div>
            </div>

            <div className="flex items-start gap-1.5">
              <PickupIcon pickupType={carData.pickupType} />
              <div>
                <span className="text-xs font-black">Pick-up: </span>
                <span className="text-[11px] font-black text-gray-800">
                  <PickupLabel pickupType={carData.pickupType} />
                </span>
              </div>
            </div>
          </div>
          </div>

          {/* Price + Book */}
          <div className="w-[260px] shrink-0 p-5 pt-6 flex flex-col items-start justify-end">
            <span className="text-sm font-bold pl-4 text-gray-500 block mb-2">for {carData.price.totalDays} days</span>
            <div className="text-left mb-5">
              <span className="text-3xl pl-4 font-black text-gray-900">
                {formatPrice(carData.price.amount, carData.price.currency as Currency)}
              </span>
            </div>

            {!hideBookingControls && (
              <Link
                href={`/booking?vehicleId=${vehicle.id}`}
                className="w-full py-3.5 bg-[var(--primary)] text-gray-900 rounded-xl font-black text-lg uppercase tracking-wide hover:bg-[var(--primary-600)] active:scale-[0.98] transition-all text-center shadow-lg"
              >
                Book Now
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Rental Terms */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTerms(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-4 md:p-6 z-10 mx-2 max-h-[90vh] flex flex-col"
            >
              <button onClick={() => setShowTerms(false)} className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} />
              </button>
              <h4 className="text-lg md:text-xl font-black text-gray-900 mb-3 md:mb-4 flex items-center gap-2 pr-8">
                <div className="bg-[var(--primary)]/20 p-2 rounded-xl shrink-0"><Info className="text-[var(--primary)]" size={20} /></div>
                Rental Terms
              </h4>
              <div className="prose prose-sm overflow-y-auto no-scrollbar flex-1">
                <div className="space-y-3 md:space-y-4 text-gray-600 font-black leading-relaxed text-xs md:text-sm">
                  <p className="whitespace-pre-line">{carData.supplier.rentalTerms}</p>
                </div>
              </div>
              <button onClick={() => setShowTerms(false)} className="w-full mt-4 md:mt-6 py-2.5 md:py-3 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-black transition-colors">
                I Understand
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}