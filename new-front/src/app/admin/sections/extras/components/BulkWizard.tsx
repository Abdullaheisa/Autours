"use client";

import React, { useState, useMemo } from "react";
import {
  Zap,
  Globe,
  MapPin,
  Building2,
  Layers,
  ArrowRight,
  Check,
  AlertCircle,
  RefreshCw,
  Edit3,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Package,
} from "lucide-react";
import CustomSelect, { CustomSelectOption } from "@/components/ui/CustomSelect";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { ExtraItem } from "./AdminExtraCard";

export interface BulkWizardPayload {
  scope: "all" | "country" | "company" | "branch";
  country?: string;
  supplier_id?: number;
  branch_id?: number;
  extras_mode: "all" | "selected";
  extra_ids: number[];
  profit_percent?: number;
  price?: number;
  enable_all?: boolean;
}

export interface BulkWizardProps {
  suppliers: { id: number; name: string; country?: string; branch_id?: number }[];
  countries: string[];
  extrasList: ExtraItem[];
  branchOptions: CustomSelectOption[];
  onApply: (payload: BulkWizardPayload) => Promise<void>;
  isApplying: boolean;
}

function StepBadge({
  step,
  active,
  done,
}: {
  step: number;
  active: boolean;
  done: boolean;
}) {
  if (done)
    return (
      <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
        <Check size={13} className="text-white stroke-[3]" />
      </div>
    );
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black transition-all ${
        active ? "bg-primary text-gray-900 shadow-sm" : "bg-gray-100 text-gray-400"
      }`}
    >
      {step}
    </div>
  );
}

export default function BulkWizard({
  suppliers,
  countries,
  extrasList,
  branchOptions,
  onApply,
  isApplying,
}: BulkWizardProps) {
  const [bulkStep, setBulkStep] = useState<1 | 2 | 3>(1);
  const [bulkScope, setBulkScope] = useState<"all" | "country" | "company" | "branch">("all");
  const [bulkCountry, setBulkCountry] = useState("");
  const [bulkSupplierId, setBulkSupplierId] = useState("");
  const [bulkBranchId, setBulkBranchId] = useState("");

  const [bulkTargetExtras, setBulkTargetExtras] = useState<"all" | "selected">("all");
  const [bulkSelectedExtraIds, setBulkSelectedExtraIds] = useState<number[]>([]);

  const [bulkProfit, setBulkProfit] = useState("");
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkEnableAll, setBulkEnableAll] = useState(false);

  const countryOptions = useMemo(
    () => countries.map((c) => ({ value: c, label: c })),
    [countries]
  );

  const filteredBulkSuppliers = useMemo(() => {
    let list = suppliers;
    if (bulkCountry) list = list.filter((s) => s.country === bulkCountry);
    return list.map((s) => ({ value: String(s.id), label: s.name, sublabel: s.country }));
  }, [suppliers, bulkCountry]);

  const step1Valid =
    bulkScope === "all" ||
    (bulkScope === "country" && !!bulkCountry) ||
    (bulkScope === "company" && !!bulkSupplierId) ||
    (bulkScope === "branch" && !!bulkBranchId);

  const activeCount = extrasList.filter((e) => e.is_active).length;
  const step2Valid =
    bulkTargetExtras === "all" ? activeCount > 0 : bulkSelectedExtraIds.length > 0;

  const step3HasValue = bulkProfit !== "" || bulkPrice !== "" || bulkEnableAll;

  const bulkScopeSummary = useMemo(() => {
    if (bulkScope === "all") return `All Companies (${suppliers.length})`;
    if (bulkScope === "country") return `Country: ${bulkCountry || "Not selected"}`;
    if (bulkScope === "company") {
      const s = suppliers.find((x) => String(x.id) === bulkSupplierId);
      return `Company: ${s?.name || bulkSupplierId || "Not selected"}`;
    }
    if (bulkScope === "branch") {
      const b = branchOptions.find((x) => x.value === bulkBranchId);
      return `Branch: ${b?.label || bulkBranchId || "Not selected"}`;
    }
    return "";
  }, [bulkScope, bulkCountry, bulkSupplierId, bulkBranchId, suppliers, branchOptions]);

  const handleApply = async () => {
    const payload: BulkWizardPayload = {
      scope: bulkScope,
      country: bulkCountry || undefined,
      supplier_id: bulkSupplierId ? Number(bulkSupplierId) : undefined,
      branch_id: bulkBranchId ? Number(bulkBranchId) : undefined,
      extras_mode: bulkTargetExtras,
      extra_ids:
        bulkTargetExtras === "selected"
          ? bulkSelectedExtraIds
          : extrasList.filter((e) => e.is_active).map((e) => e.id),
      profit_percent: bulkProfit !== "" ? parseFloat(bulkProfit) : undefined,
      price: bulkPrice !== "" ? parseFloat(bulkPrice) : undefined,
      enable_all: bulkEnableAll || undefined,
    };
    await onApply(payload);
  };

  return (
    <div className="max-w-3xl space-y-4">
      {/* Header & Steps Progress */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">Bulk Apply Pricing</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Update profit margins, prices, or activate add-ons across multiple companies.
            </p>
          </div>
        </div>

        <div className="flex items-center">
          {(
            [
              { n: 1 as const, label: "Who" },
              { n: 2 as const, label: "Which Extras" },
              { n: 3 as const, label: "What to Apply" },
            ] as const
          ).map((s, i) => (
            <React.Fragment key={s.n}>
              <button
                type="button"
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  if (s.n === 1) setBulkStep(1);
                  if (s.n === 2 && step1Valid) setBulkStep(2);
                  if (s.n === 3 && step1Valid && step2Valid) setBulkStep(3);
                }}
              >
                <StepBadge step={s.n} active={bulkStep === s.n} done={bulkStep > s.n} />
                <span
                  className={`text-xs font-bold ${
                    bulkStep === s.n
                      ? "text-gray-900"
                      : bulkStep > s.n
                      ? "text-emerald-600"
                      : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {i < 2 && (
                <div
                  className={`flex-1 mx-3 h-0.5 rounded-full transition-colors ${
                    bulkStep > s.n ? "bg-emerald-400" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Scope */}
      {bulkStep === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-black text-gray-900">
              Step 1 — Who will receive this update?
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">Choose target scope.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                id: "all" as const,
                label: "All Companies",
                icon: <Globe size={18} />,
                desc: `${suppliers.length} companies`,
                color: "text-blue-500",
              },
              {
                id: "country" as const,
                label: "By Country",
                icon: <MapPin size={18} />,
                desc: `${countries.length} countries`,
                color: "text-emerald-500",
              },
              {
                id: "company" as const,
                label: "One Company",
                icon: <Building2 size={18} />,
                desc: "Pick company",
                color: "text-purple-500",
              },
              {
                id: "branch" as const,
                label: "One Branch",
                icon: <Layers size={18} />,
                desc: "Pick branch",
                color: "text-amber-500",
              },
            ].map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  setBulkScope(sc.id);
                  setBulkCountry("");
                  setBulkSupplierId("");
                  setBulkBranchId("");
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  bulkScope === sc.id
                    ? "border-primary bg-primary text-gray-900 shadow-sm"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className={bulkScope === sc.id ? "text-gray-900" : sc.color}>{sc.icon}</div>
                <div>
                  <div className="text-xs font-black">{sc.label}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      bulkScope === sc.id ? "text-gray-700 font-semibold" : "text-gray-400"
                    }`}
                  >
                    {sc.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {bulkScope !== "all" && (
            <div className="pt-3 border-t border-gray-100 space-y-3">
              {bulkScope === "country" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Select Country
                  </label>
                  <CustomSelect
                    value={bulkCountry}
                    onChange={setBulkCountry}
                    placeholder="Choose a country..."
                    searchable
                    options={countryOptions}
                  />
                </div>
              )}
              {bulkScope === "company" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Country <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <CustomSelect
                      value={bulkCountry}
                      onChange={(v) => {
                        setBulkCountry(v);
                        setBulkSupplierId("");
                      }}
                      placeholder="All Countries"
                      searchable
                      options={[{ value: "", label: "All Countries" }, ...countryOptions]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={bulkSupplierId}
                      onChange={setBulkSupplierId}
                      placeholder="Choose a company..."
                      searchable
                      options={filteredBulkSuppliers}
                    />
                  </div>
                </div>
              )}
              {bulkScope === "branch" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Country <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <CustomSelect
                      value={bulkCountry}
                      onChange={(v) => {
                        setBulkCountry(v);
                        setBulkBranchId("");
                      }}
                      placeholder="All Countries"
                      searchable
                      options={[{ value: "", label: "All Countries" }, ...countryOptions]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Company <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <CustomSelect
                      value={bulkSupplierId}
                      onChange={(v) => {
                        setBulkSupplierId(v);
                        setBulkBranchId("");
                      }}
                      placeholder="All Companies"
                      searchable
                      options={[{ value: "", label: "All Companies" }, ...filteredBulkSuppliers]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Branch <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={bulkBranchId}
                      onChange={setBulkBranchId}
                      placeholder="Choose a branch..."
                      searchable
                      options={branchOptions}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              disabled={!step1Valid}
              onClick={() => setBulkStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-gray-900 font-black text-sm rounded-xl disabled:opacity-40 hover:bg-primary-600 transition-all cursor-pointer shadow-sm"
            >
              Next: Pick Extras <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Extras */}
      {bulkStep === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h4 className="text-sm font-black text-gray-900">
                Step 2 — Which extras to update?
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                All active extras or select specific ones.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-xl">
              <Globe size={11} className="text-gray-500" />
              <span className="text-xs font-bold text-gray-700">{bulkScopeSummary}</span>
              <button
                type="button"
                onClick={() => setBulkStep(1)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer ml-1"
              >
                <Edit3 size={11} />
              </button>
            </div>
          </div>

          <div className="flex p-0.5 bg-gray-100 rounded-xl gap-0.5 w-fit">
            <button
              type="button"
              onClick={() => {
                setBulkTargetExtras("all");
                setBulkSelectedExtraIds([]);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                bulkTargetExtras === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              All Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setBulkTargetExtras("selected")}
              className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                bulkTargetExtras === "selected"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Choose Specific{" "}
              {bulkTargetExtras === "selected" &&
                bulkSelectedExtraIds.length > 0 &&
                `(${bulkSelectedExtraIds.length})`}
            </button>
          </div>

          {bulkTargetExtras === "selected" && (
            <div>
              <p className="text-xs text-gray-500 mb-3">Click to toggle selection:</p>
              <div className="flex flex-wrap gap-2">
                {extrasList
                  .filter((e) => e.is_active)
                  .map((extra) => {
                    const sel = bulkSelectedExtraIds.includes(extra.id);
                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() =>
                          setBulkSelectedExtraIds((prev) =>
                            sel ? prev.filter((id) => id !== extra.id) : [...prev, extra.id]
                          )
                        }
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                          sel
                            ? "bg-primary text-gray-900 border-primary shadow-xs"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {sel && <Check size={11} className="stroke-[3] text-gray-900" />}
                        {extra.name}
                      </button>
                    );
                  })}
              </div>
              {bulkSelectedExtraIds.length === 0 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> Select at least one extra.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setBulkStep(1)}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={!step2Valid}
              onClick={() => setBulkStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-gray-900 font-black text-sm rounded-xl disabled:opacity-40 hover:bg-primary-600 transition-all cursor-pointer shadow-sm"
            >
              Next: Set Values <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Values & Apply */}
      {bulkStep === 3 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h4 className="text-sm font-black text-gray-900">
                Step 3 — What changes to apply?
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Fill in one or more values. Leave blank to keep unchanged.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg">
                <Globe size={11} className="text-gray-500" />
                <span className="text-[11px] font-bold text-gray-700">{bulkScopeSummary}</span>
                <button
                  type="button"
                  onClick={() => setBulkStep(1)}
                  className="text-gray-400 hover:text-gray-700 cursor-pointer ml-1"
                >
                  <Edit3 size={10} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg">
                <Package size={11} className="text-gray-500" />
                <span className="text-[11px] font-bold text-gray-700">
                  {bulkTargetExtras === "all"
                    ? `All ${activeCount} extras`
                    : `${bulkSelectedExtraIds.length} selected`}
                </span>
                <button
                  type="button"
                  onClick={() => setBulkStep(2)}
                  className="text-gray-400 hover:text-gray-700 cursor-pointer ml-1"
                >
                  <Edit3 size={10} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
            <span className="font-black text-emerald-900 shrink-0">💡 Tip:</span>
            <span>
              To apply your profit markup without touching supplier prices, fill in <strong>Profit Margin (%)</strong> and leave Base Price blank.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Profit Margin */}
            <div
              className={`rounded-2xl border-2 p-4 transition-all ${
                bulkProfit !== ""
                  ? "border-amber-300 bg-amber-50/40"
                  : "border-gray-200 bg-gray-50/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-amber-500" />
                  <span className="text-xs font-black text-gray-900">Profit Margin</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                  %
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">Markup % on supplier cost.</p>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="e.g. 15"
                  value={bulkProfit}
                  onChange={(e) => setBulkProfit(e.target.value)}
                  className="w-full h-10 pl-3 pr-7 rounded-xl bg-white border border-gray-200 text-gray-900 font-black text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  %
                </span>
              </div>
            </div>

            {/* Base Price */}
            <div
              className={`rounded-2xl border-2 p-4 transition-all ${
                bulkPrice !== ""
                  ? "border-blue-300 bg-blue-50/40"
                  : "border-gray-200 bg-gray-50/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <DollarSign size={14} className="text-blue-500" />
                  <span className="text-xs font-black text-gray-900">Base Price</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  Flat
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">Uniform price override.</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="e.g. 20"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  className="w-full h-10 pl-7 pr-3 rounded-xl bg-white border border-gray-200 text-gray-900 font-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 text-center"
                />
              </div>
            </div>

            {/* Activate Add-ons */}
            <div
              onClick={() => setBulkEnableAll(!bulkEnableAll)}
              className={`rounded-2xl border-2 p-4 transition-all cursor-pointer ${
                bulkEnableAll
                  ? "border-emerald-400 bg-emerald-50/40"
                  : "border-gray-200 bg-gray-50/40 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2
                    size={14}
                    className={bulkEnableAll ? "text-emerald-500" : "text-gray-400"}
                  />
                  <span className="text-xs font-black text-gray-900">Activate Add-ons</span>
                </div>
                <ToggleSwitch checked={bulkEnableAll} onChange={setBulkEnableAll} />
              </div>
              <p className="text-[11px] text-gray-500 mb-3">Force-enable all targeted add-ons.</p>
              <div
                className={`h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                  bulkEnableAll
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-white text-gray-400 border border-gray-200"
                }`}
              >
                {bulkEnableAll ? "✓ Will be enabled" : "Keep current status"}
              </div>
            </div>
          </div>

          {!step3HasValue && (
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 font-bold">
                Fill at least one value above before applying.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setBulkStep(2)}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying || !step3HasValue}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-gray-900 font-black text-sm rounded-xl disabled:opacity-40 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              {isApplying ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Applying...
                </>
              ) : (
                <>
                  <Zap size={15} /> Apply Now
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
