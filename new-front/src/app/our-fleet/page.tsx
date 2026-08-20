'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Car, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';

import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { RootState } from '@/store';
import { apiClient } from '@/services/api/axiosClient';
import { vehicleMapper } from '@/services/mappers/vehicleMapper';
import { assets } from '@/config/assets';
import { getVehicleImageUrl } from '@/utils/getImageUrl';
import { formatPrice } from '@/utils/currency';

const WORLD_CATEGORY_ORDER = ['mini', 'small', 'standard', 'economy', 'full size', 'compact suv', 'suv', 'van', 'family', 'luxury'];

function getCategoryBadge(categoryName: string): string {
  const name = categoryName.toLowerCase();
  if (name.includes('suv') || name.includes('crossover') || name.includes('4x4')) return 'Family & Terrain';
  if (name.includes('mini') || name.includes('small')) return 'Budget & City';
  if (name.includes('economy') || name.includes('compact')) return 'Most Popular';
  if (name.includes('full') || name.includes('standard') || name.includes('sedan') || name.includes('large')) return 'Executive Comfort';
  if (name.includes('luxury') || name.includes('premium') || name.includes('exotic')) return 'VIP & Performance';
  if (name.includes('van') || name.includes('minivan') || name.includes('bus') || name.includes('family')) return 'Group & Family';
  return 'Reliable Fleet';
}

interface EstimatedSpecs {
  seats: string;
  doors: string;
  luggage: string;
}

function getEstimatedSpecs(categoryName: string, dbSeats?: any, dbDoors?: any, dbLuggage?: any): EstimatedSpecs {
  const name = categoryName.toLowerCase();

  const hasDbSeats = dbSeats !== undefined && dbSeats !== null && parseInt(dbSeats) > 0;
  const hasDbDoors = dbDoors !== undefined && dbDoors !== null && parseInt(dbDoors) > 0;
  const hasDbLuggage = dbLuggage !== undefined && dbLuggage !== null && dbLuggage !== '' && dbLuggage !== 'N/A';

  const formatLuggage = (val: any): string | null => {
    if (!val) return null;
    const s = val.toString().trim();
    if (/^\d+$/.test(s)) {
      const num = parseInt(s) || 2;
      return `${num} ${num > 1 ? 'Bags' : 'Bag'}`;
    }
    const lower = s.toLowerCase();
    if (lower === 'small') return 'Small Bag';
    if (lower === 'medium') return 'Medium Bag';
    if (lower === 'large') return 'Large Bag';
    return s;
  };

  const formattedLuggage = formatLuggage(dbLuggage);

  let defaultSeats = 5;
  let defaultDoors = 4;
  let defaultLuggage = '2-3 Bags';

  if (name.includes('mini') || name.includes('small')) {
    defaultSeats = 4; defaultDoors = 4; defaultLuggage = '1 Bag';
  } else if (name.includes('suv') || name.includes('crossover') || name.includes('4x4')) {
    defaultSeats = 5; defaultDoors = 5; defaultLuggage = '4 Bags';
  } else if (name.includes('van') || name.includes('minivan') || name.includes('bus') || name.includes('family')) {
    defaultSeats = 7; defaultDoors = 5; defaultLuggage = '5+ Bags';
  }

  return {
    seats: hasDbSeats ? `${dbSeats} Seats` : `${defaultSeats} Seats`,
    doors: hasDbDoors ? `${dbDoors} Doors` : `${defaultDoors} Doors`,
    luggage: hasDbLuggage && formattedLuggage ? formattedLuggage : defaultLuggage,
  };
}

