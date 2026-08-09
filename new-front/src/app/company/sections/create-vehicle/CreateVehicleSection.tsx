'use client';

import { useState, useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import { supplierApi } from "@/services/api/supplierApi";
import { photoApi, specificationApi } from "@/services/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

import { VehicleFormData, VehicleDynamicData } from "./components/types";
import CarDetailsSection from "./components/CarDetailsSection";
import PricesSection from "./components/PricesSection";
import IncludedFeaturesSection from "./components/IncludedFeaturesSection";
import SpecificationsSection from "./components/SpecificationsSection";

export default function CreateVehicleSection() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isActiveSupplier = user?.role === 'admin' || user?.status === 'active_supplier';

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
    const companyMode = (user as any)?.default_pricing_mode || localStorage.getItem('company_default_pricing_mode') || 'standard';
    let companyTiers = (user as any)?.default_custom_price_tiers;
    if (typeof companyTiers === 'string') {
      try { companyTiers = JSON.parse(companyTiers); } catch {}
    }
    if (!companyTiers || !Array.isArray(companyTiers) || companyTiers.length === 0) {
      const cachedTiers = localStorage.getItem('company_default_custom_tiers');
      if (cachedTiers) {
        try { companyTiers = JSON.parse(cachedTiers); } catch {}
      }
    }

    const formattedTiers = Array.isArray(companyTiers) && companyTiers.length > 0
      ? companyTiers.map((t: any, idx: number) => ({
          id: String(t.id || idx + 1),
          minDays: Number(t.minDays || 1),
          maxDays: Number(t.maxDays || 1),
          price: "",
        }))
      : [
          { id: "1", minDays: 1, maxDays: 3, price: "" },
          { id: "2", minDays: 4, maxDays: 7, price: "" },
          { id: "3", minDays: 8, maxDays: 15, price: "" },
          { id: "4", minDays: 16, maxDays: 30, price: "" },
        ];

    setFormData(prev => ({
      ...prev,
      pricingMode: companyMode as any,
      customPriceTiers: formattedTiers,
    }));
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [photosRes, catsRes, branchesRes, locTypesRes, fuelPolRes, includedRes, specsRes] =
          await Promise.all([
            photoApi.getAll(),
            supplierApi.getCategories(),
            supplierApi.getBranches(),
            supplierApi.getLocationTypes(),
            supplierApi.getFuelPolicies(),
            supplierApi.getIncluded(),
            specificationApi.getAll(),
          ]) as any[];
        
        const rawSpecs = specsRes?.data || specsRes || [];
        const parsedSpecs = Array.isArray(rawSpecs) ? rawSpecs.map((s: any) => ({
          ...s,
          options: typeof s.options === 'string' ? JSON.parse(s.options || '[]') : (s.options || [])
        })) : [];

        setDynamicData({
          photos:        Array.isArray(photosRes) ? photosRes : (photosRes.data?.data || photosRes.data || []),
          categories:    catsRes.data?.data     || catsRes.data     || [],
          branches:      branchesRes.data?.data || branchesRes.data || [],
          locationTypes: locTypesRes.data?.data || locTypesRes.data || [],
          fuelPolicies:  fuelPolRes.data?.data  || fuelPolRes.data  || [],
          includedItems: includedRes.data?.data || includedRes.data || [],
          specifications: parsedSpecs,
        });
      } catch (err) {
        console.error("Failed to fetch vehicle form data", err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, []);

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

      // Determine main fallback prices for standard backend API requirements
      let basePrice = parseFloat(formData.price12) || 0;
      let weekPrice = parseFloat(formData.price37) || parseFloat(formData.price57) || basePrice;
      let monthPrice = parseFloat(formData.price830) || parseFloat(formData.price1530) || weekPrice;

      if (formData.pricingMode === 'dynamic' && formData.customPriceTiers.length > 0) {
        basePrice = parseFloat(formData.customPriceTiers[0].price) || 0;
        weekPrice = parseFloat(formData.customPriceTiers[1]?.price || formData.customPriceTiers[0].price) || basePrice;
        monthPrice = parseFloat(formData.customPriceTiers[formData.customPriceTiers.length - 1]?.price) || weekPrice;
      }

      const payload = {
        name:                selectedPhoto?.name || "Vehicle",
        description:         formData.description.replace(/<[^>]+>/g, '').trim() || "No description",
        price:               basePrice,
        week_price:          weekPrice,
        month_price:         monthPrice,
        pickup_loc:          Number(formData.pickupLocationId),
        category:            Number(formData.categoryId),
        photo:               selectedPhoto?.photo || formData.vehiclePhotoId,
        instant_confirmation: !formData.reserveWithoutConfirmation,
        activation:          true,
        location_types:      formData.locationTypeId ? [Number(formData.locationTypeId)] : [],
        fuel_policy_id:      formData.fuelPolicyId ? Number(formData.fuelPolicyId) : undefined,
        included:            selectedFeatures.map((item) => item.what_is_included || item.name || String(item.id)),
        
        // Multi-model pricing payload extension
        pricing_mode:        formData.pricingMode,
        granular_prices:     formData.pricingMode === 'granular' ? {
          price_1_2: formData.price12,
          price_3_4: formData.price34,
          price_5_7: formData.price57,
          price_8_14: formData.price814,
          price_15_30: formData.price1530,
        } : null,
        custom_price_tiers:  formData.pricingMode === 'dynamic' ? formData.customPriceTiers : null,

        specifications:      Object.entries(formData.specifications)
                               .filter(([, v]) => v !== "")
                               .map(([name, value]) => {
                                 const specObj = dynamicData.specifications.find((s) => s.name === name);
                                 return {
                                   name: name,
                                   value: value,
                                   selectedOption: value,
                                   icon: specObj?.icon || "Settings",
                                 };
                               }),
      };

      await supplierApi.createVehicle(payload);
      toast.success("Vehicle created successfully!");
      setTimeout(() => {
        window.location.href = "/company?tab=vehicles";
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
        setValidationErrors([error.message || "An unexpected error occurred."]);
      }
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isActiveSupplier) {
    return (
      <SectionLayout>
        <PageHeader
          title="Create New Vehicle"
          description="Add a new vehicle to your fleet with details, pricing and specifications"
          showAction={false}
        />
        <div className="max-w-xl mx-auto mt-12 bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Account Activation Required</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your account is currently under review or inactive. You must have an approved active supplier account to create new vehicles.
            </p>
          </div>
        </div>
      </SectionLayout>
    );
  }

  return (
    <SectionLayout>
      <PageHeader
        title="Create New Vehicle"
        description="Add a new vehicle to your fleet with details, pricing and specifications"
        showAction={false}
      />

      <div className="space-y-6 pb-12 mt-6 max-w-5xl mx-auto">
        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm">
            <h3 className="text-red-800 font-bold mb-2">
              Please fix the following errors to create the vehicle:
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
            onClick={() => window.history.back()}
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
