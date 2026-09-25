'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CreditCard,
  Zap,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { RootState } from '@/store';
import { apiClient } from '@/services/api/axiosClient';
import { getLogoUrl } from '@/utils/getImageUrl';
import { getCountryIso, resolveDestinationCountry } from '@/utils/countryUtils';

// Fallback verified active suppliers if not yet populated
const COUNTRY_FALLBACK_SUPPLIERS: Record<string, Array<{ id: number | string; name: string; logo?: string }>> = {
  'United Arab Emirates': [
    { id: 8, name: 'KTC', logo: 'KTC_logodc11c608f2e44e287d25dbed9df19519.png' },
    { id: 6, name: 'Highway', logo: 'Highway_logodc11c608f2e44e287d25dbed9df19519.png' },
    { id: 23, name: 'AUTORENT', logo: 'AUTORENT_logo33136a96e9bc3dc6b8eb26e468436406.jpg' },
    { id: 46, name: 'DRIVUS', logo: 'DRIVUS_logo71ad64bc92aa187e5c988f88b6805f95.jpg' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
  ],
  'Qatar': [
    { id: 2, name: 'SAFETY', logo: '' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
    { id: 'qa-1', name: 'Oasis Rent A Car', logo: '/img/suppliers/oasis.png' },
    { id: 'qa-2', name: 'Al Muftah', logo: '/img/suppliers/almuftah.png' },
    { id: 'qa-3', name: 'Regency Fleet', logo: '/img/suppliers/regency.png' },
  ],
  'Saudi Arabia': [
    { id: 'sa-1', name: 'Yelo', logo: '/img/suppliers/yelo.png' },
    { id: 'sa-2', name: 'Key Rent A Car', logo: '/img/suppliers/key.png' },
    { id: 'sa-3', name: 'Lumi', logo: '/img/suppliers/lumi.png' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
  ],
  'Egypt': [
    { id: 9, name: 'FLEXI', logo: '' },
    { id: 137, name: 'Autowill', logo: '' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
  ],
  'Turkey': [
    { id: 136, name: 'Niss a car rental', logo: '' },
    { id: 96, name: 'essence car rental', logo: '' },
    { id: 137, name: 'Autowill', logo: '' },
    { id: 56, name: 'EMR', logo: '' },
    { id: 140, name: 'XDrive Mobility', logo: '' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
  ],
  'Jordan': [
    { id: 7, name: 'RAMA', logo: '' },
    { id: 19, name: 'Auto Nation', logo: '' },
    { id: 15, name: 'U-SAVE', logo: '' },
    { id: 16, name: 'European', logo: '' },
    { id: 20, name: 'EASY RENTAL', logo: '' },
    { id: 21, name: 'GO RENTAL', logo: '' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
  ],
  'Morocco': [
    { id: 3, name: 'sovoycars', logo: '' },
    { id: 143, name: 'MY Mobirent', logo: '' },
    { id: 137, name: 'Autowill', logo: '' },
    { id: 56, name: 'EMR', logo: '' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
  ],
  'Kuwait': [
    { id: 14, name: 'Royal Star', logo: '' },
    { id: 30, name: 'Autocapitalkw', logo: '' },
    { id: 51, name: 'SMARTAUTO', logo: '' },
  ],
  'Oman': [
    { id: 38, name: 'MAHD', logo: '' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
  ],
};

const DEFAULT_SUPPLIERS = [
  { id: 8, name: 'KTC', logo: 'KTC_logodc11c608f2e44e287d25dbed9df19519.png' },
  { id: 6, name: 'Highway', logo: 'Highway_logodc11c608f2e44e287d25dbed9df19519.png' },
  { id: 23, name: 'AUTORENT', logo: 'AUTORENT_logo33136a96e9bc3dc6b8eb26e468436406.jpg' },
  { id: 46, name: 'DRIVUS', logo: 'DRIVUS_logo71ad64bc92aa187e5c988f88b6805f95.jpg' },
  { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
  { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
];

const TRUST_PERKS = [
  { icon: ShieldCheck, title: 'Free Cancellation', desc: 'Up to 48 hours before pickup' },
  { icon: Clock, title: 'Flexible Extension', desc: 'Easy booking adjustments' },
  { icon: CreditCard, title: 'No Hidden Fees', desc: '100% price transparency' },
  { icon: Zap, title: 'Instant Confirmation', desc: 'Direct supplier booking' },
];

export default function Loader({ fullScreen = true }: { fullScreen?: boolean }) {
  const [progress, setProgress] = useState(15);
  const searchParams = useSearchParams();

  // 1. Redux Search Data
  const { filteredSuppliers, searchParams: reduxParams } = useSelector((state: RootState) => state.search);

  // 2. Accurately resolve Destination Country being searched
  const resolvedCountry = useMemo(() => {
    const locParam =
      searchParams?.get('locationLabel') ||
      searchParams?.get('location') ||
      searchParams?.get('pickup') ||
      searchParams?.get('pickup_loc') ||
      searchParams?.get('search') ||
      (reduxParams as any)?.locationLabel ||
      (reduxParams as any)?.location;

    const countryParam =
      searchParams?.get('country') ||
      searchParams?.get('countryName') ||
      (reduxParams as any)?.country ||
      (reduxParams as any)?.countryName;

    return resolveDestinationCountry(locParam, countryParam);
  }, [searchParams, reduxParams]);

  const countryIso = (getCountryIso(resolvedCountry) || 'ae').toLowerCase();

  // 3. Dynamic active suppliers in that destination country
  const [countrySuppliers, setCountrySuppliers] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    // Fetch live active suppliers with fleet in this specific country
    apiClient
      .get('/get/suppliers', { params: { country: resolvedCountry, status: 'active', with_vehicles: 1 } })
      .then((res: any) => {
        if (!isMounted) return;
        const raw = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(raw) && raw.length > 0) {
          // Filter to only active suppliers with vehicles > 0 if available
          const withVehicles = raw.filter((s: any) => s.vehicles_count === undefined || s.vehicles_count > 0);
          setCountrySuppliers(withVehicles.length > 0 ? withVehicles : raw);
        } else {
          // Check local fallback
          const fallback = COUNTRY_FALLBACK_SUPPLIERS[resolvedCountry] || DEFAULT_SUPPLIERS;
          setCountrySuppliers(fallback);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        const fallback = COUNTRY_FALLBACK_SUPPLIERS[resolvedCountry] || DEFAULT_SUPPLIERS;
        setCountrySuppliers(fallback);
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedCountry]);

  // Priority: Filtered Suppliers from active search query > Country Suppliers from API > Country Fallback
  const displayedSuppliers = useMemo(() => {
    if (filteredSuppliers && filteredSuppliers.length > 0) {
      return filteredSuppliers.slice(0, 8);
    }
    if (countrySuppliers.length > 0) {
      return countrySuppliers.slice(0, 8);
    }
    return COUNTRY_FALLBACK_SUPPLIERS[resolvedCountry] || DEFAULT_SUPPLIERS;
  }, [filteredSuppliers, countrySuppliers, resolvedCountry]);

  // Fast, natural loading progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        const step = prev < 45 ? 3.6 : prev < 75 ? 2.2 : prev < 90 ? 1.4 : 0.6;
        return Math.min(prev + step, 98);
      });
    }, 45);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center bg-radial from-amber-50/50 via-white to-gray-50/80 text-gray-900 overflow-hidden select-none transition-opacity duration-300 ${
        fullScreen ? 'fixed inset-0 z-[9999]' : 'w-full py-16'
      }`}
    >
      {/* ── Soft Ambient Glow Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-primary/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl px-4 sm:px-6 flex flex-col items-center z-10 space-y-6">
        
        {/* ── 1. Top Brand Header with Spinning Alloy Wheel 'O' ── */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <div className="flex items-center gap-1">
            <span className="text-3xl sm:text-4xl font-black italic tracking-tighter text-gray-900">
              AUT
            </span>

            {/* Spinning Car Wheel Rim */}
            <span className="inline-flex items-center justify-center mx-1 align-middle relative">
              <motion.svg
                viewBox="0 0 100 100"
                className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-md"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, ease: 'linear', duration: 1.1 }}
              >
                {/* Tyre */}
                <circle cx="50" cy="50" r="46" stroke="#1e293b" strokeWidth="8" fill="#0f172a" />
                {/* Rim Outer */}
                <circle cx="50" cy="50" r="38" stroke="#f4d849" strokeWidth="3.5" fill="#18181b" />
                {/* 5-Spoke Alloy Design */}
                {[0, 72, 144, 216, 288].map((angle) => (
                  <line
                    key={angle}
                    x1="50"
                    y1="50"
                    x2={50 + 36 * Math.cos((angle * Math.PI) / 180)}
                    y2={50 + 36 * Math.sin((angle * Math.PI) / 180)}
                    stroke="#f4d849"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                ))}
                {/* Center Hub & Nut */}
                <circle cx="50" cy="50" r="12" fill="#1e293b" stroke="#f4d849" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="5" fill="#f4d849" />
              </motion.svg>
            </span>

            <span className="text-3xl sm:text-4xl font-black italic tracking-tighter text-gray-900">
              URS
            </span>
          </div>

          {/* Active Searched Country Badge with Real Flag */}
          <div className="mt-3 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-gray-200/90 shadow-sm">
            <div className="relative w-6 h-4.5 rounded overflow-hidden shadow-2xs shrink-0 border border-gray-100">
              <img
                src={`https://flagcdn.com/w80/${countryIso}.png`}
                alt={resolvedCountry}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
              <span className="text-gray-500 font-semibold">Scanning fleet in</span>
              <span className="text-amber-800 font-black uppercase tracking-tight">{resolvedCountry}</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </motion.div>

        {/* ── 2. Middle Section: Available Suppliers in the Searched Country ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200/90 p-4 sm:p-5 shadow-xl shadow-gray-200/60"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-amber-600" />
              <span className="text-xs font-black uppercase tracking-tight text-gray-900">
                Verified Suppliers in {resolvedCountry}
              </span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              Live Price Match
            </span>
          </div>

          {/* Suppliers Logos Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
            {displayedSuppliers.map((sup: any, idx: number) => {
              const name = sup.name || sup.company || 'Rental Supplier';
              const logo = sup.logo || sup.company_logo ? getLogoUrl(sup.logo || sup.company_logo) : null;
              const count = sup.vehicle_count || sup.vehiclesCount;

              return (
                <motion.div
                  key={sup.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex items-center gap-2.5 p-2 bg-gray-50/80 hover:bg-amber-50/50 rounded-2xl border border-gray-200/80 transition-colors shadow-2xs group"
                >
                  <div className="relative w-12 h-8 rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0 p-0.5">
                    {logo ? (
                      <img src={logo} alt={name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[11px] font-black text-gray-600">{name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate group-hover:text-amber-700 transition-colors">
                      {name}
                    </p>
                    {count !== undefined && count > 0 ? (
                      <p className="text-[10px] font-semibold text-gray-400 truncate">
                        {count} Vehicles
                      </p>
                    ) : (
                      <p className="text-[10px] font-bold text-emerald-600 truncate">
                        Verified Partner
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── 3. Bottom Section: Trust Perks ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5"
        >
          {TRUST_PERKS.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-gray-200 shadow-2xs text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-gray-900 leading-tight truncate">{perk.title}</p>
                  <p className="text-[10px] font-medium text-gray-400 truncate">{perk.desc}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* ── 4. Precision Progress Bar & Status ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-md space-y-2 pt-1"
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-gray-600">
              <Sparkles size={13} className="text-primary animate-pulse" />
              Aggregating best rates & verifying live fleet in {resolvedCountry}...
            </span>
            <span className="font-mono text-gray-900 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 font-extrabold">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/80 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-primary to-amber-500 rounded-full shadow-[0_0_12px_rgba(244,216,73,0.8)]"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>

      </div>
    </div>
  );
}
