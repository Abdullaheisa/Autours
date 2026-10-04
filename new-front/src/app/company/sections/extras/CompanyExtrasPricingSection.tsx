"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  MapPin,
  Layers,
  Save,
  RefreshCw,
  Search,
  X,
  AlertCircle,
  Globe,
  Check,
  TrendingUp,
  PackageCheck,
  Package,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { extrasPricingApi, profitApi } from "@/services/api";
import SectionLayout from "@/components/shared/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";
import CustomSelect from "@/components/ui/CustomSelect";
import ExtraPricingRow, { ExtraPricingItem } from "@/components/extras/ExtraPricingRow";

type ScopeType = "company" | "country" | "branch";

interface CatalogExtra extends ExtraPricingItem {
  id: number;
  name: string;
  description: string;
  badge?: string;
  type: "boolean" | "quantity";
  max_qty: number;
  price: number;
  custom_price: number;
  currency: string;
  enabled: boolean;
}

export default function CompanyExtrasPricingSection() {
  const { user } = useSelector((state: RootState) => state.auth);

  const [scope, setScope] = useState<ScopeType>("company");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  const [myBranches, setMyBranches] = useState<any[]>([]);
  const [myCountries, setMyCountries] = useState<string[]>([]);
  const [isLoadingScope, setIsLoadingScope] = useState(false);

  const [catalog, setCatalog] = useState<CatalogExtra[]>([]);
  const [localData, setLocalData] = useState<Record<number, { enabled: boolean; custom_price: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [bulkPrice, setBulkPrice] = useState("");

  useEffect(() => {
    async function loadBranches() {
      setIsLoadingScope(true);
      try {
        const res: any = await profitApi.getBranches(user?.id ? String(user.id) : undefined);
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setMyBranches(list);

        const countriesSet = new Set<string>();
        list.forEach((b: any) => {
          if (b.country && typeof b.country === "string") {
            countriesSet.add(b.country.trim());
          }
        });
        setMyCountries(Array.from(countriesSet).sort());
      } catch {
        // Fallback
      } finally {
        setIsLoadingScope(false);
      }
    }
    loadBranches();
  }, [user?.id]);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      let res: any;
      if (scope === "branch" && selectedBranchId) {
        res = await extrasPricingApi.supplierGetBranchCatalog(selectedBranchId);
      } else if (scope === "country" && selectedCountry) {
        res = await extrasPricingApi.supplierGetCountryCatalog(selectedCountry);
      } else {
        res = await extrasPricingApi.supplierGetCatalog();
      }

      const items: CatalogExtra[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res)
        ? res
        : [];

      setCatalog(items);
      const init: Record<number, { enabled: boolean; custom_price: number }> = {};
      items.forEach((item) => {
        init[item.id] = {
          enabled: item.enabled,
          custom_price: item.custom_price,
        };
      });
      setLocalData(init);
    } catch {
      toast.error("Failed to load extras catalog");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      scope === "company" ||
      (scope === "country" && selectedCountry) ||
      (scope === "branch" && selectedBranchId)
    ) {
      fetchCatalog();
    }
  }, [user?.id, scope, selectedCountry, selectedBranchId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = catalog.map((item) => ({
        extra_id: item.id,
        enabled: localData[item.id]?.enabled ?? false,
        custom_price: localData[item.id]?.custom_price ?? item.custom_price,
      }));

      if (scope === "branch" && selectedBranchId) {
        await extrasPricingApi.supplierSaveBranchExtras(selectedBranchId, payload);
      } else if (scope === "country" && selectedCountry) {
        await extrasPricingApi.supplierSaveCountryExtras(selectedCountry, payload);
      } else {
        await extrasPricingApi.supplierSaveExtras(payload);
      }

      const scopeLabel =
        scope === "branch"
          ? `Branch #${selectedBranchId}`
          : scope === "country"
          ? selectedCountry
          : "your company";
      toast.success(`Extras saved for ${scopeLabel}! 🎉`);
      fetchCatalog();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save extras");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkPrice = () => {
    const v = parseFloat(bulkPrice);
    if (isNaN(v) || v < 0) {
      toast.error("Enter a valid price");
      return;
    }
    setLocalData((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        const id = Number(k);
        if (next[id]) next[id] = { ...next[id], custom_price: v };
      });
      return next;
    });
    toast.success(`$${v} price set on all extras — save to apply.`);
  };

  const [isDirectToggling, setIsDirectToggling] = useState(false);

  const handleDirectToggleAll = async (enable: boolean) => {
    setIsDirectToggling(true);
    try {
      await extrasPricingApi.supplierToggleExtras({
        enable,
        branch_id: scope === "branch" && selectedBranchId ? Number(selectedBranchId) : undefined,
        country: scope === "country" && selectedCountry ? selectedCountry : undefined,
      });
      toast.success(
        enable
          ? "All extras enabled successfully! 🎉"
          : "All extras cancelled/disabled successfully!"
      );
      setLocalData((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          const id = Number(k);
          if (next[id]) next[id] = { ...next[id], enabled: enable };
        });
        return next;
      });
      fetchCatalog();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update extras status");
    } finally {
      setIsDirectToggling(false);
    }
  };

  const handleToggleAll = (enable: boolean) => {
    setLocalData((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        const id = Number(k);
        if (next[id]) next[id] = { ...next[id], enabled: enable };
      });
      return next;
    });
    toast.success(`${enable ? "Enabled" : "Disabled"} all extras — save to apply.`);
  };

  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return catalog;
    const q = searchQuery.toLowerCase();
    return catalog.filter(
      (item) =>
        item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)
    );
  }, [catalog, searchQuery]);

  const enabledCount = catalog.filter((item) => localData[item.id]?.enabled).length;
  const totalCount = catalog.length;

  const branchOptions = useMemo(
    () =>
      myBranches.map((b) => ({
        value: String(b.id),
        label: `${b.name || b.location || `Branch #${b.id}`}${b.city ? ` — ${b.city}` : ""}${
          b.country ? ` (${b.country})` : ""
        }`,
      })),
    [myBranches]
  );

  const filteredBranchOptions = useMemo(() => {
    if (!selectedCountry || scope !== "branch") return branchOptions;
    return myBranches
      .filter((b) => b.country === selectedCountry)
      .map((b) => ({
        value: String(b.id),
        label: `${b.name || b.location || `Branch #${b.id}`}${b.city ? ` — ${b.city}` : ""}`,
      }));
  }, [branchOptions, myBranches, selectedCountry, scope]);

  const scopeReady =
    scope === "company" ||
    (scope === "country" && !!selectedCountry) ||
    (scope === "branch" && !!selectedBranchId);

  const selectedBranchName =
    myBranches.find((b) => String(b.id) === selectedBranchId)?.name ||
    `Branch #${selectedBranchId}`;

  return (
    <SectionLayout>
      <PageHeader
        title="Extras & Add-ons"
        description="Choose which add-ons you offer and set your service prices in USD ($) — for the whole company, by country, or per branch."
        showAction={false}
      />


      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          {
            icon: <Layers className="w-5 h-5" />,
            value: totalCount,
            label: "Available",
            bg: "bg-blue-50",
            text: "text-blue-600",
          },
          {
            icon: <PackageCheck className="w-5 h-5" />,
            value: enabledCount,
            label: "Enabled",
            bg: "bg-emerald-50",
            text: "text-emerald-600",
          },
          {
            icon: <TrendingUp className="w-5 h-5" />,
            value: totalCount - enabledCount,
            label: "Not Offered",
            bg: "bg-purple-50",
            text: "text-purple-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl ${s.bg} ${s.text} flex items-center justify-center shrink-0`}
            >
              {s.icon}
            </div>
            <div>
              <div className="text-xl font-black text-gray-900">{s.value}</div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scope Selector */}
      <div className="mt-5 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Globe size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900">Configure Pricing Scope</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Set prices for your whole company, a specific country, or an individual branch.
            </p>
          </div>
        </div>

        {/* Scope Type Pills */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            {
              id: "company" as ScopeType,
              label: "Whole Company",
              icon: <Building2 size={15} />,
              desc: "Default for all branches",
              color: "text-blue-500",
            },
            {
              id: "country" as ScopeType,
              label: "By Country",
              icon: <MapPin size={15} />,
              desc: `${myCountries.length} countries`,
              color: "text-emerald-500",
            },
            {
              id: "branch" as ScopeType,
              label: "Per Branch",
              icon: <Layers size={15} />,
              desc: `${myBranches.length} branches`,
              color: "text-purple-500",
            },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setScope(s.id);
                setSelectedCountry("");
                setSelectedBranchId("");
              }}
              className={`flex items-center gap-2.5 p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                scope === s.id
                  ? "border-primary bg-primary text-gray-900 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className={scope === s.id ? "text-gray-900" : s.color}>{s.icon}</div>
              <div>
                <div className="text-xs font-black text-gray-900">{s.label}</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    scope === s.id ? "text-gray-700 font-semibold" : "text-gray-400"
                  }`}
                >
                  {s.desc}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Country Sub-selector */}
        {scope === "country" && (
          <div className="pt-4 border-t border-gray-100 animate-in fade-in duration-150">
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Select Country <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {myCountries.length === 0 && isLoadingScope ? (
                <div className="col-span-full text-xs text-gray-400 flex items-center gap-2">
                  <RefreshCw size={12} className="animate-spin" /> Loading countries...
                </div>
              ) : myCountries.length === 0 ? (
                <div className="col-span-full text-xs text-gray-400 flex items-center gap-2">
                  <AlertCircle size={12} /> No countries found for your company.
                </div>
              ) : (
                myCountries.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => setSelectedCountry(country)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                      selectedCountry === country
                        ? "border-primary bg-primary text-gray-900 font-black shadow-xs"
                        : "border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <MapPin
                      size={12}
                      className={selectedCountry === country ? "text-gray-900" : "text-gray-400"}
                    />
                    {country}
                    {selectedCountry === country && (
                      <Check size={11} className="ml-auto stroke-[3] text-gray-900" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Branch Sub-selector */}
        {scope === "branch" && (
          <div className="pt-4 border-t border-gray-100 animate-in fade-in duration-150 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myCountries.length > 1 && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Filter by Country{" "}
                    <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <CustomSelect
                    value={selectedCountry}
                    onChange={(v) => {
                      setSelectedCountry(v);
                      setSelectedBranchId("");
                    }}
                    options={[
                      { value: "", label: "All Countries" },
                      ...myCountries.map((c) => ({ value: c, label: c })),
                    ]}
                    placeholder="All Countries"
                  />
                </div>
              )}
              <div className={myCountries.length > 1 ? "" : "sm:col-span-2"}>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select Branch <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={selectedBranchId}
                  onChange={setSelectedBranchId}
                  options={filteredBranchOptions}
                  placeholder={
                    filteredBranchOptions.length === 0
                      ? "No branches available"
                      : "Choose a branch..."
                  }
                  disabled={filteredBranchOptions.length === 0}
                  searchable
                />
              </div>
            </div>
            {!selectedBranchId && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5">
                <AlertCircle size={12} className="shrink-0" /> Select a branch to configure its
                extras.
              </p>
            )}
          </div>
        )}

        {/* Scope Context Banner */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Currently configuring:{" "}
            <strong className="text-gray-900">
              {scope === "company"
                ? "Whole Company (applies to all branches unless overridden)"
                : scope === "country"
                ? selectedCountry
                  ? `Country: ${selectedCountry}`
                  : "No country selected"
                : selectedBranchId
                ? `Branch: ${selectedBranchName}`
                : "No branch selected"}
            </strong>
          </span>
          {scopeReady && (
            <button
              onClick={fetchCatalog}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer font-medium"
            >
              <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} /> Reload
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {scopeReady && (
        <>
          {/* Quick Bulk Bar (Price ONLY, NO Profit %) */}
          <div className="mt-5 bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp size={16} />
              </div>
              <div>
                <span className="text-xs font-black text-gray-900 block">Quick Bulk Actions</span>
                <span className="text-[11px] text-gray-400">
                  Set uniform price or toggle all extras on/off
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Base Price */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1">
                <div className="relative flex items-center w-28">
                  <span className="absolute left-2.5 text-[11px] font-bold text-gray-400 pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    placeholder="Price"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    className="w-full h-8 pl-6 pr-2 text-xs font-black bg-transparent outline-none text-gray-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleBulkPrice}
                  className="px-3 py-1.5 bg-primary hover:bg-primary-600 text-gray-900 text-xs font-black rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Apply to All
                </button>
              </div>

              {/* Toggle All (1-Click Instant) */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  disabled={isDirectToggling}
                  onClick={() => handleDirectToggleAll(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 size={13} />
                  Enable All Extras
                </button>
                <button
                  type="button"
                  disabled={isDirectToggling}
                  onClick={() => handleDirectToggleAll(false)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <XCircle size={13} />
                  Disable All Extras
                </button>
              </div>
            </div>
          </div>

          {/* Status Alert if All Cancelled / Disabled */}
          {catalog.length > 0 && enabledCount === 0 && !isLoading && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <XCircle size={20} />
                </div>
                <div>
                  <p className="font-black text-sm text-rose-950">All extras and options are disabled for this scope</p>
                  <p className="text-rose-700 text-xs mt-0.5">
                    No extras will be shown to customers in search results or checkout for cars under this scope (
                    <strong>
                      {scope === "company"
                        ? "Whole Company"
                        : scope === "country"
                        ? `Country: ${selectedCountry}`
                        : selectedBranchName}
                    </strong>
                    ).
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDirectToggling}
                onClick={() => handleDirectToggleAll(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shrink-0 cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 size={13} /> Enable All Extras Now
              </button>
            </div>
          )}

          {/* Catalog Card */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-gray-900">Extras Catalog</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Toggle the extras you offer and set your price for each.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search extras..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <button
                  onClick={fetchCatalog}
                  disabled={isLoading}
                  className="h-9 w-9 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold">Loading extras catalog...</span>
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="py-16 text-center">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-500">No extras available yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Extras will appear here once the admin adds them to the catalog.
                </p>
              </div>
            ) : (
              <div>
                {filteredCatalog.map((extra, index) => {
                  const activeBranch = myBranches.find(
                    (b: any) => String(b.id) === String(selectedBranchId)
                  );
                  const currentScopeCurrency =
                    activeBranch?.currency || extra.currency || "USD";

                  const values = localData[extra.id] ?? {
                    enabled: false,
                    custom_price: extra.custom_price,
                  };
                  return (
                    <ExtraPricingRow
                      key={extra.id}
                      item={{ ...extra, currency: currentScopeCurrency }}
                      values={values}
                      mode="company"
                      priceLabel="Your Price"
                      borderBottom={index < filteredCatalog.length - 1}
                      onToggle={(enabled) =>
                        setLocalData((prev) => ({
                          ...prev,
                          [extra.id]: { ...prev[extra.id], enabled },
                        }))
                      }
                      onPriceChange={(custom_price) =>
                        setLocalData((prev) => ({
                          ...prev,
                          [extra.id]: { ...prev[extra.id], custom_price },
                        }))
                      }
                    />
                  );
                })}
              </div>
            )}

            {!isLoading && catalog.length > 0 && (
              <div className="p-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  Saving for{" "}
                  <strong className="text-gray-900">
                    {scope === "company"
                      ? "your whole company"
                      : scope === "country"
                      ? selectedCountry
                      : selectedBranchName}
                  </strong>
                </p>
                <button
                  onClick={handleSave}
                  disabled={isSaving || isLoading}
                  className="px-7 py-2.5 bg-primary hover:bg-primary-600 text-gray-900 font-black rounded-xl text-sm shadow-sm hover:shadow active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
                >
                  {isSaving ? (
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
        </>
      )}
    </SectionLayout>
  );
}