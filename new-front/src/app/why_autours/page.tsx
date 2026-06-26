'use client';

import { useEffect } from 'react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { motion } from 'framer-motion';
import SectionDivider from '@/components/sections/SectionDivider';

export default function WhyAutoursPage() {
  // Ensure page starts at the top scroll position on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const points = [
    {
      title: "Extensive Fleet",
      icon: '/img/whyAutours/drivers-fleet.png',
      description: "We offer a wide range of vehicles to suit any occasion, from compact cars for city driving to spacious SUVs for family trips. Whatever your needs, you'll find the perfect vehicle with us.",
    },
    {
      title: "Transparent Pricing",
      icon: '/img/whyAutours/pricing.png',
      description: "Our transparent pricing model ensures you get the best value for your rental. With no hidden fees and flexible rental options, we make it easy for you to find a deal that fits your budget.",
    },
    {
      title: "Seamless Booking",
      icon: '/img/whyAutours/seamless.png',
      description: "Our system is designed for your convenience. With a straightforward booking process, you can secure your vehicle in just a few clicks. Plus, our support team is always ready to assist.",
    },
    {
      title: "Flexible Options",
      icon: '/img/whyAutours/felx.png',
      description: "Whether you need a car for a day, a week, or longer, Autours offers flexible rental periods. We understand plans change, so we provide easy options for modifications and extensions.",
    },
    {
      title: "Premium Quality",
      icon: '/img/whyAutours/quality.png',
      description: "We are committed to providing the highest quality of service. From rigorous vehicle maintenance to round-the-clock customer assistance, we ensure your journey is smooth and worry-free.",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-grow">
        {/* Modern Hero Section */}
        <section className="relative w-full pt-16 pb-12 lg:pt-28 lg:pb-20 overflow-hidden bg-gray-50 border-b border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-50/70 to-transparent -z-10" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-10 lg:mb-16">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary-900 text-xs font-bold uppercase tracking-widest mb-6 border border-primary/30"
              >
                <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                The Autours Advantage
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-3xl sm:text-5xl lg:text-7xl font-black text-black tracking-tight leading-[1.1] mb-6"
              >
                Why <span className="text-primary-600 relative inline-block">Autours?<svg className="absolute w-full h-3 -bottom-1.5 left-0 text-primary/30" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q50,20 100,10" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/></svg></span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed font-medium max-w-3xl mx-auto"
              >
                Whether you are a supplier looking to expand your reach or a renter seeking the perfect vehicle, Autours is your trusted partner in the car rental market. Join us today and experience the Autours difference!
              </motion.p>
            </div>
            
            {/* Hero Image - Properly responsive */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full max-w-5xl mx-auto rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
              <img
                src="/img/whyAutours/why_autours_customer.jpg"
                alt="Why Autours - Customer Experience"
                className="w-full h-[300px] sm:h-[450px] md:h-[550px] object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* New Feature Cards Section - Clean, modern grid */}
        <section className="py-16 sm:py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center justify-center gap-3 mb-4"
              >
                <div className="w-12 h-1 bg-black rounded-full" />
                <span className="text-black font-black uppercase tracking-widest text-sm">Our Guarantee</span>
                <div className="w-12 h-1 bg-black rounded-full" />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-2xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight leading-tight"
              >
                An exceptional experience tailored to your needs.
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {points.map((point, idx) => {
                // The last item spans across empty columns to balance the grid
                const isLastAndOdd = idx === points.length - 1 && points.length % 3 !== 0;
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: (idx % 3) * 0.1 }}
                    className={`bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:shadow-[0_20px_40px_rgb(249,214,2,0.15)] hover:border-primary/50 transition-all duration-300 group flex flex-col h-full ${isLastAndOdd ? 'md:col-span-2 lg:col-span-1 lg:col-start-2' : ''}`}
                  >
                    {/* Image Header with soft background */}
                    <div className="w-full bg-gradient-to-b from-gray-50 to-white p-8 sm:p-10 flex items-center justify-center border-b border-gray-50 h-56 sm:h-64 group-hover:bg-primary-50/50 transition-colors duration-500">
                      <img
                        src={point.icon}
                        alt={point.title}
                        className="w-full max-w-[220px] sm:max-w-[280px] h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    {/* Text Body */}
                    <div className="p-8 sm:p-10 flex flex-col flex-grow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                          {point.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base font-medium leading-[1.8] flex-grow">
                        {point.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Call to action at the bottom */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.4 }}
               className="mt-20 sm:mt-24 flex justify-center"
            >
               <button className="bg-black text-white px-8 py-4 sm:px-10 sm:py-5 rounded-xl font-black uppercase tracking-wider text-sm sm:text-base hover:bg-primary hover:text-black hover:scale-105 transition-all duration-300 shadow-xl">
                  Start Your Journey
               </button>
            </motion.div>
            
          </div>
        </section>
      </main>
      <SectionDivider />
      <Footer />
    </div>
  );
}