export default function OurFleetPage() {
  const { code: currencyCode, allRates } = useSelector((state: RootState) => state.currency);

  const [fleetCategories, setFleetCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesc, setSelectedDesc] = useState<{ name: string; text: string } | null>(null);

  const cleanHtml = (html: string) => {
    if (!html) return '';
    // Remove class and style attributes which might be pasted from other pages
    return html
      .replace(/\s*class="[^"]*"/gi, '')
      .replace(/\s*style="[^"]*"/gi, '');
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCategoriesAndRepresentatives = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/get/categories');
        const rawCategories = (res as any)?.data || res || [];

        const sortedCategories = [...rawCategories].sort((a, b) => {
          const indexA = WORLD_CATEGORY_ORDER.indexOf((a.name || '').toLowerCase().trim());
          const indexB = WORLD_CATEGORY_ORDER.indexOf((b.name || '').toLowerCase().trim());
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return (a.name || '').localeCompare(b.name || '');
        });

        const promises = sortedCategories.map(async (cat) => {
          try {
            const vRes = await apiClient.get('/get/vehicles', {
              params: { category_id: cat.id, sort_by: 'price', sort_order: 'asc', min_price: 1, per_page: 1, paginate: 1 }
            });
            const rawList = (vRes as any)?.data || [];
            const localList = vehicleMapper.toLocalList(rawList);
            const vehicle = localList[0] || null;
            if (vehicle && rawList[0]) {
              (vehicle as any).price = parseFloat(rawList[0].price) || 0;
              (vehicle as any).month_price = parseFloat(rawList[0].month_price) || 0;
              (vehicle as any).profit = rawList[0].profit || null;
            }
            return { ...cat, vehicle };
          } catch (e) {
            console.warn(`Failed to fetch representative for category ${cat.name}:`, e);
            return { ...cat, vehicle: null };
          }
        });

        const completedList = await Promise.all(promises);
        setFleetCategories(completedList.filter(item => item.vehicle !== null));
      } catch (err) {
        console.error('Failed to load categories/representatives:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndRepresentatives();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-grow">
        {/* Banner Section */}
        <section className="relative bg-slate-950 text-white py-14 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={assets.hero.background}
              alt="Autours Fleet"
              fill
              priority
              className="object-cover object-center opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-[#f8fafc]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block bg-primary/20 text-primary border border-primary/30 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3">
                Available Fleet Categories
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase italic mb-3 font-title">
                Our Premium <span className="text-primary">Fleet</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-xl mx-auto">
                Browse all available vehicle categories with best rental rates and representative models.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Fleet Categories Stacked List */}
        <section className="py-12 md:py-20 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-sm font-bold">Loading fleet categories...</span>
              </div>
            ) : fleetCategories.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 max-w-lg mx-auto shadow-sm p-8">
                <Car className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-black text-slate-800 mb-2">No Categories Available</h3>
              </div>
            ) : (
              <div className="space-y-12">
                {fleetCategories.map((cat, index) => {
                  const badge = getCategoryBadge(cat.name);
                  const specs = getEstimatedSpecs(cat.name, cat.vehicle?.seats, cat.vehicle?.doors, cat.vehicle?.suitcases);

                  const rawPrice = parseFloat(cat.vehicle?.price) || 0;
                  const monthPrice = parseFloat(cat.vehicle?.month_price) || 0;
                  const perDayProfit = parseFloat(cat.vehicle?.profit?.per_day_profit) || 0;
                  const perMonthProfit = parseFloat(cat.vehicle?.profit?.per_month_profit) || 0;

                  let priceWithCommission = 0;
                  if (monthPrice > 0) {
                    priceWithCommission = monthPrice + (monthPrice * perMonthProfit) / 100;
                  } else {
                    priceWithCommission = rawPrice + (rawPrice * perDayProfit) / 100;
                  }

                  const vehicleCurrency = cat.vehicle?.baseCurrency || 'AED';
                  let convertedPrice = priceWithCommission;
                  if (vehicleCurrency !== currencyCode && allRates) {
                    const rateToUsd = allRates[vehicleCurrency] || 1;
                    const priceInUsd = priceWithCommission / rateToUsd;
                    const targetRate = allRates[currencyCode] || 1;
                    convertedPrice = priceInUsd * targetRate;
                  }
                  const priceDetails = formatPrice(Math.round(convertedPrice), currencyCode);

                  return (
                    <div
                      key={cat.id}
                      className="bg-white rounded-3xl border border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 md:p-8 items-stretch">
                        
                        {/* Left Column: Details, Description, Specs & Price (lg:col-span-8) */}
                        <div className="lg:col-span-8 flex flex-col justify-between space-y-4 order-2 lg:order-1">
                          
                          {/* Title & Badge */}
                          <div className="space-y-1">
                            <span className="text-[10px] md:text-xs font-black text-amber-600 uppercase tracking-widest block">
                              {badge}
                            </span>
                            <h3 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight uppercase italic font-title">
                              {cat.name} Category
                            </h3>
                          </div>

                          {/* Description Box — 4 line clamp + Read More */}
                          <div className="flex-grow">
                            <div className="relative">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-400 rounded-full" />
                              <div className="pl-4 pr-3 py-3 bg-slate-50 rounded-r-2xl rounded-l-none border border-l-0 border-slate-100">
                                <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed whitespace-pre-line line-clamp-4">
                                  {cat.description
                                    ? cat.description
                                    : `Browse our premium ${cat.name} vehicle category. Autours offers the best rental rates, instant confirmation, and direct pickup options.`}
                                </p>
                                {cat.description && cat.description.length > 200 && (
                                  <button
                                    onClick={() => setSelectedDesc({ name: cat.name, text: cat.description })}
                                    className="mt-2 text-[10px] font-black text-amber-700 hover:text-amber-900 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                  >
                                    Read More →
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Footer Row: Specs & Price */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                            
                            {/* Specs Pills */}
                            <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-[11px] font-bold text-slate-650">
                              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/50">
                                <img
                                  src={assets.icons.seats}
                                  alt="Seats"
                                  className="object-contain shrink-0"
                                  style={{ width: '15px', height: '15px', filter: 'invert(88%) sepia(35%) saturate(1005%) hue-rotate(345deg) brightness(101%) contrast(92%)' }}
                                />
                                {specs.seats}
                              </span>
                              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/50">
                                <img
                                  src={assets.icons.doors}
                                  alt="Doors"
                                  className="object-contain shrink-0"
                                  style={{ width: '15px', height: '15px', filter: 'invert(88%) sepia(35%) saturate(1005%) hue-rotate(345deg) brightness(101%) contrast(92%)' }}
                                />
                                {specs.doors}
                              </span>
                              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/50">
                                <img
                                  src={assets.icons.bags}
                                  alt="Luggage"
                                  className="object-contain shrink-0"
                                  style={{ width: '15px', height: '15px', filter: 'invert(88%) sepia(35%) saturate(1005%) hue-rotate(345deg) brightness(101%) contrast(92%)' }}
                                />
                                {specs.luggage}
                              </span>
                            </div>

                            {/* Starting Price */}
                            <div className="text-left sm:text-right shrink-0">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Starting from</span>
                              <p className="text-lg md:text-xl font-black text-slate-900 leading-none mt-1">
                                {priceDetails}
                                <span className="text-xs font-bold text-slate-500"> / day</span>
                              </p>
                            </div>

                          </div>

                        </div>

                        {/* Right Column: Representative Car Card — appears FIRST on mobile */}
                        <div className="lg:col-span-4 order-1 lg:order-2 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between items-center text-center relative min-h-[200px]">
                          <span className="absolute top-3 left-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm z-10">
                            {cat.name}
                          </span>
                          
                          <div className="relative w-full h-36 md:h-44 flex items-center justify-center mt-2">
                            <Image
                              src={getVehicleImageUrl(cat.vehicle.photo)}
                              alt={cat.name}
                              fill
                              className="object-contain hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, 300px"
                            />
                          </div>

                          <div className="space-y-0.5 mt-2">
                            <h4 className="text-sm md:text-base font-extrabold text-slate-800 tracking-tight leading-snug">
                              {cat.vehicle.name}
                            </h4>
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200/60">
                              Cheapest by: <span className="text-slate-800 font-bold">{cat.vehicle.supplier.company}</span>
                            </span>
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

      {/* Description Full-Text Popup Modal */}
      {selectedDesc && (
        <div
          className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedDesc(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

          {/* Modal Card */}
          <div
            className="relative w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block">Category Overview</span>
                <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">{selectedDesc.name} Category</h3>
              </div>
              <button
                onClick={() => setSelectedDesc(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5 flex-grow">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-400 rounded-full" />
                <p className="pl-5 text-slate-600 text-sm font-medium leading-7 whitespace-pre-line">
                  {selectedDesc.text}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setSelectedDesc(null)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
