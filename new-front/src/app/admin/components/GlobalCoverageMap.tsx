"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Building2, Plane, RotateCcw, ShieldCheck, Navigation, Compass, MapPin } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { MapCountryMarker, MapBranchPin } from "@/store/slices/dashboardSlice";
import { getCountryFlag, getCountryFullName } from "@/utils/countryUtils";

// ─── Fallback hardcoded data (used only when API returns NO map_data) ──────────
const FALLBACK_MAP_DATA: MapCountryMarker[] = [
  {
    country: "United Arab Emirates",
    lat: 25.2048, lng: 55.2708,
    branches_count: 472, airports_count: 12,
    pins: [
      { id: "b1", name: "Dubai International Airport (DXB)", type: "Airport", lat: 25.2532, lng: 55.3644 },
      { id: "b2", name: "Dubai Downtown Office",              type: "Downtown", lat: 25.1972, lng: 55.2744 },
      { id: "b3", name: "Abu Dhabi Central Branch",          type: "Office",   lat: 24.4539, lng: 54.3773 },
    ],
  },
  {
    country: "Egypt",
    lat: 30.0444, lng: 31.2357,
    branches_count: 85, airports_count: 6,
    pins: [
      { id: "b5", name: "Cairo International Airport (CAI)", type: "Airport",  lat: 30.1219, lng: 31.4065 },
      { id: "b6", name: "Cairo Downtown Branch",             type: "Downtown", lat: 30.0444, lng: 31.2357 },
    ],
  },
  {
    country: "Saudi Arabia",
    lat: 24.7136, lng: 46.6753,
    branches_count: 120, airports_count: 8,
    pins: [
      { id: "b_sa1", name: "Riyadh King Khalid Airport (RUH)", type: "Airport", lat: 24.9576, lng: 46.6988 },
    ],
  },
  {
    country: "Kuwait",
    lat: 29.3759, lng: 47.9774,
    branches_count: 45, airports_count: 3,
    pins: [
      { id: "b_kw1", name: "Kuwait International Airport (KWI)", type: "Airport", lat: 29.2267, lng: 47.9689 },
    ],
  },
  {
    country: "Qatar",
    lat: 25.2854, lng: 51.5310,
    branches_count: 60, airports_count: 4,
    pins: [
      { id: "b_qa1", name: "Hamad International Airport (DOH)", type: "Airport", lat: 25.2609, lng: 51.6138 },
    ],
  },
  {
    country: "Turkey",
    lat: 41.0082, lng: 28.9784,
    branches_count: 403, airports_count: 18,
    pins: [
      { id: "b8", name: "Istanbul Airport (IST)", type: "Airport", lat: 41.2753, lng: 28.7419 },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function GlobalCoverageMap() {
  const { rawData } = useSelector((state: RootState) => state.dashboard);
  const statsData    = rawData?.countryLocationsStats || rawData?.country_locations_stats;

  const totalCountries = statsData?.total_countries ?? 115;
  const totalBranches  = statsData?.total_branches  ?? 1831;

  // Use real API data; fall back to hardcoded only when API returns nothing
  const apiMapData   = (rawData?.mapData ?? []) as MapCountryMarker[];
  const activeData   = apiMapData.length > 0 ? apiMapData : FALLBACK_MAP_DATA;
  const isLiveData   = apiMapData.length > 0;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<L.Map | null>(null);
  const countryMarkersRef = useRef<L.Marker[]>([]);
  const branchMarkersRef  = useRef<L.Marker[]>([]);

  const [currentZoom, setCurrentZoom]     = useState(2.5);
  const [hoveredBranch, setHoveredBranch] = useState<MapBranchPin | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string>("");

  // Build markers whenever activeData changes (or on first mount)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // ── Init map once ──
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [30, 20],
        zoom: 2.5,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    // ── Clear old markers ──
    countryMarkersRef.current.forEach((m) => map.removeLayer(m));
    branchMarkersRef.current.forEach((m)  => map.removeLayer(m));
    countryMarkersRef.current = [];
    branchMarkersRef.current  = [];

    // ── 1. Country markers ──
    activeData.forEach((dest) => {
      const fullName = getCountryFullName(dest.country);
      const flag     = getCountryFlag(fullName);
      const count    = dest.branches_count;

      const customIcon = L.divIcon({
        className: "custom-leaflet-country-icon",
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%); cursor: pointer">
            <div style="background: white; color: #0f172a; padding: 6px 14px; border-radius: 20px; border: 2px solid #2563eb; font-size: 12px; font-weight: 800; display: flex; align-items: center; gap: 6px; box-shadow: 0 8px 25px rgba(0,0,0,0.25); white-space: nowrap;">
              <span style="font-size:16px">${flag}</span>
              <span style="color:#0f172a; font-family: system-ui, sans-serif; font-size:13px">${fullName}</span>
              <span style="background: #2563eb; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight:800">${count}</span>
            </div>
            <div style="width: 12px; height: 12px; background: #ef4444; border: 2px solid white; border-radius: 50%; margin-top: 4px; box-shadow: 0 0 10px #ef4444"></div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([dest.lat, dest.lng], { icon: customIcon }).addTo(map);

      const el = marker.getElement();
      if (el) {
        el.onclick = (e) => {
          e.stopPropagation();
          mapRef.current?.setView([dest.lat, dest.lng], 6, { animate: true });
        };
      }

      countryMarkersRef.current.push(marker);
    });

    // ── 2. Branch (pin) markers ──
    activeData.forEach((dest) => {
      (dest.pins ?? []).forEach((b) => {
        // Skip pins without valid coords (extra safety on frontend)
        if (!b.lat || !b.lng) return;

        const customIcon = L.divIcon({
          className: "custom-leaflet-branch-icon",
          html: `
            <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%); cursor: pointer">
              <div style="background: #0f172a; color: white; padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); font-size: 11px; font-weight: 700; white-space: nowrap; margin-bottom: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.3)">
                ${b.name}
              </div>
              <div style="background: #ef4444; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 12px rgba(239,68,68,0.4); font-size: 13px">
                📍
              </div>
            </div>
          `,
          iconSize: [0, 0],
        });

        const marker = L.marker([b.lat, b.lng], { icon: customIcon });

        marker.on("mouseover", () => { setHoveredBranch(b); setHoveredCountry(dest.country); });
        marker.on("mouseout",  () => { setHoveredBranch(null); setHoveredCountry(""); });

        branchMarkersRef.current.push(marker);
      });
    });

    // ── 3. Zoom handler ──
    const handleZoom = () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);

      if (zoom >= 4.8) {
        countryMarkersRef.current.forEach((m) => map.removeLayer(m));
        branchMarkersRef.current.forEach((m) => { if (!map.hasLayer(m)) map.addLayer(m); });
      } else {
        branchMarkersRef.current.forEach((m) => map.removeLayer(m));
        countryMarkersRef.current.forEach((m) => { if (!map.hasLayer(m)) map.addLayer(m); });
      }
    };

    // Remove old zoom listener before re-attaching
    map.off("zoomend");
    map.on("zoomend", handleZoom);
    handleZoom();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeData]);

  const handleReset = () => {
    mapRef.current?.setView([30, 20], 2.5, { animate: true });
  };

  return (
    <div className="bg-white text-gray-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200 relative overflow-hidden flex flex-col gap-4">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 flex items-center justify-center shadow-xs">
              <Compass size={22} className="animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                Dynamic Auto-Zoom Coverage Map <ShieldCheck size={18} className="text-blue-600 fill-blue-50" />
              </h3>
              <p className="text-xs text-gray-500 flex items-center gap-2">
                {currentZoom >= 4.8
                  ? "Zoomed in: Displaying individual branch location pins automatically"
                  : "Zoomed out: Displaying contracted country pins (zoom in to reveal branch locations)"}
                {/* Live / Fallback badge */}
                {isLiveData ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Live Data
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
                    Sample Data
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Top Badges & Reset Button */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
            <Navigation size={14} className="text-blue-600" />
            <span className="text-xs font-extrabold text-blue-900">{totalCountries} Countries</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
            <Building2 size={14} className="text-emerald-600" />
            <span className="text-xs font-extrabold text-emerald-900">{totalBranches.toLocaleString()} Branches</span>
          </div>

          {currentZoom >= 4.8 && (
            <button
              onClick={handleReset}
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow cursor-pointer"
            >
              <RotateCcw size={14} /> Reset Zoom
            </button>
          )}
        </div>
      </div>

      {/* ── Leaflet Map Container ── */}
      <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] rounded-2xl overflow-hidden border border-gray-300 shadow-inner bg-[#aadaff]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Brand Footer Badge */}
        <div className="absolute bottom-3 right-3 z-30 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-md">
          <span className="font-extrabold text-blue-600">AutoUrs</span> Voyager Maps
        </div>

        {/* Hovered Branch Popup */}
        {hoveredBranch && (
          <div className="absolute bottom-4 left-4 z-40 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-3.5 shadow-xl max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{getCountryFlag(getCountryFullName(hoveredCountry))}</span>
              <span className="text-xs font-bold text-gray-900">{getCountryFullName(hoveredCountry)} Branch</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 text-[11px] text-blue-900 flex items-center gap-1.5 mt-1">
              <MapPin size={12} className="shrink-0 text-blue-600 fill-blue-600" />
              <span className="truncate font-bold">{hoveredBranch.name}</span>
            </div>
            {hoveredBranch.type && (
              <div className="mt-1.5 flex items-center gap-1">
                <Plane size={10} className="text-gray-400" />
                <span className="text-[10px] text-gray-500 font-medium">{hoveredBranch.type}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
