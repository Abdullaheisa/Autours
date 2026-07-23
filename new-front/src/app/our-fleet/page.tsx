'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Car, Loader2 } from 'lucide-react';
import Image from 'next/image';

import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { RootState } from '@/store';
import { apiClient } from '@/services/api/axiosClient';
import { vehicleMapper } from '@/services/mappers/vehicleMapper';
import { assets } from '@/config/assets';
import { getVehicleImageUrl } from '@/utils/getImageUrl';
import { formatPrice } from '@/utils/currency';

const WORLD_CATEGORY_ORDER = ['mini', 'small', 'standard', 'economy', 'full size', 'compact suv', 'suv', 'van', 'family', 'luxury'];

interface CategoryDetails {
  badge: string;
  badgeAr: string;
}

function getCategoryDetails(categoryName: string): CategoryDetails {
  const name = categoryName.toLowerCase();
  if (name.includes('suv') || name.includes('crossover') || name.includes('4x4')) {
    return { badge: 'Family & Terrain', badgeAr: 'للعائلات والطرق الوعرة' };
  }
  if (name.includes('mini') || name.includes('small')) {
    return { badge: 'Budget & City', badgeAr: 'اقتصادية للمدينة' };
  }
  if (name.includes('economy') || name.includes('compact')) {
    return { badge: 'Most Popular', badgeAr: 'الأكثر شعبية' };
  }
  if (name.includes('full') || name.includes('standard') || name.includes('sedan') || name.includes('large')) {
    return { badge: 'Executive Comfort', badgeAr: 'راحة رجال الأعمال' };
  }
  if (name.includes('luxury') || name.includes('premium') || name.includes('exotic')) {
    return { badge: 'VIP & Performance', badgeAr: 'عائلية فخمة وللمناسبات' };
  }
  if (name.includes('van') || name.includes('minivan') || name.includes('bus') || name.includes('family')) {
    return { badge: 'Group & Family', badgeAr: 'للمجموعات والعائلات الكبيرة' };
  }
  return { badge: 'Reliable Fleet', badgeAr: 'أسطول عملي ومعتمد' };
}

interface EstimatedSpecs {
  seats: string;
  seatsAr: string;
  doors: string;
  doorsAr: string;
  luggage: string;
  luggageAr: string;
}

function getEstimatedSpecs(categoryName: string, dbSeats?: any, dbDoors?: any, dbLuggage?: any): EstimatedSpecs {
  const name = categoryName.toLowerCase();
  
  const hasDbSeats = dbSeats !== undefined && dbSeats !== null && parseInt(dbSeats) > 0;
  const hasDbDoors = dbDoors !== undefined && dbDoors !== null && parseInt(dbDoors) > 0;
  const hasDbLuggage = dbLuggage !== undefined && dbLuggage !== null && dbLuggage !== '' && dbLuggage !== 'N/A';

  const formatLuggage = (val: any) => {
    if (!val) return null;
    const s = val.toString().trim();
    if (/^\d+$/.test(s)) {
      const num = parseInt(s) || 2;
      return {
        en: `${num} ${num > 1 ? 'Bags' : 'Bag'}`,
        ar: `${num} ${num > 1 ? 'حقائب' : 'حقيبة'}`
      };
    }
    const lower = s.toLowerCase();
    if (lower === 'small') return { en: 'Small Bag', ar: 'حقيبة صغيرة' };
    if (lower === 'medium') return { en: 'Medium Bag', ar: 'حقيبة متوسطة' };
    if (lower === 'large') return { en: 'Large Bag', ar: 'حقيبة كبيرة' };
    return { en: s, ar: s };
  };

  const formattedLuggage = formatLuggage(dbLuggage);

  let defaultSeats = 5;
  let defaultDoors = 4;
  let defaultLuggageEn = '2-3 Bags';
  let defaultLuggageAr = '2-3 حقائب';

  if (name.includes('mini') || name.includes('small')) {
    defaultSeats = 4;
    defaultDoors = 4;
    defaultLuggageEn = '1 Bag';
    defaultLuggageAr = 'حقيبة واحدة';
  } else if (name.includes('suv') || name.includes('crossover') || name.includes('4x4')) {
    defaultSeats = 5;
    defaultDoors = 5;
    defaultLuggageEn = '4 Bags';
    defaultLuggageAr = '4 حقائب';
  } else if (name.includes('van') || name.includes('minivan') || name.includes('bus') || name.includes('family')) {
    defaultSeats = 7;
    defaultDoors = 5;
    defaultLuggageEn = '5+ Bags';
    defaultLuggageAr = '5+ حقائب';
  }

  return {
    seats: hasDbSeats ? `${dbSeats} Seats` : `${defaultSeats} Seats`,
    seatsAr: hasDbSeats ? `${dbSeats} مقاعد` : `${defaultSeats} مقاعد`,
    doors: hasDbDoors ? `${dbDoors} Doors` : `${defaultDoors} Doors`,
    doorsAr: hasDbDoors ? `${dbDoors} أبواب` : `${defaultDoors} أبواب`,
    luggage: hasDbLuggage && formattedLuggage ? formattedLuggage.en : defaultLuggageEn,
    luggageAr: hasDbLuggage && formattedLuggage ? formattedLuggage.ar : defaultLuggageAr,
  };
}

