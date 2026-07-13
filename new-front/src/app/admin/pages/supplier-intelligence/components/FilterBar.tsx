import { Search, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { categories } from "@/data/categories";
import { useState, useRef, useEffect } from "react";

interface FilterBarProps {
  filters: any;
  onFilterChange: (key: string, value: string) => void;
  onSearch: () => void;
  loading: boolean;
  countriesList?: any[];
  suppliersList?: any[];
}

export function FilterBar({
  filters,
  onFilterChange,
  onSearch,
  loading,
  countriesList = [],
  suppliersList = [],
}: FilterBarProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [isCarTypeOpen, setIsCarTypeOpen] = useState(false);
  const [isSupplierStatusOpen, setIsSupplierStatusOpen] = useState(false);

  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [supplierSearchQuery, setSupplierSearchQuery] = useState("");

  const categoryRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const supplierRef = useRef<HTMLDivElement>(null);
  const carTypeRef = useRef<HTMLDivElement>(null);
  const supplierStatusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
        setCountrySearchQuery("");
      }
      if (supplierRef.current && !supplierRef.current.contains(event.target as Node)) {
        setIsSupplierOpen(false);
        setSupplierSearchQuery("");
      }
      if (carTypeRef.current && !carTypeRef.current.contains(event.target as Node)) {
        setIsCarTypeOpen(false);
      }
      if (supplierStatusRef.current && !supplierStatusRef.current.contains(event.target as Node)) {
        setIsSupplierStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const countriesToUse = countriesList;

  // Alphabetically sort countries
  const sortedCountries = [...countriesToUse].sort((a, b) => a.name.localeCompare(b.name));

  // Filter countries by search query
  const filteredCountries = sortedCountries.filter((c) =>
    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  // Filter suppliers by search query
  const filteredSuppliers = suppliersList.filter((s) =>
    s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase())
  );

  const selectedCategory = categories.find(c => c.name === filters.category);
  const selectedCountry = countriesToUse.find(c => c.name === filters.country);

  // Dynamic button style helper
  const getButtonClass = (isOpen: boolean) => {
    return `w-full text-left text-sm font-bold text-slate-900 border bg-white flex items-center justify-between gap-2 outline-none transition-all h-[46px] px-4 ${
      isOpen
        ? "border-2 border-amber-500 rounded-[1.25rem] ring-0"
        : "border-gray-200 rounded-[1.25rem] hover:border-gray-300"
    }`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* Label row */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Filter Results
      </p>

      {/* Filters + Search button in one responsive row */}
      <div className="flex flex-wrap gap-3 items-end">

        {/* ── Country ── */}
        <div ref={countryRef} className="relative flex-1 min-w-[150px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
            Country
          </label>
          <button
            type="button"
            onClick={() => setIsCountryOpen(!isCountryOpen)}
            className={getButtonClass(isCountryOpen)}
          >
            <span className="truncate">
              {selectedCountry ? selectedCountry.name : "All Countries"}
            </span>
            {isCountryOpen 
              ? <ChevronUp size={15} className="text-amber-500 shrink-0" />
              : <ChevronDown size={15} className="text-gray-400 shrink-0" />
            }
          </button>

          {isCountryOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full min-w-[220px] bg-white border border-gray-100 rounded-[1.5rem] shadow-xl z-50 p-2">
              {/* Search input inside dropdown */}
              <div className="px-1 py-1 mb-2 border-b border-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  <input
                    type="text"
                    placeholder="Search Country..."
                    autoFocus
                    value={countrySearchQuery}
                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none hover:border-gray-300 focus:border-amber-500 transition-all focus:bg-white"
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto pr-1">
                <button
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-xl flex items-center relative overflow-hidden ${
                    filters.country === "All"
                      ? "bg-amber-50/50 text-amber-800 font-bold"
                      : "text-slate-800 font-semibold hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    onFilterChange("country", "All");
                    setIsCountryOpen(false);
                    setCountrySearchQuery("");
                  }}
                >
                  {filters.country === "All" && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r" />
                  )}
                  All Countries
                </button>
                {filteredCountries.map(country => (
                  <button
                    key={country.id}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-xl flex items-center relative overflow-hidden ${
                      filters.country === country.name
                        ? "bg-amber-50/50 text-amber-800 font-bold"
                        : "text-slate-800 font-semibold hover:bg-slate-50"
                    }`}
                    onClick={() => {
                      onFilterChange("country", country.name);
                      setIsCountryOpen(false);
                      setCountrySearchQuery("");
                    }}
                  >
                    {filters.country === country.name && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r" />
                    )}
                    {country.name}
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="px-4 py-4 text-center text-xs text-gray-400">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Category ── */}
        <div ref={categoryRef} className="relative flex-1 min-w-[150px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
            Category
          </label>
          <button
            type="button"
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className={getButtonClass(isCategoryOpen)}
          >
            <span className="truncate">
              {selectedCategory ? selectedCategory.name : "All Categories"}
            </span>
            {isCategoryOpen 
              ? <ChevronUp size={15} className="text-amber-500 shrink-0" />
              : <ChevronDown size={15} className="text-gray-400 shrink-0" />
            }
          </button>

          {isCategoryOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full min-w-[200px] bg-white border border-gray-100 rounded-[1.5rem] shadow-xl z-50 p-2">
              <div className="max-h-60 overflow-y-auto pr-1">
                <button
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-xl flex items-center relative overflow-hidden ${
                    filters.category === "All"
                      ? "bg-amber-50/50 text-amber-800 font-bold"
                      : "text-slate-800 font-semibold hover:bg-slate-50"
                  }`}
                  onClick={() => { onFilterChange("category", "All"); setIsCategoryOpen(false); }}
                >
                  {filters.category === "All" && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r" />
                  )}
                  All Categories
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-xl flex items-center relative overflow-hidden ${
                      filters.category === category.name
                        ? "bg-amber-50/50 text-amber-800 font-bold"
                        : "text-slate-800 font-semibold hover:bg-slate-50"
                    }`}
                    onClick={() => { onFilterChange("category", category.name); setIsCategoryOpen(false); }}
                  >
                    {filters.category === category.name && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r" />
                    )}
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Car Type ── */}
        <div ref={carTypeRef} className="relative flex-1 min-w-[130px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
            Car Type
          </label>
          <button
            type="button"
            onClick={() => setIsCarTypeOpen(!isCarTypeOpen)}
            className={getButtonClass(isCarTypeOpen)}
          >
            <span className="truncate">
              {filters.carType === "Petrol" ? "Petrol" : filters.carType === "Electric" ? "Electric" : "All Types"}
            </span>
            {isCarTypeOpen 
              ? <ChevronUp size={15} className="text-amber-500 shrink-0" />
              : <ChevronDown size={15} className="text-gray-400 shrink-0" />
            }
          </button>

          {isCarTypeOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full min-w-[160px] bg-white border border-gray-100 rounded-[1.5rem] shadow-xl z-50 p-2">
              <div className="max-h-60 overflow-y-auto pr-1">
                <button
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-xl flex items-center relative overflow-hidden ${
                    filters.carType === "All"
                      ? "bg-amber-50/50 text-amber-800 font-bold"
                      : "text-slate-800 font-semibold hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    onFilterChange("carType", "All");
                    setIsCarTypeOpen(false);
                  }}
                >
                  {filters.carType === "All" && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r" />
                  )}
                  All Types
                </button>
                <button
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-xl flex items-center relative overflow-hidden ${
                    filters.carType === "Petrol"
                      ? "bg-amber-50/50 text-amber-800 font-bold"
                      : "text-slate-800 font-semibold hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    onFilterChange("carType", "Petrol");
                    setIsCarTypeOpen(false);
                  }}
                >
                  {filters.carType === "Petrol" && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r" />
                  )}
                  Petrol
                </button>
                <button
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-xl flex items-center relative overflow-hidden ${
                    filters.carType === "Electric"
                      ? "bg-amber-50/50 text-amber-800 font-bold"
                      : "text-slate-800 font-semibold hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    onFilterChange("carType", "Electric");
                    setIsCarTypeOpen(false);
                  }}
                >
                  {filters.carType === "Electric" && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r" />
                  )}
                  Electric
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Supplier Status ── */}
        <div ref={supplierStatusRef} className="relative flex-1 min-w-[155px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
            Supplier Status
          </label>
          <button
            type="button"
            onClick={() => setIsSupplierStatusOpen(!isSupplierStatusOpen)}
            className={getButtonClass(isSupplierStatusOpen)}
          >
            <span className="truncate">
              {filters.supplierStatus === "inactive" ? "Inactive Suppliers" : filters.supplierStatus === "all" ? "All Suppliers" : "Active Suppliers"}
            </span>
            {isSupplierStatusOpen 
              ? <ChevronUp size={15} className="text-amber-500 shrink-0" />
              : <ChevronDown size={15} className="text-gray-400 shrink-0" />
            }
          </button>

          {isSupplierStatusOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full min-w-[180px] bg-white border border-gray-100 rounded-[1.5rem] shadow-xl z-50 p-2">
              <div className="max-h-60 overflow-y-auto pr-1">
                <button
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-xl flex items-center relative overflow-hidden ${
                    filters.supplierStatus === "active"
                      ? "bg-amber-50/50 text-amber-800 font-bold"
                      : "text-slate-800 font-semibold hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    onFilterChange("supplierStatus", "active");
                    setIsSupplierStatusOpen(false);
                  }}
                >
                  {filters.supplierStatus === "active" && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r" />
                  )}
                  Active Suppliers
                </button>
                <button
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-xl flex items-center relative overflow-hidden ${
                    filters.supplierStatus === "inactive"
                      ? "bg-amber-50/50 text-amber-800 font-bold"
                      : "text-slate-800 font-semibold hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    onFilterChange("supplierStatus", "inactive");
                    setIsSupplierStatusOpen(false);
                  }}
                >
                  {filters.supplierStatus === "inactive" && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r" />
                  )}
                  Inactive Suppliers
                </button>
                <button
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-xl flex items-center relative overflow-hidden ${
                    filters.supplierStatus === "all"
                      ? "bg-amber-50/50 text-amber-800 font-bold"
                      : "text-slate-800 font-semibold hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    onFilterChange("supplierStatus", "all");
                    setIsSupplierStatusOpen(false);
                  }}
                >
                  {filters.supplierStatus === "all" && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r" />
                  )}
                  All Suppliers
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Supplier ── */}
        <div ref={supplierRef} className="relative flex-1 min-w-[170px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
            Supplier
          </label>
          <button
            type="button"
            onClick={() => setIsSupplierOpen(!isSupplierOpen)}
            className={getButtonClass(isSupplierOpen)}
          >
            <span className="truncate">
              {filters.searchQuery && filters.searchQuery !== "" && filters.searchQuery !== "All" ? filters.searchQuery : "All Suppliers"}
            </span>
            {isSupplierOpen 
              ? <ChevronUp size={15} className="text-amber-500 shrink-0" />
              : <ChevronDown size={15} className="text-gray-400 shrink-0" />
            }
          </button>

          {isSupplierOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full min-w-[220px] bg-white border border-gray-100 rounded-[1.5rem] shadow-xl z-50 p-2">
              {/* Search input inside dropdown */}
              <div className="px-1 py-1 mb-2 border-b border-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  <input
                    type="text"
                    placeholder="Search Supplier..."
                    autoFocus
                    value={supplierSearchQuery}
                    onChange={(e) => setSupplierSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none hover:border-gray-300 focus:border-amber-500 transition-all focus:bg-white"
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto pr-1">
                <button
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-xl flex items-center relative overflow-hidden ${
                    (!filters.searchQuery || filters.searchQuery === "" || filters.searchQuery === "All")
                      ? "bg-amber-50/50 text-amber-800 font-bold"
                      : "text-slate-800 font-semibold hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    onFilterChange("searchQuery", "");
                    setIsSupplierOpen(false);
                    setSupplierSearchQuery("");
                  }}
                >
                  {(!filters.searchQuery || filters.searchQuery === "" || filters.searchQuery === "All") && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r" />
                  )}
                  All Suppliers
                </button>
                {filteredSuppliers.map(sup => (
                  <button
                    key={sup.id}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-xl flex items-center relative overflow-hidden ${
                      filters.searchQuery === sup.name
                        ? "bg-amber-50/50 text-amber-800 font-bold"
                        : "text-slate-800 font-semibold hover:bg-slate-50"
                    }`}
                    onClick={() => {
                      onFilterChange("searchQuery", sup.name);
                      setIsSupplierOpen(false);
                      setSupplierSearchQuery("");
                    }}
                  >
                    {filters.searchQuery === sup.name && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r" />
                    )}
                    {sup.name}
                  </button>
                ))}
                {filteredSuppliers.length === 0 && (
                  <div className="px-4 py-4 text-center text-xs text-gray-400">
                    No suppliers found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Search Button ── */}
        <div className="shrink-0">
          <label className="block text-[11px] font-bold text-transparent uppercase tracking-wider mb-1.5 select-none">
            &nbsp;
          </label>
          <button
            type="button"
            onClick={onSearch}
            disabled={loading}
            className="btn-primary h-[46px] px-6 rounded-[1.25rem] font-black flex items-center gap-2 text-sm disabled:opacity-50 whitespace-nowrap"
          >
            {loading
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />
            }
            Search
          </button>
        </div>

      </div>
    </div>
  );
}
