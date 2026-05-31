"use client";

import { useState } from "react";
import { Search, ChevronDown, X, Filter, MapPin, Building2, Store, Car } from "lucide-react";

export interface FilterItem {
  id: string;
  name: string;
}

interface FilterOption {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  options: FilterItem[];
  onChange: (value: string) => void;
}

interface ProfitFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCountry: string;
  onCountryChange: (value: string) => void;
  selectedSupplier: string;
  onSupplierChange: (value: string) => void;
  selectedBranch: string;
  onBranchChange: (value: string) => void;
  selectedVehicle: string;
  onVehicleChange: (value: string) => void;
  countries: FilterItem[];
  suppliers: FilterItem[];
  branches: FilterItem[];
  vehiclesList: FilterItem[];
  showNoProfitOnly: boolean;
  onToggleNoProfit: (val: boolean) => void;
  onClearFilters: () => void;
  onSearchClick: () => void;
}

export default function ProfitFilters({
  searchQuery,
  onSearchChange,
  selectedCountry,
  onCountryChange,
  selectedSupplier,
  onSupplierChange,
  selectedBranch,
  onBranchChange,
  selectedVehicle,
  onVehicleChange,
  countries,
  suppliers,
  branches,
  vehiclesList,
  showNoProfitOnly,
  onToggleNoProfit,
  onClearFilters,
  onSearchClick,
}: ProfitFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFiltersCount = [
    selectedCountry !== "",
    selectedSupplier !== "",
    selectedBranch !== "",
    selectedVehicle !== "",
    searchQuery !== "",
    showNoProfitOnly === true,
  ].filter(Boolean).length;

  const filterConfigs: FilterOption[] = [
    { icon: MapPin, label: "Country", value: selectedCountry, options: countries, onChange: onCountryChange },
    { icon: Building2, label: "Supplier", value: selectedSupplier, options: suppliers, onChange: onSupplierChange },
    { icon: Store, label: "Branch", value: selectedBranch, options: branches, onChange: onBranchChange },
    { icon: Car, label: "Vehicle", value: selectedVehicle, options: vehiclesList, onChange: onVehicleChange },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 lg:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={18} className="text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
            {activeFiltersCount} active
          </span>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-3">
        {filterConfigs.map((filter, idx) => (
          <div key={idx} className="relative">
            <filter.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">All {filter.label}s</option>
              {filter.options.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        ))}

        <div className="flex items-center gap-2 px-1">
          <input
            type="checkbox"
            id="noProfitDesktop"
            checked={showNoProfitOnly}
            onChange={(e) => onToggleNoProfit(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
          <label htmlFor="noProfitDesktop" className="text-sm text-gray-700 select-none cursor-pointer">
            Without Profit Margin
          </label>
        </div>

        <button
          onClick={onSearchClick}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
        >
          <Search size={16} />
          Search
        </button>
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl border border-gray-200"
        >
          <Filter size={16} />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>

        {showMobileFilters && (
          <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
            {filterConfigs.map((filter, idx) => (
              <div key={idx} className="relative">
                <filter.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">All {filter.label}s</option>
                  {filter.options.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            ))}

            <div className="flex items-center gap-2 px-1">
              <input
                type="checkbox"
                id="noProfitMobile"
                checked={showNoProfitOnly}
                onChange={(e) => onToggleNoProfit(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <label htmlFor="noProfitMobile" className="text-sm text-gray-700 select-none cursor-pointer">
                Without Profit Margin
              </label>
            </div>

            <button
              onClick={onSearchClick}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => {
              onClearFilters();
              onToggleNoProfit(false);
            }}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <X size={14} />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
