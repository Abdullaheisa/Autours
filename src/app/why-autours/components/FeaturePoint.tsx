'use client';

import { motion } from 'framer-motion';

interface FeaturePointProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

export default function FeaturePoint({ icon, title, description, delay = 0 }: FeaturePointProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center text-center"
    >
      {/* Icon Container */}
      <div className="h-28 md:h-36 flex items-center justify-center mb-2">
        <img
          src={icon}
          alt={title}
          className="h-24 md:h-32 w-auto object-contain transition-transform duration-300 hover:scale-105 select-none pointer-events-none"
        />
      </div>


      {/* Description */}
      <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl font-normal">
        {description}
      </p>
    </motion.div>
  );
}
