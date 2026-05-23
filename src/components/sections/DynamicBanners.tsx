'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import SectionDivider from '@/components/sections/SectionDivider';

export default function DynamicBanners() {
  const [supplierEmail, setSupplierEmail] = useState('');
  const [cinemaEmail, setCinemaEmail] = useState('');

  // Variants for the car animation to simulate "driving forward" from the background
  const carVariants: Variants = {
    initial: { 
      x: -200, 
      opacity: 0, 
      scale: 0.6,
      filter: 'blur(4px)' 
    },
    visible: { 
      x: 0, 
      opacity: 1, 
      scale: 0.75,
      filter: 'blur(0px)',
      transition: { duration: 1.2, ease: "easeOut" }
    },
    hover: { 
      scale: 1.02, 
      x: 80, 
      y: -5,
      filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.4))',
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 18 
      }
    }
  };

  // Variants for the input container
  const inputVariants: Variants = {
    hover: { 
      y: -5, 
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 15 
      }
    }
  };

  return (
    <section className="space-y-0 overflow-hidden bg-white">
      {/* Banner 1: Be Supplier */}
      <motion.div 
        id="be-supplier-section"
        initial="initial"
        whileInView="visible"
        whileHover="hover"
        viewport={{ once: true, amount: 0.1 }}
        className="relative w-full overflow-hidden flex items-center justify-end cursor-default"
      >
        {/* Real Background Image - Ensures full visibility without cropping or black edges */}
        <img 
          src="/img/be-supplier-background.png" 
          className="w-full h-auto block"
          alt="Be Supplier Background"
        />

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-10 pointer-events-none" />
        
        {/* The Car Image - Driving forward effect */}
        <motion.div 
          variants={carVariants}
          className="absolute left-[-10%] sm:left-[-5%] bottom-[5%] w-[60%] sm:w-[50%] lg:w-[45%] z-20 pointer-events-none select-none"
        >
          <img 
            src="/img/be-supplier-car.png" 
            alt="Be Supplier Car" 
            className="w-full h-auto object-contain"
          />
        </motion.div>

        {/* Content - Input + Button (BALANCED ON DESKTOP) */}
        <div className="absolute inset-y-0 right-0 z-30 w-full max-w-[180px] sm:max-w-md flex items-end pb-8 sm:pb-16 lg:pb-24 px-4 sm:px-10 lg:mr-24">
          <motion.div 
            variants={inputVariants}
            className="flex items-center w-full h-8 sm:h-16 bg-black/80 backdrop-blur-3xl rounded-full border border-white/20 overflow-hidden p-0.5 sm:p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors duration-300 hover:border-primary/30"
          >
            <input 
              type="email" 
              value={supplierEmail}
              onChange={(e) => setSupplierEmail(e.target.value)}
              placeholder="YOUR MAIL" 
              className="flex-1 min-w-0 bg-transparent px-3 sm:px-8 text-[9px] sm:text-base font-bold text-white placeholder:text-white/30 outline-none tracking-tight sm:tracking-widest uppercase h-full"
            />
            <Link href="/be-supplier" className="h-full block shrink-0">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-full px-4 sm:px-10 bg-primary text-black text-[9px] sm:text-sm font-black rounded-full transition-colors duration-300 uppercase tracking-tighter sm:tracking-widest shadow-lg hover:bg-white flex items-center justify-center"
              >
                Submit
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <SectionDivider />

      {/* Banner 2: Cinema Promo */}
      <motion.div 
        whileHover="hover"
        className="relative w-full overflow-hidden flex items-center justify-end cursor-default"
      >
        <img 
          src="/img/offers.jpeg" 
          className="w-full h-auto block"
          alt="Cinema Offers"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 transition-opacity duration-700 hover:opacity-30 z-10 pointer-events-none" />

        {/* Content - Input + Button (BALANCED ON DESKTOP) */}
        <div className="absolute bottom-4 left-4 sm:left-20 z-20 w-full max-w-[160px] sm:max-w-md flex items-end pb-8 sm:pb-16 lg:pb-24 px-4 sm:px-10 lg:mr-10">
          <motion.div 
            variants={inputVariants}
            className="flex items-center w-full h-8 sm:h-16 bg-black/80 backdrop-blur-3xl rounded-full border border-white/20 overflow-hidden p-0.5 sm:p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors duration-300 hover:border-primary/30"
          >
            <input 
              type="email" 
              value={cinemaEmail}
              onChange={(e) => setCinemaEmail(e.target.value)}
              placeholder="بريدك" 
              className="flex-1 min-w-0 bg-transparent px-3 sm:px-8 text-[9px] sm:text-base font-bold text-white placeholder:text-white/30 outline-none text-right h-full"
              dir="rtl"
            />
            <div className="h-full block shrink-0">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-full px-4 sm:px-10 bg-primary text-black text-[9px] sm:text-sm font-black rounded-full transition-colors duration-300 uppercase tracking-tighter sm:tracking-widest shadow-lg hover:bg-white flex items-center justify-center"
              >
                سجل الآن
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
