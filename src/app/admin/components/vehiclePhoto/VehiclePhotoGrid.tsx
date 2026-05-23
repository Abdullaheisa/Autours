"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { VehiclePhoto } from "@/lib/data";
import VehiclePhotoCard from "./VehiclePhotoCard";
import EmptyState from "@/components/ui/EmptyState";

interface VehiclePhotoGridProps {
  vehicles: VehiclePhoto[];
  onDelete: (id: number) => void;
}

export default function VehiclePhotoGrid({ vehicles, onDelete }: VehiclePhotoGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = ["All", ...Array.from(new Set(vehicles.map((v) => v.category)))];

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        searchQuery === "" ||
        vehicle.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || vehicle.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [vehicles, searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const activeFiltersCount = [
    selectedCategory !== "All",
    searchQuery !== "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 lg:p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Desktop Category Filter */}
          <div className="hidden md:block relative w-44">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
              ))}
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl border border-gray-200"
            >
              <SlidersHorizontal size={16} />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100 space-y-3">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-900">{filteredVehicles.length}</span> of{" "}
          <span className="font-medium text-gray-900">{vehicles.length}</span> vehicles
        </p>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filteredVehicles.length === 0 ? (
        <EmptyState
          title="No vehicles found"
          description="Try adjusting your search or filter"
          actionLabel="Clear all"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredVehicles.map((vehicle) => (
            <VehiclePhotoCard
              key={vehicle.id}
              vehicle={vehicle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
