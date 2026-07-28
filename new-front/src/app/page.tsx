import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import HeroSearch from '@/components/sections/HeroSearch';
import SectionDivider from '@/components/sections/SectionDivider';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  description: "Book affordable car rentals across the UAE, Saudi Arabia, Kuwait, Bahrain, Oman, Jordan, and Egypt. Compare prices, enjoy free cancellation, and find the perfect vehicle with Autours.",
  alternates: {
    canonical: '/',
  },
};

// 🚀 السحر هنا: تحميل الكومبوننتس اللي تحت الـ Fold "على الطلب" (Lazy Loading)
// ده هيقلل حجم الجافاسكريبت اللي بيتحمل في البداية لأكثر من 60%
const PartnersBanner = dynamic(() => import('@/components/sections/PartnersBanner'));
const Features = dynamic(() => import('@/components/sections/Features'));
const Locations = dynamic(() => import('@/components/sections/Locations'));
const Fleet = dynamic(() => import('@/components/sections/Fleet'));
const DynamicBanners = dynamic(() => import('@/components/sections/DynamicBanners'));
const FAQ = dynamic(() => import('@/components/sections/FAQ'));
const Contact = dynamic(() => import('@/components/sections/Contact'));

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
        {/* الكومبوننتس الأساسية اللي بتظهر أول حاجة بتتحمل طبيعي */}
        <HeroSearch />
        
        <SectionDivider />
        <PartnersBanner />
        
        {/* باقي الكومبوننتس هتتحمل في الخلفية بدون ما تجمد المتصفح */}
        <Features />
        <SectionDivider />
        
        <Locations />
        <SectionDivider />
        
        <Fleet />
        <SectionDivider />
        
        <DynamicBanners />
        
        <FAQ limit={9} />
        <SectionDivider />
        
        <Contact />
      </main>

      <Footer />
    </div>
  );
}