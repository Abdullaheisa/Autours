"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowRight, ArrowDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ExtraFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  faqs?: FaqItem[];
}

export default function ExtraFaqModal({
  isOpen,
  onClose,
  title,
  description,
  faqs,
}: ExtraFaqModalProps) {
  // First item open by default like in user's screenshot
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Reset open item when modal opens
  useEffect(() => {
    if (isOpen) {
      setOpenIndex(0);
    }
  }, [isOpen, title]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine items to display: use custom FAQs if available, otherwise generate contextual default FAQs
  const items: FaqItem[] =
    faqs && faqs.length > 0
      ? faqs
      : [
          {
            question: `What is ${title}?`,
            answer:
              description ||
              `${title} is an optional service provided directly by the vehicle supplier to enhance your journey with comfort, peace of mind, and convenience.`,
          },
          {
            question: `How does ${title} work during my rental?`,
            answer: `When you select ${title}, it is included directly in your vehicle rental reservation voucher and prepared by the supplier at the pick-up desk.`,
          },
          {
            question: `Are there any restrictions or requirements for ${title}?`,
            answer: `All drivers must satisfy the standard age, valid driver's license, and documentation terms set by the rental provider.`,
          },
          {
            question: `How to modify or cancel this option?`,
            answer: `You can easily adjust your selected options before completing checkout, or manage your booking online via your confirmation details.`,
          },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white w-full max-w-xl max-h-[90vh] rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 custom-scrollbar">
          {items.map((item, index) => {
            const isExpanded = openIndex === index;

            return (
              <div
                key={index}
                className={`rounded-2xl transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? "border-2 border-primary bg-amber-50/20 shadow-xs p-4 sm:p-5"
                    : "border border-gray-200 hover:border-primary/70 bg-white p-3.5 sm:p-4 hover:shadow-2xs"
                }`}
              >
                {/* Question Row (Clickable) */}
                <button
                  type="button"
                  onClick={() => setOpenIndex(isExpanded ? null : index)}
                  className="w-full flex items-start gap-3 text-left cursor-pointer select-none group"
                >
                  <div className="pt-0.5 shrink-0 text-amber-500 font-bold transition-transform">
                    {isExpanded ? (
                      <ArrowDown size={18} className="stroke-[2.5]" />
                    ) : (
                      <ArrowRight size={18} className="stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </div>
                  <span className={`text-sm sm:text-base leading-snug ${
                    isExpanded
                      ? "font-black text-gray-950"
                      : "font-bold text-gray-900 group-hover:text-black"
                  }`}>
                    {item.question}
                  </span>
                </button>

                {/* Answer Content (When Expanded) */}
                {isExpanded && (
                  <div className="mt-3.5 pl-7 sm:pl-7 pt-2.5 border-t border-amber-200/60 text-xs sm:text-sm text-gray-700 leading-relaxed font-normal space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <p className="whitespace-pre-line">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
