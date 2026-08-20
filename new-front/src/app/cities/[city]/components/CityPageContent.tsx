'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fallbackRates } from '@/store/slices/currencySlice';

import { getLocationDisplayLabel } from '@/utils/location';
import { vehicleApi } from '@/services/api/vehicleApi';
import { LocationBranch } from '@/types';

import { CityPageData } from '@/data/cityPages';

// Shared layout
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import HeroSearch from '@/components/sections/HeroSearch';
import FAQ from '@/components/sections/FAQ';

// ── Shared location-page components ──────────────────────────
import PartnersSection      from '@/components/location-page/PartnersSection';
import AirportsSection      from '@/components/location-page/AirportsSection';
import TravelInfoSection    from '@/components/location-page/TravelInfoSection';
import HighlightsSection    from '@/components/location-page/HighlightsSection';
import StepsDocsSection     from '@/components/location-page/StepsDocsSection';
import FleetSection         from '@/components/location-page/FleetSection';
import LocationCTASection   from '@/components/location-page/LocationCTASection';

interface Props {
  data: CityPageData;
}

export default function CityPageContent({ data }: Props) {
  const [locations, setLocations] = useState<LocationBranch[]>([]);
  const [cityCheapest, setCityCheapest] = useState<Record<string, any>>({});
  const [isFetchingCityFleet, setIsFetchingCityFleet] = useState(true);

  // 1. Fetch branches & suppliers specifically located in this city
  useEffect(() => {
    vehicleApi
      .getLocationsByCity(data.slug)
      .then(setLocations)
      .catch((err) => console.error('Error fetching city locations:', err));
  }, [data.slug]);

  // 2. Fetch cheapest active vehicles specifically attached to branches in this city
  useEffect(() => {
    setIsFetchingCityFleet(true);
    vehicleApi
      .getCheapestVehiclesByCity(data.slug)
      .then((res) => {
        if (res && res.data) {
          setCityCheapest(res.data);
        }
      })
      .catch((err) => console.error('Error fetching city fleet:', err))
      .finally(() => setIsFetchingCityFleet(false));
  }, [data.slug]);

  const currencyState  = useSelector((state: RootState) => state.currency);
  const activeCurrency = currencyState.code;
  const activeSymbol   = currencyState.symbol || activeCurrency;
  const rates          = currencyState.allRates || {};

  const convertPrice = (amount: number, fromCurrencyCode: string): number => {
    const from = (fromCurrencyCode || 'AED').toUpperCase();
    const to   = activeCurrency.toUpperCase();
    const fromRate = rates[from] || fallbackRates[from] || 1;
    const toRate   = rates[to]   || fallbackRates[to]   || 1;
    return Math.round((amount / fromRate) * toRate);
  };

  const getBranchCurrency = (loc: LocationBranch): string => {
    if (loc.currency) return loc.currency;
    const c = loc.country?.toLowerCase() || '';
    if (c.includes('saudi'))     return 'SAR';
    if (c.includes('emirates') || c.includes('uae')) return 'AED';
    if (c.includes('egypt'))     return 'EGP';
    if (c.includes('qatar'))     return 'QAR';
    if (c.includes('kuwait'))    return 'KWD';
    if (c.includes('oman'))      return 'OMR';
    if (c.includes('bahrain'))   return 'BHD';
    if (c.includes('jordan'))    return 'JOD';
    if (c.includes('morocco'))   return 'MAD';
    if (c.includes('turkey') || c.includes('türkiye')) return 'TRY';
    if (c.includes('georgia'))   return 'GEL';
    return 'AED';
  };

  // Calculated min price from city-specific fleet
  const cityFleetList = Object.values(cityCheapest);
  const calculatedMinPrice = cityFleetList.length > 0
    ? Math.min(
        ...cityFleetList.map((car: any) => {
          const v =
            typeof car.price === 'string'
              ? parseFloat(car.price.replace(/[^0-9.]/g, ''))
              : parseFloat(car.price);
          return v || 85;
        })
      )
    : 85;

  // ── Build airports map for this city only ───────────────────
  const NAME_TO_CODE: Record<string, string> = {
    'dubai international': 'DXB',
    'al maktoum': 'DWC',
    'king khalid': 'RUH',
    'king abdulaziz': 'JED',
    'king fahd': 'DMM',
    'prince mohammad': 'MED',
    'abha': 'AHB',
  };

  const uniqueAirportsMap: Record<string, any> = {};
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
      if (!code && name) {
        const nl = name.toLowerCase();
        for (const [key, val] of Object.entries(NAME_TO_CODE)) {
          if (nl.includes(key)) {
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
      const uniqueKey   = code || name.toLowerCase().trim();
      const branchCurrency = getBranchCurrency(loc);
      const currentPrice   = loc.min_price
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
      } else if (currentPrice && currentPrice < uniqueAirportsMap[uniqueKey].minPrice) {
        uniqueAirportsMap[uniqueKey].minPrice = currentPrice;
      }
    });

  const dynamicAirports = Object.values(uniqueAirportsMap);

  // ── Extract unique companies present ONLY in this city ───────
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
        {/* Hero Search */}
        <div id="search-section">
          <HeroSearch
            title={`${data.heroTitle} `}
            titleHighlight={data.heroHighlight}
            bottomText={data.heroBottomTitle}
            badge={data.heroBadge}
          />
        </div>

        {/* Trusted Partners — ONLY suppliers with branches in this city */}
        <PartnersSection
          companies={activeCompanies}
          locationName={data.name}
          description={data.partnersDescription}
        />

        {/* Airports in this city */}
        {dynamicAirports.length > 0 && (
          <AirportsSection name={data.name} airports={dynamicAirports} currency={activeSymbol} />
        )}

        {/* Why Autours */}
        <TravelInfoSection travelInfo={data.travelInfo} />

        {/* Top Destinations (City Mode: Carousel Slider with clean cards) */}
        {data.highlights && (
          <HighlightsSection
            highlights={data.highlights}
            locationName={data.name}
            mode="city"
          />
        )}

        {/* Book in 3 Steps + Documents */}
        <StepsDocsSection steps={data.steps} documents={data.documents} />

        {/* Dynamic Fleet Section — ONLY vehicles available in this city */}
        {isFetchingCityFleet ? (
          <div className="py-24 text-center text-gray-400 font-semibold">
            Loading {data.name} fleet deals...
          </div>
        ) : (
          <FleetSection cheapest={cityCheapest} locationName={data.name} />
        )}

        {/* FAQ */}
        <FAQ data={data.faqs} title={`${data.name} Car Rental FAQs`} />

        {/* CTA */}
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
