"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  X,
  Zap,
  Building2,
  Save,
  TrendingUp,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { extrasPricingApi, companyApi, profitApi } from "@/services/api";
import { getLogoUrl } from "@/utils/getImageUrl";
import SectionLayout from "@/components/shared/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";
import CustomSelect, { CustomSelectOption } from "@/components/ui/CustomSelect";
import ExtraPricingRow from "@/components/extras/ExtraPricingRow";
import AdminExtraCard, { ExtraItem } from "./components/AdminExtraCard";
import BulkWizard, { BulkWizardPayload } from "./components/BulkWizard";
import CreateEditExtraModal, { ExtraFormData } from "./components/CreateEditExtraModal";

const EMPTY_FORM: ExtraFormData = {
  name: "",
  description: "",
  price: 0,
  profit_percent: 0,
  currency: "USD",
  type: "boolean",
  max_qty: 1,
  badge: "",
  is_active: true,
  faqs: [],
};

export default function AdminExtrasPricingSection() {
  const [activeTab, setActiveTab] = useState<"manage" | "overview" | "overrides" | "bulk">("manage");

  // Overview State
  const [overviewData, setOverviewData] = useState<any[]>([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [overviewSearch, setOverviewSearch] = useState("");
  const [overviewStatusFilter, setOverviewStatusFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [overviewCountryFilter, setOverviewCountryFilter] = useState<string>("all");
  const [overviewBranchFilter, setOverviewBranchFilter] = useState<"all" | "with_branches" | "no_branches">("all");
  const [expandedSuppliers, setExpandedSuppliers] = useState<Record<number, boolean>>({});

  const toggleSupplierExpand = (supplierId: number) => {
    setExpandedSuppliers((prev) => ({
      ...prev,
      [supplierId]: !prev[supplierId],
    }));
  };

  // Catalog State
  const [extrasList, setExtrasList] = useState<ExtraItem[]>([]);
  const [isLoadingExtras, setIsLoadingExtras] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "boolean" | "quantity">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<ExtraItem | null>(null);
  const [formData, setFormData] = useState<ExtraFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suppliers & Branches
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  // Bulk Wizard State
  const [isBulkApplying, setIsBulkApplying] = useState(false);

  // Per-Company Overrides State
  const [supplierFilterCountry, setSupplierFilterCountry] = useState("");
  const [supplierFilterBranch, setSupplierFilterBranch] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedBranchOverrideId, setSelectedBranchOverrideId] = useState("");
  const [overrideCatalog, setOverrideCatalog] = useState<any[]>([]);
  const [overrideLocalData, setOverrideLocalData] = useState<
    Record<number, { enabled: boolean; custom_price: number; profit_percent: number }>
  >({});
  const [isLoadingOverrides, setIsLoadingOverrides] = useState(false);
  const [isSavingOverrides, setIsSavingOverrides] = useState(false);
  const [overrideSearch, setOverrideSearch] = useState("");
  const [companyQuickProfit, setCompanyQuickProfit] = useState("");

  // ─── DATA FETCHING ───
  const fetchExtras = useCallback(async () => {
    setIsLoadingExtras(true);
    try {
      const res: any = await extrasPricingApi.getAllAdmin();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res)
        ? res
        : [];
      setExtrasList(list);
    } catch {
      toast.error("Failed to load extras catalog");
    } finally {
      setIsLoadingExtras(false);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res: any = await companyApi.getAll();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res)
        ? res
        : [];
      // Restrict to active suppliers with cars only
      const activeSuppliers = list.filter((s: any) => {
        const isSupplier = s.role === "active_supplier" || s.role === "supplier";
        const isNotHidden = !s.vehicles_hidden;
        const hasCars = s.vehicles_count === undefined || Number(s.vehicles_count) > 0;
        return isSupplier && isNotHidden && hasCars;
      });
      setSuppliers(activeSuppliers);
    } catch {
      // Fallback
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    try {
      const res: any = await profitApi.getCountries();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setCountries(list);
    } catch {
      // Fallback
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const res: any = await profitApi.getBranches(
        selectedSupplierId || undefined,
        supplierFilterCountry || undefined
      );
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      // Only active branches
      const activeBranches = list.filter((b: any) => b.activation === 1 || b.activation === "1" || b.activation === true);
      setBranches(activeBranches);
    } catch {
      // Fallback
    }
  }, [selectedSupplierId, supplierFilterCountry]);

  useEffect(() => {
    fetchExtras();
    fetchSuppliers();
    fetchCountries();
  }, [fetchExtras, fetchSuppliers, fetchCountries]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Load Overrides Catalog for Selected Company
  useEffect(() => {
    if (!selectedSupplierId) {
      setOverrideCatalog([]);
      setOverrideLocalData({});
      return;
    }
    const loadOverrides = async () => {
      setIsLoadingOverrides(true);
      try {
        const res: any = await extrasPricingApi.adminGetSupplierExtras(
          Number(selectedSupplierId),
          { branch_id: selectedBranchOverrideId || undefined }
        );
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res)
          ? res
          : [];
        setOverrideCatalog(list);

        const init: typeof overrideLocalData = {};
        list.forEach((item: any) => {
          init[item.id] = {
            enabled: item.enabled,
            custom_price: item.custom_price,
            profit_percent: item.profit_percent,
          };
        });
        setOverrideLocalData(init);
      } catch {
        toast.error("Failed to load company extras");
      } finally {
        setIsLoadingOverrides(false);
      }
    };
    loadOverrides();
  }, [selectedSupplierId, selectedBranchOverrideId]);

  const fetchOverview = useCallback(async () => {
    setIsLoadingOverview(true);
    try {
      const res: any = await extrasPricingApi.adminGetExtrasOverview();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res)
        ? res
        : [];
      setOverviewData(list);
    } catch {
      toast.error("Failed to load companies overview");
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "overview") {
      fetchOverview();
    }
  }, [activeTab, fetchOverview]);

  const overviewCountries = useMemo(() => {
    return Array.from(new Set(overviewData.map((s) => s.country).filter(Boolean))).sort() as string[];
  }, [overviewData]);

  const isSupplierDisabled = (s: any) => Boolean(s.is_all_disabled || (s.effective_enabled_count ?? 0) === 0);

  const filteredOverviewData = useMemo(() => {
    return overviewData.filter((s) => {
      // 1. Text search
      if (overviewSearch.trim()) {
        const q = overviewSearch.toLowerCase();
        const matchesCompany = s.supplier_name?.toLowerCase().includes(q);
        const matchesCountry = s.country?.toLowerCase().includes(q);
        const matchesBranch = s.branches?.some((b: any) =>
          b.name?.toLowerCase().includes(q) || b.city?.toLowerCase().includes(q)
        );
        if (!matchesCompany && !matchesCountry && !matchesBranch) return false;
      }

      // 2. Status filter
      if (overviewStatusFilter === "enabled" && isSupplierDisabled(s)) return false;
      if (overviewStatusFilter === "disabled" && !isSupplierDisabled(s)) return false;

      // 3. Country filter
      if (overviewCountryFilter !== "all" && s.country !== overviewCountryFilter) return false;

      // 4. Branches filter
      const branchCount = s.branches?.length || 0;
      if (overviewBranchFilter === "with_branches" && branchCount === 0) return false;
      if (overviewBranchFilter === "no_branches" && branchCount > 0) return false;

      return true;
    });
  }, [overviewData, overviewSearch, overviewStatusFilter, overviewCountryFilter, overviewBranchFilter]);

  const handleToggleSupplierExtras = async (
    supplierId: number,
    enable: boolean,
    branchId?: number | string
  ) => {
    try {
      await extrasPricingApi.adminToggleSupplierExtras(supplierId, {
        enable,
        branch_id: branchId ? Number(branchId) : undefined,
      });
      toast.success(
        enable
          ? "All extras enabled for this supplier/branch! 🎉"
          : "All extras cancelled/disabled for this supplier/branch!"
      );
      if (activeTab === "overview") {
        fetchOverview();
      }
      if (activeTab === "overrides" && String(selectedSupplierId) === String(supplierId)) {
        setOverrideLocalData((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((k) => {
            const id = Number(k);
            if (next[id]) next[id] = { ...next[id], enabled: enable };
          });
          return next;
        });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update extras status");
    }
  };

  // ─── FILTERED EXTRAS ───
  const filteredExtras = useMemo(() => {
    return extrasList.filter((extra) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !extra.name.toLowerCase().includes(q) &&
          !extra.description?.toLowerCase().includes(q)
        )
          return false;
      }
      if (typeFilter !== "all" && extra.type !== typeFilter) return false;
      if (statusFilter === "active" && !extra.is_active) return false;
      if (statusFilter === "inactive" && extra.is_active) return false;
      return true;
    });
  }, [extrasList, searchQuery, typeFilter, statusFilter]);

  // ─── OPTIONS ───
  const branchOptions: CustomSelectOption[] = useMemo(
    () =>
      branches.map((b) => ({
        value: String(b.id),
        label: `${b.name || b.location || `Branch #${b.id}`}${b.city ? ` — ${b.city}` : ""}${
          b.country ? ` (${b.country})` : ""
        }`,
      })),
    [branches]
  );

  const filteredCompanyOptions: CustomSelectOption[] = useMemo(() => {
    let list = suppliers;
    if (supplierFilterCountry) {
      list = list.filter((s) => s.country === supplierFilterCountry);
    }
    if (supplierFilterBranch) {
      list = list.filter((s) => String(s.branch_id) === supplierFilterBranch);
    }
    return list.map((s) => ({
      value: String(s.id),
      label: s.name,
      sublabel: s.country,
    }));
  }, [suppliers, supplierFilterCountry, supplierFilterBranch]);

  // ─── MODAL HANDLERS ───
  const openCreate = () => {
    setEditingExtra(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (extra: ExtraItem) => {
    setEditingExtra(extra);
    setFormData({
      name: extra.name,
      description: extra.description || "",
      price: extra.price,
      profit_percent: extra.profit_percent,
      currency: extra.currency || "USD",
      type: extra.type,
      max_qty: extra.max_qty || 1,
      badge: extra.badge || "",
      is_active: extra.is_active,
      faqs: extra.faqs || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a service name");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingExtra) {
        await extrasPricingApi.update(editingExtra.id, formData);
        toast.success(`Updated "${formData.name}" successfully! 🎉`);
      } else {
        await extrasPricingApi.create(formData);
        toast.success(`Created "${formData.name}" successfully! 🎉`);
      }
      setIsModalOpen(false);
      fetchExtras();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save extra service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (extra: ExtraItem) => {
    const nextState = !extra.is_active;
    setExtrasList((prev) =>
      prev.map((e) => (e.id === extra.id ? { ...e, is_active: nextState } : e))
    );
    try {
      await extrasPricingApi.update(extra.id, { is_active: nextState });
      toast.success(`"${extra.name}" is now ${nextState ? "Active" : "Inactive"}`);
    } catch {
      setExtrasList((prev) =>
        prev.map((e) => (e.id === extra.id ? { ...e, is_active: !nextState } : e))
      );
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (extra: ExtraItem) => {
    if (!confirm(`Are you sure you want to delete "${extra.name}"?`)) return;
    try {
      await extrasPricingApi.delete(extra.id);
      toast.success(`"${extra.name}" deleted.`);
      setExtrasList((prev) => prev.filter((e) => e.id !== extra.id));
    } catch {
      toast.error("Failed to delete extra service");
    }
  };

  // ─── BULK APPLY HANDLER ───
  const handleBulkApplyFromWizard = async (payload: BulkWizardPayload) => {
    setIsBulkApplying(true);
    try {
      await extrasPricingApi.adminBulkApply(payload);
      toast.success("Bulk pricing changes applied successfully! 🎉");
      fetchExtras();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to apply bulk updates");
    } finally {
      setIsBulkApplying(false);
    }
  };

  const handleApplyCompanyQuickProfit = () => {
    const val = parseFloat(companyQuickProfit);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid profit %");
      return;
    }
    setOverrideLocalData((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        const id = Number(k);
        if (next[id]) {
          next[id] = { ...next[id], profit_percent: val };
        }
      });
      return next;
    });
    toast.success(`Applied ${val}% profit to all extras! Click Save to apply.`);
  };

  // ─── SAVE OVERRIDES HANDLER ───
  const handleSaveOverrides = async () => {
    if (!selectedSupplierId) return;
    setIsSavingOverrides(true);
    try {
      const payload = overrideCatalog.map((item: any) => ({
        extra_id: item.id,
        enabled: overrideLocalData[item.id]?.enabled ?? false,
        custom_price: overrideLocalData[item.id]?.custom_price ?? item.custom_price,
        profit_percent: overrideLocalData[item.id]?.profit_percent ?? item.profit_percent,
      }));
      await extrasPricingApi.adminSaveSupplierExtras(
        Number(selectedSupplierId),
        payload,
        { branch_id: selectedBranchOverrideId ? Number(selectedBranchOverrideId) : undefined }
      );
      toast.success("Saved company extras successfully! 🎉");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save configuration");
    } finally {
      setIsSavingOverrides(false);
    }
  };

  const selectedSupplierName =
    suppliers.find((s) => String(s.id) === selectedSupplierId)?.name ||
    `Company #${selectedSupplierId}`;

  return (
    <SectionLayout>
      <PageHeader
        title="Extras & Add-ons Pricing"
        description="Create add-on services, manage profit margins, and apply pricing across companies, countries, or branches."
        showAction={false}
      />

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl w-fit mt-6">
        {[
          { id: "manage", label: "Extras Catalog", icon: <Package size={15} />, count: extrasList.length },
          { id: "overview", label: "Companies & Branches Status", icon: <Layers size={15} /> },
          { id: "bulk", label: "Bulk Apply", icon: <Zap size={15} /> },
          { id: "overrides", label: "Per-Company & Branch", icon: <Building2 size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  activeTab === tab.id ? "bg-primary text-gray-900" : "bg-gray-200 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── TAB: MANAGE CATALOG ─── */}
      {activeTab === "manage" && (
        <div className="mt-5 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search extras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-9 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <div className="flex p-0.5 bg-gray-100 rounded-xl gap-0.5">
                {[
                  { v: "all", l: "All" },
                  { v: "boolean", l: "Toggle" },
                  { v: "quantity", l: "Qty" },
                ].map((f) => (
                  <button
                    key={f.v}
                    onClick={() => setTypeFilter(f.v as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      typeFilter === f.v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>

              <div className="flex p-0.5 bg-gray-100 rounded-xl gap-0.5">
                {[
                  { v: "all", l: "All" },
                  { v: "active", l: "Active" },
                  { v: "inactive", l: "Off" },
                ].map((f) => (
                  <button
                    key={f.v}
                    onClick={() => setStatusFilter(f.v as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      statusFilter === f.v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchExtras}
                disabled={isLoadingExtras}
                className="h-10 w-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition-colors cursor-pointer"
              >
                <RefreshCw size={14} className={isLoadingExtras ? "animate-spin" : ""} />
              </button>

              <button
                onClick={openCreate}
                className="h-10 px-4 bg-primary text-gray-900 font-black rounded-xl text-xs transition-all hover:bg-primary-600 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus size={14} className="stroke-[2.5]" /> Add Extra
              </button>
            </div>
          </div>

          {isLoadingExtras ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold">Loading extras...</span>
            </div>
          ) : filteredExtras.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-700">No extras found</h4>
              <p className="text-xs text-gray-400 mt-1">Try adjusting filters or add a new extra.</p>
              <button
                onClick={openCreate}
                className="mt-4 px-5 py-2.5 bg-primary text-gray-900 font-black text-xs rounded-xl inline-flex items-center gap-1.5 hover:bg-primary-600 active:scale-95 cursor-pointer shadow-sm"
              >
                <Plus size={14} /> Add New Extra
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredExtras.map((extra) => (
                <AdminExtraCard
                  key={extra.id}
                  extra={extra}
                  onToggle={handleToggle}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: OVERVIEW (COMPANIES & BRANCHES STATUS) ─── */}
      {activeTab === "overview" && (
        <div className="mt-5 space-y-4">
          {/* Header & Search */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search companies, countries, or branches..."
                value={overviewSearch}
                onChange={(e) => setOverviewSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-9 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 font-medium"
              />
              {overviewSearch && (
                <button
                  onClick={() => setOverviewSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={fetchOverview}
              disabled={isLoadingOverview}
              className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
            >
              <RefreshCw size={13} className={isLoadingOverview ? "animate-spin" : ""} /> Refresh Overview
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 size={20} />
              </div>
              <div>
                <div className="text-xl font-black text-gray-900">{overviewData.length}</div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  Total Suppliers
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="text-xl font-black text-emerald-600">
                  {overviewData.filter((s) => !isSupplierDisabled(s)).length}
                </div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  Active Add-ons Enabled
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle size={20} />
              </div>
              <div>
                <div className="text-xl font-black text-rose-600">
                  {overviewData.filter((s) => isSupplierDisabled(s)).length}
                </div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  All Add-ons Cancelled / Disabled
                </div>
              </div>
            </div>
          </div>

          {/* Overview Filters Bar */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
              {/* Text Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by company, country, or branch..."
                  value={overviewSearch}
                  onChange={(e) => setOverviewSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition-colors"
                />
                {overviewSearch && (
                  <button
                    onClick={() => setOverviewSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-44">
                <CustomSelect
                  value={overviewStatusFilter}
                  onChange={(val) => setOverviewStatusFilter(val as any)}
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "enabled", label: "Extras Enabled" },
                    { value: "disabled", label: "Extras Disabled" },
                  ]}
                  placeholder="Status"
                />
              </div>

              {/* Country Filter */}
              {overviewCountries.length > 0 && (
                <div className="w-full sm:w-44">
                  <CustomSelect
                    value={overviewCountryFilter}
                    onChange={(val) => setOverviewCountryFilter(val)}
                    options={[
                      { value: "all", label: "All Countries" },
                      ...overviewCountries.map((c) => ({ value: c, label: c })),
                    ]}
                    placeholder="Country"
                  />
                </div>
              )}

              {/* Branch Filter */}
              <div className="w-full sm:w-44">
                <CustomSelect
                  value={overviewBranchFilter}
                  onChange={(val) => setOverviewBranchFilter(val as any)}
                  options={[
                    { value: "all", label: "All Companies" },
                    { value: "with_branches", label: "With Branches" },
                    { value: "no_branches", label: "No Branches" },
                  ]}
                  placeholder="Branches"
                />
              </div>
            </div>

            {/* Results Count & Reset */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
              <span className="text-xs font-bold text-gray-500">
                Showing <strong className="text-gray-900">{filteredOverviewData.length}</strong> of {overviewData.length}
              </span>
              {filteredOverviewData.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const allOpen = filteredOverviewData.every((s) => expandedSuppliers[s.supplier_id]);
                    if (allOpen) {
                      setExpandedSuppliers({});
                    } else {
                      const next: Record<number, boolean> = {};
                      filteredOverviewData.forEach((s) => {
                        next[s.supplier_id] = true;
                      });
                      setExpandedSuppliers(next);
                    }
                  }}
                  className="text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {filteredOverviewData.every((s) => expandedSuppliers[s.supplier_id])
                    ? "Collapse All"
                    : "Expand All"}
                </button>
              )}
              {(overviewSearch || overviewStatusFilter !== "all" || overviewCountryFilter !== "all" || overviewBranchFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setOverviewSearch("");
                    setOverviewStatusFilter("all");
                    setOverviewCountryFilter("all");
                    setOverviewBranchFilter("all");
                  }}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Overview List */}
          {isLoadingOverview ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold">Loading suppliers and branches status...</span>
            </div>
          ) : filteredOverviewData.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-xs font-bold">
              No matching suppliers found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOverviewData.map((supplier) => {
                const isExpanded = !!expandedSuppliers[supplier.supplier_id];
                const logoUrl = supplier.logo ? getLogoUrl(supplier.logo) : "";

                return (
                  <div
                    key={supplier.supplier_id}
                    className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden transition-all"
                  >
                    {/* Supplier Row / Header */}
                    <div
                      onClick={() => toggleSupplierExpand(supplier.supplier_id)}
                      className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50/50 hover:bg-gray-100/60 transition-colors cursor-pointer select-none ${
                        isExpanded ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Company Logo / Fallback Badge */}
                        <div className="w-12 h-12 rounded-xl bg-white border border-gray-200/90 shadow-2xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={supplier.supplier_name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget.parentElement?.querySelector(".company-fallback-badge");
                                if (fallback) (fallback as HTMLElement).style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`company-fallback-badge w-full h-full items-center justify-center font-black text-xs uppercase rounded-lg ${
                              logoUrl ? "hidden" : "flex"
                            } ${
                              isSupplierDisabled(supplier)
                                ? "bg-rose-50 text-rose-700"
                                : "bg-emerald-50 text-emerald-800"
                            }`}
                          >
                            {supplier.supplier_name ? supplier.supplier_name.slice(0, 2) : <Building2 size={18} />}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-gray-900">{supplier.supplier_name}</h4>
                            {supplier.country && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200 text-gray-700">
                                {supplier.country}
                              </span>
                            )}
                            {isSupplierDisabled(supplier) ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                                <XCircle size={12} /> All Extras Disabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 size={12} /> Enabled ({supplier.effective_enabled_count}/{supplier.total_active_extras})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {supplier.branches?.length || 0} branches registered
                          </p>
                        </div>
                      </div>

                      {/* Supplier Actions & Chevron */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {isSupplierDisabled(supplier) ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSupplierId(String(supplier.supplier_id));
                              setSelectedBranchOverrideId("");
                              setActiveTab("overrides");
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <CheckCircle2 size={13} /> Enable &amp; Set Pricing
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSupplierExtras(supplier.supplier_id, false);
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <XCircle size={13} /> Disable All Extras
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSupplierId(String(supplier.supplier_id));
                            setSelectedBranchOverrideId("");
                            setActiveTab("overrides");
                          }}
                          className="px-3 py-1.5 bg-primary hover:bg-primary-600 text-gray-900 font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          Edit Pricing
                        </button>

                        {/* Chevron Collapse Toggle Button */}
                        <div
                          className="w-8 h-8 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-2xs transition-all ml-1"
                          title={isExpanded ? "Collapse branches" : "Expand branches"}
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-primary-700" : "text-gray-400"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Branches List (Only shown when expanded) */}
                    {isExpanded && (
                      <div className="bg-white border-t border-gray-100">
                        {supplier.branches && supplier.branches.length > 0 ? (
                          <div className="divide-y divide-gray-100">
                            {supplier.branches.map((branch: any) => (
                              <div
                                key={branch.id}
                                className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <MapPin size={14} className="text-gray-400 shrink-0" />
                                  <span className="text-xs font-bold text-gray-800 truncate">
                                    {branch.name || `Branch #${branch.id}`}
                                  </span>
                                  {branch.city && (
                                    <span className="text-[11px] text-gray-400 font-medium shrink-0">
                                      ({branch.city})
                                    </span>
                                  )}
                                  {branch.is_all_disabled ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                                      Disabled for Branch
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                      Enabled
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {branch.is_all_disabled ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSupplierId(String(supplier.supplier_id));
                                        setSelectedBranchOverrideId(String(branch.id));
                                        setActiveTab("overrides");
                                      }}
                                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                                    >
                                      Enable for Branch
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleSupplierExtras(supplier.supplier_id, false, branch.id);
                                      }}
                                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                                    >
                                      Disable Branch Extras
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSupplierId(String(supplier.supplier_id));
                                      setSelectedBranchOverrideId(String(branch.id));
                                      setActiveTab("overrides");
                                    }}
                                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                                  >
                                    Customize
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-5 py-4 text-xs text-gray-400 font-medium">
                            No branches registered for this company
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: BULK APPLY ─── */}
      {activeTab === "bulk" && (
        <div className="mt-5">
          <BulkWizard
            suppliers={suppliers}
            countries={countries}
            extrasList={extrasList}
            branchOptions={branchOptions}
            onApply={handleBulkApplyFromWizard}
            isApplying={isBulkApplying}
          />
        </div>
      )}

      {/* ─── TAB: PER-COMPANY OVERRIDES ─── */}
      {activeTab === "overrides" && (
        <div className="mt-5 max-w-4xl space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 size={18} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-gray-900">Select Company to Configure</h4>
                <p className="text-xs text-gray-400">
                  Filter and pick a company to manage their add-ons individually.
                </p>
              </div>
              {(supplierFilterCountry || supplierFilterBranch) && (
                <button
                  type="button"
                  onClick={() => {
                    setSupplierFilterCountry("");
                    setSupplierFilterBranch("");
                  }}
                  className="text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Filter by Country
                </label>
                <CustomSelect
                  value={supplierFilterCountry}
                  onChange={(v) => {
                    setSupplierFilterCountry(v);
                    setSupplierFilterBranch("");
                  }}
                  options={[
                    { value: "", label: "All Countries" },
                    ...countries.map((c) => ({ value: c, label: c })),
                  ]}
                  placeholder="All Countries"
                  searchable
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Filter by Branch
                </label>
                <CustomSelect
                  value={supplierFilterBranch}
                  onChange={setSupplierFilterBranch}
                  options={[{ value: "", label: "All Branches" }, ...branchOptions]}
                  placeholder="All Branches"
                  searchable
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Company <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={selectedSupplierId}
                  onChange={(v) => {
                    setSelectedSupplierId(v);
                    setOverrideSearch("");
                  }}
                  options={filteredCompanyOptions}
                  placeholder={
                    filteredCompanyOptions.length === 0
                      ? "No companies match filters"
                      : "Choose a company..."
                  }
                  searchable
                />
              </div>
            </div>
          </div>

          {selectedSupplierId && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-gray-900">
                    {selectedSupplierName} — Add-ons
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Customize prices and profit margins specifically for this supplier.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quick Toggle 1-Click Buttons */}
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleSupplierExtras(
                        Number(selectedSupplierId),
                        false,
                        selectedBranchOverrideId
                      )
                    }
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <XCircle size={13} /> Disable All Extras
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleSupplierExtras(
                        Number(selectedSupplierId),
                        true,
                        selectedBranchOverrideId
                      )
                    }
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCircle2 size={13} /> Enable All Extras
                  </button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={overrideSearch}
                      onChange={(e) => setOverrideSearch(e.target.value)}
                      className="w-32 h-8 pl-8 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Target Branch Selector */}
              {branches.length > 0 && (
                <div className="px-4 py-2.5 bg-blue-50/50 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-gray-700">Target Specific Branch:</span>
                    <span className="text-gray-400 text-[11px]">(Optional — leave blank for company default)</span>
                  </div>
                  <div className="w-full sm:w-72">
                    <CustomSelect
                      value={selectedBranchOverrideId}
                      onChange={setSelectedBranchOverrideId}
                      options={[
                        { value: "", label: "Entire Company (Default for all branches)" },
                        ...branches.map((b) => ({
                          value: String(b.id),
                          label: `${b.name || b.location || `Branch #${b.id}`}${b.city ? ` — ${b.city}` : ""}`,
                        })),
                      ]}
                      placeholder="Entire Company (Default)"
                      searchable
                    />
                  </div>
                </div>
              )}

              {/* Quick Profit Margin Bar for this Company */}
              <div className="p-3 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <TrendingUp size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-gray-900 block">
                      Quick Set Profit Margin for this Company
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Apply uniform markup % to all extras of this supplier
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-28">
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      placeholder="e.g. 15"
                      value={companyQuickProfit}
                      onChange={(e) => setCompanyQuickProfit(e.target.value)}
                      className="w-full h-8 pl-3 pr-7 bg-white border border-gray-200 rounded-lg text-xs font-black text-emerald-700 outline-none focus:border-primary"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      %
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCompanyQuickProfit}
                    className="px-3 py-1.5 bg-primary hover:bg-primary-600 text-gray-900 text-xs font-black rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Apply to All
                  </button>
                </div>
              </div>

              {isLoadingOverrides ? (
                <div className="p-16 flex flex-col items-center gap-3 text-gray-400">
                  <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold">Loading...</span>
                </div>
              ) : overrideCatalog.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs font-bold">
                  No active extras in the catalog.
                </div>
              ) : (
                <div>
                  {overrideCatalog
                    .filter(
                      (item) =>
                        !overrideSearch.trim() ||
                        item.name.toLowerCase().includes(overrideSearch.toLowerCase())
                    )
                    .map((extra: any, idx: number, arr: any[]) => {
                      const activeBranch = branches.find(
                        (b: any) => String(b.id) === String(selectedBranchOverrideId)
                      );
                      const currentScopeCurrency =
                        activeBranch?.currency || extra.currency || "USD";

                      const values = overrideLocalData[extra.id] ?? {
                        enabled: extra.enabled,
                        custom_price: extra.custom_price,
                        profit_percent: extra.profit_percent,
                      };
                      return (
                        <ExtraPricingRow
                          key={extra.id}
                          item={{ ...extra, currency: currentScopeCurrency }}
                          values={values}
                          priceLabel="Supplier Price"
                          borderBottom={idx < arr.length - 1}
                          onToggle={(enabled) =>
                            setOverrideLocalData((prev) => ({
                              ...prev,
                              [extra.id]: { ...prev[extra.id], enabled },
                            }))
                          }
                          onPriceChange={(custom_price) =>
                            setOverrideLocalData((prev) => ({
                              ...prev,
                              [extra.id]: { ...prev[extra.id], custom_price },
                            }))
                          }
                          onProfitChange={(profit_percent) =>
                            setOverrideLocalData((prev) => ({
                              ...prev,
                              [extra.id]: { ...prev[extra.id], profit_percent },
                            }))
                          }
                        />
                      );
                    })}

                  {!isLoadingOverrides && overrideCatalog.length > 0 && (
                    <div className="p-4 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-3">
                      <p className="text-xs text-gray-500">
                        Configuring <strong className="text-gray-900">{selectedSupplierName}</strong>
                      </p>
                      <button
                        onClick={handleSaveOverrides}
                        disabled={isSavingOverrides}
                        className="px-6 py-2.5 bg-primary text-gray-900 font-black rounded-xl text-sm hover:bg-primary-600 active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                      >
                        {isSavingOverrides ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={15} /> Save Configuration
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL ─── */}
      <CreateEditExtraModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingExtra={editingExtra}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </SectionLayout>
  );
}
