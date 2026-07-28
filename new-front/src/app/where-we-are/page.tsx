'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import CountrySection from './components/CountrySection';
import { Globe, ChevronDown } from 'lucide-react';
import { countriesData } from '@/data/whereWeAreData';
import { getImageUrl } from '@/utils/getImageUrl';

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
            src={getImageUrl("/img/whereWeAre/banner.png")}
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
              Ten Vibrant Destinations
            </span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tight mb-6">
            Where We Are
          </h1>

          <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
            A journey through ten vibrant destinations. Explore the rich tapestry of culture, history, and adventure across the Middle East and beyond.
          </p>

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
                src={getImageUrl("/img/whereWeAre/conc.png")}
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