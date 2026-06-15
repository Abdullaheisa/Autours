"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Check, Pencil, X, Save } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export interface IncludedFeature {
  id: number;
  name: string;
}

export interface VehicleInclusion {
  id: number;
  name: string;
  image: string;
  country: string;
  supplier: string;
  branch: string;
  included: IncludedFeature[];
}

interface VehicleInclusionsTableProps {
  vehicles: VehicleInclusion[];
  allFeatures: IncludedFeature[];
  onSaveRow: (vehicleId: number, includedIds: number[]) => void;
  onClearFilters: () => void;
}

export default function VehicleInclusionsTable({
  vehicles,
  allFeatures,
  onSaveRow,
  onClearFilters,
}: VehicleInclusionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [editSelectedIds, setEditSelectedIds] = useState<Set<number>>(new Set());

  // Refs for double scrollbar synchronization
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const filteredVehicles = searchQuery
    ? vehicles.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : vehicles;

  // Synchronize scrolling
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
  }, [filteredVehicles]);

  const startEditing = (vehicle: VehicleInclusion) => {
    setEditingVehicleId(vehicle.id);
    setEditSelectedIds(new Set(vehicle.included.map((i) => i.id)));
  };

  const cancelEditing = () => {
    setEditingVehicleId(null);
    setEditSelectedIds(new Set());
  };

  const toggleEditFeature = (featureId: number) => {
    setEditSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(featureId)) {
        next.delete(featureId);
      } else {
        next.add(featureId);
      }
      return next;
    });
  };

  const handleSaveEdit = () => {
    if (editingVehicleId !== null) {
      onSaveRow(editingVehicleId, [...editSelectedIds]);
      setEditingVehicleId(null);
      setEditSelectedIds(new Set());
    }
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
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Vehicle Inclusions</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            View and edit inclusions per vehicle
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Type to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
          />
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <EmptyState
          title="No vehicles found"
          description="Try adjusting your search query"
          actionLabel="Clear search"
          onAction={() => setSearchQuery("")}
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
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Inclusions</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVehicles.map((vehicle) => {
                  const isEditing = editingVehicleId === vehicle.id;

                  return (
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
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{vehicle.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{vehicle.supplier}</p>
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
                        {isEditing ? (
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {allFeatures.map((f) => {
                              const isSelected = editSelectedIds.has(f.id);
                              return (
                                <button
                                  key={f.id}
                                  onClick={() => toggleEditFeature(f.id)}
                                  className={`
                                    inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer
                                    ${isSelected
                                      ? "bg-primary-50 text-primary-700 border-primary-300"
                                      : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"
                                    }
                                  `}
                                  title={f.name}
                                >
                                  {f.name}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {vehicle.included.length === 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 animate-pulse">
                                No Inclusions
                              </span>
                            ) : (
                              vehicle.included.map((inc) => (
                                <span
                                  key={inc.id}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  title={inc.name}
                                >
                                  {inc.name}
                                </span>
                              ))
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={handleSaveEdit}
                              className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors"
                              title="Save"
                            >
                              <Save size={14} className="text-emerald-600" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="w-8 h-8 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors"
                              title="Cancel"
                            >
                              <X size={14} className="text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(vehicle)}
                            className="w-8 h-8 bg-gray-100 hover:bg-primary-100 rounded-full flex items-center justify-center transition-colors group/btn mx-auto"
                            title="Edit inclusions"
                          >
                            <Pencil size={14} className="text-gray-400 group-hover/btn:text-primary-600" />
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
