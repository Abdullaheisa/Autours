'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  Check, Info, X, ChevronDown, ChevronUp,
  Globe, Fuel, Handshake, Plane, Droplets, Zap
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
  preselectedBookId?: string | null;
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

export default function CarCard({ vehicle, daysNumber, hideBookingControls = false, preselectedBookId = null }: CarCardProps) {
  const [showTerms, setShowTerms] = useState(false);
  const [showAllInclusions, setShowAllInclusions] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [showInstantTooltip, setShowInstantTooltip] = useState(false);
  const [imgError, setImgError] = useState(false);

  const availableBranches = (vehicle as any).available_branches || [];
  const branchVehicleIds = (vehicle as any).branch_vehicle_ids || {};

  const computedBranchId = useMemo(() => {
    if (preselectedBookId && Object.keys(branchVehicleIds).length > 0) {
      const match = Object.entries(branchVehicleIds).find(
        ([_, vId]) => String(vId) === String(preselectedBookId)
      );
      if (match) return Number(match[0]);
    }
    return availableBranches.length > 0 ? availableBranches[0].id : null;
  }, [preselectedBookId, branchVehicleIds, availableBranches]);

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(computedBranchId);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = () => {
      setIsMobileDropdownOpen(false);
      setIsDesktopDropdownOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Sync state if computed branch ID changes (e.g. if branchVehicleIds was empty on first render)
  useEffect(() => {
    if (computedBranchId) {
      setSelectedBranchId(computedBranchId);
    }
  }, [computedBranchId]);

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
        rating: supplierSource?.rating || supplierSource?.rate || 9,
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
      pickupType: pickupType,
      freeCancellation: inclusions.some(i => i.toLowerCase().includes('cancel')),
      freeCancellationHours: 24,
      promos: vehicle.promos || (vehicle.promo ? [vehicle.promo] : []),
    };
  }, [vehicle, daysNumber, currencyCode, allRates, filteredSuppliers, fetchedCurrency]);

  const openMap = () => {
    window.open(`https://www.google.com/maps?q=$${carData.supplier.lat},${carData.supplier.lng}`, '_blank');
  };

  const displayedInclusions = showAllInclusions
    ? carData.inclusions
    : carData.inclusions.slice(0, 6);

  const promosList = carData.promos || [];

  let mainHighlight: string | null = null;
  let hiddenPromos: string[] = [];

  if (promosList.length > 0) {
    const freeCancelPromo = promosList.find((p: string) => {
      const text = p.toLowerCase();
      return (text.includes('free') && text.includes('cancel')) || text.includes('مجاني') || text.includes('كنسليشن');
    });

    if (freeCancelPromo) {
      mainHighlight = freeCancelPromo;
      hiddenPromos = promosList.filter((p: string) => p !== freeCancelPromo);
    } else {
      mainHighlight = promosList[0];
      hiddenPromos = promosList.slice(1);
    }
  }

  hiddenPromos = Array.from(new Set(hiddenPromos));

  const renderHighlightWithLine = (highlightText: string, sizeClass: string, checkIcon: React.ReactNode) => {
    const firstSpaceIdx = highlightText.indexOf(' ');
    const firstWord = firstSpaceIdx !== -1 ? highlightText.substring(0, firstSpaceIdx) : highlightText;
    const restOfText = firstSpaceIdx !== -1 ? highlightText.substring(firstSpaceIdx) : '';

    return (
      <span className={`${sizeClass} font-black leading-tight break-words inline-flex items-center gap-1`}>
        <span className="relative inline-flex items-center gap-1 pb-1">
          {checkIcon}
          <span>{firstWord}</span>
          {/* <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[var(--primary)] rounded-full" /> */}
        </span>
        <span>{restOfText}</span>
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl border-2 shadow-md border-gray-100 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-300 w-full overflow-visible relative text-sm"
    >
      <div className="flex flex-col md:hidden">
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
            <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight">
              {carData.name}
            </h3>
            <span className="text-xs md:text-sm font-medium text-gray-600">or Similar</span>
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
                    className="absolute top-full right-[-120px] mt-2 w-56 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl z-50"
                  >
                    <div className="absolute -top-1 left-[93%] translate-x-[-50%] w-2 h-2 bg-gray-900 rotate-45" />
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
                <img src={feat.icon} alt="" className={` object-contain shrink-0 text-center  ${(i + 1) % 2 !== 0 ? 'w-7 h-7' : 'w-6 h-6'}`} aria-hidden="true" />
                <span className="text-[11px] md:text-[9px] font-semibold text-center text-gray-700">
                  {feat.val} {feat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-4 mb-2 md:mb-2.5">
          <div className="w-full bg-gray-100 rounded-xl px-3 py-2.5 flex items-center justify-between gap-x-5 md:gap-x-6 gap-y-3 flex-wrap">
            <div className="bg-white p-1 rounded-lg flex items-center justify-center w-20 h-10 shrink-0 shadow-sm overflow-hidden">
  {carData.supplier.logo ? (
    <Image
      src={carData.supplier.logo}
      alt={`${carData.supplier.name} Logo`}
      width={333}
      height={126}
      className="w-full h-full object-cover object-center"
      unoptimized
    />
  ) : (
    <span className="text-[10px] font-bold text-gray-600">N/A</span>
  )}
</div>

            <div className="min-w-0">
              <span className="text-xs md:text-sm font-black text-gray-800 block truncate">{carData.supplier.name}</span>
              <button onClick={() => setShowTerms(true)} className="text-xs font-black text-blue-600 underline hover:text-blue-800 leading-none">
                Rental Terms
              </button>
            </div>

            <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
              <span className="bg-[var(--primary)] text-gray-900 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs md:text-sm font-black">{carData.supplier.rating}/10</span>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-black text-gray-700">Excellent</span>
                <span className="text-[10px] font-black text-gray-600">({carData.supplier.reviewsCount}+)</span>
              </div>
            </div>

            {carData.supplier.instantConfirmation && (
              <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
                <img src={assets.icons.instant} alt="" className="w-4 h-4 object-contain shrink-0" aria-hidden="true" />
                <span className="text-xs font-black text-gray-700">Instant confirmation</span>
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
                        className="absolute top-full right-[-30px] mt-2 w-56 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl z-50"
                      >
                        <div className="absolute -top-1 right-[33px] w-2 h-2 bg-gray-900 rotate-45" />
                        Receive instant booking confirmation!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>

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
                      <div key={i} className="flex items-start gap-1.5">
                        <Check size={14} className="text-green-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-gray-700 break-words">{inc}</span>
                      </div>
                    ))}
                  </div>
                  {carData.inclusions.length > 6 && (
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
                    <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Address: {availableBranches.length} branches </span>
                    <span className="text-sm font-black text-gray-800">
                      {availableBranches.find((b: any) => String(b.id) === String(selectedBranchId))?.adresse ||
                        availableBranches.find((b: any) => String(b.id) === String(selectedBranchId))?.name ||
                        carData.supplier.address}
                    </span>
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

        <div className="p-4 pt-6">
          {mainHighlight && (
            <div className="flex justify-start mb-8">
              <div className="inline-flex items-center gap-1.5 text-green-700">
                {renderHighlightWithLine(mainHighlight, "text-xs md:text-sm", <Check size={14} className="stroke-[3] shrink-0" />)}
                {hiddenPromos.length > 0 && (
                  <div className="relative group cursor-pointer flex items-center justify-center bg-green-50 text-green-700 rounded-full px-2 py-0.5 border border-green-200 shadow-sm shrink-0">
                    <span className="text-[10px] font-black">+{hiddenPromos.length}</span>
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45" />
                      <div className="flex flex-col gap-1.5">
                        {hiddenPromos.map((p: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-green-100 mt-0.5 shrink-0"><Check size={10} className="stroke-[3]" /></span>
                            <span className="leading-snug">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-end justify-between gap-3 md:gap-4">
            <div>
              <span className="text-[10px] md:text-[11px] font-bold text-gray-600 block mb-0.5">for {carData.price.totalDays} days</span>
              <div className="flex items-baseline">
                <span className="text-lg md:text-xl font-black text-gray-900">
                  {formatPrice(carData.price.amount, carData.price.currency as Currency)}
                </span>
              </div>
            </div>

            {!hideBookingControls && (
              <div className="flex flex-col items-end gap-2 shrink-0">
                {availableBranches.length > 1 && (
                  <div className="relative w-full min-w-[160px] max-w-[220px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileDropdownOpen(!isMobileDropdownOpen);
                        setIsDesktopDropdownOpen(false);
                      }}
                      className="w-full text-xs py-2 px-8 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors font-bold text-gray-700 outline-none cursor-pointer text-center relative"
                    >
                      <span className="block truncate">
                        <span className="font-bold text-gray-400 mr-1 rtl:ml-1 text-[10px] uppercase">Pickup: </span>
                        <span className="text-gray-700 font-extrabold">
                          {availableBranches.find((b: any) => b.id === selectedBranchId)?.name || availableBranches.find((b: any) => b.id === selectedBranchId)?.location || 'Select Branch'}
                        </span>
                      </span>
                      <div className="absolute inset-y-0 right-2.5 rtl:left-2.5 rtl:right-auto flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isMobileDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isMobileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute z-50 top-full mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden py-1 max-h-48 overflow-y-auto no-scrollbar"
                        >
                          {availableBranches.map((b: any) => {
                            const isSelected = b.id === selectedBranchId;
                            return (
                              <button
                                key={b.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBranchId(b.id);
                                  setIsMobileDropdownOpen(false);
                                }}
                                className={`w-full text-left text-xs py-2.5 px-4 transition-colors font-bold ${
                                  isSelected
                                    ? 'bg-[var(--primary)] text-gray-900'
                                    : 'text-gray-700 hover:bg-[var(--primary)]/20 hover:text-gray-900'
                                }`}
                              >
                                <span className="font-extrabold">{b.name || b.location}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                <Link
                  href={`/booking?vehicleId=${vehicle.id}&bookId=${selectedBranchId ? (branchVehicleIds[selectedBranchId] || vehicle.id) : vehicle.id}`}
                  className="px-4 md:px-6 py-2 bg-[var(--primary)] text-gray-900 rounded-xl font-black text-[11px] md:text-xs uppercase hover:bg-[var(--primary-600)] active:scale-95 transition-all shrink-0 text-center shadow-md"
                >
                  Book Now
                  <span className="sr-only"> for {carData.name}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="flex items-center">
          <div className="w-[250px] lg:w-[270px] 2xl:w-[300px] shrink-0 p-3 lg:p-4 flex items-center justify-center self-stretch">
            <Image
              src={imgError ? 'https://via.placeholder.com/400x250?text=No+Image' : (carData.image || 'https://via.placeholder.com/400x250?text=No+Image')}
              alt={carData.name}
              width={300}
              height={200}
              priority
              fetchPriority="high"
              className="w-full h-auto max-h-[200px] object-contain my-auto"
              onError={() => setImgError(true)}
            />
          </div>

          <div className="flex-1 p-4 lg:px-4 xl:px-5 lg:py-3 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{carData.name}</h3>
                <span className="text-xs font-medium text-gray-600">or Similar</span>
                <div
                  className="relative"
                  onMouseEnter={() => setShowInfoTooltip(true)}
                  onMouseLeave={() => setShowInfoTooltip(false)}
                >
                  <div className="relative w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-sm"
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
                        className="absolute top-full right-0 mt-2 w-56 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl z-50"
                      >
                        <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 rotate-45" />
                        The supplier will provide a car with same class and specifications, though the make may vary.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <p className="text-xs font-black text-gray-600 mb-4">{carData.type}</p>

              <div className="grid grid-cols-2 w-full lg:w-[85%] xl:w-[70%] 2xl:w-[55%] gap-x-2 lg:gap-x-4 gap-y-2">
                {[
                  { icon: assets.icons.seats, val: carData.seats, label: 'Seats' },
                  { icon: assets.icons.doors, val: carData.doors, label: 'Doors' },
                  { icon: assets.icons.bags, val: carData.suitcases, label: 'Suitcase' },
                  { icon: assets.icons.ac, val: carData.ac, label: '' },
                  { icon: assets.icons.fuel, val: carData.fuelType, label: '' },
                  { icon: assets.icons.transmission, val: carData.transmission, label: '' }
                ].map((feat, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 w-full min-w-0"
                  >
                    <img src={feat.icon} alt="" className={`object-contain shrink-0 ${(i + 1) % 2 !== 0 ? 'w-8 h-8' : 'w-6 h-6'}`} aria-hidden="true" />
                    <span className="text-xs xl:text-sm font-semibold lg:font-bold text-gray-700 truncate">{feat.val} {feat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row mb-2 relative gap-y-3 lg:gap-y-0">
          <div className="flex bg-gray-100 rounded-xl mx-5 lg:mx-0 lg:ml-4 w-[calc(100%-2.5rem)] lg:w-auto lg:flex-1 lg:min-w-0 px-4 py-2.5 flex-wrap items-center justify-start gap-x-4 xl:gap-x-7 gap-y-3 min-w-0">
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

          <div className="hidden lg:flex lg:w-[210px] xl:w-[240px] 2xl:w-[260px] lg:shrink-0 min-w-0 items-center justify-start px-4 lg:px-5">
            {mainHighlight && (
              <div className="inline-flex items-center gap-1.5 text-green-700">
                {renderHighlightWithLine(mainHighlight, "text-sm lg:text-base", <Check size={16} className="stroke-[3] shrink-0" />)}
                {hiddenPromos.length > 0 && (
                  <div className="relative group cursor-pointer flex items-center justify-center bg-green-50 text-green-700 rounded-full px-2 py-0.5 border border-green-200 shadow-sm hover:bg-green-100 transition-colors shrink-0">
                    <span className="text-[11px] font-black">+{hiddenPromos.length}</span>
                    <div className="absolute top-full right-0 mt-2 w-56 bg-gray-900 text-white text-xs font-medium px-3 py-2.5 rounded-xl shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto text-left">
                      <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 rotate-45" />
                      <div className="flex flex-col gap-2">
                        {hiddenPromos.map((p: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-green-100 mt-0.5 shrink-0"><Check size={12} className="stroke-[3]" /></span>
                            <span className="leading-snug">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className='flex bg-green-100/35 rounded-xl mx-5 lg:mx-0 lg:ml-4 mb-4 w-[calc(100%-2.5rem)] lg:w-auto lg:flex-1 lg:min-w-0'>
            <div className="w-[55%] xl:w-[60%] p-2 pt-3 min-w-0">
              <div className="mb-2">
                <h4 className="text-xs md:text-sm font-black text-green-700">What is Included!</h4>
                <div className="mt-2 h-0.5 bg-yellow-400 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-x-1 gap-y-1.5 mt-3">
                {displayedInclusions.map((inc, i) => (
                  <div key={i} className="flex items-start gap-1.5 min-w-0">
                    <Check size={13} className="text-green-600 shrink-0 mt-0.5 md:mt-1" />
                    <span className="text-xs md:text-sm font-bold text-gray-700 break-words" title={inc}>{inc}</span>
                  </div>
                ))}
              </div>
              {carData.inclusions.length > 6 && (
                <button onClick={() => setShowAllInclusions(!showAllInclusions)} className="mt-2 text-xs font-black text-gray-800 underline hover:text-gray-600">
                  {showAllInclusions ? 'Show Less' : 'Show More +'}
                </button>
              )}
            </div>

            <div className="w-[45%] xl:w-[40%] p-2 pt-10 xl:pt-14 space-y-2.5 min-w-0">
              <div className="flex items-start gap-1.5">
                <button onClick={openMap} className="shrink-0 pt-0.5"><Globe size={16} className="text-blue-600" /></button>
                <div className="flex items-baseline gap-1 min-w-0">
                  <span className="text-[11px] md:text-xs font-black text-gray-600 uppercase tracking-wider shrink-0">Address: </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs md:text-sm font-black text-gray-800 break-words line-clamp-2">
                      {availableBranches.find((b: any) => String(b.id) === String(selectedBranchId))?.adresse ||
                      availableBranches.find((b: any) => String(b.id) === String(selectedBranchId))?.name ||
                      carData.supplier.address}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <Fuel size={17} className="text-blue-600 shrink-0" />
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-[11px] md:text-xs font-black text-gray-600 uppercase tracking-wider shrink-0">Fuel Policy: </span>
                  <span className="text-xs md:text-sm font-black text-gray-800 truncate">{carData.fuelPolicy}</span>
                </div>
              </div>
              <div className="flex items-start gap-1.5 min-w-0">
                <PickupIcon pickupType={carData.pickupType} />
                <div className="min-w-0">
                  <span className="text-xs md:text-sm font-black text-gray-600 shrink-0">Pick-up: </span>
                  <span className="text-xs md:text-sm font-black text-gray-800 truncate"><PickupLabel pickupType={carData.pickupType} /></span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[210px] xl:w-[240px] 2xl:w-[260px] lg:shrink-0 p-4 lg:p-5 pt-4 lg:pt-6 flex flex-col lg:items-start items-start justify-center lg:justify-between gap-5 lg:gap-0 self-stretch">
            {mainHighlight && (
              <div className="inline-flex lg:hidden items-center gap-1.5 text-green-700">
                {renderHighlightWithLine(mainHighlight, "text-sm lg:text-base", <Check size={16} className="stroke-[3] shrink-0" />)}
                {hiddenPromos.length > 0 && (
                  <div className="relative group cursor-pointer flex items-center justify-center bg-green-50 text-green-700 rounded-full px-2 py-0.5 border border-green-200 shadow-sm hover:bg-green-100 transition-colors shrink-0">
                    <span className="text-[11px] font-black">+{hiddenPromos.length}</span>
                    <div className="absolute bottom-full right-0 mb-2 w-56 bg-gray-900 text-white text-xs font-medium px-3 py-2.5 rounded-xl shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto text-left">
                      <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 rotate-45" />
                      <div className="flex flex-col gap-2">
                        {hiddenPromos.map((p: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-green-100 mt-0.5 shrink-0"><Check size={12} className="stroke-[3]" /></span>
                            <span className="leading-snug">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-row lg:flex-col items-end lg:items-start justify-between w-full lg:gap-3 mt-auto gap-3">
              <div className="flex flex-col lg:items-start items-start">
                <span className="text-[10px] lg:text-[11px] xl:text-xs font-bold text-gray-600 block mb-1">for {carData.price.totalDays} days</span>
                <div className="text-left lg:text-left">
                  <span className="text-lg lg:text-xl xl:text-2xl font-black text-gray-900">
                    {formatPrice(carData.price.amount, carData.price.currency as Currency)}
                  </span>
                </div>
              </div>

              {!hideBookingControls && (
                <div className="flex flex-col gap-2 items-stretch w-auto lg:w-full">
                  {availableBranches.length > 1 && (
                    <div className="relative w-full min-w-[160px] max-w-[200px] lg:max-w-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDesktopDropdownOpen(!isDesktopDropdownOpen);
                          setIsMobileDropdownOpen(false);
                        }}
                        className="w-full text-xs py-2 px-8 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors font-bold text-gray-700 outline-none cursor-pointer text-center relative"
                      >
                        <span className="block truncate">
                          <span className="font-bold text-gray-400 mr-1 rtl:ml-1 text-[10px] uppercase">Pickup: </span>
                          <span className="text-gray-700 font-extrabold">
                            {availableBranches.find((b: any) => b.id === selectedBranchId)?.name || availableBranches.find((b: any) => b.id === selectedBranchId)?.location || 'Select Branch'}
                          </span>
                        </span>
                        <div className="absolute inset-y-0 right-2.5 rtl:left-2.5 rtl:right-auto flex items-center pointer-events-none text-gray-500">
                          <ChevronDown size={14} className={`transition-transform duration-200 ${isDesktopDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isDesktopDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute z-50 top-full mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden py-1 max-h-48 overflow-y-auto no-scrollbar"
                          >
                            {availableBranches.map((b: any) => {
                              const isSelected = b.id === selectedBranchId;
                              return (
                                <button
                                  key={b.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBranchId(b.id);
                                    setIsDesktopDropdownOpen(false);
                                  }}
                                  className={`w-full text-left text-xs py-2.5 px-4 transition-colors font-bold ${
                                    isSelected
                                      ? 'bg-[var(--primary)] text-gray-900'
                                      : 'text-gray-700 hover:bg-[var(--primary)]/20 hover:text-gray-900'
                                  }`}
                                >
                                  <span className="font-extrabold">{b.name || b.location}</span>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  <Link
                    href={`/booking?vehicleId=${vehicle.id}&bookId=${selectedBranchId ? (branchVehicleIds[selectedBranchId] || vehicle.id) : vehicle.id}`}
                    className="w-auto lg:w-full py-2 lg:py-2.5 px-6 lg:px-0 bg-[var(--primary)] text-gray-900 rounded-xl font-black text-[11px] lg:text-sm uppercase tracking-wide hover:bg-[var(--primary-600)] active:scale-[0.98] transition-all text-center shadow-lg whitespace-nowrap block"
                  >
                    Book Now
                    <span className="sr-only"> for {carData.name}</span>
                  </Link>
                </div>
              )}
            </div>
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