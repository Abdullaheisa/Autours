'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCheapestVehicles } from '@/store/slices/searchSlice';
import { fallbackRates } from '@/store/slices/currencySlice';
import { getLocationDisplayLabel } from '@/utils/location';
import { vehicleApi } from '@/services/api/vehicleApi';
import { LocationBranch } from '@/types';

import Link from 'next/link';
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
    if (country.includes('turkey') || country.includes('türkiye')) return 'TRY';
    if (country.includes('georgia')) return 'GEL';
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
      const cleanAirportName = loc.abriviation
        ? cleanLabel.replace(new RegExp(`\\s*-\\s*${loc.abriviation}$`, 'i'), '')
        : cleanLabel;

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

        {/* Popular Cities in this country (Cross-linking) */}
        {(() => {
          const relatedCities = getCitiesByCountrySlug(data.slug);
          if (relatedCities.length === 0) return null;
          return (
            <section className="py-6 bg-primary/10 border-b border-primary/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wide">
                    Popular Rental Cities in {data.name}:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {relatedCities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/cities/${city.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-primary text-gray-900 text-xs font-black uppercase tracking-wider border border-gray-200 hover:border-primary shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <span>{city.name} Car Rental</span>
                      <span className="text-primary group-hover:text-black">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
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
