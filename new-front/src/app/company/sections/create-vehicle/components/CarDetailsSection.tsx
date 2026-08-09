'use client';

import React from "react";
import { Car, Info } from "lucide-react";
import SectionCard from "./SectionCard";
import SelectField from "./SelectField";
import VehiclePhotoSelect from "./VehiclePhotoSelect";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { VehicleFormData, VehicleDynamicData } from "./types";

interface CarDetailsSectionProps {
  formData: VehicleFormData;
  dynamicData: VehicleDynamicData;
  onChange: (fields: Partial<VehicleFormData>) => void;
}

export const CarDetailsSection: React.FC<CarDetailsSectionProps> = ({
  formData,
  dynamicData,
  onChange,
}) => {
  const toOpts = (arr: any[], labelKey = "name") =>
    arr.map((item: any) => ({
      value: String(item.id),
      label: item[labelKey] || item.location || item.type || item.what_is_included || String(item.id),
    }));

  return (
    <SectionCard icon={Car} title="Car Details">
      <div className="space-y-6">
        {/* Vehicle Photo */}
        <VehiclePhotoSelect
          vehiclePhotoId={formData.vehiclePhotoId}
          photos={dynamicData.photos}
          onSelectPhoto={(photoId) => onChange({ vehiclePhotoId: photoId })}
        />

        {/* Row 1: Pickup Location, Category, Location Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Pickup Location"
            value={formData.pickupLocationId}
            onChange={(v) => onChange({ pickupLocationId: v })}
            options={toOpts(dynamicData.branches, "name")}
            placeholder="Select branch…"
          />
          <SelectField
            label="Category"
            value={formData.categoryId}
            onChange={(v) => onChange({ categoryId: v })}
            options={toOpts(dynamicData.categories, "name")}
            placeholder="Select category…"
          />
          <SelectField
            label="Location Type"
            value={formData.locationTypeId}
            onChange={(v) => onChange({ locationTypeId: v })}
            options={toOpts(dynamicData.locationTypes, "type")}
            placeholder="Select location type…"
          />
        </div>

        {/* Row 2: Fuel Policy + Reserve toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Fuel Policy"
            value={formData.fuelPolicyId}
            onChange={(v) => onChange({ fuelPolicyId: v })}
            options={toOpts(dynamicData.fuelPolicies, "name")}
            placeholder="Select fuel policy…"
          />
          <div className="flex items-end">
            <div className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-700">Reserve Without Confirmation</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onChange({ reserveWithoutConfirmation: !formData.reserveWithoutConfirmation })
                }
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                  formData.reserveWithoutConfirmation ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    formData.reserveWithoutConfirmation ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle Description */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Vehicle Description
          </label>
          <RichTextEditor
            value={formData.description}
            onChange={(html) => onChange({ description: html })}
            placeholder="Tell customers more about this vehicle…"
            minHeight={140}
            className="rounded-xl"
          />
        </div>
      </div>
    </SectionCard>
  );
};

export default CarDetailsSection;
