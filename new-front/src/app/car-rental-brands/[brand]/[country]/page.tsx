import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import CarRentalBrandsHero from '@/components/car-rental-brands/CarRentalBrandsHero';
import LocationsAccordion from '@/components/car-rental-brands/LocationsAccordion';
import { SERVER_API_BASE, BACKEND_URL } from '@/config/api';
import { getCountryIso } from '@/utils/countryUtils';

interface PageProps {
  params: Promise<{ brand: string; country: string }>;
}

export async function generateStaticParams() {
  const res = await fetch(`${SERVER_API_BASE}/get/car-rental-brands`);
  const data = res.ok ? await res.json() : { brands: [] };
  const brands = data.brands || [];
  const paths = [];
  
  for (const brand of brands) {
    const brandRes = await fetch(`${SERVER_API_BASE}/get/car-rental-brands/${brand.id}`);
    if (brandRes.ok) {
      const brandData = await brandRes.json();
      for (const country of brandData.countries) {
        paths.push({ brand: brand.id, country: country.countrySlug });
      }
    }
  }
  return paths;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: brandSlug, country: countrySlug } = await params;
  const res = await fetch(`${SERVER_API_BASE}/get/car-rental-brands/${brandSlug}`);
  if (!res.ok) return { title: 'Not Found' };
  const brand = await res.json();
  const country = brand.countries.find((c: any) => c.countrySlug === countrySlug);
  if (!country) return { title: 'Not Found' };

  const totalBranches = country.airportBranches.length + country.cityBranches.length;

  return {
    title: `${brand.name} Car Rental in ${country.countryName} | Autours`,
    description: `Find all ${brand.name} car rental locations in ${country.countryName}. ${totalBranches} locations including airports and city branches. Book with Autours for the best rates.`,
    alternates: { canonical: `/car-rental-brands/${brand.id}/${country.countrySlug}` },
  };
}

export default async function BrandCountryPage({ params }: PageProps) {
  const { brand: brandSlug, country: countrySlug } = await params;
  const res = await fetch(`${SERVER_API_BASE}/get/car-rental-brands/${brandSlug}`, { next: { revalidate: 60 } });
  if (!res.ok) notFound();
  const brand = await res.json();
  const country = brand.countries.find((c: any) => c.countrySlug === countrySlug);

  if (!country) notFound();

  if (brand.logo) {
    if (brand.logo.includes('default.png')) {
      brand.logo = '/img/logo.png';
    } else if (!brand.logo.startsWith('http')) {
      brand.logo = `${BACKEND_URL}${brand.logo.startsWith('/') ? '' : '/'}${brand.logo}`;
    }
  }

  const totalBranches = country.airportBranches.length + country.cityBranches.length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${brand.name} Car Rental in ${country.countryName}`,
    provider: { '@type': 'Organization', name: brand.displayName },
    areaServed: { '@type': 'Country', name: country.countryName },
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1">
        <CarRentalBrandsHero
          breadcrumbs={[
            { label: 'Car Rental', href: '/' },
            { label: 'All Car Rental Brands', href: '/car-rental-brands' },
            { label: brand.displayName, href: `/car-rental-brands/${brand.id}` },
            { label: `${brand.name} Car Rental in ${country.countryName}` },
          ]}
          badge={`${totalBranches} Locations`}
          brandLogo={{ src: brand.logo, alt: `${brand.name} logo` }}
          imageAlt={`${brand.name} car rental in ${country.countryName}`}
          stats={[
            { value: String(country.airportBranches.length), label: 'Airports' },
            { value: String(country.cityBranches.length), label: 'Cities' },
            { value: String(totalBranches), label: 'Total' },
          ]}
          title={
            <>
              All {brand.name} Car Rental
              <br />
              Destinations in{' '}
              <span className="text-primary">{country.countryName}</span>
            </>
          }
          description={
            <>
              Get instant access to all {brand.name} car rental locations in {country.countryName}{' '}
              and find rates as Low as Possible for your{' '}
              <Link href="/" className="text-inherit font-bold hover:underline">
                Car Rental
              </Link>
              . {totalBranches} locations including airports and city branches.
            </>
          }
        />



        {/* ─── Locations Accordions ─────────────────────────────────────────── */}
        {(country.airportBranches.length > 0 || country.cityBranches.length > 0) && (
          <section className="py-12 md:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <LocationsAccordion
                airportBranches={country.airportBranches}
                cityBranches={country.cityBranches}
                brandName={brand.name}
              />
            </div>
          </section>
        )}

        {/* ─── Other Countries ─────────────────────────────────────────────── */}
        {brand.countries.length > 1 && (
          <section className="py-12 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-base md:text-[17px] font-black text-gray-900 mb-5 tracking-tight">
                Other {brand.name} destinations
              </h2>
              <div className="flex flex-wrap gap-3">
                {brand.countries
                  .filter((c: any) => c.countrySlug !== countrySlug)
                  .map((c: any) => (
                    <Link
                      key={c.countrySlug}
                      href={`/car-rental-brands/${brand.id}/${c.countrySlug}`}
                      id={`other-country-${c.countrySlug}`}
                      className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:text-gray-950 hover:border-primary shadow-[0_2px_6px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(249,214,2,0.15)] transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <img
                        src={`https://flagcdn.com/w40/${(getCountryIso(c.countryName) || c.countryCode).toLowerCase()}.png`}
                        alt={c.countryName}
                        width={26}
                        height={17}
                        className="rounded border border-black/5 object-cover shrink-0 shadow-sm"
                      />
                      <span>{c.countryName}</span>
                    </Link>
                  ))}
              </div>
            </div>
          </section>
        )}


      </main>

      <Footer />
    </div>
  );
}
