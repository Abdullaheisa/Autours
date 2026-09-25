'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  ShieldCheck,
  MapPin,
  Sparkles,
  Building2,
  Compass,
  Cloud,
  Car,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { apiClient } from '@/services/api/axiosClient';
import { getLogoUrl } from '@/utils/getImageUrl';
import { getCountryIso } from '@/utils/countryUtils';

interface SkyItem {
  type: 'country' | 'supplier';
  name: string;
  countryName?: string;
  flagIso?: string;
  logoUrl?: string;
  countText: string;
  badge?: string;
}

// Fallback high-tier verified data
const DEFAULT_FALLBACK_ITEMS: SkyItem[] = [
  { type: 'country', name: 'Saudi Arabia', countryName: 'Saudi Arabia', flagIso: 'sa', countText: 'Riyadh & Jeddah Hubs', badge: 'Top Destination' },
  { type: 'supplier', name: 'AUTORENT', countText: '30+ Available Fleet', badge: 'Verified Partner' },
  { type: 'country', name: 'UAE & Dubai', countryName: 'United Arab Emirates', flagIso: 'ae', countText: 'Major Fleet Hub', badge: 'Active Fleet' },
  { type: 'supplier', name: 'KTC Rent A Car', countText: '25+ Available Fleet', badge: 'Top Supplier' },
  { type: 'country', name: 'Jordan', countryName: 'Jordan', flagIso: 'jo', countText: 'Amman & Aqaba Hubs', badge: 'Scenic Routes' },
  { type: 'supplier', name: 'SurPrice', countText: '20+ Available Fleet', badge: 'Official Partner' },
  { type: 'country', name: 'Qatar', countryName: 'Qatar', flagIso: 'qa', countText: 'Doha Airport & City Hubs', badge: 'Executive Fleet' },
  { type: 'supplier', name: 'HIGHWAY', countText: '15+ Available Fleet', badge: 'Airport Pickup' },
];

