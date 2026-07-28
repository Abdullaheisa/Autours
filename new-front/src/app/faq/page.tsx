'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Settings, 
  Mail, 
  Phone,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { defaultFaqs, FAQItem } from '@/data/faqData';
import { siteConfig } from '@/config/site';

// Icons mapped to categories for visual appeal
const categoryIcons: Record<string, any> = {
  All: BookOpen,
  General: Settings,
  Requirements: FileText,
  Booking: BookOpen,
  Insurance: ShieldCheck
};

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter FAQs based on category and search query
  const filteredFaqs = defaultFaqs.filter(faq => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch = 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Split filtered FAQs into two columns for a clean side-by-side design
  const leftColFaqs = filteredFaqs.filter((_, idx) => idx % 2 === 0);
  const rightColFaqs = filteredFaqs.filter((_, idx) => idx % 2 !== 0);

  const categories = ['All', 'General', 'Booking', 'Requirements', 'Insurance'];

  const toggleAccordion = (q: string) => {
    setExpandedQuestion(expandedQuestion === q ? null : q);
  };

  const renderFaqCard = (faq: FAQItem) => {
    const isExpanded = expandedQuestion === faq.q;
    return (
      <motion.div
        key={faq.q}
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
      >
        <button
          onClick={() => toggleAccordion(faq.q)}
          className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left focus:outline-none hover:bg-slate-50 transition-colors"
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded w-max">
              {faq.category}
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
              {faq.q}
            </h3>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0"
          >
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-2 border-t border-slate-50">
                <div className="space-y-4">
                  {faq.a.split('\n\n').map((paragraph, pIdx) => {
                    const isList = paragraph.startsWith('•') || paragraph.startsWith('-') || /^\d+\./.test(paragraph);
                    if (isList) {
                      return (
                        <div key={pIdx} className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-black text-gray-900">✓</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                            {paragraph.replace(/^[•\-\d]+\.\s*/, '')}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <p key={pIdx} className="text-sm font-semibold text-slate-600 leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-24 md:pt-32 pb-16">
        {/* Modern Header Section */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center max-w-3xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary-950 text-xs font-black uppercase tracking-widest mb-4 border border-primary/20">
              <HelpCircle className="w-4 h-4 text-primary-900" />
              Customer Support
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 uppercase">
              How Can We <span className="text-primary-600">Help?</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed mb-8">
              Search our comprehensive database of frequently asked questions or select a category below to find the answers you need.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto shadow-lg shadow-slate-100 rounded-2xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for questions, rules, insurance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-950 placeholder-slate-400 text-base font-medium transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-900"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Content Layout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Filters */}
            <div className="lg:col-span-1 space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 mb-4">
                Categories
              </h3>
              <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-3 lg:pb-0 scrollbar-hide">
                {categories.map((cat) => {
                  const Icon = categoryIcons[cat] || BookOpen;
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setExpandedQuestion(null);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink ${
                        isActive 
                          ? 'bg-primary text-gray-900 shadow-md shadow-primary/20' 
                          : 'bg-white border border-slate-100 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-gray-900' : 'text-slate-400'}`} />
                      {cat === 'All' ? 'All Questions' : cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accordions in 2-Column Grid */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="popLayout">
                {filteredFaqs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {leftColFaqs.map(renderFaqCard)}
                    </div>
                    {/* Right Column */}
                    <div className="space-y-4">
                      {rightColFaqs.map(renderFaqCard)}
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    layout
                    className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm"
                  >
                    <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-800 mb-2">No results found</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                      We couldn't find any questions matching "{searchQuery}". Try checking the spelling or using broader search terms.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </section>

        {/* Contact / Help Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl shadow-slate-900/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full opacity-10 blur-3xl -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-600 rounded-full opacity-5 blur-3xl -ml-20 -mb-20" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-xl text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl font-black uppercase mb-4 tracking-tight">
                  Still have questions?
                </h3>
                <p className="text-slate-400 font-medium text-sm md:text-base">
                  Can't find the answer you're looking for? Our friendly and experienced customer support team is available 24/7 to help you.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/10 transition-all text-sm uppercase tracking-wider"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  Email Support
                </a>
                <Link
                  href="/contact-us"
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary-600 text-gray-900 font-black rounded-2xl transition-all shadow-lg shadow-primary/10 text-sm uppercase tracking-wider animate-bounce-slow"
                >
                  Contact Us
                  <ArrowRight className="w-4 h-4 text-gray-900" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
