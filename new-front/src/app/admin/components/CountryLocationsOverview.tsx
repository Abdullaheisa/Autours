"use client";

import { useState } from "react";
import { Globe, Building2, Plane, MapPin, X, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface CountryItem {
  country: string;
  branches: number;
  airports: number;
  branch_names?: string[];
  airport_names?: string[];
}

export default function CountryLocationsOverview() {
  const { rawData } = useSelector((state: RootState) => state.dashboard);
  const statsData = rawData?.countryLocationsStats || rawData?.country_locations_stats;

  const totalCountries = statsData?.total_countries ?? 0;
  const totalBranches  = statsData?.total_branches  ?? 0;
  const totalAirports  = statsData?.total_airports  ?? 0;
  const list: CountryItem[] = (statsData?.list || []).slice(0, 5);

  const [selected, setSelected] = useState<CountryItem | null>(null);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm h-[420px] flex flex-col relative overflow-hidden">

      {/* ── Detail Panel (slides in on country click) ── */}
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
                  <MapPin className="text-blue-600" size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 truncate max-w-[160px]" title={selected.country}>
                    {selected.country}
                  </h3>
                  <p className="text-xs text-gray-400">Location details</p>
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
              <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2.5">
                <Building2 className="text-emerald-600 shrink-0" size={20} />
                <div>
                  <p className="text-xl font-extrabold text-gray-900">{selected.branches}</p>
                  <p className="text-xs text-gray-500">Branches</p>
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 flex items-center gap-2.5">
                <Plane className="text-purple-600 shrink-0" size={20} />
                <div>
                  <p className="text-xl font-extrabold text-gray-900">{selected.airports}</p>
                  <p className="text-xs text-gray-500">Airports</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 mb-3" />

            {/* Lists */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
              {/* Branches */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Building2 size={12} className="text-emerald-500" /> Branches
                </p>
                {selected.branch_names && selected.branch_names.length > 0 ? (
                  <div className="space-y-1.5">
                    {selected.branch_names.map((name, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-700 font-medium truncate" title={name}>{name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No branches listed</p>
                )}
              </div>

              {/* Airports */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Plane size={12} className="text-purple-500" /> Airports
                </p>
                {selected.airport_names && selected.airport_names.length > 0 ? (
                  <div className="space-y-1.5">
                    {selected.airport_names.map((name, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-700 font-medium truncate" title={name}>{name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No airports listed</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Main View ── */}
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50 p-2.5 rounded-xl">
            <Globe className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Countries &amp; Locations</h3>
            <p className="text-xs text-gray-400 mt-0.5">Global coverage summary</p>
          </div>
        </div>
        <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
          {totalCountries} Countries
        </span>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center bg-blue-50/60 rounded-xl py-3.5">
          <Globe className="text-blue-500 mx-auto mb-1.5" size={20} />
          <p className="text-2xl font-extrabold text-gray-900">{totalCountries}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Countries</p>
        </div>
        <div className="text-center bg-emerald-50/60 rounded-xl py-3.5">
          <Building2 className="text-emerald-500 mx-auto mb-1.5" size={20} />
          <p className="text-2xl font-extrabold text-gray-900">{totalBranches.toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Branches</p>
        </div>
        <div className="text-center bg-purple-50/60 rounded-xl py-3.5">
          <Plane className="text-purple-500 mx-auto mb-1.5" size={20} />
          <p className="text-2xl font-extrabold text-gray-900">{totalAirports}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Airports</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-3" />

      {/* Top Countries — clickable */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5 flex items-center gap-1">
        <MapPin size={12} /> Top Locations — <span className="normal-case font-normal text-gray-400">click to see details</span>
      </p>
      <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {list.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">No data</p>
        ) : (
          list.map((item, i) => (
            <button
              key={i}
              onClick={() => setSelected(item)}
              className="w-full flex items-center justify-between group hover:bg-blue-50/60 rounded-xl px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 transition-colors">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-gray-700 text-left truncate max-w-[170px]" title={item.country}>
                  {item.country}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Building2 size={10} />{item.branches}
                </span>
                {item.airports > 0 && (
                  <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Plane size={10} />{item.airports}
                  </span>
                )}
                <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