export default function Loader({ fullScreen = true }: { fullScreen?: boolean }) {
  const [progress, setProgress] = useState(15);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  // Redux search state (if user is performing search)
  const { filteredSuppliers, vehicles } = useSelector((state: RootState) => state.search);

  // Dynamic live platform stats and top active fleet items
  const [dynamicStats, setDynamicStats] = useState<{
    countries: number;
    suppliers: number;
    cars: number;
  }>({
    countries: 9,
    suppliers: 24,
    cars: 150,
  });

  const [dynamicSkyItems, setDynamicSkyItems] = useState<SkyItem[]>(DEFAULT_FALLBACK_ITEMS);

  // Fetch real platform statistics and active suppliers from backend
  useEffect(() => {
    // 1. Fetch real platform statistics
    apiClient
      .get('/stats')
      .then((res: any) => {
        const d = res?.data?.data || res?.data;
        if (d && (d.countries || d.suppliers || d.cars)) {
          setDynamicStats({
            countries: d.countries || 9,
            suppliers: d.suppliers || 24,
            cars: d.cars || 150,
          });
        }
      })
      .catch(() => {});

    // 2. Fetch real active suppliers and brands
    apiClient
      .get('/get/car-rental-brands')
      .then((res: any) => {
        const brands = res?.data?.brands || res?.brands || (Array.isArray(res?.data) ? res.data : []);
        if (Array.isArray(brands) && brands.length > 0) {
          const formattedSuppliers: SkyItem[] = brands
            .filter((b: any) => (b.vehiclesCount || b.branchesCount || 0) > 0 || b.name)
            .slice(0, 8)
            .map((b: any) => ({
              type: 'supplier',
              name: b.name || b.company || 'Rental Supplier',
              logoUrl: b.logo ? getLogoUrl(b.logo) : undefined,
              countText: b.branchesCount ? `${b.branchesCount} Active Branches` : 'Verified Fleet Partner',
              badge: 'Verified Supplier',
            }));

          if (formattedSuppliers.length > 0) {
            // Combine with top active countries
            const topCountries: SkyItem[] = [
              { type: 'country', name: 'Saudi Arabia', countryName: 'Saudi Arabia', flagIso: 'sa', countText: 'Riyadh & Jeddah Hubs', badge: 'Top Destination' },
              { type: 'country', name: 'UAE & Dubai', countryName: 'United Arab Emirates', flagIso: 'ae', countText: 'Major Fleet Hub', badge: 'Active Fleet' },
              { type: 'country', name: 'Jordan', countryName: 'Jordan', flagIso: 'jo', countText: 'Amman & Aqaba Hubs', badge: 'Scenic Routes' },
              { type: 'country', name: 'Qatar', countryName: 'Qatar', flagIso: 'qa', countText: 'Doha Airport & City Hubs', badge: 'Executive Fleet' },
              { type: 'country', name: 'Turkey', countryName: 'Turkey', flagIso: 'tr', countText: 'Istanbul & Antalya Hubs', badge: 'Popular Hub' },
              { type: 'country', name: 'Egypt', countryName: 'Egypt', flagIso: 'eg', countText: 'Cairo & Red Sea Hubs', badge: 'Best Value' },
            ];

            // Interleave countries and suppliers for exciting variety
            const interleaved: SkyItem[] = [];
            const maxLen = Math.max(topCountries.length, formattedSuppliers.length);
            for (let i = 0; i < maxLen; i++) {
              if (topCountries[i]) interleaved.push(topCountries[i]);
              if (formattedSuppliers[i]) interleaved.push(formattedSuppliers[i]);
            }
            setDynamicSkyItems(interleaved);
          }
        }
      })
      .catch(() => {});
  }, []);

  // If Redux has live search suppliers with actual vehicle counts, prioritize them!
  const activeFleetItems = useMemo(() => {
    if (filteredSuppliers && filteredSuppliers.length > 0) {
      // Sort suppliers with most vehicles first
      const sorted = [...filteredSuppliers]
        .sort((a, b) => (b.vehicle_count || 0) - (a.vehicle_count || 0))
        .filter((s) => s.vehicle_count > 0 || s.name);

      if (sorted.length > 0) {
        const mapped: SkyItem[] = sorted.slice(0, 10).map((s: any) => ({
          type: 'supplier',
          name: s.name || s.company || 'Supplier',
          logoUrl: s.logo || s.company_logo ? getLogoUrl(s.logo || s.company_logo) : undefined,
          countText: `${s.vehicle_count} Vehicles Available`,
          badge: s.vehicle_count > 20 ? 'Major Fleet' : 'Verified Partner',
        }));

        const topCountries: SkyItem[] = [
          { type: 'country', name: 'Saudi Arabia', countryName: 'Saudi Arabia', flagIso: 'sa', countText: 'Riyadh & Jeddah Hubs', badge: 'Top Destination' },
          { type: 'country', name: 'UAE & Dubai', countryName: 'United Arab Emirates', flagIso: 'ae', countText: 'Major Fleet Hub', badge: 'Active Fleet' },
          { type: 'country', name: 'Jordan', countryName: 'Jordan', flagIso: 'jo', countText: 'Amman & Aqaba Hubs', badge: 'Scenic Routes' },
          { type: 'country', name: 'Qatar', countryName: 'Qatar', flagIso: 'qa', countText: 'Doha Airport & City Hubs', badge: 'Executive Fleet' },
        ];

        const combined: SkyItem[] = [];
        const maxLen = Math.max(topCountries.length, mapped.length);
        for (let i = 0; i < maxLen; i++) {
          if (topCountries[i]) combined.push(topCountries[i]);
          if (mapped[i]) combined.push(mapped[i]);
        }
        return combined;
      }
    }
    return dynamicSkyItems;
  }, [filteredSuppliers, dynamicSkyItems]);

  // Dynamic calculations for badge counts
  const realSupplierCount = filteredSuppliers?.length || dynamicStats.suppliers;
  const realVehicleCount = vehicles?.length || dynamicStats.cars;

  useEffect(() => {
    // Fast, natural flight progress
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        const step = prev < 45 ? 3.5 : prev < 75 ? 2.0 : prev < 90 ? 1.2 : 0.5;
        return Math.min(prev + step, 98);
      });
    }, 45);

    // Rotate the floating sky cards behind the jet every 1600ms
    const itemTimer = setInterval(() => {
      setActiveItemIndex((prev) => (prev + 1) % (activeFleetItems.length || 1));
    }, 1600);

    return () => {
      clearInterval(progressTimer);
      clearInterval(itemTimer);
    };
  }, [activeFleetItems.length]);

  const activeItem = activeFleetItems[activeItemIndex % activeFleetItems.length] || DEFAULT_FALLBACK_ITEMS[0];
  const flagIsoCode = (activeItem.flagIso || getCountryIso(activeItem.countryName || activeItem.name) || 'sa').toLowerCase();

  return (
    <div
      className={`flex flex-col items-center justify-center bg-radial from-amber-50/60 via-white to-gray-50/80 text-gray-900 overflow-hidden select-none transition-opacity duration-300 ${
        fullScreen ? 'fixed inset-0 z-[9999]' : 'w-full py-16'
      }`}
    >
      {/* ── Dynamic Sky Atmosphere & Floating Light Clouds ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ambient Warm Sun Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-primary/15 rounded-full blur-3xl" />

        {/* Floating Light Clouds */}
        <motion.div
          animate={{ x: ['100vw', '-100vw'] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          className="absolute top-16 text-gray-200/70"
        >
          <Cloud size={130} />
        </motion.div>
        <motion.div
          animate={{ x: ['100vw', '-100vw'] }}
          transition={{ repeat: Infinity, duration: 28, delay: 5, ease: 'linear' }}
          className="absolute top-48 text-gray-150/60"
        >
          <Cloud size={170} />
        </motion.div>
        <motion.div
          animate={{ x: ['100vw', '-100vw'] }}
          transition={{ repeat: Infinity, duration: 16, delay: 2, ease: 'linear' }}
          className="absolute bottom-28 text-gray-200/60"
        >
          <Cloud size={110} />
        </motion.div>
      </div>

      <div className="relative w-full max-w-xl px-4 sm:px-6 flex flex-col items-center z-10 space-y-6">
        {/* ── Brand Logo Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-gray-900">
              AUT<span className="text-primary italic">O</span>URS
            </h1>
            <div className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-300 text-amber-800 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
              <Compass size={12} className="animate-spin text-amber-600" style={{ animationDuration: '6s' }} />
              Global Fleet Jet
            </div>
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Connecting Top Destinations & Verified Suppliers
          </p>
        </motion.div>

        {/* ── Airplane Flight Animation Canvas ── */}
        <div className="w-full relative py-4 flex flex-col items-center">
          {/* Main Flight Path Container */}
          <div className="relative w-full max-w-lg flex items-center justify-between min-h-[160px]">
            
            {/* Trailing Golden Contrail & Floating Badges Emitter */}
            <div className="absolute left-2 sm:left-6 right-24 sm:right-32 top-1/2 -translate-y-1/2 flex items-center justify-end pointer-events-none">
              {/* Contrail Vapor Lines */}
              <div className="w-full flex flex-col gap-1.5 opacity-80">
                <motion.div
                  animate={{ opacity: [0.4, 0.9, 0.4], scaleX: [0.95, 1, 0.95] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="h-[3px] w-full bg-gradient-to-l from-primary via-amber-300 to-transparent rounded-full shadow-[0_0_10px_rgba(244,216,73,0.9)]"
                />
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3], scaleX: [1, 0.9, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, delay: 0.2 }}
                  className="h-[1.5px] w-4/5 ml-auto bg-gradient-to-l from-amber-400 via-amber-200 to-transparent rounded-full"
                />
              </div>

              {/* Floating Country & Supplier Card emitted from the Jet */}
              <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeItem.name}
                    initial={{ opacity: 0, scale: 0.6, x: 50 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -70 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-gray-200 px-4 py-2.5 rounded-2xl shadow-xl shadow-gray-300/50"
                  >
                    {/* Badge Icon / Logo / Flag Image */}
                    <div className="relative w-11 h-8 rounded-lg overflow-hidden bg-gray-50 border border-gray-200/90 flex items-center justify-center shrink-0 shadow-2xs p-0.5">
                      {activeItem.type === 'country' ? (
                        <img
                          src={`https://flagcdn.com/w80/${flagIsoCode}.png`}
                          alt={activeItem.name}
                          className="w-full h-full object-cover rounded-md"
                          loading="eager"
                        />
                      ) : activeItem.logoUrl ? (
                        <img
                          src={activeItem.logoUrl}
                          alt={activeItem.name}
                          className="w-full h-full object-contain"
                          loading="eager"
                        />
                      ) : (
                        <Building2 size={18} className="text-amber-600" />
                      )}
                    </div>

                    {/* Name & Subtitle */}
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs sm:text-sm font-black text-gray-900 truncate">
                          {activeItem.name}
                        </p>
                        {activeItem.badge && (
                          <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary/20 text-gray-900 border border-primary/40">
                            {activeItem.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-semibold text-gray-400 truncate">
                        {activeItem.countText}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* The 3D Floating Jet Airplane in Brand Yellow */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, -1.5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.8,
                ease: 'easeInOut',
              }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30"
            >
              <div className="relative">
                {/* Airplane in Brand Primary Color with Yellow Shadow */}
                <div className="relative text-gray-900 drop-shadow-[0_8px_16px_rgba(244,216,73,0.8)] filter">
                  <Plane size={54} className="rotate-45 text-gray-900" fill="#f4d849" stroke="#111827" strokeWidth={1.5} />
                </div>

                {/* Jet Engine Glow Particle */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 0.3 }}
                  className="absolute -bottom-1 -left-2 w-3.5 h-3.5 bg-amber-400 rounded-full blur-xs"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Real Dynamic Stats Badges ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full flex items-center justify-center gap-2 sm:gap-3 flex-wrap"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold shadow-xs">
            <MapPin size={13} className="text-amber-600" />
            <span>{dynamicStats.countries}+ Countries</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold shadow-xs">
            <Building2 size={13} className="text-amber-600" />
            <span>{realSupplierCount}+ Active Suppliers</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
            <Car size={13} className="text-amber-600" />
            <span>{realVehicleCount}+ Live Vehicles</span>
          </div>
        </motion.div>

        {/* ── Flight Navigation Progress Bar & Status ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="w-full max-w-md space-y-2 pt-1"
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-gray-600">
              <Sparkles size={13} className="text-primary animate-pulse" />
              Scanning live fleet availability...
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

          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 pt-0.5 tracking-wider">
            <span>FLIGHT RADAR ACTIVE</span>
            <span>AUTOURS FAST BOOKING</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
