'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCheapestVehicles } from '@/store/slices/searchSlice';
import { fallbackRates } from '@/store/slices/currencySlice';
import { getLocationDisplayLabel, stripLocationAbbreviation } from '@/utils/location';
import { vehicleApi } from '@/services/api/vehicleApi';
import { LocationBranch } from '@/types';

import Link from 'next/link';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { CountryPageData } from '@/data/countryPages';
import { getCitiesByCountrySlug } from '@/data/cityPages';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import HeroSearch from '@/components/sections/HeroSearch';
import FAQ from '@/components/sections/FAQ';

// ── Shared location-page components ──────────────────────────
import PartnersSection    from '@/components/location-page/PartnersSection';
import AirportsSection    from '@/components/location-page/AirportsSection';
import TravelInfoSection  from '@/components/location-page/TravelInfoSection';
import HighlightsSection  from '@/components/location-page/HighlightsSection';
import StepsDocsSection   from '@/components/location-page/StepsDocsSection';
import FleetSection       from '@/components/location-page/FleetSection';
import LocationCTASection from '@/components/location-page/LocationCTASection';

interface Props {
  data: CountryPageData;
}

export default function CountryPageContent({ data }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [locations, setLocations] = useState<LocationBranch[]>([]);

  // Redux cheapest vehicles
  const { cheapestVehicles, isFetchingCheapest } = useSelector(
    (state: RootState) => state.search
  );

  useEffect(() => {
    dispatch(fetchCheapestVehicles());
  }, [dispatch]);

  // Fetch branches and airports dynamically for this country
  useEffect(() => {
    vehicleApi
      .getLocationsByCountry(data.slug)
      .then(setLocations)
      .catch((err) => console.error('Error fetching country locations:', err));
  }, [data.slug]);

  const currentCountryName = data.name;
  const countryCheapest = cheapestVehicles ? cheapestVehicles[currentCountryName] : null;

  // Currency conversion
  const currencyState = useSelector((state: RootState) => state.currency);
  const activeCurrency = currencyState.code;
  const activeSymbol = currencyState.symbol || activeCurrency;
  const rates = currencyState.allRates || {};

  const convertPrice = (amount: number, fromCurrencyCode: string): number => {
    const fromCode = (fromCurrencyCode || 'AED').toUpperCase();
    const toCode = activeCurrency.toUpperCase();
    const fromRate = rates[fromCode] || fallbackRates[fromCode] || 1;
    const toRate = rates[toCode] || fallbackRates[toCode] || 1;
    return Math.round((amount / fromRate) * toRate);
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
    if (country.includes('morocco')) return 'MAD';
    if (country.includes('lebanon')) return 'LBP';
    if (country.includes('iraq')) return 'IQD';
    if (country.includes('algeria')) return 'DZD';
    if (country.includes('tunisia')) return 'TND';
    if (country.includes('libya')) return 'LYD';
    if (country.includes('sudan')) return 'SDG';
    if (country.includes('yemen')) return 'YER';
    if (country.includes('syria')) return 'SYP';
    if (country.includes('mauritania')) return 'MRU';
    if (country.includes('turkey') || country.includes('türkiye')) return 'TRY';
    if (country.includes('georgia')) return 'GEL';
    if (country.includes('azerbaijan')) return 'AZN';
    if (country.includes('bosnia')) return 'BAM';
    if (country.includes('greece') || country.includes('cyprus') || country.includes('germany') || country.includes('france') || country.includes('italy') || country.includes('spain')) return 'EUR';
    if (country.includes('united kingdom') || country.includes('uk') || country.includes('britain')) return 'GBP';
    if (country.includes('united states') || country.includes('usa') || country.includes('america')) return 'USD';
    return 'AED';
  };

  const calculatedMinPrice = countryCheapest
    ? Math.min(
        ...Object.values(countryCheapest).map((car: any) => {
          const val =
            typeof car.price === 'string'
              ? parseFloat(car.price.replace(/[^0-9.]/g, ''))
              : parseFloat(car.price);
          return val || 85;
        })
      )
    : 85;

  // Build unique airports map
  const uniqueAirportsMap: Record<string, any> = {};
  const NAME_TO_CODE: Record<string, string> = {
    'king khalid': 'RUH',
    'king abdulaziz': 'JED',
    'king fahd': 'DMM',
    'prince mohammad': 'MED',
    'prince mohammad bin abdulaziz': 'MED',
    'abha': 'AHB',
    'taif': 'TIF',
    'gassim': 'ELQ',
    'yanbu': 'YNB',
    'tabuk': 'TUU',
    'hail': 'HAS',
    'dubai international': 'DXB',
    'al maktoum': 'DWC',
    'cairo': 'CAI',
    'hurghada': 'HRG',
    'sharm': 'SSH',
    'hamad': 'DOH',
    'kuwait international': 'KWI',
    'muscat': 'MCT',
    'bahrain international': 'BAH',
    'queen alia': 'AMM',
    'mohammed v': 'CMN',
    'marrakech': 'RAK',
    'istanbul': 'IST',
    'sabiha': 'SAW',
    'antalya': 'AYT',
    'tbilisi': 'TBS',
    'batumi': 'BUS',
  };

  locations
    .filter((loc) => {
      const typeLower = loc.location_type?.toLowerCase() || '';
      const nameLower = loc.name?.toLowerCase() || '';
      if (typeLower && typeLower !== 'airport') return false;
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

      if (!code && name) {
        const nameLower = name.toLowerCase();
        for (const [key, val] of Object.entries(NAME_TO_CODE)) {
          if (nameLower.includes(key)) {
            code = val;
            break;
          }
        }
      }

      const cleanLabel = getLocationDisplayLabel(loc);
      const cleanAirportName = stripLocationAbbreviation(cleanLabel, loc.abriviation);

      const displayCode = code || 'APT';
      const uniqueKey = code || name.toLowerCase().trim();

      const branchCurrency = getBranchCurrency(loc);
      const currentPrice = loc.min_price
        ? convertPrice(loc.min_price, branchCurrency)
        : calculatedMinPrice;

      if (!uniqueAirportsMap[uniqueKey]) {
        uniqueAirportsMap[uniqueKey] = {
          name: cleanAirportName || `Airport ${displayCode}`,
          code: displayCode,
          location: loc.location || data.name,
          description: `Rent a car at ${cleanAirportName || `Airport ${displayCode}`} and land ready to drive. Compare rates from multiple trusted suppliers in seconds.`,
          image:
            'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
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

  // Extract unique companies
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
        {/* Hero Search Section */}
        <div id="search-section" className="relative">
          <HeroSearch
            title={`${data.heroTitle} `}
            titleHighlight={data.heroHighlight}
            bottomText={data.heroBottomTitle}
            badge={data.heroBadge}
          />
        </div>

        {/* Trusted Partners */}
        <PartnersSection
          companies={activeCompanies}
          locationName={data.name}
          description={data.partnersDescription}
        />

        {/* Popular Cities in this country (Cross-linking & Showcase) */}
        {(() => {
          const relatedCities = (data.cities && data.cities.length > 0)
            ? data.cities
            : getCitiesByCountrySlug(data.slug);

          if (!relatedCities || relatedCities.length === 0) return null;

          return (
            <>
              {/* Quick links banner */}
              <section className="py-6 bg-primary/10 border-b border-primary/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-900" />
                    <span className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wide">
                      Popular Rental Cities in {data.name}:
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {relatedCities.map((city: any) => (
                      <Link
                        key={city.slug}
                        href={`/cities/${city.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-primary text-gray-900 text-xs font-black uppercase tracking-wider border border-gray-200 hover:border-primary shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      >
                        <span>{city.name} Car Rental</span>
                        <span className="text-primary group-hover:text-black font-bold">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

              {/* Dedicated Cities Showcase Grid — CountryPlaceCard style */}
              <section className="py-10 sm:py-14 bg-gray-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-8">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-2.5">
                        <MapPin className="w-3 h-3" /> Top Destinations
                      </span>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black uppercase italic tracking-tight font-title leading-snug">
                        Top Destinations in {data.name}
                      </h2>
                      <p className="text-gray-400 text-xs sm:text-sm font-medium mt-1 max-w-xl leading-relaxed">
                        Explore {data.name}&apos;s most iconic cities and landmarks with the freedom of your own rental car — from dazzling skyscrapers to serene desert landscapes.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {relatedCities.map((city: any, idx: number) => {
                      // Resolve city image: city.image (uploaded) -> matching highlight place -> travel_info image -> curated fallbacks
                      const highlightPlaces = data.highlights?.places || [];
                      const matchingHighlight = highlightPlaces.find(
                        (p) => p.name.toLowerCase() === city.name.toLowerCase()
                      );
                      const cityImage =
                        (city.image ? `/storage/${city.image}` : null) ||
                        matchingHighlight?.image ||
                        city.travel_info?.image ||
                        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80';

                      const attractionsCount = matchingHighlight?.attractions?.length || city.highlights?.places?.length || 0;
                      const cityDescription =
                        matchingHighlight?.description ||
                        city.hero_lead ||
                        `Compare airport and downtown car rental rates in ${city.name} from leading suppliers.`;

                      return (
                        <Link
                          key={city.slug}
                          href={`/cities/${city.slug}`}
                          className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 select-none w-full flex flex-col h-full"
                        >
                          {/* Image */}
                          <div className="relative overflow-hidden h-48 sm:h-52 shrink-0">
                            <img
                              src={cityImage}
                              alt={city.name}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <span className="bg-primary text-black text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg">
                                <ArrowRight className="w-3.5 h-3.5" /> Explore
                              </span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3.5 flex items-end justify-between">
                              <h3 className="text-white text-sm font-black leading-tight drop-shadow flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                {city.name}
                              </h3>
                              <span className="w-6 h-6 rounded-full bg-primary text-black text-[10px] font-black flex items-center justify-center shadow shrink-0">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-4 flex flex-col justify-between flex-grow">
                            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium line-clamp-3">
                              {cityDescription}
                            </p>
                            <p className="text-primary text-[10px] font-black uppercase tracking-wide mt-2 shrink-0 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-primary" />
                              {attractionsCount > 0
                                ? `${attractionsCount} top attractions inside`
                                : `Explore ${city.name} car rentals & deals`}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <p className="text-center text-gray-400 text-xs font-semibold mt-4 sm:mt-5">
                    Click any card to explore attractions &amp; details
                  </p>
                </div>
              </section>
            </>
          );
        })()}

        {/* Airports Section */}
        {dynamicAirports.length > 0 && (
          <AirportsSection name={data.name} airports={dynamicAirports} currency={activeSymbol} />
        )}

        {/* Why Autours */}
        <TravelInfoSection travelInfo={data.travelInfo} />

        {/* Top Destinations / Highlights (country mode: carousel + modal) */}
        {data.highlights && (
          <HighlightsSection
            highlights={data.highlights}
            locationName={data.name}
            mode="country"
          />
        )}

        {/* Steps & Required Documents */}
        <StepsDocsSection steps={data.steps} documents={data.documents} />

        {/* Dynamic Fleet Section */}
        {isFetchingCheapest ? (
          <div className="py-24 text-center text-gray-400 font-semibold">
            Loading fleet details...
          </div>
        ) : (
          <FleetSection cheapest={countryCheapest ?? {}} locationName={data.name} />
        )}

        {/* FAQ Section */}
        <FAQ data={data.faqs} title={`${data.name} Car Rental FAQs`} />

        {/* CTA Section */}
        <LocationCTASection
          locationName={data.name}
          title={data.ctaTitle}
          description={data.ctaDescription}
          primaryText={data.ctaPrimaryText}
          secondaryText={data.ctaSecondaryText}
        />
      </main>

      <Footer />
    </div>
  );
}
