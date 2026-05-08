'use client';

import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  Check, Info, Users, Gauge, Briefcase, 
  Fuel, Zap, X, Snowflake, DoorOpen, MapPin, ChevronDown, ChevronUp,
  Earth,
  Handshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Vehicle } from '@/types';
import { getImageUrl } from '@/utils/getImageUrl';
import { formatPrice } from '@/utils/currency';
import type { Currency } from '@/types';

interface CarCardProps {
  vehicle: Vehicle;
  daysNumber: number;
  hideBookingControls?: boolean;
}

export default function CarCard({ vehicle, daysNumber, hideBookingControls = false }: CarCardProps) {
  const [showTerms, setShowTerms] = useState(false);
  const [showAllInclusions, setShowAllInclusions] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  // Redux Currency State
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

    const inclusions = (vehicle.included || [])
      .map((i: any) => {
        if (!i) return '';
        if (typeof i === 'string') return i.trim();
        return (i.what_is_included || i.description || '').toString().trim();
      })
      .filter(Boolean);

    // Calculate dynamic price using base USD price from API
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
      ac: getSpec('air conditioning') !== 'No',
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
      freeCancellation: inclusions.some(i => i.toLowerCase().includes('cancel')),
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
      className="bg-white rounded-xl  shadow-sm hover:shadow-md transition-shadow w-full overflow-hidden text-sm"
    >
      {/* ═══════════════════════════════════════════════════════════
          MOBILE (< 768px): Compact stacked layout
          ═══════════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        {/* Image */}
        <div className="p-3 pb-1 flex justify-center">
          <img 
            src={carData.image} 
            alt={carData.name} 
            className="w-full max-w-[160px] h-auto max-h-[100px] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x180?text=No+Image';
            }}
          />
        </div>

        {/* Name & Type */}
        <div className="px-3 pb-2">
          <h3 className="text-base font-bold text-gray-900 leading-tight">
            {carData.name} <span className="text-xs font-normal text-gray-500">or Similar</span>
          </h3>
          <p className="text-xs text-gray-500">{carData.type}</p>
        </div>

        {/* Features - Compact 2 cols */}
        <div className="px-3 pb-2">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5">
              <Users size={13} className="text-gray-500 shrink-0" />
              <span className="text-xs text-gray-600">{carData.seats} Seats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DoorOpen size={13} className="text-gray-500 shrink-0" />
              <span className="text-xs text-gray-600">{carData.doors} Doors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase size={13} className="text-gray-500 shrink-0" />
              <span className="text-xs text-gray-600">{carData.suitcases} Bags</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Snowflake size={13} className="text-gray-500 shrink-0" />
              <span className="text-xs text-gray-600">A/C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel size={13} className="text-gray-500 shrink-0" />
              <span className="text-xs text-gray-600">{carData.fuelType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge size={13} className="text-gray-500 shrink-0" />
              <span className="text-xs text-gray-600">{carData.transmission}</span>
            </div>
          </div>
        </div>

        {/* Supplier - Compact */}
        <div className="mx-3 mb-2 bg-gray-50 flex items-center gap-4 rounded-lg p-2.5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="bg-white p-1 rounded  flex items-center justify-center w-20 h-8 shrink-0">
              <img 
                src={carData.supplier.logo} 
                alt={carData.supplier.name} 
                className="h-5 w-auto max-w-[80px] object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-gray-800 block truncate">{carData.supplier.name}</span>
              <button 
                onClick={() => setShowTerms(true)}
                className="text-[10px] text-blue-600 underline hover:text-blue-800"
              >
                Rental Terms
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="bg-[#f9d602] text-gray-900 px-1.5 py-0.5 rounded text-xs font-bold">{carData.supplier.rating}/10</span>
            <span className="text-xs font-semibold text-gray-700">Excellent</span>
            <span className="text-[10px] text-gray-500">({carData.supplier.reviewsCount}+)</span>
          </div>
        </div>

        {/* Expandable Details */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setShowMobileDetails(!showMobileDetails)}
            className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-gray-600 py-1.5  rounded-md hover:bg-gray-50 transition-colors"
          >
            {showMobileDetails ? <>Less <ChevronUp size={14} /></> : <>More Details <ChevronDown size={14} /></>}
          </button>
          
          <AnimatePresence>
            {showMobileDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2">
                  {/* Inclusions */}
                  <div>
                    <h4 className="text-xs font-bold text-green-700 mb-1">What's Included</h4>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {displayedInclusions.map((inc, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <Check size={12} className="text-green-600 shrink-0" />
                          <span className="text-[11px] text-gray-600">{inc}</span>
                        </div>
                      ))}
                    </div>
                    {carData.inclusions.length > 4 && (
                      <button
                        onClick={() => setShowAllInclusions(!showAllInclusions)}
                        className="mt-1 text-[11px] font-bold text-gray-700 underline"
                      >
                        {showAllInclusions ? 'Show Less' : 'Show More +'}
                      </button>
                    )}
                  </div>

                  {/* Pickup */}
                  <div className="bg-blue-50/60 flex items-center gap-2 rounded-md p-2">
                <button onClick={openMap} className="text-xs text-blue-600 underline mt-0.5 hover:text-blue-800"><Earth size={14} /></button>
                <div className="flex items-start gap-1">
                  <span className="text-xs font-bold text-gray-700 shrink-0">Address:</span>
                  <span className="text-xs text-gray-700">{carData.supplier.address}</span>
                </div>
                  </div>

                  {/* Fuel */}
                  <div className="flex items-center gap-1.5">
                    <Fuel size={13} className="text-blue-600" />
                    <div>
                      <span className="text-[11px] font-bold text-blue-600">Fuel Policy: </span>
                      <span className="text-[11px] font-bold text-gray-700">{carData.fuelPolicy}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom: Price + Select */}
        <div className=" p-3">
          {carData.freeCancellation && (
            <div className="flex items-center gap-1 mb-2">
              <Check size={14} className="text-green-600 stroke-[2.5]" />
              <span className="text-xs font-bold text-green-700">Free Cancellation</span>
            </div>
          )}
          
          <div className="flex items-end justify-between gap-2">
            <div>
              <span className="text-[10px] text-gray-500">{carData.price.totalDays} days</span>
              <div className="flex items-baseline justify-start">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(carData.price.amount, carData.price.currency as Currency)}
                </span>
              </div>
              <p className="text-[11px] text-blue-600">
                Pay Now {formatPrice(carData.price.amount * 0.125, carData.price.currency as Currency)}
              </p>
            </div>
            {!hideBookingControls && (
              <Link 
                href={`/booking?vehicleId=${vehicle.id}`}
                className="px-5 py-2 bg-[#f9d602] text-gray-900 rounded-lg font-bold text-xs uppercase hover:bg-[#e5c502] active:scale-95 transition-all shrink-0 text-center"
              >
                Book Now
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TABLET (768px - 1023px): Side image + stacked info
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex lg:hidden">
        <div className="w-[180px] shrink-0  p-3 flex items-center justify-center">
          <img 
            src={carData.image} 
            alt={carData.name} 
            className="w-full h-auto max-h-[110px] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x180?text=No+Image';
            }}
          />
        </div>
        
        <div className="flex-1 p-3 min-w-0">
          <h3 className="text-base font-bold text-gray-900 mb-0.5">
            {carData.name} <span className="text-xs font-normal text-gray-500">or Similar</span>
          </h3>
          <p className="text-xs text-gray-500 mb-2">{carData.type}</p>
          
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 mb-2">
            <div className="flex items-center gap-1.5">
              <Users size={13} className="text-gray-500" />
              <span className="text-xs text-gray-600">{carData.seats} Seats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DoorOpen size={13} className="text-gray-500" />
              <span className="text-xs text-gray-600">{carData.doors} Doors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase size={13} className="text-gray-500" />
              <span className="text-xs text-gray-600">{carData.suitcases} Bags</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Snowflake size={13} className="text-gray-500" />
              <span className="text-xs text-gray-600">A/C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel size={13} className="text-gray-500" />
              <span className="text-xs text-gray-600">{carData.fuelType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge size={13} className="text-gray-500" />
              <span className="text-xs text-gray-600">{carData.transmission}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1 rounded  w-10 h-7 flex items-center justify-center shrink-0">
                <img src={carData.supplier.logo} alt="" className="h-4 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <span className="text-xs font-bold text-gray-800">{carData.supplier.name}</span>
              <span className="bg-[#f9d602] text-gray-900 px-1.5 py-0.5 rounded text-xs font-bold ml-auto">{carData.supplier.rating}/10</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              {carData.freeCancellation && (
                <div className="flex items-center gap-1 mb-1">
                  <Check size={12} className="text-green-600" />
                  <span className="text-[11px] font-bold text-green-700">Free Cancellation</span>
                </div>
              )}
              <span className="text-[10px] text-gray-500">{carData.price.totalDays} days</span>
              <div className="flex items-baseline justify-start">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(carData.price.amount, carData.price.currency as Currency)}
                </span>
              </div>
            </div>
            {!hideBookingControls && (
              <Link 
                href={`/booking?vehicleId=${vehicle.id}`}
                className="px-4 py-2 bg-[#f9d602] text-gray-900 rounded-lg font-bold text-xs uppercase hover:bg-[#e5c502] active:scale-95 transition-all shrink-0 text-center"
              >
                Book Now
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP (1024px+): Full detailed layout
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block">
        {/* ROW 1: Image + Details */}
        <div className="flex">
          <div className="w-[200px] shrink-0  p-4 flex items-center justify-center">
            <img 
              src={carData.image} 
              alt={carData.name} 
              className="w-full h-auto max-h-[130px] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250?text=No+Image';
              }}
            />
          </div>

          <div className="flex-1 p-4 min-w-0">
            <h3 className="text-lg font-bold text-gray-900">
              {carData.name} <span className="text-sm font-normal text-gray-500">or Similar</span>
            </h3>
            <p className="text-sm text-gray-500 mb-3">{carData.type}</p>

            <div className="grid grid-cols-3 gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-gray-500" />
                <span className="text-sm text-gray-700">{carData.seats} Seats</span>
              </div>
              <div className="flex items-center gap-2">
                <DoorOpen size={15} className="text-gray-500" />
                <span className="text-sm text-gray-700">{carData.doors} Doors</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={15} className="text-gray-500" />
                <span className="text-sm text-gray-700">{carData.suitcases} Suitcase</span>
              </div>
              <div className="flex items-center gap-2">
                <Snowflake size={15} className="text-gray-500" />
                <span className="text-sm text-gray-700">Air Conditioning</span>
              </div>
              <div className="flex items-center gap-2">
                <Fuel size={15} className="text-gray-500" />
                <span className="text-sm text-gray-700">{carData.fuelType}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge size={15} className="text-gray-500" />
                <span className="text-sm text-gray-700">{carData.transmission}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Supplier */}
        <div className="">
          <div className="flex">
            <div className="flex-1 bg-gray-50 px-4 py-3">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded  flex items-center justify-center w-20 h-10 shrink-0">
                    <img src={carData.supplier.logo} alt="" className="h-6 w-auto max-w-[90px] object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-gray-800 block truncate">{carData.supplier.name}</span>
                    <button onClick={() => setShowTerms(true)} className="text-xs text-blue-600 underline hover:text-blue-800">Rental Terms</button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-[#f9d602] text-gray-900 px-2 py-1 rounded text-sm font-bold">{carData.supplier.rating}/10</div>
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Excellent</span>
                    <span className="text-xs text-gray-500 block">({carData.supplier.reviewsCount}+ reviews)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {carData.supplier.instantConfirmation && (
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded ">
                      <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-semibold text-gray-700">Instant Confirmation</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-[200px] shrink-0 flex items-center justify-center  bg-white">
              {carData.freeCancellation && (
                <div className="flex items-center gap-1.5 text-green-700">
                  <Check size={16} className="stroke-[2.5]" />
                  <span className="text-sm font-bold">Free Cancellation</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 3: Inclusions + Details + Price */}
        <div className="">
          <div className="flex">
            <div className="w-[45%] p-4 ">
              <h4 className="text-sm font-bold text-green-700 mb-2">What is Included!</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {displayedInclusions.map((inc, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Check size={12} className="text-green-600 shrink-0" />
                    <span className="text-xs text-gray-700">{inc}</span>
                  </div>
                ))}
              </div>
              {carData.inclusions.length > 4 && (
                <button onClick={() => setShowAllInclusions(!showAllInclusions)} className="mt-2 text-xs font-bold text-gray-800 underline hover:text-gray-600">
                  {showAllInclusions ? 'Show Less' : 'Show More +'}
                </button>
              )}
            </div>

            <div className="flex-1 p-4  space-y-2">

              <div className="bg-blue-50 flex items-start gap-2 rounded p-2">
                <button onClick={openMap} className="text-xs text-blue-600 underline mt-0.5 hover:text-blue-800"><Earth size={14} /></button>
                <div className="flex items-start gap-1">
                  <span className="text-sm font-bold  shrink-0">Address:</span>
                  <span className="text-sm text-gray-700">{carData.supplier.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Fuel size={14} className="text-blue-600" />
                <div>
                  <span className="text-sm font-semibold text-blue-600">Fuel Policy: </span>
                  <span className="text-xs font-bold text-gray-700">{carData.fuelPolicy}</span>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <Handshake  size={14} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-semibold">Pick-up: </span>
                  <span className="text-xs font-bold text-gray-800">Meet and Greet</span>
                </div>
              </div>
            </div>

            <div className="w-[200px] shrink-0 p-4 flex flex-col items-start justify-center bg-white">
              <span className="text-xs text-gray-500 mb-1">for {carData.price.totalDays} days</span>
              <div className="text-left mb-1">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(carData.price.amount, carData.price.currency as Currency)}
                </span>
              </div>
              <p className="text-xs text-blue-600 mb-2">
                Pay Now {formatPrice(carData.price.amount * 0.125, carData.price.currency as Currency)}
              </p>
              {!hideBookingControls && (
                <Link 
                  href={`/booking?vehicleId=${vehicle.id}`}
                  className="w-full py-2.5 bg-[#f9d602] text-gray-900 rounded font-bold text-sm uppercase tracking-wide hover:bg-[#e5c502] active:scale-[0.98] transition-all text-center"
                >
                  Book Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODAL: Rental Terms
          ═══════════════════════════════════════════════════════════ */}
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
              <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2 pr-8">
                <div className="bg-[#f9d602]/20 p-2 rounded-xl shrink-0"><Info className="text-[#f9d602]" size={20} /></div>
                Rental Terms
              </h4>
              <div className="prose prose-sm overflow-y-auto no-scrollbar flex-1">
                <div className="space-y-3 md:space-y-4 text-gray-600 font-medium leading-relaxed text-xs md:text-sm">
                  <p className="whitespace-pre-line">{carData.supplier.rentalTerms}</p>
                </div>
              </div>
              <button onClick={() => setShowTerms(false)} className="w-full mt-4 md:mt-6 py-2.5 md:py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors">
                I Understand
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
