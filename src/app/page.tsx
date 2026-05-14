'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import HeroSearch from '@/components/sections/HeroSearch';
import PartnersBanner from '@/components/sections/PartnersBanner';
import Features from '@/components/sections/Features';
import Locations from '@/components/sections/Locations';
import Fleet from '@/components/sections/Fleet';
import DynamicBanners from '@/components/sections/DynamicBanners';
import FAQ from '@/components/sections/FAQ';
import Contact from '@/components/sections/Contact';
import SectionDivider from '@/components/sections/SectionDivider';
import { siteConfig } from '@/config/site';

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "logo": `${siteConfig.url}/logo.png`,
    "sameAs": [
      "https://facebook.com/autours",
      "https://twitter.com/autours",
      "https://instagram.com/autours"
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main>
        <HeroSearch />
        <SectionDivider />
        <PartnersBanner />
        <Features />
        <SectionDivider />
        <Locations />
        <SectionDivider />
        <Fleet />
        <SectionDivider />
        <DynamicBanners />
        <SectionDivider />
        <FAQ />
        <SectionDivider />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}