'use client';

import React from "react";
import { DollarSign } from "lucide-react";

interface PriceFieldProps {
  label: string;
  value: string;
  onChange?: (val: string) => void;
}

export const PriceField: React.FC<PriceFieldProps> = ({
  label,
  value,
  onChange,
}) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-center">
      {label}
    </label>
    <div className="relative">
      <DollarSign
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        size={14}
      />
      <input
        type="number"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="0.00"
        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-center transition-all"
      />
    </div>
  </div>
);

export default PriceField;
