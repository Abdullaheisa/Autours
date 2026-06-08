'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Car,
  Headset,
  Globe,
  ShieldCheck,
  BadgeCheck,
  BadgeX,
  Languages,
  CalendarCog,
  CircleX,
  Building2,
} from 'lucide-react';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    id: 'variety',
    icon: <Car size={32} strokeWidth={1.2} />,
    title: 'Variety Of Cars',
    description: 'Choose from a wide range of cars with a variety of models and colors to meet all your needs.',
  },
  {
    id: 'support',
    icon: <Headset size={32} strokeWidth={1.2} />,
    title: '24/7 Customer Service',
    description: 'Continuous support available around the clock, everyday of the week at any time.',
  },
  {
    id: 'countries',
    icon: <Globe size={32} strokeWidth={1.2} />,
    title: 'Present in 9 Arab Countries',
    description: "We're present in 9 Arab countries, bringing our services closer to you throughout the region.",
  },
  {
    id: 'payment',
    icon: <ShieldCheck size={32} strokeWidth={1.2} />,
    title: 'Multiple and secure payment options',
    description: 'We offer multiple and secure payment options, ensuring flexibility and safety for all your transactions.',
  },
  {
    id: 'confirmation',
    icon: <BadgeCheck size={32} strokeWidth={1.2} />,
    title: 'Instant Confirmation',
    description: 'Receive Instant Confirmation, ensuring your booking is secured immediately Without any extra steps.',
  },
  {
    id: 'nofees',
    icon: <BadgeX size={32} strokeWidth={1.2} />,
    title: 'No visa or hidden fees',
    description: 'No extra fees when using your credit card & We offer transparent pricing with no undisclosed costs.',
  },
  {
    id: 'multilingual',
    icon: <Languages size={32} strokeWidth={1.2} />,
    title: 'Multilingual customer service',
    description: 'Our team available to support you in multiple languages.',
  },
  {
    id: 'modifications',
    icon: <CalendarCog size={32} strokeWidth={1.2} />,
    title: 'Free Booking Modifications',
    description: 'Easily modify your booking, without any charges you can change the day or duration.',
  },
  {
    id: 'cancellation',
    icon: <CircleX size={32} strokeWidth={1.2} />,
    title: 'Free Cancellation',
    description: 'Enjoy the option of free Cancellation without any additional charges.',
  },
  {
    id: 'global',
    icon: <Building2 size={32} strokeWidth={1.2} />,
    title: 'Global Rental Companies',
    description: 'We partner with the best global rental companies to ensure high-quality service.',
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="group text-center"
    >
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gray-50 text-gray-800 transition-all duration-300 group-hover:bg-primary group-hover:text-black group-hover:shadow-lg group-hover:shadow-primary/25 group-hover:scale-110">
        {feature.icon}
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed max-w-[220px] mx-auto">
        {feature.description}
      </p>
    </motion.div>
  );
}

export default function WhyAutoursSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section ref={sectionRef} className="relative py-16 lg:py-20 bg-white overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight"
          >
            Why <span className="text-primary">AUTOURS </span>?
          </motion.h2>
        </div>

        {/* Features Grid — 5 columns, compact */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
}
