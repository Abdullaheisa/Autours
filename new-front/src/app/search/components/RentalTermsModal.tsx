'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface RentalTermItemProps {
  term: any;
  defaultOpen?: boolean;
}

function RentalTermAccordionItem({ term, defaultOpen = false }: RentalTermItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const title = term.title || term.name || term.term_name || 'Policy Details';
  const description = term.description || term.term_description || '';

  const parseNormalizedItems = (raw: string) => {
    if (!raw) return [];

    let cleaned = raw;

    // 1. Extract <li> tags if HTML list exists
    if (/<li[^>]*>/i.test(cleaned)) {
      const matches = cleaned.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
      if (matches && matches.length > 0) {
        return matches
          .map((m) => m.replace(/<[^>]*>/g, '').trim())
          .filter(Boolean);
      }
    }

    // 2. Normalize break, paragraph, and heading tags
    cleaned = cleaned
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<h[1-6][^>]*>/gi, '');

    // 3. Split lines
    return cleaned
      .split('\n')
      .map((line) => line.replace(/<[^>]*>/g, '').trim())
      .filter((line) => line.length > 0);
  };

  const items = parseNormalizedItems(description);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isOpen
          ? 'bg-white border-gray-300 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border-l-4 border-l-primary'
          : 'bg-white border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-gray-300'
      }`}
    >
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors focus:outline-none group"
      >
        <span className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOpen ? 'bg-gray-950' : 'bg-primary'}`} />
          <span
            className="font-extrabold text-gray-900 text-sm md:text-base leading-snug tracking-normal"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </span>
        <span className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-gray-700 font-bold border border-gray-200 shrink-0 ml-2 shadow-2xs transition-colors">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-150 bg-white"
          >
            <div className="p-4 md:p-5 space-y-2.5">
              {items.length > 0 ? (
                items.map((itemText, idx) => {
                  const isNumbered = /^(\d+\.|\d+\)|\w\))\s*/.test(itemText);
                  const cleanText = itemText
                    .replace(/^[•\-\*\d+\)]\s*/, '')
                    .replace(/^(\d+\.|\d+\)|\w\))\s*/, '');

                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-gray-50/70 p-3.5 rounded-xl border border-gray-150 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-gray-300 transition-all"
                    >
                      <div className="w-5.5 h-5.5 rounded-lg bg-primary/20 text-gray-900 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs border border-primary/30 shadow-2xs">
                        {isNumbered ? (
                          idx + 1
                        ) : (
                          <Check size={13} className="text-gray-950 stroke-[2.5]" />
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-bold text-gray-800 leading-relaxed">
                        {cleanText}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div
                  className="text-xs md:text-sm text-gray-800 font-bold leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-gray-800 [&_p]:mb-2 [&_strong]:font-black [&_strong]:text-gray-950"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface RentalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName?: string;
  rentalTerms?: any[];
  rawTerms?: any[];
}

export default function RentalTermsModal({
  isOpen,
  onClose,
  supplierName,
  rentalTerms = [],
  rawTerms = [],
}: RentalTermsModalProps) {
  const termsList = Array.isArray(rentalTerms) && rentalTerms.length > 0 ? rentalTerms : rawTerms;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/65 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 z-10 mx-2 max-h-[85vh] flex flex-col border border-gray-100"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close rental terms"
              className="absolute top-4 right-4 md:top-5 md:right-5 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-full transition-colors focus:outline-none"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-5 pr-8 pb-4 border-b border-gray-150">
              <div className="w-11 h-11 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center shrink-0">
                <Info className="text-gray-950" size={22} />
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-black text-gray-900 tracking-tight leading-tight">
                  Rental Terms & Policies
                </h4>
                <p className="text-xs text-gray-500 font-bold mt-0.5">
                  {supplierName
                    ? `${supplierName} requirements & rental conditions`
                    : 'Important rental conditions for this vehicle'}
                </p>
              </div>
            </div>

            {/* Modal Body / Terms Content */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-3.5 custom-scrollbar">
              {termsList.length > 0 ? (
                termsList.map((term: any, idx: number) => (
                  <RentalTermAccordionItem key={idx} term={term} defaultOpen={idx === 0} />
                ))
              ) : (
                <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-150">
                  <p className="text-gray-500 font-bold text-sm">
                    No rental terms available for this supplier.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Action */}
            <div className="pt-4 mt-4 border-t border-gray-150">
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-primary hover:bg-yellow-400 text-gray-950 rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-[0.99] focus:outline-none border border-black/5 flex items-center justify-center gap-2"
              >
                I Understand & Agree
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
