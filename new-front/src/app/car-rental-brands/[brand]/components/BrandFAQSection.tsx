'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BrandFAQ } from '@/data/brandExtras';

interface BrandFAQSectionProps {
  brandName: string;
  faqs: BrandFAQ[];
}

export default function BrandFAQSection({ brandName, faqs }: BrandFAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Cleanup scroll lock on unmount
  useEffect(() => {
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const visibleFaqs = (isMobile && !showAll) ? faqs.slice(0, 3) : faqs;

  const openModal = (index: number) => {
    setOpenIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setOpenIndex(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <section className="bg-gradient-to-br from-primary via-primary-300 to-primary-600 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-600 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="max-w-6xl xl:max-w-[90rem] 2xl:max-w-[95rem] mb-10 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* â”€â”€â”€ Header â”€â”€â”€ */}
        <div className="text-center my-10">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight mt-1"
          >
            {brandName} FAQs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 }}
            className="mt-2 text-gray-700 text-sm max-w-lg mx-auto"
          >
            Everything you need to know before booking your {brandName} car rental through Autours.
          </motion.p>
        </div>

        {/* â”€â”€â”€ FAQ Cards Grid â”€â”€â”€ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleFaqs.map((faq, i) => {
            const originalIndex = faqs.indexOf(faq);
            return (
              <motion.div
                key={originalIndex}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal(originalIndex)}
                className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-400/20 border border-gray-100 cursor-pointer hover:shadow-xl hover:shadow-gray-400/30 transition-shadow group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-xs font-black text-gray-900 shrink-0">
                        {originalIndex + 1}
                      </span>
                      <span className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">Question</span>
                    </div>
                    <h3 className="text-sm lg:text-base font-bold text-gray-900 leading-snug group-hover:text-primary-600 transition-colors">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary transition-colors shrink-0 mt-1">
                    <ChevronRight size={16} className="text-gray-500 group-hover:text-gray-900 transition-colors" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Show More (mobile) */}
        {isMobile && faqs.length > 3 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 border border-gray-100"
            >
              {showAll ? 'Show Less' : 'Show More'}
            </button>
          </div>
        )}
      </div>

      {/* â”€â”€â”€ Modal â”€â”€â”€ */}
      <AnimatePresence>
        {openIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-primary px-6 py-5 flex items-start justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                    <span className="text-lg font-black text-primary">{openIndex + 1}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-black text-gray-900 leading-snug">
                    {faqs[openIndex].question}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors shrink-0"
                >
                  <X size={18} className="text-primary" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="space-y-4">
                  {faqs[openIndex].answer.split('\n\n').map((paragraph, idx) => (
                    <div key={idx}>
                      {paragraph.startsWith('â€¢') || paragraph.startsWith('-') || /^\d+\./.test(paragraph) ? (
                        <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-gray-900">
                              {paragraph.match(/^\d+/)?.[0] ?? 'âœ“'}
                            </span>
                          </div>
                          <p className="text-sm lg:text-base font-medium text-gray-700 leading-relaxed">
                            {paragraph.replace(/^[â€¢\-\d]+\.\s*/, '')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm lg:text-base font-medium text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}