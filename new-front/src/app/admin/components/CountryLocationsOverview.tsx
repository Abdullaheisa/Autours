"use client";

import { useState } from "react";
import { Globe, Building2, Plane, MapPin, X, ChevronRight, TrendingUp, Maximize2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Image from "next/image";
import { getCountryFullName, getCountryIso } from "@/utils/countryUtils";

interface CountryItem {
  country: string;
  branches: number;
  airports: number;
  bookings?: number;
  branch_names?: string[];
  airport_names?: string[];
}

interface CountryLocationsOverviewProps {
  isMaximized?: boolean;
  onMaximize?: () => void;
  onClose?: () => void;
}

export default function CountryLocationsOverview({ isMaximized = false, onMaximize, onClose }: CountryLocationsOverviewProps) {
  const { rawData } = useSelector((state: RootState) => state.dashboard);
  const statsData = rawData?.countryLocationsStats || rawData?.country_locations_stats;

  const totalCountries = statsData?.total_countries ?? 0;
  const totalBranches  = statsData?.total_branches  ?? 0;
  const totalAirports  = statsData?.total_airports  ?? 0;

  // All countries, sorted by bookings (backend already sorts, but ensure it here too)
  const list: CountryItem[] = [...(statsData?.list || [])].sort(
    (a, b) => (b.bookings ?? 0) - (a.bookings ?? 0)
  );

  const topBookingsCountry = list.length > 0 ? list[0] : null;

  const [selected, setSelected] = useState<CountryItem | null>(null);

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 flex flex-col relative overflow-hidden transition-all ${
      isMaximized ? 'h-full w-full border-none p-0 shadow-none' : 'p-5 shadow-sm h-[420px]'
    }`}>

      {/* ── Detail Panel ── */}
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
                <div className="w-10 h-7 rounded overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center bg-gray-50 shrink-0">
                  {getCountryIso(selected.country) ? (
                    <Image
                      src={`https://flagcdn.com/w40/${getCountryIso(selected.country)}.png`}
                      alt={getCountryFullName(selected.country)}
                      width={40} height={28}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Globe size={16} className="text-blue-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 truncate max-w-[160px]" title={getCountryFullName(selected.country)}>
                    {getCountryFullName(selected.country)}
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
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-emerald-50 rounded-xl p-3 flex flex-col items-center gap-1">
                <Building2 className="text-emerald-600 shrink-0" size={18} />
                <p className="text-xl font-extrabold text-gray-900">{selected.branches}</p>
                <p className="text-xs text-gray-500">Branches</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 flex flex-col items-center gap-1">
                <Plane className="text-purple-600 shrink-0" size={18} />
                <p className="text-xl font-extrabold text-gray-900">{selected.airports}</p>
                <p className="text-xs text-gray-500">Airports</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 flex flex-col items-center gap-1">
                <TrendingUp className="text-orange-500 shrink-0" size={18} />
                <p className="text-xl font-extrabold text-gray-900">{selected.bookings ?? 0}</p>
                <p className="text-xs text-gray-500">Bookings</p>
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50 p-2.5 rounded-xl">
            <Globe className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Countries & Locations</h3>
            <p className="text-xs text-gray-400 mt-0.5">Global coverage summary</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
            {totalCountries} Countries
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

      {/* Hero Stats */}
      <div className="space-y-1.5 mb-3 bg-gray-50 border border-gray-150 p-2.5 rounded-xl text-xs shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Building2 className="text-emerald-500 shrink-0" size={13} />
            <span className="text-gray-500 font-semibold">Total Branches:</span>
          </div>
          <span className="font-extrabold text-gray-900">{totalBranches.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200/60 pt-1.5">
          <div className="flex items-center gap-1.5">
            <Plane className="text-purple-500 shrink-0" size={13} />
            <span className="text-gray-500 font-semibold">Total Airports:</span>
          </div>
          <span className="font-extrabold text-gray-900">{totalAirports}</span>
        </div>
      </div>

      {/* Most Booked Badge */}
      {topBookingsCountry && (topBookingsCountry.bookings ?? 0) > 0 && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5 mb-3">
          <TrendingUp size={14} className="text-amber-700 shrink-0" />
          <span className="text-xs font-bold text-amber-800">Most Booked:</span>
          {getCountryIso(topBookingsCountry.country) && (
            <Image
              src={`https://flagcdn.com/w40/${getCountryIso(topBookingsCountry.country)}.png`}
              alt={getCountryFullName(topBookingsCountry.country)}
              width={24} height={16}
              className="w-6 h-auto rounded shadow-sm border border-amber-500/10 shrink-0"
            />
          )}
          <span className="text-xs font-black text-slate-800 truncate">{getCountryFullName(topBookingsCountry.country)}</span>
          <span className="ml-auto bg-amber-500/20 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-lg whitespace-nowrap">
            {topBookingsCountry.bookings} bookings
          </span>
        </div>
      )}

      <div className="border-t border-gray-100 mb-2" />

      {/* All Countries List */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
        <MapPin size={12} /> All Countries — <span className="normal-case font-normal text-gray-400">click to see details</span>
      </p>
      <div className="space-y-1 overflow-y-auto flex-1 min-h-0 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-250 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {list.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No data available</p>
        ) : (
          list.map((item, i) => (
            <button
              key={i}
              onClick={() => setSelected(item)}
              className="w-full flex items-center justify-between group hover:bg-blue-50/40 rounded-xl px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                {/* Rank number */}
                <span className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 transition-colors">
                  {i + 1}
                </span>
                {/* Country name */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
                  {getCountryIso(item.country) ? (
                    <Image
                      src={`https://flagcdn.com/w40/${getCountryIso(item.country)}.png`}
                      alt={getCountryFullName(item.country)}
                      width={24} height={16}
                      className="w-6 h-4 rounded-sm object-cover border border-gray-200 shadow-sm shrink-0"
                    />
                  ) : (
                    <Globe size={14} className="text-gray-300 shrink-0" />
                  )}
                  <span className="text-sm font-medium text-gray-750 text-left truncate" title={getCountryFullName(item.country)}>
                    {getCountryFullName(item.country)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Bookings badge */}
                {(item.bookings ?? 0) > 0 && (
                  <span className="bg-amber-500/10 text-amber-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-500/10 flex items-center gap-1">
                    <TrendingUp size={10} />{item.bookings}
                  </span>
                )}
                {/* Branches badge */}
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-100/50 flex items-center gap-1">
                  <Building2 size={10} />{item.branches}
                </span>
                {item.airports > 0 && (
                  <span className="bg-purple-50 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-purple-100/50 flex items-center gap-1">
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
