'use client';

import { Suspense, useEffect, useCallback, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { bookingApi, authApi, extrasPricingApi } from '@/services/api';
import { axiosClient as apiClient } from '@/services/api/axiosClient';
import toast from 'react-hot-toast';
import Stepper from '@/app/search/components/Stepper';
import PickupDropoffCard from '@/components/shared/PickupDropoffCard';
import CarCard from '@/app/search/components/CarCard';
import BookingChecklist from './components/BookingChecklist';
import PriceBreakdownCard from './components/PriceBreakdownCard';
import BookingExtras, { ExtraItem, convertExtraPrice } from './components/BookingExtras';
import FlightDetailsInput from './components/FlightDetailsInput';
import { Check, User, Phone, Globe, Mail, Lock, ChevronDown, AlertTriangle, ArrowLeft, PackageCheck } from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { restoreSearchSession } from '@/store/slices/searchSlice';
import { restoreAuth, logout } from '@/store/slices/authSlice';
import { Vehicle, Currency } from '@/types';
import { worldCountries } from '@/data/worldCountries';
import { getVehicleDisplayPrice } from '@/utils/vehiclePrice';
import { getLogoUrl } from '@/utils/getImageUrl';

// ─── Country codes (same as legacy project) ───────────────────────────────────
const COUNTRY_CODES = [
  { country: 'Algeria', code: '213', iso: 'DZ', flag: '🇩🇿' },
  { country: 'Australia', code: '61', iso: 'AU', flag: '🇦🇺' },
  { country: 'Bahrain', code: '973', iso: 'BH', flag: '🇧🇭' },
  { country: 'Canada', code: '1', iso: 'CA', flag: '🇨🇦' },
  { country: 'Egypt', code: '20', iso: 'EG', flag: '🇪🇬' },
  { country: 'France', code: '33', iso: 'FR', flag: '🇫🇷' },
  { country: 'Germany', code: '49', iso: 'DE', flag: '🇩🇪' },
  { country: 'India', code: '91', iso: 'IN', flag: '🇮🇳' },
  { country: 'Iraq', code: '964', iso: 'IQ', flag: '🇮🇶' },
  { country: 'Jordan', code: '962', iso: 'JO', flag: '🇯🇴' },
  { country: 'Kuwait', code: '965', iso: 'KW', flag: '🇰🇼' },
  { country: 'Lebanon', code: '961', iso: 'LB', flag: '🇱🇧' },
  { country: 'Libya', code: '218', iso: 'LY', flag: '🇱🇾' },
  { country: 'Morocco', code: '212', iso: 'MA', flag: '🇲🇦' },
  { country: 'Oman', code: '968', iso: 'OM', flag: '🇴🇲' },
  { country: 'Pakistan', code: '92', iso: 'PK', flag: '🇵🇰' },
  { country: 'Palestine', code: '970', iso: 'PS', flag: '🇵🇸' },
  { country: 'Qatar', code: '974', iso: 'QA', flag: '🇶🇦' },
  { country: 'Saudi Arabia', code: '966', iso: 'SA', flag: '🇸🇦' },
  { country: 'Syria', code: '963', iso: 'SY', flag: '🇸🇾' },
  { country: 'Tunisia', code: '216', iso: 'TN', flag: '🇹🇳' },
  { country: 'Turkey', code: '90', iso: 'TR', flag: '🇹🇷' },
  { country: 'United Arab Emirates', code: '971', iso: 'AE', flag: '🇦🇪' },
  { country: 'United Kingdom', code: '44', iso: 'GB', flag: '🇬🇧' },
  { country: 'United States', code: '1', iso: 'US', flag: '🇺🇸' },
];

const SUPPORTED_BACKEND_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED', 'QAR', 'OMR', 'KWD', 'BHD',
  'JOD', 'MAD', 'TRY', 'GEL', 'CHF', 'CAD', 'AUD', 'SEK', 'NOK', 'DKK', 'PLN'
];

const DEFAULT_EXTRAS: ExtraItem[] = [
  {
    id: 'additional_driver',
    name: 'Additional Driver',
    description: 'Share the driving with an additional qualified driver on the rental agreement.',
    price: 15.00,
    currency: 'USD',
    type: 'boolean',
    max_qty: 1,
    badge: 'Popular',
  },
  {
    id: 'booster_cushion',
    name: 'Booster Cushion',
    description: 'For older children (approx. 4–11 years, 15–36 kg) to ensure safe seatbelt positioning.',
    price: 10.00,
    currency: 'USD',
    type: 'quantity',
    max_qty: 3,
    badge: null,
  },
  {
    id: 'child_booster_seat',
    name: 'Child Booster Seat',
    description: 'High-back booster seat suitable for children from 15 to 36 kg.',
    price: 12.00,
    currency: 'USD',
    type: 'quantity',
    max_qty: 3,
    badge: 'Family Favorite',
  },
  {
    id: 'infant_seat',
    name: 'Infant Seat',
    description: 'Rear-facing safety seat designed for infants from birth up to 13 kg.',
    price: 15.00,
    currency: 'USD',
    type: 'quantity',
    max_qty: 2,
    badge: null,
  },
  {
    id: 'gps',
    name: 'Navigation System (GPS)',
    description: 'Portable satellite navigation system with up-to-date maps and voice directions.',
    price: 20.00,
    currency: 'USD',
    type: 'boolean',
    max_qty: 1,
    badge: 'Recommended',
  },
  {
    id: 'toddler_seat',
    name: 'Toddler Seat',
    description: 'Forward-facing seat with 5-point harness for toddlers from 9 to 18 kg.',
    price: 12.00,
    currency: 'USD',
    type: 'quantity',
    max_qty: 3,
    badge: null,
  },
];

