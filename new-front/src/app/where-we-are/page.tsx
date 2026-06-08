'use client';

import { useEffect } from 'react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { motion } from 'framer-motion';
import CountrySection from './components/CountrySection';
import SectionDivider from '@/components/sections/SectionDivider';

export default function WhereWeArePage() {
  // Ensure page starts at the top scroll position on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const countriesData = [
    {
      countryName: 'Egypt',
      titleSuffix: 'LAND OF THE PHARAOHS',
      description: 'Egypt is a land of wonders, where ancient monuments stand alongside vibrant modern cities. Explore the majestic Cairo Tower and sail across the Nile, icons of human history. Drive along the scenic riverbanks, or visit the historic temples of Luxor and Karnak, showcasing the grandeur of the Pharaohs. Cairo offers a rich mix of Islamic and modern heritage.',
      images: [
        '/img/whereWeAre/5.png',
        '/img/whereWeAre/6.png',
        '/img/whereWeAre/4.png'
      ]
    },
    {
      countryName: 'Saudi Arabia',
      titleSuffix: 'A BLEND OF TRADITION AND MODERNITY',
      description: "Saudi Arabia offers a fascinating blend of ancient traditions and modern marvels. Drive through Riyadh and discover the historic Al Masmak Fortress, a symbol of the kingdom's rich heritage. Your journey should also take you to Jeddah, where the stunning Corniche and the iconic King Fahd Fountain await. For a taste of history, explore the spectacular Dead Sea coast and the bustling modern centers.",
      images: [
        '/img/whereWeAre/8.png',
        '/img/whereWeAre/19.png',
        '/img/whereWeAre/20.png'
      ]
    },
    {
      countryName: 'Bahrain',
      titleSuffix: 'A JEWEL OF THE GULF',
      description: 'In Bahrain, a small but captivating island nation, immerse yourself in a mix of culture and heritage. Drive to the Bahrain World Trade Center and the historical fortresses, a UNESCO World Heritage site, and learn about the rich history of this archipelago. Do not forget to visit the vibrant Manama Souq, where you can experience local flavors, carpets, and buy unique handicrafts.',
      images: [
        '/img/whereWeAre/24.png',
        '/img/whereWeAre/22.png',
        '/img/whereWeAre/23.png'
      ]
    },
    {
      countryName: 'Qatar',
      titleSuffix: 'WHERE HERITAGE MEETS FUTURE',
      description: 'Qatar is a dynamic peninsula where traditional Bedouin culture blends with futuristic design. Explore the modern skyline of West Bay in Doha, or walk through the historic spiral Fanar and Souq. Visit the Museum of Islamic Art, a masterpiece of modern architecture, and discover the sleek streets of Msheireb Downtown Doha.',
      images: [
        '/img/whereWeAre/10.png',
        '/img/whereWeAre/11.png',
        '/img/whereWeAre/12.png'
      ]
    },
    {
      countryName: 'Kuwait',
      titleSuffix: 'A BLEND OF OLD AND NEW',
      description: 'Kuwait is a vibrant nation with a rich history and a bright future. Start your journey at the iconic Kuwait Towers, where panoramic views of the city await. The Grand Mosque showcases the rich Islamic art and culture, while the Scientific Center offers a modern architectural and educational experience. Do not miss a drive along the beautiful Arabian Gulf Road, where the sea meets the skyline.',
      images: [
        '/img/whereWeAre/15.png',
        '/img/whereWeAre/14.png',
        '/img/whereWeAre/13.png'
      ]
    },
    {
      countryName: 'United Arab Emirates',
      titleSuffix: 'A FUSION OF CULTURES',
      description: 'The UAE is a dazzling blend of cultures and experiences. Drive through Dubai and experience the opulence of the Burj Khalifa and the unique architecture of the Dubai Mall. Visit the cultural heart of Abu Dhabi or enjoy the spectacular Dubai Fountain, where unique attractions stand as a testament to Islamic and modern architecture. Each emirate offers its own unique charm, making your journey an unforgettable adventure.',
      images: [
        '/img/whereWeAre/18.png',
        '/img/whereWeAre/17.png',
        '/img/whereWeAre/16.png'
      ]
    },
    {
      countryName: 'Oman',
      titleSuffix: 'THE SOUL OF ARABIA',
      description: 'Oman is a land of diverse landscapes and warm hospitality. Explore the capital city of Muscat, home to the magnificent Sultan Qaboos Grand Mosque and the historic Mutrah Souq. Drive to the Sur coast and see the Al Ayjah Lighthouse. Oman\'s pristine coastline and ancient forts offer a peaceful and authentic Arabian experience.',
      images: [
        '/img/whereWeAre/2.png',
        '/img/whereWeAre/3.png',
        '/img/whereWeAre/25.png'
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          
          {/* Section 1: Where We Are Title Image & Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            {/* Displaying the header title image file */}
            <div className="flex justify-center mb-6">
              <img
                src="/img/whereWeAre/title.png"
                alt="Where we are?"
                className="h-16 sm:h-20 md:h-24 w-auto object-contain select-none pointer-events-none"
              />
            </div>
            <p className="text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed max-w-4xl mx-auto font-medium">
              A Journey through Seven Vibrant Destinations At our car rental service, we believe that the journey is just as important as the destination. With our presence in seven stunning locations Egypt, Saudi Arabia, Bahrain, Qatar, Kuwait, the UAE, and Oman we invite you to explore the rich tapestry of culture, history, and adventure that each of these countries has to offer.
            </p>
          </motion.div>

          {/* Banner Hero Image - Maximum size */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 mb-16"
          >
            <img
              src="/img/whereWeAre/banner.png"
              alt="Where we are Banner"
              className="w-full h-auto object-cover max-h-[700px]"
            />
          </motion.div>

          {/* Country Sections List */}
          <div className="space-y-20 max-w-7xl mx-auto mb-20">
            {countriesData.map((country, idx) => (
              <CountrySection
                key={idx}
                countryName={country.countryName}
                titleSuffix={country.titleSuffix}
                description={country.description}
                images={country.images}
              />
            ))}
          </div>

          {/* Section 3: Conclusion Section */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border-t border-gray-100 pt-16 pb-8 max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <img
                src="/img/whereWeAre/conc.png"
                alt="Conclusion"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain select-none pointer-events-none"
              />
            </div>
            <p className="text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed font-normal">
              At Autours, we are dedicated to offering you a reliable, premium, and stress-free car rental experience across all our destinations. Whether you are traveling for business or leisure, our diverse fleet and top-notch customer support are always at your service. Start your journey with Autours today and explore these vibrant destinations with complete peace of mind.
            </p>
          </motion.div>

        </div>
      </main>
      
      <SectionDivider />
      <Footer />
    </div>
  );
}
