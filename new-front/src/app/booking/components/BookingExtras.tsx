"use client";

import React, { useState } from "react";
import { HelpCircle, Plus, Minus } from "lucide-react";
import { convertFromUsd, normalizeToUsd } from "@/utils/currency";
import type { Currency } from "@/types";

export interface ExtraItem {
  id: string;
  db_id?: number;
  key?: string;
  name: string;
  description: string | null;
  price: number;
  price_usd?: number;
  currency?: string;
  type: "boolean" | "quantity";
  max_qty?: number;
  badge?: string | null;
  faqs?: { question: string; answer?: string; points?: string[]; sections?: { headline?: string; points: string[] }[] }[];
}

export interface SelectedExtra {
  id: string;
  name: string;
  qty: number;
  pricePerItem: number; // in current currency
  totalPrice: number;   // in current currency
}

interface BookingExtrasProps {
  extras: ExtraItem[];
  selectedExtras: Record<string, number>; // id -> quantity
  onChangeExtra: (id: string, qty: number) => void;
  currencyCode: string;
  allRates: Record<string, number>;
}

/**
 * Converts price from USD (base currency) to the target customer currency.
 * Matches vehicle pricing engine exactly (uses full fallbackRates and Redux rates).
 */
export function convertExtraPrice(
  price: number,
  baseCurrency: string = "USD",
  targetCurrency: string = "USD",
  allRates: Record<string, number> = {}
): number {
  if (!price || price <= 0) return 0;
  const baseCode = (baseCurrency || "USD").toUpperCase();
  const targetCode = (targetCurrency || "USD").toUpperCase();

  if (baseCode === targetCode) {
    return Math.round(price * 100) / 100;
  }

  // Normalize base currency to USD if not already USD
  const priceInUsd = baseCode === "USD" 
    ? price 
    : normalizeToUsd(price, baseCode as Currency, allRates);

  // Convert from USD to target currency exactly like car rates
  const priceInTarget = convertFromUsd(priceInUsd, targetCode as Currency, allRates);

  return Math.round(priceInTarget * 100) / 100;
}

export default function BookingExtras({
  extras,
  selectedExtras,
  onChangeExtra,
  currencyCode,
  allRates,
}: BookingExtrasProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <div className="space-y-2.5">
      {extras.map((extra) => {
        const extraId = extra.key || extra.id;
        const qty = selectedExtras[extraId] || 0;
        const isSelected = qty > 0;
        
        // Base price and currency of this extra
        const basePrice = extra.price !== undefined ? extra.price : (extra.price_usd || 0);
        const baseCurrency = extra.currency || "USD";

        // Converted unit price in current viewing currency
        const displayUnitPrice = convertExtraPrice(basePrice, baseCurrency, currencyCode, allRates);
        const displayTotalPrice = displayUnitPrice * (qty > 0 ? qty : 1);

        return (
          <div
            key={extraId}
            className={`relative bg-white rounded-2xl border transition-all duration-200 z-10 hover:z-20 overflow-hidden ${
              isSelected ? "border-primary ring-2 ring-primary/20 shadow-xs" : "border-gray-200/90 shadow-2xs"
            }`}
          >
            {/* ── Top Header Row with border-b ── */}
            <div className="px-4 py-2.5 sm:px-4.5 sm:py-2.5 border-b border-gray-100 flex items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-[14.5px] sm:text-[15.5px] font-bold text-gray-900 tracking-tight">
                  {extra.name}
                </h4>
                {extra.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#d97706] tracking-wide">
                    {extra.badge}
                  </span>
                )}
                {isSelected && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-250 flex items-center gap-1 shrink-0">
                    ✓ Added
                  </span>
                )}
              </div>

              {/* Info Tooltip Icon (?) */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onMouseEnter={() => setActiveTooltip(extraId)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip((prev) => (prev === extraId ? null : extraId))}
                  className="w-7 h-7 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label={`Details about ${extra.name}`}
                >
                  <HelpCircle size={18} className="stroke-[2.2]" />
                </button>

                {activeTooltip === extraId && (
                  <div className="absolute right-0 bottom-full mb-2.5 w-72 p-3 bg-[#141b2d] text-white text-xs font-medium rounded-xl shadow-2xl z-50 leading-relaxed pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-[11.5px] text-gray-100 leading-relaxed">{extra.description || "Charged once for the entire rental."}</p>
                    <div className="mt-2 pt-1.5 border-t border-gray-700/60 text-[10.5px] text-amber-300 font-bold">
                      ✓ Charged once for the entire rental duration.
                    </div>
                    {/* Downward pointing arrow */}
                    <div className="absolute top-full right-2.5 border-4 border-transparent border-t-[#141b2d]" />
                  </div>
                )}
              </div>
            </div>

            {/* ── Bottom Body Row: Description + Price & Action Button ── */}
            <div className="px-4 py-3 sm:px-4.5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white">
              <p className="text-[13px] sm:text-[13.5px] text-gray-600 font-normal leading-relaxed max-w-xl">
                {extra.description}
              </p>

              <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                {/* Price Block */}
                <div className="text-left sm:text-right">
                  <div className="text-[15px] sm:text-[16px] font-black text-gray-900 leading-tight">
                    {currencyCode} {Math.round(displayTotalPrice).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">
                    {qty > 1 ? (
                      <span>
                        {qty} × {Math.round(displayUnitPrice).toLocaleString()} {currencyCode}
                      </span>
                    ) : (
                      "per rental"
                    )}
                  </div>
                </div>

                {/* Action Controls */}
                {extra.type === "quantity" ? (
                  isSelected ? (
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onChangeExtra(extraId, Math.max(0, qty - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                        title="Decrease quantity"
                      >
                        <Minus size={13} strokeWidth={2.5} />
                      </button>
                      <span className="w-5 text-center text-xs font-black text-gray-900 select-none">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onChangeExtra(extraId, Math.min(extra.max_qty || 3, qty + 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors active:scale-95 disabled:opacity-40 cursor-pointer"
                        disabled={qty >= (extra.max_qty || 3)}
                        title="Increase quantity"
                      >
                        <Plus size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onChangeExtra(extraId, 1)}
                      className="min-w-[95px] px-5 py-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50/70 font-bold text-xs transition-all active:scale-95 cursor-pointer text-center"
                    >
                      Add
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => onChangeExtra(extraId, isSelected ? 0 : 1)}
                    className="min-w-[95px] px-5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer text-center border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50/70"
                  >
                    {isSelected ? "Remove" : "Add"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
