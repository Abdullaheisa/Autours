'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { motion } from 'framer-motion';
import SectionDivider from '@/components/sections/SectionDivider';

// Custom SVG Icons
const WhatsAppIcon = () => (
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.451L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.774 9.774 0 0 0-6.973-2.875c-5.433 0-9.85 4.37-9.854 9.8-.002 2.012.528 3.978 1.533 5.726l-.998 3.647 3.738-.971zm10.842-7.468c-.294-.145-1.74-.846-2.01-.941-.271-.096-.468-.145-.666.145-.197.29-.767.942-.94 1.134-.173.192-.347.218-.64.073-.294-.145-1.243-.451-2.368-1.44-.875-.769-1.466-1.72-1.638-2.011-.173-.29-.018-.447.129-.591.132-.13.294-.34.441-.508.147-.169.197-.29.294-.483.098-.193.049-.362-.025-.508-.074-.146-.666-1.583-.912-2.164-.24-.574-.48-.496-.666-.506-.172-.008-.368-.01-.565-.01-.197 0-.517.073-.788.362-.271.29-1.034 1.002-1.034 2.443s1.01 2.827 1.152 3.018c.143.192 1.986 2.99 4.812 4.195.672.287 1.197.458 1.608.587.675.212 1.289.182 1.774.11.539-.08 1.74-.7 1.985-1.378.246-.677.246-1.258.172-1.378-.072-.12-.271-.19-.566-.336z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-9 h-9 text-[#1877F2] hover:scale-110 active:scale-95 transition-transform cursor-pointer" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h2V1h-3C10.5 1 9 2.5 9 5v3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-9 h-9 hover:scale-110 active:scale-95 transition-transform cursor-pointer" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#instagram-gradient)" strokeWidth="2" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#instagram-gradient)" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="url(#instagram-gradient)" />
  </svg>
);

const XIcon = () => (
  <svg className="w-8 h-8 text-black hover:scale-110 active:scale-95 transition-transform cursor-pointer" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-9 h-9 hover:scale-110 active:scale-95 transition-transform cursor-pointer" viewBox="0 0 24 24" fill="none">
    {/* Cyan Offset Path */}
    <path 
      d="M19.19 6.29a4.83 4.83 0 0 1-3.77-4.25V1.6h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 3.11.75V8.26a8.13 8.13 0 0 0-3.07-.6 8.09 8.09 0 1 0 8.09 8.09V8.31A11.53 11.53 0 0 0 19.19 11.6V6.29z" 
      fill="#25F4EE" 
    />
    {/* Red/Pink Offset Path */}
    <path 
      d="M19.99 7.09a4.83 4.83 0 0 1-3.77-4.25V2.4h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 3.11.75V9.06a8.13 8.13 0 0 0-3.07-.6 8.09 8.09 0 1 0 8.09 8.09V9.11A11.53 11.53 0 0 0 19.99 12.4V7.09z" 
      fill="#FE2C55" 
    />
    {/* Black Base Path */}
    <path 
      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 3.11.75V8.66a8.13 8.13 0 0 0-3.07-.6 8.09 8.09 0 1 0 8.09 8.09V8.71A11.53 11.53 0 0 0 19.59 12V6.69z" 
      fill="#000000" 
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-9 h-9 text-[#0A66C2] hover:scale-110 active:scale-95 transition-transform cursor-pointer" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
  </svg>
);

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  // Ensure page starts at the top scroll position on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted form data:', formData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <Navbar />

      <main className="flex-grow bg-[#fefce8] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header "Contact Us" */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-black inline-block relative tracking-tight isolate">
              Contact Us
              <span className="absolute left-0 right-0 bottom-0.5 h-3.5 bg-primary -rotate-1 opacity-90 z-[-1]" />
            </h1>
          </div>

          {/* Core Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* Left: Contact Info Cards */}
            <div className="lg:col-span-4 flex flex-col gap-10 w-full max-w-sm mx-auto lg:mx-0">
              
              {/* Message Us WhatsApp Card */}
              <motion.a
                href="https://wa.me/96560480382"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -4 }}
                className="bg-black rounded-[2rem] pt-10 pb-6 px-6 relative border-2 border-black flex flex-col items-center justify-center text-center shadow-lg group transition-all"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center shadow-md">
                  <WhatsAppIcon />
                </div>
                <span className="text-xs font-black text-primary tracking-wider uppercase mb-1">
                  Message Us
                </span>
                <span className="text-lg font-black text-primary tracking-wide">
                  +965 6048 0382
                </span>
              </motion.a>

              {/* Call Us Card */}
              <motion.a
                href="tel:+96560480382"
                whileHover={{ y: -4 }}
                className="bg-black rounded-[2rem] pt-10 pb-6 px-6 relative border-2 border-black flex flex-col items-center justify-center text-center shadow-lg group transition-all"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center shadow-md">
                  <PhoneIcon />
                </div>
                <span className="text-xs font-black text-primary tracking-wider uppercase mb-1">
                  Call Us
                </span>
                <span className="text-lg font-black text-primary tracking-wide">
                  +965 6048 0382
                </span>
              </motion.a>

              {/* Email Us Card */}
              <motion.a
                href="mailto:Info@autours.net"
                whileHover={{ y: -4 }}
                className="bg-black rounded-[2rem] pt-10 pb-6 px-6 relative border-2 border-black flex flex-col items-center justify-center text-center shadow-lg group transition-all"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center shadow-md">
                  <MailIcon />
                </div>
                <span className="text-xs font-black text-primary tracking-wider uppercase mb-1">
                  Email Us
                </span>
                <span className="text-lg font-black text-primary tracking-wide truncate max-w-full">
                  Info@autours.net
                </span>
              </motion.a>

            </div>

            {/* Right: Get in Touch Form */}
            <div className="lg:col-span-8 w-full">
              <h2 className="text-3xl font-black text-[#2b3a4a] mb-8 tracking-tight text-center lg:text-left">
                Get in Touch
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                      className="w-full bg-[#fde047]/15 border border-[#f9d602]/25 focus:border-[#f9d602] focus:bg-[#fde047]/25 rounded-2xl h-16 px-6 text-sm font-bold placeholder:text-gray-500 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                      className="w-full bg-[#fde047]/15 border border-[#f9d602]/25 focus:border-[#f9d602] focus:bg-[#fde047]/25 rounded-2xl h-16 px-6 text-sm font-bold placeholder:text-gray-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Contact Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="E-mail Address"
                      required
                      className="w-full bg-[#fde047]/15 border border-[#f9d602]/25 focus:border-[#f9d602] focus:bg-[#fde047]/25 rounded-2xl h-16 px-6 text-sm font-bold placeholder:text-gray-500 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className="w-full bg-[#fde047]/15 border border-[#f9d602]/25 focus:border-[#f9d602] focus:bg-[#fde047]/25 rounded-2xl h-16 px-6 text-sm font-bold placeholder:text-gray-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Message Field */}
                <div className="relative">
                  <textarea
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Message..."
                    required
                    className="w-full bg-[#fde047]/15 border border-[#f9d602]/25 focus:border-[#f9d602] focus:bg-[#fde047]/25 rounded-3xl py-6 px-6 text-sm font-bold placeholder:text-gray-500 outline-none transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 text-left">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#fde047] hover:bg-[#facc15] text-[#2b3a4a] font-black text-sm uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all"
                  >
                    Submit
                  </button>
                </div>

              </form>
            </div>

          </div>

          {/* Centered Social Links row at the very bottom */}
          <div className="flex justify-center items-center gap-6 mt-16 pt-8 border-t border-black/5">
            <a href="https://web.facebook.com/people/Autours/61560740824598/" target="_blank" rel="noopener noreferrer">
              <FacebookIcon />
            </a>
            <a href="https://www.instagram.com/autours_/" target="_blank" rel="noopener noreferrer">
              <InstagramIcon />
            </a>
            <a href="https://x.com/Autours_" target="_blank" rel="noopener noreferrer">
              <XIcon />
            </a>

            <a href="https://www.linkedin.com/company/autours/" target="_blank" rel="noopener noreferrer">
              <LinkedInIcon />
            </a>
          </div>

        </div>
      </main>
      <SectionDivider />
      <Footer />
    </div>
  );
}
