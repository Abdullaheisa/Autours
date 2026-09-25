"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Save } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export interface VehicleProfit {
  id: number;
  name: string;
  image: string;
  country: string;
  supplier: string;
  branch: string;
  currency?: string;
  basePrice: number;
  baseWeekPrice?: number;
  baseMonthPrice?: number;
  profit1_2: number;
  profit3_7: number;
  profit8_30: number;
  profitWeekend: number;
  discountPercent: number;
  isSaved: boolean;
  hasMargin?: boolean;
}

interface VehicleProfitTableProps {
  vehicles: VehicleProfit[];
  onUpdateVehicle: (id: number, field: keyof Omit<VehicleProfit, "id" | "name" | "image" | "country" | "supplier" | "branch" | "currency" | "basePrice" | "baseWeekPrice" | "baseMonthPrice" | "isSaved" | "hasMargin">, value: string) => void;
  onSaveRow: (id: number) => void;
  onClearFilters: () => void;
}

type PreviewTier = '1-2' | '3-7' | '8-30' | 'weekend';

export default function VehicleProfitTable({
  vehicles,
  onUpdateVehicle,
  onSaveRow,
  onClearFilters,
}: VehicleProfitTableProps) {
  const [previewTier, setPreviewTier] = useState<PreviewTier>('1-2');

  // Refs for double scrollbar synchronization
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const paginatedVehicles = vehicles;

  useEffect(() => {
    const topScroll = topScrollRef.current;
    const tableScroll = tableScrollRef.current;
    if (!topScroll || !tableScroll) return;

    let isSyncingTop = false;
    let isSyncingTable = false;

    const handleTopScroll = () => {
      if (!isSyncingTable) {
        isSyncingTop = true;
        tableScroll.scrollLeft = topScroll.scrollLeft;
      }
      isSyncingTable = false;
    };

    const handleTableScroll = () => {
      if (!isSyncingTop) {
        isSyncingTable = true;
        topScroll.scrollLeft = tableScroll.scrollLeft;
      }
      isSyncingTable = false;
    };

    topScroll.addEventListener("scroll", handleTopScroll);
    tableScroll.addEventListener("scroll", handleTableScroll);

    return () => {
      topScroll.removeEventListener("scroll", handleTopScroll);
      tableScroll.removeEventListener("scroll", handleTableScroll);
    };
  }, [paginatedVehicles]);

  if (vehicles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <EmptyState
          title="No vehicles found"
          description="Try adjusting your filters or search query"
          actionLabel="Clear all filters"
          onAction={onClearFilters}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header with Pricing Tier Selector */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            Vehicle Pricing & Margins
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure individual vehicle profit rates and promotional discounts
          </p>
        </div>

        {/* Pricing Tier Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-semibold text-gray-500 hidden sm:inline-block">
            Price Preview:
          </span>
          <div className="inline-flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button
              onClick={() => setPreviewTier('1-2')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                previewTier === '1-2'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daily (1-2d)
            </button>
            <button
              onClick={() => setPreviewTier('3-7')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                previewTier === '3-7'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weekly (3-7d)
            </button>
            <button
              onClick={() => setPreviewTier('8-30')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                previewTier === '8-30'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly (8-30d)
            </button>
            <button
              onClick={() => setPreviewTier('weekend')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                previewTier === 'weekend'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weekend
            </button>
          </div>
        </div>
      </div>

      <>
        {/* Top Mirror Scrollbar */}
        <div ref={topScrollRef} className="overflow-x-auto overflow-y-hidden border-b border-gray-100" style={{ height: '12px' }}>
          <div style={{ width: '1350px', height: '1px' }}></div>
        </div>

        <div ref={tableScrollRef} className="overflow-x-auto">
          <table className="w-full min-w-[1350px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="text-left px-3 sm:px-4 py-3.5 w-20">Photo</th>
                <th className="text-left px-3 sm:px-4 py-3.5 min-w-[190px]">Vehicle & Supplier</th>
                <th className="text-left px-3 sm:px-4 py-3.5 hidden md:table-cell">Location</th>
                <th className="text-center px-3 sm:px-4 py-3.5 bg-gray-100/60">
                  Base Price
                  <span className="block text-[10px] font-normal text-gray-400 capitalize">
                    {previewTier === '1-2' ? 'Daily' : previewTier === '3-7' ? 'Weekly Rate' : previewTier === '8-30' ? 'Monthly Rate' : 'Weekend'}
                  </span>
                </th>
                <th className={`text-center px-2 py-3.5 transition-colors ${previewTier === '1-2' ? 'bg-blue-50 text-blue-700 font-extrabold' : ''}`}>
                  1-2 Days
                </th>
                <th className={`text-center px-2 py-3.5 transition-colors ${previewTier === '3-7' ? 'bg-blue-50 text-blue-700 font-extrabold' : ''}`}>
                  3-7 Days
                </th>
                <th className={`text-center px-2 py-3.5 transition-colors ${previewTier === '8-30' ? 'bg-blue-50 text-blue-700 font-extrabold' : ''}`}>
                  8-30 Days
                </th>
                <th className={`text-center px-2 py-3.5 transition-colors ${previewTier === 'weekend' ? 'bg-blue-50 text-blue-700 font-extrabold' : ''}`}>
                  Weekend
                </th>
                <th className="text-center px-3 sm:px-4 py-3.5 bg-amber-50 text-amber-700">
                  Discount
                </th>
                <th className="text-center px-3 sm:px-4 py-3.5 bg-gray-50 text-gray-700">
                  Pre-Discount
                  <span className="block text-[10px] font-normal text-gray-400 capitalize">Base + Profit</span>
                </th>
                <th className="text-center px-3 sm:px-4 py-3.5 bg-emerald-50 text-emerald-800">
                  Post-Discount
                  <span className="block text-[10px] font-normal text-emerald-600 capitalize">Final Bookable</span>
                </th>
                <th className="text-center px-3 sm:px-4 py-3.5 w-16">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedVehicles.map((vehicle) => {
                let base = Number(vehicle.basePrice) || 0;
                let activeProfit = Number(vehicle.profit1_2) || 0;
                if (previewTier === '3-7') {
                  base = Number(vehicle.baseWeekPrice) || base;
                  activeProfit = Number(vehicle.profit3_7) || 0;
                } else if (previewTier === '8-30') {
                  base = Number(vehicle.baseMonthPrice) || base;
                  activeProfit = Number(vehicle.profit8_30) || 0;
                } else if (previewTier === 'weekend') {
                  activeProfit = Number(vehicle.profitWeekend) || 0;
                }

                const discount = Number(vehicle.discountPercent) || 0;
                const priceBefore = base > 0 ? (base * (1 + activeProfit / 100)) : 0;
                const priceAfter = discount > 0 && discount < 100 ? (priceBefore * (1 - discount / 100)) : priceBefore;
                const cur = vehicle.currency || "USD";

                return (
                  <tr key={vehicle.id} className="hover:bg-gray-50/60 transition-colors group">
                    {/* Photo */}
                    <td className="px-3 sm:px-4 py-3">
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200/60 shrink-0">
                        <img
                          src={vehicle.image || undefined}
                          alt={vehicle.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    </td>

                    {/* Vehicle & Supplier */}
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">{vehicle.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{vehicle.supplier}</p>
                        </div>
                        {vehicle.hasMargin === false && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 animate-pulse shrink-0">
                            New
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium w-fit">
                          {vehicle.country}
                        </span>
                        <span className="text-[11px] text-gray-500 truncate max-w-[130px]" title={vehicle.branch}>
                          {vehicle.branch}
                        </span>
                      </div>
                    </td>

                    {/* Base Price */}
                    <td className="px-3 sm:px-4 py-3 text-center bg-gray-50/40">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-900 tracking-tight">
                          {base > 0 ? base.toFixed(2) : "0.00"}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400 uppercase">{cur}</span>
                      </div>
                    </td>

                    {/* Profit 1-2 Days */}
                    <td className={`px-2 py-3 transition-colors ${previewTier === '1-2' ? 'bg-blue-50/40' : ''}`}>
                      <div className="relative w-14 mx-auto">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={vehicle.profit1_2}
                          onChange={(e) => onUpdateVehicle(vehicle.id, "profit1_2", e.target.value)}
                          className={`w-full pl-1 pr-4 py-1.5 rounded-lg text-xs text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            previewTier === '1-2' ? 'bg-white border-2 border-blue-400 text-blue-900' : 'bg-gray-50 border border-gray-200 text-gray-800'
                          }`}
                        />
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">%</span>
                      </div>
                    </td>

                    {/* Profit 3-7 Days */}
                    <td className={`px-2 py-3 transition-colors ${previewTier === '3-7' ? 'bg-blue-50/40' : ''}`}>
                      <div className="relative w-14 mx-auto">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={vehicle.profit3_7}
                          onChange={(e) => onUpdateVehicle(vehicle.id, "profit3_7", e.target.value)}
                          className={`w-full pl-1 pr-4 py-1.5 rounded-lg text-xs text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            previewTier === '3-7' ? 'bg-white border-2 border-blue-400 text-blue-900' : 'bg-gray-50 border border-gray-200 text-gray-800'
                          }`}
                        />
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">%</span>
                      </div>
                    </td>

                    {/* Profit 8-30 Days */}
                    <td className={`px-2 py-3 transition-colors ${previewTier === '8-30' ? 'bg-blue-50/40' : ''}`}>
                      <div className="relative w-14 mx-auto">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={vehicle.profit8_30}
                          onChange={(e) => onUpdateVehicle(vehicle.id, "profit8_30", e.target.value)}
                          className={`w-full pl-1 pr-4 py-1.5 rounded-lg text-xs text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            previewTier === '8-30' ? 'bg-white border-2 border-blue-400 text-blue-900' : 'bg-gray-50 border border-gray-200 text-gray-800'
                          }`}
                        />
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">%</span>
                      </div>
                    </td>

                    {/* Profit Weekend */}
                    <td className={`px-2 py-3 transition-colors ${previewTier === 'weekend' ? 'bg-blue-50/40' : ''}`}>
                      <div className="relative w-14 mx-auto">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={vehicle.profitWeekend}
                          onChange={(e) => onUpdateVehicle(vehicle.id, "profitWeekend", e.target.value)}
                          className={`w-full pl-1 pr-4 py-1.5 rounded-lg text-xs text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            previewTier === 'weekend' ? 'bg-white border-2 border-blue-400 text-blue-900' : 'bg-gray-50 border border-gray-200 text-gray-800'
                          }`}
                        />
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">%</span>
                      </div>
                    </td>

                    {/* Discount Input */}
                    <td className="px-3 sm:px-4 py-3 bg-amber-50/50">
                      <div className="relative w-16 mx-auto">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={vehicle.discountPercent}
                          onChange={(e) => onUpdateVehicle(vehicle.id, "discountPercent", e.target.value)}
                          placeholder="0"
                          className="w-full pl-1.5 pr-5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-center font-bold text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs transition-all"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-amber-600 text-xs font-bold">%</span>
                      </div>
                    </td>

                    {/* Pre-Discount Price */}
                    <td className="px-3 sm:px-4 py-3 text-center bg-gray-50/20">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-sm font-semibold tracking-tight ${discount > 0 ? "line-through text-gray-400" : "text-gray-900"}`}>
                          {priceBefore > 0 ? priceBefore.toFixed(2) : "0.00"}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase">{cur}</span>
                      </div>
                    </td>

                    {/* Post-Discount Price */}
                    <td className="px-3 sm:px-4 py-3 text-center bg-emerald-50/40">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-sm font-extrabold tracking-tight ${discount > 0 ? "text-emerald-600" : "text-gray-800"}`}>
                          {priceAfter > 0 ? priceAfter.toFixed(2) : "0.00"}
                        </span>
                        {discount > 0 ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.2 rounded-full">
                            -{discount}%
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 uppercase">{cur}</span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-3 sm:px-4 py-3 text-center">
                      {vehicle.isSaved ? (
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto" title="Saved">
                          <Check size={16} className="text-emerald-600" />
                        </div>
                      ) : (
                        <button
                          onClick={() => onSaveRow(vehicle.id)}
                          className="w-8 h-8 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 rounded-full flex items-center justify-center transition-all group/btn mx-auto shadow-xs cursor-pointer"
                          title="Save this vehicle"
                        >
                          <Save size={14} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing <strong className="text-gray-900">{paginatedVehicles.length}</strong> vehicle(s)
          </span>
          <span className="text-gray-400 hidden sm:inline-block">
            Prices previewed for: <strong className="text-gray-700 capitalize">{previewTier === '1-2' ? 'Daily (1-2 days)' : previewTier === '3-7' ? 'Weekly (3-7 days)' : previewTier === '8-30' ? 'Monthly (8-30 days)' : 'Weekend'}</strong>
          </span>
        </div>
      </>
    </div>
  );
}
