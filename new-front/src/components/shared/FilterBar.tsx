"use client";

import { useState, useRef, useEffect } from "react";
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

// Custom Select Dropdown with Search capability and custom styles
function CustomSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset search term when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full lg:w-48" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent hover:bg-gray-100/70 transition-all cursor-pointer font-semibold text-gray-800"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : label}</span>
        <ChevronDown
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          size={16}
        />
      </button>

      {/* Dropdown Menu (Opens below dropdown and has scroll with search) */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden min-w-[200px]">
          {/* Search Box */}
          <div className="relative p-2 border-b border-gray-100 bg-gray-50">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder={`Search ${label}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent font-medium"
              onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing when typing
            />
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <button
                  key={`${label}-${opt.value}-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer ${
                    opt.value === value
                      ? "bg-amber-50 text-amber-900 border-l-4 border-amber-500"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-gray-400 text-center font-semibold">
                No matches found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
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
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dynamic Filter Selects with Custom Dropdown & Search */}
        {filters.map((filter) => (
          <CustomSelect
            key={filter.label}
            label={filter.label}
            value={filter.value}
            options={filter.options}
            onChange={filter.onChange}
          />
        ))}

        {/* Clear */}
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
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
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
          />
        </div>

        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <SlidersHorizontal size={16} />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>

        {showMobileFilters && (
          <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
            {filters.map((filter) => (
              <CustomSelect
                key={filter.label}
                label={filter.label}
                value={filter.value}
                options={filter.options}
                onChange={filter.onChange}
              />
            ))}
            {activeFiltersCount > 0 && (
              <button
                onClick={onClearFilters}
                className="w-full py-2.5 text-sm text-red-600 font-semibold bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors"
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
