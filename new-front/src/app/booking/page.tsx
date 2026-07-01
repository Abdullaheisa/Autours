'use client';

import { Suspense, useEffect, useCallback, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { useRouter } from 'next/navigation';
import { bookingApi, authApi } from '@/services/api';
import { axiosClient as apiClient } from '@/services/api/axiosClient';
import toast from 'react-hot-toast';
import Stepper from '@/app/search/components/Stepper';
import SearchSummary from '@/app/search/components/SearchSummary';
import CarCard from '@/app/search/components/CarCard';
import { Check, User, Phone, Globe, Mail, Lock, ChevronDown } from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { fetchVehicles } from '@/store/slices/searchSlice';
import { restoreAuth } from '@/store/slices/authSlice';
import { Vehicle, Currency } from '@/types';
import { worldCountries } from '@/data/worldCountries';
import { getVehicleDisplayPrice } from '@/utils/vehiclePrice';

// ─── Country codes (same as legacy project) ───────────────────────────────────
const COUNTRY_CODES = [
  { country: 'Algeria',              code: '213', iso: 'DZ', flag: '🇩🇿' },
  { country: 'Australia',            code: '61',  iso: 'AU', flag: '🇦🇺' },
  { country: 'Bahrain',              code: '973', iso: 'BH', flag: '🇧🇭' },
  { country: 'Canada',               code: '1',   iso: 'CA', flag: '🇨🇦' },
  { country: 'Egypt',                code: '20',  iso: 'EG', flag: '🇪🇬' },
  { country: 'France',               code: '33',  iso: 'FR', flag: '🇫🇷' },
  { country: 'Germany',              code: '49',  iso: 'DE', flag: '🇩🇪' },
  { country: 'India',                code: '91',  iso: 'IN', flag: '🇮🇳' },
  { country: 'Iraq',                 code: '964', iso: 'IQ', flag: '🇮🇶' },
  { country: 'Jordan',               code: '962', iso: 'JO', flag: '🇯🇴' },
  { country: 'Kuwait',               code: '965', iso: 'KW', flag: '🇰🇼' },
  { country: 'Lebanon',              code: '961', iso: 'LB', flag: '🇱🇧' },
  { country: 'Libya',                code: '218', iso: 'LY', flag: '🇱🇾' },
  { country: 'Morocco',              code: '212', iso: 'MA', flag: '🇲🇦' },
  { country: 'Oman',                 code: '968', iso: 'OM', flag: '🇴🇲' },
  { country: 'Pakistan',             code: '92',  iso: 'PK', flag: '🇵🇰' },
  { country: 'Palestine',            code: '970', iso: 'PS', flag: '🇵🇸' },
  { country: 'Qatar',                code: '974', iso: 'QA', flag: '🇶🇦' },
  { country: 'Saudi Arabia',         code: '966', iso: 'SA', flag: '🇸🇦' },
  { country: 'Syria',                code: '963', iso: 'SY', flag: '🇸🇾' },
  { country: 'Tunisia',              code: '216', iso: 'TN', flag: '🇹🇳' },
  { country: 'Turkey',               code: '90',  iso: 'TR', flag: '🇹🇷' },
  { country: 'United Arab Emirates', code: '971', iso: 'AE', flag: '🇦🇪' },
  { country: 'United Kingdom',       code: '44',  iso: 'GB', flag: '🇬🇧' },
  { country: 'United States',        code: '1',   iso: 'US', flag: '🇺🇸' },
];

const SUPPORTED_BACKEND_CURRENCIES = ['USD', 'EGP', 'SAR', 'AED', 'QAR', 'OMR', 'KWD', 'BHD', 'JOD'];

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
  const [fullName, setFullName] = useState('');
  const [mobileCode, setMobileCode] = useState('+20');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //Prefill details if already logged in
  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  // Direct mount-time API fetch using authApi.getProfile() to bypass stale session/Redux states!
  useEffect(() => {
    const fetchFreshProfile = async () => {
      if (isAuthenticated) {
        try {
          const res: any = await authApi.getProfile();
          const profile = res?.data || res;
          if (profile) {
            const nameParts = (profile.name || '').split(' ');
            const title = nameParts[0] === 'Mr.' || nameParts[0] === 'Mrs.' ? nameParts[0] : 'Mr.';
            const name = nameParts[0] === 'Mr.' || nameParts[0] === 'Mrs.' ? nameParts.slice(1).join(' ') : (profile.name || '');
            
            setGender(title);
            setFullName(name);
            setEmail(profile.email || '');
            if (profile.country) {
              setCountry(profile.country);
            }

            const rawUserPhone = profile.phone_num || profile.phone || '';
            if (rawUserPhone) {
              const cleanedPhone = rawUserPhone.trim();
              if (cleanedPhone.startsWith('+')) {
                const matchedCodeObj = COUNTRY_CODES.find(c => cleanedPhone.startsWith(`+${c.code}`));
                if (matchedCodeObj) {
                  setMobileCode(`+${matchedCodeObj.code}`);
                  setPhone(cleanedPhone.substring(matchedCodeObj.code.length + 1));
                } else {
                  setPhone(cleanedPhone);
                }
              } else if (cleanedPhone.startsWith('00')) {
                const matchedCodeObj = COUNTRY_CODES.find(c => cleanedPhone.startsWith(`00${c.code}`));
                if (matchedCodeObj) {
                  setMobileCode(`+${matchedCodeObj.code}`);
                  setPhone(cleanedPhone.substring(matchedCodeObj.code.length + 2));
                } else {
                  setPhone(cleanedPhone);
                }
              } else {
                setPhone(cleanedPhone);
              }
            }
          }
        } catch (error) {
          console.warn("Failed to fetch fresh profile at booking mount, using loggedInUser fallback:", error);
        }
      } else if (loggedInUser) {
        // Fallback for offline/redux state if getProfile is not ready yet
        const nameParts = loggedInUser.name.split(' ');
        const title = nameParts[0] === 'Mr.' || nameParts[0] === 'Mrs.' ? nameParts[0] : 'Mr.';
        const name = nameParts[0] === 'Mr.' || nameParts[0] === 'Mrs.' ? nameParts.slice(1).join(' ') : loggedInUser.name;
        
        setGender(title);
        setFullName(name);
        setEmail(loggedInUser.email || '');
        if (loggedInUser.country) {
          setCountry(loggedInUser.country);
        }

        const rawUserPhone = (loggedInUser as any).phone_num || (loggedInUser as any).phone || '';
        if (rawUserPhone) {
          const cleanedPhone = rawUserPhone.trim();
          if (cleanedPhone.startsWith('+')) {
            const matchedCodeObj = COUNTRY_CODES.find(c => cleanedPhone.startsWith(`+${c.code}`));
            if (matchedCodeObj) {
              setMobileCode(`+${matchedCodeObj.code}`);
              setPhone(cleanedPhone.substring(matchedCodeObj.code.length + 1));
            } else {
              setPhone(cleanedPhone);
            }
          } else {
            setPhone(cleanedPhone);
          }
        }
      }
    };

    fetchFreshProfile();
  }, [isAuthenticated, loggedInUser]);

  // ── Checkboxes ───────────────────────────────────────────────────────────────
  const [rememberMe, setRememberMe] = useState(true);
  const [rentalTerms, setRentalTerms] = useState(false);
  const [subscribeEmails, setSubscribeEmails] = useState(false);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // ── Vehicle selection (locked to prevent re-fetch swaps) ─────────────────────
  const bookId = searchParams.get('bookId');
  const [lockedVehicle, setLockedVehicle] = useState<Vehicle | null>(null);
  const hasLockedRef = useRef(false);

  // When vehicles list updates (initial load or re-fetch), find/update the selected vehicle
  useEffect(() => {
    if (!vehicles.length) return;

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

      // 4. Fallback: first vehicle
      if (!found) found = vehicles[0];

      if (found) {
        hasLockedRef.current = true;
        setLockedVehicle(found);
      }
    } else {
      // Already locked: update pricing by finding the same car by name
      const lockedName = lockedVehicle?.name;
      if (lockedName) {
        const updated = vehicles.find((v: Vehicle) => v.name === lockedName);
        if (updated) {
          setLockedVehicle(updated);
        }
        // If not found by name, keep showing the old locked vehicle (don't swap)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles]);

  const selectedVehicle = lockedVehicle || vehicles[0] || null;

  // ── Price calculation ────────────────────────────────────────────────────────
  const totalPrice = selectedVehicle
    ? getVehicleDisplayPrice(selectedVehicle, currencyCode as Currency, allRates, daysNumber || 1, fetchedCurrency)
    : 0;
  const dailyPrice = daysNumber && daysNumber > 0 ? Math.round(totalPrice / daysNumber) : totalPrice;

  // ── Re-fetch on currency change ──────────────────────────────────────────────
  const doFetch = useCallback(() => {
    const sp = searchStateParams;
    if (!sp.location || !sp.dateFrom || !sp.dateTo) return;
    const backendCurrency = SUPPORTED_BACKEND_CURRENCIES.includes(currencyCode) ? currencyCode : 'AED';
    dispatch(fetchVehicles({
      pickupLoc: sp.location,
      date_from: sp.dateFrom,
      date_to: sp.dateTo,
      time_from: sp.startTime || '10:00',
      time_to: sp.endTime || '10:00',
      currency: backendCurrency,
    }));
  }, [dispatch, searchStateParams, currencyCode]);

  useEffect(() => { doFetch(); }, [currencyCode]);

  // ── Register then Book ───────────────────────────────────────────────────────
  const handleBook = async () => {
    // Validate
    if (!gender) { toast.error('Please select Mr/Mrs'); return; }
    if (!fullName.trim()) { toast.error('Please enter your full name'); return; }
    if (!mobileCode) { toast.error('Please select phone code'); return; }
    if (!phone.trim()) { toast.error('Please enter a valid phone number'); return; }
    if (!country) { toast.error('Please select your country'); return; }
    if (!email.trim()) { toast.error('Please enter a valid email'); return; }
    if (!isAuthenticated && !password.trim()) { toast.error('Please enter a password'); return; }
    if (!rentalTerms) { toast.error('Please approve the rental terms'); return; }
    if (!selectedVehicle) { toast.error('No vehicle selected'); return; }
    if (!searchStateParams.dateFrom || !searchStateParams.dateTo) {
      toast.error('Missing booking dates'); return;
    }

    setIsSubmitting(true);
    try {
      let token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!isAuthenticated && !token) {
        // Step 1: Register customer if not logged in
        const regRes: any = await apiClient.post('/post/user/data', {
          name: `${gender} ${fullName.trim()}`,
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
          toast.error(extractLaravelError(regRes) || 'Registration failed');
          setIsSubmitting(false);
          return;
        }
        toast.success('Account created successfully!');

        token = regRes?.data?.token;
        const user = regRes?.data?.user;
        if (token) {
          localStorage.setItem('token', token);
          sessionStorage.setItem('token', token);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          sessionStorage.setItem('user', JSON.stringify(user));
        }

        // Sync Redux auth state immediately
        dispatch(restoreAuth());
      }

      // Step 2: Book vehicle
      const backendCurrency = SUPPORTED_BACKEND_CURRENCIES.includes(currencyCode) ? currencyCode : 'AED';
      const actualVehicleToBook = searchParams.get('bookId') || selectedVehicle.id;

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
          price: selectedVehicle.final_price,
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

  return (
    <div className="max-w-[1400px] xl:max-w-[90rem] 2xl:max-w-[95rem] mx-auto px-4 py-10">

      {/* Mobile Summary + Car */}
      <div className="lg:hidden mb-6 space-y-4">
        <SearchSummary hideEditButton={true} forceMobileLayout={true} />
        {selectedVehicle && (
          <CarCard vehicle={selectedVehicle} daysNumber={daysNumber} hideBookingControls={true} preselectedBookId={actualVehicleToBook} />
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── LEFT SIDEBAR ────────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-[300px] shrink-0 space-y-5 max-w-3xl lg:max-w-none mx-auto lg:mx-0">
          <div className="hidden lg:block">
            <SearchSummary hideEditButton={true} />
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-2xl border-2 border-primary overflow-hidden shadow-sm">
            <div className="bg-primary/5 px-5 py-3 border-b border-primary/20">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">Total Rental Price</p>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900">{totalPrice.toLocaleString()}</span>
                <span className="text-xl font-black text-gray-600">{currencyCode}</span>
              </div>
              <p className="text-xs text-green-700 font-bold">
                ✓ For {daysNumber} {daysNumber === 1 ? 'day' : 'days'}
              </p>
              <div className="pt-3 border-t border-gray-100 space-y-2">
                {[
                  { label: 'Daily Rate',     value: `${dailyPrice.toLocaleString()} ${currencyCode}` },
                  { label: 'Rental Cost',    value: `${totalPrice.toLocaleString()} ${currencyCode}` },
                  { label: 'Extras',         value: `0 ${currencyCode}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm text-gray-600 font-medium">
                    <span>{label}</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
                <div className="h-px bg-gray-200 my-1" />
                <div className="flex justify-between font-black text-gray-900">
                  <span>Grand Total</span>
                  <span>{totalPrice.toLocaleString()} {currencyCode}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── RIGHT CONTENT ───────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6 w-full max-w-3xl lg:max-w-none mx-auto lg:mx-0">

          {/* Desktop Car Card */}
          <div className="hidden lg:block">
            {selectedVehicle ? (
              <CarCard vehicle={selectedVehicle} daysNumber={daysNumber} hideBookingControls={true} preselectedBookId={actualVehicleToBook} />
            ) : (
              <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center text-gray-500">
                No vehicle selected.
              </div>
            )}
          </div>

          {/* ── Registration Form ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-[2rem] p-5 md:p-8 border border-gray-100 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                  <User size={16} className="text-gray-900" />
                </div>
                <h2 className="text-[20px] font-black tracking-tight text-gray-900">Register to Continue</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-11">Complete your details to book this vehicle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Gender + Full Name */}
              <div className="flex flex-col sm:flex-row gap-3 md:col-span-1">
                <div className="w-full sm:w-28 shrink-0">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Title</label>
                  <div className="relative">
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-semibold text-gray-900 bg-white appearance-none cursor-pointer"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name..."
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Phone Code + Phone */}
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Code Dropdown */}
                  <div className="relative w-full sm:w-28 shrink-0">
                    <select
                      value={mobileCode}
                      onChange={(e) => setMobileCode(e.target.value)}
                      className="w-full pl-3 pr-8 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-xs font-semibold text-gray-900 bg-white appearance-none cursor-pointer"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={`${c.iso}-${c.code}`} value={`+${c.code}`}>
                          {c.country} (+{c.code})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Phone number..."
                    className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Country</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowCountryDropdown(!showCountryDropdown); setShowCodeDropdown(false); }}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-medium text-gray-900 bg-white"
                  >
                    <span className="flex items-center gap-2 text-left">
                      <Globe size={16} className="text-gray-400 shrink-0" />
                      <span className={country ? 'text-gray-900' : 'text-gray-400'}>
                        {country || 'Select country...'}
                      </span>
                    </span>
                    <ChevronDown size={14} className="text-gray-400 shrink-0" />
                  </button>
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                      {worldCountries.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => { setCountry(c.name); setShowCountryDropdown(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Email + Password */}
              <div className={`md:col-span-2 grid grid-cols-1 ${isAuthenticated ? "grid-cols-1" : "md:grid-cols-2"} gap-4`}>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-mail..."
                      disabled={isAuthenticated}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
                {!isAuthenticated && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Account password..."
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── 3 Checkboxes (same as legacy) ────────────────────────────── */}
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
                  disabled={isSubmitting}
                  className="w-full py-4 px-8 bg-primary text-gray-900 rounded-xl font-black text-[16px] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Continue To Payment'
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
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
      <Stepper currentStep={3} />
      <Suspense fallback={<div className="p-20 text-center text-gray-400">Loading...</div>}>
        <BookingContent />
      </Suspense>
      <Footer />
    </main>
  );
}
