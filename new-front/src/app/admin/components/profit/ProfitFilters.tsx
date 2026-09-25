"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  X,
  Filter,
  MapPin,
  Building2,
  Store,
  Layers,
  Car,
  ShieldCheck,
  Check,
} from "lucide-react";

export interface FilterItem {
  id: string;
  name: string;
}

export type SupplierStatus = "active" | "inactive" | "all";

interface ProfitFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  supplierStatus?: SupplierStatus;
  onSupplierStatusChange?: (status: SupplierStatus) => void;
  selectedCountry: string;
  onCountryChange: (value: string) => void;
  selectedSupplier: string;
  onSupplierChange: (value: string) => void;
  selectedBranch: string;
  onBranchChange: (value: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (value: string) => void;
  selectedVehicle?: string;
  onVehicleChange?: (value: string) => void;
  countries?: FilterItem[];
  suppliers?: FilterItem[];
  branches?: FilterItem[];
  categories?: FilterItem[];
  vehiclesList?: FilterItem[];
  showNoProfitOnly: boolean;
  onToggleNoProfit: (val: boolean) => void;
  onClearFilters: () => void;
  onSearchClick: () => void;
}

interface CustomDropdownProps {
  id: string;
  icon: React.ReactNode;
  value: string;
  options: FilterItem[];
  placeholder: string;
  onChange: (val: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  searchable?: boolean;
  highlighted?: boolean;
}

function CustomFilterDropdown({
  icon,
  value,
  options,
  placeholder,
  onChange,
  isOpen,
  onToggle,
  onClose,
  searchable = false,
  highlighted = false,
}: CustomDropdownProps) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isOpen) setSearchTerm("");
  }, [isOpen]);

  const selectedItem = options.find((opt) => opt.id === value);
  const displayLabel = selectedItem ? selectedItem.name : placeholder;

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((opt) => opt.name.toLowerCase().includes(term));
  }, [options, searchable, searchTerm]);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`w-full h-10 px-3 flex items-center justify-between gap-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border outline-none cursor-pointer ${
          isOpen
            ? "bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-xs text-blue-900"
            : highlighted
            ? "bg-blue-50/50 border-blue-200 text-blue-900 hover:bg-blue-50 hover:border-blue-300"
            : "bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100/70 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="shrink-0">{icon}</span>
          <span className="truncate text-left">{displayLabel}</span>
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-600" : highlighted ? "text-blue-500" : "text-gray-400"
          }`}
        />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-[calc(100%+6px)] left-0 min-w-full sm:min-w-[210px] max-w-[290px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-1.5 overflow-hidden animate-in fade-in duration-150"
        >
          {searchable && options.length > 5 && (
            <div className="px-2 pt-1 pb-2 border-b border-gray-100 mb-1">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all placeholder-gray-400"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id);
                      onClose();
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="truncate">{opt.name}</span>
                    {isSelected && <Check size={14} className="text-blue-600 shrink-0 ml-1.5" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-center text-xs text-gray-400 font-medium">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfitFilters({
  searchQuery,
  onSearchChange,
  supplierStatus = "active",
  onSupplierStatusChange,
  selectedCountry,
  onCountryChange,
  selectedSupplier,
  onSupplierChange,
  selectedBranch,
  onBranchChange,
  selectedCategory = "",
  onCategoryChange,
  selectedVehicle = "",
  onVehicleChange,
  countries = [],
  suppliers = [],
  branches = [],
  categories = [],
  vehiclesList = [],
  showNoProfitOnly,
  onToggleNoProfit,
  onClearFilters,
  onSearchClick,
}: ProfitFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleDropdown = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const activeFiltersCount = [
    onSupplierStatusChange && supplierStatus !== "active",
    selectedCountry !== "",
    selectedSupplier !== "",
    selectedBranch !== "",
    selectedCategory !== "",
    selectedVehicle !== "",
    searchQuery !== "",
    showNoProfitOnly === true,
  ].filter(Boolean).length;

  const statusOptions: FilterItem[] = [
    { id: "active", name: "Active Companies" },
    { id: "all", name: "All Companies" },
    { id: "inactive", name: "Inactive Companies" },
  ];

  const countryOptions: FilterItem[] = [
    { id: "", name: "All Countries" },
    ...countries,
  ];

  const supplierOptions: FilterItem[] = [
    { id: "", name: suppliers.length > 0 ? `All Suppliers (${suppliers.length})` : "All Suppliers" },
    ...suppliers,
  ];

  const branchOptions: FilterItem[] = [
    { id: "", name: branches.length > 0 ? `All Branches (${branches.length})` : "All Branches" },
    ...branches,
  ];

  const categoryOptions: FilterItem[] = [
    { id: "", name: "All Categories" },
    ...categories,
  ];

  const vehicleOptions: FilterItem[] = [
    { id: "", name: "All Vehicles" },
    ...vehiclesList,
  ];

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] p-4 lg:p-5 relative"
    >
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <Filter size={17} className="text-gray-500" />
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Search & Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold border border-blue-200/80">
              {activeFiltersCount} active
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={() => {
              onClearFilters();
              if (onSupplierStatusChange) onSupplierStatusChange("active");
              if (onVehicleChange) onVehicleChange("");
              if (onCategoryChange) onCategoryChange("");
              onToggleNoProfit(false);
              setOpenDropdown(null);
            }}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <X size={14} />
            Reset all
          </button>
        )}
      </div>

      {/* Desktop Filters Grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-7 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search vehicle name or branch..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearchClick()}
            className="w-full h-10 pl-9 pr-4 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-xs placeholder-gray-400"
          />
        </div>

        {/* Company Status Selector (if enabled) */}
        {onSupplierStatusChange && (
          <CustomFilterDropdown
            id="status"
            icon={<ShieldCheck className="text-blue-600" size={16} />}
            value={supplierStatus}
            options={statusOptions}
            placeholder="Company Status"
            onChange={(val) => onSupplierStatusChange(val as SupplierStatus)}
            isOpen={openDropdown === "status"}
            onToggle={() => toggleDropdown("status")}
            onClose={closeDropdown}
            highlighted={true}
          />
        )}

        {/* Country */}
        <CustomFilterDropdown
          id="country"
          icon={<MapPin className={selectedCountry ? "text-blue-600" : "text-gray-400"} size={16} />}
          value={selectedCountry}
          options={countryOptions}
          placeholder="All Countries"
          onChange={onCountryChange}
          isOpen={openDropdown === "country"}
          onToggle={() => toggleDropdown("country")}
          onClose={closeDropdown}
          searchable={true}
          highlighted={!!selectedCountry}
        />

        {/* Supplier */}
        <CustomFilterDropdown
          id="supplier"
          icon={<Building2 className={selectedSupplier ? "text-blue-600" : "text-gray-400"} size={16} />}
          value={selectedSupplier}
          options={supplierOptions}
          placeholder="All Suppliers"
          onChange={onSupplierChange}
          isOpen={openDropdown === "supplier"}
          onToggle={() => toggleDropdown("supplier")}
          onClose={closeDropdown}
          searchable={true}
          highlighted={!!selectedSupplier}
        />

        {/* Branch */}
        <CustomFilterDropdown
          id="branch"
          icon={<Store className={selectedBranch ? "text-blue-600" : "text-gray-400"} size={16} />}
          value={selectedBranch}
          options={branchOptions}
          placeholder="All Branches"
          onChange={onBranchChange}
          isOpen={openDropdown === "branch"}
          onToggle={() => toggleDropdown("branch")}
          onClose={closeDropdown}
          searchable={true}
          highlighted={!!selectedBranch}
        />

        {/* Category (if enabled) */}
        {onCategoryChange && (
          <CustomFilterDropdown
            id="category"
            icon={<Layers className={selectedCategory ? "text-blue-600" : "text-gray-400"} size={16} />}
            value={selectedCategory}
            options={categoryOptions}
            placeholder="All Categories"
            onChange={(val) => onCategoryChange(val)}
            isOpen={openDropdown === "category"}
            onToggle={() => toggleDropdown("category")}
            onClose={closeDropdown}
            searchable={true}
            highlighted={!!selectedCategory}
          />
        )}

        {/* Vehicle (if enabled for BulkInclusions) */}
        {onVehicleChange && vehiclesList.length > 0 && (
          <CustomFilterDropdown
            id="vehicle"
            icon={<Car className={selectedVehicle ? "text-blue-600" : "text-gray-400"} size={16} />}
            value={selectedVehicle}
            options={vehicleOptions}
            placeholder="All Vehicles"
            onChange={(val) => onVehicleChange(val)}
            isOpen={openDropdown === "vehicle"}
            onToggle={() => toggleDropdown("vehicle")}
            onClose={closeDropdown}
            searchable={true}
            highlighted={!!selectedVehicle}
          />
        )}
      </div>

      {/* Second Row for Desktop: Checkbox + Action */}
      <div className="hidden md:flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <label className="flex items-center gap-2 select-none cursor-pointer text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">
          <input
            type="checkbox"
            checked={showNoProfitOnly}
            onChange={(e) => onToggleNoProfit(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          Show only vehicles without profit margins
        </label>

        <button
          onClick={onSearchClick}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-6 py-2 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
        >
          <Search size={14} />
          Apply Filters
        </button>
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-gray-700 bg-gray-50 rounded-xl border border-gray-200"
        >
          <Filter size={15} />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>

        {showMobileFilters && (
          <div className="mt-3 space-y-2.5 pt-3 border-t border-gray-100 text-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
              />
            </div>

            {onSupplierStatusChange && (
              <CustomFilterDropdown
                id="m-status"
                icon={<ShieldCheck className="text-blue-600" size={15} />}
                value={supplierStatus}
                options={statusOptions}
                placeholder="Company Status"
                onChange={(val) => onSupplierStatusChange(val as SupplierStatus)}
                isOpen={openDropdown === "m-status"}
                onToggle={() => toggleDropdown("m-status")}
                onClose={closeDropdown}
                highlighted={true}
              />
            )}

            <CustomFilterDropdown
              id="m-country"
              icon={<MapPin className="text-gray-400" size={15} />}
              value={selectedCountry}
              options={countryOptions}
              placeholder="All Countries"
              onChange={onCountryChange}
              isOpen={openDropdown === "m-country"}
              onToggle={() => toggleDropdown("m-country")}
              onClose={closeDropdown}
              searchable={true}
              highlighted={!!selectedCountry}
            />

            <CustomFilterDropdown
              id="m-supplier"
              icon={<Building2 className="text-gray-400" size={15} />}
              value={selectedSupplier}
              options={supplierOptions}
              placeholder="All Suppliers"
              onChange={onSupplierChange}
              isOpen={openDropdown === "m-supplier"}
              onToggle={() => toggleDropdown("m-supplier")}
              onClose={closeDropdown}
              searchable={true}
              highlighted={!!selectedSupplier}
            />

            <CustomFilterDropdown
              id="m-branch"
              icon={<Store className="text-gray-400" size={15} />}
              value={selectedBranch}
              options={branchOptions}
              placeholder="All Branches"
              onChange={onBranchChange}
              isOpen={openDropdown === "m-branch"}
              onToggle={() => toggleDropdown("m-branch")}
              onClose={closeDropdown}
              searchable={true}
              highlighted={!!selectedBranch}
            />

            {onCategoryChange && (
              <CustomFilterDropdown
                id="m-category"
                icon={<Layers className="text-gray-400" size={15} />}
                value={selectedCategory}
                options={categoryOptions}
                placeholder="All Categories"
                onChange={(val) => onCategoryChange(val)}
                isOpen={openDropdown === "m-category"}
                onToggle={() => toggleDropdown("m-category")}
                onClose={closeDropdown}
                searchable={true}
                highlighted={!!selectedCategory}
              />
            )}

            {onVehicleChange && vehiclesList.length > 0 && (
              <CustomFilterDropdown
                id="m-vehicle"
                icon={<Car className="text-gray-400" size={15} />}
                value={selectedVehicle}
                options={vehicleOptions}
                placeholder="All Vehicles"
                onChange={(val) => onVehicleChange(val)}
                isOpen={openDropdown === "m-vehicle"}
                onToggle={() => toggleDropdown("m-vehicle")}
                onClose={closeDropdown}
                searchable={true}
                highlighted={!!selectedVehicle}
              />
            )}

            <label className="flex items-center gap-2 py-1 text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={showNoProfitOnly}
                onChange={(e) => onToggleNoProfit(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300"
              />
              Show only vehicles without profit
            </label>

            <button
              onClick={() => {
                onSearchClick();
                setShowMobileFilters(false);
              }}
              className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5"
            >
              <Search size={14} />
              Apply Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
