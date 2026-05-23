"use client";

import { useState } from "react";
import { Search, ChevronDown, X, SlidersHorizontal } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  onClearFilters: () => void;
}

export default function FilterBar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters,
  onClearFilters,
}: FilterBarProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const activeFiltersCount = filters.filter((f) => f.value !== f.options[0]?.value).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 lg:p-5">
      {/* Desktop Filters */}
      <div className="hidden md:flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Selects */}
        {filters.map((filter, index) => (
          <div key={index} className="relative lg:w-44">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="appearance-none w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        ))}

        {/* Clear */}
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl border border-gray-200"
        >
          <SlidersHorizontal size={16} />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>

        {showMobileFilters && (
          <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
            {filters.map((filter, index) => (
              <div key={index} className="relative">
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="appearance-none w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                >
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            ))}
            {activeFiltersCount > 0 && (
              <button
                onClick={onClearFilters}
                className="w-full py-2.5 text-sm text-red-600 font-medium bg-red-50 rounded-xl"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
