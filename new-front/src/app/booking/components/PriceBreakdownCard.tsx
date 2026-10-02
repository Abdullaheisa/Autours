"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface ExtraBreakdownItem {
  id: string | number;
  name: string;
  qty: number;
  totalPrice: number;
}

export interface PriceBreakdownCardProps {
  rentalDays: number;
  currencyCode: string;
  baseVehiclePrice: number;
  extrasItems: ExtraBreakdownItem[];
  grandTotalPrice: number;
  fuelPolicy?: string;
  isTopPick?: boolean;
  savingsPercent?: number;
}

export default function PriceBreakdownCard({
  rentalDays,
  currencyCode,
  baseVehiclePrice,
  extrasItems,
  grandTotalPrice,
}: PriceBreakdownCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden p-5 space-y-4">
      {/* ── CARD HEADER ── */}
      <h3 className="text-base font-black text-gray-950 tracking-tight">
        Price breakdown
      </h3>

      {/* ── PRICE FOR X DAYS HEADER ROW ── */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
        >
          <div>
            <span className="text-sm font-black text-gray-900">
              Price for {rentalDays} {rentalDays === 1 ? "day" : "days"}:
            </span>
            {rentalDays > 1 && (
              <span className="block text-[11px] font-semibold text-gray-400 mt-0.5">
                {currencyCode}{" "}
                {(baseVehiclePrice / rentalDays).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                / day
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-gray-900">
              {currencyCode}{" "}
              {grandTotalPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary text-gray-950 group-hover:bg-primary-600 transition-all shadow-2xs">
              {isExpanded ? <ChevronUp size={15} className="stroke-[2.5]" /> : <ChevronDown size={15} className="stroke-[2.5]" />}
            </div>
          </div>
        </button>

        {/* ── ITEMIZED BREAKDOWN ── */}
        {isExpanded && (
          <div className="mt-3 pt-2 border-t border-gray-100 space-y-2 text-xs animate-in fade-in duration-150">
            {/* Car Rental Price */}
            <div className="flex items-start justify-between text-gray-600 font-medium">
              <div>
                <span className="text-gray-800 font-medium">Car rental price</span>
                {rentalDays > 1 && (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {currencyCode}{" "}
                    {(baseVehiclePrice / rentalDays).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    / day
                  </p>
                )}
              </div>
              <span className="text-gray-900 font-bold">
                {currencyCode}{" "}
                {baseVehiclePrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Selected Extras */}
            {extrasItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-gray-600 font-medium"
              >
                <span className="truncate max-w-[170px]">
                  {item.name} {item.qty > 1 ? `(x${item.qty})` : ""}
                </span>
                <span className="text-gray-900 font-bold shrink-0">
                  {currencyCode}{" "}
                  {item.totalPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── TOTAL ROW (Replaced Pay now, no info icon) ── */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm font-black text-gray-900">Total</span>
        <span className="text-sm font-black text-gray-900 font-sans tracking-tight">
          {currencyCode}{" "}
          {grandTotalPrice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
}
