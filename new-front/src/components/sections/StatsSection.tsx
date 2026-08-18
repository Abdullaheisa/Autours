'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Globe2, Landmark, Plane, Store, MapPin, Car } from 'lucide-react';
import { CLIENT_API_BASE, SERVER_API_BASE } from '@/config/api';

interface StatData {
  countries: number;
  cities: number;
  airports: number;
  suppliers: number;
  branches: number;
  cars: number;
}

const DEFAULT_STATS: StatData = {
  countries: 58,
  cities: 679,
  airports: 363,
  suppliers: 25,
  branches: 790,
  cars: 7730,
};

export default function StatsSection() {
  const [stats, setStats] = useState<StatData>(DEFAULT_STATS);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-40px' });
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${CLIENT_API_BASE}/stats`, { cache: 'no-store' }).catch(() => null);
        if (res && res.ok) {
          const json = await res.json();
          if (json?.data) {
            setStats(json.data);
            return;
          }
        }
        
        const serverRes = await fetch(`${SERVER_API_BASE}/stats`, { cache: 'no-store' }).catch(() => null);
        if (serverRes && serverRes.ok) {
          const json = await serverRes.json();
          if (json?.data) {
            setStats(json.data);
          }
        }
      } catch {
        // Keeps DEFAULT_STATS if offline
      }
    }

    fetchStats();
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / (clientWidth * 0.75));
    setActiveSlide(Math.min(Math.max(index, 0), 5));
  };

  const statItems = [
    {
      id: 'countries',
      count: stats.countries || DEFAULT_STATS.countries,
      suffix: '+',
      title: 'Countries Served',
      icon: Globe2,
    },
    {
      id: 'cities',
      count: stats.cities || DEFAULT_STATS.cities,
      suffix: '+',
      title: 'Cities Covered',
      icon: Landmark,
    },
    {
      id: 'airports',
      count: stats.airports || DEFAULT_STATS.airports,
      suffix: '+',
      title: 'Available Airports',
      icon: Plane,
    },
    {
      id: 'suppliers',
      count: stats.suppliers || DEFAULT_STATS.suppliers,
      suffix: '+',
      title: 'Rental Companies',
      icon: Store,
    },
    {
      id: 'branches',
      count: stats.branches || DEFAULT_STATS.branches,
      suffix: '+',
      title: 'Global Branches',
      icon: MapPin,
    },
    {
      id: 'cars',
      count: stats.cars || DEFAULT_STATS.cars,
      suffix: '+',
      title: 'Total Cars Available',
      icon: Car,
    },
  ];

  return (
    <section 
      ref={containerRef}
      className="relative py-16 sm:py-24 overflow-hidden bg-slate-950 border-y border-white/10"
    >
      {/* Background Banner Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100 group-hover:scale-105"
        style={{ backgroundImage: "url('/img/Banner.webp')" }}
      />

      {/* Balanced Overlay (slightly darker for crisp overall contrast, but not too dark) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/55" />

      <div className="relative z-10 max-w-7xl xl:max-w-[94rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/25 text-amber-300 text-[11px] md:text-xs font-black tracking-wider uppercase mb-3 border border-amber-400/40 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>GLOBAL CAR RENTAL NETWORK</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3 drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)]"
          >
            Worldwide Car Rental Network &amp; Global Coverage
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-gray-100 text-xs sm:text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
          >
            Compare and book top car rental deals from trusted international and local suppliers across thousands of airports, city centers, and global pickup locations.
          </motion.p>
        </div>

        {/* 6 Frosted Glass Cards (Lighter & Airy) */}
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {statItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 25 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.05 * idx, ease: [0.16, 1, 0.3, 1] }}
                  className="snap-center shrink-0 w-[72vw] sm:w-[220px] md:w-auto bg-white/[0.10] hover:bg-white/[0.18] backdrop-blur-[2px] border border-white/25 hover:border-amber-400/60 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg shadow-black/20 hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-between text-center group hover:-translate-y-1.5"
                >
                  {/* Top Yellow Icon Badge */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-gray-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-400/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 mb-3">
                    <Icon size={22} className="stroke-[2.5]" />
                  </div>

                  {/* Number & Title */}
                  <div className="min-w-0 flex-1 flex flex-col items-center justify-center">
                    <div className="flex items-baseline justify-center text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black text-white tracking-tight leading-none mb-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      <AnimatedCounter value={item.count} start={isInView} />
                      <span className="text-amber-400 font-extrabold text-lg sm:text-xl ml-1 align-top drop-shadow-sm">
                        {item.suffix}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-[13px] font-bold text-gray-100 group-hover:text-white leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                      {item.title}
                    </h3>
                  </div>

                  {/* Animated Yellow / Orange Underline with Flowing Light Beam ("كأنه ماشي") */}
                  <div className="relative w-full h-1 sm:h-1.5 bg-white/15 rounded-full overflow-hidden mt-4 group-hover:shadow-[0_0_12px_rgba(251,191,36,0.9)] transition-all duration-500">
                    <div className="w-full h-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 rounded-full transition-transform duration-500 group-hover:scale-x-105" />
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile Pagination Dots */}
          <div className="flex md:hidden justify-center items-center gap-1.5 mt-3">
            {statItems.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === i ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

function AnimatedCounter({ value, start }: { value: number; start: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    const duration = 2200; // 2.2s for smooth gradual counting

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Quartic ease-out for gradual, elegant deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easedProgress * value));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(step);
  }, [value, start]);

  return <span>{displayValue.toLocaleString()}</span>;
}
