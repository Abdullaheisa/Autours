import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import CarRentalBrandsHero from '@/app/car-rental-brands/components/CarRentalBrandsHero';
import BrandBenefitsSection from '@/app/car-rental-brands/[brand]/components/BrandBenefitsSection';
import BrandFAQSection from '@/app/car-rental-brands/[brand]/components/BrandFAQSection';
import WhyBookSection from '@/app/car-rental-brands/[brand]/components/WhyBookSection';
import BrandCountriesGrid from '@/app/car-rental-brands/[brand]/components/BrandCountriesGrid';
import BrandFleetSection from '@/app/car-rental-brands/[brand]/components/BrandFleetSection';
import { getBrandExtras } from '@/data/brandExtras';
import { SERVER_API_BASE, BACKEND_URL } from '@/config/api';
import { vehicleMapper } from '@/services/mappers/vehicleMapper';

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

  // Fetch and filter vehicles for this supplier from database
  let supplierVehicles: any[] = [];
  try {
    const supplierId = brand.user_id || brand.id;
    const vehiclesRes = await fetch(`${SERVER_API_BASE}/get/vehicles?supplier=${supplierId}`, { next: { revalidate: 60 } });
    if (vehiclesRes.ok) {
      supplierVehicles = await vehiclesRes.json();
    }
  } catch (err) {
    console.warn("Failed to fetch vehicles for brand page:", err);
  }

  const localVehicles = vehicleMapper.toLocalList(supplierVehicles);

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

        <WhyBookSection
          brandName={brand.name}
          brandLogo={brand.logo}
          description={brand.description}
        />

        {/* ─── Fleet Categories & Explanatory Content ──────────────────────── */}
        <BrandFleetSection
          brandName={brand.name}
          brandId={brand.id}
          vehicles={localVehicles}
        />

                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* ─── Booking Benefits ──────────────────────────────────────────────── */}
        <BrandBenefitsSection
          brandName={brand.name}
          benefits={brandExtras.benefits}
        />

                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* ─── Countries Grid ───────────────────────────────────────────────── */}
        <BrandCountriesGrid
          brandId={brand.id}
          brandName={brand.name}
          countries={brand.countries}
        />

                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

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
