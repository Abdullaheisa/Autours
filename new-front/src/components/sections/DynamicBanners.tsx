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

  const getUserCountry = async () => {
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      const data = await res.json();
      return data.country || '';
    } catch (e) {
      console.warn('Failed to detect country automatically', e);
      return '';
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierEmail) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSupplierLoading(true);
    try {
      const country = await getUserCountry();
      await subscriberApi.sendEmail({ email: supplierEmail, type: 'supplier', country });
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
      const country = await getUserCountry();
      await subscriberApi.sendEmail({ email: cinemaEmail, type: 'offers', country });
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

  const DESIRED_ORDER = ['be_supplier', 'offers'];

  const bannerKeys = Object.keys(backgrounds)
    .filter(
      (key) => 
        key !== 'banner' && 
        key !== 'our_fleet' && 
        key !== 'login' && 
        key !== 'manage_booking' && 
        backgrounds[key] !== ''
    )
    .sort((a, b) => {
      const indexA = DESIRED_ORDER.indexOf(a);
      const indexB = DESIRED_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });

  if (bannerKeys.length === 0) return null;

  return (
    <section className="space-y-0 overflow-hidden bg-white">
      {bannerKeys.map((key, index) => {
        const isLast = index === bannerKeys.length - 1;
        const imagePath = backgrounds[key];

        return (
          <div key={key}>
            {key === 'be_supplier' && (
              <motion.div 
                id="be-supplier-section"
                initial="initial"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, amount: 0.1 }}
                className="relative w-full aspect-[16/7] overflow-hidden flex items-center justify-end cursor-default"
              >
                <Image 
                  src={resolveImageUrl(imagePath, '/img/be-supplier-background.webp')} 
                  alt="Be Supplier Background"
                  fill
                  sizes="100vw"
                  quality={100}
                  className="object-cover w-full h-full"
                />

                <motion.div 
                  variants={carVariants}
                  className="hidden md:block absolute left-[-10%] sm:left-[-5%] bottom-[5%] w-[60%] sm:w-[50%] lg:w-[45%] h-full z-20 pointer-events-none select-none"
                >
                  <Image 
                    src="/img/be-supplier-car.webp" 
                    alt="Be Supplier Car" 
                    fill
                    sizes="(max-width: 768px) 60vw, 45vw"
                    className="object-contain"
                  />
                </motion.div>

                <div className="absolute inset-y-0 right-0 z-30 w-full max-w-[150px] sm:max-w-xs md:max-w-sm flex items-end pb-2 sm:pb-6 lg:pb-10 px-2 sm:px-6 lg:mr-16">
                  <motion.form 
                    onSubmit={handleSupplierSubmit}
                    variants={inputVariants}
                    className="flex items-center w-full h-7 sm:h-10 md:h-12 bg-black/80 backdrop-blur-3xl rounded-full border border-white/20 overflow-hidden p-0.5 sm:p-1.5 shadow-lg transition-colors duration-300 hover:border-primary/30"
                  >
                    <input 
                      type="email" 
                      value={supplierEmail}
                      onChange={(e) => setSupplierEmail(e.target.value)}
                      placeholder={supplierLoading ? "SENDING..." : "YOUR MAIL"} 
                      disabled={supplierLoading}
                      className="flex-1 min-w-0 bg-transparent px-2 sm:px-4 md:px-5 text-[10px] sm:text-xs md:text-sm font-bold text-white placeholder:text-white/40 outline-none tracking-tight sm:tracking-widest uppercase h-full disabled:opacity-50"
                    />
                    <motion.button 
                      type="submit"
                      disabled={supplierLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="h-full px-3 sm:px-6 md:px-8 bg-primary text-black text-[10px] sm:text-xs md:text-sm font-bold rounded-full transition-colors duration-300 uppercase tracking-tighter sm:tracking-widest shadow-md hover:bg-white flex items-center justify-center shrink-0 disabled:opacity-50"
                    >
                      {supplierLoading ? '...' : 'Submit'}
                    </motion.button>
                  </motion.form>
                </div>
              </motion.div>
            )}

            {key === 'offers' && (
              <motion.div 
                whileHover="hover"
                className="relative w-full aspect-[16/7] overflow-hidden flex items-center justify-end cursor-default"
              >
                <Image 
                  src={resolveImageUrl(imagePath, '/img/offers.webp')} 
                  alt="Cinema Offers"
                  fill
                  sizes="100vw"
                  quality={100}
                  className="object-cover w-full h-full"
                />

                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-8 lg:left-14 z-20 w-full max-w-[140px] sm:max-w-xs md:max-w-sm flex items-end pb-1 sm:pb-4 lg:pb-8 px-1.5 sm:px-4">
                  <motion.form 
                    onSubmit={handleCinemaSubmit}
                    variants={inputVariants}
                    className="flex items-center w-full h-6 sm:h-10 md:h-12 bg-black/80 backdrop-blur-3xl rounded-full border border-white/20 overflow-hidden p-0.5 sm:p-1.5 shadow-lg transition-colors duration-300 hover:border-primary/30"
                  >
                    <input 
                      type="email" 
                      value={cinemaEmail}
                      onChange={(e) => setCinemaEmail(e.target.value)}
                      placeholder={cinemaLoading ? "جاري..." : "بريدك"} 
                      disabled={cinemaLoading}
                      className="flex-1 min-w-0 bg-transparent px-2 sm:px-4 md:px-5 text-[9px] sm:text-xs md:text-sm font-normal text-white placeholder:text-white/40 outline-none text-right h-full disabled:opacity-50"
                      dir="rtl"
                    />
                    <motion.button 
                      type="submit"
                      disabled={cinemaLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="h-full px-2.5 sm:px-6 md:px-8 bg-primary text-black text-[9px] sm:text-xs md:text-sm font-black rounded-full transition-colors duration-300 uppercase tracking-tighter sm:tracking-widest shadow-md hover:bg-white flex items-center justify-center shrink-0 disabled:opacity-50"
                    >
                      {cinemaLoading ? '...' : 'سجل الآن'}
                    </motion.button>
                  </motion.form>
                </div>
              </motion.div>
            )}

            {key !== 'be_supplier' && key !== 'offers' && (
              <motion.div 
                whileHover="hover"
                className="relative w-full overflow-hidden flex items-center justify-center cursor-default aspect-[16/7]"
              >
                <Image 
                  src={resolveImageUrl(imagePath, '/img/offers.webp')} 
                  alt="Dynamic Custom Banner"
                  fill
                  priority 
                  sizes="100vw"
                  quality={100} 
                  className="object-cover w-full h-full" 
                />
              </motion.div>
            )}

            <SectionDivider />
          </div>
        );
      })}
    </section>
  );
}
