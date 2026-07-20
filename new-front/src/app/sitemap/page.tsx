import type { Metadata } from 'next';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { countries } from '@/data/countries';
import { SERVER_API_BASE } from '@/config/api';
import SitemapClient from './components/SitemapClient';

export const metadata: Metadata = {
  title: 'Site Map | Autours Car Rental',
  description: 'Autours Sitemap. Navigate easily through all car rental brands, destinations, airport locations, company resources, and support pages.',
  alternates: { canonical: '/sitemap' },
};

async function getBrands() {
  try {
    const res = await fetch(`${SERVER_API_BASE}/get/car-rental-brands`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.brands || [];
  } catch (error) {
    console.error('Error fetching brands for sitemap:', error);
    return [];
  }
}

export default async function SitemapPage() {
  const brands = await getBrands();
  
  // Format brands & countries data to match client component types
  const formattedBrands = brands.map((b: any) => ({
    id: b.id,
    displayName: b.displayName || b.name,
  }));
  
  const formattedCountries = countries.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Simple Semantic SEO Header */}
        <div className="max-w-5xl mx-auto border-b border-gray-200 pb-6 mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            Autours HTML Sitemap
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            Explore all directories, car rental suppliers, and countries on our website. Click on any section to expand it.
          </p>
        </div>

        {/* Sitemap Collapsible Rows */}
        <SitemapClient brands={formattedBrands} countries={formattedCountries} />
      </main>

      <Footer />
    </div>
  );
}
