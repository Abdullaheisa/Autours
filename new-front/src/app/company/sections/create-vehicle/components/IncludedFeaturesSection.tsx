'use client';

import React, { useRef, useEffect } from "react";
import { ShieldCheck, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import SectionCard from "./SectionCard";
import { VehicleFormData } from "./types";

interface IncludedFeaturesSectionProps {
  formData: VehicleFormData;
  includedItems: any[];
  onToggleFeature: (id: number) => void;
  onChange: (fields: Partial<VehicleFormData>) => void;
}

export const IncludedFeaturesSection: React.FC<IncludedFeaturesSectionProps> = ({
  formData,
  includedItems,
  onToggleFeature,
  onChange,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onChange({ showIncludedDropdown: false });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onChange]);

  const selectedFeatures = includedItems.filter((item: any) =>
    formData.includedFeatures.includes(item.id)
  );

  return (
    <SectionCard icon={ShieldCheck} title="What is included?">
      <div className="space-y-3 relative" ref={dropdownRef}>
        {/* Trigger */}
        <button
          type="button"
          onClick={() => onChange({ showIncludedDropdown: !formData.showIncludedDropdown })}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm hover:bg-gray-100 transition-all"
        >
          <span className={selectedFeatures.length > 0 ? "text-gray-900 font-medium" : "text-gray-400"}>
            {selectedFeatures.length > 0
              ? `${selectedFeatures.length} features selected`
              : "Select features…"}
          </span>
          {formData.showIncludedDropdown ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </button>

        {/* Dropdown menu */}
        {formData.showIncludedDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
            {includedItems.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">No items available.</div>
            ) : (
              includedItems.map((item: any) => {
                const isChecked = formData.includedFeatures.includes(item.id);
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onToggleFeature(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                      isChecked ? "bg-primary-50/50" : ""
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                        isChecked ? "bg-primary-500 border-primary-500 text-white" : "bg-white border-gray-200"
                      }`}
                    >
                      {isChecked && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isChecked ? "text-primary-700" : "text-gray-700"
                      }`}
                    >
                      {item.what_is_included || item.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Selected tags */}
        {selectedFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedFeatures.map((feature: any) => (
              <span
                key={feature.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg border border-primary-200"
              >
                <Check size={12} />
                {feature.what_is_included || feature.name}
                <button
                  type="button"
                  onClick={() => onToggleFeature(feature.id)}
                  className="ml-1 hover:text-primary-900"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default IncludedFeaturesSection;
