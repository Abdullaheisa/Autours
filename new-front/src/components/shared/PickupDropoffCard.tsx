"use client";

import React, { useState } from "react";
import { MapPin, Clock, Phone, Building2 } from "lucide-react";
import { formatDate } from "@/utils/format";

export interface PickupDropoffCardProps {
  pickupDate?: string | null;
  pickupTime?: string | null;
  dropoffDate?: string | null;
  dropoffTime?: string | null;
  pickupBranch?: {
    id?: number | string;
    name?: string;
    city?: string;
    adresse?: string;
    country?: string;
    abriviation?: string;
    station_id?: string;
    phone?: string;
    opening_hours?: string;
    instructions?: string;
  } | null;
  dropoffBranch?: {
    id?: number | string;
    name?: string;
    city?: string;
    adresse?: string;
    country?: string;
    abriviation?: string;
    station_id?: string;
    phone?: string;
    opening_hours?: string;
    instructions?: string;
  } | null;
  fallbackLocation?: string;
  supplierName?: string;
}

function formatDateString(dateStr?: string | null, timeStr?: string | null): string {
  if (!dateStr) return "Select date";
  const formatted = formatDate(dateStr);
  if (!formatted) return `${dateStr} ${timeStr || ""}`.trim();
  return `${formatted} ${timeStr || "10:00"}`;
}

