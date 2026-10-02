"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

export interface FaqSection {
  headline?: string;
  points: string[];
}

export interface FaqItem {
  question: string;
  answer?: string;
  sections?: FaqSection[];
  points?: string[];
}

export interface ExtraFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  faqs?: FaqItem[];
}

/**
 * Helper to render **bold** markers inside strings
 */
function renderFormattedText(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-gray-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function ExtraFaqModal({
  isOpen,
  onClose,
  title,
  description,
  faqs,
}: ExtraFaqModalProps) {
  // First item open by default
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
            question: `${title} Cancellation & Terms`,
            answer: `To manage or cancel your ${title}, please visit My Booking section on our website.`,
            sections: [
              {
                headline: "Up to 48 hours before pick-up time",
                points: [
                  "You can cancel and receive a **100% refund** issued to your **E-Wallet**.",
                  "A **free withdrawal** to the original payment method (credit card) is available, following EconomyBookings current refund policy.",
                ],
              },
              {
                headline: "Less than 48 hours before pick-up time",
                points: [
                  "**No refund** will be provided (no cancellation option is available).",
                ],
              },
            ],
          },
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
      <div className="relative bg-white w-full max-w-xl max-h-[90vh] rounded-[2rem] shadow-2xl border border-gray-150 flex flex-col z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-950 font-sans tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Service information & frequently asked questions
            </p>
          </div>
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

            // Check if there are structured sections
            const hasSections = item.sections && item.sections.length > 0;
            const hasFlatPoints = !hasSections && item.points && item.points.length > 0;

            // Check if answer contains bullet lines
            const parsedBulletLines =
              !hasSections && !hasFlatPoints && item.answer
                ? item.answer
                    .split("\n")
                    .map((l) => l.trim())
                    .filter((l) => l.length > 0)
                : [];
            const isBulletFormatted =
              parsedBulletLines.length > 1 &&
              parsedBulletLines.some(
                (l) => l.startsWith("-") || l.startsWith("•") || l.startsWith("*")
              );

            return (
              <div
                key={index}
                className={`transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? "border-2 border-amber-500 rounded-2xl bg-white p-5 sm:p-6 shadow-xs"
                    : "border border-gray-200 hover:border-amber-300 rounded-xl bg-white p-4 hover:shadow-2xs"
                }`}
              >
                {/* Question Row (Clickable) */}
                <button
                  type="button"
                  onClick={() => setOpenIndex(isExpanded ? null : index)}
                  className="w-full flex items-center gap-3 text-left cursor-pointer select-none group"
                >
                  <span className="text-amber-500 font-black text-lg select-none leading-none shrink-0 transition-transform">
                    {isExpanded ? "↓" : "→"}
                  </span>
                  <span className="text-gray-950 font-bold text-[16px] sm:text-[17.5px] select-none group-hover:text-amber-600 transition-colors leading-snug tracking-tight">
                    {item.question}
                  </span>
                </button>

                {/* Answer Content (When Expanded) */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3.5 border-t border-amber-100/60 text-[14.5px] sm:text-[15px] text-slate-700 leading-relaxed font-normal antialiased animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* 1. Rich Text HTML Content (from RichTextEditor) */}
                    {item.answer && /<[a-z][\s\S]*>/i.test(item.answer) ? (
                      <div
                        className="faq-rich-content antialiased"
                        dangerouslySetInnerHTML={{ __html: item.answer }}
                      />
                    ) : (
                      <>
                        {/* Plain text general answer */}
                        {item.answer && !isBulletFormatted && (
                          <p className="whitespace-pre-line text-slate-700 font-normal leading-relaxed mb-3">
                            {renderFormattedText(item.answer)}
                          </p>
                        )}

                        {/* Structured Sections with Headlines & Points */}
                        {hasSections && (
                          <div className="space-y-4">
                            {item.sections!.map((section, sIdx) => (
                              <div key={sIdx} className="space-y-2">
                                {section.headline && (
                                  <h5 className="font-bold text-gray-950 text-sm sm:text-[15px] tracking-tight mt-3">
                                    {renderFormattedText(section.headline)}
                                  </h5>
                                )}
                                {section.points && section.points.length > 0 && (
                                  <div className="space-y-2.5">
                                    {section.points.map((pt, pIdx) => (
                                      <div key={pIdx} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-emerald-600 stroke-[2.5] shrink-0 mt-0.5" />
                                        <div className="text-[14.5px] sm:text-[15px] text-slate-700 leading-relaxed font-normal">
                                          {renderFormattedText(pt)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Flat Points with Green Checkmarks */}
                        {hasFlatPoints && (
                          <div className="space-y-2.5 mt-2">
                            {item.points!.map((pt, pIdx) => (
                              <div key={pIdx} className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-emerald-600 stroke-[2.5] shrink-0 mt-0.5" />
                                <div className="text-[14.5px] sm:text-[15px] text-slate-700 leading-relaxed font-normal">
                                  {renderFormattedText(pt)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Auto-detected Bullet Lines with Green Checkmarks */}
                        {!hasSections && !hasFlatPoints && isBulletFormatted && (
                          <div className="space-y-2.5 mt-2">
                            {parsedBulletLines.map((line, lIdx) => {
                              const cleaned = line.replace(/^[-•*]\s*/, "");
                              return (
                                <div key={lIdx} className="flex items-start gap-3">
                                  <Check className="w-5 h-5 text-emerald-600 stroke-[2.5] shrink-0 mt-0.5" />
                                  <div className="text-[14.5px] sm:text-[15px] text-slate-700 leading-relaxed font-normal">
                                    {renderFormattedText(cleaned)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
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
