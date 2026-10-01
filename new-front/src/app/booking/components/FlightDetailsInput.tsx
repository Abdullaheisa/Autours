"use client";

import React, { useState } from "react";
import { Plane, Info } from "lucide-react";

interface FlightDetailsInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function FlightDetailsInput({ value, onChange }: FlightDetailsInputProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-black text-gray-900 tracking-tight">Flight details</h3>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Optional</span>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-xs font-bold text-gray-800">Flight number</label>
          <div className="relative inline-block">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(prev => !prev)}
              className="text-blue-600 hover:text-blue-700 transition-colors p-0.5"
              aria-label="Flight number information"
            >
              <Info size={15} />
            </button>

            {/* Tooltip Bubble */}
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-[#141b2d] text-white text-[11px] font-medium rounded-xl shadow-2xl z-50 leading-relaxed text-center pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                Help the rental company track your flight in case of a delay.
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#141b2d]" />
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Plane size={17} />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder="Example: EK73, UA978, KE17"
            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm font-semibold text-gray-900 placeholder:text-gray-400 uppercase bg-white transition-all shadow-sm hover:border-gray-300"
          />
        </div>
      </div>
    </div>
  );
}