export default function OurFleetPage() {
  const { currentLanguage } = useSelector((state: RootState) => state.ui);
  const { code: currencyCode, allRates } = useSelector((state: RootState) => state.currency);
  const isRTL = currentLanguage === 'ar';

  const [fleetCategories, setFleetCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
              params: {
                category_id: cat.id,
                sort_by: 'price',
                sort_order: 'asc',
                min_price: 1,
                per_page: 1,
                paginate: 1
              }
            });
            const rawList = (vRes as any)?.data || [];
            const localList = vehicleMapper.toLocalList(rawList);
            const vehicle = localList[0] || null;
            if (vehicle && rawList[0]) {
              (vehicle as any).price = parseFloat(rawList[0].price) || 0;
              (vehicle as any).month_price = parseFloat(rawList[0].month_price) || 0;
              (vehicle as any).profit = rawList[0].profit || null;
            }
            return {
              ...cat,
              vehicle
            };
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
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="flex-grow">
        {/* Banner Section */}
        <section className="relative bg-slate-950 text-white py-14 sm:py-20 overflow-hidden">
          {/* Background Image with Smooth Fade */}
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
                {isRTL ? 'أسطول السيارات المتوفر' : 'Available Fleet Categories'}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase italic mb-3 font-title">
                {isRTL ? (
                  <>أسطولنا <span className="text-primary">المتميز</span></>
                ) : (
                  <>Our Premium <span className="text-primary">Fleet</span></>
                )}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-xl mx-auto">
                {isRTL 
                  ? 'استعرض جميع فئات السيارات المتاحة لدينا مع أفضل أسعار التأجير والسيارات الممثلة لكل فئة.'
                  : 'Browse all available vehicle categories with best rental rates and representative models.'
                }
              </p>
            </motion.div>
          </div>
        </section>

        {/* Fleet Categories 3-Column Grid */}
        <section className="py-8 md:py-12 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-sm font-bold">{isRTL ? 'جاري تحميل فئات الأسطول...' : 'Loading fleet categories...'}</span>
              </div>
            ) : fleetCategories.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 max-w-lg mx-auto shadow-sm p-8">
                <Car className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-black text-slate-800 mb-2">
                  {isRTL ? 'لا توجد فئات متوفرة' : 'No Categories Available'}
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {fleetCategories.map((cat) => {
                  const details = getCategoryDetails(cat.name);
                  const specs = getEstimatedSpecs(cat.name, cat.vehicle?.seats, cat.vehicle?.doors, cat.vehicle?.suitcases);

                  // Dynamic Currency Price Conversion (with monthly daily profit markup commission)
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
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    >
                      {/* 1. Header Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="bg-primary text-gray-950 text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-2xs">
                          {cat.name}
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          {isRTL ? details.badgeAr : details.badge}
                        </span>
                      </div>

                      {/* 2. Car Image */}
                      <div className="relative w-full h-40 my-3 flex items-center justify-center">
                        <Image
                          src={getVehicleImageUrl(cat.vehicle.photo)}
                          alt={cat.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 350px"
                        />
                      </div>

                      {/* 3. Model Name & Supplier */}
                      <div className="text-center mb-4">
                        <h3 className="text-base font-black text-slate-900 leading-snug mb-1.5">
                          {cat.vehicle.name}
                        </h3>
                        
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100/80 px-2.5 py-0.5 rounded-full border border-slate-200/50">
                          {isRTL 
                            ? `أرخص عرض من: ${cat.vehicle.supplier.company}`
                            : `Cheapest by: ${cat.vehicle.supplier.company}`
                          }
                        </span>
                      </div>

                      {/* 4. Bottom Footer: Price & Specs Container */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150/70 flex flex-col gap-2.5">
                        
                        {/* Price Line */}
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            {isRTL ? 'يبدأ من' : 'Starting from'}
                          </span>
                          <span className="text-base font-black text-slate-900">
                            {priceDetails}
                            <span className="text-[11px] font-bold text-slate-500">
                              {isRTL ? ' / يوم' : ' / day'}
                            </span>
                          </span>
                        </div>

                        {/* Specs Line */}
                        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200/60 text-[11px] font-bold text-slate-700 shadow-2xs">
                          <span className="flex items-center gap-1.5">
                            <img 
                              src={assets.icons.seats} 
                              alt="" 
                              className="object-contain shrink-0" 
                              style={{ width: '16px', height: '16px', filter: 'invert(88%) sepia(35%) saturate(1005%) hue-rotate(345deg) brightness(101%) contrast(92%)' }} 
                            />
                            {isRTL ? specs.seatsAr : specs.seats}
                          </span>
                          <span className="w-px h-3.5 bg-slate-200 shrink-0" />
                          <span className="flex items-center gap-1.5">
                            <img 
                              src={assets.icons.doors} 
                              alt="" 
                              className="object-contain shrink-0" 
                              style={{ width: '16px', height: '16px', filter: 'invert(88%) sepia(35%) saturate(1005%) hue-rotate(345deg) brightness(101%) contrast(92%)' }} 
                            />
                            {isRTL ? specs.doorsAr : specs.doors}
                          </span>
                          <span className="w-px h-3.5 bg-slate-200 shrink-0" />
                          <span className="flex items-center gap-1.5">
                            <img 
                              src={assets.icons.bags} 
                              alt="" 
                              className="object-contain shrink-0" 
                              style={{ width: '18px', height: '18px', filter: 'invert(88%) sepia(35%) saturate(1005%) hue-rotate(345deg) brightness(101%) contrast(92%)' }} 
                            />
                            {isRTL ? specs.luggageAr : specs.luggage}
                          </span>
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