const extractLaravelError = (errorResponse: any): string => {
  if (!errorResponse) return '';

  if (typeof errorResponse === 'object') {
    return errorResponse.error || errorResponse.message || '';
  }

  if (typeof errorResponse === 'string') {
    if (errorResponse.includes('<!DOCTYPE html>') || errorResponse.includes('html')) {
      const msgMatch = errorResponse.match(/class="exception-message"[^>]*>([\s\S]*?)<\/h2>/i)
        || errorResponse.match(/<h2 class="exception-name[^>]*>([\s\S]*?)<\/h2>/i)
        || errorResponse.match(/class="exception-message-wrapper"[^>]*>([\s\S]*?)<\/div>/i)
        || errorResponse.match(/<title>(.*?)<\/title>/i)
        || errorResponse.match(/<h1>(.*?)<\/h1>/i);
      if (msgMatch) {
        const clean = msgMatch[1].replace(/<[^>]*>/g, '').trim();
        if (clean) return `Server Error: ${clean}`;
      }
    }

    try {
      const parsed = JSON.parse(errorResponse);
      return parsed.error || parsed.message || '';
    } catch {
      // not JSON
    }
  }

  return '';
};

// ─── Main Content ──────────────────────────────────────────────────────────────
function BookingContent() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  const { vehicles, searchParams: searchStateParams, daysNumber, fetchedCurrency } = useSelector((state: RootState) => state.search);
  const { code: currencyCode, allRates } = useSelector((state: RootState) => state.currency);
  const { isAuthenticated, user: loggedInUser } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  // ── Registration form state ──────────────────────────────────────────────────
  const [gender, setGender] = useState('Mr.');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileCode, setMobileCode] = useState('+20');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [flightNumber, setFlightNumber] = useState('');

  // ── Extras & Add-ons state (Passed from /options page) ─────────────────────
  const [extrasList, setExtrasList] = useState<ExtraItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('autours_available_extras');
        if (saved) return JSON.parse(saved);
      } catch { }
    }
    return DEFAULT_EXTRAS;
  });
  const [isEditingExtras, setIsEditingExtras] = useState(false);

  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const currentCarId = searchParams.get('bookId') || searchParams.get('vehicleId');
        const savedCarId = sessionStorage.getItem('autours_extras_vehicle_id');

        const param = searchParams.get('extras');
        if (param) {
          const parsed = JSON.parse(decodeURIComponent(param));
          if (currentCarId) {
            sessionStorage.setItem('autours_extras_vehicle_id', String(currentCarId));
            sessionStorage.setItem('autours_selected_extras', JSON.stringify(parsed));
          }
          return parsed;
        }

        // If saved vehicle ID does not match current vehicle, reset to {}
        if (savedCarId && currentCarId && String(savedCarId) !== String(currentCarId)) {
          sessionStorage.removeItem('autours_selected_extras');
          sessionStorage.removeItem('autours_extras_vehicle_id');
          return {};
        }

        const saved = sessionStorage.getItem('autours_selected_extras');
        if (saved) return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    const param = searchParams.get('extras');
    if (param) {
      try {
        const parsed = JSON.parse(decodeURIComponent(param));
        setSelectedExtras(parsed);
        const currentCarId = searchParams.get('bookId') || searchParams.get('vehicleId');
        if (currentCarId && typeof window !== 'undefined') {
          sessionStorage.setItem('autours_extras_vehicle_id', String(currentCarId));
          sessionStorage.setItem('autours_selected_extras', JSON.stringify(parsed));
        }
      } catch { }
    }
  }, [searchParams]);

  const isCustomer = Boolean(
    isAuthenticated &&
    loggedInUser &&
    loggedInUser.role === 'customer' &&
    email &&
    loggedInUser.email?.toLowerCase().trim() === email.toLowerCase().trim() &&
    (typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null)
  );

  const isManagementAccount = Boolean(
    isAuthenticated &&
    loggedInUser &&
    (loggedInUser.role === 'admin' || loggedInUser.role === 'supplier' || loggedInUser.role === 'active_supplier')
  );

  // Prefill details if already logged in as customer
  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  // ── Profile prefill: only runs for authenticated customers ──────────────────
  const applyProfileData = useCallback((profile: any) => {
    if (!profile) return;
    const nameParts = (profile.name || '').trim().split(/\s+/);
    let title = 'Mr.';
    let fName = '';
    let lName = '';

    const validTitles = ['Mr.', 'Mrs.', 'Miss', 'Ms.', 'Mr', 'Mrs', 'Miss', 'Ms'];
    if (validTitles.includes(nameParts[0])) {
      title = nameParts[0].endsWith('.') || nameParts[0] === 'Miss' ? nameParts[0] : `${nameParts[0]}.`;
      fName = nameParts[1] || '';
      lName = nameParts.slice(2).join(' ') || '';
    } else {
      fName = nameParts[0] || '';
      lName = nameParts.slice(1).join(' ') || '';
    }

    setGender(title);
    setFirstName(fName);
    setLastName(lName);
    setEmail(profile.email || '');
    if (profile.country) setCountry(profile.country);

    const rawPhone = profile.phone_num || profile.phone || '';
    if (rawPhone) {
      const cleaned = rawPhone.trim();
      if (cleaned.startsWith('+')) {
        const matched = COUNTRY_CODES.find(c => cleaned.startsWith(`+${c.code}`));
        if (matched) {
          setMobileCode(`+${matched.code}`);
          setPhone(cleaned.substring(matched.code.length + 1));
        } else {
          setPhone(cleaned);
        }
      } else if (cleaned.startsWith('00')) {
        const matched = COUNTRY_CODES.find(c => cleaned.startsWith(`00${c.code}`));
        if (matched) {
          setMobileCode(`+${matched.code}`);
          setPhone(cleaned.substring(matched.code.length + 2));
        } else {
          setPhone(cleaned);
        }
      } else {
        setPhone(cleaned);
      }
    }
  }, []);

  // Mount-time fetch: only for customer accounts
  useEffect(() => {
    if (isCustomer && loggedInUser) {
      applyProfileData(loggedInUser);
    }
  }, [isCustomer, loggedInUser, applyProfileData]);

  // ── Checkboxes ───────────────────────────────────────────────────────────────
  const [rememberMe, setRememberMe] = useState(true);
  const [rentalTerms, setRentalTerms] = useState(false);
  const [subscribeEmails, setSubscribeEmails] = useState(false);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showMobileCodeDropdown, setShowMobileCodeDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const titleDropdownRef = useRef<HTMLDivElement>(null);
  const mobileCodeDropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (titleDropdownRef.current && !titleDropdownRef.current.contains(e.target as Node)) {
        setShowTitleDropdown(false);
      }
      if (mobileCodeDropdownRef.current && !mobileCodeDropdownRef.current.contains(e.target as Node)) {
        setShowMobileCodeDropdown(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Vehicle selection (locked to prevent re-fetch swaps & restored from session) ─
  const bookId = searchParams.get('bookId');
  const [restoredVehicle, setRestoredVehicle] = useState<Vehicle | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('autours_selected_vehicle');
        if (saved) return JSON.parse(saved);
      } catch { }
    }
    return null;
  });

  const [lockedVehicle, setLockedVehicle] = useState<Vehicle | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('autours_selected_vehicle');
        if (saved) return JSON.parse(saved);
      } catch { }
    }
    return null;
  });
  const hasLockedRef = useRef(false);

  // Restore search session and parameters if page is reloaded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedParamsStr = sessionStorage.getItem('autours_search_params');
        const savedVehicleStr = sessionStorage.getItem('autours_selected_vehicle');
        const savedDays = sessionStorage.getItem('autours_days_number');
        const savedCurr = sessionStorage.getItem('autours_fetched_currency');

        const parsedParams = savedParamsStr ? JSON.parse(savedParamsStr) : null;
        const parsedVehicle = savedVehicleStr ? JSON.parse(savedVehicleStr) : null;
        const parsedDays = savedDays ? parseInt(savedDays, 10) : undefined;

        if (parsedVehicle && !lockedVehicle) {
          const vehicleWithCurr = {
            ...parsedVehicle,
            price_currency: parsedVehicle.price_currency || savedCurr || 'EGP',
          };
          setLockedVehicle(vehicleWithCurr);
          hasLockedRef.current = true;
        }

        if ((!searchStateParams.location || !vehicles.length) && (parsedParams || parsedVehicle)) {
          const vehicleWithCurr = parsedVehicle ? {
            ...parsedVehicle,
            price_currency: parsedVehicle.price_currency || savedCurr || 'EGP',
          } : undefined;
          dispatch(
            restoreSearchSession({
              searchParams: parsedParams || undefined,
              daysNumber: parsedDays || undefined,
              vehicles: vehicleWithCurr ? [vehicleWithCurr] : undefined,
              fetchedCurrency: savedCurr || parsedVehicle?.price_currency || undefined,
            })
          );
        }
      } catch (e) {
        console.error('Failed to restore search session in booking:', e);
      }
    }
  }, [dispatch]);

  // When vehicles list updates (initial load or re-fetch), find/update the selected vehicle
  useEffect(() => {
    if (!vehicles.length) {
      if (!lockedVehicle && restoredVehicle) {
        setLockedVehicle(restoredVehicle);
        hasLockedRef.current = true;
      }
      return;
    }

    if (!hasLockedRef.current) {
      // First time: find by ID, bookId, or branch_vehicle_ids
      let found: Vehicle | null = null;

      // 1. Exact match on vehicleId
      if (vehicleId) {
        found = vehicles.find((v: Vehicle) => v.id.toString() === vehicleId) || null;
      }

      // 2. Exact match on bookId
      if (!found && bookId) {
        found = vehicles.find((v: Vehicle) => v.id.toString() === bookId) || null;
      }

      // 3. Check inside branch_vehicle_ids
      if (!found) {
        for (const v of vehicles) {
          const bvIds = (v as any).branch_vehicle_ids;
          if (!bvIds || typeof bvIds !== 'object') continue;
          const vals = Object.values(bvIds).map((id: any) => String(id));
          if ((vehicleId && vals.includes(vehicleId)) || (bookId && vals.includes(bookId))) {
            found = v;
            break;
          }
        }
      }

      // If URL has vehicleId or bookId, but we didn't find a match yet, do not lock or fallback yet.
      if (!found && (vehicleId || bookId)) {
        return;
      }

      // 4. Fallback: first vehicle
      if (!found) found = vehicles[0];

      if (found) {
        hasLockedRef.current = true;
        setLockedVehicle(found);
      }
    } else {
      // Already locked: update pricing by finding the same car by ID or name + supplier to prevent supplier swaps
      const lockedId = lockedVehicle?.id;
      const lockedName = lockedVehicle?.name;
      const lockedSupplierId = lockedVehicle?.supplier?.id;

      if (lockedName) {
        const updated = vehicles.find((v: Vehicle) =>
          (lockedId && v.id === lockedId) ||
          (v.name === lockedName && v.supplier?.id === lockedSupplierId)
        );
        if (
          updated &&
          (updated.id !== lockedVehicle?.id ||
            updated.final_price !== lockedVehicle?.final_price ||
            updated.price_currency !== lockedVehicle?.price_currency)
        ) {
          setLockedVehicle(updated);
        }
      }
    }
  }, [vehicles, vehicleId, bookId, lockedVehicle, restoredVehicle]);

  const selectedVehicle =
    lockedVehicle ||
    (vehicleId ? vehicles.find((v: Vehicle) => v.id.toString() === vehicleId) : null) ||
    vehicles[0] ||
    restoredVehicle ||
    null;

  // Reset extras if selected vehicle ID differs from saved vehicle ID
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedVehicle?.id) {
      try {
        const savedCarId = sessionStorage.getItem('autours_extras_vehicle_id');
        if (savedCarId && String(savedCarId) !== String(selectedVehicle.id)) {
          sessionStorage.removeItem('autours_selected_extras');
          sessionStorage.removeItem('autours_extras_vehicle_id');
          setSelectedExtras({});
        }
      } catch { }
    }
  }, [selectedVehicle?.id]);

  // Persist selected vehicle and current search params to sessionStorage whenever they change
  useEffect(() => {
    if (selectedVehicle && typeof window !== 'undefined') {
      try {
        const vehicleToSave = {
          ...selectedVehicle,
          price_currency: selectedVehicle.price_currency || fetchedCurrency || 'EGP',
        };
        sessionStorage.setItem('autours_selected_vehicle', JSON.stringify(vehicleToSave));
        if (searchStateParams?.location) {
          sessionStorage.setItem('autours_search_params', JSON.stringify(searchStateParams));
        }
        if (daysNumber) {
          sessionStorage.setItem('autours_days_number', String(daysNumber));
        }
        if (vehicleToSave.price_currency || fetchedCurrency) {
          sessionStorage.setItem('autours_fetched_currency', vehicleToSave.price_currency || fetchedCurrency || 'EGP');
        }
      } catch (e) { }
    }
  }, [selectedVehicle, searchStateParams, daysNumber, fetchedCurrency]);

  // Compute reliable rental days (never 0)
  const rentalDays = useMemo(() => {
    if (daysNumber && daysNumber > 0) return daysNumber;
    if (searchStateParams?.dateFrom && searchStateParams?.dateTo) {
      const start = new Date(searchStateParams.dateFrom).getTime();
      const end = new Date(searchStateParams.dateTo).getTime();
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (diff > 0) return diff;
    }
    if (typeof window !== "undefined") {
      try {
        const savedParams = sessionStorage.getItem("autours_search_params");
        if (savedParams) {
          const parsed = JSON.parse(savedParams);
          if (parsed.dateFrom && parsed.dateTo) {
            const start = new Date(parsed.dateFrom).getTime();
            const end = new Date(parsed.dateTo).getTime();
            const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (diff > 0) return diff;
          }
        }
      } catch { }
    }
    return 1;
  }, [daysNumber, searchStateParams]);

  // ── Fetch supplier/branch/country customized extras pricing ──────────────────
  useEffect(() => {
    if (!selectedVehicle && !vehicleId && !bookId) return;

    const supplierId =
      selectedVehicle?.supplier?.id ||
      selectedVehicle?.supplier_id ||
      (typeof (selectedVehicle as any)?.supplier === "number"
        ? (selectedVehicle as any).supplier
        : undefined);

    const actualVehicleToBook = bookId || selectedVehicle?.id?.toString() || vehicleId || "";

    const availableBranches = (selectedVehicle as any)?.available_branches || [];
    const branchVehicleIds = (selectedVehicle as any)?.branch_vehicle_ids || {};
    let resolvedBranchId: number | string | undefined = undefined;

    if (actualVehicleToBook && Object.keys(branchVehicleIds).length > 0) {
      const match = Object.entries(branchVehicleIds).find(
        ([_, vId]) => String(vId) === String(actualVehicleToBook)
      );
      if (match) resolvedBranchId = Number(match[0]);
    }
    if (!resolvedBranchId) {
      resolvedBranchId =
        (selectedVehicle as any)?.branch?.id ||
        (selectedVehicle as any)?.pickup_loc ||
        (selectedVehicle as any)?.branch_id ||
        availableBranches[0]?.id;
    }

    const country =
      (selectedVehicle as any)?.branch?.country ||
      availableBranches[0]?.country ||
      (searchStateParams as any)?.country;

    const currentVehicleId = selectedVehicle?.id || vehicleId || undefined;

    extrasPricingApi
      .getPricing({
        supplier_id: supplierId,
        branch_id: resolvedBranchId,
        country: country,
        vehicle_id: currentVehicleId ?? undefined,
      })
      .then((res: any) => {
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res)
              ? res
              : [];
        setExtrasList(items);
      })
      .catch(() => {
        // Keep fallback
      });
  }, [selectedVehicle, bookId, vehicleId, (searchStateParams as any)?.country]);

  // ── Price calculation ────────────────────────────────────────────────────────
  const baseVehiclePrice = selectedVehicle
    ? getVehicleDisplayPrice(selectedVehicle, currencyCode as Currency, allRates, rentalDays, fetchedCurrency)
    : 0;
  const dailyPrice = Math.round(baseVehiclePrice / rentalDays);

  // Calculate selected extras total (flat fee per entire rental)
  const extrasTotalPriceRaw = extrasList.reduce((acc, extra) => {
    const extraId = extra.key || extra.id;
    const qty = selectedExtras[extraId] || 0;
    if (qty > 0) {
      const basePrice = extra.price !== undefined ? extra.price : (extra.price_usd || 0);
      const baseCurrency = extra.currency || "USD";
      const unitPrice = convertExtraPrice(basePrice, baseCurrency, currencyCode, allRates);
      return acc + (unitPrice * qty);
    }
    return acc;
  }, 0);
  const extrasTotalPrice = Math.round(extrasTotalPriceRaw * 100) / 100;
  const grandTotalPrice = Math.round((baseVehiclePrice + extrasTotalPrice) * 100) / 100;

  const itemizedExtras = useMemo(() => {
    return extrasList
      .filter((ex) => (selectedExtras[ex.key || ex.id] || 0) > 0)
      .map((ex) => {
        const qty = selectedExtras[ex.key || ex.id];
        const basePrice = ex.price !== undefined ? ex.price : (ex.price_usd || 0);
        const baseCurrency = ex.currency || "USD";
        const itemTotal = convertExtraPrice(basePrice, baseCurrency, currencyCode, allRates) * qty;
        return {
          id: ex.key || ex.id,
          name: ex.name,
          qty,
          totalPrice: itemTotal,
        };
      });
  }, [extrasList, selectedExtras, currencyCode, allRates]);



  // ── Extra change handler ─────────────────────────────────────────────────────
  const handleExtraChange = (id: string, qty: number) => {
    setSelectedExtras(prev => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[id];
      } else {
        next[id] = qty;
      }
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("autours_selected_extras", JSON.stringify(next));
          const currentCarId = searchParams.get('bookId') || searchParams.get('vehicleId') || selectedVehicle?.id;
          if (currentCarId) {
            sessionStorage.setItem("autours_extras_vehicle_id", String(currentCarId));
          }
        } catch (e) { }
      }
      return next;
    });
  };

  // ── Register then Book ───────────────────────────────────────────────────────
  const handleBook = async () => {
    // Check if logged in as admin or supplier
    if (isManagementAccount) {
      toast.error(
        `Management accounts (${loggedInUser?.role === 'admin' ? 'Administrator' : 'Company/Supplier'}) cannot book cars. Please log out and use a Customer account.`
      );
      return;
    }

    // Validate
    if (!gender) { toast.error('Please select a title (Mr/Mrs/Miss/Ms)'); return; }
    if (!firstName.trim()) { toast.error('Please enter your first name'); return; }
    if (!lastName.trim()) { toast.error('Please enter your last name'); return; }
    if (!mobileCode) { toast.error('Please select phone code'); return; }
    if (!phone.trim()) { toast.error('Please enter a valid phone number'); return; }
    if (!country) { toast.error('Please select your country'); return; }
    if (!email.trim()) { toast.error('Please enter a valid email'); return; }
    if (!isCustomer && !password.trim()) { toast.error('Please enter a password'); return; }
    if (!rentalTerms) { toast.error('Please approve the rental terms'); return; }
    if (!selectedVehicle) { toast.error('No vehicle selected'); return; }
    if (!searchStateParams.dateFrom || !searchStateParams.dateTo) {
      toast.error('Missing booking dates'); return;
    }

    setIsSubmitting(true);
    try {
      let customerToken = isCustomer
        ? (localStorage.getItem('token') || sessionStorage.getItem('token'))
        : null;

      if (!isCustomer || !customerToken) {
        // Step 1: Try Logging In first (in case user already has an account)
        let authSuccessful = false;
        try {
          const loginRes: any = await authApi.login({
            email: email.trim(),
            password: password.trim(),
          });

          if (loginRes && (loginRes.status === true || loginRes.token)) {
            const user = loginRes.user || loginRes.data;
            // Ensure logged in account is a customer
            if (user && (user.role === 'admin' || user.role === 'supplier' || user.role === 'active_supplier')) {
              toast.error('The account associated with this email is a Management/Company account. Car bookings can only be placed by Customer accounts.');
              setIsSubmitting(false);
              return;
            }

            customerToken = loginRes.token;
            if (customerToken) {
              localStorage.setItem('token', customerToken);
              sessionStorage.setItem('token', customerToken);
              document.cookie = `token=${customerToken};path=/;max-age=2592000;SameSite=Lax`;
              apiClient.defaults.headers.common['Authorization'] = `Bearer ${customerToken}`;
            }
            if (user) {
              localStorage.setItem('user', JSON.stringify(user));
              sessionStorage.setItem('user', JSON.stringify(user));
            }
            dispatch(restoreAuth());
            authSuccessful = true;
          }
        } catch (loginErr: any) {
          // Login failed (e.g. invalid credentials or new user) — will attempt registration next
        }

        // If not authenticated via login, attempt registration for new customer
        if (!authSuccessful) {
          try {
            const combinedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();
            const regRes: any = await apiClient.post('/post/user/data', {
              name: combinedFullName,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              full_name: combinedFullName,
              gender,
              phone: phone.trim(),
              mobile_code: mobileCode,
              country,
              email: email.trim(),
              password: password.trim(),
              user_type: 'customer',
              supplier: 0,
            });

            if (!regRes?.status) {
              const errText = extractLaravelError(regRes);
              if (errText.toLowerCase().includes('already been taken') || errText.toLowerCase().includes('taken')) {
                toast.error('This email already has an account, but the password was incorrect. Please enter your correct password.');
              } else {
                toast.error(errText || 'Registration failed');
              }
              setIsSubmitting(false);
              return;
            }

            customerToken = regRes?.data?.token || regRes?.token;
            const user = regRes?.data?.user || regRes?.user;
            if (customerToken) {
              localStorage.setItem('token', customerToken);
              sessionStorage.setItem('token', customerToken);
              document.cookie = `token=${customerToken};path=/;max-age=2592000;SameSite=Lax`;
              apiClient.defaults.headers.common['Authorization'] = `Bearer ${customerToken}`;
            }
            if (user) {
              localStorage.setItem('user', JSON.stringify(user));
              sessionStorage.setItem('user', JSON.stringify(user));
            }
            dispatch(restoreAuth());
          } catch (regErr: any) {
            const errText = extractLaravelError(regErr?.response?.data) || regErr?.message || '';
            if (errText.toLowerCase().includes('already been taken') || errText.toLowerCase().includes('taken')) {
              toast.error('This email already has an account, but the password was incorrect. Please enter your correct password.');
            } else {
              toast.error(errText || 'Registration failed');
            }
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Step 2: Prepare formatted extras and book vehicle
      const formattedExtras = extrasList
        .filter((e) => (selectedExtras[e.key || e.id] || 0) > 0)
        .map((e) => {
          const extraId = e.key || e.id;
          const qty = selectedExtras[extraId];
          const basePrice = e.price !== undefined ? e.price : (e.price_usd || 0);
          const baseCurrency = e.currency || "USD";
          const unitPrice = convertExtraPrice(basePrice, baseCurrency, currencyCode, allRates);
          return {
            id: extraId,
            name: e.name,
            qty: qty,
            price: basePrice,
            base_currency: baseCurrency,
            unit_price: unitPrice,
            total_price: unitPrice * qty,
            currency: currencyCode,
          };
        });

      const backendCurrency = SUPPORTED_BACKEND_CURRENCIES.includes(currencyCode) ? currencyCode : 'AED';
      const actualVehicleToBook = searchParams.get('bookId') || selectedVehicle.id;
      const driverAge = searchParams.get('driver_age') || searchParams.get('age') || (searchStateParams.driverAge ? String(searchStateParams.driverAge) : '30');
      const residenceCountry = searchParams.get('residence_country') || searchParams.get('countryName') || searchStateParams.residenceCountry || 'United Arab Emirates';

      const combinedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      await toast.promise(
        bookingApi.create({
          id: actualVehicleToBook,
          pickupLoc: searchStateParams.location,
          date_from: searchStateParams.dateFrom,
          date_to: searchStateParams.dateTo,
          time_from: searchStateParams.startTime || '10:00',
          time_to: searchStateParams.endTime || '10:00',
          currency: backendCurrency,
          vehicle: actualVehicleToBook,
          price: grandTotalPrice,
          driver_age: driverAge,
          residence_country: residenceCountry,
          flight_number: flightNumber.trim() || undefined,
          extras: formattedExtras.length > 0 ? formattedExtras : undefined,
          extras_price: extrasTotalPrice,
          // Driver details sent to backend
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          name: combinedFullName,
          gender: gender,
          phone: `${mobileCode}${phone.trim()}`,
        }),
        {
          loading: 'Processing your booking...',
          success: 'Booking placed successfully! 🎉',
          error: (err: any) => extractLaravelError(err?.response?.data) || err?.message || 'Failed to create booking.',
        }
      );

      router.push('/profile');
    } catch (e: any) {
      const msg = extractLaravelError(e?.response?.data) || e?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
      console.error('Booking error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  const actualVehicleToBook = searchParams.get('bookId') || selectedVehicle?.id?.toString() || vehicleId || '';

  const selectedExtrasCount = Object.values(selectedExtras).filter(q => q > 0).length;

  return (
    <>
      <Stepper
        currentStep={4}
        vehicleId={vehicleId || selectedVehicle?.id}
        bookId={actualVehicleToBook}
        hasExtras={(selectedVehicle as any)?.has_extras}
      />
      <div className="max-w-[1400px] xl:max-w-[90rem] 2xl:max-w-[95rem] mx-auto px-4 py-8">

        {/* Back Link */}
        <div className="mb-4">
          {(selectedVehicle as any)?.has_extras === false ? (
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-primary group-hover:text-gray-900 flex items-center justify-center transition-colors">
                <ArrowLeft size={14} />
              </div>
              <span>Back to Search Results</span>
            </Link>
          ) : (
            <Link
              href={`/options?vehicleId=${vehicleId || selectedVehicle?.id}&bookId=${actualVehicleToBook}&extras=${encodeURIComponent(JSON.stringify(selectedExtras))}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-primary group-hover:text-gray-900 flex items-center justify-center transition-colors">
                <ArrowLeft size={14} />
              </div>
              <span>Back to Extras &amp; Options</span>
            </Link>
          )}
        </div>

        {/* Mobile Car Card */}
        <div className="lg:hidden mb-6 space-y-4">
          {selectedVehicle && (
            <CarCard vehicle={selectedVehicle} daysNumber={rentalDays} hideBookingControls={true} preselectedBookId={actualVehicleToBook} />
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT SIDEBAR: Matches Search Page Width Identically ────────────────────────── */}
          <aside className="hidden lg:block lg:w-[250px] xl:w-[280px] 2xl:w-[320px] shrink-0 space-y-4">
            {/* 1. Pick-up and drop-off Card First */}
            <PickupDropoffCard
              pickupDate={searchStateParams.dateFrom}
              pickupTime={searchStateParams.startTime || '10:00'}
              dropoffDate={searchStateParams.dateTo}
              dropoffTime={searchStateParams.endTime || '10:00'}
              pickupBranch={(selectedVehicle as any)?.branch}
              dropoffBranch={(selectedVehicle as any)?.branch}
              fallbackLocation={searchStateParams.locationLabel || searchStateParams.location || 'Selected Location'}
              supplierName={selectedVehicle?.supplier?.name}
            />

            {/* 2. Price Breakdown Card (Invoice) Underneath */}
            <PriceBreakdownCard
              rentalDays={rentalDays}
              currencyCode={currencyCode}
              baseVehiclePrice={baseVehiclePrice}
              extrasItems={itemizedExtras}
              grandTotalPrice={grandTotalPrice}
              onRemoveExtra={(id) => handleExtraChange(String(id), 0)}
            />

            {/* 3. Supplier Logo Card Under Invoice (Desktop only) */}
            {selectedVehicle?.supplier?.logo && (
              <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs flex items-center justify-center">
                <img
                  src={getLogoUrl(selectedVehicle.supplier.logo)}
                  alt={`${selectedVehicle.supplier.name || 'Supplier'} Logo`}
                  className="max-h-14 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).closest('div.rounded-2xl')?.remove();
                  }}
                />
              </div>
            )}
          </aside>

          {/* ── RIGHT CONTENT: Matches Search Page Width Identically ───────────────────── */}
          <div className="flex-1 w-full min-w-0 space-y-4">

            {/* Desktop Car Card */}
            <div className="hidden lg:block">
              {selectedVehicle ? (
                <CarCard vehicle={selectedVehicle} daysNumber={rentalDays} hideBookingControls={true} preselectedBookId={actualVehicleToBook} />
              ) : (
                <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center text-gray-500">
                  No vehicle selected.
                </div>
              )}
            </div>

            {/* ── 1. Extras & Add-ons Section (Moved BEFORE Checklist, with In-Place Editing) ── */}
            {isEditingExtras ? (
              <div className="bg-white rounded-2xl border-2 border-primary/50 p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 text-gray-950 flex items-center justify-center shrink-0">
                      <PackageCheck size={18} className="stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-gray-900">
                        Choose &amp; Modify Add-ons
                      </h4>
                      <p className="text-xs text-gray-500">
                        Select extras for this vehicle — your total price and invoice update in real-time
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingExtras(false)}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-600 text-gray-950 font-bold text-xs transition-all shadow-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>

                {extrasList.length > 0 ? (
                  <BookingExtras
                    extras={extrasList}
                    selectedExtras={selectedExtras}
                    onChangeExtra={handleExtraChange}
                    currencyCode={currencyCode}
                    allRates={allRates}
                  />
                ) : (
                  <div className="py-6 text-center text-xs text-gray-500 font-medium">
                    No add-ons available for this vehicle.
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-gray-500 font-medium">
                    {selectedExtrasCount} extra{selectedExtrasCount === 1 ? "" : "s"} selected
                    {extrasTotalPrice > 0 && ` (+${extrasTotalPrice.toFixed(2)} ${currencyCode})`}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingExtras(false)}
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-gray-950 font-black text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : selectedExtrasCount > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/20 text-gray-950 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                    <PackageCheck size={19} className="stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2">
                      <h4 className="text-sm font-black text-gray-900 whitespace-nowrap">
                        Selected Add-ons ({selectedExtrasCount})
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 whitespace-nowrap shrink-0">
                        Included in Total Price
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                      {extrasList
                        .filter((ex) => (selectedExtras[ex.key || ex.id] || 0) > 0)
                        .map((ex) => {
                          const qty = selectedExtras[ex.key || ex.id];
                          const basePrice = ex.price !== undefined ? ex.price : (ex.price_usd || 0);
                          const baseCurrency = ex.currency || "USD";
                          const itemTotal = convertExtraPrice(basePrice, baseCurrency, currencyCode, allRates) * qty;
                          return (
                            <span
                              key={ex.key || ex.id}
                              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold max-w-full"
                            >
                              <span className="text-emerald-600 font-black shrink-0">✓</span>
                              <span className="truncate">{ex.name} {qty > 1 ? `(x${qty})` : ""}</span>
                              <span className="text-gray-400 font-semibold shrink-0">• {itemTotal.toFixed(2)} {currencyCode}</span>
                            </span>
                          );
                        })}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingExtras(true)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl border-2 border-primary hover:bg-primary text-gray-950 font-black text-xs transition-all cursor-pointer shadow-xs whitespace-nowrap text-center flex items-center justify-center shrink-0"
                >
                  Change Extras
                </button>
              </div>
            ) : (selectedVehicle as any)?.has_extras !== false ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 text-gray-900 flex items-center justify-center shrink-0">
                    <PackageCheck size={16} />
                  </div>
                  <span className="text-gray-600 font-medium">
                    Need child seats, an additional driver, or a GPS system?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingExtras(true)}
                  className="w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-xl bg-primary hover:bg-primary-600 text-gray-900 font-black text-xs transition-colors shrink-0 whitespace-nowrap cursor-pointer shadow-2xs text-center flex items-center justify-center"
                >
                  + Add Extras
                </button>
              </div>
            ) : null}

            {/* ── 2. Checklist Before Pick-up Section ───────────────────────────── */}
            <BookingChecklist
              pickupTime={searchStateParams.startTime || '10:00'}
              depositAmount={selectedVehicle?.deposit}
              currencyCode={currencyCode}
            />

            {/* ── Mobile/Tablet: Pick-up & Invoice (Price Breakdown) BEFORE Data Form ── */}
            <div className="lg:hidden space-y-4">
              {/* 1. Pick-up and Drop-off Card First */}
              <PickupDropoffCard
                pickupDate={searchStateParams.dateFrom}
                pickupTime={searchStateParams.startTime || '10:00'}
                dropoffDate={searchStateParams.dateTo}
                dropoffTime={searchStateParams.endTime || '10:00'}
                pickupBranch={(selectedVehicle as any)?.branch}
                dropoffBranch={(selectedVehicle as any)?.branch}
                fallbackLocation={searchStateParams.locationLabel || searchStateParams.location || 'Selected Location'}
                supplierName={selectedVehicle?.supplier?.name}
              />

              {/* 2. Price Breakdown / Invoice Card Underneath */}
              <PriceBreakdownCard
                rentalDays={rentalDays}
                currencyCode={currencyCode}
                baseVehiclePrice={baseVehiclePrice}
                extrasItems={itemizedExtras}
                grandTotalPrice={grandTotalPrice}
                onRemoveExtra={(id) => handleExtraChange(String(id), 0)}
              />
            </div>

            {/* ── 3. Registration & Flight Details Form ─────────────────────────── */}
            <div className="bg-white rounded-[2rem] p-5 md:p-8 border border-gray-100 shadow-sm">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shrink-0">
                    <User size={16} className="text-gray-900" />
                  </div>
                  <div className="inline-flex flex-col">
                    <h2 className="text-base sm:text-[17px] md:text-lg font-bold tracking-wide text-gray-900">
                      Driver Details
                    </h2>
                    <span className="mt-1 block h-[2.5px] w-full rounded-full bg-amber-400" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-11">
                  Complete your details and flight info to confirm your reservation
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ── Management Account Alert Banner ───────────────────────────── */}
                {isManagementAccount && (
                  <div className="md:col-span-2 p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3.5 text-amber-900 shadow-sm">
                    <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={22} />
                    <div className="flex-1 text-xs sm:text-sm">
                      <p className="font-bold text-amber-950 text-sm sm:text-base">
                        {loggedInUser?.role === 'admin' ? 'Administrator Account' : 'Company / Supplier Account'} ({loggedInUser?.email})
                      </p>
                      <p className="text-amber-800 mt-1 leading-relaxed">
                        Car rental bookings can only be placed by <strong>Customer</strong> accounts. Company and Administrator accounts are not permitted to book vehicles.
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => dispatch(logout())}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                        >
                          Log Out to Book as Customer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Row 1: Title + First Name + Last Name */}
                <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex gap-3 sm:contents">
                    {/* Custom Title Dropdown (compact width, centered text, Mr / Mrs / Miss / Ms) */}
                    <div ref={titleDropdownRef} className="w-[82px] shrink-0 relative">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 text-center">Title</label>
                      <button
                        type="button"
                        onClick={() => setShowTitleDropdown(!showTitleDropdown)}
                        className="w-full flex items-center justify-between pl-3 pr-2 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-xs sm:text-sm font-semibold text-gray-900 bg-white transition-all cursor-pointer shadow-2xs hover:border-gray-300"
                      >
                        <span className="flex-1 text-center font-bold">{gender}</span>
                        <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-200 ${showTitleDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showTitleDropdown && (
                        <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-150 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                          {['Mr.', 'Mrs.', 'Miss', 'Ms.'].map((title) => {
                            const isSelected = gender === title;
                            return (
                              <button
                                key={title}
                                type="button"
                                onClick={() => {
                                  setGender(title);
                                  setShowTitleDropdown(false);
                                }}
                                className={`w-full text-center py-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-400/20 text-gray-950 font-black'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-950'
                                }`}
                              >
                                {title}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* First Name (smaller box) */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">First Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First name..."
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Last Name (smaller box) */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Last Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name..."
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Custom Phone Code Dropdown + Phone Input */}
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <div className="flex gap-2.5">
                    {/* Custom Phone Code Dropdown */}
                    <div ref={mobileCodeDropdownRef} className="relative w-36 sm:w-40 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowMobileCodeDropdown(!showMobileCodeDropdown)}
                        className="w-full flex items-center justify-between gap-1.5 pl-3 pr-2.5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-xs sm:text-sm font-semibold text-gray-900 bg-white transition-all cursor-pointer shadow-2xs hover:border-gray-300"
                      >
                        <span className="truncate text-left font-bold text-gray-900">
                          {mobileCode} ({COUNTRY_CODES.find(c => `+${c.code}` === mobileCode)?.country || ''})
                        </span>
                        <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-200 ${showMobileCodeDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showMobileCodeDropdown && (
                        <div className="absolute top-full left-0 mt-1.5 w-60 sm:w-64 bg-white border border-gray-150 rounded-xl shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                          {COUNTRY_CODES.map((c) => {
                            const isSelected = mobileCode === `+${c.code}`;
                            return (
                              <button
                                key={`${c.iso}-${c.code}`}
                                type="button"
                                onClick={() => {
                                  setMobileCode(`+${c.code}`);
                                  setShowMobileCodeDropdown(false);
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer text-left ${
                                  isSelected
                                    ? 'bg-amber-400/15 text-gray-950 font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-950'
                                }`}
                              >
                                <span className="truncate">
                                  <span className="font-bold text-gray-900">+{c.code}</span>
                                  <span className="text-gray-500 ml-1.5 font-normal">({c.country})</span>
                                </span>
                                {isSelected && <Check size={14} className="text-amber-600 shrink-0 stroke-[2.5]" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Phone number..."
                      className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Country (half-width box) */}
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Country</label>
                  <div ref={countryDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-medium text-gray-900 bg-white cursor-pointer shadow-2xs hover:border-gray-300 transition-all"
                    >
                      <span className="flex items-center gap-2 text-left truncate">
                        <Globe size={16} className="text-gray-400 shrink-0" />
                        <span className={country ? 'text-gray-900 truncate font-semibold' : 'text-gray-400'}>
                          {country || 'Select country...'}
                        </span>
                      </span>
                      <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-200 ${showCountryDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-gray-150 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-150">
                        {worldCountries.map((c) => {
                          const isSelected = country === c.name;
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => { setCountry(c.name); setShowCountryDropdown(false); }}
                              className={`w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer text-left ${
                                isSelected ? 'bg-amber-400/15 text-gray-950 font-bold' : 'text-gray-700'
                              }`}
                            >
                              <span>{c.name}</span>
                              {isSelected && <Check size={14} className="text-amber-600 shrink-0 stroke-[2.5]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email + Password */}
                <div className={`md:col-span-2 grid grid-cols-1 ${isCustomer ? "grid-cols-1" : "md:grid-cols-2"} gap-4`}>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E-mail..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  {!isCustomer && (
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Account password..."
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Flight Details (Optional) ─────────────────────────────────── */}
                <div className="md:col-span-2 pt-2 border-t border-gray-100">
                  <FlightDetailsInput
                    value={flightNumber}
                    onChange={setFlightNumber}
                  />
                </div>

                {/* ── Checkboxes ────────────────────────────────────────────────── */}
                <div className="pt-4 border-t border-gray-100 space-y-4 md:col-span-2">

                  <CheckboxItem
                    checked={rememberMe}
                    onChange={setRememberMe}
                    label="Remember me on this device."
                  />

                  <CheckboxItem
                    checked={rentalTerms}
                    onChange={setRentalTerms}
                    label={
                      <>
                        I confirm that I have read, understood, and agree with the{' '}
                        <a href="#" className="text-blue-600 hover:underline font-semibold">Rental Terms</a>
                        {' '}&amp;{' '}
                        <a href="#" className="text-blue-600 hover:underline font-semibold">Autours Terms</a>.
                      </>
                    }
                  />

                  <CheckboxItem
                    checked={subscribeEmails}
                    onChange={setSubscribeEmails}
                    label="Subscribe me to promotional emails."
                  />
                </div>

                {/* ── Submit Button ─────────────────────────────────────────────── */}
                <div className="pt-2 md:col-span-2">
                  <button
                    onClick={handleBook}
                    disabled={isSubmitting || isManagementAccount}
                    className="w-full py-4 px-8 bg-primary text-gray-900 rounded-xl font-black text-[16px] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/10 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : isManagementAccount ? (
                      'Cannot Book with Management Account'
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Reusable Checkbox ─────────────────────────────────────────────────────────
function CheckboxItem({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-300 group-hover:border-primary transition-colors bg-white shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer opacity-0 absolute inset-0 cursor-pointer"
        />
        <Check
          size={13}
          className="text-gray-900 opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3px]"
        />
      </div>
      <span className="text-[14px] font-medium text-gray-700 select-none leading-relaxed">
        {label}
      </span>
    </label>
  );
}

// ─── Page Wrapper ──────────────────────────────────────────────────────────────
export default function BookingPage() {
  return (
    <main className="min-h-screen bg-[#fcfcfc]">
      <Navbar />
      <Suspense fallback={<div className="p-20 text-center text-gray-400">Loading...</div>}>
        <BookingContent />
      </Suspense>
      <Footer />
    </main>
  );
}
