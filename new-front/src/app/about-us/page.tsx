'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import SectionDivider from '@/components/sections/SectionDivider';
import { assets } from '@/config/assets';
import { 
  Search, ArrowRight, Check, X, ChevronDown, Globe, 
  Building2, Plane, ShieldCheck, TrendingUp, Coins, 
  Clock, Sparkles, HelpCircle, Info, Star, Award, 
  ShieldAlert, ArrowUpRight, Car, Users, Gem
} from 'lucide-react';

const PARTNER_LOGOS = [
  { name: 'Alamo', logo: assets.suppliers.alamo },
  { name: 'Avis', logo: assets.suppliers.avis },
  { name: 'Hertz', logo: assets.suppliers.hertz },
  { name: 'Sixt', logo: assets.suppliers.sixt },
  { name: 'Dollar', logo: assets.suppliers.dollar },
  { name: 'Europcar', logo: assets.suppliers.europcar },
  { name: 'Enterprise', logo: assets.suppliers.enterprise },
  { name: 'Budget', logo: assets.suppliers.budget },
  { name: 'National', logo: assets.suppliers.national },
  { name: 'Thrifty', logo: assets.suppliers.thrifty },
  { name: 'Highway', logo: assets.suppliers.highway },
  { name: 'KTC', logo: assets.suppliers.ktc },
  { name: 'MAHD', logo: assets.suppliers.mahd },
  { name: 'RAMA', logo: assets.suppliers.rama },
  { name: 'Go Rental', logo: assets.suppliers.goRental },
  { name: 'Royal Star', logo: assets.suppliers.royalStar },
];

