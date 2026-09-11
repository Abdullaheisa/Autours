'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  X,
  LogOut,
  LogIn,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Car,
} from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { loginThunk, registerThunk, logout } from '@/store/slices/authSlice';
import { bookingApi } from '@/services/api';
import { Vehicle, Currency } from '@/types';
import { getVehicleImageUrl } from '@/utils/getImageUrl';
import { getVehicleDisplayPrice } from '@/utils/vehiclePrice';

interface InChatBookingFormProps {
  vehicle: Vehicle;
  initialSearchCriteria?: {
    location?: string | number;
    locationName?: string;
    dateFrom?: string;
    dateTo?: string;
    startTime?: string;
    endTime?: string;
    currency?: string;
  };
  onCancel: () => void;
  onBookingComplete: (bookingResult: any) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
];

function formatTimeDisplay(time24: string) {
  const [h, m] = (time24 || '10:00').split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function parseIsoDate(isoStr: string) {
  const [y, m, d] = (isoStr || '').split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

function toIsoString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function InChatBookingForm({
  vehicle,
  initialSearchCriteria,
  onCancel,
  onBookingComplete,
}: InChatBookingFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { code: reduxCurrencyCode, allRates } = useSelector((state: RootState) => state.currency);

  // Check if current account is management / supplier
  const isManagementAccount = Boolean(
    isAuthenticated &&
      user &&
      (user.role === 'admin' ||
        user.role === 'supplier' ||
        user.role === 'active_supplier' ||
        user.role === 'under_review')
  );

  const isCustomer = Boolean(isAuthenticated && user && user.role === 'customer');

  const [activeStep, setActiveStep] = useState<'blocked' | 'auth' | 'dates' | 'confirm'>(
    isManagementAccount ? 'blocked' : isCustomer ? 'dates' : 'auth'
  );

  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regMobileCode, setRegMobileCode] = useState('+971');
  const [regCountry, setRegCountry] = useState('United Arab Emirates');

  // Dates & Times
  const [dateFrom, setDateFrom] = useState(
    initialSearchCriteria?.dateFrom || toIsoString(new Date(Date.now() + 86400000))
  );
  const [dateTo, setDateTo] = useState(
    initialSearchCriteria?.dateTo || toIsoString(new Date(Date.now() + 4 * 86400000))
  );
  const [timeFrom, setTimeFrom] = useState(initialSearchCriteria?.startTime || '10:00');
  const [timeTo, setTimeTo] = useState(initialSearchCriteria?.endTime || '10:00');

  // Calendar Navigation View State
  const initialDate = parseIsoDate(dateFrom);
  const [calYear, setCalYear] = useState(initialDate.getFullYear());
  const [calMonth, setCalMonth] = useState(initialDate.getMonth());
  const [pickingTarget, setPickingTarget] = useState<'from' | 'to'>('from');

  // Customer Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [mobileCode, setMobileCode] = useState('+971');
  const [phone, setPhone] = useState(user?.phone_num || '');
  const [email, setEmail] = useState(user?.email || '');
  const [country, setCountry] = useState(user?.country || 'United Arab Emirates');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Currency & Reactive Pricing
  const activeCurrency = (reduxCurrencyCode || initialSearchCriteria?.currency || vehicle.baseCurrency || 'AED') as Currency;
  const fetchedCurrency = initialSearchCriteria?.currency || vehicle.baseCurrency || 'AED';

  // Sync with auth status
  useEffect(() => {
    if (isManagementAccount) {
      setActiveStep('blocked');
    } else if (isCustomer) {
      if (user) {
        setFullName(user.name || '');
        setEmail(user.email || '');
        if (user.phone_num) setPhone(user.phone_num);
        if (user.country) setCountry(user.country);
      }
      if (activeStep === 'auth' || activeStep === 'blocked') {
        setActiveStep('dates');
      }
    } else if (!isAuthenticated) {
      setActiveStep('auth');
    }
  }, [isAuthenticated, user, isManagementAccount, isCustomer]);

  // Calculate CURRENT rental days
  let days = 3;
  if (dateFrom && dateTo) {
    const d1 = new Date(dateFrom).getTime();
    const d2 = new Date(dateTo).getTime();
    const diff = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
    if (diff > 0) days = diff;
  }

  // Calculate original search duration to derive base daily rate
  let initialDays = 3;
  if (initialSearchCriteria?.dateFrom && initialSearchCriteria?.dateTo) {
    const initD1 = new Date(initialSearchCriteria.dateFrom).getTime();
    const initD2 = new Date(initialSearchCriteria.dateTo).getTime();
    const initDiff = Math.ceil(Math.abs(initD2 - initD1) / (1000 * 60 * 60 * 24));
    if (initDiff > 0) initialDays = initDiff;
  }

  // Get base converted total for the initial search duration
  const baseConvertedTotal = getVehicleDisplayPrice(
    vehicle,
    activeCurrency,
    allRates,
    initialDays,
    fetchedCurrency
  );

  // Daily rate in active currency
  const dailyRate = initialDays > 0 ? baseConvertedTotal / initialDays : baseConvertedTotal;

  // Dynamic Total Price: exactly scales with selected duration (days) and active currency
  const totalPrice = Math.round(dailyRate * days);
  const dailyPrice = Math.round(dailyRate);

  const rawPhoto = vehicle.photo || vehicle.image || (vehicle as any).car_photo;
  const vehicleImageUrl = getVehicleImageUrl(rawPhoto);

  // Quick Preset Helper
  const applyPresetDays = (numDays: number) => {
    const from = parseIsoDate(dateFrom);
    const to = new Date(from);
    to.setDate(to.getDate() + numDays);
    setDateTo(toIsoString(to));
  };

  // Calendar Day Click Handler
  const handleCalendarDayClick = (day: number) => {
    const selected = new Date(calYear, calMonth, day);
    const selectedIso = toIsoString(selected);

    if (pickingTarget === 'from') {
      setDateFrom(selectedIso);
      const currentTo = parseIsoDate(dateTo);
      if (selected >= currentTo) {
        const newTo = new Date(selected);
        newTo.setDate(newTo.getDate() + 3);
        setDateTo(toIsoString(newTo));
      }
      setPickingTarget('to');
    } else {
      const fromD = parseIsoDate(dateFrom);
      if (selected <= fromD) {
        setDateFrom(selectedIso);
        const newTo = new Date(selected);
        newTo.setDate(newTo.getDate() + 3);
        setDateTo(toIsoString(newTo));
      } else {
        setDateTo(selectedIso);
      }
    }
  };

  // Month navigation
  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  // ── Handle In-Chat Login ──────────────────────────────────────────────────
  const handleInChatLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setErrorMsg('Please provide your email address and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const resultAction = await dispatch(
        loginThunk({ email: authEmail.trim(), password: authPassword.trim() })
      );

      if (loginThunk.fulfilled.match(resultAction)) {
        const loggedUser = resultAction.payload.user;
        if (
          loggedUser &&
          (loggedUser.role === 'admin' ||
            loggedUser.role === 'supplier' ||
            loggedUser.role === 'active_supplier')
        ) {
          setErrorMsg('This account is registered as Management/Supplier. Reservations are for Customer accounts only.');
          dispatch(logout());
        } else {
          setActiveStep('dates');
        }
      } else {
        setErrorMsg((resultAction.payload as string) || 'Invalid login credentials.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle In-Chat Registration ───────────────────────────────────────────
  const handleInChatRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !authEmail.trim() || !authPassword.trim() || !regPhone.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const regAction = await dispatch(
        registerThunk({
          fullName: regName.trim(),
          email: authEmail.trim(),
          password: authPassword.trim(),
          phone: `${regMobileCode}${regPhone.trim()}`,
          country: regCountry,
          supplier: 0,
        })
      );

      if (registerThunk.fulfilled.match(regAction)) {
        const loginAction = await dispatch(
          loginThunk({ email: authEmail.trim(), password: authPassword.trim() })
        );
        if (loginThunk.fulfilled.match(loginAction)) {
          setActiveStep('dates');
        } else {
          setAuthTab('login');
          setErrorMsg('Account created successfully! Please sign in.');
        }
      } else {
        setErrorMsg((regAction.payload as string) || 'Failed to create account.');
      }
    } catch {
      setErrorMsg('An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle Final Booking Submission ───────────────────────────────────────
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg('Please complete your full name, phone number, and email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const pickupLocValue =
        initialSearchCriteria?.location ||
        (vehicle.branch ? vehicle.branch.id || vehicle.branch.city || vehicle.branch.name : null) ||
        vehicle.pickup_loc ||
        'Dubai';

      const bookingPayload = {
        id: vehicle.id,
        pickupLoc: pickupLocValue,
        date_from: dateFrom,
        date_to: dateTo,
        time_from: timeFrom || '10:00',
        time_to: timeTo || '10:00',
        currency: activeCurrency,
        vehicle: vehicle.id,
        price: totalPrice,
        driver_age: 28,
        residence_country: country || 'United Arab Emirates',
      };

      const res: any = await bookingApi.create(bookingPayload);
      const rentalData = res?.data || res;

      if (res?.status || rentalData?.id || rentalData?.order_number) {
        const orderNumber = rentalData.order_number || `AEATR${rentalData.id || '001'}`;
        onBookingComplete({
          orderNumber,
          vehicleName: vehicle.name,
          dateFrom,
          dateTo,
          timeFrom,
          timeTo,
          pickupLoc: typeof pickupLocValue === 'string' ? pickupLocValue : vehicle.branch?.name || 'Dubai',
          customerName: fullName,
          phone: `${mobileCode} ${phone}`,
          email,
          totalPrice,
          dailyPrice,
          days,
          currency: activeCurrency,
          supplierCompany: vehicle.supplier?.company || 'Autours Partner',
        });
      } else {
        setErrorMsg(res?.message || 'Unable to complete reservation. Please try again.');
      }
    } catch (bookingErr: any) {
      console.error('In-chat booking error:', bookingErr);
      const errMsg =
        bookingErr?.response?.data?.message ||
        bookingErr?.message ||
        'Server communication error. Please try again.';
      setErrorMsg(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar Day Computation
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fromDateObj = parseIsoDate(dateFrom);
  fromDateObj.setHours(0, 0, 0, 0);
  const toDateObj = parseIsoDate(dateTo);
  toDateObj.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-gray-200/90 text-gray-900 flex flex-col gap-3 font-sans w-full relative overflow-hidden" dir="ltr">
      
      {/* ── Modern Header: Step Indicator & Close Button ──────────────────── */}
      <div className="flex items-center justify-between pb-1 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/90 text-amber-900 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
            <span>
              {activeStep === 'dates' ? 'Step 1 of 2' : activeStep === 'confirm' ? 'Step 2 of 2' : 'Reservation'}
            </span>
          </div>
          <h4 className="font-black text-xs sm:text-sm text-gray-950 truncate">
            {activeStep === 'blocked'
              ? 'Account Notice'
              : activeStep === 'auth'
              ? 'Sign in to Reserve'
              : activeStep === 'dates'
              ? 'Select Rental Dates & Time'
              : 'Customer & Contact Info'}
          </h4>
        </div>
        <button
          onClick={onCancel}
          className="w-6 h-6 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-colors shrink-0"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Sleek Dark Vehicle & Price Card ───────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-xl p-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-11 h-8 bg-white/10 rounded-lg p-0.5 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
            {vehicleImageUrl ? (
              <img src={vehicleImageUrl} alt={vehicle.name} className="w-full h-full object-contain" />
            ) : (
              <Car className="w-4 h-4 text-gray-300" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-black text-xs sm:text-sm text-white truncate leading-tight">{vehicle.name}</div>
            <div className="text-[10px] text-gray-300 flex items-center gap-1.5 mt-0.5">
              <span className="bg-white/15 px-1.5 py-0.2 rounded text-[9.5px] font-bold text-gray-200 uppercase">
                {vehicle.category || 'Economy'}
              </span>
              <span>•</span>
              <span className="truncate text-gray-400 font-medium">{vehicle.supplier?.company || 'Autours Partner'}</span>
            </div>
          </div>
        </div>

        {/* Reactive Total Price in Selected Currency */}
        <div className="text-right shrink-0 pl-2">
          <div className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider leading-none">
            Total Price ({days}d)
          </div>
          <div className="text-sm sm:text-base font-black text-[#f9d602] font-sans tracking-tight leading-tight mt-0.5">
            {totalPrice}{' '}
            <span className="text-xs font-bold text-amber-300">
              {activeCurrency}
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] p-2 rounded-xl text-center leading-tight font-semibold">
          {errorMsg}
        </div>
      )}

      {/* ── CASE 1: BLOCKED MANAGEMENT ACCOUNT ────────────────────────────── */}
      {activeStep === 'blocked' && (
        <div className="space-y-2 py-2 text-center">
          <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-xs text-gray-700 leading-relaxed px-2">
            You are signed in as <strong className="text-amber-600">({user?.role})</strong>. Car bookings are for <strong className="text-gray-950">Customer</strong> accounts only.
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="w-full bg-[#f9d602] hover:bg-amber-400 text-neutral-950 font-black text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch to Customer Account</span>
          </button>
        </div>
      )}

      {/* ── CASE 2: AUTH STEP (LOGIN / REGISTER) ──────────────────────────── */}
      {activeStep === 'auth' && (
        <div className="space-y-2.5">
          <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-[11px] ${
                authTab === 'login'
                  ? 'bg-white text-neutral-950 shadow-xs font-black'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-[11px] ${
                authTab === 'register'
                  ? 'bg-white text-neutral-950 shadow-xs font-black'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          {/* Login Form */}
          {authTab === 'login' && (
            <form onSubmit={handleInChatLogin} className="space-y-2">
              <div>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl px-3 py-2 focus:border-amber-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl px-3 py-2 focus:border-amber-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#f9d602] hover:bg-amber-400 text-neutral-950 font-black text-xs py-2 rounded-xl shadow-[0_2px_10px_rgba(249,214,2,0.35)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In & Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {authTab === 'register' && (
            <form onSubmit={handleInChatRegister} className="space-y-2">
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Full Name"
                required
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl px-3 py-2 focus:border-amber-400 focus:bg-white focus:outline-none"
              />

              <div className="flex gap-1.5">
                <select
                  value={regMobileCode}
                  onChange={(e) => setRegMobileCode(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-[11px] rounded-xl px-2 py-2 focus:border-amber-400 focus:outline-none shrink-0"
                >
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+966">🇸🇦 +966</option>
                  <option value="+20">🇪🇬 +20</option>
                  <option value="+974">🇶🇦 +974</option>
                  <option value="+968">🇴🇲 +968</option>
                  <option value="+965">🇰🇼 +965</option>
                  <option value="+90">🇹🇷 +90</option>
                </select>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="Phone number"
                  required
                  className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl px-3 py-2 focus:border-amber-400 focus:bg-white focus:outline-none"
                />
              </div>

              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl px-3 py-2 focus:border-amber-400 focus:bg-white focus:outline-none"
              />

              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl px-3 py-2 focus:border-amber-400 focus:bg-white focus:outline-none"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#f9d602] hover:bg-amber-400 text-neutral-950 font-black text-xs py-2 rounded-xl shadow-[0_2px_10px_rgba(249,214,2,0.35)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create & Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── STEP 1: ULTRA-MODERN STREAMLINED CALENDAR & DATE SELECTOR ────────── */}
      {activeStep === 'dates' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setActiveStep('confirm');
          }}
          className="space-y-2.5"
        >
          {/* Integrated Pick-up & Drop-off Selector Cards */}
          <div className="grid grid-cols-2 gap-2">
            {/* Pick-up Card */}
            <div
              onClick={() => setPickingTarget('from')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                pickingTarget === 'from'
                  ? 'border-amber-400 bg-amber-50/60 shadow-xs ring-2 ring-amber-400/20'
                  : 'border-gray-200 bg-gray-50/70 hover:bg-gray-100/70 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between text-[9.5px] font-black uppercase tracking-wider text-gray-500">
                <span>Pick-up Date</span>
                <CalendarIcon className="w-3 h-3 text-amber-500" />
              </div>
              <div className="text-xs font-black text-gray-950 mt-1 truncate">
                {parseIsoDate(dateFrom).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              {/* Embedded Time Picker */}
              <div className="flex items-center gap-1 mt-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-2xs" onClick={(e) => e.stopPropagation()}>
                <Clock className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                <select
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="bg-transparent text-[10px] font-bold text-gray-800 focus:outline-none w-full cursor-pointer"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{formatTimeDisplay(t)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Drop-off Card */}
            <div
              onClick={() => setPickingTarget('to')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                pickingTarget === 'to'
                  ? 'border-amber-400 bg-amber-50/60 shadow-xs ring-2 ring-amber-400/20'
                  : 'border-gray-200 bg-gray-50/70 hover:bg-gray-100/70 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between text-[9.5px] font-black uppercase tracking-wider text-gray-500">
                <span>Drop-off Date</span>
                <CalendarIcon className="w-3 h-3 text-amber-500" />
              </div>
              <div className="text-xs font-black text-gray-950 mt-1 truncate">
                {parseIsoDate(dateTo).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              {/* Embedded Time Picker */}
              <div className="flex items-center gap-1 mt-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-2xs" onClick={(e) => e.stopPropagation()}>
                <Clock className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                <select
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="bg-transparent text-[10px] font-bold text-gray-800 focus:outline-none w-full cursor-pointer"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{formatTimeDisplay(t)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Sleek Custom Calendar ────────────────────────────────────── */}
          <div className="bg-gray-50/70 border border-gray-200/90 rounded-xl p-2.5 shadow-2xs">
            {/* Calendar Controls Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-2xs active:scale-95"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-black text-gray-900 tracking-tight min-w-[96px] text-center">
                  {MONTH_NAMES[calMonth]} {calYear}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-2xs active:scale-95"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Duration Pills */}
              <div className="flex items-center gap-1 bg-white border border-gray-200 p-0.5 rounded-lg shadow-2xs">
                {[
                  { label: '3d', days: 3 },
                  { label: '5d', days: 5 },
                  { label: '7d', days: 7 },
                  { label: '14d', days: 14 },
                ].map((p) => (
                  <button
                    key={p.days}
                    type="button"
                    onClick={() => applyPresetDays(p.days)}
                    className={`text-[9.5px] px-2 py-0.5 rounded-md font-bold transition-all ${
                      days === p.days
                        ? 'bg-[#f9d602] text-neutral-950 font-black shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-black text-gray-400 uppercase mb-1">
              {DAYS_SHORT.map((d) => (
                <div key={d} className="py-0.5">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`blank-${i}`} className="h-6" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const cellDate = new Date(calYear, calMonth, day);
                cellDate.setHours(0, 0, 0, 0);

                const isPast = cellDate < today;
                const isStart = cellDate.getTime() === fromDateObj.getTime();
                const isEnd = cellDate.getTime() === toDateObj.getTime();
                const inRange = cellDate > fromDateObj && cellDate < toDateObj;

                let cellClass = 'hover:bg-amber-100 text-gray-800 font-semibold rounded-lg';
                if (isPast) {
                  cellClass = 'text-gray-300 cursor-not-allowed';
                } else if (isStart && isEnd) {
                  cellClass = 'bg-[#f9d602] text-neutral-950 font-black shadow-xs rounded-lg ring-2 ring-amber-400/40';
                } else if (isStart) {
                  cellClass = 'bg-[#f9d602] text-neutral-950 font-black shadow-xs rounded-l-lg ring-1 ring-amber-400';
                } else if (isEnd) {
                  cellClass = 'bg-[#f9d602] text-neutral-950 font-black shadow-xs rounded-r-lg ring-1 ring-amber-400';
                } else if (inRange) {
                  cellClass = 'bg-amber-100/90 text-amber-950 font-bold';
                }

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleCalendarDayClick(day)}
                    className={`h-6 flex items-center justify-center text-[10.5px] transition-all ${cellClass}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[1.5] bg-[#f9d602] hover:bg-amber-400 text-neutral-950 font-black text-xs py-2 rounded-xl shadow-[0_2px_10px_rgba(249,214,2,0.4)] hover:shadow-[0_4px_14px_rgba(249,214,2,0.6)] transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 2: CONFIRMATION WITH AUTO-POPULATED DATA ──────────────────── */}
      {activeStep === 'confirm' && (
        <form onSubmit={handleFinalSubmit} className="space-y-2.5">
          {/* Trip Summary Timeline */}
          <div className="bg-gray-50 border border-gray-200/90 rounded-xl p-2.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-black text-gray-900 border-b border-gray-200 pb-1">
              <span>Rental Summary</span>
              <span className="text-amber-700 font-sans font-black">{totalPrice} {activeCurrency} ({days} days)</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-gray-700 pt-0.5">
              <div>
                📅 <strong>Pick-up:</strong> {dateFrom} @ {formatTimeDisplay(timeFrom)}
              </div>
              <div>
                🏁 <strong>Drop-off:</strong> {dateTo} @ {formatTimeDisplay(timeTo)}
              </div>
            </div>
          </div>

          {/* Verified Customer Card */}
          <div className="bg-emerald-50/80 border border-emerald-300/90 rounded-xl p-2.5 space-y-1.5 text-xs shadow-2xs">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-1">
              <span className="text-emerald-900 font-extrabold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Customer Profile
              </span>
              <span className="text-emerald-700 text-[9.5px] font-bold">Instant Confirmation</span>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-800 pt-0.5">
              <div>
                👤 Name: <strong className="text-gray-950">{fullName || 'Autours Customer'}</strong>
              </div>
              <div>
                📱 Phone: <strong className="text-gray-950">{phone || 'Not provided'}</strong>
              </div>
              <div className="col-span-2 truncate">
                ✉️ Email: <strong className="text-gray-950">{email}</strong>
              </div>
            </div>
          </div>

          {/* Quick Edit Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-600 font-bold block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:border-amber-400 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-600 font-bold block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:border-amber-400 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveStep('dates')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#f9d602] hover:bg-amber-400 text-neutral-950 font-black text-xs py-2 rounded-xl shadow-[0_2px_10px_rgba(249,214,2,0.4)] hover:shadow-[0_4px_14px_rgba(249,214,2,0.6)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <span>Confirming...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Reservation Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
