'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  Check, Info, X, ChevronDown, ChevronUp,
  Globe, Fuel, Handshake, Plane, Droplets, Zap, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Vehicle } from '@/types';
import { getVehicleImageUrl, getLogoUrl } from '@/utils/getImageUrl';
import { assets } from '@/config/assets';
import { formatPrice, formatPriceParts } from '@/utils/currency';
import { getVehicleDisplayPrice, getVehicleDepositPrice } from '@/utils/vehiclePrice';
import { fallbackRates } from '@/store/slices/currencySlice';
import type { Currency } from '@/types';
import RentalTermsModal from './RentalTermsModal';

interface CarCardProps {
  vehicle: Vehicle;
  daysNumber: number;
  hideBookingControls?: boolean;
  preselectedBookId?: string | null;
  optionsVariant?: boolean;
}

function PickupIcon({ pickupType, className }: { pickupType: string; className?: string }) {
  const type = pickupType?.toLowerCase().trim() || '';
  const cls = className || "text-blue-600 shrink-0 mt-0.5";
  if (type.includes('meet') || type.includes('greet') || type.includes('hand') || type.includes('handover')) {
    return <Handshake size={16} className={cls} />;
  }
  if (type.includes('airport') || type.includes('terminal') || type.includes('plane') || type.includes('flight')) {
    return <Plane size={16} className={cls} />;
  }
  if (type.includes('mineral') || type.includes('water') || type.includes('drop')) {
    return <Droplets size={16} className={cls} />;
  }
  return <Handshake size={16} className={cls} />;
}

function PickupLabel({ pickupType }: { pickupType: string }) {
  const type = pickupType?.toLowerCase().trim() || '';
  if (type.includes('meet') || type.includes('greet')) return 'Meet & Greet';
  if (type.includes('airport') || type.includes('terminal')) return 'Airport Pickup';
  if (type.includes('mineral') || type.includes('water')) return 'Mineral Water';
  if (type.includes('handover')) return 'Handover';
  return pickupType.charAt(0).toUpperCase() + pickupType.slice(1);
}

const FUEL_POLICY_DESCRIPTIONS: Record<string, string> = {
  'full to full': 'The vehicle is provided with a full tank of fuel and must be returned with a full tank. If the vehicle is returned with less fuel, the rental company may charge for the missing fuel and applicable service fees.',
  'same to same': 'The vehicle should be returned with approximately the same fuel level as when it was collected.',
  'pay to full': "Fuel may be purchased in advance from the rental company. Any unused fuel may be subject to the supplier's specific terms.",
};

function getFuelPolicyDescription(policy: string): string {
  if (!policy) return FUEL_POLICY_DESCRIPTIONS['full to full'];
  const normalized = policy.toLowerCase().replace(/[-_]/g, ' ').trim();
  if (normalized.includes('full to full') || normalized.includes('full/full')) {
    return FUEL_POLICY_DESCRIPTIONS['full to full'];
  }
  if (normalized.includes('same')) {
    return FUEL_POLICY_DESCRIPTIONS['same to same'];
  }
  if (normalized.includes('pay') || normalized.includes('purchase') || normalized.includes('empty')) {
    return FUEL_POLICY_DESCRIPTIONS['pay to full'];
  }
  return FUEL_POLICY_DESCRIPTIONS['full to full'];
}

interface MileageDetails {
  isLimited: boolean;
  dailyLimit: number;
  totalLimit: number;
  unit: string;
  displayText: string;
  tooltipText: string;
}

function resolveMileageDetails(
  text: string,
  days: number,
  vehicle: any,
  currencyCode: Currency,
  allRates?: any
): MileageDetails | null {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // If explicitly unlimited, do not treat as limited
  if (lower.includes('unlimited') || lower.includes('بدون تحديد') || lower.includes('غير محدود')) {
    return null;
  }

  const isLimited =
    lower.includes('limited') ||
    lower.includes('limit') ||
    lower.includes('محدد') ||
    lower.includes('اقصى') ||
    (lower.includes('km') && (lower.includes('day') || lower.includes('يوم')));

  if (!isLimited) return null;

  // Match daily limit number, e.g. "Limited Milage :300 KM", "300 KM", "250 km/day"
  const match = text.match(/(\d+[\d,]*)\s*(km|kms|كم|كيلومتر|miles|mile|ميل)?/i);
  if (!match) return null;

  const rawNum = parseInt(match[1].replace(/,/g, ''), 10);
  if (isNaN(rawNum) || rawNum <= 0) return null;

  const unit = (match[2] || 'KM').toUpperCase();
  const validDays = Math.max(1, days || 1);
  const totalLimit = rawNum * validDays;
  const formattedTotal = totalLimit.toLocaleString();
  const daysString = `${validDays} ${validDays === 1 ? 'day' : 'days'}`;

  const displayText = `Limited Mileage: ${formattedTotal} ${unit} for ${daysString}`;

  // Check extra price per km from backend
  const v = vehicle as any;
  const rawExtraPrice =
    v?.extra_km_price ??
    v?.extra_km_fee ??
    v?.extra_mileage_fee ??
    v?.extra_mileage_price ??
    v?.extra_mileage_cost ??
    v?.over_mileage_fee ??
    v?.over_mileage_price ??
    v?.extra_fee_per_km ??
    v?.price_per_extra_km ??
    v?.extra_km_charge ??
    null;

  let extraPriceStr = '';
  if (rawExtraPrice !== null && rawExtraPrice !== undefined && rawExtraPrice !== '') {
    const num = Number(rawExtraPrice);
    if (!isNaN(num) && num > 0) {
      extraPriceStr = formatPrice(num, currencyCode);
    } else if (typeof rawExtraPrice === 'string' && rawExtraPrice.trim().length > 0) {
      extraPriceStr = rawExtraPrice.trim();
    }
  }

  // Check if included item has an existing description from supplier
  const matchingInc = Array.isArray(v?.included)
    ? v.included.find((i: any) => {
      const name = (typeof i === 'string' ? i : i?.what_is_included || i?.name || '').toLowerCase();
      return (name.includes('limit') || name.includes('محدد')) && (name.includes('mile') || name.includes('mila') || name.includes('km'));
    })
    : null;
  const incDesc = matchingInc && typeof matchingInc === 'object' && matchingInc.description ? matchingInc.description.trim() : '';

  let tooltipText = `Total allowance of ${formattedTotal} ${unit} for ${daysString} (${rawNum} ${unit}/day).`;
  if (extraPriceStr) {
    tooltipText += ` Additional distance driven beyond this limit will be charged at ${extraPriceStr} per extra ${unit}.`;
  } else if (incDesc) {
    tooltipText += ` ${incDesc}`;
  } else {
    tooltipText += ` Any additional distance driven beyond this limit will be charged per extra ${unit} upon vehicle return according to supplier terms.`;
  }

  return {
    isLimited: true,
    dailyLimit: rawNum,
    totalLimit,
    unit,
    displayText,
    tooltipText,
  };
}

