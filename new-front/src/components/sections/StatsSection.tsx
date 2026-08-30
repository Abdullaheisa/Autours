'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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
    const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setActiveSlide(0);
      return;
    }
    const index = Math.round((scrollLeft / maxScroll) * 5);
    setActiveSlide(Math.min(Math.max(index, 0), 5));
  };

  const scrollToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const cards = scrollRef.current.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  const statItems = [
    {
      id: 'countries',
      count: stats.countries || DEFAULT_STATS.countries,
      suffix: '+',
      title: 'Countries Served',
    },
    {
      id: 'cities',
      count: stats.cities || DEFAULT_STATS.cities,
      suffix: '+',
      title: 'Cities Covered',
    },
    {
      id: 'airports',
      count: stats.airports || DEFAULT_STATS.airports,
      suffix: '+',
      title: 'Available Airports',
    },
    {
      id: 'suppliers',
      count: stats.suppliers || DEFAULT_STATS.suppliers,
      suffix: '+',
      title: 'Rental Companies',
    },
    {
      id: 'branches',
      count: stats.branches || DEFAULT_STATS.branches,
      suffix: '+',
      title: 'Global Branches',
    },
    {
      id: 'cars',
      count: stats.cars || DEFAULT_STATS.cars,
      suffix: '+',
      title: 'Total Cars Available',
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative py-20 sm:py-28 lg:py-36 overflow-hidden bg-slate-950 border-y border-white/10"
    >
      {/* Background Banner Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100"
        style={{ backgroundImage: "url('/img/Banner1.webp')" }}
      />

      {/* Light Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/65" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3"
          >
            Global Coverage
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-gray-100 text-xs sm:text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Compare and book top car rental deals from trusted international and local suppliers across thousands of airports, city centers, and global pickup locations.
          </motion.p>
        </div>

        {/* 6 Clean, Balanced Cards */}
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-6 gap-3 sm:gap-4 justify-start md:justify-center items-stretch overflow-x-auto md:overflow-visible snap-x snap-mandatory pt-3 pb-4 md:py-3 scrollbar-none -mx-4 px-6 sm:px-8 md:mx-0 md:px-0 scroll-pl-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {statItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.04 * idx, ease: [0.16, 1, 0.3, 1] }}
                className="snap-start shrink-0 w-[145px] sm:w-[160px] md:w-auto flex flex-col group py-1"
              >
                {/* Glass Card Box with inner bottom accent bar */}
                <div className="relative w-full flex-1 bg-white/[0.10] hover:bg-white/[0.18] backdrop-blur-[2px] border border-white/20 hover:border-amber-400/80 rounded-xl overflow-hidden shadow-lg shadow-black/20 hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-between text-center group-hover:-translate-y-1.5 min-h-[115px] sm:min-h-[125px]">
                  {/* Card Content */}
                  <div className="w-full flex-1 flex flex-col items-center justify-center py-4 px-3 sm:py-5 sm:px-4">
                    {/* Number & Suffix */}
                    <div className="flex items-baseline justify-center text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-white tracking-tight leading-none mb-2">
                      <AnimatedCounter value={item.count} start={isInView} />
                      <span className="text-amber-400 font-extrabold text-lg sm:text-xl lg:text-2xl ml-1 align-top">
                        {item.suffix}
                      </span>
                    </div>

                    {/* Title / Label */}
                    <h3 className="text-xs sm:text-[13px] md:text-sm font-bold text-gray-100 group-hover:text-white leading-tight line-clamp-2">
                      {item.title}
                    </h3>
                  </div>

                  {/* Yellow / Orange Accent Line INSIDE the Box at the bottom */}
                  <div className="w-full h-1 bg-white/10 relative overflow-hidden shrink-0 group-hover:h-1.5 transition-all duration-300">
                    <div className="w-full h-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 transition-transform duration-500 group-hover:scale-x-105" />
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Pagination Dots */}
          <div className="flex md:hidden justify-center items-center gap-1.5 mt-3.5">
            {statItems.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => scrollToSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${activeSlide === i ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/30 hover:bg-white/50'
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