export default function AboutUsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const openModal = (index: number) => {
    setOpenFaq(index);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    setOpenFaq(null);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'unset';
    }
  };

  const faqs = [
    {
      q: "Is Autours a car rental comparison platform?",
      a: "Yes. Autours is a trusted car rental comparison platform that connects travelers with leading local and international car rental companies. We help customers compare prices, vehicles, and terms in one simple place."
    },
    {
      q: "How does Autours work?",
      a: "Choose your destination and travel dates. Instantly compare prices, vehicles, and rental conditions from multiple trusted suppliers. Choose the best match and complete your booking."
    },
    {
      q: "Which countries does Autours operate in?",
      a: "Autours currently serves travelers across the GCC countries, Egypt, Morocco, and Turkey, with continued regional expansion."
    },
    {
      q: "How many rental companies are available?",
      a: "Autours works with more than 30 trusted local and international car rental companies."
    },
    {
      q: "Can I compare airport car rentals?",
      a: "Yes. You can compare airport pickup options and city locations, depending on your destination."
    },
    {
      q: "Why should I compare prices before booking?",
      a: "Comparing multiple suppliers helps you find better prices, a wider vehicle selection, and rental conditions that match your travel needs."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-950 font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-grow">
        
        {/* ── 1. Hero Section (White Background with Premium Car Image) ── */}
        <section className="relative w-full py-12 lg:py-16 overflow-hidden bg-white border-b border-slate-100">
          {/* Subtle light grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-35" />
          
          {/* Light primary background blur glow */}
          <div className="absolute right-[-10%] top-[-10%] w-[450px] h-[450px] bg-primary/10 rounded-full filter blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-slate-800 text-xs font-black uppercase tracking-wider shadow-3xs mx-auto"
              >
                <Sparkles size={13} className="text-primary animate-pulse" />
                Car Comparison Marketplace
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-slate-900"
              >
                Compare Car Rentals <br />
                With Absolute <span className="bg-primary px-3.5 py-1 rounded-2xl inline-block shadow-2xs text-slate-950 font-black border border-primary/20 rotate-[-1deg]">Confidence</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-slate-600 text-sm sm:text-base md:text-lg leading-[1.8] max-w-2xl mx-auto font-semibold"
              >
                Autours is a trusted car rental comparison platform that connects travelers with leading local and international car rental companies. We help customers compare prices, vehicle options, rental conditions, and pickup locations, making it easier to find the right car at the right price.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="flex flex-wrap justify-center gap-4 pt-3"
              >
                <div className="bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl flex items-center gap-3.5 hover:border-primary/50 transition-colors shadow-3xs text-left">
                  <Globe size={20} className="text-primary-850" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Operating Areas</p>
                    <p className="text-xs sm:text-sm font-black text-slate-800 mt-1.5 leading-none">GCC, Egypt, Morocco, Turkey</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl flex items-center gap-3.5 hover:border-primary/50 transition-colors shadow-3xs text-left">
                  <Award size={20} className="text-primary-850" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Trusted Network</p>
                    <p className="text-xs sm:text-sm font-black text-slate-800 mt-1.5 leading-none">30+ Premium Partners</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 2. Bento Grid: Why Choose Us (Clean Slate Background) ── */}
        <section className="py-12 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-title">Why Choose Autours?</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 font-semibold">We simplify car renting by consolidating multiple local and global suppliers in one panel.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-primary/50 shadow-2xs flex flex-col justify-between transition-all relative overflow-hidden group cursor-default min-h-[200px]"
              >
                <div className="flex items-start justify-between">
                  <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-xl text-primary-900 shadow-2xs">
                    <Globe size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">01</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1 group-hover:text-primary-800 transition-colors">Compare Multiple Companies</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Browse offers from over 30 local and international rental partners without switching between different websites. Everything is gathered in one unified dashboard.
                  </p>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-primary/50 shadow-2xs flex flex-col justify-between transition-all relative overflow-hidden group cursor-default min-h-[200px]"
              >
                <div className="flex items-start justify-between">
                  <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-emerald-600 shadow-2xs">
                    <Coins size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">02</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1 group-hover:text-primary-800 transition-colors">Transparent Pricing</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    No hidden fees or surprises. Compare prices, vehicle categories, and rental conditions side-by-side before making your final decision.
                  </p>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-primary/50 shadow-2xs flex flex-col justify-between transition-all relative overflow-hidden group cursor-default min-h-[200px]"
              >
                <div className="flex items-start justify-between">
                  <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-blue-600 shadow-2xs">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">03</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1 group-hover:text-primary-800 transition-colors">Wide Vehicle Selection</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Choose from economy cars, compact, SUVs, luxury vehicles, family cars, vans, and long-term rental options to fit your specific trip.
                  </p>
                </div>
              </motion.div>

              {/* Card 4 */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-primary/50 shadow-2xs flex flex-col justify-between transition-all relative overflow-hidden group cursor-default min-h-[200px]"
              >
                <div className="flex items-start justify-between">
                  <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-amber-600 shadow-2xs">
                    <Building2 size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">04</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1 group-hover:text-primary-800 transition-colors">Airport &amp; City Pickups</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Find vehicles available right at airport terminals or convenient downtown city locations across Egypt, Turkey, Saudi Arabia, UAE, and other destinations.
                  </p>
                </div>
              </motion.div>

              {/* Card 5 */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-primary/50 shadow-2xs flex flex-col justify-between transition-all relative overflow-hidden group cursor-default min-h-[200px]"
              >
                <div className="flex items-start justify-between">
                  <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl text-red-650 shadow-2xs">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">05</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1 group-hover:text-primary-800 transition-colors">Secure Booking Experience</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Book with confidence through a secure, reliable comparison platform designed to protect your reservation and payment.
                  </p>
                </div>
              </motion.div>

              {/* Card 6 */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-primary/50 shadow-2xs flex flex-col justify-between transition-all relative overflow-hidden group cursor-default min-h-[200px]"
              >
                <div className="flex items-start justify-between">
                  <div className="bg-purple-50 border border-purple-100 p-2.5 rounded-xl text-purple-600 shadow-2xs">
                    <Clock size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">06</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1 group-hover:text-primary-800 transition-colors">Flexible Travel Solutions</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Whether you need a vehicle for a single day, one week, or a full month, Autours helps you find flexible options that adjust to your travel plans.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── 3. How Autours Works (Ultra-Premium Light Steps Layout) ── */}
        <section className="py-16 bg-slate-50/70 border-y border-slate-200/50 text-slate-900 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            <div className="text-center max-w-xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-850">Simple & Fast</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-title">
                How <span className="text-primary-850">Autours</span> Works
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-3 font-semibold leading-relaxed">
                Four simple steps to compare, reserve, and save on your next car rental.
              </p>
            </div>

            {/* Desktop Horizontal steps */}
            <div className="hidden lg:grid grid-cols-4 gap-6 relative">
              {/* Connector line behind cards */}
              <div className="absolute top-[52px] left-[12%] right-[12%] h-[2px] bg-slate-200 z-0" />

              {[
                { step: '01', title: 'Search', desc: 'Choose your destination, travel dates, and preferred pickup location.', icon: Search },
                { step: '02', title: 'Compare', desc: 'Instantly compare prices, vehicles, and rental conditions from multiple trusted suppliers.', icon: ArrowRight },
                { step: '03', title: 'Choose', desc: 'Select the vehicle that best fits your budget, size, and travel needs.', icon: Sparkles },
                { step: '04', title: 'Book', desc: 'Complete your reservation and enjoy a smooth pickup experience at your selected location.', icon: Check }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-[2.2rem] p-7 flex flex-col items-center text-center space-y-4 shadow-3xs hover:shadow-2xs transition-all relative border border-slate-200/80 hover:border-primary/50 group cursor-default z-10"
                >
                  {/* Large transparent step number in background */}
                  <div className="absolute top-4 right-6 text-5xl font-black text-slate-100 group-hover:text-primary/10 select-none transition-colors duration-300">
                    {item.step}
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center relative shrink-0 text-slate-800 group-hover:bg-primary group-hover:text-slate-950 group-hover:border-primary transition-all duration-300 shadow-3xs">
                    <item.icon size={20} className="stroke-[2.5]" />
                  </div>
                  
                  <div className="space-y-1.5 relative z-10">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-primary-850 transition-colors duration-300">{item.title}</h3>
                    <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed group-hover:text-slate-700 transition-colors duration-300">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile Vertical steps */}
            <div className="lg:hidden space-y-6 relative">
              <div className="absolute top-4 bottom-4 left-6 w-0.5 bg-slate-200" />
              {[
                { step: '01', title: 'Search', desc: 'Choose your destination, travel dates, and preferred pickup location.', icon: Search },
                { step: '02', title: 'Compare', desc: 'Instantly compare prices, vehicles, and rental conditions from multiple trusted suppliers.', icon: ArrowRight },
                { step: '03', title: 'Choose', desc: 'Select the vehicle that best fits your budget, size, and travel needs.', icon: Sparkles },
                { step: '04', title: 'Book', desc: 'Complete your reservation and enjoy a smooth pickup experience at your selected location.', icon: Check }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 relative z-10 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-850 relative shadow-3xs">
                    <item.icon size={18} className="stroke-[2.5]" />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-slate-950 font-black text-[10px] flex items-center justify-center shadow-xs">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex-1 space-y-1 shadow-3xs">
                    <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── 4. Story, Vision & Mission (White Background) ── */}
        <section className="py-12 bg-white text-slate-900 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Story (Our Background) */}
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="w-full lg:w-5/12 shrink-0 relative max-w-sm mx-auto">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden relative z-10 shadow-lg border border-slate-200 bg-slate-50">
                  <Image
                    src="/img/About%20us/Our-Vision.png"
                    alt="Our Story"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full filter blur-xl opacity-75 animate-pulse" />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 rounded-full filter blur-xl opacity-75 animate-pulse" />
              </div>
              
              <div className="w-full lg:w-7/12 space-y-3.5 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2.5">
                  <div className="w-6 h-1 bg-primary rounded-full" />
                  <span className="text-primary-850 font-black uppercase tracking-widest text-[10px] sm:text-xs">Our Story</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
                  Connecting Travelers and Rental Providers Since 2024
                </h2>
                
                <div className="space-y-5 text-left">
                  <p className="border-l-4 border-primary pl-4 py-1.5 text-slate-950 font-black text-sm sm:text-base md:text-lg leading-[1.8]">
                    Autours was launched in <strong>2024</strong> to solve one of the biggest challenges travelers face when renting a car—comparing prices and finding trustworthy rental providers.
                  </p>
                  
                  <p className="text-slate-800 text-xs sm:text-sm md:text-base font-extrabold leading-[1.8]">
                    Instead of spending hours searching individual company websites, we created a single platform where travelers can compare vehicles, prices, rental terms, and pickup locations from multiple suppliers in just a few clicks.
                  </p>
                  
                  <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl text-slate-900 text-xs sm:text-sm md:text-base font-extrabold leading-[1.8] shadow-3xs hover:border-primary/30 transition-colors">
                    As a comparison platform, Autours acts as the bridge between customers looking for the best rental option and trusted car rental companies seeking to reach more travelers. This approach creates value for both sides by improving transparency, expanding choice, and simplifying the booking process.
                  </div>
                </div>
              </div>
            </div>

            {/* Vision & Mission Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              
              {/* Vision Card */}
              <div className="bg-slate-50 border border-slate-200/80 p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-primary/50 transition-colors shadow-2xs text-left">
                <div className="absolute -right-12 -top-12 w-24 h-24 bg-primary/10 rounded-full filter blur-xl group-hover:bg-primary/20 transition-colors" />
                <div className="space-y-3.5 relative z-10">
                  <div className="bg-primary/10 border border-primary/20 w-12 h-12 rounded-xl flex items-center justify-center text-primary-800 shadow-2xs">
                    <Sparkles size={22} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-950">Our Vision</h3>
                  <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-[1.8] font-semibold">
                    To become the leading car rental comparison platform across the Middle East and neighboring travel destinations by making vehicle rental more transparent, accessible, and convenient for every traveler.
                  </p>
                </div>
                <div className="h-0.5 bg-primary w-16 rounded-full" />
              </div>

              {/* Mission Card */}
              <div className="bg-slate-50 border border-slate-200/80 p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-blue-400/30 transition-colors shadow-2xs text-left">
                <div className="absolute -right-12 -top-12 w-24 h-24 bg-blue-50 rounded-full filter blur-xl group-hover:bg-blue-100 transition-colors" />
                <div className="space-y-3.5 relative z-10">
                  <div className="bg-blue-50 border border-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 shadow-2xs">
                    <Award size={22} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-950">Our Mission</h3>
                  <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-[1.8] font-semibold mb-3">
                    Our mission is to connect travelers with trusted rental companies through one smart comparison platform.
                  </p>
                  <p className="text-slate-800 text-xs sm:text-sm font-black mb-2">We aim to:</p>
                  <div className="space-y-2">
                    {[
                      "Help travelers compare prices easily.",
                      "Support rental companies in reaching more customers.",
                      "Deliver transparent rental information.",
                      "Simplify the booking experience.",
                      "Build long-term partnerships based on trust and quality."
                    ].map((m, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Check size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm font-bold text-slate-650 leading-[1.65]">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-0.5 bg-blue-500 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Premium Side-by-Side Comparison Section ── */}
        <section className="py-12 bg-slate-50/50 border-y border-slate-200/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-title">Why Compare Instead of Booking Directly?</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 font-semibold">See how comparing with Autours gives you a massive advantage over standard single-company bookings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
              
              {/* Left Column: Direct Booking */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Direct Booking</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 leading-tight">Booking With One Company</h3>
                  
                  <div className="space-y-5">
                    {[
                      { title: "Compare only 1 supplier", desc: "You are locked into their rates and terms only." },
                      { title: "Limited vehicle choices", desc: "Only access inventory currently in their fleet." },
                      { title: "Single pricing option", desc: "No market competition to drive prices down." },
                      { title: "Time-consuming research", desc: "Requires visiting multiple websites manually." },
                      { title: "Harder to compare policies", desc: "Hidden terms are buried in separate pages." }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-3.5 items-start text-left">
                        <div className="w-5.5 h-5.5 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0 mt-0.5 shadow-2xs">
                          <X size={12} className="stroke-[3]" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-black text-slate-800 leading-tight">{item.title}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold leading-tight">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Comparing via Autours */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-primary/10 via-white to-white rounded-[2rem] p-6 sm:p-8 border-2 border-primary shadow-md flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-primary text-slate-950 font-black text-[9px] uppercase tracking-widest px-4.5 py-1.5 rounded-bl-2xl">
                  Best Value Choice
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-450 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary-800">Autours Comparison</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 leading-tight">Comparing Through Autours</h3>
                  
                  <div className="space-y-5">
                    {[
                      { title: "Compare 30+ suppliers at once", desc: "Instantly find the best rates across the market." },
                      { title: "Wider selection of vehicles", desc: "Access economy, SUVs, luxury, and family vans." },
                      { title: "Compare competitive prices", desc: "Get the absolute lowest price guaranteed." },
                      { title: "Everything in one place", desc: "No tab clutter, fully consolidated filters." },
                      { title: "Easy comparison of conditions", desc: "Clear pickup, dropoff, and cancellation terms." }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-3.5 items-start text-left">
                        <div className="w-5.5 h-5.5 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-950 shrink-0 mt-0.5 shadow-2xs">
                          <Check size={12} className="stroke-[3]" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">{item.title}</h4>
                          <p className="text-[10px] text-slate-500 font-bold leading-tight">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

            </div>
            
          </div>
        </section>

        {/* ── 6. Operating Countries & Vehicle Categories (White Background) ── */}
        <section className="py-16 bg-white text-slate-900 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              
              {/* Where We Operate */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight font-title">Where We Operate</h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">Autours continues to expand its network across key travel destinations.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { code: 'AE', label: 'GCC Countries', desc: 'UAE, KSA, Oman, Bahrain, Kuwait' },
                    { code: 'EG', label: 'Egypt', desc: 'Cairo, Hurghada, Sharm El-Sheikh, Alexandria' },
                    { code: 'MA', label: 'Morocco', desc: 'Marrakech, Casablanca, Agadir, Rabat' },
                    { code: 'TR', label: 'Turkey', desc: 'Istanbul, Antalya, Ankara, Izmir' }
                  ].map((dest, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -3 }}
                      className="bg-slate-50/50 border border-slate-200 p-4 rounded-2xl flex items-start gap-4 hover:border-primary/50 shadow-3xs transition-all group cursor-default"
                    >
                      <div className="w-12 h-8 rounded-lg overflow-hidden border border-slate-200 relative shrink-0 shadow-3xs">
                        <Image
                          src={`https://flagcdn.com/w80/${dest.code.toLowerCase()}.png`}
                          alt={dest.label}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-black text-slate-900 leading-tight group-hover:text-primary-850 transition-colors">{dest.label}</p>
                        <p className="text-[10px] sm:text-xs text-slate-400 font-semibold leading-snug mt-1">{dest.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="bg-primary/5 border border-primary/20 text-slate-800 p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-start gap-3 shadow-3xs leading-relaxed">
                  <Info size={18} className="shrink-0 mt-0.5 text-primary-850" />
                  <span>Our platform gives travelers access to rental companies operating in major cities, airports, and tourist destinations throughout these markets.</span>
                </div>
              </div>

              {/* Vehicle Categories */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight font-title">Our Vehicle Categories</h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">No matter how you travel, you'll find the right vehicle through our partners.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    "Mini", "Small", "Standard", "Economy", "Full Size", 
                    "Compact SUV", "SUV", "VAN", "Family", "Luxury"
                  ].map((cat, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -3, scale: 1.02 }}
                      className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-center text-center hover:border-primary hover:bg-primary/5 transition-all shadow-3xs cursor-default group"
                    >
                      <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-slate-950 transition-colors">{cat}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 p-4 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-3 shadow-3xs">
                  <Star size={18} className="text-emerald-600 shrink-0" fill="currentColor" />
                  <span>Ready for business trips, family vacations, or airport pickups.</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 7. Trusted Partner Network (Vibrant Primary Color Section with White Card Logos) ── */}
        <section className="py-12 bg-primary text-slate-950 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Trusted Partner Network</h2>
              <p className="text-slate-800 text-xs sm:text-sm mt-1 font-bold">Autours partners with more than 30 local and international car rental companies to give you the ultimate comparison experience.</p>
            </div>

            {/* Logo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
              {PARTNER_LOGOS.map((partner, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white/95 border border-slate-100 rounded-xl p-3.5 flex items-center justify-center aspect-video shadow-sm hover:bg-white transition-all group relative overflow-hidden cursor-default"
                >
                  <div className="relative w-full h-7 sm:h-8">
                    <Image 
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      sizes="110px"
                      className="object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-350"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            
            <p className="text-center text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-800 mt-8">And growing our list of regional providers every single month</p>
          </div>
        </section>

        {/* ── 8. FAQ Section Grid & Modals (White Background) ── */}
        <section className="py-12 bg-white text-slate-900 border-t border-slate-200/50 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-10">
              <div className="bg-primary/10 border border-primary/20 w-12 h-12 rounded-xl flex items-center justify-center text-primary-850 mx-auto mb-3">
                <HelpCircle size={22} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">FAQ</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 font-semibold">Have questions about Autours? We have compiled the most common answers here.</p>
            </div>

            {/* FAQ Grid system exactly like homepage */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04, duration: 0.4 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openModal(index)}
                  className="bg-slate-50/50 rounded-2xl p-5 border border-slate-200 hover:border-primary/50 cursor-pointer shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between min-h-[120px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-[10px] font-black text-slate-950 shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Question</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-primary-800 transition-colors">
                        {faq.q}
                      </h4>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors shrink-0 mt-1 shadow-2xs">
                      <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-950 transition-colors -rotate-90" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

      </main>

      {/* Modal Popup exactly like homepage */}
      <AnimatePresence>
        {openFaq !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="bg-primary px-6 py-4 flex items-center justify-between gap-4 shrink-0 border-b border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-primary">{openFaq + 1}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-950 leading-snug">
                    {faqs[openFaq].q}
                  </h3>
                </div>
                <button 
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                >
                  <X size={16} className="text-primary" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-grow overflow-y-auto p-6 text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                {faqs[openFaq].a}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SectionDivider />
      <Footer />
    </div>
  );
}
