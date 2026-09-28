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
    { id: 46, name: 'DRIVUS', logo: 'DRIVUS_logo71ad64bc92aa187e5c988f88b6805f95.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 'gm', name: 'Green Motion', logo: 'Green Motion_logo15e5433e6eb1f5b83c72d85ec798635f.png' },
    { id: 'hz', name: 'Hertz', logo: 'hertz_logo.png' },
    { id: 'av', name: 'Avis', logo: 'AVIS_logo.png' },
    { id: 'sx', name: 'Sixt', logo: 'SIXT_logo.png' },
  ],
  'Qatar': [
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
    { id: 'hz', name: 'Hertz', logo: 'hertz_logo.png' },
    { id: 'av', name: 'Avis', logo: 'AVIS_logo.png' },
    { id: 'sx', name: 'Sixt', logo: 'SIXT_logo.png' },
    { id: 2, name: 'SAFETY', logo: 'Safety_logoc2a776f97547a1f42c01489ae4c3093a.png' },
  ],
  'Saudi Arabia': [
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
    { id: 'hz', name: 'Hertz', logo: 'hertz_logo.png' },
    { id: 'av', name: 'Avis', logo: 'AVIS_logo.png' },
    { id: 'sx', name: 'Sixt', logo: 'SIXT_logo.png' },
    { id: 'wefaq', name: 'AL WEFAQ', logo: 'AL WEFAQ RNT A CAR_logo.png' },
  ],
  'Egypt': [
    { id: 46, name: 'DRIVUS', logo: 'DRIVUS_logo71ad64bc92aa187e5c988f88b6805f95.png' },
    { id: 'gm', name: 'Green Motion', logo: 'Green Motion_logo15e5433e6eb1f5b83c72d85ec798635f.png' },
    { id: 137, name: 'Autowill', logo: 'Autowill_logo323b1fe06e02889217b68f9376061dff.png' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
    { id: 'hz', name: 'Hertz', logo: 'hertz_logo.png' },
    { id: 'av', name: 'Avis', logo: 'AVIS_logo.png' },
    { id: 'sx', name: 'Sixt', logo: 'SIXT_logo.png' },
  ],
  'Turkey': [
    { id: 56, name: 'EMR', logo: 'EMR_logo323b1fe06e02889217b68f9376061dff.png' },
    { id: 137, name: 'Autowill', logo: 'Autowill_logo323b1fe06e02889217b68f9376061dff.png' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
    { id: 'hz', name: 'Hertz', logo: 'hertz_logo.png' },
    { id: 'av', name: 'Avis', logo: 'AVIS_logo.png' },
    { id: 'sx', name: 'Sixt', logo: 'SIXT_logo.png' },
    { id: 140, name: 'XDrive Mobility', logo: 'XDrive Mobility_logo35b20acbc5264b77db20690e3d849bf7.png' },
  ],
  'Jordan': [
    { id: 7, name: 'RAMA', logo: 'RAMA_logodc11c608f2e44e287d25dbed9df19519.png' },
    { id: 19, name: 'Auto Nation', logo: 'AUTONATION_logocd1b09dfedc3d305fb14df86356c1fa0.png' },
    { id: 15, name: 'U-SAVE', logo: 'U-SAVE_logodc11c608f2e44e287d25dbed9df19519.png' },
    { id: 16, name: 'European', logo: 'European_logod8540df3cf540dbcb561d4625cd7abb9.png' },
    { id: 21, name: 'GO RENTAL', logo: 'GO RENTAL_logof286ceda378c5cc4622aba3ac6afe972.png' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
  ],
  'Morocco': [
    { id: 3, name: 'sovoycars', logo: 'sovoycars_logo494db40510120e2f266017cd1b761075.png' },
    { id: 143, name: 'MY Mobirent', logo: 'MY Mobirent_logo323b1fe06e02889217b68f9376061dff.png' },
    { id: 137, name: 'Autowill', logo: 'Autowill_logo323b1fe06e02889217b68f9376061dff.png' },
    { id: 56, name: 'EMR', logo: 'EMR_logo323b1fe06e02889217b68f9376061dff.png' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
  ],
  'Kuwait': [
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 'gm', name: 'Green Motion', logo: 'Green Motion_logo15e5433e6eb1f5b83c72d85ec798635f.png' },
    { id: 'hz', name: 'Hertz', logo: 'hertz_logo.png' },
    { id: 'av', name: 'Avis', logo: 'AVIS_logo.png' },
    { id: 51, name: 'SMARTAUTO', logo: 'SMARTAUTO_logo95627d408e4b9ecaf6a37a02f0a49a44.jpg' },
    { id: 30, name: 'Autocapitalkw', logo: 'Autocapitalkw_logo64a3191ce7f060dd4f0abc1361f3d53f.jpg' },
    { id: 14, name: 'Royal Star', logo: 'Royal Star_logo779b164104b2daee4d690f6ae57ca45d.jpg' },
  ],
  'Oman': [
    { id: 38, name: 'MAHD', logo: 'MAHD_logo4c949f544080391662eeba1eda4ac590.png' },
    { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
    { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
    { id: 'hz', name: 'Hertz', logo: 'hertz_logo.png' },
    { id: 'av', name: 'Avis', logo: 'AVIS_logo.png' },
  ],
};

const DEFAULT_SUPPLIERS = [
  { id: 46, name: 'DRIVUS', logo: 'DRIVUS_logo71ad64bc92aa187e5c988f88b6805f95.png' },
  { id: 'gm', name: 'Green Motion', logo: 'Green Motion_logo15e5433e6eb1f5b83c72d85ec798635f.png' },
  { id: 92, name: 'SurPrice', logo: 'SurPrice_logoadcc35f05ca2ced812ea6ab40e289120.png' },
  { id: 89, name: 'ROUTES', logo: 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png' },
  { id: 23, name: 'AUTORENT', logo: 'AUTORENT_logo33136a96e9bc3dc6b8eb26e468436406.jpg' },
  { id: 8, name: 'KTC', logo: 'KTC_logodc11c608f2e44e287d25dbed9df19519.png' },
  { id: 'hz', name: 'Hertz', logo: 'hertz_logo.png' },
  { id: 'av', name: 'Avis', logo: 'AVIS_logo.png' },
];

const TRUST_PERKS = [
  { icon: ShieldCheck, title: 'Free Cancellation', desc: 'Up to 48h before pickup' },
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
    let list: any[] = [];
    if (filteredSuppliers && filteredSuppliers.length > 0) {
      list = filteredSuppliers;
    } else if (countrySuppliers.length > 0) {
      list = countrySuppliers;
    } else {
      list = COUNTRY_FALLBACK_SUPPLIERS[resolvedCountry] || DEFAULT_SUPPLIERS;
    }
    // Filter to items with valid logos and limit to 8 for a clean single row
    const withLogos = list.filter((s: any) => Boolean(s.logo || s.company_logo));
    const finalList = withLogos.length > 0 ? withLogos : list;
    return finalList.slice(0, 8);
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

      <div className="relative w-full max-w-5xl xl:max-w-6xl px-4 sm:px-6 flex flex-col items-center z-10 space-y-5 sm:space-y-6">
        
        {/* ── 1. Top Brand Header with Spinning Alloy Wheel 'O' (Logo Only) ── */}
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
        </motion.div>

        {/* ── 2. Middle Section: Available Suppliers (Single Row, Logos Only, Centered) ── */}
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
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/60">
              Live Price Match
            </span>
          </div>

          {/* Suppliers Logos - Single Horizontal Row, Centered on desktop, Start-aligned on mobile to prevent clipping */}
          <div className="flex flex-row items-center justify-start sm:justify-center gap-2.5 sm:gap-4 w-full overflow-x-auto py-1 px-1.5 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {displayedSuppliers.map((sup: any, idx: number) => {
              const rawLogo = sup.logo || sup.company_logo;
              const logo = rawLogo ? getLogoUrl(rawLogo) : null;
              if (!logo) return null;

              return (
                <motion.div
                  key={sup.id || idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="flex-1 min-w-[85px] max-w-[145px] h-16 sm:h-20 bg-white hover:bg-amber-50/40 rounded-2xl border border-gray-200/90 hover:border-amber-400/80 transition-all duration-200 shadow-xs hover:shadow-md flex items-center justify-center p-2.5 sm:p-3 shrink-0 group"
                >
                  <img
                    src={logo}
                    alt="Supplier"
                    className="w-full h-full object-contain filter drop-shadow-2xs transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── 3. Bottom Section: Trust Perks (Single-line per card, Wide layout) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {TRUST_PERKS.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/95 border border-gray-200/90 shadow-sm text-left hover:border-amber-300 transition-colors"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Icon size={20} className="stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-black text-gray-900 leading-snug truncate sm:whitespace-normal">{perk.title}</p>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 leading-tight mt-0.5">{perk.desc}</p>
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
          className="w-full max-w-xl space-y-2 pt-1"
        >
          <div className="flex items-center justify-between text-xs font-bold gap-3">
            <span className="flex items-center gap-1.5 text-gray-600 truncate">
              <Sparkles size={13} className="text-primary animate-pulse shrink-0" />
              Aggregating best rates & verifying live fleet in {resolvedCountry}...
            </span>
            <span className="font-mono text-gray-900 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 font-extrabold shrink-0">
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
