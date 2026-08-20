'use client';

import React from "react";
import { Settings, ChevronDown } from "lucide-react";
import SectionCard from "./SectionCard";
import SpecIcon from "./SpecIcon";

interface SpecificationsSectionProps {
  specifications: any[];
  values: Record<string, string>;
  onChangeSpec: (name: string, value: string) => void;
}

export const SpecificationsSection: React.FC<SpecificationsSectionProps> = ({
  specifications,
  values,
  onChangeSpec,
}) => (
  <SectionCard icon={Settings} title="Specifications">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {specifications.map((spec: any) => (
        <div key={spec.id} className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <SpecIcon name={spec.icon} />
            </div>
            {spec.name}
          </label>
          <div className="relative">
            <select
              value={values[spec.name] || ""}
              onChange={(e) => onChangeSpec(spec.name, e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none transition-all cursor-pointer"
            >
              <option value="">Select Option…</option>
              {spec.options.map((opt: string, i: number) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>
      ))}
    </div>
  </SectionCard>
);

export default SpecificationsSection;
