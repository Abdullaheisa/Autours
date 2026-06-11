"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Plus, Filter, Edit2, Trash2, Loader2, AlertTriangle, X, ChevronDown, Globe, Building2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import Pagination from "@/components/ui/Pagination";
import { useSearch } from "../../context/SearchContext";
import { supplierApi } from "@/services/api/supplierApi";
import { getVehicleImageUrl } from "@/utils/getImageUrl";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// ─── Delete Confirmation Modal ───────────────────────────────────────
function DeleteModal({
  vehicleName,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  vehicleName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
      />
      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-50"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 border-2 border-red-100 mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-500" />
        </div>

        {/* Text */}
        <h3 className="text-lg font-black text-gray-900 text-center mb-1">Delete Vehicle</h3>
        <p className="text-sm text-gray-500 text-center mb-2">Are you sure you want to delete</p>
        <p className="text-sm font-bold text-gray-900 text-center bg-gray-50 rounded-xl px-4 py-2 mb-3 border border-gray-100 truncate">
          &ldquo;{vehicleName}&rdquo;
        </p>
        <p className="text-xs text-red-500 text-center mb-6">
          This action cannot be undone. The vehicle will be permanently removed.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Searchable Dropdown ──────────────────────────────────────────────
function SearchableDropdown({
  placeholder,
  value,
  options,
  onChange,
  icon: Icon,
  disabled = false,
}: {
  placeholder: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  icon?: React.ElementType;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus input when opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((o) =>
      o.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [options, query]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
            setQuery("");
          }
        }}
        className={`w-full flex items-center gap-2 pl-3 pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all
          ${open ? "border-primary-400 ring-2 ring-primary-100" : "border-gray-200"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-300 cursor-pointer"}
          ${value ? "text-gray-900" : "text-gray-400"}
        `}
      >
        {Icon && <Icon size={15} className={`shrink-0 ${value ? "text-primary-500" : "text-gray-400"}`} />}
        <span className="flex-1 text-left truncate font-medium">
          {selectedLabel || placeholder}
        </span>
        {value ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setOpen(false);
              setQuery("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onChange("");
                setOpen(false);
                setQuery("");
              }
            }}
            className="shrink-0 w-4 h-4 rounded-full bg-gray-200 hover:bg-red-100 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X size={10} />
          </span>
        ) : (
          <ChevronDown
            size={15}
            className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto">
            {/* All / Reset option */}
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                setQuery("");
              }}
              className={`w-full px-3 py-2.5 text-left text-xs font-bold transition-colors border-b border-gray-50
                ${!value ? "bg-primary-50 text-primary-700" : "text-gray-400 hover:bg-gray-50"}`}
            >
              All {placeholder.replace("Filter by ", "")}s
            </button>

            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400">No results found</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full px-3 py-2.5 text-left text-sm transition-colors
                    ${value === opt.value
                      ? "bg-primary-50 text-primary-700 font-bold"
                      : "text-gray-700 hover:bg-gray-50 font-medium"
                    }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function MyVehiclesSection({
  onEditVehicle,
  onAddVehicle,
}: {
  onEditVehicle?: (id: number) => void;
  onAddVehicle?: () => void;
}) {
  const { searchQuery } = useSearch();
  const { user } = useSelector((state: RootState) => state.auth);
  const isActiveSupplier = user?.role === 'admin' || user?.status === 'active_supplier';

  const [localSearch, setLocalSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  // ─── Branches & filter state ─────────────────────────────────────
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  // Fetch branches once on mount
  useEffect(() => {
    supplierApi
      .getBranches()
      .then((res: any) => {
        const data = res?.data?.data || res?.data || [];
        if (Array.isArray(data)) setBranches(data);
      })
      .catch(() => {});
  }, []);

  // Unique countries from branches
  const countryOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { value: string; label: string }[] = [];
    branches.forEach((b: any) => {
      const country = (b.country || "").trim();
      if (country && !seen.has(country)) {
        seen.add(country);
        opts.push({ value: country, label: country });
      }
    });
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [branches]);

  // Branch options – filtered by selected country
  const branchOptions = useMemo(() => {
    const filtered = selectedCountry
      ? branches.filter((b: any) => (b.country || "").trim() === selectedCountry)
      : branches;
    return filtered.map((b: any) => ({
      value: String(b.id),
      label: b.name || b.location || `Branch #${b.id}`,
    }));
  }, [branches, selectedCountry]);

  // When country changes, reset branch if it no longer belongs to that country
  useEffect(() => {
    if (selectedBranch && selectedCountry) {
      const branchObj = branches.find((b: any) => String(b.id) === selectedBranch);
      if (branchObj && (branchObj.country || "").trim() !== selectedCountry) {
        setSelectedBranch("");
      }
    }
  }, [selectedCountry, selectedBranch, branches]);

  const fetchVehicles = async (page: number = 1, overrideFilters?: { branch_id?: string; country?: string; search?: string }) => {
    setIsLoading(true);
    try {
      const filters = overrideFilters ?? {
        branch_id: selectedBranch || undefined,
        country: selectedCountry || undefined,
        search: (localSearch || searchQuery) || undefined,
      };
      const response = await supplierApi.getVehicles(page, itemsPerPage, filters);
      const raw: any = response?.data;
      // Backend returns paginated: { data: [...], total, last_page, ... }
      if (raw && Array.isArray(raw.data)) {
        setItems(raw.data);
        setTotalPages(raw.last_page || 1);
        setTotalCount(raw.total || raw.data.length);
      } else if (Array.isArray(raw)) {
        setItems(raw);
        setTotalPages(1);
        setTotalCount(raw.length);
      } else {
        setItems([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error: any) {
      console.error("Failed to fetch vehicles:", error.message);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch from server when filters or page change
  useEffect(() => {
    fetchVehicles(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Reset to page 1 and re-fetch when filters/search change
  useEffect(() => {
    setCurrentPage(1);
    fetchVehicles(1, {
      branch_id: selectedBranch || undefined,
      country: selectedCountry || undefined,
      search: (localSearch || searchQuery) || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch, searchQuery, selectedCountry, selectedBranch]);

  // ─── Helper: get branch label from vehicle ───────────────────────
  const getVehicleBranchLabel = (v: any): string => {
    // Try to read branch info embedded in vehicle object
    if (v.pickup_loc && typeof v.pickup_loc === "object") {
      return v.pickup_loc.name || v.pickup_loc.location || v.pickup_loc.address || "";
    }
    if (v.branch && typeof v.branch === "object") {
      return v.branch.name || v.branch.location || v.branch.address || "";
    }
    // Fallback: look up in branches list
    const rawId =
      (typeof v.pickup_loc === "number" || typeof v.pickup_loc === "string" ? String(v.pickup_loc) : null) ||
      (typeof v.branch === "number" || typeof v.branch === "string" ? String(v.branch) : null) ||
      (v.branch_id ? String(v.branch_id) : null);
    if (rawId) {
      const found = branches.find((b: any) => String(b.id) === rawId);
      if (found) return found.name || found.location || found.address || `Branch #${rawId}`;
    }
    return "";
  };

  // ─── Helper: is the vehicle's branch active? ────────────────
  const isVehicleBranchActive = (v: any): boolean => {
    // Check branch activation embedded in vehicle
    if (v.pickup_loc && typeof v.pickup_loc === "object" && "activation" in v.pickup_loc) {
      const a = v.pickup_loc.activation;
      return a === 1 || a === true || a === "1" || a === "true";
    }
    if (v.branch && typeof v.branch === "object" && "activation" in v.branch) {
      const a = v.branch.activation;
      return a === 1 || a === true || a === "1" || a === "true";
    }
    // Fallback: look up in branches list
    const rawId =
      (typeof v.pickup_loc === "number" || typeof v.pickup_loc === "string" ? String(v.pickup_loc) : null) ||
      (typeof v.branch === "number" || typeof v.branch === "string" ? String(v.branch) : null) ||
      (v.branch_id ? String(v.branch_id) : null);
    if (rawId) {
      const found = branches.find((b: any) => String(b.id) === rawId);
      if (found) {
        const a = found.activation;
        return a === 1 || a === true || a === "1" || a === "true";
      }
    }
    // If we can't determine, assume active
    return true;
  };

  // Server handles filtering — items are already filtered.
  // We keep a thin client-side pass only as a safety net for instant UI feedback.
  const filteredVehicles = items; // server already filtered
  const effectiveTotalPages = totalPages;
  const paginatedVehicles = items;

  const handleDeleteClick = (vehicle: any) => {
    setDeleteModal({ id: vehicle.id, name: vehicle.name || "this vehicle" });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      await supplierApi.deleteVehicle(deleteModal.id);
      toast.success("Vehicle deleted successfully.");
      setDeleteModal(null);
      // Re-fetch the current page so count + list are accurate
      fetchVehicles(currentPage);
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
      toast.error("Failed to delete vehicle. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleActivation = async (id: number, currentStatus: boolean) => {
    setItems((prev) =>
      prev.map((v) => (v.id === id ? { ...v, activation: !currentStatus } : v))
    );
    try {
      await supplierApi.toggleVehicleActivation(id, !currentStatus);
      toast.success(!currentStatus ? "Vehicle activated." : "Vehicle deactivated.");
    } catch (error) {
      console.error("Failed to toggle vehicle activation:", error);
      toast.error("Failed to update vehicle status.");
      setItems((prev) =>
        prev.map((v) => (v.id === id ? { ...v, activation: currentStatus } : v))
      );
    }
  };

  const resolveImageUrl = (v: any) => {
    if (v.vehiclePhoto?.photo) return getVehicleImageUrl(v.vehiclePhoto.photo);
    let img = v.image || v.photo || v.car_photo || v.cover_image;
    if (Array.isArray(img)) img = img[0];
    if (img && typeof img === "object")
      img = img.photo || img.url || img.path || img.image || "";
    if (!img || typeof img !== "string") return undefined;
    return getVehicleImageUrl(img);
  };

  const hasActiveFilters = !!(selectedCountry || selectedBranch);

  return (
    <SectionLayout>
      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <DeleteModal
          vehicleName={deleteModal.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !isDeleting && setDeleteModal(null)}
          isDeleting={isDeleting}
        />
      )}

      <PageHeader
        title="Fleet Management"
        description="View and manage your entire vehicle collection across all locations"
        actionLabel={isActiveSupplier ? "Add New Vehicle" : undefined}
        actionIcon={isActiveSupplier ? <Plus size={18} /> : undefined}
        onAction={isActiveSupplier ? () => {
          if (onAddVehicle) onAddVehicle();
          else window.location.href = "/company/create-vehicle";
        } : undefined}
      />

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4 mt-4 space-y-3">
        {/* Row 1: Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by vehicle name, category or year..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          {/* Filter icon – shows active indicator */}
          <div className="relative">
            <button className={`p-3 border rounded-xl transition-all ${hasActiveFilters ? "bg-primary-50 border-primary-200 text-primary-600" : "bg-gray-50 border-gray-200 text-gray-400 hover:text-primary-600 hover:border-primary-200"}`}>
              <Filter size={20} />
            </button>
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-white" />
            )}
          </div>
        </div>

        {/* Row 2: Country + Branch dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Country */}
          <SearchableDropdown
            placeholder="Filter by Country"
            value={selectedCountry}
            options={countryOptions}
            onChange={(val) => {
              setSelectedCountry(val);
              setSelectedBranch(""); // reset branch when country changes
            }}
            icon={Globe}
          />

          {/* Branch */}
          <SearchableDropdown
            placeholder="Filter by Branch"
            value={selectedBranch}
            options={branchOptions}
            onChange={setSelectedBranch}
            icon={Building2}
            disabled={branchOptions.length === 0 && !selectedCountry}
          />
        </div>

        {/* Active filters chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs text-gray-400 font-medium">Active filters:</span>
            {selectedCountry && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg border border-primary-100">
                <Globe size={11} />
                {selectedCountry}
                <button
                  onClick={() => setSelectedCountry("")}
                  className="ml-0.5 hover:text-primary-900 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {selectedBranch && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg border border-primary-100">
                <Building2 size={11} />
                {branchOptions.find((b) => b.value === selectedBranch)?.label || selectedBranch}
                <button
                  onClick={() => setSelectedBranch("")}
                  className="ml-0.5 hover:text-primary-900 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCountry("");
                setSelectedBranch("");
              }}
              className="text-xs text-gray-400 hover:text-red-500 font-medium underline transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm font-medium">Loading your fleet...</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="overflow-x-auto" style={{ transform: "rotateX(180deg)" }}>
            <div style={{ transform: "rotateX(180deg)" }}>
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">
                      Vehicle Details
                    </th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">
                      Category
                    </th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">
                      Branch / Location
                    </th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">
                      Daily Price
                    </th>
                    <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">
                      Active / Available
                    </th>
                    <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">
                      Management
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedVehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-gray-50/30 transition-colors group animate-in fade-in duration-300"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 shrink-0 flex items-center justify-center">
                            {resolveImageUrl(vehicle) ? (
                              <img
                                src={resolveImageUrl(vehicle) as string}
                                alt={vehicle.name || "Car"}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://ui-avatars.com/api/?name=Car&background=f3f4f6&color=9ca3af";
                                }}
                              />
                            ) : (
                              <span className="text-xs text-gray-400 font-bold">No img</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-gray-900 text-sm">{vehicle.name}</span>
                            {!isVehicleBranchActive(vehicle) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-wide">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                Branch Inactive — Hidden from users
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg uppercase tracking-wider border border-primary-100">
                          {typeof vehicle.category === "object"
                            ? vehicle.category?.name
                            : vehicle.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const label = getVehicleBranchLabel(vehicle);
                          const country =
                            (vehicle.pickup_loc?.country) ||
                            (vehicle.branch?.country) ||
                            "";
                          return label ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="flex items-center gap-1 text-xs font-bold text-gray-700">
                                <Building2 size={12} className="text-primary-400 shrink-0" />
                                {label}
                              </span>
                              {country && (
                                <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                  <Globe size={11} className="shrink-0" />
                                  {country}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300 italic">—</span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-bold">
                        {vehicle.price ? `$${vehicle.price}` : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => toggleActivation(vehicle.id, vehicle.activation)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full shadow-inner transition-colors duration-300 ${
                              vehicle.activation ? "bg-emerald-500" : "bg-gray-300"
                            }`}
                            title={vehicle.activation ? "Click to deactivate" : "Click to activate"}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                                vehicle.activation ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              if (onEditVehicle) onEditVehicle(vehicle.id);
                              else
                                window.location.href = `/company/vehicles/edit/${vehicle.id}`;
                            }}
                            className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-100"
                            title="Edit Vehicle"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(vehicle)}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                            title="Delete Vehicle"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredVehicles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                            <Search size={32} />
                          </div>
                          <p className="text-gray-500 font-medium">
                            {hasActiveFilters
                              ? "No vehicles found for the selected filters."
                              : "No vehicles found matching your search."}
                          </p>
                          <button
                            onClick={() => {
                              setLocalSearch("");
                              setSelectedCountry("");
                              setSelectedBranch("");
                            }}
                            className="text-primary-600 font-bold text-sm hover:underline"
                          >
                            Clear all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          {(paginatedVehicles.length > 0 || totalCount > 0) && effectiveTotalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-6 py-4 bg-gray-50/30">
              <span className="text-xs font-bold text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                {totalCount} vehicles
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={effectiveTotalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </SectionLayout>
  );
}
