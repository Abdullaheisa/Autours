'use client';

import { motion } from 'framer-motion';

interface CountrySectionProps {
  countryName: string;
  titleSuffix: string;
  description: string;
  images: string[];
}

export default function CountrySection({
  countryName,
  titleSuffix,
  description,
  images
}: CountrySectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className="w-full flex flex-col items-center"
    >
      {/* Title Header with Yellow Location Pin */}
      <div className="flex items-center gap-2.5 mb-4 text-center justify-center">
        {/* Map Pin Icon */}
        <svg
          className="w-8 h-8 text-[#fde047] shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-black tracking-tight font-title">
          <span className="text-black">{countryName}:</span>{' '}
          <span className="text-black/90 font-black">{titleSuffix}</span>
        </h2>
      </div>

      {/* Description Text */}
      <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed max-w-4xl text-center mx-auto mb-8 font-normal">
        {description}
      </p>

      {/* Grid of Three Rounded Image Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {images.map((imgUrl, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-lg border border-black/5"
          >
            <img
              src={imgUrl}
              alt={`${countryName} landmark ${index + 1}`}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
