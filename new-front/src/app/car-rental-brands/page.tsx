import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import CarRentalBrandsHero from '@/components/car-rental-brands/CarRentalBrandsHero';
import CarRentalCard from '@/components/car-rental-brands/CarRentalCard';
import { SERVER_API_BASE } from '@/config/api';

export const metadata: Metadata = {
  title: 'All Car Rental Brands | Autours',
  description:
    'Autours is directly connected with all leading car rental companies as Alamo, Budget, Enterprise, Europcar, National, Thrifty, Hertz, Dollar and SIXT. Compare from all companies to find the best price.',
  alternates: { canonical: '/car-rental-brands' },
};

export default async function CarRentalBrandsPage() {
  const res = await fetch(`${SERVER_API_BASE}/get/car-rental-brands`, { next: { revalidate: 60 } });
  const data = res.ok ? await res.json() : { brands: [], stats: { totalBrands: 0, totalCountries: 0, totalBranches: 0 } };
  const carRentalBrands = data.brands || [];
  const { totalBrands, totalCountries, totalBranches } = data.stats || { totalBrands: 0, totalCountries: 0, totalBranches: 0 };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'All Car Rental Brands',
    numberOfItems: totalBrands,
    itemListElement: carRentalBrands.map((brand: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: brand.displayName,
      url: `/car-rental-brands/${brand.id}`,
    })),
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
            { label: 'All Car Rental Brands' },
          ]}
          badge="Compare & Save"
          title="All Car Rental Brands"
          stats={[
            { value: String(totalBrands), label: 'Brands' },
            { value: String(totalCountries), label: 'Countries' },
            { value: String(totalBranches), label: 'Locations' },
          ]}
          description={
            <>
              Autours is directly connected with all leading car rental companies as
              Alamo, Budget, Enterprise, Europcar, National, Thrifty, Hertz, Dollar and SIXT
              and all major local suppliers. We compare from all companies below to find the
              best price — instant access to over{' '}
              <span className="font-black text-gray-800">{totalBrands} car rental suppliers</span>.
            </>
          }
        />
        {/* ─── Brands Grid ───────────────────────────────────────────────────── */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-5">
              {carRentalBrands.map((brand) => (
                <CarRentalCard
                  key={brand.id}
                  href={`/car-rental-brands/${brand.id}`}
                  title={brand.displayName}
                  logo={brand.logo}
                  id={`brand-card-${brand.id}`}
                />
              ))}
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
}
