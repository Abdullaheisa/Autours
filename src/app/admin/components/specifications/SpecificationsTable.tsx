"use client";

import { useState, useMemo } from "react";
import {
  Search, Pencil, Trash2, X, Settings2, Gauge, Fuel, Users, Briefcase,
  Car, Wind, DoorOpen, Luggage, Palette, Cog, Sparkles, CheckCircle2
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export interface Specification {
  id: number;
  name: string;
  key?: string;
  options: string[];
  icon: string;
}

// Map icon names to Lucide components
const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  // Core icons
  Gauge, Fuel, Users, Briefcase, Settings2, Car, Wind, DoorOpen, Luggage,
  // Additional icons for specs
  Palette, Cog, Sparkles, CheckCircle2,
};

// Map emoji/icon identifiers to Lucide icon names
const iconNameMap: Record<string, string> = {
  "🎨": "Palette",
  "⚙️": "Cog",
  "🚪": "DoorOpen",
  "👥": "Users",
  "⛽": "Fuel",
  "🆕": "Sparkles",
  // Fallback mappings
  "Color": "Palette",
  "Gearbox": "Cog",
  "Doors": "DoorOpen",
  "Seats": "Users",
  "Fuel": "Fuel",
  "Fuel Type": "Fuel",
  "Condition": "Sparkles",
  "Air Conditioner": "Wind",
  "Suitcase": "Luggage",
  "Transmission": "Settings2",
};

interface SpecificationsTableProps {
  specifications: Specification[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

function getIconComponent(iconName: string): React.ComponentType<{ size?: number; className?: string }> {
  // Try direct lookup first
  if (iconMap[iconName]) return iconMap[iconName];
  // Try emoji mapping
  if (iconNameMap[iconName]) {
    const mapped = iconMap[iconNameMap[iconName]];
    if (mapped) return mapped;
  }
  // Default fallback
  return Settings2;
}

export default function SpecificationsTable({ specifications, onEdit, onDelete }: SpecificationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpecs = useMemo(() => {
    if (!searchQuery) return specifications;
    const query = searchQuery.toLowerCase();
    return specifications.filter(
      (spec) =>
        spec.name.toLowerCase().includes(query) ||
        spec.options.some((opt) => opt.toLowerCase().includes(query))
    );
  }, [specifications, searchQuery]);

  if (specifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <EmptyState
          title="No specifications"
          description="Add your first specification using the form above"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">All Specifications</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {filteredSpecs.length} of {specifications.length} specifications
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Type to search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {filteredSpecs.length === 0 ? (
        <EmptyState
          title="No results found"
          description="Try a different search term"
          actionLabel="Clear search"
          onAction={() => setSearchQuery("")}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 w-12">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Options</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSpecs.map((spec, index) => {
                const Icon = getIconComponent(spec.icon);
                return (
                  <tr key={spec.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 sm:px-5 py-3">
                      <span className="text-xs text-gray-400 font-mono">{index + 1}</span>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                          <Icon size={16} className="text-primary-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{spec.name}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {spec.options.map((opt, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(spec.id)}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(spec.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
