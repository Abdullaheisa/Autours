'use client';

import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { motion } from 'framer-motion';
import SectionDivider from '@/components/sections/SectionDivider';

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <Navbar />

      <main className="flex-grow">
        {/* Modern Hero Section - Tighter spacing, better line-height */}
        <section className="relative w-full pt-12 pb-6 lg:pt-20 lg:pb-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-50/70 to-white -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-8 lg:mb-12">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary-800 text-xs font-bold uppercase tracking-widest mb-4"
              >
                <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                About Autours
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight leading-[1.1] mb-6"
              >
                Empowering the <span className="text-primary-600 relative inline-block">Future<svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q50,20 100,10" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/></svg></span> of Car Rental
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-sm sm:text-base text-gray-700 leading-[1.8] font-medium max-w-3xl mx-auto space-y-6"
              >
                <p>
                  At Autours, we strive to empower companies to reach a wide range of customers. As a partner on our platform, we provide you with the opportunity to grow your business and expand your reach to local and regional markets.
                </p>
                <p>
                  We believe that collaboration is the key to mutual growth, which is why we offer our partnered companies comprehensive tools and reports to help them enhance their services and engage better with customers.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Hero Car Section - Enhanced visual impact but tighter to text */}
        <section className="w-full bg-white relative -mt-6 sm:-mt-8 z-10 px-4 mb-16">
          <div className="max-w-7xl mx-auto flex justify-center">
             <motion.img
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                src="/img/About%20us/car.png"
                alt="Lamborghini Aventador"
                className="w-full max-w-[1000px] h-auto object-contain select-none pointer-events-none drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] hover:scale-[1.02] transition-transform duration-700"
              />
          </div>
        </section>

        {/* ORIGINAL Why Choose Us Section */}
        <section className="py-12 md:py-16 bg-white border-y border-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-black text-[#2b3a4a] text-center mb-12 tracking-tight">
              Why Choose Us
            </h2>

            <div className="flex flex-row justify-center items-center gap-3 sm:gap-8 md:gap-16 flex-nowrap w-full overflow-x-auto scrollbar-hide px-4 py-2">
              {[
                { icon: '/img/About%20us/car-icon.png', title: 'ALL BRANDS' },
                { icon: '/img/About%20us/team-icon.png', title: 'EXPERT TEAM' },
                { icon: '/img/About%20us/24-h-icon.png', title: '24 H SERVICE' },
                { icon: '/img/About%20us/AFFORDABLE-icon.png', title: 'AFFORDABLE' },
                { icon: '/img/About%20us/anywhere-icon.png', title: 'ANY WHERE' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="flex flex-col items-center text-center space-y-3 shrink-0 min-w-[75px] sm:min-w-[100px]"
                >
                  <div className="h-16 flex items-center justify-center">
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="h-16 md:h-20 w-auto object-contain"
                    />
                  </div>
                  <span className="text-[10px] md:text-xs font-black text-black tracking-wider uppercase font-title">
                    {item.title}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision and Goal Section - Tighter, smaller images, centered layout */}
        <section className="py-20 sm:py-24 bg-white overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
            
            {/* Our Vision */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center"
            >
              <div className="w-full md:w-2/5 shrink-0 relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden relative z-10 shadow-lg bg-gray-100">
                   <img
                     src="/img/About%20us/Our-Vision.png"
                     alt="Our Vision"
                     className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                   />
                </div>
                {/* Decorative background shapes */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
              </div>

              <div className="w-full md:w-3/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-1 bg-primary rounded-full" />
                  <span className="text-primary-700 font-bold uppercase tracking-widest text-xs">Our Vision</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-tight">
                  Driving the future of mobility.
                </h2>
                <p className="text-gray-600 text-sm sm:text-base font-medium leading-[1.7]">
                  To be the preferred partner for car rental companies in the region by providing an innovative platform that supports their growth and expansion while enhancing their ability to deliver the best customer service.
                </p>
              </div>
            </motion.div>

            {/* Our Goal */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row-reverse gap-8 lg:gap-12 items-center"
            >
              <div className="w-full md:w-2/5 shrink-0 relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden relative z-10 shadow-lg bg-gray-100">
                   <img
                     src="/img/About%20us/Our-Goals.png"
                     alt="Our Goal"
                     className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                   />
                </div>
                {/* Decorative background shapes */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
              </div>

              <div className="w-full md:w-3/5 space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-1 bg-black rounded-full" />
                  <span className="text-gray-800 font-bold uppercase tracking-widest text-xs">Our Mission</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-tight mb-4">
                  Our core goals for mutual success.
                </h2>

                <div className="space-y-1.5">
                  {[
                    "Support companies in reaching new markets through our platform.",
                    "Provide analytical tools and reports to help improve performance.",
                    "Strengthen collaboration to ensure a successful rental experience.",
                    "Achieve sustainable growth through transparency and development."
                  ].map((goal, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-700 text-sm font-medium leading-snug">
                        {goal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </section>
      </main>
      <SectionDivider />
      <Footer />
    </div>
  );
}
