'use client';

import React from "react";
import { Tag, Plus, Trash2, Sliders, Calendar, Sparkles, Save, CheckCircle2 } from "lucide-react";
import SectionCard from "./SectionCard";
import PriceField from "./PriceField";
import { VehicleFormData, PricingMode, CustomPriceTier } from "./types";
import { uploadApi } from "@/services/api";
import toast from "react-hot-toast";

interface PricesSectionProps {
  formData: VehicleFormData;
  onChange: (fields: Partial<VehicleFormData>) => void;
}

export const PricesSection: React.FC<PricesSectionProps> = ({
  formData,
  onChange,
}) => {
  const mode = formData.pricingMode || 'standard';

  const handleSaveAsDefault = async () => {
    const templateTiers = formData.customPriceTiers.map(t => ({
      id: t.id,
      minDays: t.minDays,
      maxDays: t.maxDays,
    }));
    localStorage.setItem('company_default_pricing_mode', mode);
    localStorage.setItem('company_default_custom_tiers', JSON.stringify(templateTiers));
    try {
      const form = new FormData();
      form.append('default_pricing_mode', mode);
      form.append('default_custom_price_tiers', JSON.stringify(templateTiers));
      await uploadApi.uploadProfile(form);
      toast.success("Saved as company's default pricing template!");
    } catch {
      toast.success("Saved as local company preference!");
    }
  };

  const handleModeChange = (newMode: PricingMode) => {
    onChange({ pricingMode: newMode });
  };

  const handleAddTier = () => {
    const lastTier = formData.customPriceTiers[formData.customPriceTiers.length - 1];
    const newMin = lastTier ? lastTier.maxDays + 1 : 1;
    const newMax = newMin + 2;

    const newTier: CustomPriceTier = {
      id: Date.now().toString(),
      minDays: newMin,
      maxDays: newMax,
      price: "",
    };

    onChange({
      customPriceTiers: [...formData.customPriceTiers, newTier],
    });
  };

  const handleUpdateTier = (id: string, field: keyof CustomPriceTier, value: any) => {
    const updated = formData.customPriceTiers.map((tier) => {
      if (tier.id === id) {
        return { ...tier, [field]: value };
      }
      return tier;
    });
    onChange({ customPriceTiers: updated });
  };

  const handleDeleteTier = (id: string) => {
    onChange({
      customPriceTiers: formData.customPriceTiers.filter((tier) => tier.id !== id),
    });
  };

  return (
    <SectionCard icon={Tag} title="Prices Section">
      <div className="space-y-6">
        {/* Mode Selector Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <Sliders size={15} className="text-primary-600" />
            <span>Pricing Model:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 w-full sm:w-auto bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              <button
                type="button"
                onClick={() => handleModeChange('standard')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  mode === 'standard'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Standard (3 Tiers)
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('granular')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  mode === 'granular'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Granular (5 Tiers)
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('dynamic')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  mode === 'dynamic'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Sparkles size={13} />
                Custom Ranges
              </button>
            </div>
            <button
              type="button"
              onClick={handleSaveAsDefault}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
              title="Save current layout as company default template"
            >
              <Save size={13} />
              Set as Default
            </button>
          </div>
        </div>

        {/* ── Mode 1: Standard (3 Tiers) ── */}
        {mode === 'standard' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <PriceField
              label="Price 1-2 days"
              value={formData.price12}
              onChange={(v) => onChange({ price12: v })}
            />
            <PriceField
              label="3 - 7 Days Price"
              value={formData.price37}
              onChange={(v) => onChange({ price37: v })}
            />
            <PriceField
              label="8-30 Days Price"
              value={formData.price830}
              onChange={(v) => onChange({ price830: v })}
            />
          </div>
        )}

        {/* ── Mode 2: Granular (5 Tiers) ── */}
        {mode === 'granular' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PriceField
                label="1 - 2 Days Price"
                value={formData.price12}
                onChange={(v) => onChange({ price12: v })}
              />
              <PriceField
                label="3 - 4 Days Price"
                value={formData.price34}
                onChange={(v) => onChange({ price34: v })}
              />
              <PriceField
                label="5 - 7 Days Price"
                value={formData.price57}
                onChange={(v) => onChange({ price57: v })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PriceField
                label="8 - 14 Days Price"
                value={formData.price814}
                onChange={(v) => onChange({ price814: v })}
              />
              <PriceField
                label="15 - 30 Days Price"
                value={formData.price1530}
                onChange={(v) => onChange({ price1530: v })}
              />
            </div>
          </div>
        )}

        {/* ── Mode 3: Dynamic Custom Ranges ── */}
        {mode === 'dynamic' && (
          <div className="space-y-4">
            {formData.customPriceTiers.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-3">
                <Calendar size={24} className="mx-auto text-gray-400" />
                <p className="text-xs text-gray-500 font-medium">
                  No custom price ranges added yet. Click below to add pricing ranges tailored to your company.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.customPriceTiers.map((tier, idx) => (
                  <div
                    key={tier.id}
                    className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl transition-all hover:bg-gray-100/50"
                  >
                    <span className="w-7 h-7 rounded-lg bg-primary-50 text-primary-700 font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>

                    <div className="grid grid-cols-2 gap-2 flex-1 w-full sm:w-auto">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Min Days
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={tier.minDays}
                          onChange={(e) =>
                            handleUpdateTier(tier.id, 'minDays', parseInt(e.target.value) || 1)
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Max Days
                        </label>
                        <input
                          type="number"
                          min={tier.minDays}
                          value={tier.maxDays}
                          onChange={(e) =>
                            handleUpdateTier(tier.id, 'maxDays', parseInt(e.target.value) || tier.minDays)
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div className="flex-1 w-full sm:w-auto">
                      <PriceField
                        label={`Daily Price (${tier.minDays}-${tier.maxDays} days)`}
                        value={tier.price}
                        onChange={(val) => handleUpdateTier(tier.id, 'price', val)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTier(tier.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 self-end sm:self-center"
                      title="Delete Tier"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleAddTier}
              className="w-full py-3 bg-white border-2 border-dashed border-primary-300 text-primary-600 font-bold text-xs rounded-xl hover:bg-primary-50/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Custom Price Tier
            </button>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default PricesSection;
