'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plane, Building2, ChevronDown, ArrowRight } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  city: string;
}

interface LocationsAccordionProps {
  airportBranches: Branch[];
  cityBranches: Branch[];
  brandName: string;
}

export default function LocationsAccordion({
  airportBranches,
  cityBranches,
  brandName,
}: LocationsAccordionProps) {
  const [isAirportOpen, setIsAirportOpen] = useState(true);
  const [isCityOpen, setIsCityOpen] = useState(true);

  return (
    <div className="space-y-6">
      {/* 1. Airport Accordion */}
      {airportBranches.length > 0 && (
        <div className="border border-primary/25 rounded-2xl bg-white shadow-[0_4px_15px_rgba(249,214,2,0.32)] overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setIsAirportOpen(!isAirportOpen)}
            className="w-full flex items-center justify-between p-5 md:p-6 bg-white hover:bg-gray-50/50 cursor-pointer select-none focus:outline-none border-l-4 border-l-primary shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm text-black">
                <Plane size={20} />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-black text-gray-900 tracking-tight leading-snug">
                  Airport Locations
                </h2>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                  {airportBranches.length} airport {airportBranches.length === 1 ? 'location' : 'locations'} available
                </p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 text-gray-500 transition-transform duration-300 shadow-sm ${isAirportOpen ? 'rotate-180' : ''}`}>
              <ChevronDown size={16} />
            </div>
          </button>

          {/* Smooth height transition wrapper */}
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isAirportOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-5 py-6 md:px-6 md:py-8 bg-gray-50/30 border-t border-gray-100/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {airportBranches.map((branch) => (
                    <Link
                      key={branch.id}
                      href={`/?pickup=${encodeURIComponent(branch.name)}`}
                      className="group/item flex items-center gap-3.5 p-4 bg-white border border-primary/15 rounded-xl shadow-[0_3px_8px_rgba(249,214,2,0.20)] hover:border-primary hover:shadow-[0_5px_12px_rgba(249,214,2,0.35)] transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-primary group-hover/item:text-black transition-colors shrink-0">
                        <Plane size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14.5px] font-bold text-gray-700 group-hover/item:text-gray-950 transition-colors leading-snug break-words">
                          {brandName} at {branch.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-gray-400 block mt-0.5">
                          {branch.city}
                        </span>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-primary opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-300 shrink-0"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. City Accordion */}
      {cityBranches.length > 0 && (
        <div className="border border-primary/25 rounded-2xl bg-white shadow-[0_4px_15px_rgba(249,214,2,0.32)] overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setIsCityOpen(!isCityOpen)}
            className="w-full flex items-center justify-between p-5 md:p-6 bg-white hover:bg-gray-50/50 cursor-pointer select-none focus:outline-none border-l-4 border-l-primary shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-950 flex items-center justify-center shrink-0 shadow-sm text-primary">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-black text-gray-900 tracking-tight leading-snug">
                  City Locations
                </h2>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                  {cityBranches.length} city {cityBranches.length === 1 ? 'location' : 'locations'} available
                </p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 text-gray-500 transition-transform duration-300 shadow-sm ${isCityOpen ? 'rotate-180' : ''}`}>
              <ChevronDown size={16} />
            </div>
          </button>

          {/* Smooth height transition wrapper */}
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isCityOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-5 py-6 md:px-6 md:py-8 bg-gray-50/30 border-t border-gray-100/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cityBranches.map((branch) => (
                    <Link
                       key={branch.id}
                       href={`/?pickup=${encodeURIComponent(branch.name)}`}
                       className="group/item flex items-center gap-3.5 p-4 bg-white border border-primary/15 rounded-xl shadow-[0_3px_8px_rgba(249,214,2,0.20)] hover:border-primary hover:shadow-[0_5px_12px_rgba(249,214,2,0.35)] transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-gray-950 group-hover/item:text-primary transition-colors shrink-0">
                        <Building2 size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14.5px] font-bold text-gray-700 group-hover/item:text-gray-950 transition-colors leading-snug break-words">
                          {brandName} in {branch.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-gray-400 block mt-0.5">
                          {branch.city}
                        </span>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-primary opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-300 shrink-0"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
