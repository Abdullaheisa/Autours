'use client';

import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  Check, Info, X, ChevronDown, ChevronUp,
  Globe, Fuel, Handshake, Plane, Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Vehicle } from '@/types';
import { getVehicleImageUrl, getLogoUrl } from '@/utils/getImageUrl';
import { assets } from '@/config/assets';
import { formatPrice } from '@/utils/currency';
import { getVehicleDisplayPrice } from '@/utils/vehiclePrice';
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
  const [imgError, setImgError] = useState(false);

  // The backend attaches rental_terms as an array [{title, description}] directly on each vehicle from filter/vehicles response (VehicleController line 275)
  const rawTerms: any[] = Array.isArray((vehicle as any).rental_terms) && (vehicle as any).rental_terms.length > 0
    ? (vehicle as any).rental_terms
    : Array.isArray((vehicle as any).supplier?.rental_terms)
      ? (vehicle as any).supplier.rental_terms
      : [];

  const { code: currencyCode, allRates } = useSelector((state: RootState) => state.currency);
  const { filteredSuppliers, fetchedCurrency } = useSelector((state: RootState) => state.search);

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

    const imgSource = vehicle.photo || vehicle.image || targets.map(t => t.photo || t.image || t.car_photo || t.main_image || t.thumbnail || t.car_image).find(Boolean);
    const supplierSource = targets.map(t => t.supplier || t.company || t.rental_company).find(Boolean);
    
    let logoStr = supplierSource?.logo || vehicle.supplier?.logo;
    if (!logoStr && supplierSource) {
      const sId = typeof supplierSource === 'object' ? supplierSource.id : supplierSource;
      const foundSupplier = filteredSuppliers?.find(s => String(s.id) === String(sId));
      if (foundSupplier) {
        logoStr = foundSupplier.logo;
      }
    }

    const locTypeFromArr = Array.isArray(v.locationType) && v.locationType.length > 0 
      ? v.locationType[0].name || v.locationType[0].type
      : null;

    const pickupType = (
      locTypeFromArr ??
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

    const totalPrice = getVehicleDisplayPrice(
      vehicle,
      currencyCode as Currency,
      allRates,
      daysNumber || 1,
      fetchedCurrency
    );

    return {
      name: trimmedName,
      type: getSpec('type') !== 'N/A' ? getSpec('type') : (vehicle.category || 'Economy'),
      image: getVehicleImageUrl(imgSource),
      transmission: getSpec('transmission'),
      fuelType: getSpec('fuel'),
      seats: getSpec('seats'),
      doors: getSpec('doors'),
      suitcases: getSpec('bags') !== 'N/A' ? getSpec('bags') : getSpec('luggage'),
      ac: getSpec('air conditioning') !== 'No' ? 'Air Conditioning' : 'No A/C',
      supplier: {
        name: (supplierSource?.company || supplierSource?.name || vehicle.supplier?.company || 'Supplier').toString().trim(),
        logo: getLogoUrl(logoStr),
        rating: supplierSource?.rating || supplierSource?.rate || 0,
        reviewsCount: supplierSource?.reviewsCount || supplierSource?.reviews_count || 0,
        rentalTerms: Array.isArray(v.rental_terms)
          ? v.rental_terms
          : Array.isArray(v.supplier?.rental_terms)
            ? v.supplier.rental_terms
            : Array.isArray(supplierSource?.rentalTerms)
              ? supplierSource.rentalTerms
              : [],
        instantConfirmation: (vehicle.instant_confirmation !== undefined && vehicle.instant_confirmation !== null) 
          ? (vehicle.instant_confirmation == 1 || vehicle.instant_confirmation == true) 
          : (supplierSource?.instant_confirmation !== undefined && supplierSource?.instant_confirmation !== null)
            ? (supplierSource.instant_confirmation == 1 || supplierSource.instant_confirmation == true)
            : (supplierSource?.instantConfirmation ?? true),
        address: (supplierSource?.address || 'Airport Terminal / City Center').toString().trim(),
        lat: supplierSource?.lat || 25.2532,
        lng: supplierSource?.lng || 55.3657,
      },
      price: {
        amount: totalPrice,
        currency: currencyCode,
        totalDays: daysNumber || 1,
      },
      inclusions,
      fuelPolicy: typeof vehicle.fuelPolicy === 'string' ? vehicle.fuelPolicy : (vehicle.fuel_policy?.name || (vehicle as any).fuelPolicy?.name || 'Full to Full'),
      locationType: pickupType ? (pickupType.charAt(0).toUpperCase() + pickupType.slice(1).replace(/_/g, ' ')) : 'Airport',
      pickupType: pickupType,
      freeCancellation: inclusions.some(i => i.toLowerCase().includes('cancel')),
      freeCancellationHours: 24,
    };
  }, [vehicle, daysNumber, currencyCode, allRates, filteredSuppliers, fetchedCurrency]);

  const openMap = () => {
    window.open(`https://www.google.com/maps?q=$${carData.supplier.lat},${carData.supplier.lng}`, '_blank');
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
      <div className="flex flex-col lg:hidden">
        <div className="p-4 pb-2 flex justify-center">
          <Image
            src={imgError ? 'https://via.placeholder.com/300x180?text=No+Image' : (carData.image || 'https://via.placeholder.com/300x180?text=No+Image')}
            alt={carData.name}
            width={260}
            height={150}
            priority 
            fetchPriority="high"
            className="w-full max-w-[240px] md:max-w-[260px] h-auto max-h-[140px] md:max-h-[150px] object-contain"
            onError={() => setImgError(true)} 
          />
        </div>

        <div className="px-4 pb-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base md:text-lg font-black text-gray-900 leading-tight">
              {carData.name}
            </h3>
            <span className="text-xs md:text-sm font-normal text-gray-600">or Similar</span>
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
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl z-50"
                  >
                    <div className="absolute -top-1 left-1/2 translate-x-[-50%] w-2 h-2 bg-gray-900 rotate-45" />
                    The supplier will provide a car with same class and specifications, though the make may vary.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-xs md:text-sm font-black text-gray-600 mt-0.5 md:mt-1">{carData.type}</p>
        </div>

        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: assets.icons.seats, val: carData.seats, label: 'Seats' },
              { icon: assets.icons.doors, val: carData.doors, label: 'Doors' },
              { icon: assets.icons.bags, val: carData.suitcases, label: 'Bags' },
              { icon: assets.icons.ac, val: carData.ac, label: '' },
              { icon: assets.icons.fuel, val: carData.fuelType, label: '' },
              { icon: assets.icons.transmission, val: carData.transmission, label: '' }
            ].map((feat, i) => (
              <div key={i} className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg py-2 md:py-2.5">
                <img src={feat.icon} alt="" className="w-5 h-5 object-contain shrink-0" aria-hidden="true" />
                <span className="text-[10px] md:text-[11px] font-black text-gray-700">
                  {feat.val} {feat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-4 mb-2 md:mb-2.5">
          <div className="w-full bg-gray-100 rounded-xl px-3 py-2.5 flex items-center gap-x-6 gap-y-3 flex-wrap">
            <div className="bg-white p-1 rounded-lg flex items-center justify-center w-20 h-10 shrink-0 shadow-sm">
              {carData.supplier.logo ? (
                <Image
                  src={carData.supplier.logo}
                  alt={`${carData.supplier.name} Logo`}
                  width={80}
                  height={40}
                  className="h-10 w-auto max-w-[80px] object-contain"
                  unoptimized 
                />
              ) : (
                <span className="text-[10px] font-bold text-gray-600">N/A</span>
              )}
            </div>

            <div className="min-w-0">
              <span className="text-xs md:text-sm font-black text-gray-800 block truncate">{carData.supplier.name}</span>
              <button onClick={() => setShowTerms(true)} className="text-[10px] md:text-xs font-black text-blue-600 underline hover:text-blue-800 leading-none">
                Rental Terms
              </button>
            </div>

            <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
              <span className="bg-[var(--primary)] text-gray-900 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs md:text-sm font-black">{carData.supplier.rating}/10</span>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] md:text-xs font-black text-gray-700">Excellent</span>
                <span className="text-[9px] md:text-[10px] font-black text-gray-600">({carData.supplier.reviewsCount}+)</span>
              </div>
            </div>

            {carData.supplier.instantConfirmation && (
              <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
                <img src={assets.icons.instant} alt="" className="w-4 h-4 object-contain shrink-0" aria-hidden="true" />
                <span className="text-[10px] md:text-xs font-black text-gray-700">Instant confirmation</span>
              </div>
            )}
          </div>
        </div>

        {carData.freeCancellation && (
          <div className="mx-4 mb-2 flex items-center gap-1.5 text-green-700">
            <Check size={14} className="stroke-[2.5] shrink-0" />
            <span className="text-xs md:text-sm font-black">Free Cancellation ({carData.freeCancellationHours}h)</span>
          </div>
        )}

        <div className="px-4 pb-2">
          <button
            onClick={() => setShowMobileDetails(!showMobileDetails)}
            className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-black text-xs uppercase hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {showMobileDetails ? <><ChevronUp size={16} /> Less Details</> : <><ChevronDown size={16} /> More Details</>}
          </button>
        </div>

        <AnimatePresence>
          {showMobileDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-2.5">
                <div className="bg-green-50/50 rounded-xl px-3 py-3">
                  <h4 className="text-sm font-black text-green-700 mb-2">What is Included</h4>
                  <div className="mt-2 h-0.5 bg-yellow-400 w-full" />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-3">
                    {displayedInclusions.map((inc, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check size={12} className="text-green-600 shrink-0" />
                        <span className="text-xs font-black text-gray-700">{inc}</span>
                      </div>
                    ))}
                  </div>
                  {carData.inclusions.length > 4 && (
                    <button onClick={() => setShowAllInclusions(!showAllInclusions)} className="text-xs text-end w-full py-3 pr-5 font-black text-gray-700 underline hover:text-gray-900">
                      {showAllInclusions ? 'Show Less' : 'More +'}
                    </button>
                  )}
                </div>
              </div>

              <div className="px-4 pb-4 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <button onClick={openMap} className="shrink-0 pt-0.5">
                    <Globe size={16} className="text-blue-600" />
                  </button>
                  <div>
                    <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Address: </span>
                    <span className="text-sm font-black text-gray-800">{carData.supplier.address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Fuel size={17} className="text-blue-600 shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Fuel Policy: </span>
                    <span className="text-sm font-black text-gray-800">{carData.fuelPolicy}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <PickupIcon pickupType={carData.pickupType} />
                  <div>
                    <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Pick-up: </span>
                    <span className="text-sm font-black text-gray-800"><PickupLabel pickupType={carData.pickupType} /></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 pt-2">
          <div className="flex items-end justify-between gap-3 md:gap-4">
            <div>
              <span className="text-xs md:text-sm font-bold text-gray-600 block mb-0.5 md:mb-1">for {carData.price.totalDays} days</span>
              <div className="flex items-baseline">
                <span className="text-2xl md:text-3xl font-black text-gray-900">
                  {formatPrice(carData.price.amount, carData.price.currency as Currency)}
                </span>
              </div>
            </div>
            {!hideBookingControls && (
              <Link
                href={`/booking?vehicleId=${vehicle.id}`}
                className="px-6 md:px-8 py-3 md:py-3.5 bg-[var(--primary)] text-gray-900 rounded-xl font-black text-sm uppercase hover:bg-[var(--primary-600)] active:scale-95 transition-all shrink-0 text-center shadow-md"
              >
                Book Now
                <span className="sr-only"> for {carData.name}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="flex items-start">
          <div className="w-[300px] shrink-0 p-5 flex items-center justify-center">
            <Image
              src={imgError ? 'https://via.placeholder.com/400x250?text=No+Image' : (carData.image || 'https://via.placeholder.com/400x250?text=No+Image')}
              alt={carData.name}
              width={300}
              height={200}
              priority 
              fetchPriority="high"
              className="w-full h-auto max-h-[200px] object-contain"
              onError={() => setImgError(true)}
            />
          </div>

          <div className="flex-1 p-5 pl-10 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-black text-gray-900">{carData.name}</h3>
                <span className="text-xs font-normal text-gray-600">or Similar</span>
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
              <p className="text-xs font-black text-gray-600 mb-4">{carData.type}</p>

              <div className="grid grid-cols-2 w-[80%] justify-between gap-x-0 gap-y-2">
                {[
                  { icon: assets.icons.seats, val: carData.seats, label: 'Seats' },
                  { icon: assets.icons.doors, val: carData.doors, label: 'Doors' },
                  { icon: assets.icons.bags, val: carData.suitcases, label: 'Suitcase' },
                  { icon: assets.icons.ac, val: carData.ac, label: '' },
                  { icon: assets.icons.fuel, val: carData.fuelType, label: '' },
                  { icon: assets.icons.transmission, val: carData.transmission, label: '' }
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <img src={feat.icon} alt="" className="w-5 h-5 object-contain shrink-0" aria-hidden="true" />
                    <span className="text-xs font-black text-gray-700">{feat.val} {feat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-5 mb-2 flex">
          <div className="w-[74%] bg-gray-100 rounded-xl px-4 py-2.5 flex items-center gap-x-8 gap-y-4 flex-wrap">
            <div className="bg-white p-1.5 rounded-lg flex items-center justify-center w-20 h-10 shrink-0 shadow-sm">
              {carData.supplier.logo ? (
                <Image
                  src={carData.supplier.logo}
                  alt={`${carData.supplier.name} Logo`}
                  width={65}
                  height={28}
                  className="h-7 w-auto max-w-[65px] object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-[10px] font-bold text-gray-600">N/A</span>
              )}
            </div>

            <div className="min-w-0">
              <span className="text-sm font-black text-gray-800 block truncate">{carData.supplier.name}</span>
              <button onClick={() => setShowTerms(true)} className="text-xs font-black text-blue-600 underline hover:text-blue-800 leading-none">Rental Terms</button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="bg-[var(--primary)] text-gray-900 px-2 py-1 rounded-md text-sm font-black">{carData.supplier.rating}/10</span>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-black text-gray-700">Excellent</span>
                <span className="text-[10px] font-black text-gray-600">({carData.supplier.reviewsCount}+ reviews)</span>
              </div>
            </div>

            {carData.supplier.instantConfirmation && (
              <div className="flex items-center gap-1.5 shrink-0">
                <img src={assets.icons.instant} alt="" className="w-5 h-5 object-contain shrink-0" aria-hidden="true" />
                <span className="text-xs font-black text-gray-700 whitespace-nowrap">Instant Confirmation</span>
              </div>
            )}
          </div>
        </div>
        {carData.freeCancellation && (
          <div className="mx-5 mb-2 flex items-center gap-2 text-green-700">
            <Check size={16} className="stroke-[2.5] shrink-0" />
            <span className="text-sm font-bold">Free Cancellation ({carData.freeCancellationHours}h)</span>
          </div>
        )}

        <div className="flex">
          <div className='flex bg-green-100/35 rounded-xl mx-4 mb-4 w-[75%]'>
            <div className="w-[50%] p-5 pt-3">
              <div className="mb-2">
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

            <div className="w-[50%] p-5 pt-14 space-y-3">
              <div className="flex items-start gap-2">
                <button onClick={openMap} className="shrink-0 pt-0.5"><Globe size={14} className="text-blue-600" /></button>
                <div className="flex items-start gap-1.5">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider shrink-0">Address</span>
                  <span className="text-xs font-black text-gray-800">{carData.supplier.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Fuel size={16} className="text-blue-600 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Fuel Policy</span>
                  <span className="text-xs font-black text-gray-800">{carData.fuelPolicy}</span>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <PickupIcon pickupType={carData.pickupType} />
                <div>
                  <span className="text-xs font-black">Pick-up: </span>
                  <span className="text-[11px] font-black text-gray-800"><PickupLabel pickupType={carData.pickupType} /></span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[260px] shrink-0 p-5 pt-6 flex flex-col items-start justify-end">
            <span className="text-sm font-bold pl-4 text-gray-600 block mb-2">for {carData.price.totalDays} days</span>
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
                <span className="sr-only"> for {carData.name}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

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
              <button onClick={() => setShowTerms(false)} aria-label="Close rental terms" className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} />
              </button>
              <h4 className="text-lg md:text-xl font-black text-gray-900 mb-3 md:mb-4 flex items-center gap-2 pr-8">
                <div className="bg-[var(--primary)]/20 p-2 rounded-xl shrink-0"><Info className="text-[var(--primary)]" size={20} /></div>
                Rental Terms
              </h4>
              <div className="prose prose-sm overflow-y-auto no-scrollbar flex-1">
                <div className="space-y-4 text-gray-600 font-black leading-relaxed text-xs md:text-sm">
                  {Array.isArray(carData.supplier.rentalTerms) && carData.supplier.rentalTerms.length > 0 ? (
                    carData.supplier.rentalTerms.map((term: any, idx: number) => (
                      <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <h5 className="font-bold text-gray-900 text-sm mb-1" dangerouslySetInnerHTML={{ __html: term.title || term.name || term.term_name || '' }} />
                        <div className="text-xs text-gray-700 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: term.description || term.term_description || '' }} />
                      </div>
                    ))
                  ) : rawTerms.length > 0 ? (
                    rawTerms.map((term: any, idx: number) => (
                      <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <h5 className="font-bold text-gray-900 text-sm mb-1" dangerouslySetInnerHTML={{ __html: term.title || '' }} />
                        <div className="text-xs text-gray-700 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: term.description || '' }} />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No rental terms assigned for this company.</p>
                  )}
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