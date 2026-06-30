"use client";

import { useState } from "react";
import { Car, TrendingUp, Search, Layers, X, ChevronRight, CalendarCheck, Building2, Globe, Maximize2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getCountryFlag, getCountryFullName } from "@/utils/countryUtils";

interface CategoryItem {
  id: number;
  name: string;
  vehicles_count: number;
  bookings_count: number;
  companies_by_country?: { country: string; company_count: number }[];
}

interface VehicleCategoriesOverviewProps {
  isMaximized?: boolean;
  onMaximize?: () => void;
  onClose?: () => void;
}

export default function VehicleCategoriesOverview({ isMaximized = false, onMaximize, onClose }: VehicleCategoriesOverviewProps) {
  const { rawData } = useSelector((state: RootState) => state.dashboard);
  const statsData = rawData?.vehicleCategoriesStats || rawData?.vehicle_categories_stats;

  const totalCategories = statsData?.total_categories ?? 0;
  const mostRequested   = statsData?.most_requested   ?? "—";
  const mostSearched    = statsData?.most_searched    ?? "—";
  const list: CategoryItem[] = statsData?.list || [];
  const topCategories = [...list]
    .sort((a, b) => b.bookings_count - a.bookings_count)
    .slice(0, 5);

  const totalBookings = list.reduce((s, i) => s + i.bookings_count, 0);

  const [selected, setSelected] = useState<CategoryItem | null>(null);

  const pillColors = [
    "bg-blue-100 text-blue-800",
    "bg-emerald-100 text-emerald-800",
    "bg-amber-100 text-amber-800",
    "bg-red-100 text-red-800",
    "bg-purple-100 text-purple-800",
    "bg-pink-100 text-pink-800",
  ];

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 flex flex-col relative overflow-hidden transition-all ${
      isMaximized ? 'h-full w-full border-none p-0 shadow-none' : 'p-5 shadow-sm h-[420px]'
    }`}>

      {/* ── Detail Panel (slides in on category click) ── */}
      <div
        className={`absolute inset-0 bg-white z-10 flex flex-col p-5 transition-transform duration-300 ease-in-out ${
          selected ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selected && (
          <>
            {/* Panel Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-50 p-2 rounded-xl">
                  <Layers className="text-blue-600" size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 truncate max-w-[160px]" title={selected.name}>
                    {selected.name}
                  </h3>
                  <p className="text-xs text-gray-400">Category breakdown</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Counts row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50/80 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold mb-1">
                  <Car size={14} /> Vehicles
                </div>
                <p className="text-lg font-bold text-gray-900">{selected.vehicles_count}</p>
              </div>
              <div className="bg-emerald-50/80 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold mb-1">
                  <CalendarCheck size={14} /> Bookings
                </div>
                <p className="text-lg font-bold text-gray-900">{selected.bookings_count}</p>
              </div>
            </div>

            {/* Companies per country */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5 flex items-center gap-1">
              <Globe size={12} className="text-blue-500" /> Companies offering this type per country
            </p>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
              {selected.companies_by_country && selected.companies_by_country.length > 0 ? (
                selected.companies_by_country.map((row, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[140px] flex items-center gap-1.5" title={getCountryFullName(row.country)}>
                        <span className="text-base leading-none">{getCountryFlag(row.country)}</span>
                        <span>{getCountryFullName(row.country)}</span>
                      </span>
                    </div>
                    <span className="shrink-0 flex items-center gap-1 bg-amber-50 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      <Building2 size={11} />{row.company_count} {row.company_count === 1 ? "company" : "companies"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic text-center pt-4">No companies found</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Main View ── */}
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-50 p-2.5 rounded-xl">
            <Car className="text-amber-600" size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Vehicle Categories</h3>
            <p className="text-xs text-gray-400 mt-0.5">Demand &amp; search insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
            {totalCategories} Types
          </span>
          {isMaximized ? (
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors cursor-pointer" title="Close">
              <X size={16} />
            </button>
          ) : (
            onMaximize && (
              <button onClick={onMaximize} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors cursor-pointer" title="Maximize">
                <Maximize2 size={16} />
              </button>
            )
          )}
        </div>
      </div>

      {/* Hero highlights */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="text-emerald-600" size={16} />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              Most Requested
            </span>
          </div>
          <p className="text-base font-extrabold text-gray-900 truncate capitalize" title={mostRequested}>
            {mostRequested || <span className="text-gray-400 font-medium text-sm">No data yet</span>}
          </p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">🔥 Top booked type</p>
        </div>

        <div className="bg-purple-50 rounded-xl p-3.5 border border-purple-100">
          <div className="flex items-center gap-1.5 mb-2">
            <Search className="text-purple-600" size={16} />
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
              Most Searched
            </span>
          </div>
          <p className="text-base font-extrabold text-gray-900 truncate capitalize" title={mostSearched}>
            {mostSearched || <span className="text-gray-400 font-medium text-sm">No data yet</span>}
          </p>
          <p className="text-xs text-purple-600 mt-1 font-medium">🔍 Top search type</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-3" />

      {/* Category list — clickable */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5 flex items-center gap-1">
        <Layers size={12} /> All Categories — <span className="normal-case font-normal text-gray-400">click for details</span>
      </p>
      {topCategories.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-2">No data</p>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
          {topCategories.map((item, i) => {
            const pct = totalBookings > 0 ? Math.round((item.bookings_count / totalBookings) * 100) : 0;
            return (
              <button
                key={i}
                onClick={() => setSelected(item)}
                className="w-full flex items-center justify-between group hover:bg-amber-50/60 rounded-xl px-3 py-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${pillColors[i % pillColors.length]}`}>
                    #{i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate capitalize text-left" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{item.vehicles_count} veh.</span>
                  <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                    {pct}%
                  </span>
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
