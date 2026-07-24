'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, PhoneCall, AlertCircle, Compass } from 'lucide-react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page Not Found | Autours';
  }, []);

  const content = {
    title: 'Oops! Page Not Found',
    subtitle: '404 - Road Not Found',
    description: "The route you are trying to reach doesn't exist or has been relocated. Let's get you back on track to continue your journey.",
    homeBtn: 'Back to Home',
    supportBtn: 'Contact Support',
    popularLinksTitle: 'Popular Destinations:',
    links: [
      { label: 'Our Fleet', href: '#fleet' },
      { label: 'About Us', href: '/about-us' },
      { label: 'Our Blog', href: '/blogs' },
      { label: 'Where We Are', href: '/where-we-are' }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 border-4 border-black rounded-full" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] border-4 border-black rounded-full" />
        </div>

        <div className="max-w-2xl w-full text-center relative z-10">
          {/* Animated Illustration */}
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <span className="text-[120px] sm:text-[180px] font-black text-gray-900 leading-none select-none tracking-tighter block">
                404
              </span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 border-4 border-dashed border-primary rounded-full opacity-35"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-black font-black text-xs sm:text-sm px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                <AlertCircle size={14} />
                <span>{content.subtitle}</span>
              </div>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight"
          >
            {content.title}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-600 font-bold text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed"
          >
            {content.description}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12"
          >
            <Link
              href="/"
              className="w-full sm:w-auto px-8 h-14 bg-primary hover:bg-gray-900 text-gray-900 hover:text-primary font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 rounded-2xl shadow-xl shadow-primary/10 flex items-center justify-center gap-2 group"
            >
              <Home size={16} />
              <span>{content.homeBtn}</span>
            </Link>

            <Link
              href="/contact-us"
              className="w-full sm:w-auto px-8 h-14 bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-700 hover:text-gray-900 font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 rounded-2xl flex items-center justify-center gap-2"
            >
              <PhoneCall size={16} />
              <span>{content.supportBtn}</span>
            </Link>
          </motion.div>

          {/* Helpful Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="border-t border-gray-200/80 pt-8"
          >
            <span className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-wider mb-4 block flex items-center justify-center gap-1.5">
              <Compass size={16} className="text-primary" />
              {content.popularLinksTitle}
            </span>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {content.links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="px-4 py-2 bg-white hover:bg-primary/10 border border-gray-100 rounded-xl text-xs sm:text-sm font-bold text-gray-700 hover:text-gray-900 transition-all duration-300 shadow-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
