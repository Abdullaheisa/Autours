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
        {/* About Us Content Section */}
        <section className="max-w-4xl mx-auto px-6 py-12 md:py-16 text-left">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-black text-center mb-10 text-black tracking-tight"
          >
            About Us
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <h2 className="text-lg md:text-2xl font-black text-black leading-snug">
              At Autours, we strive to empower companies to reach a wide range of customers.
            </h2>

            <div className="text-gray-700 text-xs sm:text-sm md:text-[15px] leading-relaxed space-y-6 font-normal">
              <p>
                As a partner on our platform, we provide you with the opportunity to grow your business and expand your reach to local and regional markets. We believe that collaboration is the key to mutual growth, which is why we offer our partnered companies comprehensive tools and reports to help them enhance their services and engage better with customers.
              </p>
              <p>
                We are committed to providing a flexible and supportive business environment that contributes to the success of our partnerships. With Autours, we are dedicated to offering opportunities for continuous growth and development for car rental companies through our long-term partnerships.
              </p>
            </div>

            <h3 className="text-base md:text-xl font-black text-black leading-snug pt-2">
              Join us today and be part of the future of the car rental industry in the region.
            </h3>
          </motion.div>
        </section>

        {/* Hero Car Section */}
        {/* Since the image /img/About%20us/car.png already has the yellow stripe and shadow built-in, 
            displaying it at full-width handles the layout without any offset mismatches. */}
        <section className="w-full bg-white overflow-hidden flex justify-center py-2">
          <motion.img
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            src="/img/About%20us/car.png"
            alt="Lamborghini Aventador"
            className="w-full max-w-[1920px] h-auto object-contain select-none pointer-events-none"
          />
        </section>

        {/* Why Choose Us Section */}
        <section className="py-12 md:py-16 bg-white">
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

        {/* Vision and Goal Yellow Section */}
        <section className="bg-primary py-16 md:py-20 text-black">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Our Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight">
                Our Vision
              </h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <img
                  src="/img/About%20us/Our-Vision.png"
                  alt="Our Vision"
                  className="w-44 h-36 md:w-60 md:h-48 object-cover rounded-[1.2rem] md:rounded-[1.8rem] shadow-lg shrink-0"
                />
                <p className="text-black/85 text-base font-semibold sm:text-sm  leading-relaxed font-sans">
                  To be the preferred partner for car rental companies in the region by providing an innovative platform that supports their growth and expansion while enhancing their ability to deliver the best customer service.
                </p>
              </div>
            </motion.div>

            {/* Our Goal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight">
                Our Goal
              </h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <img
                  src="/img/About%20us/Our-Goals.png"
                  alt="Our Goal"
                  className="w-44 h-36 md:w-60 md:h-48 object-cover rounded-[1.2rem] md:rounded-[1.8rem] shadow-lg shrink-0"
                />
                <p className="text-black/85 text-base font-semibold sm:text-sm  leading-relaxed font-sans">
                  Support companies in reaching new markets through our platform. Provide analytical tools and reports to help companies improve their performance. Strengthen collaboration between Autours and its partners to ensure a smooth and successful rental experience. Achieve sustainable growth for partnered companies through transparency and continuous development.
                </p>
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
