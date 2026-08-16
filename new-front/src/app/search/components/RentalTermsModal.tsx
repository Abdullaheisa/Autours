'use client';

import { useState, useEffect } from 'react';
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
            className="font-normal text-gray-900 text-base md:text-[17px] leading-snug tracking-normal"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </span>
        <span className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-gray-700 font-medium border border-gray-200 shrink-0 ml-2 shadow-2xs transition-colors">
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
            <div className="p-4 md:p-6">
              <div
                className="text-xs md:text-sm text-gray-600 font-normal leading-relaxed
                  [&_p]:mb-3 [&_p:last-child]:mb-0
                  [&_strong]:font-semibold [&_strong]:text-gray-900
                  [&_h1]:text-base [&_h1]:font-medium [&_h1]:text-gray-900 [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:uppercase
                  [&_h2]:text-sm md:[&_h2]:text-base [&_h2]:font-medium [&_h2]:text-gray-900 [&_h2]:mt-4 [&_h2]:mb-2
                  [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-gray-900 [&_h3]:mt-3 [&_h3]:mb-1.5
                  [&_ul]:list-none [&_ul]:pl-0 [&_ul]:space-y-2 [&_ul]:my-3
                  [&_li]:flex [&_li]:items-start [&_li]:gap-3 [&_li]:bg-gray-50/80 [&_li]:p-3.5 [&_li]:rounded-xl [&_li]:border [&_li]:border-gray-150 [&_li]:text-xs [&_li]:md:text-sm [&_li]:font-normal [&_li]:text-gray-700
                  [&_li]:before:content-['✓'] [&_li]:before:w-5 [&_li]:before:h-5 [&_li]:before:rounded-md [&_li]:before:bg-primary/20 [&_li]:before:text-gray-950 [&_li]:before:flex [&_li]:before:items-center [&_li]:before:justify-center [&_li]:before:shrink-0 [&_li]:before:mt-0.5 [&_li]:before:font-semibold [&_li]:before:text-xs [&_li]:before:border [&_li]:before:border-primary/30
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:my-3 [&_ol_li]:list-item [&_ol_li]:before:content-none [&_ol_li]:bg-transparent [&_ol_li]:p-0 [&_ol_li]:border-none [&_ol_li]:shadow-none
                "
                dangerouslySetInnerHTML={{ __html: description }}
              />
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
                <h4 className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight leading-tight">
                  Rental Terms & Policies
                </h4>
                <p className="text-xs text-gray-500 font-normal mt-0.5">
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
                  <p className="text-gray-500 font-normal text-sm">
                    No rental terms available for this supplier.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Action */}
            <div className="pt-4 mt-4 border-t border-gray-150">
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-primary hover:bg-yellow-400 text-gray-950 rounded-2xl font-bold text-xs md:text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-[0.99] focus:outline-none border border-black/5 flex items-center justify-center gap-2"
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
