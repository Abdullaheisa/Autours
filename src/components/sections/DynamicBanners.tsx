'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

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

        {/* Content - Input + Button */}
        <div className="absolute inset-y-0 right-0 z-30 w-full max-w-[85%] sm:max-w-xl flex items-end pb-8 sm:pb-16 lg:pb-24 px-4 sm:px-10 lg:mr-24">
          <motion.div 
            variants={inputVariants}
            className="flex items-center w-full bg-black/70 backdrop-blur-xl rounded-full border border-white/10 overflow-hidden p-1.5 sm:p-2 shadow-2xl transition-colors duration-300 hover:border-primary/30"
          >
            <input 
              type="email" 
              value={supplierEmail}
              onChange={(e) => setSupplierEmail(e.target.value)}
              placeholder="WRITE YOUR MAIL" 
              className="flex-1 bg-transparent px-4 sm:px-8 py-3 sm:py-4 text-[10px] sm:text-sm font-bold text-white placeholder:text-white/30 outline-none tracking-widest uppercase"
            />
            <Link href="/be-supplier">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-10 py-3 sm:py-4 bg-primary text-black text-[10px] sm:text-sm font-black rounded-full transition-colors duration-300 uppercase tracking-[0.2em] shrink-0 shadow-lg hover:bg-white"
              >
                SUBMIT
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

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

        {/* Content - Input + Button */}
        <div className="absolute inset-y-0 right-0 z-20 w-full max-w-[85%] sm:max-w-xl flex items-end pb-8 sm:pb-16 lg:pb-24 px-4 sm:px-10 lg:mr-10">
          <motion.div 
            variants={inputVariants}
            className="flex items-center w-full bg-black/70 backdrop-blur-xl rounded-full border border-white/10 overflow-hidden p-1.5 sm:p-2 shadow-2xl transition-colors duration-300 hover:border-primary/30"
          >
            <input 
              type="email" 
              value={cinemaEmail}
              onChange={(e) => setCinemaEmail(e.target.value)}
              placeholder="اكتب بريدك هنا" 
              className="flex-1 bg-transparent px-4 sm:px-8 py-3 sm:py-4 text-[10px] sm:text-sm font-bold text-white placeholder:text-white/30 outline-none text-right"
              dir="rtl"
            />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-10 py-3 sm:py-4 bg-primary text-black text-[10px] sm:text-sm font-black rounded-full transition-colors duration-300 uppercase tracking-widest shrink-0 shadow-lg hover:bg-white"
            >
              سجل الآن
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

