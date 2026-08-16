import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '@/utils/getImageUrl';

interface CountrySectionProps {
  countryName: string;
  titleSuffix: string;
  description: string;
  images: string[];
  index: number;
  isReversed: boolean;
}

export default function CountrySection({
  countryName,
  titleSuffix,
  description,
  images,
  isReversed
}: CountrySectionProps) {
  const slugMap: Record<string, string> = {
    'Egypt': 'egypt',
    'Saudi Arabia': 'saudi',
    'Bahrain': 'bahrain',
    'Qatar': 'qatar',
    'Kuwait': 'kuwait',
    'UAE': 'uae',
    'United Arab Emirates': 'uae',
    'Oman': 'oman',
    'Jordan': 'jordan',
    'Turkey': 'turkey',
    'Morocco': 'morocco',
    'Greece': 'greece',
    'Bosnia and Herzegovina': 'bosnia',
    'Azerbaijan': 'azerbaijan',
    'Cyprus': 'cyprus',
    'Georgia': 'georgia',
  };
  const countrySlug = slugMap[countryName] || countryName.toLowerCase();

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center"
    >
      {/* Text Content */}
      <div className={`space-y-4 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">
              Destination
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 leading-tight">
            <Link 
              href={`/countries/${countrySlug}`} 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              {countryName}
            </Link>
            <span className="block text-neutral-400 font-light text-lg sm:text-xl md:text-2xl mt-0.5">
              {titleSuffix}
            </span>
          </h3>
        </div>

        {/* Description */}
        <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-lg">
          {description}
        </p>

        {/* Related Cities Links if available */}
        {(() => {
          const relatedCities = [
            ...(countrySlug === 'uae' || countryName.toLowerCase().includes('emirates')
              ? [{ slug: 'dubai', name: 'Dubai' }]
              : [])
          ];
          if (relatedCities.length === 0) return null;
          return (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Popular Cities:</span>
              {relatedCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/cities/${city.slug}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/15 hover:bg-primary text-black text-xs font-black transition-all border border-primary/30 shadow-sm hover:scale-105"
                >
                  <MapPin className="w-3 h-3" />
                  {city.name} Car Rental
                </Link>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Images Grid */}
      <div className={`${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Main Large Image */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="col-span-2 aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden shadow-md group"
          >
            <Link href={`/countries/${countrySlug}`}>
              <img
                src={getImageUrl(images[0])}
                alt={`${countryName} main`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
              />
            </Link>
          </motion.div>

          {/* Two Smaller Images */}
          {images.slice(1).map((imgUrl, imgIdx) => (
            <motion.div
              key={imgIdx}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm group"
            >
              <Link href={`/countries/${countrySlug}`}>
                <img
                  src={getImageUrl(imgUrl)}
                  alt={`${countryName} ${imgIdx + 2}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}