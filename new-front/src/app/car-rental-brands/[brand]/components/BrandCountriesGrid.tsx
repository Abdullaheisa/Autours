import Link from 'next/link';
import CarRentalCard from '@/app/car-rental-brands/components/CarRentalCard';
import { getCountryIso } from '@/utils/countryUtils';

interface BrandCountriesGridProps {
  brandId: string;
  brandName: string;
  countries: Array<{
    countryName: string;
    countrySlug: string;
    countryCode?: string;
  }>;
}

export default function BrandCountriesGrid({
  brandId,
  brandName,
  countries,
}: BrandCountriesGridProps) {
  return (
    <section className="py-6 lg:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="mb-4 md:mb-5">
          <p className="text-[16px] md:text-[18px] font-bold text-gray-700 leading-relaxed">
            Get instant access to all{' '}
            <Link
              href={`/car-rental-brands/${brandId}`}
              className="text-gray-700 hover:text-gray-900 transition-colors font-bold hover:underline underline-offset-2"
            >
              {brandName}
            </Link>{' '}
            car rental locations and find rates as Low as Possible for your{' '}
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 transition-colors font-bold hover:underline underline-offset-2"
            >
              Car Rental
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {countries.map((country) => (
            <CarRentalCard
              key={country.countrySlug}
              href={`/car-rental-brands/${brandId}/${country.countrySlug}`}
              title={`${brandName} in ${country.countryName}`}
              countryCode={getCountryIso(country.countryName) || country.countryCode}
              id={`brand-country-${country.countrySlug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
