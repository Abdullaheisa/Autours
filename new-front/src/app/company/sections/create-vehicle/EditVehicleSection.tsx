'use client';

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import { supplierApi } from "@/services/api/supplierApi";
import { photoApi, vehicleManagementApi, specificationApi } from "@/services/api";
import toast from "react-hot-toast";

import { VehicleFormData, VehicleDynamicData } from "./components/types";
import CarDetailsSection from "./components/CarDetailsSection";
import PricesSection from "./components/PricesSection";
import IncludedFeaturesSection from "./components/IncludedFeaturesSection";
import SpecificationsSection from "./components/SpecificationsSection";

export default function EditVehicleSection({
  vehicleId,
  onBack,
}: {
  vehicleId: number;
  onBack: () => void;
}) {
  // ── Form state ─────────────────────────────
  const [formData, setFormData] = useState<VehicleFormData>({
    vehiclePhotoId: "",
    pickupLocationId: "",   // branch ID
    categoryId: "",          // category ID
    locationTypeId: "",      // location-type ID
    fuelPolicyId: "",        // fuel-policy ID
    reserveWithoutConfirmation: false,
    description: "",
    
    // Pricing mode & fields
    pricingMode: 'standard',
    price12: "",
    price37: "",
    price830: "",
    price34: "",
    price57: "",
    price814: "",
    price1530: "",
    customPriceTiers: [],

    includedFeatures: [],
    showIncludedDropdown: false,
    showVehicleDropdown: false,
    specifications: {},
  });

  // ── Dynamic data from API ──────────────────
  const [dynamicData, setDynamicData] = useState<VehicleDynamicData>({
    photos: [],
    categories: [],
    branches: [],
    locationTypes: [],
    fuelPolicies: [],
    includedItems: [],
    specifications: [],
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [photosRes, catsRes, branchesRes, locTypesRes, fuelPolRes, includedRes, vehicleRes, specsRes] =
          await Promise.all([
            photoApi.getAll(),
            supplierApi.getCategories(),
            supplierApi.getBranches(),
            supplierApi.getLocationTypes(),
            supplierApi.getFuelPolicies(),
            supplierApi.getIncluded(),
            vehicleManagementApi.getForEdit(vehicleId),
            specificationApi.getAll(),
          ]) as any[];

        const vehicleData = vehicleRes?.data || vehicleRes;

        const rawSpecs = specsRes?.data || specsRes || [];
        const parsedSpecs = Array.isArray(rawSpecs) ? rawSpecs.map((s: any) => ({
          ...s,
          options: typeof s.options === 'string' ? JSON.parse(s.options || '[]') : (s.options || [])
        })) : [];

        const includedList = includedRes.data?.data || includedRes.data || [];

        setDynamicData({
          photos: Array.isArray(photosRes) ? photosRes : (photosRes.data?.data || photosRes.data || []),
          categories: catsRes.data?.data || catsRes.data || [],
          branches: branchesRes.data?.data || branchesRes.data || [],
          locationTypes: locTypesRes.data?.data || locTypesRes.data || [],
          fuelPolicies: fuelPolRes.data?.data || fuelPolRes.data || [],
          includedItems: includedList,
          specifications: parsedSpecs,
        });

        if (vehicleData) {
          const specMap: Record<string, string> = {};
          if (Array.isArray(vehicleData.specifications)) {
            vehicleData.specifications.forEach((s: any) => {
              specMap[s.name] = s.value !== undefined ? s.value : s.selectedOption;
            });
          }

          const includedFeatures = Array.isArray(vehicleData.what_is_included)
            ? vehicleData.what_is_included.map((name: any) => {
                if (typeof name === 'object' && name !== null) return name.id;
                const found = includedList.find((item: any) => item.what_is_included === name || item.id === name);
                return found ? found.id : null;
              }).filter((id: any) => id !== null)
            : [];

          // Detect pricing mode from backend response or default to 'standard'
          const detectedMode = vehicleData.pricing_mode || 'standard';
          const granular = vehicleData.granular_prices || {};
          const customTiers = Array.isArray(vehicleData.custom_price_tiers) ? vehicleData.custom_price_tiers : [];

          setFormData({
            vehiclePhotoId: vehicleData.photo || "",
            pickupLocationId: typeof vehicleData.pickup_loc === 'object' && vehicleData.pickup_loc !== null ? String(vehicleData.pickup_loc.id) : String(vehicleData.pickup_loc || vehicleData.branch?.id || ""),
            categoryId: typeof vehicleData.category === 'object' && vehicleData.category !== null ? String(vehicleData.category.id) : String(vehicleData.category || vehicleData.category_id || ""),
            locationTypeId: Array.isArray(vehicleData.location_type) && vehicleData.location_type.length
              ? String(vehicleData.location_type[0].id || vehicleData.location_type[0])
              : (typeof vehicleData.location_type === 'object' && vehicleData.location_type !== null
                ? String(vehicleData.location_type.id)
                : (vehicleData.location_type ? String(vehicleData.location_type) : "")),
            fuelPolicyId: String(vehicleData.fuel_policy_id || ""),
            reserveWithoutConfirmation: vehicleData.instant_confirmation === 0,
            description: vehicleData.description || "",

            pricingMode: detectedMode,
            price12: String(vehicleData.price || granular.price_1_2 || ""),
            price37: String(vehicleData.week_price || ""),
            price830: String(vehicleData.month_price || ""),
            price34: String(granular.price_3_4 || ""),
            price57: String(granular.price_5_7 || ""),
            price814: String(granular.price_8_14 || ""),
            price1530: String(granular.price_15_30 || ""),
            customPriceTiers: customTiers,

            includedFeatures: includedFeatures,
            showIncludedDropdown: false,
            showVehicleDropdown: false,
            specifications: specMap,
          });
        }
      } catch (err) {
        console.error("Failed to fetch vehicle form data", err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [vehicleId]);

  const updateFormData = (fields: Partial<VehicleFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleFeatureToggle = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      includedFeatures: prev.includedFeatures.includes(id)
        ? prev.includedFeatures.filter((f) => f !== id)
        : [...prev.includedFeatures, id],
    }));
  };

  const handleSpecChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setValidationErrors([]);

    const errors: string[] = [];
    if (!formData.vehiclePhotoId) errors.push("Vehicle photo is required.");
    if (!formData.pickupLocationId) errors.push("Pickup location (branch) is required.");
    if (!formData.categoryId) errors.push("Category is required.");
    if (!formData.description || formData.description.replace(/<[^>]+>/g, '').trim().length < 5)
      errors.push("Description must be at least 5 characters.");

    // Validate prices based on active mode
    if (formData.pricingMode === 'standard') {
      if (!formData.price12 || parseFloat(formData.price12) < 1)
        errors.push("Price (1-2 days) must be at least 1.");
      if (!formData.price37 || parseFloat(formData.price37) < 1)
        errors.push("Price (3-7 days) must be at least 1.");
      if (!formData.price830 || parseFloat(formData.price830) < 1)
        errors.push("Price (8-30 days) must be at least 1.");
    } else if (formData.pricingMode === 'granular') {
      if (!formData.price12 || parseFloat(formData.price12) < 1) errors.push("Price (1-2 days) is required.");
      if (!formData.price34 || parseFloat(formData.price34) < 1) errors.push("Price (3-4 days) is required.");
      if (!formData.price57 || parseFloat(formData.price57) < 1) errors.push("Price (5-7 days) is required.");
      if (!formData.price814 || parseFloat(formData.price814) < 1) errors.push("Price (8-14 days) is required.");
      if (!formData.price1530 || parseFloat(formData.price1530) < 1) errors.push("Price (15-30 days) is required.");
    } else if (formData.pricingMode === 'dynamic') {
      if (formData.customPriceTiers.length === 0) {
        errors.push("Please add at least one custom price tier.");
      } else {
        formData.customPriceTiers.forEach((tier, i) => {
          if (!tier.price || parseFloat(tier.price) < 1) {
            errors.push(`Tier #${i + 1} price is required.`);
          }
        });
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      errors.forEach((err) => toast.error(err));
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedPhoto = dynamicData.photos.find(
        (p: any) => String(p.id) === formData.vehiclePhotoId || p.photo === formData.vehiclePhotoId
      );
      const selectedFeatures = dynamicData.includedItems.filter(
        (item: any) => formData.includedFeatures.includes(item.id)
      );

      // Main fallback prices for backend
      let basePrice = formData.price12 || "0";
      let weekPrice = formData.price37 || formData.price57 || basePrice;
      let monthPrice = formData.price830 || formData.price1530 || weekPrice;

      if (formData.pricingMode === 'dynamic' && formData.customPriceTiers.length > 0) {
        basePrice = formData.customPriceTiers[0].price || "0";
        weekPrice = formData.customPriceTiers[1]?.price || formData.customPriceTiers[0].price || basePrice;
        monthPrice = formData.customPriceTiers[formData.customPriceTiers.length - 1]?.price || weekPrice;
      }

      const form = new FormData();
      form.append("update", "1");
      form.append("id", String(vehicleId));
      form.append("photo", selectedPhoto?.photo || formData.vehiclePhotoId);
      form.append("name", selectedPhoto?.name || "Vehicle");
      form.append("description", formData.description);
      form.append("price", basePrice);
      form.append("week_price", weekPrice);
      form.append("month_price", monthPrice);

      form.append("pickupLoc", formData.pickupLocationId);
      form.append("category", formData.categoryId);
      form.append("instant_confirmation", formData.reserveWithoutConfirmation ? "0" : "1");

      if (formData.locationTypeId) {
        form.append("location_types", formData.locationTypeId);
      }
      if (formData.fuelPolicyId) {
        form.append("fuel_policy", formData.fuelPolicyId);
      }

      const names = selectedFeatures.map((item) => item.what_is_included || item.name || String(item.id));
      form.append("included", names.join(","));

      // Append multi-model pricing data
      form.append("pricing_mode", formData.pricingMode);
      if (formData.pricingMode === 'granular') {
        form.append("granular_prices", JSON.stringify({
          price_1_2: formData.price12,
          price_3_4: formData.price34,
          price_5_7: formData.price57,
          price_8_14: formData.price814,
          price_15_30: formData.price1530,
        }));
      } else if (formData.pricingMode === 'dynamic') {
        form.append("custom_price_tiers", JSON.stringify(formData.customPriceTiers));
      }

      const specs = Object.entries(formData.specifications)
        .filter(([, v]) => v !== "")
        .map(([name, value]) => {
          const specObj = dynamicData.specifications.find((s) => s.name === name);
          return {
            name: name,
            value: value,
            selectedOption: value,
            icon: specObj?.icon || "Settings",
          };
        });
      if (specs.length > 0) {
        form.append("specifications", JSON.stringify(specs));
      }

      await vehicleManagementApi.create(form);
      toast.success("Vehicle updated successfully!");
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error: any) {
      console.error(error);
      if (error.errors && typeof error.errors === 'object') {
        const list = Object.entries(error.errors).map(
          ([key, val]) => `${key}: ${(val as string[]).join(', ')}`
        );
        setValidationErrors(list);
        list.forEach((err) => toast.error(err));
      } else {
        const msg = error.message || "An unexpected error occurred.";
        setValidationErrors([msg]);
        toast.error(msg);
      }
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionLayout>
      <PageHeader
        title="Edit Vehicle"
        description="Update your vehicle's details, pricing, and specifications"
        showAction={false}
      />

      <div className="space-y-6 pb-12 mt-6 max-w-5xl mx-auto">
        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm">
            <h3 className="text-red-800 font-bold mb-2">
              Please fix the following errors to update the vehicle:
            </h3>
            <ul className="list-disc pl-5 text-red-600 text-sm space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Loading skeleton */}
        {dataLoading && (
          <div className="flex items-center justify-center gap-3 py-8 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-medium">Loading vehicle form data…</span>
          </div>
        )}

        {/* Car Details */}
        <CarDetailsSection
          formData={formData}
          dynamicData={dynamicData}
          onChange={updateFormData}
        />

        {/* Prices Section (Multi-Model Support) */}
        <PricesSection
          formData={formData}
          onChange={updateFormData}
        />

        {/* Included Features */}
        <IncludedFeaturesSection
          formData={formData}
          includedItems={dynamicData.includedItems}
          onToggleFeature={handleFeatureToggle}
          onChange={updateFormData}
        />

        {/* Specifications */}
        <SpecificationsSection
          specifications={dynamicData.specifications}
          values={formData.specifications}
          onChangeSpec={handleSpecChange}
        />

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-10 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-12 py-3.5 bg-primary-500 text-white font-bold text-sm rounded-xl transition-all hover:bg-primary-600 active:scale-95 shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>
    </SectionLayout>
  );
}
