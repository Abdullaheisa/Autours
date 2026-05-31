'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import SectionDivider from '@/components/sections/SectionDivider';
import { referenceApi, subscriberApi } from '@/services/api';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function resolveImageUrl(path: string | undefined, fallback: string): string {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
}

export default function DynamicBanners() {
  const [supplierEmail, setSupplierEmail] = useState('');
  const [cinemaEmail, setCinemaEmail] = useState('');
  const [backgrounds, setBackgrounds] = useState<Record<string, string>>({});
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [cinemaLoading, setCinemaLoading] = useState(false);

  useEffect(() => {
    referenceApi.getBackgrounds()
      .then((res: any) => {
        if (res?.status && res?.data) {
          setBackgrounds(res.data);
        } else if (typeof res === 'object') {
          setBackgrounds(res);
        }
      })
      .catch(() => {/* fallback */});
  }, []);

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierEmail) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSupplierLoading(true);
    try {
      await subscriberApi.sendEmail({ email: supplierEmail, type: 'supplier' });
      toast.success('Supplier subscription submitted successfully!');
      setSupplierEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit supplier subscription.');
    } finally {
      setSupplierLoading(false);
    }
  };

  const handleCinemaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cinemaEmail) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setCinemaLoading(true);
    try {
      await subscriberApi.sendEmail({ email: cinemaEmail, type: 'offers' });
      toast.success('Cinema offers subscription successful!');
      setCinemaEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to subscribe to cinema offers.');
    } finally {
      setCinemaLoading(false);
    }
  };

  const carVariants: Variants = {
    initial: { x: -200, opacity: 0, scale: 0.6, filter: 'blur(4px)' },
    visible: { x: 0, opacity: 1, scale: 0.75, filter: 'blur(0px)', transition: { duration: 1.2, ease: "easeOut" } },
    hover: { scale: 1.02, x: 80, y: -5, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.4))', transition: { type: "spring", stiffness: 100, damping: 18 } }
  };

  const inputVariants: Variants = {
    hover: { y: -5, scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.3)", transition: { type: "spring", stiffness: 400, damping: 15 } }
  };

  const showSupplier = backgrounds['be_supplier'] !== undefined && backgrounds['be_supplier'] !== '';
  const showCinema = backgrounds['offers'] !== undefined && backgrounds['offers'] !== '';

  if (!showSupplier && !showCinema) return null;

  return (
    <section className="space-y-0 overflow-hidden bg-white">
      {/* Banner 1: Be Supplier */}
      {showSupplier && (
        <motion.div 
          id="be-supplier-section"
          initial="initial"
          whileInView="visible"
          whileHover="hover"
          viewport={{ once: true, amount: 0.1 }}
          className="relative w-full h-[400px] md:h-[500px] overflow-hidden flex items-center justify-end cursor-default"
        >
          <Image 
            src={resolveImageUrl(backgrounds['be_supplier'], '/img/be-supplier-background.png')} 
            alt="Be Supplier Background"
            fill
            sizes="100vw"
            quality={75}
            className="object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-10 pointer-events-none" />
          
          {/* 🚀 إضافة hidden md:block لإخفاء العربية على الموبايل */}
          <motion.div 
            variants={carVariants}
            className="hidden md:block absolute left-[-10%] sm:left-[-5%] bottom-[5%] w-[60%] sm:w-[50%] lg:w-[45%] h-full z-20 pointer-events-none select-none"
          >
            <Image 
              src="/img/be-supplier-car.png" 
              alt="Be Supplier Car" 
              fill
              sizes="(max-width: 768px) 60vw, 45vw"
              className="object-contain"
            />
          </motion.div>

          <div className="absolute inset-y-0 right-0 z-30 w-full max-w-[180px] sm:max-w-md flex items-end pb-8 sm:pb-16 lg:pb-24 px-4 sm:px-10 lg:mr-24">
            <motion.form 
              onSubmit={handleSupplierSubmit}
              variants={inputVariants}
              className="flex items-center w-full h-8 sm:h-16 bg-black/80 backdrop-blur-3xl rounded-full border border-white/20 overflow-hidden p-0.5 sm:p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors duration-300 hover:border-primary/30"
            >
              <input 
                type="email" 
                value={supplierEmail}
                onChange={(e) => setSupplierEmail(e.target.value)}
                placeholder={supplierLoading ? "SENDING..." : "YOUR MAIL"} 
                disabled={supplierLoading}
                className="flex-1 min-w-0 bg-transparent px-3 sm:px-8 text-[9px] sm:text-base font-bold text-white placeholder:text-white/30 outline-none tracking-tight sm:tracking-widest uppercase h-full disabled:opacity-50"
              />
              <motion.button 
                type="submit"
                disabled={supplierLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-full px-4 sm:px-10 bg-primary text-black text-[9px] sm:text-sm font-black rounded-full transition-colors duration-300 uppercase tracking-tighter sm:tracking-widest shadow-lg hover:bg-white flex items-center justify-center disabled:opacity-50"
              >
                {supplierLoading ? '...' : 'Submit'}
              </motion.button>
            </motion.form>
          </div>
        </motion.div>
      )}

      {showSupplier && showCinema && <SectionDivider />}

      {/* Banner 2: Cinema Promo */}
      {showCinema && (
        <motion.div 
          whileHover="hover"
          className="relative w-full h-[400px] md:h-[500px] overflow-hidden flex items-center justify-end cursor-default"
        >
          <Image 
            src={resolveImageUrl(backgrounds['offers'], '/img/offers.jpeg')} 
            alt="Cinema Offers"
            fill
            sizes="100vw"
            quality={75}
            className="object-contain"
          />
          <div className="absolute inset-0 bg-black/20 transition-opacity duration-700 hover:opacity-30 z-10 pointer-events-none" />

          <div className="absolute bottom-4 left-4 sm:left-20 z-20 w-full max-w-[160px] sm:max-w-md flex items-end pb-8 sm:pb-16 lg:pb-24 px-4 sm:px-10 lg:mr-10">
            <motion.form 
              onSubmit={handleCinemaSubmit}
              variants={inputVariants}
              className="flex items-center w-full h-8 sm:h-16 bg-black/80 backdrop-blur-3xl rounded-full border border-white/20 overflow-hidden p-0.5 sm:p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors duration-300 hover:border-primary/30"
            >
              <input 
                type="email" 
                value={cinemaEmail}
                onChange={(e) => setCinemaEmail(e.target.value)}
                placeholder={cinemaLoading ? "جاري..." : "بريدك"} 
                disabled={cinemaLoading}
                className="flex-1 min-w-0 bg-transparent px-3 sm:px-8 text-[9px] sm:text-base font-bold text-white placeholder:text-white/30 outline-none text-right h-full disabled:opacity-50"
                dir="rtl"
              />
              <motion.button 
                type="submit"
                disabled={cinemaLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-full px-4 sm:px-10 bg-primary text-black text-[9px] sm:text-sm font-black rounded-full transition-colors duration-300 uppercase tracking-tighter sm:tracking-widest shadow-lg hover:bg-white flex items-center justify-center disabled:opacity-50"
              >
                {cinemaLoading ? '...' : 'سجل الآن'}
              </motion.button>
            </motion.form>
          </div>
        </motion.div>
      )}
    </section>
  );
}