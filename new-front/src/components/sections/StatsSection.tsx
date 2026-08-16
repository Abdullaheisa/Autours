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
  airports: 356,
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
      count: stats.countries,
      suffix: '+',
      title: 'Countries Served',
      icon: Globe2,
    },
    {
      id: 'cities',
      count: stats.cities,
      suffix: '+',
      title: 'Cities Covered',
      icon: Landmark,
    },
    {
      id: 'airports',
      count: stats.airports,
      suffix: '+',
      title: 'Available Airports',
      icon: Plane,
    },
    {
      id: 'suppliers',
      count: stats.suppliers,
      suffix: '+',
      title: 'Rental Companies',
      icon: Store,
    },
    {
      id: 'branches',
      count: stats.branches,
      suffix: '+',
      title: 'Global Branches',
      icon: MapPin,
    },
    {
      id: 'cars',
      count: stats.cars,
      suffix: '+',
      title: 'Total Cars Available',
      icon: Car,
    },
  ];

  return (
    <section 
      ref={containerRef}
      className="py-10 md:py-14 bg-white relative border-y border-gray-100"
    >
      <div className="max-w-7xl xl:max-w-[92rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SEO-Optimized Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-gray-900 text-[11px] md:text-xs font-black tracking-wider uppercase mb-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>GLOBAL CAR RENTAL NETWORK</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-2"
          >
            Worldwide Car Rental Network & Global Coverage
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-gray-500 text-xs sm:text-sm md:text-base font-medium max-w-2xl mx-auto"
          >
            Compare and book top car rental deals from trusted international and local suppliers across thousands of airports, city centers, and global pickup locations.
          </motion.p>
        </div>

        {/* 📱 Mobile: Swipeable Horizontal Slider | 💻 Desktop: Balanced Side-by-Side Cards */}
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
                  initial={{ opacity: 0, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.04 * idx }}
                  className="snap-center shrink-0 w-[75vw] sm:w-[240px] md:w-auto bg-gray-50/80 hover:bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/70 hover:border-primary/80 hover:shadow-lg transition-all duration-300 flex items-center gap-3.5 group"
                >
                  {/* Prominent Yellow Icon Badge */}
                  <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-xl bg-primary text-gray-950 flex items-center justify-center shrink-0 shadow-md shadow-primary/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Icon size={22} className="stroke-[2.5]" />
                  </div>

                  {/* Number & Title */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-0.5 text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">
                      <AnimatedCounter value={item.count} start={isInView} />
                      <span className="text-amber-500 font-extrabold text-base">{item.suffix}</span>
                    </div>

                    <h3 className="text-xs font-black text-gray-800 group-hover:text-gray-950 leading-tight">
                      {item.title}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 📱 Mobile Pagination Dots Indicator */}
          <div className="flex md:hidden justify-center items-center gap-1.5 mt-2">
            {statItems.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === i ? 'w-5 bg-primary' : 'w-1.5 bg-gray-200'
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
    const duration = 1500; // 1.5s

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easedProgress = 1 - Math.pow(1 - progress, 3);
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
