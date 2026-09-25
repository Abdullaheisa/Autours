"use client";

import { useState } from "react";
import { Save, Percent, Tag, ArrowRight } from "lucide-react";

export interface ProfitMarginsData {
  days1_2: string;
  days3_7: string;
  days8_30: string;
  weekend: string;
}

interface ProfitPercentageFormProps {
  onApplyProfit: (margins: ProfitMarginsData) => void;
  onApplyDiscount: (discount: string) => void;
}

export default function ProfitPercentageForm({ onApplyProfit, onApplyDiscount }: ProfitPercentageFormProps) {
  const [profitMargins, setProfitMargins] = useState<ProfitMarginsData>({
    days1_2: "",
    days3_7: "",
    days8_30: "",
    weekend: "",
  });

  const [discountPercent, setDiscountPercent] = useState<string>("");

  const handleProfitChange = (field: keyof ProfitMarginsData, value: string) => {
    if (value === "" || /^\d*(\.\d*)?$/.test(value)) {
      setProfitMargins((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleDiscountChange = (value: string) => {
    if (value === "" || /^\d*(\.\d*)?$/.test(value)) {
      setDiscountPercent(value);
    }
  };

  const handleProfitSubmit = () => {
    onApplyProfit(profitMargins);
  };

  const handleDiscountSubmit = () => {
    onApplyDiscount(discountPercent);
  };

  const profitFields = [
    { label: "1-2 Days", field: "days1_2" as const, placeholder: "15" },
    { label: "3-7 Days", field: "days3_7" as const, placeholder: "12" },
    { label: "8-30 Days", field: "days8_30" as const, placeholder: "10" },
    { label: "Weekend", field: "weekend" as const, placeholder: "20" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Profit Margins Section */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/90 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] p-5 flex flex-col justify-between hover:border-gray-300 transition-all">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80">
                <Percent size={17} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">Bulk Profit Margins</h3>
                <p className="text-[11px] text-gray-500">Apply markup percentages across duration tiers</p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
              Duration Tiers
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {profitFields.map((item) => (
              <div key={item.field} className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-2.5 hover:bg-gray-50 transition-colors">
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 text-center">
                  {item.label}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder={item.placeholder}
                    value={profitMargins[item.field]}
                    onChange={(e) => handleProfitChange(item.field, e.target.value)}
                    className="w-full pl-2 pr-6 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center shadow-xs"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">Updates all filtered vehicles</p>
          <button
            onClick={handleProfitSubmit}
            className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-blue-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={14} />
            Apply Profit Margins
          </button>
        </div>
      </div>

      {/* 2. Discount Section */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-amber-200/80 shadow-[0_2px_10px_-3px_rgba(245,158,11,0.08)] p-5 flex flex-col justify-between hover:border-amber-300 transition-all">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                <Tag size={17} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">Promotional Discount</h3>
                <p className="text-[11px] text-gray-500">Deducted after profit calculation</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              SALE
            </span>
          </div>

          <div className="bg-amber-50/40 border border-amber-200/60 rounded-xl p-3">
            <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1.5 text-center">
              Discount Rate
            </label>
            <div className="relative max-w-[160px] mx-auto">
              <input
                type="text"
                inputMode="decimal"
                placeholder="e.g. 10"
                value={discountPercent}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="w-full pl-3 pr-7 py-2 bg-white border border-amber-300 rounded-lg text-sm font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-center shadow-xs"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-700 text-xs font-bold">%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-amber-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">Can be set to 0 to remove</p>
          <button
            onClick={handleDiscountSubmit}
            className="bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-amber-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={14} />
            Apply Discount
          </button>
        </div>
      </div>
    </div>
  );
}
