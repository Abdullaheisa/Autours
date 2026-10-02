"use client";

import React, { useState } from "react";
import { Layers, X, Check, HelpCircle, Trash2, Plus, ChevronDown } from "lucide-react";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import CustomSelect from "@/components/ui/CustomSelect";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { ExtraItem } from "./AdminExtraCard";

const BADGE_SUGGESTIONS = [
  "Popular",
  "Recommended",
  "Free",
  "Must Have",
  "Best Value",
  "Essential",
];

export interface FaqSection {
  headline?: string;
  points: string[];
}

export interface ExtraFaq {
  question: string;
  answer?: string;
  sections?: FaqSection[];
  points?: string[];
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
  const [openFaqIndexes, setOpenFaqIndexes] = useState<Record<number, boolean>>({});

  const toggleFaqOpen = (index: number) => {
    setOpenFaqIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const faqs = formData.faqs || [];
  const allFaqsOpen = faqs.length > 0 && faqs.every((_, i) => openFaqIndexes[i]);

  const toggleAllFaqs = () => {
    if (allFaqsOpen) {
      setOpenFaqIndexes({});
    } else {
      const next: Record<number, boolean> = {};
      faqs.forEach((_, i) => {
        next[i] = true;
      });
      setOpenFaqIndexes(next);
    }
  };

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
              <Layers size={20} />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-gray-200/80">
                <div>
                  <span className="text-xs font-bold text-gray-600 block">Default Price:</span>
                  <span className="text-[10px] text-gray-400">Uses branch currency automatically</span>
                </div>
                <span className="font-black text-sm text-gray-900">
                  {calcPrice.toFixed(2)}
                  {profit > 0 && (
                    <span className="ml-2 text-emerald-600 text-xs font-bold">
                      (+{formData.profit_percent}%)
                    </span>
                  )}
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
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-2.5 flex-wrap gap-2">
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

                <div className="flex items-center gap-1.5 flex-wrap">
                  {faqs.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleAllFaqs}
                      className="px-2 py-1 bg-white hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      {allFaqsOpen ? "Collapse All" : "Expand All"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const current = formData.faqs || [];
                      const newIndex = current.length;
                      setFormData((prev) => ({
                        ...prev,
                        faqs: [
                          ...current,
                          {
                            question: "",
                            answer: "",
                          },
                        ],
                      }));
                      setOpenFaqIndexes((prev) => ({ ...prev, [newIndex]: true }));
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Plus size={13} />
                    <span>Add Question</span>
                  </button>
                </div>
              </div>

              {faqs.length === 0 ? (
                <div className="p-4 bg-white/80 rounded-xl border border-dashed border-blue-200 text-center text-xs text-gray-400">
                  No custom questions added yet. Click &ldquo;Add Question&rdquo; to add questions.
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq, index) => {
                    const isOpen = !!openFaqIndexes[index];

                    return (
                      <div
                        key={index}
                        className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                          isOpen
                            ? "border-blue-300 ring-1 ring-blue-150"
                            : "border-blue-100 hover:border-blue-200"
                        }`}
                      >
                        {/* Question Header Bar: Clickable to toggle */}
                        <div
                          onClick={() => toggleFaqOpen(index)}
                          className="px-3.5 py-2.5 flex items-center justify-between gap-2.5 cursor-pointer select-none bg-blue-50/40 hover:bg-blue-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded shrink-0">
                              Question #{index + 1}
                            </span>
                            <span
                              className={`text-xs font-bold truncate ${
                                faq.question ? "text-gray-900" : "text-gray-400 italic"
                              }`}
                            >
                              {faq.question || "Untitled Question (Click to edit)..."}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = (formData.faqs || []).filter((_, i) => i !== index);
                                setFormData((prev) => ({ ...prev, faqs: updated }));
                              }}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 text-xs cursor-pointer transition-colors"
                              title="Remove question"
                            >
                              <Trash2 size={13} />
                            </button>

                            <div
                              className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors"
                              title={isOpen ? "Collapse" : "Expand"}
                            >
                              <ChevronDown
                                size={15}
                                className={`transition-transform duration-200 ${
                                  isOpen ? "rotate-180 text-blue-600" : "text-gray-400"
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Question Form Content (Shown when isOpen) */}
                        {isOpen && (
                          <div className="p-4 border-t border-blue-150/70 space-y-4 bg-white animate-in fade-in-50 duration-150">
                            {/* Question Title */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-black text-gray-800 uppercase tracking-wider">
                                  Question Title
                                </label>
                                <span className="text-[10px] text-gray-400">
                                  Quick titles:
                                </span>
                              </div>
                              <input
                                type="text"
                                placeholder="e.g. Roadside Assistance Cancellation"
                                value={faq.question}
                                onChange={(e) => {
                                  const updated = [...(formData.faqs || [])];
                                  updated[index] = { ...updated[index], question: e.target.value };
                                  setFormData((prev) => ({ ...prev, faqs: updated }));
                                }}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-250 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                              />

                              {/* Quick Title Suggestions */}
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                {[
                                  `Roadside Assistance Cancellation`,
                                  `What is ${formData.name || "this service"}?`,
                                  `Cancellation Policy & Terms`,
                                  `Requirements & Conditions`,
                                ].map((sugg, sIdx) => (
                                  <button
                                    key={sIdx}
                                    type="button"
                                    onClick={() => {
                                      const updated = [...(formData.faqs || [])];
                                      updated[index] = { ...updated[index], question: sugg };
                                      setFormData((prev) => ({ ...prev, faqs: updated }));
                                    }}
                                    className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 border border-gray-200 transition-colors cursor-pointer"
                                  >
                                    + {sugg}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Answer Content - RichTextEditor Box */}
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-black text-gray-800 uppercase tracking-wider">
                                  Answer &amp; Conditions
                                </label>
                                <span className="text-[10px] text-gray-500">
                                  Use bold, headings &amp; bullet lists (• becomes ✔ for customer)
                                </span>
                              </div>
                              <RichTextEditor
                                value={faq.answer || ""}
                                onChange={(html) => {
                                  const updated = [...(formData.faqs || [])];
                                  updated[index] = { ...updated[index], answer: html };
                                  setFormData((prev) => ({ ...prev, faqs: updated }));
                                }}
                                placeholder="Write your answer content here... Use headings, bold text, and bullet lists for conditions"
                                minHeight={180}
                                className="rounded-xl border border-gray-250 shadow-2xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
