"use client";

import { useState } from "react";
import { Save, CheckSquare } from "lucide-react";

interface IncludedFeature {
  id: number;
  name: string;
}

interface InclusionsBulkFormProps {
  allFeatures: IncludedFeature[];
  onSubmit: (selectedIds: number[]) => void;
  isLoading?: boolean;
}

export default function InclusionsBulkForm({ allFeatures, onSubmit, isLoading }: InclusionsBulkFormProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleFeature = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(allFeatures.map((f) => f.id)));
  };

  const clearAll = () => {
    setSelectedIds(new Set());
  };

  const handleSubmit = () => {
    onSubmit([...selectedIds]);
    setSelectedIds(new Set());
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CheckSquare size={20} className="text-primary-600" />
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Assign Inclusions</h3>
          <span className="text-xs text-gray-500">(Apply to all filtered vehicles on this page)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {allFeatures.length === 0 ? (
        <p className="text-sm text-gray-500 italic py-4 text-center">
          No &quot;What&apos;s Included&quot; features defined yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {allFeatures.map((feature) => {
            const isSelected = selectedIds.has(feature.id);
            return (
              <label
                key={feature.id}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 select-none
                  ${
                    isSelected
                      ? "bg-primary-50 border-primary-300 shadow-sm shadow-primary-100"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFeature(feature.id)}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 shrink-0"
                />
                <span
                  className={`text-sm font-medium truncate ${
                    isSelected ? "text-primary-700" : "text-gray-700"
                  }`}
                  title={feature.name}
                >
                  {feature.name}
                </span>
              </label>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {selectedIds.size} feature{selectedIds.size !== 1 ? "s" : ""} selected
        </span>
        <button
          onClick={handleSubmit}
          disabled={selectedIds.size === 0 || isLoading}
          className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 active:scale-95 flex items-center gap-2"
        >
          <Save size={16} />
          {isLoading ? "Applying..." : "Apply to All"}
        </button>
      </div>
    </div>
  );
}
