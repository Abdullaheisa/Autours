"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit2,
  Save,
  CheckSquare,
  Square,
  DollarSign,
  Car,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsGrid from "@/app/company/components/StatsGrid";
import FilterBar from "@/components/shared/FilterBar";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { supplierApi, rentalTermsApi } from "@/services/api";
import { formatPrice } from "@/utils/currency";
import type { Currency } from "@/types";
import toast from "react-hot-toast";
import Image from "next/image";
import { getVehicleImageUrl } from "@/utils/getImageUrl";
import { usePersistedPage } from "@/hooks/usePersistedPage";
import { useSearch } from "../../context/SearchContext";

interface BranchItem {
  id: number;
  name: string;
  city?: string;
  country?: string;
  currency?: string;
}

export default function CompanyDepositSection() {
  const { searchQuery: globalSearch } = useSearch();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [countries, setCountries] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [localSearch, setLocalSearch] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("all");
  const [selectedCountryFilter, setSelectedCountryFilter] = useState("all");
  const [selectedDepositFilter, setSelectedDepositFilter] = useState("all");

  // Selection
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);

  // Bulk Apply Form State
  const [bulkScope, setBulkScope] = useState<"all" | "branch" | "country" | "selected">("all");
  const [bulkBranchId, setBulkBranchId] = useState<string>("all");
  const [bulkCountry, setBulkCountry] = useState<string>("all");
  const [bulkAmount, setBulkAmount] = useState<string>("");
  const [bulkTerms, setBulkTerms] = useState<string>("");

  // Single Vehicle Edit Modal State
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [editTerms, setEditTerms] = useState<string>("");
  const [isSavingSingle, setIsSavingSingle] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = usePersistedPage("company_deposit_page", 1);
  const itemsPerPage = 10;
  const isSearchMount = useRef(true);

  // Helper to resolve branch currency
  const getBranchCurrency = (branchIdOrObj: any): string => {
    if (typeof branchIdOrObj === "object" && branchIdOrObj?.currency) {
      return branchIdOrObj.currency;
    }
    const b = branches.find((item) => String(item.id) === String(branchIdOrObj?.id || branchIdOrObj));
    return b?.currency || "AED";
  };

  const primaryFleetCurrency = useMemo(() => {
    if (bulkScope === "branch" && bulkBranchId !== "all") {
      return getBranchCurrency(bulkBranchId);
    }
    return branches[0]?.currency || vehicles[0]?.branch?.currency || "AED";
  }, [bulkScope, bulkBranchId, branches, vehicles]);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vehRes, branchRes, countryRes] = (await Promise.all([
        supplierApi.getVehicles(1, 500),
        supplierApi.getBranches(),
        rentalTermsApi.getActiveCountries(),
      ])) as any[];

      const vehList = vehRes?.data?.data || vehRes?.data || (Array.isArray(vehRes) ? vehRes : []);
      setVehicles(vehList);

      const branchList = branchRes?.data?.data || branchRes?.data || (Array.isArray(branchRes) ? branchRes : []);
      setBranches(branchList);

      const countryList = countryRes?.data || (Array.isArray(countryRes) ? countryRes : []);
      setCountries(countryList);
    } catch (err) {
      console.error("Failed to load deposit data:", err);
      toast.error("Failed to load vehicles and branches.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset page on search or filter change
  useEffect(() => {
    if (isSearchMount.current) {
      isSearchMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [localSearch, globalSearch, selectedBranchFilter, selectedCountryFilter, selectedDepositFilter, setCurrentPage]);

  // Derived Stats
  const stats = useMemo(() => {
    const total = vehicles.length;
    const withDeposit = vehicles.filter((v) => Number(v.deposit_amount) > 0).length;
    const zeroDeposit = vehicles.filter(
      (v) => Number(v.deposit_amount) === 0 || v.deposit_amount === null || v.deposit_amount === undefined
    ).length;

    return [
      { label: "Total Fleet", value: total, icon: <Car size={20} />, color: "blue" as const },
      { label: "With Deposit", value: withDeposit, icon: <ShieldCheck size={20} />, color: "emerald" as const },
      { label: "Zero Deposit", value: zeroDeposit, icon: <CheckCircle2 size={20} />, color: "amber" as const },
    ];
  }, [vehicles]);

  // Filtered Vehicles
  const filteredVehicles = useMemo(() => {
    const activeSearch = (localSearch || globalSearch || "").toLowerCase().trim();

    return vehicles.filter((v) => {
      // Search by vehicle name, category, or branch
      if (activeSearch) {
        const name = (v.name || "").toLowerCase();
        const cat = (v.category?.name || v.category || "").toLowerCase();
        const branchName = (v.branch?.name || v.branch?.city || "").toLowerCase();
        if (!name.includes(activeSearch) && !cat.includes(activeSearch) && !branchName.includes(activeSearch)) {
          return false;
        }
      }

      // Branch filter
      if (selectedBranchFilter !== "all") {
        const bId = String(v.pickup_loc || v.branch?.id || "");
        if (bId !== String(selectedBranchFilter)) return false;
      }

      // Country filter
      if (selectedCountryFilter !== "all") {
        const c = (v.branch?.country || "").toLowerCase();
        if (c !== selectedCountryFilter.toLowerCase()) return false;
      }

      // Deposit state filter
      if (selectedDepositFilter === "with_deposit") {
        if (Number(v.deposit_amount || 0) <= 0) return false;
      } else if (selectedDepositFilter === "zero_deposit") {
        if (Number(v.deposit_amount || 0) > 0) return false;
      }

      return true;
    });
  }, [vehicles, localSearch, globalSearch, selectedBranchFilter, selectedCountryFilter, selectedDepositFilter]);

  // Paginated Subset
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage) || 1;
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  // Selection Handlers
  const handleSelectAllOnPage = () => {
    const pageIds = paginatedVehicles.map((v) => v.id);
    const allSelected = pageIds.every((id) => selectedVehicleIds.includes(id));
    if (allSelected) {
      setSelectedVehicleIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedVehicleIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectVehicle = (id: number) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Submit
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(bulkAmount || "0");
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error("Please enter a valid deposit amount (0 or greater).");
      return;
    }

    if (bulkScope === "branch" && (!bulkBranchId || bulkBranchId === "all")) {
      toast.error("Please select a target branch.");
      return;
    }

    if (bulkScope === "country" && (!bulkCountry || bulkCountry === "all")) {
      toast.error("Please select a target country.");
      return;
    }

    if (bulkScope === "selected" && selectedVehicleIds.length === 0) {
      toast.error("Please select at least one vehicle from the table.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        scope: bulkScope,
        deposit_amount: parsedAmount,
        deposit_terms: bulkTerms.trim() || undefined,
      };

      if (bulkScope === "branch") payload.branch_id = bulkBranchId;
      if (bulkScope === "country") payload.country = bulkCountry;
      if (bulkScope === "selected") payload.vehicle_ids = selectedVehicleIds;

      const res: any = await supplierApi.bulkUpdateDeposit(payload);
      toast.success(res?.data?.message || res?.message || "Deposit updated successfully!");

      // Update local state
      setVehicles((prev) =>
        prev.map((v) => {
          let matches = false;
          if (bulkScope === "all") matches = true;
          else if (bulkScope === "branch" && String(v.pickup_loc || v.branch?.id) === String(bulkBranchId)) matches = true;
          else if (bulkScope === "country" && (v.branch?.country || "").toLowerCase() === bulkCountry.toLowerCase()) matches = true;
          else if (bulkScope === "selected" && selectedVehicleIds.includes(v.id)) matches = true;

          if (matches) {
            return {
              ...v,
              deposit_amount: parsedAmount,
              deposit_terms: bulkTerms.trim() || null,
            };
          }
          return v;
        })
      );

      if (bulkScope === "selected") {
        setSelectedVehicleIds([]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to update deposit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Single Edit Modal Handlers
  const handleOpenEdit = (v: any) => {
    setEditingVehicle(v);
    setEditAmount(String(v.deposit_amount ?? "0"));
    setEditTerms(v.deposit_terms || "");
  };

  const handleSaveSingleDeposit = async () => {
    if (!editingVehicle) return;
    const parsedAmount = parseFloat(editAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }

    setIsSavingSingle(true);
    try {
      await supplierApi.bulkUpdateDeposit({
        scope: "selected",
        vehicle_ids: [editingVehicle.id],
        deposit_amount: parsedAmount,
        deposit_terms: editTerms.trim() || undefined,
      });

      toast.success(`Deposit updated for ${editingVehicle.name}`);

      setVehicles((prev) =>
        prev.map((v) =>
          v.id === editingVehicle.id
            ? { ...v, deposit_amount: parsedAmount, deposit_terms: editTerms.trim() || null }
            : v
        )
      );
      setEditingVehicle(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save deposit");
    } finally {
      setIsSavingSingle(false);
    }
  };

  const clearFilters = () => {
    setLocalSearch("");
    setSelectedBranchFilter("all");
    setSelectedCountryFilter("all");
    setSelectedDepositFilter("all");
  };

  return (
    <SectionLayout>
      {/* 1. Page Header */}
      <PageHeader
        title="Security Deposit Management"
        description="Set refundable security deposits & terms for your fleet in bulk or per vehicle/branch."
        showAction={false}
      />

      {/* 2. Stats Grid */}
      <StatsGrid stats={stats} />

      {/* 3. Streamlined Compact Bulk Deposit Card */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-4 sm:p-5 mb-5">
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          {/* Header & Scope Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 leading-tight">Bulk Deposit Settings</h2>
                <p className="text-[11px] text-gray-400">Target your fleet and apply deposit amounts</p>
              </div>
            </div>

            {/* Compact Scope Segmented Buttons */}
            <div className="flex items-center gap-1 p-1 bg-gray-100/90 rounded-xl flex-wrap">
              {[
                { id: "all", label: "All Fleet", icon: Layers },
                { id: "branch", label: "By Branch", icon: Car },
                { id: "country", label: "By Country", icon: ShieldCheck },
                {
                  id: "selected",
                  label: selectedVehicleIds.length ? `Selected (${selectedVehicleIds.length})` : "Selected Only",
                  icon: CheckSquare,
                },
              ].map((scope) => {
                const Icon = scope.icon;
                const isSelected = bulkScope === scope.id;
                return (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => setBulkScope(scope.id as any)}
                    className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200/70"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                    }`}
                  >
                    <Icon size={13} className={isSelected ? "text-amber-600" : "text-gray-400"} />
                    <span>{scope.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Target Filter row if branch or country is active */}
          {bulkScope === "branch" && (
            <div className="flex items-center gap-3 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100/80 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-amber-900 shrink-0">Target Branch:</span>
              <select
                value={bulkBranchId}
                onChange={(e) => setBulkBranchId(e.target.value)}
                className="w-full sm:max-w-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">-- Select Branch --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.city ? `(${b.city})` : ""} {b.currency ? `[${b.currency}]` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {bulkScope === "country" && (
            <div className="flex items-center gap-3 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100/80 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-amber-900 shrink-0">Target Country:</span>
              <select
                value={bulkCountry}
                onChange={(e) => setBulkCountry(e.target.value)}
                className="w-full sm:max-w-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">-- Select Country --</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {bulkScope === "selected" && (
            <div className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/60 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Info size={14} className="text-amber-600" />
                <span>
                  {selectedVehicleIds.length > 0
                    ? `${selectedVehicleIds.length} vehicle(s) selected from the table below`
                    : "Please check vehicles from the table below to apply deposit"}
                </span>
              </div>
              {selectedVehicleIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedVehicleIds([])}
                  className="text-xs font-bold text-amber-700 hover:text-amber-900 underline"
                >
                  Clear Selection
                </button>
              )}
            </div>
          )}

          {/* Compact Inputs & Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Deposit Amount & Quick Presets */}
            <div className="md:col-span-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">
                  Amount ({primaryFleetCurrency}) <span className="text-gray-400 font-normal">(0 = Zero)</span>
                </label>
                <div className="flex items-center gap-1">
                  {[0, 300, 500, 800].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBulkAmount(String(preset))}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-all ${
                        bulkAmount === String(preset)
                          ? "bg-primary border-primary text-gray-900"
                          : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                      }`}
                    >
                      {preset === 0 ? "Zero" : preset}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={bulkAmount}
                onChange={(e) => setBulkAmount(e.target.value)}
                placeholder="e.g. 300"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Terms & Refund Policy */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block truncate">
                Deposit Terms & Policy <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={bulkTerms}
                onChange={(e) => setBulkTerms(e.target.value)}
                placeholder="e.g. Refundable security deposit collected upon pickup."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-600 text-gray-900 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Apply Deposit Settings
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 4. Filter Bar */}
      <FilterBar
        searchPlaceholder="Search vehicles by name, category, or branch..."
        searchValue={localSearch}
        onSearchChange={setLocalSearch}
        filters={[
          {
            label: "Branch",
            value: selectedBranchFilter,
            options: [
              { label: "All Branches", value: "all" },
              ...branches.map((b) => ({ label: b.name, value: String(b.id) })),
            ],
            onChange: setSelectedBranchFilter,
          },
          {
            label: "Country",
            value: selectedCountryFilter,
            options: [
              { label: "All Countries", value: "all" },
              ...countries.map((c) => ({ label: c, value: c })),
            ],
            onChange: setSelectedCountryFilter,
          },
          {
            label: "Deposit Status",
            value: selectedDepositFilter,
            options: [
              { label: "All Vehicles", value: "all" },
              { label: "With Deposit (> 0)", value: "with_deposit" },
              { label: "Zero Deposit (0)", value: "zero_deposit" },
            ],
            onChange: setSelectedDepositFilter,
          },
        ]}
        onClearFilters={clearFilters}
      />

      {/* 5. Vehicles Table */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center shadow-sm">
          <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-600">Loading vehicles deposit data...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <EmptyState
          title="No vehicles found"
          description="Try adjusting your filters or search criteria."
          onAction={clearFilters}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAllOnPage}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {paginatedVehicles.every((v) => selectedVehicleIds.includes(v.id)) ? (
                        <CheckSquare size={18} className="text-primary" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Branch / Location</th>
                  <th className="py-3 px-4">Deposit Amount</th>
                  <th className="py-3 px-4">Terms & Policy</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedVehicles.map((v) => {
                  const isSelected = selectedVehicleIds.includes(v.id);
                  const depositVal = Number(v.deposit_amount || 0);
                  const hasDeposit = depositVal > 0;
                  const rowCurrency = (v.branch?.currency || getBranchCurrency(v.pickup_loc || v.branch?.id) || "AED") as Currency;

                  return (
                    <tr
                      key={v.id}
                      className={`hover:bg-gray-50/80 transition-colors ${isSelected ? "bg-amber-50/40" : ""}`}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectVehicle(v.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isSelected ? (
                            <CheckSquare size={18} className="text-primary" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            <Image
                              src={getVehicleImageUrl(v.photo || v.image)}
                              alt={v.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{v.name}</p>
                            <p className="text-xs text-gray-400">{v.category?.name || v.category || "Economy"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold text-gray-700">
                          {v.branch?.name || v.branch?.city || "Default Branch"}
                        </span>
                        {v.branch?.country && (
                          <span className="block text-[10px] text-gray-400">{v.branch.country}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {hasDeposit ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <ShieldCheck size={12} className="text-amber-600" />
                            {formatPrice(depositVal, rowCurrency)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            Zero Deposit
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-xs text-gray-500 truncate" title={v.deposit_terms || "Standard deposit policy"}>
                          {v.deposit_terms || <span className="text-gray-300 italic">Default policy</span>}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all active:scale-95"
                        >
                          <Edit2 size={13} />
                          Quick Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 6. Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length} vehicles
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* 7. Quick Edit Modal */}
      <Modal
        isOpen={!!editingVehicle}
        onClose={() => setEditingVehicle(null)}
        title={`Edit Deposit: ${editingVehicle?.name || "Vehicle"}`}
        size="md"
        footer={
          <div className="flex justify-end gap-2.5">
            <button
              onClick={() => setEditingVehicle(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSingleDeposit}
              disabled={isSavingSingle}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-gray-900 px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              {isSavingSingle && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Deposit Amount ({editingVehicle?.branch?.currency || getBranchCurrency(editingVehicle?.pickup_loc || editingVehicle?.branch?.id) || "AED"}) <span className="text-gray-400 font-normal">(0 = Zero Deposit)</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Deposit Conditions / Policy
            </label>
            <textarea
              rows={3}
              value={editTerms}
              onChange={(e) => setEditTerms(e.target.value)}
              placeholder="e.g. Refundable security deposit charged at the counter upon vehicle pickup."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>
      </Modal>
    </SectionLayout>
  );
}
