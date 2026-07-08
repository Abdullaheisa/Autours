'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCheapestVehicles } from '@/store/slices/searchSlice';
import { fallbackRates } from '@/store/slices/currencySlice';


import { getVehicleImageUrl, getLogoUrl } from '@/utils/getImageUrl';
import { Sparkles, Info } from 'lucide-react';
import { assets } from '@/config/assets';
import { vehicleApi } from '@/services/api/vehicleApi';
import { LocationBranch } from '@/types';

import { CountryPageData } from '@/data/countryPages';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import HeroSearch from '@/components/sections/HeroSearch';
import FAQ from '@/components/sections/FAQ';
import AirportsSection from './AirportsSection';
import TravelInfoSection from './TravelInfoSection';
import StepsDocsSection from './StepsDocsSection';




interface Props {
  data: CountryPageData;
}

const PartnerLogo = ({ company }: { company: { name: string; logo: string } }) => {
  const [hasError, setHasError] = useState(false);
  const logoUrl = getLogoUrl(company.logo);

  if (hasError || !logoUrl) {
    return (
      <span className="text-sm font-black text-gray-800 tracking-wider uppercase truncate max-w-full px-2">
        {company.name}
      </span>
    );
  }

  return (
    <img 
      src={logoUrl} 
      alt={company.name} 
      onError={() => setHasError(true)}
      className="w-full h-full object-contain transition-all duration-300"
    />
  );
};

