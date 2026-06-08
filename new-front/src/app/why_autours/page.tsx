'use client';

import { useEffect } from 'react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { motion } from 'framer-motion';
import FeaturePoint from './components/FeaturePoint';
import SectionDivider from '@/components/sections/SectionDivider';

export default function WhyAutoursPage() {
  // Ensure page starts at the top scroll position on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const points = [
    {
      icon: '/img/whyAutours/drivers-fleet.png',
      description: "We offer a wide range of vehicles to suit any occasion, from compact cars for city driving to spacious SUVs for family trips. Whatever your needs, you'll find the perfect vehicle with us.",
    },
    {
      icon: '/img/whyAutours/pricing.png',
      description: "Our transparent pricing model ensures you get the best value for your rental. With no hidden fees and flexible rental options, we make it easy for you to find a deal that fits your budget.",
    },
    {
      icon: '/img/whyAutours/seamless.png',

      description: "Our system is designed for your convenience. With a straightforward booking process, you can secure your vehicle in just a few clicks. Plus, our customer support team is always ready to assist you with any inquiries.",
    },
    {
      icon: '/img/whyAutours/felx.png',
      description: "Whether you need a car for a day, a week, or longer, Autours offers flexible rental periods to accommodate your schedule. We understand that plans can change, so we provide easy options for modifications and extensions.",
    },
    {
      icon: '/img/whyAutours/quality.png',
      description: "We are committed to providing the highest quality of service. From vehicle maintenance to customer assistance, we ensure your journey is smooth and worry-free.",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          
          {/* Section 1: Why Autours? Title Image & Text */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            {/* Displaying the title image file instead of HTML text heading */}
            <div className="flex justify-center mb-6">
              <img
                src="/img/whyAutours/ttile.png"
                alt="Why Autours?"
                className="h-16 sm:h-20 md:h-24 w-auto object-contain select-none pointer-events-none"
              />
            </div>
            <p className="text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              Whether you are a supplier looking to expand your reach or a renter of a vehicle, Autours is your trusted partner in the car rental market. Join us today and experience the Autours difference!
            </p>
          </motion.div>

          {/* Hero Image - Maximum size (max-w-7xl, shadow, rounded) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 mb-12"
          >
            <img
              src="/img/whyAutours/why_autours_customer.jpg"
              alt="Why Autours"
              className="w-full h-auto object-cover max-h-[700px]"
            />
          </motion.div>

          {/* Section 2: Customers Title Image & Text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            {/* Displaying the title image file instead of HTML text heading */}
            <div className="flex justify-center mb-6">
              <img
                src="/img/whyAutours/customers.png"
                alt="Customers"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain select-none pointer-events-none"
              />
            </div>
            <p className="text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              At Autours, we strive to provide an exceptional car rental experience tailored to your needs. Here's why choosing us is the right decision:
            </p>
          </motion.div>

          {/* Points List using FeaturePoint component */}
          <div className="space-y-8 max-w-5xl mx-auto">
            {points.map((point, idx) => (
              <FeaturePoint
                key={idx}
                icon={point.icon}
                description={point.description}
                delay={idx * 0.05} title={''}              />
            ))}
          </div>

        </div>
      </main>
      <SectionDivider />
      <Footer />
    </div>
  );
}
