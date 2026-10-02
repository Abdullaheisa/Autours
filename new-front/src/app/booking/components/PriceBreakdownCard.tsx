"use client";

import React from "react";
import { X } from "lucide-react";

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
  onRemoveExtra?: (id: string | number) => void;
}

export default function PriceBreakdownCard({
  rentalDays,
  currencyCode,
  baseVehiclePrice,
  extrasItems,
  grandTotalPrice,
  onRemoveExtra,
}: PriceBreakdownCardProps) {
  const safeDays = rentalDays > 0 ? rentalDays : 1;
  const dailyPrice = Math.round(baseVehiclePrice / safeDays);
  const extrasTotalPrice = Math.round(extrasItems.reduce((sum, item) => sum + item.totalPrice, 0));

  return (
    <div className="bg-white rounded-2xl border-2 border-primary overflow-hidden shadow-sm">
      {/* ── CARD HEADER: Total Rental Price Bar ── */}
      <div className="bg-primary/5 px-5 py-3 border-b border-primary/20 flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
          Total Rental Price
        </p>
        {extrasItems.length > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            +{extrasItems.length} Extras
          </span>
        )}
      </div>

      <div className="p-5 space-y-3">
        {/* Main Price Headline */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              {Math.round(grandTotalPrice).toLocaleString()}
            </span>
            <span className="text-xl font-semibold text-gray-600">{currencyCode}</span>
          </div>
          <p className="text-xs text-green-700 font-bold mt-1">
            ✓ For {rentalDays} {rentalDays === 1 ? "day" : "days"}
          </p>
        </div>

        {/* Breakdown Items */}
        <div className="pt-3 border-t border-gray-100 space-y-2.5">
          {/* Daily Rate */}
          <div className="flex justify-between text-sm text-gray-600 font-medium">
            <span>Daily Rate</span>
            <span className="text-gray-900 font-semibold">
              {dailyPrice.toLocaleString()}{" "}
              {currencyCode}
            </span>
          </div>

          {/* Rental Cost */}
          <div className="flex justify-between text-sm text-gray-600 font-medium">
            <span>Rental Cost</span>
            <span className="text-gray-900 font-semibold">
              {Math.round(baseVehiclePrice).toLocaleString()}{" "}
              {currencyCode}
            </span>
          </div>

          {/* Selected Extras */}
          <div className="flex justify-between text-sm text-gray-600 font-medium">
            <span className="flex items-center gap-1.5">
              <span>Selected Extras</span>
              {extrasItems.length > 0 && (
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                  {extrasItems.length}
                </span>
              )}
            </span>
            <span
              className={
                extrasTotalPrice > 0
                  ? "text-blue-700 font-semibold"
                  : "text-gray-900 font-semibold"
              }
            >
              {extrasTotalPrice > 0
                ? `+${extrasTotalPrice.toLocaleString()}`
                : "0"}{" "}
              {currencyCode}
            </span>
          </div>

          {/* Itemized Extras Breakdown with Remove (X) Button */}
          {extrasItems.length > 0 && (
            <div className="p-2 bg-gray-50/90 rounded-xl space-y-1.5 text-xs border border-gray-150">
              {extrasItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-[11.5px] text-gray-700 gap-2 group hover:bg-white/80 px-1.5 py-1 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {onRemoveExtra ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveExtra(item.id);
                        }}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500 active:scale-90 transition-all cursor-pointer shrink-0"
                        title={`Remove ${item.name}`}
                        aria-label={`Remove ${item.name}`}
                      >
                        <X size={11} className="stroke-[2.5]" />
                      </button>
                    ) : (
                      <span className="text-gray-400 font-bold shrink-0">•</span>
                    )}
                    <span className="truncate font-medium text-gray-800">
                      {item.name} {item.qty > 1 ? `(x${item.qty})` : ""}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 shrink-0 text-right">
                    {Math.round(item.totalPrice).toLocaleString()}{" "}
                    {currencyCode}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="h-px bg-gray-200 my-1" />

          {/* Grand Total */}
          <div className="flex justify-between items-baseline text-gray-900 pt-1">
            <span className="text-sm font-bold">Grand Total</span>
            <span className="text-xl font-bold text-primary-700">
              {Math.round(grandTotalPrice).toLocaleString()}{" "}
              {currencyCode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
