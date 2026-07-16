import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import CarRentalBrandsHero from '@/components/car-rental-brands/CarRentalBrandsHero';
import CarRentalCard from '@/components/car-rental-brands/CarRentalCard';
import BrandBenefitsSection from '@/components/car-rental-brands/BrandBenefitsSection';
import BrandFAQSection from '@/components/car-rental-brands/BrandFAQSection';
import { getBrandExtras } from '@/data/brandExtras';
import { SERVER_API_BASE, BACKEND_URL } from '@/config/api';
import { getCountryIso } from '@/utils/countryUtils';

interface PageProps {
  params: Promise<{ brand: string }>;
}

export async function generateStaticParams() {
  const res = await fetch(`${SERVER_API_BASE}/get/car-rental-brands`);
  const data = res.ok ? await res.json() : { brands: [] };
  const brands = data.brands || [];
  return brands.map((brand: any) => ({ brand: brand.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: brandSlug } = await params;
  const res = await fetch(`${SERVER_API_BASE}/get/car-rental-brands/${brandSlug}`);
  if (!res.ok) return { title: 'Brand Not Found' };
  const brand = await res.json();

  return {
    title: `${brand.displayName} Destinations | Autours`,
    description: `Find all ${brand.name} car rental locations across ${brand.countries.length} countries. Book ${brand.name} at airports and city centers with Autours.`,
    alternates: { canonical: `/car-rental-brands/${brand.id}` },
  };
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { brand: brandSlug } = await params;
  const res = await fetch(`${SERVER_API_BASE}/get/car-rental-brands/${brandSlug}`, { next: { revalidate: 60 } });
  if (!res.ok) notFound();
  const brand = await res.json();
  if (brand.logo) {
    if (brand.logo.includes('default.png')) {
      brand.logo = '/img/logo.png';
    } else if (!brand.logo.startsWith('http')) {
      brand.logo = `${BACKEND_URL}${brand.logo.startsWith('/') ? '' : '/'}${brand.logo}`;
    }
  }

  const totalBranches = brand.countries.reduce(
    (acc: number, c: any) => acc + c.airportBranches.length + c.cityBranches.length,
    0
  );

  const descriptionParagraphs = brand.description
    .split('\n\n')
    .filter((p: string) => p.trim());

  // ── Brand-specific extras (benefits + FAQs) — falls back to generic if not found
  const brandExtras = getBrandExtras(brand.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.displayName,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: brand.rating,
      reviewCount: brand.reviewCount,
      bestRating: 10,
    },
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
            { label: `All ${brand.name} Car Rental Destinations` },
          ]}
          badge={`${brand.countries.length} Countries`}
          brandLogo={{ src: brand.logo, alt: `${brand.name} logo` }}
          imageAlt={`${brand.name} car rental destinations`}
          stats={[
            { value: String(brand.countries.length), label: 'Countries' },
            { value: String(totalBranches), label: 'Locations' },
            { value: `${brand.rating}/10`, label: 'Rating' },
          ]}
          title={
            <>
              {brand.name} Car Rental
              <br />
              Destinations
            </>
          }
          description={
            <p>
              Explore {brand.name} car rental locations worldwide. Compare rates across airports
              and city branches — book with confidence through Autours.
            </p>
          }
        />


        {/* ─── Why Book Section ─────────────────────────────────────────────── */}
        <section className="py-10 md:py-14 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
              {/* Header: Title & Logo */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h3 className="text-2xl md:text-[28px] font-black text-gray-900 tracking-tight">
                  Why book your car rental with {brand.name}?
                </h3>
                {/* Logo in styled box — matches hero */}
                <div className="relative shrink-0 self-start md:self-center bg-white rounded-2xl border-2 border-[var(--primary)] shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-3 w-[140px] h-[70px] flex items-center justify-center">
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary border-2 border-white z-10 shadow-sm" />
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    width={130}
                    height={60}
                    className="object-contain w-full h-full select-none"
                    unoptimized
                  />
                </div>
              </div>

              {/* Description paragraphs */}
              <div className="space-y-6">
                {descriptionParagraphs.map((para: string, i: number) => (
                  <p key={i} className="text-base md:text-[17px] text-gray-700 leading-[1.8] font-normal">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Booking Benefits ──────────────────────────────────────────────── */}
        <BrandBenefitsSection
          brandName={brand.name}
          benefits={brandExtras.benefits}
        />

        {/* ─── Countries Grid ───────────────────────────────────────────────── */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section title */}
            <div className="mb-8">
              <p className="text-[16px] md:text-[18px] font-bold text-gray-700 leading-relaxed">
                Get instant access to all{' '}
                <Link href={`/car-rental-brands/${brand.id}`} className="text-gray-700 hover:text-gray-900 transition-colors font-bold hover:underline underline-offset-2">
                  {brand.name}
                </Link>{' '}
                car rental locations and find rates as Low as Possible for your{' '}
                <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors font-bold hover:underline underline-offset-2">Car Rental</Link>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {brand.countries.map((country: any) => (
                <CarRentalCard
                  key={country.countrySlug}
                  href={`/car-rental-brands/${brand.id}/${country.countrySlug}`}
                  title={`${brand.name} in ${country.countryName}`}
                  countryCode={getCountryIso(country.countryName) || country.countryCode}
                  id={`brand-country-${country.countrySlug}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
        <BrandFAQSection
          brandName={brand.name}
          faqs={brandExtras.faqs}
        />

      </main>

      <Footer />
    </div>
  );
}
