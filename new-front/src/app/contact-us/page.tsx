'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { motion, Variants } from 'framer-motion';
import { siteConfig } from '@/config/site';

// ─── SVG Icons ───────────────────────────────────────────────

const WhatsAppIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.451L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.774 9.774 0 0 0-6.973-2.875c-5.433 0-9.85 4.37-9.854 9.8-.002 2.012.528 3.978 1.533 5.726l-.998 3.647 3.738-.971zm10.842-7.468c-.294-.145-1.74-.846-2.01-.941-.271-.096-.468-.145-.666.145-.197.29-.767.942-.94 1.134-.173.192-.347.218-.64.073-.294-.145-1.243-.451-2.368-1.44-.875-.769-1.466-1.72-1.638-2.011-.173-.29-.018-.447.129-.591.132-.13.294-.34.441-.508.147-.169.197-.29.294-.483.098-.193.049-.362-.025-.508-.074-.146-.666-1.583-.912-2.164-.24-.574-.48-.496-.666-.506-.172-.008-.368-.01-.565-.01-.197 0-.517.073-.788.362-.271.29-1.034 1.002-1.034 2.443s1.01 2.827 1.152 3.018c.143.192 1.986 2.99 4.812 4.195.672.287 1.197.458 1.608.587.675.212 1.289.182 1.774.11.539-.08 1.74-.7 1.985-1.378.246-.677.246-1.258.172-1.378-.072-.12-.271-.19-.566-.336z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-6 h-6 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h2V1h-3C10.5 1 9 2.5 9 5v3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad)" strokeWidth="2" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#ig-grad)" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-grad)" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-6 h-6 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
  </svg>
);

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [emailHref, setEmailHref] = useState('javascript:void(0)');
  const [emailText, setEmailText] = useState('...');

  useEffect(() => {
    window.scrollTo(0, 0);
    setEmailHref('mailto:' + siteConfig.contact.email);
    setEmailText(siteConfig.contact.email);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (submitSuccess) setSubmitSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#1a1a2e] font-sans">
      <Navbar />

      <main className="flex-grow">
        {/* ─── Header Title Only (No Hero Section) ─── */}
        <section className="pt-16 pb-8 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a2e] tracking-tight mb-3">
                Contact Us
              </h1>
              <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mb-4" />
              <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto">
                We would love to hear from you. Reach out through any channel below.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── Main Content: Contact Cards + Form ─── */}
        <section className="py-8 md:py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

              {/* ─── Left: Contact Cards (New Beautiful Design) ─── */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className="lg:col-span-5 space-y-5"
              >
                {/* WhatsApp Card */}
                <motion.a
                  href={siteConfig.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeInUp}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="group block relative overflow-hidden bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l-2xl" />
                  <div className="flex items-center gap-5 p-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                      <WhatsAppIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-0.5">
                        WhatsApp
                      </span>
                      <span className="block text-lg font-black text-[#1a1a2e] truncate">
                        {siteConfig.contact.phone}
                      </span>
                      <span className="block text-xs text-gray-400 mt-0.5">
                        Fastest response
                      </span>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all duration-300">
                      <ArrowUpRightIcon />
                    </div>
                  </div>
                </motion.a>

                {/* Phone Card */}
                <motion.a
                  href={`tel:${siteConfig.contact.phoneVal}`}
                  variants={fadeInUp}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="group block relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-700 rounded-l-2xl" />
                  <div className="flex items-center gap-5 p-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-700 group-hover:text-white transition-all duration-300">
                      <PhoneIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">
                        Call Us
                      </span>
                      <span className="block text-lg font-black text-[#1a1a2e] truncate">
                        {siteConfig.contact.phone}
                      </span>
                      <span className="block text-xs text-gray-400 mt-0.5">
                        Sun - Thu, 9AM - 6PM
                      </span>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-slate-100 group-hover:text-slate-600 transition-all duration-300">
                      <ArrowUpRightIcon />
                    </div>
                  </div>
                </motion.a>

                {/* Email Card */}
                <motion.a
                  href={emailHref}
                  variants={fadeInUp}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="group block relative overflow-hidden bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-lg hover:border-amber-300 transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 rounded-l-2xl" />
                  <div className="flex items-center gap-5 p-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                      <MailIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-0.5">
                        Email Us
                      </span>
                      <span className="block text-base md:text-lg font-black text-[#1a1a2e] truncate">
                        {emailText}
                      </span>
                      <span className="block text-xs text-gray-400 mt-0.5">
                        We reply within 24h
                      </span>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-amber-50 group-hover:text-amber-500 transition-all duration-300">
                      <ArrowUpRightIcon />
                    </div>
                  </div>
                </motion.a>



                {/* Social Links */}
                <motion.div variants={fadeInUp} className="flex items-center gap-3 pt-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">
                    Follow:
                  </span>
                  <a href={siteConfig.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-[#1877F2]/10 flex items-center justify-center hover:bg-[#1877F2]/20 hover:scale-110 transition-all">
                    <FacebookIcon />
                  </a>
                  <a href={siteConfig.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center hover:scale-110 transition-all">
                    <InstagramIcon />
                  </a>
                  <a href={siteConfig.socials.x} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 hover:scale-110 transition-all">
                    <XIcon />
                  </a>
                  <a href={siteConfig.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center hover:bg-[#0A66C2]/20 hover:scale-110 transition-all">
                    <LinkedInIcon />
                  </a>
                </motion.div>
              </motion.div>

              {/* ─── Right: Contact Form ─── */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="lg:col-span-7"
              >
                <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-xl shadow-gray-200/30">
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-2">
                      Send a Message
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Fill out the form and we will get back to you shortly.
                    </p>
                  </div>

                  {submitSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-emerald-800">Message Sent!</span>
                        <span className="block text-xs text-emerald-600">We will reply within 24 hours.</span>
                      </div>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="John"
                          required
                          className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary focus:bg-white rounded-xl h-14 px-5 text-sm font-bold text-[#1a1a2e] placeholder:text-gray-300 outline-none transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Doe"
                          required
                          className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary focus:bg-white rounded-xl h-14 px-5 text-sm font-bold text-[#1a1a2e] placeholder:text-gray-300 outline-none transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Contact Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          required
                          className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary focus:bg-white rounded-xl h-14 px-5 text-sm font-bold text-[#1a1a2e] placeholder:text-gray-300 outline-none transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+20 1XX XXX XXXX"
                          className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary focus:bg-white rounded-xl h-14 px-5 text-sm font-bold text-[#1a1a2e] placeholder:text-gray-300 outline-none transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        required
                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary focus:bg-white rounded-xl h-14 px-5 text-sm font-bold text-[#1a1a2e] placeholder:text-gray-300 outline-none transition-all duration-300"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your inquiry..."
                        required
                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary focus:bg-white rounded-xl py-4 px-5 text-sm font-bold text-[#1a1a2e] placeholder:text-gray-300 outline-none transition-all duration-300 resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto px-10 py-4 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white font-black text-sm uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-[#1a1a2e]/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <SendIcon />
                            Send Message
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}