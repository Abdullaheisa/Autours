"use client";

import React, { useState } from "react";
import { Clock, FileText, CreditCard, ChevronDown, ChevronUp, ShieldCheck, CheckCircle2 } from "lucide-react";

interface BookingChecklistProps {
  pickupTime?: string;
  depositAmount?: number | string;
  currencyCode?: string;
}

export default function BookingChecklist({
  pickupTime = "10:00",
  depositAmount,
  currencyCode = "AED"
}: BookingChecklistProps) {
  const [openSection, setOpenSection] = useState<string | null>("pickup");

  const toggleSection = (section: string) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  return (
    <div className="space-y-4">
      {/* ── Main Checklist Card ── */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-7">
        <h3 className="text-[19px] font-black text-gray-900 tracking-tight mb-5">
          Your checklist before pick-up:
        </h3>

        <div className="divide-y divide-gray-100">
          {/* 1. Pick-up Time */}
          <div className="py-3.5 first:pt-0">
            <button
              type="button"
              onClick={() => toggleSection("pickup")}
              className="w-full flex items-center justify-between gap-3 text-left group"
            >
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-gray-900 shrink-0" />
                <span className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                  Pick-up time
                </span>
              </div>
              {openSection === "pickup" ? (
                <ChevronUp size={16} className="text-gray-400 shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
              )}
            </button>
            {openSection === "pickup" && (
              <div className="mt-3 pl-7 pr-2 text-xs sm:text-[13px] text-gray-500 font-medium leading-relaxed animate-in fade-in duration-200">
                To receive your keys, you must collect the car at your scheduled pick-up time:{" "}
                <strong className="text-gray-900">{pickupTime}</strong>. Vehicles are held briefly, then may be reassigned to another customer in case of late arrival without notice.
              </div>
            )}
          </div>

          {/* 2. Required Documents */}
          <div className="py-3.5">
            <button
              type="button"
              onClick={() => toggleSection("documents")}
              className="w-full flex items-center justify-between gap-3 text-left group"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-gray-900 shrink-0" />
                <span className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                  Required documents
                </span>
              </div>
              {openSection === "documents" ? (
                <ChevronUp size={16} className="text-gray-400 shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
              )}
            </button>
            {openSection === "documents" && (
              <div className="mt-3 pl-7 pr-2 space-y-2 text-xs sm:text-[13px] text-gray-600 font-medium leading-relaxed animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>A valid ID</strong> or Passport (for international visitors)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>Driver’s license</strong> (original &amp; valid)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>Credit card</strong> (must match the main driver’s name for deposit)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>Autours Purchase Voucher</strong> (digital or printed confirmation)</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Deposit Details */}
          <div className="py-3.5 last:pb-0">
            <button
              type="button"
              onClick={() => toggleSection("deposit")}
              className="w-full flex items-center justify-between gap-3 text-left group"
            >
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-gray-900 shrink-0" />
                <span className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                  Deposit details
                </span>
              </div>
              {openSection === "deposit" ? (
                <ChevronUp size={16} className="text-gray-400 shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
              )}
            </button>
            {openSection === "deposit" && (
              <div className="mt-3 pl-7 pr-2 text-xs sm:text-[13px] text-gray-500 font-medium leading-relaxed animate-in fade-in duration-200">
                A refundable security deposit {depositAmount ? `(approx. ${depositAmount} ${currencyCode})` : ""} is held on your credit card at the rental counter. The hold is automatically released after returning the vehicle in accordance with rental conditions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