export default function PickupDropoffCard({
  pickupDate,
  pickupTime = "10:00",
  dropoffDate,
  dropoffTime = "10:00",
  pickupBranch,
  dropoffBranch,
  fallbackLocation = "Selected Location",
  supplierName,
}: PickupDropoffCardProps) {
  const [showPickupInstructions, setShowPickupInstructions] = useState(false);
  const [showDropoffInstructions, setShowDropoffInstructions] = useState(false);

  const pBranch = pickupBranch || dropoffBranch;
  const dBranch = dropoffBranch || pickupBranch;

  // Build accurate location labels
  const getBranchLabel = (b: typeof pBranch) => {
    if (!b) return fallbackLocation;
    const parts: string[] = [];
    if (b.name) parts.push(b.name);
    else if (b.city) parts.push(b.city);
    else parts.push(fallbackLocation);

    const code = b.abriviation || b.station_id;
    if (code && !parts[0]?.includes(code)) {
      return `${parts[0]} (${code})`;
    }
    return parts[0] || fallbackLocation;
  };

  const pickupLocationLabel = getBranchLabel(pBranch);
  const dropoffLocationLabel = getBranchLabel(dBranch);

  const formattedPickup = formatDateString(pickupDate, pickupTime);
  const formattedDropoff = formatDateString(dropoffDate, dropoffTime);

  const handleOpenMap = (branch: any, label: string) => {
    const query = branch?.adresse
      ? `${branch.name || ""} ${branch.adresse} ${branch.city || ""} ${branch.country || ""}`.trim()
      : label;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden p-5 sm:p-6 transition-all">
      <h3 className="text-[16px] sm:text-[17px] font-bold text-gray-900 tracking-tight mb-5">
        Pick-up and drop-off
      </h3>

      <div className="space-y-6 relative">
        {/* ── PICK-UP ITEM ── */}
        <div className="relative flex items-start gap-3.5">
          {/* Vertical continuous line extending to drop-off dot */}
          <span
            className="absolute left-[4.5px] top-3.5 -bottom-6 w-[1.5px] bg-slate-200 pointer-events-none"
            aria-hidden="true"
          />

          {/* Slate Dot */}
          <span className="relative z-10 w-2.5 h-2.5 rounded-full bg-slate-400 mt-1.5 shrink-0 ring-4 ring-white" />

          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Relative container with right padding so text never touches the icon badge */}
            <div className="relative pr-11">
              <p className="text-sm font-medium text-gray-800 leading-tight">
                {formattedPickup}
              </p>
              <button
                type="button"
                onClick={() => handleOpenMap(pBranch, pickupLocationLabel)}
                className="text-left text-sm font-bold text-gray-900 mt-1 block break-words whitespace-normal leading-snug hover:text-amber-700 transition-colors cursor-pointer"
                title="Click to view on Google Maps"
              >
                {pickupLocationLabel}
              </button>
              <button
                type="button"
                onClick={() => setShowPickupInstructions(!showPickupInstructions)}
                className="mt-1 text-xs sm:text-[13px] font-semibold text-amber-600 hover:text-amber-700 transition-colors inline-block cursor-pointer"
              >
                {showPickupInstructions ? "Hide pick-up instructions" : "View pick-up instructions"}
              </button>

              {/* Pin Badge: Raised up to the top right corner! */}
              <button
                type="button"
                onClick={() => handleOpenMap(pBranch, pickupLocationLabel)}
                className="absolute top-0 right-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50/90 border border-amber-200/60 text-amber-700 hover:bg-primary hover:text-gray-950 hover:border-primary transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-2xs group"
                title="View on Google Maps"
                aria-label="View on Google Maps"
              >
                <MapPin size={15} className="stroke-[2.2] group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Collapsible Pickup Details */}
            {showPickupInstructions && (
              <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs text-gray-700 space-y-2 animate-in fade-in duration-150">
                {pBranch?.adresse && (
                  <div className="flex items-start gap-2">
                    <Building2 size={13} className="shrink-0 text-amber-600 mt-0.5" />
                    <span><strong className="text-gray-900">Address:</strong> {pBranch.adresse}{pBranch.city ? `, ${pBranch.city}` : ""}{pBranch.country ? ` (${pBranch.country})` : ""}</span>
                  </div>
                )}
                {supplierName && (
                  <div className="flex items-center gap-2">
                    <Building2 size={13} className="shrink-0 text-amber-600" />
                    <span><strong className="text-gray-900">Provider:</strong> {supplierName}</span>
                  </div>
                )}
                {pBranch?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="shrink-0 text-amber-600" />
                    <span><strong className="text-gray-900">Desk Phone:</strong> {pBranch.phone}</span>
                  </div>
                )}
                {pBranch?.opening_hours && (
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="shrink-0 text-amber-600" />
                    <span><strong className="text-gray-900">Hours:</strong> {pBranch.opening_hours}</span>
                  </div>
                )}
                <div className="text-[11px] text-gray-600 pt-1.5 border-t border-amber-200/40 leading-relaxed">
                  {pBranch?.instructions ||
                    "Please proceed directly to the rental counter upon arrival with your voucher, passport, and driving license."}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── DROP-OFF ITEM ── */}
        <div className="relative flex items-start gap-3.5">
          {/* Slate Dot */}
          <span className="relative z-10 w-2.5 h-2.5 rounded-full bg-slate-400 mt-1.5 shrink-0 ring-4 ring-white" />

          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Relative container with right padding so text never touches the icon badge */}
            <div className="relative pr-11">
              <p className="text-sm font-medium text-gray-800 leading-tight">
                {formattedDropoff}
              </p>
              <button
                type="button"
                onClick={() => handleOpenMap(dBranch, dropoffLocationLabel)}
                className="text-left text-sm font-bold text-gray-900 mt-1 block break-words whitespace-normal leading-snug hover:text-amber-700 transition-colors cursor-pointer"
                title="Click to view on Google Maps"
              >
                {dropoffLocationLabel}
              </button>
              <button
                type="button"
                onClick={() => setShowDropoffInstructions(!showDropoffInstructions)}
                className="mt-1 text-xs sm:text-[13px] font-semibold text-amber-600 hover:text-amber-700 transition-colors inline-block cursor-pointer"
              >
                {showDropoffInstructions ? "Hide drop-off instructions" : "View drop-off instructions"}
              </button>

              {/* Pin Badge: Raised up to the top right corner! */}
              <button
                type="button"
                onClick={() => handleOpenMap(dBranch, dropoffLocationLabel)}
                className="absolute top-0 right-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50/90 border border-amber-200/60 text-amber-700 hover:bg-primary hover:text-gray-950 hover:border-primary transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-2xs group"
                title="View on Google Maps"
                aria-label="View on Google Maps"
              >
                <MapPin size={15} className="stroke-[2.2] group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Collapsible Dropoff Details */}
            {showDropoffInstructions && (
              <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs text-gray-700 space-y-2 animate-in fade-in duration-150">
                {dBranch?.adresse && (
                  <div className="flex items-start gap-2">
                    <Building2 size={13} className="shrink-0 text-amber-600 mt-0.5" />
                    <span><strong className="text-gray-900">Address:</strong> {dBranch.adresse}{dBranch.city ? `, ${dBranch.city}` : ""}</span>
                  </div>
                )}
                {dBranch?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="shrink-0 text-amber-600" />
                    <span><strong className="text-gray-900">Contact:</strong> {dBranch.phone}</span>
                  </div>
                )}
                <div className="text-[11px] text-gray-600 pt-1.5 border-t border-amber-200/40 leading-relaxed">
                  {dBranch?.instructions ||
                    "Return the vehicle with the same fuel level as picked up and hand over the keys at the designated returns booth."}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
