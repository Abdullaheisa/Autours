'use client';

import { CountryPageData } from '@/data/countryPages';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import HeroSearch from '@/components/sections/HeroSearch';
import FAQ from '@/components/sections/FAQ';
import AirportsSection from './AirportsSection';
import TravelInfoSection from './TravelInfoSection';
import StepsDocsSection from './StepsDocsSection';
import FleetGallerySection from './FleetGallerySection';

interface Props {
  data: CountryPageData;
}

export default function CountryPageContent({ data }: Props) {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Blend HeroSearch component with HTML layout spacing */}
        <div className="relative">
          {data.heroBadge && (
            <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 hidden md:block">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#f4c400]/20 border border-[#f4c400]/30 text-[#f4c400] font-black text-xs uppercase tracking-wider backdrop-blur-sm">
                {data.heroBadge}
              </div>
            </div>
          )}
          <HeroSearch 
            title={`${data.heroTitle} `} 
            titleHighlight={data.heroHighlight}
            bottomText={data.heroBottomTitle}
          />
        </div>

        {/* Render upgraded premium content sections */}
        <AirportsSection name={data.name} airports={data.airports} />

        <TravelInfoSection travelInfo={data.travelInfo} />

        <StepsDocsSection steps={data.steps} documents={data.documents} />

        <FleetGallerySection gallery={data.gallery} />

        {/* Dynamic standard FAQ section matching the homepage style 100% */}
        <FAQ data={data.faqs} title={`${data.name} Car Rental FAQs`} />

        {/* Premium Upgraded CTA Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-black text-white p-8 md:p-16 text-center shadow-2xl">
              {/* Background Image overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-25"
                style={{ 
                  backgroundImage: `url('https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1800&q=80')` 
                }}
              />
              {/* Smooth dark gradient layer */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
              
              <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-black uppercase tracking-wider mb-6">
                  Ready to drive?
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tight font-title mb-6 leading-tight">
                  Find Your Perfect Airport Rental Today
                </h2>
                <p className="text-white/70 text-base md:text-lg leading-relaxed font-medium mb-8">
                  Compare deals from 50+ suppliers across all {data.name} airports. Free cancellation, no credit card fees, and instant confirmation.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a 
                    className="btn-primary px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20" 
                    href="#airports"
                  >
                    Search Cars Now
                  </a>
                  <button className="px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