export default function CountryPageContent({ data }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [locations, setLocations] = useState<LocationBranch[]>([]);
  const [isFetchingLocations, setIsFetchingLocations] = useState(true);

  // قراءة بيانات السيارات الأرخص وحالة التحميل من Redux
  const { cheapestVehicles, isFetchingCheapest } = useSelector(
    (state: RootState) => state.search
  );

  // استدعاء الباك إند فور تحميل الصفحة لجلب السيارات الأرخص
  useEffect(() => {
    dispatch(fetchCheapestVehicles());
  }, [dispatch]);

  // جلب الفروع والمطارات ديناميكياً من الباك إند للدولة الحالية فقط
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locData = await vehicleApi.getLocationsByCountry(data.slug);
        setLocations(locData);
      } catch (err) {
        console.error('Error fetching locations:', err);
      } finally {
        setIsFetchingLocations(false);
      }
    };
    loadLocations();
  }, [data.slug]);

  // الحصول على بيانات الدولة الحالية فقط (مثال: "United Arab Emirates")
  const currentCountryName = data.name; // اسم الدولة الممرر للصفحة
  const countryCheapest = cheapestVehicles ? cheapestVehicles[currentCountryName] : null;

  // جلب معلومات العملة الحالية لتحويل أسعار المطارات
  const currencyState = useSelector((state: RootState) => state.currency);
  const activeCurrency = currencyState.code; // e.g. "USD", "AED", "SAR"
  const activeSymbol = currencyState.symbol || activeCurrency;
  const rates = currencyState.allRates || {};

  // دالة تحويل العملة من عملة الفرع المحلية لعملة المستخدم المفضلة
  const convertPrice = (amount: number, fromCurrencyCode: string): number => {
    const fromCode = (fromCurrencyCode || 'AED').toUpperCase();
    const toCode = activeCurrency.toUpperCase();
    
    const fromRate = rates[fromCode] || fallbackRates[fromCode] || 1;
    const toRate = rates[toCode] || fallbackRates[toCode] || 1;
    
    // (السعر بالعملة المحلية / سعر صرف العملة المحلية للدولار) * سعر صرف عملة المستخدم للدولار
    const converted = (amount / fromRate) * toRate;
    return Math.round(converted);
  };

  const getBranchCurrency = (loc: LocationBranch): string => {
    if (loc.currency) return loc.currency;
    const country = loc.country?.toLowerCase() || '';
    if (country.includes('saudi')) return 'SAR';
    if (country.includes('emirates') || country.includes('uae')) return 'AED';
    if (country.includes('egypt')) return 'EGP';
    if (country.includes('qatar')) return 'QAR';
    if (country.includes('kuwait')) return 'KWD';
    if (country.includes('oman')) return 'OMR';
    if (country.includes('bahrain')) return 'BHD';
    if (country.includes('jordan')) return 'JOD';
    return 'AED';
  };

  console.log('بيانات الدولة الحالية:', countryCheapest);

  // حساب أقل سعر للسيارات في هذه الدولة ديناميكياً
  const calculatedMinPrice = countryCheapest
    ? Math.min(
        ...Object.values(countryCheapest).map((car: any) => {
          const val = typeof car.price === 'string' 
            ? parseFloat(car.price.replace(/[^0-9.]/g, '')) 
            : parseFloat(car.price);
          return val || 85;
        })
      )
    : 85;

  // تصفية وحل مشكلة المطارات ديناميكياً مع تفادي التكرار
  const uniqueAirportsMap: Record<string, any> = {};
  const NAME_TO_CODE: Record<string, string> = {
    'king khalid': 'RUH',
    'king abdulaziz': 'JED',
    'king fahd': 'DMM',
    'prince mohammad': 'MED',
    'prince mohammad bin abdulaziz': 'MED',
    'abha': 'AHB',
    'taif': 'TIF',
    'tabuk': 'TAB',
    'jazan': 'GIZ',
    'prince naif': 'ELQ',
    'alula': 'ULH',
    'yanbu': 'YNB',
  };
  locations
    .filter((loc) => {
      const typeLower = loc.location_type?.toLowerCase() || '';
      const nameLower = loc.name?.toLowerCase() || '';
      return (
        typeLower === 'airport' ||
        (loc.airport_id != null && loc.airport_id !== 0) ||
        nameLower.includes('airport') ||
        nameLower.includes(' apt')
      );
    })
    .forEach((loc) => {
      const name = loc.name || '';
      let code = loc.abriviation?.toUpperCase() || '';
      if (code.includes('-')) {
        const parts = code.split('-');
        code = parts[parts.length - 1].trim();
      }
      
      // إذا كان الكود فارغاً، نحاول التعرف عليه من خلال الاسم (خاص ببعض مطارات السعودية المسجلة بدون كود)
      if (!code && name) {
        const nameLower = name.toLowerCase();
        for (const [key, val] of Object.entries(NAME_TO_CODE)) {
          if (nameLower.includes(key)) {
            code = val;
            break;
          }
        }
      }

      const displayCode = code || 'APT';
      const uniqueKey = code || name.toLowerCase().trim();

      const branchCurrency = getBranchCurrency(loc);
      const currentPrice = loc.min_price 
        ? convertPrice(loc.min_price, branchCurrency) 
        : calculatedMinPrice;

      if (!uniqueAirportsMap[uniqueKey]) {
        uniqueAirportsMap[uniqueKey] = {
          name: name || `Airport ${displayCode}`,
          code: displayCode,
          location: loc.location || currentCountryName,
          description: `Rent a car at ${name || `Airport ${displayCode}`} and land ready to drive. Compare rates from multiple top suppliers in seconds.`,
          image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
          minPrice: currentPrice,
          rawLocation: loc,
        };
      } else {
        const existingPrice = uniqueAirportsMap[uniqueKey].minPrice;
        if (currentPrice && (!existingPrice || currentPrice < existingPrice)) {
          uniqueAirportsMap[uniqueKey].minPrice = currentPrice;
        }
      }
    });

  const dynamicAirports = Object.values(uniqueAirportsMap);

  // Extract unique companies (suppliers) from the current country locations
  const activeCompanies = Array.from(
    new Map(
      locations
        .filter((loc) => loc.company != null && loc.company.logo != null)
        .map((loc) => [loc.company!.id, loc.company!])
    ).values()
  );

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Blend HeroSearch component with HTML layout spacing */}
        <div className="relative">
          <HeroSearch 
            title={`${data.heroTitle} `} 
            titleHighlight={data.heroHighlight}
            bottomText={data.heroBottomTitle}
            badge={data.heroBadge}
          />
        </div>

        {/* Trusted Partners Section */}
        {activeCompanies.length > 0 && (
          <section className="py-14 overflow-hidden bg-white border-b border-gray-100">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Trusted Partners
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-black uppercase italic tracking-tight font-title mt-3">
                {data.slug === 'uae' ? "Our Trusted Car Rental Suppliers in the UAE" : `Our Trusted Car Rental Suppliers in ${data.name}`}
              </h3>
              {data.partnersDescription && (
                <p className="text-gray-500 mt-3 text-sm md:text-base font-semibold max-w-4xl mx-auto leading-relaxed">
                  {data.partnersDescription}
                </p>
              )}
            </div>

            {/* Dynamic Pyramid Logos Layout */}
            {(() => {
              const total = activeCompanies.length;
              if (total === 0) return null;

              // حساب أقصى ارتفاع هرمي h بحيث h*(h+1)/2 <= total
              let h = 1;
              while (((h + 1) * (h + 2)) / 2 <= total) {
                h++;
              }

              // أحجام الصفوف الأساسية: [h, h-1, ..., 1]
              const rowSizes: number[] = [];
              for (let i = h; i >= 1; i--) {
                rowSizes.push(i);
              }

              // توزيع الباقي على الصفوف لضمان استمرار التنازل
              let remainder = total - (h * (h + 1)) / 2;
              let idx = 0;
              while (remainder > 0) {
                rowSizes[idx]++;
                remainder--;
                idx = (idx + 1) % rowSizes.length;
              }

              // تقسيم العناصر على الصفوف بناءً على الأحجام المحسوبة
              const rows: typeof activeCompanies[] = [];
              const tempCompanies = [...activeCompanies];
              for (const size of rowSizes) {
                rows.push(tempCompanies.splice(0, size));
              }

              return (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-3">
                  {rows.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex items-center justify-center gap-2 sm:gap-3">
                      {row.map((company) => (
                        <div
                          key={company.id}
                          className="bg-white border border-gray-100 hover:border-primary rounded-xl p-1.5 flex items-center justify-center w-[80px] h-[40px] sm:w-[120px] sm:h-[60px] flex-shrink-0 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                          title={company.name}
                        >
                          <PartnerLogo company={company} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </section>
        )}

        {/* عرض المطارات ديناميكياً فقط إذا كانت متوفرة في الباك إند */}
        {dynamicAirports.length > 0 && (
          <AirportsSection name={data.name} airports={dynamicAirports} currency={activeSymbol} />
        )}

        <TravelInfoSection travelInfo={data.travelInfo} />

        <StepsDocsSection steps={data.steps} documents={data.documents} />

        {/* Dynamic Fleet Section */}
        {isFetchingCheapest ? (
          <div className="py-24 text-center text-gray-400 font-semibold">Loading fleet details...</div>
        ) : (
          countryCheapest && Object.keys(countryCheapest).length > 0 && (
            <section className="py-24 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 text-black text-xs font-black uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Best Deals in {data.name}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight uppercase italic font-title">
                  Our Fleet & Cheapest Daily Rates
                </h2>
                <p className="text-gray-500 mt-2 text-sm md:text-base font-semibold">
                  Cheapest rates calculated from monthly rentals (daily average)
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {Object.entries(countryCheapest).map(([categoryName, car]: any) => (
                  <div 
                    key={categoryName}
                    className="bg-white rounded-3xl border-2 border-gray-100 hover:border-primary transition-all duration-300 overflow-hidden shadow-md flex flex-col sm:flex-row items-stretch"
                  >
                    {/* Left: Car Image */}
                    <div className="relative w-full sm:w-[200px] md:w-[220px] shrink-0 bg-white flex items-center justify-center p-4 min-h-[180px]">
                      <span className="absolute top-3 left-3 bg-primary text-gray-900 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm z-10">
                        {categoryName}
                      </span>
                      <img 
                        src={getVehicleImageUrl(car.photo) || 'https://via.placeholder.com/300x180?text=No+Image'} 
                        alt={car.car_name}
                        className="max-h-[120px] w-auto object-contain transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    {/* Right: Info & Specs & Price */}
                    <div className="flex-grow p-5 md:p-6 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Title Row */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <h3 className="text-base font-black text-gray-900 leading-tight">
                            {car.car_name}
                          </h3>
                          <div className="relative w-3.5 h-3.5 rounded-full flex items-center justify-center bg-yellow-400 text-gray-900 cursor-pointer shadow-sm">
                            <Info size={8} strokeWidth={4} className="text-gray-900" />
                          </div>
                        </div>
                        <p className="text-[10px] font-black text-blue-900/70 mb-4 uppercase tracking-wider">{categoryName}</p>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                            <img src={assets.icons.seats} alt="Seats" className="w-6 h-6 object-contain shrink-0" />
                            <span>{car.seats} Seats</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                            <img src={assets.icons.doors} alt="Doors" className="w-5 h-5 object-contain shrink-0 ml-0.5 mr-0.5" />
                            <span>{car.doors} Doors</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                            <img src={assets.icons.bags} alt="Luggage" className="w-6 h-6 object-contain shrink-0" />
                            <span className="truncate">{car.suitcases || '2 Bags'} Suitcase</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                            <img src={assets.icons.ac} alt="A/C" className="w-6 h-6 object-contain shrink-0" />
                            <span className="truncate">{car.ac ? 'Air Conditioning' : 'No A/C'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                            <img src={assets.icons.fuel} alt="Fuel" className="w-6 h-6 object-contain shrink-0" />
                            <span className="truncate">{car.fuelType}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                            <img src={assets.icons.transmission} alt="Transmission" className="w-6 h-6 object-contain shrink-0" />
                            <span className="truncate">{car.transmission}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Supplier & Price */}
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="bg-white border border-gray-200 rounded-xl p-1 flex items-center justify-center w-[80px] h-[40px] shrink-0 shadow-sm">
                            {car.supplier_logo ? (
                              <img 
                                src={`/img/${car.supplier_logo}`} 
                                alt={car.supplier} 
                                className="h-7 w-auto max-w-[72px] object-contain"
                              />
                            ) : (
                              <span className="text-[8px] font-black text-gray-600 truncate">{car.supplier}</span>
                            )}
                          </div>
                          <span className="text-xs font-black text-gray-800 truncate">{car.supplier}</span>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider leading-none mb-0.5">Starting from</p>
                          <div className="flex items-baseline gap-0.5 justify-end">
                            <span className="text-xl font-black text-gray-900 leading-none">{car.price}</span>
                            <span className="text-[10px] font-black text-gray-500">{car.currency}/day</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        )
      )}

        {/* Dynamic standard FAQ section matching the homepage style 100% */}
        <FAQ data={data.faqs} title={`${data.name} Car Rental FAQs`} />

        {/* Premium Upgraded CTA Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-black text-white p-8 md:p-16 text-center shadow-2xl">
              {/* Background Image overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-25"
                style={{ 
                  backgroundImage: `url('https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1800&q=80')` 
                }}
              />
              {/* Smooth dark gradient layer */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
              
              <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-black uppercase tracking-wider mb-6">
                  Ready to drive?
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tight font-title mb-6 leading-tight">
                  {data.ctaTitle || "Find Your Perfect Airport Rental Today"}
                </h2>
                <p className="text-white/70 text-base md:text-lg leading-relaxed font-medium mb-8">
                  {data.ctaDescription || `Compare deals from 50+ suppliers across all ${data.name} airports. Free cancellation, no credit card fees, and instant confirmation.`}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a 
                    className="btn-primary px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20" 
                    href="#airports"
                  >
                    {data.ctaPrimaryText || "Search Cars Now"}
                  </a>
                  <button className="px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all">
                    {data.ctaSecondaryText || "Contact Support"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
