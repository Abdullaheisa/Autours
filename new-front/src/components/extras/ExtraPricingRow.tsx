"use client";

import React from "react";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { getCurrencyItem } from "@/constants/currencies";

export interface ExtraPricingItem {
  id: number;
  name: string;
  description?: string;
  badge?: string;
  type?: "boolean" | "quantity";
  max_qty?: number;
  currency?: string;
}

export interface ExtraPricingValues {
  enabled: boolean;
  custom_price: number;
  profit_percent?: number;
}

export interface ExtraPricingRowProps {
  item: ExtraPricingItem;
  values: ExtraPricingValues;
  mode?: "company" | "admin";
  onToggle: (enabled: boolean) => void;
  onPriceChange: (price: number) => void;
  onProfitChange?: (profit: number) => void;
  priceLabel?: string;
  borderBottom?: boolean;
}

export default function ExtraPricingRow({
  item,
  values,
  mode = "company",
  onToggle,
  onPriceChange,
  onProfitChange,
  priceLabel,
  borderBottom = true,
}: ExtraPricingRowProps) {
  const isEnabled = values.enabled;
  const curr = getCurrencyItem(item.currency || "USD");
  const price = Number(values.custom_price) || 0;
  const profit = Number(values.profit_percent) || 0;
  const customerPrice = profit > 0 ? price + (price * profit) / 100 : price;

  const defaultPriceLabel = mode === "admin" ? "Supplier Price" : "Your Price";
  const displayPriceLabel = priceLabel || defaultPriceLabel;

  return (
    <div
      className={`p-5 transition-colors duration-150 ${
        isEnabled ? "bg-white" : "bg-gray-50/40"
      } ${borderBottom ? "border-b border-gray-100" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="mt-0.5 shrink-0">
            <ToggleSwitch
              checked={isEnabled}
              onChange={onToggle}
              ariaLabel={`Toggle ${item.name}`}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`text-sm font-black ${isEnabled ? "text-gray-900" : "text-gray-400"}`}>
                {item.name}
              </h4>
              {item.badge && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-black rounded-md border border-amber-200/70">
                  {item.badge}
                </span>
              )}
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                  item.type === "quantity"
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {item.type === "quantity" ? `Qty 1–${item.max_qty || 5}` : "On/Off"}
              </span>
            </div>
            {item.description && (
              <p className={`text-xs mt-1 line-clamp-1 ${isEnabled ? "text-gray-500" : "text-gray-400"}`}>
                {item.description}
              </p>
            )}
          </div>
        </div>

        <div
          className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
            isEnabled
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-gray-100 text-gray-400 border border-gray-200"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? "bg-emerald-500" : "bg-gray-300"}`} />
          {isEnabled ? "Enabled" : "Disabled"}
        </div>
      </div>

      {isEnabled && (
        <div className="mt-4 sm:ml-12 animate-in fade-in duration-150">
          {mode === "company" ? (
            /* Company View: ONLY price, absolutely NO profit % or customer price */
            <div className="max-w-xs">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                {displayPriceLabel} ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={values.custom_price}
                  onChange={(e) => onPriceChange(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.00"
                  className="w-full h-10 pl-8 pr-3 border border-gray-200 rounded-xl text-sm font-black text-gray-900 bg-gray-50/70 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-right transition-all"
                />
              </div>
            </div>
          ) : (
            /* Admin View: Supplier Price + Admin Profit Margin % + Customer Sees Preview */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Supplier Price ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={values.custom_price}
                    onChange={(e) => onPriceChange(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full h-10 pl-8 pr-3 border border-gray-200 rounded-xl text-sm font-black text-gray-900 bg-gray-50/70 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-right transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Admin Profit Margin
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={values.profit_percent ?? 0}
                    onChange={(e) =>
                      onProfitChange &&
                      onProfitChange(Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className="w-full h-10 pl-3 pr-8 border border-gray-200 rounded-xl text-sm font-black text-emerald-700 bg-emerald-50/30 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-right transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Customer Price Preview
                </span>
                <div className="h-10 flex items-center px-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs mr-2 shrink-0">
                    $
                  </span>
                  <span className="text-sm font-black text-emerald-800">
                    ${customerPrice.toFixed(2)} USD
                  </span>
                  {profit > 0 && (
                    <span className="ml-1.5 text-[10px] font-black text-emerald-600">
                      (+{profit}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
