'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Mail, Globe, Phone, Lock, ArrowRight } from 'lucide-react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';

export default function BeSupplierPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col font-body">
      <Navbar />
      
      {/* Split Hero Section */}
      <section className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left: Content (Yellow) */}
        <div className="lg:w-1/2 bg-primary flex items-center justify-center p-6 sm:p-12 lg:p-20 relative">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl"
          >
            <div className="max-h-[80vh] overflow-y-auto pr-6 custom-scrollbar-clean">
              <div className="text-gray-900 text-lg md:text-xl font-bold leading-relaxed space-y-10">
                <p className="font-body">
                  Become a car rental supplier! Autours is a company operating in the tourism field since its establishment in 2005, with car rental bookings being our main area of expertise. We provide you a great chance to increase the business, as through our multilingual www.autours.net millions of customers from different countries book their car rental. We have a huge affiliate and reseller network worldwide, who send us high amount of car bookings in different countries and destinations. It is an opportunity for you to expand your business in different markets. If you are a car rental company, small or big, and you want to increase the volume of your car rental reservations, you are welcome to join our car rental partner network.
                </p>

                <div className="pt-8 border-t border-black/10">
                  <p className="font-title font-black text-black text-2xl mb-6">
                    Benefits from joining the car rental network of www.autours.net
                  </p>
                  <p className="space-y-4 font-body">
                    No financial risk at all. The customers pay directly to you upon the arrival. <br/><br/>
                    Immediate increase of your car rental sales. <br/><br/>
                    No entry/administration fee or other costs. <br/><br/>
                    Access to our agent area for special offers, stop sales, statistics, information and evaluation results from customers. <br/><br/>
                    The results from the feedback and evaluation will help you and improve your service. <br/><br/>
                    Smart reservation procedure for confirming via e-mail or Dashboard for your admin interface. <br/><br/>
                    Flexible system for amendments, cancellations and one-way rentals. <br/><br/>
                    Guaranteed bookings and very low volume of no-show customers Our team will assist you, proposing rates, car groups purchase, changes and tips.
                  </p>
                </div>

                <div className="pt-8 opacity-60">
                  <p className="text-xs font-black uppercase tracking-widest italic font-body">
                    Please fill in the Supplier Application Form in order to get more information on how you can become an www.autours.net Supplier.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Registration Form */}
        <div className="lg:w-1/2 bg-gray-50 flex items-center justify-center p-6 sm:p-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white"
          >
            <h2 className="text-4xl font-black text-gray-900 mb-10 tracking-tighter font-title uppercase">Registration</h2>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 font-body">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Enter Name"
                      className="w-full bg-gray-50 border border-gray-100 focus:border-primary focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 font-body">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="email" 
                      placeholder="admin@autours.net"
                      className="w-full bg-gray-50 border border-gray-100 focus:border-primary focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 font-body">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Country</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Your Country"
                    className="w-full bg-gray-50 border border-gray-100 focus:border-primary focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-24 space-y-1.5 font-body">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Code</label>
                  <input 
                    type="text" 
                    defaultValue="+20"
                    className="w-full bg-gray-50 border border-gray-100 focus:border-primary rounded-2xl py-4 text-sm font-bold text-center outline-none transition-all"
                  />
                </div>
                <div className="flex-1 space-y-1.5 font-body">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="tel" 
                      placeholder="Phone number"
                      className="w-full bg-gray-50 border border-gray-100 focus:border-primary focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 font-body">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-100 focus:border-primary focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-8">
                <button 
                  type="submit"
                  className="w-full h-16 bg-primary border-2 border-transparent hover:bg-white hover:border-primary text-gray-900 font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] group font-title"
                >
                  <span className="text-lg uppercase tracking-widest">Register Now</span>
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="text-center mt-6">
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-primary transition-all duration-300 uppercase tracking-widest group font-body"
                >
                  Manage My Booking 
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        .custom-scrollbar-clean::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar-clean::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar-clean::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar-clean::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </main>
  );
}
