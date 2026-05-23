'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { countries, Country } from '@/data/countries';
import Link from 'next/link';

function CountryCard({ country, index }: { country: Country; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <Link href={`/countries/${country.id}`} className="block">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        className="group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all"
      >
        <img
          src={country.image}
          alt={country.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] text-center italic">
            {country.name}
          </h3>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
      </motion.div>
    </Link>
  );
}

export default function WhereWeAreSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <section id="locations" ref={sectionRef} className="relative py-[45px] bg-primary flex flex-col items-center justify-center overflow-hidden px-4 md:px-8">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 border-t-8 border-l-8 border-black rounded-tl-[100px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 border-b-8 border-r-8 border-black rounded-br-[100px]" />
      </div>

      {/* Title */}
      <div className="text-center mb-7 mt-5 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-black text-black tracking-tighter uppercase  leading-none"
        >
          WHERE WE ARE
        </motion.h2>
      </div>

      {/* Grid */}
      <div className="w-full max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
        {countries.map((country, index) => (
          <CountryCard key={country.id} country={country} index={index} />
        ))}
      </div>

    </section>
  );
}
