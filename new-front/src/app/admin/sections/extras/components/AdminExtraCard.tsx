"use client";

import React from "react";
import { Edit3, Trash2 } from "lucide-react";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { getCurrencyItem } from "@/constants/currencies";

export interface ExtraItem {
  id: number;
  name: string;
  description?: string;
  badge?: string;
  type: "boolean" | "quantity";
  max_qty?: number;
  price: number;
  profit_percent: number;
  currency: string;
  is_active: boolean;
  final_price?: number;
  faqs?: { question: string; answer?: string; points?: string[]; sections?: { headline?: string; points: string[] }[] }[];
}

export interface AdminExtraCardProps {
  extra: ExtraItem;
  onToggle: (extra: ExtraItem) => void;
  onEdit: (extra: ExtraItem) => void;
  onDelete: (extra: ExtraItem) => void;
}

export default function AdminExtraCard({
  extra,
  onToggle,
  onEdit,
  onDelete,
}: AdminExtraCardProps) {
  const ci = getCurrencyItem(extra.currency || "USD");
  const base = Number(extra.price) || 0;
  const pp = Number(extra.profit_percent) || 0;
  const custPrice =
    extra.final_price !== undefined
      ? Number(extra.final_price)
      : pp > 0
      ? base + (base * pp) / 100
      : base;

  return (
    <div
      className={`bg-white rounded-2xl border p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all ${
        extra.is_active ? "border-gray-200/90" : "border-gray-200 opacity-70"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-black text-gray-900 truncate">{extra.name}</h4>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {extra.badge && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-black rounded border border-amber-200/80">
                  {extra.badge}
                </span>
              )}
              <span className="text-[10px] text-gray-400">
                {extra.type === "quantity" ? `Qty 1–${extra.max_qty || 5}` : "Toggle"}
              </span>
            </div>
          </div>
          <ToggleSwitch
            checked={extra.is_active}
            onChange={() => onToggle(extra)}
            ariaLabel={`Toggle ${extra.name}`}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
          {extra.description || "No description."}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Priced in Bulk / Per-Company
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(extra)}
            className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <Edit3 size={12} /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(extra)}
            className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all cursor-pointer"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
