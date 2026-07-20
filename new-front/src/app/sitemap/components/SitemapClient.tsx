'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Brand {
  id: string;
  displayName: string;
}

interface Country {
  id: string;
  name: string;
}

interface SitemapClientProps {
  brands: Brand[];
  countries: Country[];
}

export default function SitemapClient({ brands, countries }: SitemapClientProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    main: true,
    portals: false,
    destinations: false,
    brands: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const mainPages = [
    { name: 'Home Page', href: '/' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Why Autours?', href: '/why_autours' },
    { name: 'Where We Are?', href: '/where-we-are' },
    { name: 'Contact Us', href: '/contact-us' },
    { name: 'Our Blogs', href: '/blogs' },
  ];

  const portals = [
    { name: 'Login / Manage Booking', href: '/login' },
    { name: 'Register Account', href: '/register' },
    { name: 'Be a Supplier', href: '/be-supplier' },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* 1. Main Pages Section */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => toggleSection('main')}
          className="w-full text-left px-6 py-5 flex items-center justify-between font-black text-gray-900 bg-white hover:bg-gray-50 transition-colors focus:outline-none"
        >
          <span className="text-lg">Main Pages ({mainPages.length})</span>
          <span className="text-xl font-bold text-gray-400">{openSections.main ? '−' : '+'}</span>
        </button>
        {openSections.main && (
          <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-150 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mainPages.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-bold text-gray-700 hover:text-primary transition-colors py-1"
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 2. Portals & Actions Section */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => toggleSection('portals')}
          className="w-full text-left px-6 py-5 flex items-center justify-between font-black text-gray-900 bg-white hover:bg-gray-50 transition-colors focus:outline-none"
        >
          <span className="text-lg">Portals & Actions ({portals.length})</span>
          <span className="text-xl font-bold text-gray-400">{openSections.portals ? '−' : '+'}</span>
        </button>
        {openSections.portals && (
          <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-150 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {portals.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-bold text-gray-700 hover:text-primary transition-colors py-1"
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. Destinations Section */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => toggleSection('destinations')}
          className="w-full text-left px-6 py-5 flex items-center justify-between font-black text-gray-900 bg-white hover:bg-gray-50 transition-colors focus:outline-none"
        >
          <span className="text-lg">Our Destinations ({countries.length})</span>
          <span className="text-xl font-bold text-gray-400">{openSections.destinations ? '−' : '+'}</span>
        </button>
        {openSections.destinations && (
          <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-150 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {countries.map((country) => (
              <Link
                key={country.id}
                href={`/countries/${country.id}`}
                className="text-sm font-bold text-gray-700 hover:text-primary transition-colors py-1"
              >
                Car Rental in {country.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 4. Car Rental Brands Section */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => toggleSection('brands')}
          className="w-full text-left px-6 py-5 flex items-center justify-between font-black text-gray-900 bg-white hover:bg-gray-50 transition-colors focus:outline-none"
        >
          <span className="text-lg">Car Rental Brands ({brands.length + 1})</span>
          <span className="text-xl font-bold text-gray-400">{openSections.brands ? '−' : '+'}</span>
        </button>
        {openSections.brands && (
          <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-150 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link
              href="/car-rental-brands"
              className="text-sm font-black text-gray-950 hover:text-primary transition-colors py-1 underline"
            >
              All Brands Index
            </Link>
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/car-rental-brands/${brand.id}`}
                className="text-sm font-bold text-gray-700 hover:text-primary transition-colors py-1"
              >
                {brand.displayName} Car Rental
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
