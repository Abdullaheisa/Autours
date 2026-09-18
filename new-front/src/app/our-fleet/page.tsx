'use client';

import { useState, useEffect } from 'react';
import { Car, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { apiClient } from '@/services/api/axiosClient';
import { assets } from '@/config/assets';
import { BACKEND_URL } from '@/config/api';

const WORLD_CATEGORY_ORDER = ['mini', 'small', 'standard', 'economy', 'full size', 'compact suv', 'suv', 'van', 'family', 'luxury'];

function getCategoryBadge(categoryName: string): string {
  const name = (categoryName || '').toLowerCase();
  if (name.includes('suv') || name.includes('crossover') || name.includes('4x4')) return 'Family & Terrain';
  if (name.includes('mini') || name.includes('small')) return 'Budget & City';
  if (name.includes('economy') || name.includes('compact')) return 'Most Popular';
  if (name.includes('full') || name.includes('standard') || name.includes('sedan') || name.includes('large')) return 'Executive Comfort';
  if (name.includes('luxury') || name.includes('premium') || name.includes('exotic')) return 'VIP & Performance';
  if (name.includes('van') || name.includes('minivan') || name.includes('bus') || name.includes('family')) return 'Group & Family';
  return 'Reliable Fleet';
}

interface FleetVehicleItem {
  id: number;
  category_name: string;
  badge?: string | null;
  car_name: string;
  photo?: string | null;
  price: number;
  currency: string;
  supplier_name?: string | null;
  seats?: string | null;
  doors?: string | null;
  luggage?: string | null;
  description?: string | null;
  order: number;
  active: boolean;
}

export default function OurFleetPage() {
  const [fleetItems, setFleetItems] = useState<FleetVehicleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchFleetData = async () => {
      try {
        setLoading(true);
        // Fetch from dedicated Fleet Vehicles API
        const res: any = await apiClient.get('/get/fleet', {
          params: { active_only: 1 }
        });
        const rawData = res?.data || res || [];
        const items: FleetVehicleItem[] = Array.isArray(rawData) ? rawData : [];

        // Sort items according to order or world category order
        const sorted = [...items].sort((a, b) => {
          if (a.order !== 0 && b.order !== 0) return a.order - b.order;
          if (a.order !== 0) return -1;
          if (b.order !== 0) return 1;
          const indexA = WORLD_CATEGORY_ORDER.indexOf((a.category_name || '').toLowerCase().trim());
          const indexB = WORLD_CATEGORY_ORDER.indexOf((b.category_name || '').toLowerCase().trim());
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return (a.category_name || '').localeCompare(b.category_name || '');
        });

        setFleetItems(sorted);
      } catch (err) {
        console.error('Failed to load fleet vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFleetData();
  }, []);

  const getCarImageUrl = (rawPhoto: string | null | undefined) => {
    if (!rawPhoto) return '/img/placeholder-car.png';
    const trimmed = rawPhoto.trim();
    if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    const clean = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    return `${BACKEND_URL}/${clean}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f7fa] text-slate-900">
      <Navbar />

      <main className="flex-grow">
        {/* Banner Section */}
        <section className="relative bg-slate-950 text-white pt-10 pb-6 sm:pt-14 sm:pb-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={assets.hero.background}
              alt="Autours Fleet"
              fill
              priority
              className="object-cover object-center opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/95 to-[#f5f7fa]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block bg-primary/20 text-primary border border-primary/30 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2.5">
                Available Fleet Categories
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase italic mb-2 font-title">
                Our Premium <span className="text-primary">Fleet</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-xl mx-auto">
                Browse all available vehicle categories with full specifications and representative models.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Fleet Categories Stacked List */}
        <section className="pt-4 pb-14 sm:pt-6 sm:pb-20 bg-[#f5f7fa]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-sm font-bold">Loading fleet categories...</span>
              </div>
            ) : fleetItems.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 max-w-lg mx-auto shadow-sm p-8">
                <Car className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-black text-slate-800 mb-2">No Categories Available</h3>
              </div>
            ) : (
              <div className="space-y-5">
                {fleetItems.map((item) => {
                  const badge = item.badge || getCategoryBadge(item.category_name);

                  // Defensive formatting for specs
                  const formatSpec = (val: string | null | undefined, defaultSuffix: string, fallback: string) => {
                    if (!val) return fallback;
                    const trimmed = String(val).trim();
                    if (/^\d+$/.test(trimmed)) {
                      return `${trimmed} ${defaultSuffix}`;
                    }
                    return trimmed;
                  };

                  const seatsText = formatSpec(item.seats, 'Seats', '4 Seats');
                  const doorsText = formatSpec(item.doors, 'Doors', '4 Doors');
                  const luggageText = item.luggage || 'Small Bag';

                  // Exact yellow color filter matching reference image
                  const yellowIconStyle = {
                    filter: 'invert(88%) sepia(35%) saturate(1005%) hue-rotate(345deg) brightness(101%) contrast(92%)',
                  };

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] items-stretch">

                        {/* ───── LEFT: Badge + Title + Description ───── */}
                        <div className="p-6 md:p-8 flex flex-col justify-center gap-4 border-b lg:border-b-0 lg:border-r border-slate-100">

                          {/* Badge + Title */}
                          <div>
                            <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest block mb-1">
                              {badge}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase italic font-title leading-tight">
                              {item.category_name} Category
                            </h3>
                          </div>

                          {/* Description Box */}
                          <div className="bg-[#f8fafc] border-l-4 border-amber-400 rounded-r-2xl p-4 sm:p-5">
                            <p className="text-slate-600 text-sm sm:text-[14.5px] leading-relaxed font-normal">
                              {(() => {
                                const desc = item.description
                                  ? item.description
                                  : `Looking for an affordable and convenient ${item.category_name.toLowerCase()} car rental? ${item.category_name} rental cars are ideal for city driving, short trips, and budget-friendly travel. Their compact size makes them easy to drive and park.`;
                                return desc.length > 500 ? desc.slice(0, 500) + '...' : desc;
                              })()}
                            </p>
                          </div>

                        </div>

                        {/* ───── RIGHT: Car Photo + Model + Specs — as a box ───── */}
                        <div className="flex flex-col items-center p-5 sm:p-6 bg-slate-50/60">

                          {/* Category Badge */}
                          <span className="self-start bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm mb-3">
                            {item.category_name}
                          </span>

                          {/* Inner box containing image + model + specs */}
                          <div className="bg-[#f8fafc] border border-slate-200/70 rounded-2xl flex flex-col items-center gap-3 p-4 w-full">
                            {/* Car Image */}
                            <img
                              src={getCarImageUrl(item.photo)}
                              alt={item.car_name}
                              className="h-[110px] sm:h-[130px] w-full object-contain hover:scale-105 transition-transform duration-500 drop-shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = assets.hero.background;
                              }}
                            />

                            {/* Divider */}
                            <div className="w-full h-px bg-slate-200/80" />

                            {/* Model Name */}
                            <h4 className="text-sm sm:text-[15px] font-black text-slate-900 tracking-tight text-center leading-snug">
                              {item.car_name}
                            </h4>

                            {/* Specs Pills */}
                            <div className="flex flex-nowrap items-center justify-center gap-1.5 w-full">
                              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm shrink-0">
                                <img src={assets.icons.seats} alt="Seats" className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] object-contain shrink-0" style={yellowIconStyle} />
                                <span className="text-[11px] sm:text-xs font-bold text-slate-800 whitespace-nowrap">{seatsText}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm shrink-0">
                                <img src={assets.icons.doors} alt="Doors" className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] object-contain shrink-0" style={yellowIconStyle} />
                                <span className="text-[11px] sm:text-xs font-bold text-slate-800 whitespace-nowrap">{doorsText}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm shrink-0">
                                <img src={assets.icons.bags} alt="Luggage" className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] object-contain shrink-0" style={yellowIconStyle} />
                                <span className="text-[11px] sm:text-xs font-bold text-slate-800 whitespace-nowrap">{luggageText}</span>
                              </div>
                            </div>
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

