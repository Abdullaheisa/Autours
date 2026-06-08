"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Check, Save } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";

export interface VehicleProfit {
  id: number;
  name: string;
  image: string;
  country: string;
  supplier: string;
  branch: string;
  profit1_2: number;
  profit3_7: number;
  profit8_30: number;
  profitWeekend: number;
  isSaved: boolean;
  hasMargin?: boolean;
}

interface VehicleProfitTableProps {
  vehicles: VehicleProfit[];
  onUpdateVehicle: (id: number, field: keyof Omit<VehicleProfit, "id" | "name" | "image" | "country" | "supplier" | "branch" | "isSaved">, value: string) => void;
  onSaveRow: (id: number) => void;
  onClearFilters: () => void;
}

export default function VehicleProfitTable({
  vehicles,
  onUpdateVehicle,
  onSaveRow,
  onClearFilters,
}: VehicleProfitTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Refs for double scrollbar synchronization
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  // Filter by search
  const filteredVehicles = useMemo(() => {
    if (!searchQuery) return vehicles;
    const query = searchQuery.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        v.supplier.toLowerCase().includes(query) ||
        v.branch.toLowerCase().includes(query) ||
        v.country.toLowerCase().includes(query)
    );
  }, [vehicles, searchQuery]);

  // Use all filtered vehicles without slicing (pagination is handled by the parent)
  const paginatedVehicles = filteredVehicles;

  // Synchronize scrolling of top mirror scrollbar with main table scrollbar
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
      isSyncingTop = false;
    };

    topScroll.addEventListener("scroll", handleTopScroll);
    tableScroll.addEventListener("scroll", handleTableScroll);

    return () => {
      topScroll.removeEventListener("scroll", handleTopScroll);
      tableScroll.removeEventListener("scroll", handleTableScroll);
    };
  }, [paginatedVehicles]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  if (vehicles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <EmptyState
          title="No vehicles found"
          description="Try adjusting your filters"
          actionLabel="Clear all filters"
          onAction={onClearFilters}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Vehicle Profit Margins</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage individual vehicle pricing rules
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Type to search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
          />
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <EmptyState
          title="No vehicles found"
          description="Try adjusting your search query"
          actionLabel="Clear search"
          onAction={() => handleSearchChange("")}
        />
      ) : (
        <>
          {/* Top Mirror Scrollbar */}
          <div ref={topScrollRef} className="overflow-x-auto overflow-y-hidden border-b border-gray-100" style={{ height: '12px' }}>
            <div style={{ width: '900px', height: '1px' }}></div>
          </div>
          <div ref={tableScrollRef} className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 w-28">Photo</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Vehicle</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 hidden md:table-cell">Country</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 hidden lg:table-cell">Branch</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 text-center">1-2 days</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 text-center">3-7 days</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 text-center">8-30 days</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 text-center">Weekend</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 w-16 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 sm:px-5 py-3">
                      <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={vehicle.image || undefined}
                          alt={vehicle.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{vehicle.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{vehicle.supplier}</p>
                        </div>
                        {vehicle.hasMargin === false && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 animate-pulse shrink-0">
                            New / No Margin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                        {vehicle.country}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-600 truncate max-w-[150px] block">
                        {vehicle.branch}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <div className="relative w-16 mx-auto">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={vehicle.profit1_2}
                          onChange={(e) => onUpdateVehicle(vehicle.id, "profit1_2", e.target.value)}
                          className="w-full pl-2 pr-6 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <div className="relative w-16 mx-auto">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={vehicle.profit3_7}
                          onChange={(e) => onUpdateVehicle(vehicle.id, "profit3_7", e.target.value)}
                          className="w-full pl-2 pr-6 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <div className="relative w-16 mx-auto">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={vehicle.profit8_30}
                          onChange={(e) => onUpdateVehicle(vehicle.id, "profit8_30", e.target.value)}
                          className="w-full pl-2 pr-6 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <div className="relative w-16 mx-auto">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={vehicle.profitWeekend}
                          onChange={(e) => onUpdateVehicle(vehicle.id, "profitWeekend", e.target.value)}
                          className="w-full pl-2 pr-6 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-center">
                      {vehicle.isSaved ? (
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto" title="Saved">
                          <Check size={16} className="text-emerald-600" />
                        </div>
                      ) : (
                        <button
                          onClick={() => onSaveRow(vehicle.id)}
                          className="w-8 h-8 bg-gray-100 hover:bg-primary-100 rounded-full flex items-center justify-center transition-colors group/btn mx-auto"
                          title="Save changes"
                        >
                          <Save size={14} className="text-gray-400 group-hover/btn:text-primary-600" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-5 lg:px-6 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium text-gray-900">{filteredVehicles.length}</span> vehicle(s)
            </p>
          </div>
        </>
      )}
    </div>
  );
}
