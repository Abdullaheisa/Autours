"use client";

import React from "react";
import { Sparkles, X, Check, HelpCircle, Trash2, Plus } from "lucide-react";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import CustomSelect from "@/components/ui/CustomSelect";
import { ExtraItem } from "./AdminExtraCard";

const BADGE_SUGGESTIONS = [
  "Popular",
  "Recommended",
  "Free",
  "Must Have",
  "Best Value",
  "Essential",
];

export interface ExtraFaq {
  question: string;
  answer: string;
}

export interface ExtraFormData {
  name: string;
  description: string;
  price: number;
  profit_percent: number;
  currency: string;
  type: "boolean" | "quantity";
  max_qty: number;
  badge: string;
  is_active: boolean;
  faqs?: ExtraFaq[];
}

export interface CreateEditExtraModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingExtra: ExtraItem | null;
  formData: ExtraFormData;
  setFormData: React.Dispatch<React.SetStateAction<ExtraFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export default function CreateEditExtraModal({
  isOpen,
  onClose,
  editingExtra,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}: CreateEditExtraModalProps) {
  if (!isOpen) return null;

  const basePrice = Number(formData.price) || 0;
  const profit = Number(formData.profit_percent) || 0;
  const calcPrice = profit > 0 ? basePrice + (basePrice * profit) / 100 : basePrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl border border-gray-200/80 flex flex-col z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary-700 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">
                {editingExtra ? "Edit Extra Add-on" : "Create New Extra"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Configure pricing, type, and details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
          <form id="extra-form" onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Additional Driver, GPS Navigation"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white text-sm text-gray-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
              <textarea
                rows={2}
                placeholder="Explain what this service includes..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white text-sm text-gray-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
              />
            </div>

            {/* Pricing Section */}
            <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                <span className="text-xs font-black text-gray-900">Pricing & Profit</span>
                <span className="text-xs text-gray-400">Flat fee per rental</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                    Base Cost <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={0.5}
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white font-black text-sm text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                    Profit (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      step={1}
                      placeholder="0"
                      value={formData.profit_percent}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          profit_percent: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full h-10 pl-3 pr-7 rounded-xl border border-gray-200 bg-white font-black text-sm text-emerald-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                    Currency
                  </label>
                  <div className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-100/90 flex items-center justify-between text-xs font-black text-gray-800 select-none">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">$</span>
                      USD ($)
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fixed Base</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-gray-200/80">
                <div>
                  <span className="text-xs font-bold text-gray-600 block">Catalog Price (USD):</span>
                  <span className="text-[10px] text-gray-400">Converts automatically to customer currency</span>
                </div>
                <span className="font-black text-sm text-gray-900">
                  ${calcPrice.toFixed(2)} USD
                  {profit > 0 && (
                    <span className="ml-2 text-emerald-600 text-xs font-bold">
                      (+{formData.profit_percent}%)
                    </span>
                  )}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-800 flex items-start gap-2">
                <span className="font-black shrink-0">💡 Note:</span>
                <span>
                  All add-on prices are standardized in <strong>USD ($)</strong> for all suppliers. At checkout, customers see prices converted to their selected currency (AED, SAR, EUR, etc.) matching vehicle price logic.
                </span>
              </div>
            </div>

            {/* Type & Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Type <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={formData.type}
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: v as any,
                      max_qty: v === "quantity" ? Math.max(2, prev.max_qty) : 1,
                    }))
                  }
                  options={[
                    { value: "boolean", label: "Toggle (Add / Remove)" },
                    { value: "quantity", label: "Quantity Stepper (1, 2, 3...)" },
                  ]}
                />
              </div>
              {formData.type === "quantity" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Max Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.max_qty}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        max_qty: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white font-black text-sm text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              )}
            </div>

            {/* Badge */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Badge <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Popular"
                value={formData.badge}
                onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white text-sm text-gray-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-gray-400">Suggestions:</span>
                {BADGE_SUGGESTIONS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, badge: b }))}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-900 border border-gray-200 cursor-pointer"
                  >
                    {b}
                  </button>
                ))}
                {formData.badge && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, badge: "" }))}
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Questions & Answers (FAQs) Manager */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <HelpCircle size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-gray-900 block leading-tight">
                      Questions &amp; Answers (FAQs)
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Displayed when customer clicks the info icon (?)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const current = formData.faqs || [];
                    setFormData((prev) => ({
                      ...prev,
                      faqs: [...current, { question: "", answer: "" }],
                    }));
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                >
                  <Plus size={13} />
                  <span>Add Question</span>
                </button>
              </div>

              {(!formData.faqs || formData.faqs.length === 0) ? (
                <div className="p-4 bg-white/80 rounded-xl border border-dashed border-blue-200 text-center text-xs text-gray-400">
                  No custom questions added yet. Click &ldquo;Add Question&rdquo; to add FAQs for this service.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-xl border border-blue-100 shadow-2xs space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          Question #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (formData.faqs || []).filter((_, i) => i !== index);
                            setFormData((prev) => ({ ...prev, faqs: updated }));
                          }}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 text-xs cursor-pointer transition-colors"
                          title="Remove question"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="e.g. What is Last Minute Cancellation?"
                        value={faq.question}
                        onChange={(e) => {
                          const updated = [...(formData.faqs || [])];
                          updated[index] = { ...updated[index], question: e.target.value };
                          setFormData((prev) => ({ ...prev, faqs: updated }));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />

                      <textarea
                        rows={2}
                        placeholder="Detailed explanation / answer..."
                        value={faq.answer}
                        onChange={(e) => {
                          const updated = [...(formData.faqs || [])];
                          updated[index] = { ...updated[index], answer: e.target.value };
                          setFormData((prev) => ({ ...prev, faqs: updated }));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Switch */}
            <div
              onClick={() =>
                setFormData((prev) => ({ ...prev, is_active: !prev.is_active }))
              }
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100/70 select-none transition-colors"
            >
              <div>
                <div className="text-xs font-black text-gray-900">Active Status</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Show this service to customers at checkout
                </div>
              </div>
              <ToggleSwitch
                checked={formData.is_active}
                onChange={(v) => setFormData((prev) => ({ ...prev, is_active: v }))}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-100 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="extra-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary text-gray-900 font-black rounded-xl text-sm hover:bg-primary-600 active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={15} className="stroke-[2.5]" />
                {editingExtra ? "Update" : "Create"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