function ChicTooltip({
  text,
  title,
  variant = 'gold',
  align = 'center',
  position = 'top',
}: {
  text: string;
  title?: string;
  variant?: 'gold' | 'emerald' | 'blue';
  align?: 'center' | 'left' | 'right';
  position?: 'top' | 'bottom';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastOpenedAt = useRef<number>(0);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
    arrowLeft: number;
    width: number;
    placement: 'top' | 'bottom';
  } | null>(null);

  const calculatePosition = () => {
    if (!containerRef.current || typeof window === 'undefined') return;
    const rect = containerRef.current.getBoundingClientRect();
    const tooltipWidth = Math.min(270, window.innerWidth - 32);
    const iconCenterX = rect.left + rect.width / 2;

    // Center the tooltip relative to the icon, clamped within screen margins
    let left = iconCenterX - tooltipWidth / 2;
    const minLeft = 16;
    const maxLeft = window.innerWidth - tooltipWidth - 16;
    left = Math.max(minLeft, Math.min(maxLeft, left));

    // Arrow pointer relative to tooltip box (clamped inside box padding)
    const arrowLeft = Math.max(12, Math.min(tooltipWidth - 12, iconCenterX - left));

    // Check vertical clearance
    let placement = position;
    let top = 0;
    if (position === 'top') {
      if (rect.top < 150) {
        placement = 'bottom';
        top = rect.bottom + 8;
      } else {
        placement = 'top';
        top = rect.top - 8;
      }
    } else {
      if (window.innerHeight - rect.bottom < 150 && rect.top > 150) {
        placement = 'top';
        top = rect.top - 8;
      } else {
        placement = 'bottom';
        top = rect.bottom + 8;
      }
    }

    setTooltipPos({
      top,
      left,
      arrowLeft,
      width: tooltipWidth,
      placement,
    });
  };

  const handleOpen = () => {
    lastOpenedAt.current = Date.now();
    calculatePosition();
    setIsOpen(true);
  };

  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) {
      if (Date.now() - lastOpenedAt.current < 350) {
        return;
      }
      setIsOpen(false);
    } else {
      handleOpen();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    calculatePosition();

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    const handleDocumentClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('pointerdown', handleDocumentClick);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('pointerdown', handleDocumentClick);
    };
  }, [isOpen]);

  if (!text) return null;

  const variantStyles = {
    gold: {
      btn: 'bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-900 border-amber-300/70',
      badge: 'text-amber-400',
    },
    emerald: {
      btn: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-900 border-emerald-300/70',
      badge: 'text-emerald-400',
    },
    blue: {
      btn: 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 border-blue-300/70',
      badge: 'text-blue-400',
    },
  }[variant];

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center justify-center shrink-0 grow-0 group cursor-pointer"
      onMouseEnter={handleOpen}
      onMouseLeave={() => setIsOpen(false)}
      onClick={handleToggle}
    >
      <button
        type="button"
        aria-label="More information"
        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center transition-all duration-200 border shadow-2xs focus:outline-none shrink-0 ${variantStyles.btn}`}
      >
        <Info size={11} className="stroke-[2.2]" />
      </button>

      <AnimatePresence>
        {isOpen && tooltipPos && (
          <motion.div
            initial={{ opacity: 0, y: tooltipPos.placement === 'top' ? 6 : -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: tooltipPos.placement === 'top' ? 4 : -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: tooltipPos.placement === 'top' ? undefined : `${tooltipPos.top}px`,
              bottom: tooltipPos.placement === 'top' ? `${typeof window !== 'undefined' ? window.innerHeight - tooltipPos.top : 0}px` : undefined,
              left: `${tooltipPos.left}px`,
              width: `${tooltipPos.width}px`,
              zIndex: 9999,
            }}
            className="p-3.5 rounded-xl bg-slate-950/95 backdrop-blur-md text-white text-xs shadow-2xl border border-white/10 text-left pointer-events-none"
          >
            <div
              style={{ left: `${tooltipPos.arrowLeft}px` }}
              className={`absolute w-2.5 h-2.5 bg-slate-950 -translate-x-1/2 rotate-45 border-white/10 ${tooltipPos.placement === 'top'
                  ? '-bottom-1 border-r border-b'
                  : '-top-1 border-l border-t'
                }`}
            />
            {title && (
              <div className={`font-black tracking-wider uppercase text-[10px] mb-1.5 ${variantStyles.badge}`}>
                {title}
              </div>
            )}
            <div className="text-slate-100 leading-relaxed font-normal text-[11px] break-words">
              {text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CarCard({
  vehicle,
  daysNumber,
  hideBookingControls = false,
  preselectedBookId = null,
  optionsVariant = false,
}: CarCardProps) {
  const isOptionsLayout = Boolean(optionsVariant || hideBookingControls);
  const [showTerms, setShowTerms] = useState(false);
  const [showAllInclusions, setShowAllInclusions] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
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
  const { vehicles, filteredSuppliers, fetchedCurrency, searchParams } = useSelector((state: RootState) => state.search);

  const handlePersistVehicle = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedExtrasVehicleId = sessionStorage.getItem('autours_extras_vehicle_id');
        if (savedExtrasVehicleId && String(savedExtrasVehicleId) !== String(vehicle.id)) {
          sessionStorage.removeItem('autours_selected_extras');
          sessionStorage.removeItem('autours_extras_vehicle_id');
        }
        sessionStorage.setItem('autours_selected_vehicle', JSON.stringify(vehicle));
        if (searchParams && searchParams.location) {
          sessionStorage.setItem('autours_search_params', JSON.stringify(searchParams));
        }
        if (daysNumber) {
          sessionStorage.setItem('autours_days_number', String(daysNumber));
        }
        if (fetchedCurrency) {
          sessionStorage.setItem('autours_fetched_currency', fetchedCurrency);
        }
      } catch (e) {
        console.error('Failed to cache vehicle selection', e);
      }
    }
  };

  const hasExtras = (vehicle as any).has_extras !== false;
  const targetBookingPage = hasExtras ? '/options' : '/booking';
  const bookUrl = `${targetBookingPage}?vehicleId=${vehicle.id}&bookId=${selectedBranchId ? (branchVehicleIds[selectedBranchId] || vehicle.id) : vehicle.id}`;

  const formatSpecDisplay = (val: any, label: string) => {
    const sVal = String(val ?? '').trim();
    if (!label) return sVal;
    if (!sVal || sVal === '0' || sVal === 'N/A') {
      if (label.toLowerCase().includes('suitcase') || label.toLowerCase().includes('bag')) {
        return `Medium ${label}`;
      }
      return label;
    }
    if (sVal.toLowerCase().includes(label.toLowerCase())) return sVal;
    return `${sVal} ${label}`;
  };

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
      else if (key.includes('luggage') || key.includes('bag') || key.includes('suitcase')) {
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
    const supplierObj: any = vehicle.supplier && typeof vehicle.supplier === 'object' ? vehicle.supplier : {};
    const supplierSource: any = targets.map(t => t.supplier || t.supplier_user || t.company || t.rental_company).find(t => t && typeof t === 'object') || supplierObj;

    const sId = supplierObj?.id || (typeof v.supplier === 'number' || typeof v.supplier === 'string' ? v.supplier : supplierSource?.id);
    let logoStr = supplierObj?.logo || supplierSource?.logo;
    if (!logoStr && sId) {
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

    // 1. Resolve Deposit Amount (handles both deposit_amount and inclusions with currency conversion)
    const depositAmount = getVehicleDepositPrice(
      vehicle,
      currencyCode as Currency,
      allRates,
      fetchedCurrency
    );

    // 2. Resolve Deposit Category (Low, Average, High, Zero)
    let depositCategory: 'Low' | 'Average' | 'High' | 'Zero' | null = null;
    let depositBadgeColor = '';

    if (depositAmount > 0) {
      // Dynamic 3-tier categorization matching SearchFilters & search/page.tsx
      const allDeposits = (vehicles || [])
        .map(v => getVehicleDepositPrice(v, currencyCode as Currency, allRates, fetchedCurrency))
        .filter(d => d > 0)
        .sort((a, b) => a - b);

      if (allDeposits.length >= 2) {
        const min = allDeposits[0];
        const max = allDeposits[allDeposits.length - 1];
        if (max > min) {
          const tier1 = min + (max - min) / 3;
          const tier2 = min + 2 * (max - min) / 3;

          if (depositAmount <= tier1) {
            depositCategory = 'Low';
            depositBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          } else if (depositAmount <= tier2) {
            depositCategory = 'Average';
            depositBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
          } else {
            depositCategory = 'High';
            depositBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
          }
        }
      }

      // Fallback USD thresholds if fleet has only 1 vehicle or uniform values
      if (!depositCategory) {
        const rateToUsd = (allRates && allRates[currencyCode]) || fallbackRates[currencyCode] || 1;
        const inUsd = depositAmount / (rateToUsd > 0 ? rateToUsd : 1);
        if (inUsd <= 350) {
          depositCategory = 'Low';
          depositBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        } else if (inUsd <= 850) {
          depositCategory = 'Average';
          depositBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
        } else {
          depositCategory = 'High';
          depositBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
        }
      }
    } else {
      const isZeroDepositExplicit = (vehicle.included || []).some((i: any) => {
        const text = (typeof i === 'string' ? i : i?.what_is_included || i?.name || '').toLowerCase();
        return text.includes('zero deposit') || text.includes('no deposit') || text.includes('بدون تأمين');
      });
      if (isZeroDepositExplicit) {
        depositCategory = 'Zero';
        depositBadgeColor = 'bg-teal-50 text-teal-700 border-teal-200';
      }
    }

    const depositTerms = vehicle.deposit_terms || (vehicle as any)?.depositTerms || null;

    const inclusions = (vehicle.included || [])
      .map((i: any) => {
        if (!i) return '';
        let val = typeof i === 'string' ? i : (i.what_is_included || i.description || '').toString();
        try {
          const parsed = JSON.parse(val);
          if (parsed && typeof parsed === 'object') {
            val = (parsed.conditionName || parsed.rentalConditionName || parsed.name || parsed.description || val).toString();
          }
        } catch (e) { }
        return val.trim();
      })
      .filter(Boolean);

    // Map & calculate limited mileage based on rental days
    const mileageTooltipMap: Record<string, string> = {};
    const processedInclusions = inclusions.map(inc => {
      const mileageInfo = resolveMileageDetails(
        inc,
        daysNumber || 1,
        vehicle,
        currencyCode as Currency,
        allRates
      );
      if (mileageInfo) {
        mileageTooltipMap[mileageInfo.displayText] = mileageInfo.tooltipText;
        return mileageInfo.displayText;
      }
      return inc;
    });

    // Filter out any stale generic deposit strings from inclusions
    const filteredInclusions = processedInclusions.filter(inc => {
      const lower = inc.toLowerCase().trim();
      return !(
        lower === 'deposit' ||
        lower === 'zero deposit' ||
        lower === 'low deposit' ||
        lower === 'average deposit' ||
        lower === 'high deposit' ||
        lower.startsWith('deposit:') ||
        lower.includes('deposit')
      );
    });

    // Add Deposit category with price at top of inclusions
    if (depositAmount > 0) {
      const formattedDeposit = formatPrice(depositAmount, currencyCode as Currency);
      const depositLabel = depositCategory ? `${depositCategory} Deposit: ${formattedDeposit}` : `Deposit: ${formattedDeposit}`;
      filteredInclusions.unshift(depositLabel);
    } else if (depositCategory === 'Zero') {
      filteredInclusions.unshift('Zero Deposit');
    }

    const totalPrice = getVehicleDisplayPrice(
      vehicle,
      currencyCode as Currency,
      allRates,
      daysNumber || 1,
      fetchedCurrency
    );

    const supplierName = supplierObj.company || supplierObj.name || supplierSource?.company || supplierSource?.name || (filteredSuppliers?.find(s => String(s.id) === String(sId))?.name) || 'Supplier';

    return {
      name: trimmedName,
      type: getSpec('type') !== 'N/A' ? getSpec('type') : (vehicle.category || 'Economy'),
      depositAmount,
      depositCategory,
      depositBadgeColor,
      depositTerms,
      image: getVehicleImageUrl(imgSource),
      transmission: getSpec('transmission'),
      fuelType: getSpec('fuel'),
      seats: getSpec('seats'),
      doors: (() => {
        const d = getSpec('doors');
        if (!d || d === 'N/A' || d === '0' || d === 0) return '4';
        if (d === '3' || d === 3) return '4';
        return d;
      })(),
      suitcases: (() => {
        const s = getSpec('suitcase') !== 'N/A'
          ? getSpec('suitcase')
          : (getSpec('bags') !== 'N/A' ? getSpec('bags') : getSpec('luggage'));
        if (!s || s === '0' || s === 0 || s === 'N/A') {
          return (vehicle as any)?.suitcases || 'Medium';
        }
        return s;
      })(),
      ac: (() => {
        const a = getSpec('air conditioning');
        if (a === 'No' || a === 'No AC' || a === 'false') return 'No A/C';
        return 'Air Conditioning';
      })(),
      supplier: {
        name: supplierName.toString().trim(),
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
      inclusions: filteredInclusions,
      mileageTooltipMap,
      fuelPolicy: typeof vehicle.fuelPolicy === 'string' ? vehicle.fuelPolicy : (vehicle.fuel_policy?.name || (vehicle as any).fuelPolicy?.name || 'Full to Full'),
      pickupType: pickupType,
      freeCancellation: filteredInclusions.some(i => i.toLowerCase().includes('cancel')),
      freeCancellationHours: 24,
      promos: vehicle.promos || (vehicle.promo ? [vehicle.promo] : []),
      promosDetails: (vehicle as any).promos_details || [],
    };
  }, [vehicle, daysNumber, currencyCode, allRates, filteredSuppliers, fetchedCurrency, vehicles]);

  const openMap = () => {
    const selectedBranch =
      availableBranches.find((b: any) => String(b.id) === String(selectedBranchId)) ||
      (vehicle as any).branch ||
      (availableBranches.length > 0 ? availableBranches[0] : null);

    const branchName = (selectedBranch?.normalized_name || selectedBranch?.name || selectedBranch?.location || (vehicle as any).location || '').toString().trim();
    const branchAddress = (selectedBranch?.adresse || selectedBranch?.location_address || selectedBranch?.address || '').toString().trim();
    const supplierAddress = (carData.supplier.address || '').toString().trim();

    const city = (selectedBranch?.city || (vehicle as any).city || (vehicle as any).location_city || '').toString().trim();
    const country = (selectedBranch?.country || (vehicle as any).country || '').toString().trim();

    // Prioritize the airport / location name (e.g. "Dubai International Airport")
    let query = branchName || branchAddress || supplierAddress;

    if (query) {
      const lower = query.toLowerCase();
      if (city && !lower.includes(city.toLowerCase())) {
        query += `, ${city}`;
      }
      if (country && !lower.includes(country.toLowerCase())) {
        query += `, ${country}`;
      }
    } else {
      query = 'Airport';
    }

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    if (typeof window !== 'undefined') {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const displayAddress = useMemo(() => {
    const selectedBranch =
      availableBranches.find((b: any) => String(b.id) === String(selectedBranchId)) ||
      (vehicle as any).branch ||
      (availableBranches.length > 0 ? availableBranches[0] : null);

    return (
      selectedBranch?.normalized_name ||
      selectedBranch?.name ||
      selectedBranch?.location ||
      selectedBranch?.adresse ||
      (vehicle as any).location ||
      carData.supplier.address ||
      'Airport Terminal / City Center'
    );
  }, [availableBranches, selectedBranchId, vehicle, carData.supplier.address]);

  const sortedInclusions = useMemo(() => {
    const incs = [...(carData.inclusions || [])];
    const isCancel = (s: string) => {
      const l = (s || '').toLowerCase();
      return l.includes('cancel') || l.includes('إلغاء') || l.includes('الغاء') || l.includes('مجاني') || l.includes('كنسل');
    };
    const isDeposit = (s: string) => {
      const l = (s || '').toLowerCase();
      return l.includes('deposit') || l.includes('تأمين') || l.includes('تامين');
    };
    return incs.sort((a, b) => {
      const aScore = isCancel(a) ? 0 : isDeposit(a) ? 1 : 2;
      const bScore = isCancel(b) ? 0 : isDeposit(b) ? 1 : 2;
      return aScore - bScore;
    });
  }, [carData.inclusions]);

  const displayedInclusions = showAllInclusions || hideBookingControls
    ? sortedInclusions
    : sortedInclusions.slice(0, 6);

  const getPromoDescription = (promoName: string | null) => {
    if (!promoName) return '';
    const details = carData.promosDetails || [];
    const found = details.find((pd: any) => {
      const name = (pd.name || pd.what_is_included || '').toLowerCase().trim();
      return name === promoName.toLowerCase().trim();
    });
    if (found?.description) return found.description;
    const lower = promoName.toLowerCase();
    if (lower.includes('cancel') || lower.includes('مجاني')) {
      return 'Free cancellation up to 48 hours before pickup. If your plans change, cancel without penalty according to supplier terms.';
    }
    if (lower.includes('check')) {
      return 'Complete your check-in online to save time at the counter and pick up your vehicle faster.';
    }
    return '';
  };

  const { firstPromo, secondPromo, remainingPromos } = useMemo(() => {
    const list = carData.promos || [];
    if (list.length === 0) {
      return { firstPromo: null, secondPromo: null, remainingPromos: [] };
    }

    const freeCancelIndex = list.findIndex((p: string) => {
      const text = p.toLowerCase();
      return (text.includes('free') && text.includes('cancel')) || text.includes('مجاني') || text.includes('كنسليشن');
    });

    let orderedList = [...list];
    if (freeCancelIndex > 0) {
      const [freeCancel] = orderedList.splice(freeCancelIndex, 1);
      orderedList.unshift(freeCancel);
    }

    // Deduplicate
    orderedList = Array.from(new Set(orderedList));

    const first = orderedList[0] || null;
    const second = orderedList[1] || null;
    const remaining = orderedList.slice(2);

    return {
      firstPromo: first,
      secondPromo: second,
      remainingPromos: remaining,
    };
  }, [carData.promos]);

  const firstPromoDesc = useMemo(() => getPromoDescription(firstPromo), [firstPromo, carData.promosDetails]);
  const secondPromoDesc = useMemo(() => getPromoDescription(secondPromo), [secondPromo, carData.promosDetails]);

  // Calculate discount percentage strictly from vehicle profit discount
  const discountPercent = useMemo(() => {
    const directDiscount = Number((vehicle as any).discount_percent);
    if (!isNaN(directDiscount) && directDiscount > 0) {
      return directDiscount;
    }
    return 0;
  }, [vehicle]);

  const originalPriceParts = useMemo(() => {
    // Only display strikethrough original price if there is an active discount > 0
    if (discountPercent > 0 && discountPercent < 100 && carData.price.amount > 0) {
      const originalAmount = carData.price.amount / (1 - (discountPercent / 100));
      const origFormatted = formatPriceParts(originalAmount, carData.price.currency as Currency);
      const currFormatted = formatPriceParts(carData.price.amount, carData.price.currency as Currency);

      const numOrig = parseFloat(origFormatted.amount.replace(/,/g, ''));
      const numCurr = parseFloat(currFormatted.amount.replace(/,/g, ''));
      if (numOrig > numCurr) {
        return origFormatted;
      }
    }
    return null;
  }, [discountPercent, carData.price.amount, carData.price.currency]);

  // For options / booking layout: combine inclusions and relevant promos (Free Cancellation, Online Check-in)
  // into one unified list under "What's included" with Free Cancellation ALWAYS FIRST before deposit and everything.
  const optionsInclusions = useMemo(() => {
    const list: Array<{
      text: string;
      tooltip?: string | null;
      tooltipTitle?: string;
      tooltipVariant?: 'emerald' | 'gold';
    }> = [];
    const baseInclusions = displayedInclusions;

    const isCancelText = (str: string) => {
      const lower = (str || '').toLowerCase();
      return lower.includes('cancel') || lower.includes('إلغاء') || lower.includes('الغاء') || lower.includes('مجاني') || lower.includes('كنسل');
    };

    const isDepositText = (str: string) => {
      const lower = (str || '').toLowerCase();
      return lower.includes('deposit') || lower.includes('تأمين') || lower.includes('تامين');
    };

    // 1. Free Cancellation MUST ALWAYS be first (index 0)
    const cancelBaseItem = baseInclusions.find(inc => isCancelText(inc));
    let cancelItem: {
      text: string;
      tooltip?: string | null;
      tooltipTitle?: string;
      tooltipVariant?: 'emerald' | 'gold';
    } | null = null;

    if (cancelBaseItem) {
      cancelItem = {
        text: cancelBaseItem,
        tooltip: firstPromoDesc || getPromoDescription(cancelBaseItem) || getPromoDescription('Free Cancellation'),
        tooltipTitle: cancelBaseItem,
        tooltipVariant: 'emerald',
      };
    } else if (firstPromo && isCancelText(firstPromo)) {
      cancelItem = {
        text: firstPromo,
        tooltip: firstPromoDesc || getPromoDescription(firstPromo),
        tooltipTitle: firstPromo,
        tooltipVariant: 'emerald',
      };
    } else if (carData.freeCancellation) {
      cancelItem = {
        text: 'Free Cancellation',
        tooltip: firstPromoDesc || getPromoDescription('Free Cancellation'),
        tooltipTitle: 'Free Cancellation',
        tooltipVariant: 'emerald',
      };
    }

    if (cancelItem) {
      list.push(cancelItem);
    }

    // 2. Deposit MUST ALWAYS be second (directly after Free Cancellation)
    const depositBaseItem = baseInclusions.find(inc => isDepositText(inc));
    if (depositBaseItem) {
      const depositDesc = carData.depositTerms || (carData.depositAmount > 0
        ? `Refundable security deposit (${carData.depositCategory || 'Standard'} category) of ${formatPrice(carData.depositAmount, currencyCode as Currency)} collected at counter upon vehicle pickup and released upon return.`
        : "No security deposit is required for this vehicle.");
      list.push({
        text: depositBaseItem,
        tooltip: depositDesc,
        tooltipTitle: 'Security Deposit',
        tooltipVariant: 'gold',
      });
    }

    // 3. Online Check-in (if present as promo, placed right after cancellation & deposit)
    const otherPromos = [firstPromo, secondPromo, ...remainingPromos].filter(Boolean) as string[];
    const checkinPromo = otherPromos.find(p => p.toLowerCase().includes('check'));
    if (checkinPromo) {
      const pDesc = getPromoDescription(checkinPromo);
      list.push({
        text: checkinPromo,
        tooltip: pDesc || null,
        tooltipTitle: checkinPromo,
        tooltipVariant: 'emerald',
      });
    }

    // 4. Remaining base inclusions (excluding cancellation and deposit since they are already #1 and #2)
    baseInclusions.forEach(inc => {
      if (isCancelText(inc) || isDepositText(inc)) return; // Already placed first & second!

      const mileageDesc = (carData as any).mileageTooltipMap?.[inc] || null;

      list.push({
        text: inc,
        tooltip: mileageDesc,
        tooltipTitle: mileageDesc ? 'Mileage Policy' : undefined,
        tooltipVariant: mileageDesc ? 'gold' : 'emerald',
      });
    });

    // 4. Any remaining promos (excluding cancel & check-in which were already handled)
    otherPromos.forEach(p => {
      if (isCancelText(p) || p.toLowerCase().includes('check')) return;
      const alreadyExists = list.some(item => item.text.toLowerCase().trim() === p.toLowerCase().trim());
      if (!alreadyExists) {
        const pDesc = getPromoDescription(p);
        list.push({
          text: p,
          tooltip: pDesc || null,
          tooltipTitle: p,
          tooltipVariant: 'emerald',
        });
      }
    });

    return list;
  }, [displayedInclusions, firstPromo, firstPromoDesc, secondPromo, secondPromoDesc, remainingPromos, carData, currencyCode]);

  const renderPromoItem = (promoText: string, promoDesc: string, tooltipPosition: 'top' | 'bottom' = 'top') => {
    if (!promoText) return null;
    return (
      <div className="inline-flex items-center gap-1.5 min-w-0 max-w-full py-0.5 select-none">
        <Check size={16} className="stroke-[3] shrink-0 text-emerald-600" />
        <span className="text-[13px] sm:text-[13.5px] xl:text-sm font-extrabold text-emerald-700 tracking-wide truncate leading-snug">
          {promoText}
        </span>
        {promoDesc && (
          <ChicTooltip
            text={promoDesc}
            title={promoText}
            variant="emerald"
            align="right"
            position={tooltipPosition}
          />
        )}
      </div>
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
            unoptimized={carData.image?.includes('http')}
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
            <ChicTooltip
              text="The supplier will provide a car with same class and specifications, though the make may vary."
              title="Vehicle Category"
              variant="gold"
              align="center"
              position="bottom"
            />
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
                  {formatSpecDisplay(feat.val, feat.label)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {isOptionsLayout && (
          <div className="px-4 pb-2.5 flex items-center gap-1.5 text-blue-600 text-xs sm:text-sm font-bold min-w-0">
            <button
              type="button"
              onClick={openMap}
              className="shrink-0 p-0.5 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              title="View location on Google Maps"
              aria-label="View location on Google Maps"
            >
              <Globe size={15} className="text-blue-600 shrink-0" />
            </button>
            <div
              onClick={openMap}
              className="cursor-pointer group/addr truncate max-w-[280px]"
              title="View location on Google Maps"
            >
              <span className="text-blue-600 underline font-bold group-hover/addr:text-blue-800 transition-colors">
                {displayAddress}
              </span>
            </div>
          </div>
        )}

        {isOptionsLayout ? (
          <>
            {/* Price displayed above the gray box with 15px bottom space */}
            <div className="px-4 pt-1 pb-[15px] flex flex-col items-start text-left">
              {originalPriceParts && discountPercent > 0 && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-red-500 line-through decoration-red-500 tracking-tight">
                    {originalPriceParts.currency} {originalPriceParts.amount}
                  </span>
                </div>
              )}
              <div className="text-2xl font-bold text-gray-950 tracking-tight leading-none">
                {formatPriceParts(carData.price.amount, carData.price.currency as Currency).currency}{' '}
                {formatPriceParts(carData.price.amount, carData.price.currency as Currency).amount}
              </div>
              <span className="text-xs text-gray-600 font-normal block mt-1.5">
                Total price for {carData.price.totalDays} {carData.price.totalDays === 1 ? 'day' : 'days'}
              </span>
              <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                Included taxes &amp; fees
              </span>
            </div>

            {/* The Gray Box — single line with all items, horizontally scrollable */}
            <div className="mx-4 mb-3 bg-gray-100 rounded-xl px-3.5 py-2.5 flex items-center gap-3 sm:gap-4 flex-nowrap overflow-x-auto no-scrollbar">
              {/* 1. Supplier Logo + Name + Rating */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="bg-white p-1 rounded-lg flex items-center justify-center w-16 h-8 shrink-0 shadow-sm border border-gray-200/60">
                  {carData.supplier.logo ? (
                    <Image
                      src={carData.supplier.logo}
                      alt={`${carData.supplier.name} Logo`}
                      width={60}
                      height={24}
                      unoptimized={carData.supplier.logo?.includes('http')}
                      className="h-6 w-auto max-w-[60px] object-contain"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-gray-600">N/A</span>
                  )}
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <span className="text-xs sm:text-sm font-black text-gray-900 block truncate leading-tight mb-0.5">
                    {carData.supplier.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="bg-[var(--primary)] text-gray-900 px-1 py-0.5 rounded text-[10px] sm:text-[11px] font-black leading-none">
                      {carData.supplier.rating}/10
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-black text-gray-800 leading-none">Excellent</span>
                  </div>
                </div>
              </div>

              <div className="h-5 w-px bg-gray-300 shrink-0" />

              {/* 2. Rental Terms */}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs sm:text-[13px] font-bold underline cursor-pointer shrink-0 transition-colors"
              >
                <FileText size={16} className="shrink-0 text-blue-600" />
                <span>Rental Terms</span>
              </button>

              <div className="h-5 w-px bg-gray-300 shrink-0" />

              {/* 3. Fuel Policy */}
              <div className="flex items-center gap-1.5 text-blue-600 text-xs sm:text-[13px] font-bold shrink-0">
                <Fuel size={16} className="shrink-0 text-blue-600" />
                <span className="cursor-pointer">{carData.fuelPolicy}</span>
                <ChicTooltip
                  text={getFuelPolicyDescription(carData.fuelPolicy)}
                  title="Fuel Policy"
                  variant="gold"
                  align="left"
                  position="top"
                />
              </div>

              <div className="h-5 w-px bg-gray-300 shrink-0" />

              {/* 4. Pick-up */}
              <div className="flex items-center gap-1.5 text-blue-600 text-xs sm:text-[13px] font-bold shrink-0">
                <PickupIcon pickupType={carData.pickupType} className="text-blue-600 shrink-0 mt-0.5" />
                <span><PickupLabel pickupType={carData.pickupType} /></span>
              </div>
            </div>

            {/* What's included — always visible, no accordion */}
            <div className="px-4 pb-4">
              <div className="mb-3">
                <div className="inline-flex flex-col">
                  <h4 className="text-sm sm:text-base font-bold text-emerald-800 tracking-wide">What's included</h4>
                  <span className="mt-1.5 h-[2.5px] w-[calc(100%+20px)] bg-amber-400 rounded-full" />
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                {optionsInclusions.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 min-w-0">
                    <Check size={14} className="text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span className="text-xs font-semibold text-gray-700 break-words flex items-center gap-1.5 flex-wrap">
                      <span>{item.text}</span>
                    </span>
                    {item.tooltip && (
                      <ChicTooltip
                        text={item.tooltip}
                        title={item.tooltipTitle || item.text}
                        variant={item.tooltipVariant || 'emerald'}
                        position="top"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {!hideBookingControls && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={bookUrl}
                  onClick={handlePersistVehicle}
                  className="px-6 py-2.5 bg-[var(--primary)] text-gray-900 rounded-xl font-black text-xs uppercase hover:bg-[var(--primary-600)] active:scale-95 transition-all text-center shadow-md ml-auto"
                >
                  Book Now
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mx-4 mb-2 md:mb-2.5">
              <div className="w-full bg-gray-100 rounded-xl px-3 py-2.5 flex flex-col gap-2">

                {/* Row 1: Logo + Name/Terms + Rating */}
                <div className="flex items-center gap-2.5">
                  {/* Supplier logo */}
                  <div className="bg-white p-1 rounded-lg flex items-center justify-center w-[80px] h-[40px] shrink-0 shadow-sm overflow-hidden border border-gray-100">
                    {carData.supplier.logo ? (
                      <Image
                        src={carData.supplier.logo}
                        alt={`${carData.supplier.name} Logo`}
                        width={80}
                        height={40}
                        unoptimized={carData.supplier.logo?.includes('http')}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[9px] font-bold text-gray-600 text-center px-1">{carData.supplier.name}</span>
                    )}
                  </div>

                  {/* Supplier name + Rental terms */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[11px] font-black text-gray-800 truncate">{carData.supplier.name}</span>
                    <button onClick={() => setShowTerms(true)} className="text-[10px] font-bold text-blue-600 underline hover:text-blue-800 whitespace-nowrap leading-none mt-0.5 text-left">
                      Rental Terms
                    </button>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 shrink-0 ml-auto">
                    <span className="bg-[var(--primary)] text-gray-900 px-1.5 py-0.5 rounded text-xs font-black">{carData.supplier.rating}/10</span>
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] font-black text-gray-700">Excellent</span>
                      <span className="text-[9px] font-black text-gray-500">({carData.supplier.reviewsCount}+)</span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Instant confirmation */}
                {carData.supplier.instantConfirmation && (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-gray-200">
                    <img src={assets.icons.instant} alt="" className="w-5 h-5 object-contain shrink-0" aria-hidden="true" />
                    <span className="text-[13px] font-black text-gray-900">Instant confirmation</span>
                    <ChicTooltip
                      text="Receive instant booking confirmation right after completing your reservation!"
                      title="Instant Confirmation"
                      variant="gold"
                      align="left"
                      position="top"
                    />
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
                    <div className="bg-green-100/35 rounded-xl px-3.5 py-3">
                      <div className="mb-3">
                        <div className="inline-flex flex-col">
                          <h4 className="text-sm sm:text-base font-bold text-emerald-800">What's included</h4>
                          <span className="mt-1.5 h-0.5 w-[calc(100%+20px)] bg-amber-400 rounded-full" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {displayedInclusions.map((inc, i) => {
                          const isDeposit = inc.toLowerCase().includes('deposit');
                          const depositDesc = isDeposit
                            ? (carData.depositTerms || (carData.depositAmount > 0
                              ? `Refundable security deposit (${carData.depositCategory || 'Standard'} category) of ${formatPrice(carData.depositAmount, currencyCode as Currency)} collected at counter upon vehicle pickup and released upon return.`
                              : "No security deposit is required for this vehicle."))
                            : null;
                          const mileageDesc = (carData as any).mileageTooltipMap?.[inc] || null;
                          return (
                            <div key={i} className="flex items-center gap-1.5 min-w-0">
                              <Check size={14} className="text-emerald-600 shrink-0 stroke-[2.5]" />
                              <span
                                className={`text-xs font-semibold text-gray-700 break-words flex items-center gap-1.5 flex-wrap ${mileageDesc ? 'cursor-pointer hover:text-gray-950 transition-colors' : ''}`}
                                title={depositDesc || mileageDesc || inc}
                              >
                                <span>{inc}</span>
                              </span>
                              {depositDesc && (
                                <ChicTooltip
                                  text={depositDesc}
                                  title="Security Deposit"
                                  variant="gold"
                                  position="top"
                                />
                              )}
                              {mileageDesc && (
                                <ChicTooltip
                                  text={mileageDesc}
                                  title="Mileage Policy"
                                  variant="gold"
                                  position="top"
                                />
                              )}
                            </div>
                          );
                        })}
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
                      <button
                        type="button"
                        onClick={openMap}
                        className="shrink-0 pt-0.5 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                        title="View location on Google Maps"
                        aria-label="View location on Google Maps"
                      >
                        <Globe size={16} className="text-blue-600 hover:text-blue-700 transition-colors" />
                      </button>
                      <div
                        onClick={openMap}
                        className="cursor-pointer group/addr flex flex-col"
                        title="View location on Google Maps"
                      >
                        <div>
                          <span className="text-xs font-bold text-gray-500">Address: </span>
                          <span className="text-sm font-black text-gray-800 group-hover/addr:text-blue-600 group-hover/addr:underline transition-colors">
                            {availableBranches.find((b: any) => String(b.id) === String(selectedBranchId))?.normalized_name ||
                              availableBranches.find((b: any) => String(b.id) === String(selectedBranchId))?.name ||
                              availableBranches.find((b: any) => String(b.id) === String(selectedBranchId))?.adresse ||
                              carData.supplier.address}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Fuel size={17} className="text-blue-600 shrink-0" />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">Fuel Policy: </span>
                        <span className="text-sm font-black text-gray-800">{carData.fuelPolicy}</span>
                        <ChicTooltip text={getFuelPolicyDescription(carData.fuelPolicy)} title="Fuel Policy" variant="gold" align="left" position="top" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <PickupIcon pickupType={carData.pickupType} />
                      <div>
                        <span className="text-xs font-bold text-gray-500">Pick-up: </span>
                        <span className="text-sm font-black text-gray-800"><PickupLabel pickupType={carData.pickupType} /></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 pt-4">
              {(firstPromo || secondPromo) && (
                <div className="flex flex-wrap gap-2 justify-start mb-3">
                  {firstPromo && renderPromoItem(firstPromo, firstPromoDesc, 'top')}
                  {secondPromo && renderPromoItem(secondPromo, secondPromoDesc, 'top')}
                </div>
              )}

              <div className="flex items-end justify-between gap-3 md:gap-4">
                <div className="text-left">
                  {originalPriceParts && discountPercent > 0 && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs md:text-sm font-bold text-red-500 line-through decoration-red-500 tracking-tight">
                        {originalPriceParts.currency} {originalPriceParts.amount}
                      </span>
                    </div>
                  )}
                  <div className="text-xl md:text-2xl font-bold text-gray-950 tracking-tight leading-none">
                    {formatPriceParts(carData.price.amount, carData.price.currency as Currency).currency}{' '}
                    {formatPriceParts(carData.price.amount, carData.price.currency as Currency).amount}
                  </div>
                  <span className="text-sm text-gray-600 font-normal block mt-1.5">
                    Total price for {carData.price.totalDays} {carData.price.totalDays === 1 ? 'day' : 'days'}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                    Included taxes &amp; fees
                  </span>
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
                              {availableBranches.find((b: any) => b.id === selectedBranchId)?.normalized_name || availableBranches.find((b: any) => b.id === selectedBranchId)?.name || availableBranches.find((b: any) => b.id === selectedBranchId)?.location || 'Select Branch'}
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
                                    className={`w-full text-left text-xs py-2.5 px-4 transition-colors font-bold ${isSelected
                                        ? 'bg-[var(--primary)] text-gray-900'
                                        : 'text-gray-700 hover:bg-[var(--primary)]/20 hover:text-gray-900'
                                      }`}
                                  >
                                    <span className="font-extrabold">{b.normalized_name || b.name || b.location}</span>
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                    <Link
                      href={bookUrl}
                      onClick={handlePersistVehicle}
                      className="px-4 md:px-6 py-2 bg-[var(--primary)] text-gray-900 rounded-xl font-black text-[11px] md:text-xs uppercase hover:bg-[var(--primary-600)] active:scale-95 transition-all shrink-0 text-center shadow-md"
                    >
                      Book Now
                      <span className="sr-only"> for {carData.name}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          <div className="w-[250px] lg:w-[270px] 2xl:w-[300px] shrink-0 p-3 lg:p-4 flex items-center justify-center self-stretch">
            <Image
              src={imgError ? 'https://via.placeholder.com/400x250?text=No+Image' : (carData.image || 'https://via.placeholder.com/400x250?text=No+Image')}
              alt={carData.name}
              width={300}
              height={200}
              priority
              fetchPriority="high"
              unoptimized={carData.image?.includes('http')}
              className="w-full h-auto max-h-[200px] object-contain my-auto"
              onError={() => setImgError(true)}
            />
          </div>

          <div className="flex-1 py-3 px-2 sm:px-3 lg:px-3.5 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">{carData.name}</h3>
                <span className="text-xs font-medium text-gray-600">or Similar</span>
                <ChicTooltip
                  text="The supplier will provide a car with same class and specifications, though the make may vary."
                  title="Vehicle Category"
                  variant="gold"
                  align="left"
                  position="bottom"
                />
              </div>
              <p className="text-xs font-black text-gray-600 mb-3 sm:mb-4">{carData.type}</p>

              <div className="grid grid-cols-2 w-full gap-x-2 sm:gap-x-2.5 lg:gap-x-3 gap-y-2">
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
                    className="flex items-center gap-1 sm:gap-1.5 w-full min-w-0"
                  >
                    <img src={feat.icon} alt="" className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain shrink-0" aria-hidden="true" />
                    <span className="text-[11px] sm:text-xs xl:text-[13px] font-bold text-gray-700 tracking-tight leading-tight" title={formatSpecDisplay(feat.val, feat.label)}>
                      {formatSpecDisplay(feat.val, feat.label)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Location under specs for options layout */}
              {isOptionsLayout && (
                <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 text-blue-600 text-xs sm:text-sm font-bold min-w-0">
                  <button
                    type="button"
                    onClick={openMap}
                    className="shrink-0 p-0.5 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    title="View location on Google Maps"
                    aria-label="View location on Google Maps"
                  >
                    <Globe size={16} className="text-blue-600 shrink-0" />
                  </button>
                  <div
                    onClick={openMap}
                    className="cursor-pointer group/addr truncate max-w-[280px] sm:max-w-[340px]"
                    title="View location on Google Maps"
                  >
                    <span className="text-blue-600 underline font-bold group-hover/addr:text-blue-800 transition-colors">
                      {displayAddress}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price displayed above the gray box on options layout */}
          {isOptionsLayout && (
            <div className="w-auto md:w-[155px] lg:w-[170px] xl:w-[195px] 2xl:w-[230px] shrink-0 px-2.5 sm:px-3 lg:px-4 pt-2 pb-[15px] flex flex-col items-start self-end text-left">
              {originalPriceParts && discountPercent > 0 && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs sm:text-sm lg:text-base font-bold text-red-500 line-through decoration-red-500 tracking-tight">
                    {originalPriceParts.currency} {originalPriceParts.amount}
                  </span>
                </div>
              )}
              <div className="text-xl sm:text-2xl lg:text-[26px] font-bold text-gray-950 tracking-tight leading-none whitespace-nowrap">
                {formatPriceParts(carData.price.amount, carData.price.currency as Currency).currency}{' '}
                {formatPriceParts(carData.price.amount, carData.price.currency as Currency).amount}
              </div>
              <span className="text-xs sm:text-sm lg:text-[15px] text-gray-600 font-normal block mt-1.5 whitespace-nowrap">
                Total price for {carData.price.totalDays} {carData.price.totalDays === 1 ? 'day' : 'days'}
              </span>
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium block mt-0.5 whitespace-nowrap">
                Included taxes &amp; fees
              </span>
            </div>
          )}
        </div>

        <div className={`flex ${isOptionsLayout ? 'flex-col mb-3 sm:mb-4' : 'flex-col lg:flex-row mb-2 relative gap-y-3 lg:gap-y-0'}`}>
          <div className={`flex bg-gray-100 rounded-xl ${
            isOptionsLayout
              ? 'mx-5 sm:mx-6 md:mx-7 lg:mx-8 w-[calc(100%-2.5rem)] sm:w-[calc(100%-3rem)] md:w-[calc(100%-3.5rem)] lg:w-[calc(100%-4rem)] px-4 sm:px-6 py-2.5 sm:py-3 items-center flex-nowrap overflow-x-auto no-scrollbar'
              : 'mx-4 sm:mx-5 lg:mx-0 lg:ml-4 w-[calc(100%-2rem)] sm:w-[calc(100%-2.5rem)] lg:w-auto lg:flex-1 lg:min-w-0 px-3.5 sm:px-4 py-2 sm:py-2.5 items-center justify-start gap-x-2.5 md:gap-x-3.5 xl:gap-x-5 flex-wrap gap-y-3'
          }`}>
            {isOptionsLayout ? (
              <div className="flex items-center justify-start gap-4 sm:gap-6 md:gap-7 lg:gap-8 flex-nowrap min-w-0">
                {/* 1. Supplier Logo + Name with Rating Underneath */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                  <div className="bg-white p-1.5 rounded-lg flex items-center justify-center w-16 sm:w-20 h-9 sm:h-10 shrink-0 shadow-sm border border-gray-200/60">
                    {carData.supplier.logo ? (
                      <Image
                        src={carData.supplier.logo}
                        alt={`${carData.supplier.name} Logo`}
                        width={65}
                        height={28}
                        unoptimized={carData.supplier.logo?.includes('http')}
                        className="h-6 sm:h-7 w-auto max-w-[65px] object-contain"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-gray-600">N/A</span>
                    )}
                  </div>

                  <div className="min-w-0 flex flex-col justify-center">
                    <span className="text-sm sm:text-[15px] font-black text-gray-900 block truncate leading-tight mb-0.5 sm:mb-1">
                      {carData.supplier.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-[var(--primary)] text-gray-900 px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-black leading-none">
                        {carData.supplier.rating}/10
                      </span>
                      <span className="text-[11px] sm:text-xs font-black text-gray-800 leading-none">Excellent</span>
                    </div>
                  </div>
                </div>

                <div className="h-6 w-px bg-gray-300 shrink-0" />

                {/* 2. Rental Terms button */}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm sm:text-[15px] font-bold underline cursor-pointer shrink-0 transition-colors"
                >
                  <FileText size={18} className="shrink-0 text-blue-600" />
                  <span>Rental Terms</span>
                </button>

                <div className="h-6 w-px bg-gray-300 shrink-0" />

                {/* 3. Fuel Policy */}
                <div className="flex items-center gap-1.5 text-blue-600 text-sm sm:text-[15px] font-bold shrink-0">
                  <Fuel size={18} className="shrink-0 text-blue-600" />
                  <span className="cursor-pointer">{carData.fuelPolicy}</span>
                  <ChicTooltip
                    text={getFuelPolicyDescription(carData.fuelPolicy)}
                    title="Fuel Policy"
                    variant="gold"
                    align="left"
                    position="top"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 shrink-0" />

                {/* 4. Pick-up */}
                <div className="flex items-center gap-1.5 text-blue-600 text-sm sm:text-[15px] font-bold shrink-0">
                  <PickupIcon pickupType={carData.pickupType} className="text-blue-600 shrink-0 size-[18px]" />
                  <span><PickupLabel pickupType={carData.pickupType} /></span>
                </div>

              </div>
            ) : (
              <>
                <div className="bg-white p-1.5 rounded-lg flex items-center justify-center w-20 h-10 shrink-0 shadow-sm">
                  {carData.supplier.logo ? (
                    <Image
                      src={carData.supplier.logo}
                      alt={`${carData.supplier.name} Logo`}
                      width={65}
                      height={28}
                      unoptimized={carData.supplier.logo?.includes('http')}
                      className="h-7 w-auto max-w-[65px] object-contain"
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
                    <span className="text-[13.5px] xl:text-[14px] font-black text-gray-900 whitespace-nowrap">Instant Confirmation</span>
                    <ChicTooltip
                      text="Receive instant booking confirmation right after completing your reservation!"
                      title="Instant Confirmation"
                      variant="gold"
                      align="left"
                      position="top"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {!isOptionsLayout && (
            <div className="hidden lg:flex lg:w-[220px] xl:w-[250px] 2xl:w-[270px] lg:shrink-0 min-w-0 flex-col justify-center items-start gap-2 px-3 lg:px-4">
              {firstPromo && renderPromoItem(firstPromo, firstPromoDesc, 'top')}
              {secondPromo && renderPromoItem(secondPromo, secondPromoDesc, 'bottom')}
            </div>
          )}
        </div>

        <div className={`flex ${isOptionsLayout ? 'flex-col' : 'flex-col lg:flex-row'}`}>
          <div className={`flex ${
            isOptionsLayout
              ? 'mx-5 sm:mx-6 md:mx-7 lg:mx-8 mb-4 w-[calc(100%-2.5rem)] sm:w-[calc(100%-3rem)] md:w-[calc(100%-3.5rem)] lg:w-[calc(100%-4rem)]'
              : 'bg-green-100/35 rounded-xl mx-5 lg:mx-0 lg:ml-4 mb-4 w-[calc(100%-2.5rem)] lg:w-auto lg:flex-1 lg:min-w-0'
          }`}>
            {isOptionsLayout ? (
              <div className="w-full px-4 sm:px-6 pt-1 pb-4 min-w-0">
                {/* Header — nothing above What's included */}
                <div className="mb-3">
                  <div className="inline-flex flex-col">
                    <h4 className="text-base sm:text-[17px] md:text-lg font-bold text-emerald-800 tracking-wide">What's included</h4>
                    <span className="mt-1.5 h-[2.5px] w-[calc(100%+20px)] bg-amber-400 rounded-full" />
                  </div>
                </div>

                {/* Inclusions — single column list with unified styling (promos like Free Cancellation & Online Check-in included inside) */}
                <div className="flex flex-col gap-2 mt-1">
                  {optionsInclusions.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 min-w-0">
                      <Check size={14} className="text-emerald-600 shrink-0 stroke-[2.5]" />
                      <span
                        className={`text-xs md:text-sm font-semibold text-gray-700 break-words flex items-center gap-1.5 flex-wrap ${item.tooltip ? 'cursor-pointer hover:text-gray-950 transition-colors' : ''}`}
                        title={item.tooltip || item.text}
                      >
                        <span>{item.text}</span>
                      </span>
                      {item.tooltip && (
                        <ChicTooltip
                          text={item.tooltip}
                          title={item.tooltipTitle || item.text}
                          variant={item.tooltipVariant || 'emerald'}
                          position="top"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="w-[55%] xl:w-[60%] p-2 pt-3 min-w-0">
                  <div className="mb-2">
                    <h4 className="text-base sm:text-[17px] md:text-lg font-bold text-emerald-800 tracking-wide">What is Included!</h4>
                    <div className="mt-2 h-[2.5px] bg-yellow-400 w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-x-1 gap-y-1.5 mt-3">
                    {displayedInclusions.map((inc, i) => {
                      const isDeposit = inc.toLowerCase().includes('deposit');
                      const depositDesc = isDeposit
                        ? (carData.depositTerms || (carData.depositAmount > 0
                          ? `Refundable security deposit (${carData.depositCategory || 'Standard'} category) of ${formatPrice(carData.depositAmount, currencyCode as Currency)} collected at counter upon vehicle pickup and released upon return.`
                          : "No security deposit is required for this vehicle."))
                        : null;
                      const mileageDesc = (carData as any).mileageTooltipMap?.[inc] || null;
                      return (
                        <div key={i} className="flex items-start gap-1.5 min-w-0">
                          <Check size={13} className="text-emerald-600 shrink-0 mt-0.5 md:mt-1 stroke-[2.2]" />
                          <span
                            className={`text-xs md:text-sm font-semibold text-gray-700 break-words flex items-center gap-1.5 flex-wrap ${mileageDesc ? 'cursor-pointer hover:text-gray-950 transition-colors' : ''}`}
                            title={depositDesc || mileageDesc || inc}
                          >
                            <span>{inc}</span>
                          </span>
                          {depositDesc && (
                            <ChicTooltip
                              text={depositDesc}
                              title="Security Deposit"
                              variant="gold"
                              position="top"
                            />
                          )}
                          {mileageDesc && (
                            <ChicTooltip
                              text={mileageDesc}
                              title="Mileage Policy"
                              variant="gold"
                              position="top"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {carData.inclusions.length > 6 && !hideBookingControls && (
                    <button onClick={() => setShowAllInclusions(!showAllInclusions)} className="mt-2 text-xs font-bold text-gray-800 underline hover:text-gray-600">
                      {showAllInclusions ? 'Show Less' : 'Show More +'}
                    </button>
                  )}
                </div>

                <div className="w-[48%] xl:w-[44%] p-2.5 pt-6 xl:pt-10 space-y-2.5 min-w-0 flex flex-col justify-center">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <button
                      type="button"
                      onClick={openMap}
                      className="shrink-0 pt-0.5 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                      title="View location on Google Maps"
                      aria-label="View location on Google Maps"
                    >
                      <Globe size={16} className="text-blue-600 hover:text-blue-700 transition-colors" />
                    </button>
                    <div
                      onClick={openMap}
                      className="flex items-baseline gap-1 min-w-0 cursor-pointer group/addr"
                      title="View location on Google Maps"
                    >
                      <span className="text-xs font-bold text-gray-500 shrink-0">Address: </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs md:text-sm font-black text-gray-800 break-words line-clamp-2 group-hover/addr:text-blue-600 group-hover/addr:underline transition-colors">
                          {displayAddress}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Fuel size={17} className="text-blue-600 shrink-0" />
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold text-gray-500 shrink-0">Fuel Policy: </span>
                      <span className="text-xs md:text-sm font-black text-gray-800 break-words">{carData.fuelPolicy}</span>
                      <ChicTooltip text={getFuelPolicyDescription(carData.fuelPolicy)} title="Fuel Policy" variant="gold" align="right" position="top" />
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 min-w-0">
                    <PickupIcon pickupType={carData.pickupType} />
                    <div className="flex items-baseline gap-1 min-w-0">
                      <span className="text-xs font-bold text-gray-500 shrink-0">Pick-up: </span>
                      <span className="text-xs md:text-sm font-black text-gray-800 break-words"><PickupLabel pickupType={carData.pickupType} /></span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {!isOptionsLayout && (
            <div className="w-full lg:w-[220px] xl:w-[250px] 2xl:w-[270px] lg:shrink-0 p-4 lg:p-5 pt-4 lg:pt-6 flex flex-col lg:items-start items-start justify-center lg:justify-start gap-5 lg:gap-0 self-start">
              {(firstPromo || secondPromo) && (
                <div className="inline-flex lg:hidden flex-wrap gap-2 items-start">
                  {firstPromo && renderPromoItem(firstPromo, firstPromoDesc, 'bottom')}
                  {secondPromo && renderPromoItem(secondPromo, secondPromoDesc, 'bottom')}
                </div>
              )}

              <div className="flex flex-row lg:flex-col items-end lg:items-start justify-between w-full lg:gap-3 mt-auto gap-3">
                <div className="flex flex-col lg:items-start items-start text-left">
                  {originalPriceParts && discountPercent > 0 && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm lg:text-base font-bold text-red-500 line-through decoration-red-500 tracking-tight">
                        {originalPriceParts.currency} {originalPriceParts.amount}
                      </span>
                    </div>
                  )}
                  <div className="text-2xl lg:text-[26px] font-bold text-gray-950 tracking-tight leading-none">
                    {formatPriceParts(carData.price.amount, carData.price.currency as Currency).currency}{' '}
                    {formatPriceParts(carData.price.amount, carData.price.currency as Currency).amount}
                  </div>
                  <span className="text-sm lg:text-[15px] text-gray-600 font-normal block mt-1.5">
                    Total price for {carData.price.totalDays} {carData.price.totalDays === 1 ? 'day' : 'days'}
                  </span>
                  <span className="text-xs text-gray-500 font-medium block mt-0.5">
                    Included taxes &amp; fees
                  </span>
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
                              {availableBranches.find((b: any) => b.id === selectedBranchId)?.normalized_name || availableBranches.find((b: any) => b.id === selectedBranchId)?.name || availableBranches.find((b: any) => b.id === selectedBranchId)?.location || 'Select Branch'}
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
                                    className={`w-full text-left text-xs py-2.5 px-4 transition-colors font-bold ${isSelected
                                        ? 'bg-[var(--primary)] text-gray-900'
                                        : 'text-gray-700 hover:bg-[var(--primary)]/20 hover:text-gray-900'
                                      }`}
                                  >
                                    <span className="font-extrabold">{b.normalized_name || b.name || b.location}</span>
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                    <Link
                      href={bookUrl}
                      onClick={handlePersistVehicle}
                      className="w-auto lg:w-full py-2 lg:py-2.5 px-6 lg:px-0 bg-[var(--primary)] text-gray-900 rounded-xl font-black text-[11px] lg:text-sm uppercase tracking-wide hover:bg-[var(--primary-600)] active:scale-[0.98] transition-all text-center shadow-lg whitespace-nowrap block"
                    >
                      Book Now
                      <span className="sr-only"> for {carData.name}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <RentalTermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        supplierName={carData.supplier?.name}
        rentalTerms={carData.supplier?.rentalTerms}
        rawTerms={rawTerms}
      />
    </motion.div>
  );
}