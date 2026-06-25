'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import CountrySection from './components/CountrySection';
import { Globe, ChevronDown } from 'lucide-react';

export default function WhereWeArePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const countriesData = [
    {
      countryName: 'Egypt',
      titleSuffix: 'Land of the Pharaohs',
      description: 'Egypt is a land of wonders, where ancient monuments stand alongside vibrant modern cities. Explore the majestic Cairo Tower and sail across the Nile, icons of human history. Drive along the scenic riverbanks, or visit the historic temples of Luxor and Karnak, showcasing the grandeur of the Pharaohs. Cairo offers a rich mix of Islamic and modern heritage.',
      images: ['/img/whereWeAre/5.png', '/img/whereWeAre/6.png', '/img/whereWeAre/4.png']
    },
    {
      countryName: 'Saudi Arabia',
      titleSuffix: 'Tradition & Modernity',
      description: "Saudi Arabia offers a fascinating blend of ancient traditions and modern marvels. Drive through Riyadh and discover the historic Al Masmak Fortress, a symbol of the kingdom's rich heritage. Your journey should also take you to Jeddah, where the stunning Corniche and the iconic King Fahd Fountain await.",
      images: ['/img/whereWeAre/8.png', '/img/whereWeAre/19.png', '/img/whereWeAre/20.png']
    },
    {
      countryName: 'Bahrain',
      titleSuffix: 'Jewel of the Gulf',
      description: 'In Bahrain, a small but captivating island nation, immerse yourself in a mix of culture and heritage. Drive to the Bahrain World Trade Center and the historical fortresses, a UNESCO World Heritage site, and learn about the rich history of this archipelago.',
      images: ['/img/whereWeAre/24.png', '/img/whereWeAre/22.png', '/img/whereWeAre/23.png']
    },
    {
      countryName: 'Qatar',
      titleSuffix: 'Heritage Meets Future',
      description: 'Qatar is a dynamic peninsula where traditional Bedouin culture blends with futuristic design. Explore the modern skyline of West Bay in Doha, or walk through the historic spiral Fanar and Souq. Visit the Museum of Islamic Art, a masterpiece of modern architecture.',
      images: ['/img/whereWeAre/10.png', '/img/whereWeAre/11.png', '/img/whereWeAre/12.png']
    },
    {
      countryName: 'Kuwait',
      titleSuffix: 'Old & New',
      description: 'Kuwait is a vibrant nation with a rich history and a bright future. Start your journey at the iconic Kuwait Towers, where panoramic views of the city await. The Grand Mosque showcases the rich Islamic art and culture, while the Scientific Center offers a modern architectural and educational experience.',
      images: ['/img/whereWeAre/15.png', '/img/whereWeAre/14.png', '/img/whereWeAre/13.png']
    },
    {
      countryName: 'UAE',
      titleSuffix: 'Fusion of Cultures',
      description: 'The UAE is a dazzling blend of cultures and experiences. Drive through Dubai and experience the opulence of the Burj Khalifa and the unique architecture of the Dubai Mall. Visit the cultural heart of Abu Dhabi or enjoy the spectacular Dubai Fountain.',
      images: ['/img/whereWeAre/18.png', '/img/whereWeAre/17.png', '/img/whereWeAre/16.png']
    },
    {
      countryName: 'Oman',
      titleSuffix: 'Soul of Arabia',
      description: "Oman is a land of diverse landscapes and warm hospitality. Explore the capital city of Muscat, home to the magnificent Sultan Qaboos Grand Mosque and the historic Mutrah Souq. Drive to the Sur coast and see the Al Ayjah Lighthouse. Oman's pristine coastline and ancient forts offer a peaceful and authentic Arabian experience.",
      images: ['/img/whereWeAre/2.png', '/img/whereWeAre/3.png', '/img/whereWeAre/25.png']
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 text-neutral-900 font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0"
        >
          <img
            src="/img/whereWeAre/banner.png"
            alt="Where We Are"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
              <Globe className="w-4 h-4" />
              Seven Vibrant Destinations
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tight mb-6"
          >
            Where We Are
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
          >
            A journey through seven vibrant destinations. Explore the rich tapestry of culture, history, and adventure across the Middle East.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ChevronDown className="w-8 h-8 text-white/60" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Countries Section */}
      <main className="flex-grow">
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 mb-4">
                Explore Our Destinations
              </h2>
              <p className="text-neutral-500 text-base sm:text-lg max-w-2xl mx-auto">
                From ancient wonders to modern skylines, discover what makes each destination unique with Autours.
              </p>
            </motion.div>

            {/* Countries List - Compact Spacing */}
            <div className="space-y-16 md:space-y-20">
              {countriesData.map((country, idx) => (
                <CountrySection
                  key={idx}
                  index={idx}
                  countryName={country.countryName}
                  titleSuffix={country.titleSuffix}
                  description={country.description}
                  images={country.images}
                  isReversed={idx % 2 !== 0}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Conclusion Section */}
        <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex justify-center mb-6">
              <img
                src="/img/whereWeAre/conc.png"
                alt="Conclusion"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain select-none pointer-events-none"
              />
            </div>
            <p className="text-neutral-600 text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              At Autours, we are dedicated to offering you a reliable, premium, and stress-free car rental experience across all our destinations. Whether you are traveling for business or leisure, our diverse fleet and top-notch customer support are always at your service. Start your journey with Autours today and explore these vibrant destinations with complete peace of mind.
            </p>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}