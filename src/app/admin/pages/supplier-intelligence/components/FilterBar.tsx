import { Search, ChevronDown, RefreshCw } from "lucide-react";
import { countries } from "@/data/countries";
import { categories } from "@/data/categories";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface FilterBarProps {
  filters: any;
  onFilterChange: (key: string, value: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export function FilterBar({
  filters,
  onFilterChange,
  onSearch,
  loading,
}: FilterBarProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategory = categories.find(c => c.name === filters.category);
  const selectedCountry = countries.find(c => c.name === filters.country);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* Label row */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Filter Results
      </p>

      {/* Filters + Search button in one responsive row */}
      <div className="flex flex-wrap gap-3 items-end">

        {/* ── Country ── */}
        <div ref={countryRef} className="relative flex-1 min-w-[140px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Country
          </label>
          <button
            type="button"
            onClick={() => setIsCountryOpen(!isCountryOpen)}
            className="w-full text-left text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white flex items-center justify-between gap-2 outline-none hover:border-gray-300 transition-colors"
          >
            <span className="flex items-center gap-2 font-medium text-gray-800 truncate">
              {selectedCountry ? (
                <>
                  <div className="w-4 h-4 relative rounded-full overflow-hidden shrink-0 border border-gray-200">
                    <Image src={selectedCountry.image} alt={selectedCountry.name} fill className="object-cover" />
                  </div>
                  <span className="truncate">{selectedCountry.name}</span>
                </>
              ) : (
                <span className="text-gray-500">All Countries</span>
              )}
            </span>
            <ChevronDown size={14} className="text-gray-400 shrink-0" />
          </button>

          {isCountryOpen && (
            <div className="absolute top-full left-0 w-full min-w-[180px] mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto py-1">
              <button
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-600 font-medium"
                onClick={() => { onFilterChange("country", "All"); setIsCountryOpen(false); }}
              >
                All Countries
              </button>
              {countries.map(country => (
                <button
                  key={country.id}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-3"
                  onClick={() => { onFilterChange("country", country.name); setIsCountryOpen(false); }}
                >
                  <div className="w-4 h-4 relative rounded-full overflow-hidden shrink-0 border border-gray-200">
                    <Image src={country.image} alt={country.name} fill className="object-cover" />
                  </div>
                  {country.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Category ── */}
        <div ref={categoryRef} className="relative flex-1 min-w-[140px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Category
          </label>
          <button
            type="button"
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full text-left text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white flex items-center justify-between gap-2 outline-none hover:border-gray-300 transition-colors"
          >
            <span className="flex items-center gap-2 font-medium text-gray-800 truncate">
              {selectedCategory ? (
                <>
                  <Image src={selectedCategory.image} alt={selectedCategory.name} width={18} height={12} className="object-contain shrink-0" />
                  <span className="truncate">{selectedCategory.name}</span>
                </>
              ) : (
                <span className="text-gray-500">All Categories</span>
              )}
            </span>
            <ChevronDown size={14} className="text-gray-400 shrink-0" />
          </button>

          {isCategoryOpen && (
            <div className="absolute top-full left-0 w-full min-w-[180px] mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto py-1">
              <button
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-600 font-medium"
                onClick={() => { onFilterChange("category", "All"); setIsCategoryOpen(false); }}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-3"
                  onClick={() => { onFilterChange("category", category.name); setIsCategoryOpen(false); }}
                >
                  <div className="w-7 h-4 relative shrink-0">
                    <Image src={category.image} alt={category.name} fill className="object-contain" />
                  </div>
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Car Type ── */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Car Type
          </label>
          <select
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white font-medium text-gray-800 outline-none hover:border-gray-300 transition-colors appearance-none cursor-pointer"
            value={filters.carType}
            onChange={(e) => onFilterChange("carType", e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Petrol">Petrol</option>
            <option value="Electric">Electric</option>
          </select>
        </div>

        {/* ── Supplier Search ── */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Supplier
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            <input
              type="text"
              placeholder="Supplier or car name..."
              value={filters.searchQuery || ""}
              onChange={(e) => onFilterChange("searchQuery", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white font-medium text-gray-800 outline-none hover:border-gray-300 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* ── Search Button ── */}
        <div className="shrink-0">
          <label className="block text-[11px] font-bold text-transparent uppercase tracking-wider mb-1 select-none">
            &nbsp;
          </label>
          <button
            type="button"
            onClick={onSearch}
            disabled={loading}
            className="btn-primary h-[42px] px-6 rounded-xl font-black flex items-center gap-2 text-sm disabled:opacity-50 whitespace-nowrap"
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
