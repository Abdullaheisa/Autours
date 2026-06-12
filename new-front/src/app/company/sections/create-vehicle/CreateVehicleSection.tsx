
'use client';

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Car, MapPin, Tag, DollarSign, ShieldCheck, Settings,
  ChevronDown, ChevronUp, Check, X, Info, Image as ImageIcon,
  Wind, DoorOpen, Fuel, Users, Luggage, Settings2, Loader2,
  Gauge, Cog, Palette, Sparkles, Briefcase, Search
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { supplierApi } from "@/services/api/supplierApi";
import { photoApi, specificationApi } from "@/services/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { AlertTriangle } from "lucide-react";

// ─────────────────────────────────────────────
// Small reusable components
// ─────────────────────────────────────────────

const SectionCard = ({
  icon: Icon,
  title,
  children
}: {
  icon: React.ElementType,
  title: string,
  children: React.ReactNode
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
    <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30 rounded-t-2xl">
      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
        <Icon size={18} className="text-primary-600" />
      </div>
      <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

/** A searchable dropdown select field */
const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
}: {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  options?: { value: string; label: string }[];
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setOpen((p) => !p);
            setSearchQuery("");
          }}
          className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border rounded-xl text-sm transition-all text-left
            ${open ? "border-primary-500 ring-2 ring-primary-500/10 bg-white" : "border-gray-200"}
            ${value ? "text-gray-900 font-medium" : "text-gray-400"}
          `}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-gray-100 flex items-center gap-2">
              <Search size={14} className="text-gray-400 shrink-0 ml-1" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onChange?.("");
                  setOpen(false);
                  setSearchQuery("");
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold border-b border-gray-50 text-gray-400 hover:bg-gray-50"
              >
                Clear selection
              </button>

              {filteredOptions.length === 0 ? (
                <div className="px-4 py-4 text-center text-xs text-gray-400">No results found</div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange?.(opt.value);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors block truncate
                      ${value === opt.value
                        ? "bg-primary-50 text-primary-700 font-bold"
                        : "text-gray-700 hover:bg-gray-50 font-medium"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PriceField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange?: (val: string) => void;
}) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-center">{label}</label>
    <div className="relative">
      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
      <input
        type="number"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="0.00"
        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-center transition-all"
      />
    </div>
  </div>
);

const CarSeat = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <span
    className={`inline-block bg-current ${className}`}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      maskImage: "url('/img/icons/chair.svg')",
      maskSize: "contain",
      maskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskImage: "url('/img/icons/chair.svg')",
      WebkitMaskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      verticalAlign: "middle"
    }}
  />
);

const AirConditionIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <span
    className={`inline-block bg-current ${className}`}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      maskImage: "url('/img/icons/air.png')",
      maskSize: "contain",
      maskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskImage: "url('/img/icons/air.png')",
      WebkitMaskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      verticalAlign: "middle"
    }}
  />
);

const SpecIcon = ({ name }: { name: string }) => {
  if (name === "Armchair") return <CarSeat size={14} />;
  if (name === "Wind") return <AirConditionIcon size={14} />;
  const icons: Record<string, any> = { DoorOpen, Fuel, Users, Luggage, Settings2, Gauge, Cog, Palette, Sparkles, Briefcase, Car };
  const Icon = icons[name] || Settings;
  return <Icon size={14} />;
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function CreateVehicleSection() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isActiveSupplier = user?.role === 'admin' || user?.status === 'active_supplier';
  const [photoSearch, setPhotoSearch] = useState("");

  // ── Form state ─────────────────────────────
  const [formData, setFormData] = useState({
    vehiclePhotoId: "",
    pickupLocationId: "",   // branch ID
    categoryId: "",          // category ID
    locationTypeId: "",      // location-type ID
    fuelPolicyId: "",        // fuel-policy ID
    reserveWithoutConfirmation: false,
    description: "",
    price12: "",
    price37: "",
    price830: "",
    includedFeatures: [] as number[],
    showIncludedDropdown: false,
    showVehicleDropdown: false,
    specifications: {} as Record<string, string>,
  });

  // ── Dynamic data from API ──────────────────
  const [dynamicData, setDynamicData] = useState({
    photos: [] as any[],
    categories: [] as any[],
    branches: [] as any[],
    locationTypes: [] as any[],
    fuelPolicies: [] as any[],
    includedItems: [] as any[],
    specifications: [] as any[],
  });
  const [dataLoading, setDataLoading] = useState(true);

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

  // ── Validation & submission ────────────────
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Click-outside for dropdowns ───────────
  const includedDropdownRef = useRef<HTMLDivElement>(null);
  const vehicleDropdownRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (includedDropdownRef.current && !includedDropdownRef.current.contains(e.target as Node)) {
        setFormData(p => ({ ...p, showIncludedDropdown: false }));
      }
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(e.target as Node)) {
        setFormData(p => ({ ...p, showVehicleDropdown: false }));
        setPhotoSearch("");
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Derived values ─────────────────────────
  const selectedPhoto = dynamicData.photos.find(
    (p: any) => String(p.id) === formData.vehiclePhotoId || p.photo === formData.vehiclePhotoId
  );
  const selectedFeatures = dynamicData.includedItems.filter(
    (item: any) => formData.includedFeatures.includes(item.id)
  );
  const filteredPhotos = useMemo(() => {
    if (!photoSearch.trim()) return dynamicData.photos;
    return dynamicData.photos.filter((p: any) =>
      p.name.toLowerCase().includes(photoSearch.toLowerCase())
    );
  }, [dynamicData.photos, photoSearch]);

  // ── Handlers ──────────────────────────────
  const handleFeatureToggle = (id: number) => {
    setFormData(prev => ({
      ...prev,
      includedFeatures: prev.includedFeatures.includes(id)
        ? prev.includedFeatures.filter(f => f !== id)
        : [...prev.includedFeatures, id],
    }));
  };

  const handleVehicleSelect = (photoId: string) => {
    setFormData(p => ({ ...p, vehiclePhotoId: photoId, showVehicleDropdown: false }));
    setPhotoSearch("");
  };

  const handleSubmit = async () => {
    setValidationErrors([]);

    // Client-side quick check before hitting the server
    const errors: string[] = [];
    if (!formData.vehiclePhotoId) errors.push("Vehicle photo is required.");
    if (!formData.pickupLocationId) errors.push("Pickup location (branch) is required.");
    if (!formData.categoryId) errors.push("Category is required.");
    if (!formData.description || formData.description.replace(/<[^>]+>/g, '').trim().length < 5)
      errors.push("Description must be at least 5 characters.");
    if (!formData.price12 || parseFloat(formData.price12) < 1)
      errors.push("Price (1-2 days) must be at least 1.");
    if (!formData.price37 || parseFloat(formData.price37) < 1)
      errors.push("Price (3-7 days) must be at least 1.");
    if (!formData.price830 || parseFloat(formData.price830) < 1)
      errors.push("Price (8-30 days) must be at least 1.");
    if (errors.length > 0) {
      setValidationErrors(errors);
      errors.forEach(err => toast.error(err));
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);
    try {
      // The backend expects 'photo' as a string reference (e.g., photo ID or filename)
      // and 'included' as an array of strings (names) or numeric strings (IDs)
      const payload = {
        name:                selectedPhoto?.name || "Vehicle",
        description:         formData.description.replace(/<[^>]+>/g, '').trim() || "No description",
        price:               parseFloat(formData.price12),
        week_price:          parseFloat(formData.price37),
        month_price:         parseFloat(formData.price830),
        pickup_loc:          Number(formData.pickupLocationId),
        category:            Number(formData.categoryId),
        // Send photo as string reference (filename) so backend stores it
        photo:               selectedPhoto?.photo || formData.vehiclePhotoId,
        instant_confirmation: !formData.reserveWithoutConfirmation,
        activation:          true,
        location_types:      formData.locationTypeId ? [Number(formData.locationTypeId)] : [],
        fuel_policy_id:      formData.fuelPolicyId ? Number(formData.fuelPolicyId) : undefined,
        // Backend accepts both IDs (numeric strings) and names — send IDs as strings
        included:            selectedFeatures.map(item => item.what_is_included || item.name || String(item.id)),
        specifications:      Object.entries(formData.specifications)
                               .filter(([, v]) => v !== "")
                               .map(([name, value]) => {
                                 const specObj = dynamicData.specifications.find(s => s.name === name);
                                 return {
                                   name: name,
                                   value: value,
                                   selectedOption: value,
                                   icon: specObj?.icon || "Settings"
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
        list.forEach(err => toast.error(err));
      } else {
        setValidationErrors([error.message || "An unexpected error occurred."]);
      }
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Helpers to convert API arrays → SelectField options ──
  const toOpts = (arr: any[], labelKey = "name") =>
    arr.map((item: any) => ({
      value: String(item.id),
      label: item[labelKey] || item.location || item.type || item.what_is_included || String(item.id)
    }));

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
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

        {/* ── Car Details ── */}
        <SectionCard icon={Car} title="Car Details">
          <div className="space-y-6">

            {/* Vehicle Photo – custom image dropdown */}
            <div className="space-y-2 relative" ref={vehicleDropdownRef}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Vehicle Photo
              </label>

              {/* Trigger */}
              <button
                type="button"
                onClick={() => {
                  setFormData(p => ({ ...p, showVehicleDropdown: !p.showVehicleDropdown }));
                  setPhotoSearch("");
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 hover:bg-gray-100 transition-all"
              >
                <span className={selectedPhoto ? "text-gray-900 font-medium" : "text-gray-400"}>
                  {selectedPhoto
                    ? `${selectedPhoto.name}${selectedPhoto.category?.name ? ` (${selectedPhoto.category.name})` : ''}`
                    : "Select a vehicle image…"}
                </span>
                {formData.showVehicleDropdown
                  ? <ChevronUp size={16} className="text-gray-400" />
                  : <ChevronDown size={16} className="text-gray-400" />
                }
              </button>

              {/* Dropdown list */}
              {formData.showVehicleDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-80">
                  {/* Photo Search Bar */}
                  <div className="p-2 border-b border-gray-100 flex items-center gap-2">
                    <Search size={14} className="text-gray-400 shrink-0 ml-1" />
                    <input
                      type="text"
                      value={photoSearch}
                      onChange={(e) => setPhotoSearch(e.target.value)}
                      placeholder="Search photo..."
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                    />
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {filteredPhotos.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-400 text-sm">
                        No matching photos found in library.
                      </div>
                    ) : (
                      filteredPhotos.map((photo: any) => {
                        const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
                        let photoUrl = photo.photo || photo.image || photo.url || null;
                        if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('data:') && !photoUrl.startsWith('/')) {
                          photoUrl = `${backendBase}/img/vehicles/${photoUrl}`;
                        }
                        const catLabel = photo.category?.name || photo.category_name || "";
                        const isSelected = formData.vehiclePhotoId === String(photo.id);
                        return (
                          <button
                            type="button"
                            key={photo.id}
                            onClick={() => handleVehicleSelect(String(photo.id))}
                            className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                              isSelected ? "bg-primary-50/50" : ""
                            }`}
                          >
                            <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                              {photoUrl ? (
                                <img src={photoUrl} alt={photo.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Car size={16} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold truncate ${isSelected ? "text-primary-700" : "text-gray-900"}`}>
                                {photo.name}
                              </p>
                              {catLabel && <p className="text-xs text-gray-500">{catLabel}</p>}
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                                <Check size={12} className="text-white" strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Selected preview */}
              {selectedPhoto && (() => {
                const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
                let photoUrl = selectedPhoto.photo || selectedPhoto.image || selectedPhoto.url || null;
                if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('data:') && !photoUrl.startsWith('/')) {
                  photoUrl = `${backendBase}/img/vehicles/${photoUrl}`;
                }
                const catLabel = selectedPhoto.category?.name || selectedPhoto.category_name || "";
                return (
                  <div className="mt-3 p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-center gap-4">
                    <div className="w-24 h-16 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-white">
                      {photoUrl ? (
                        <img src={photoUrl} alt={selectedPhoto.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                          <Car size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{selectedPhoto.name}</p>
                      {catLabel && <p className="text-xs text-primary-600 font-medium">{catLabel}</p>}
                      <p className="text-[10px] text-gray-400 mt-1">Image pulled from vehicle library</p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-primary-200">
                      <ImageIcon size={18} className="text-primary-500" />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Row 1: Pickup Location, Category, Location Types */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectField
                label="Pickup Location"
                value={formData.pickupLocationId}
                onChange={(v) => setFormData(p => ({ ...p, pickupLocationId: v }))}
                options={toOpts(dynamicData.branches, "location")}
                placeholder="Select branch…"
              />
              <SelectField
                label="Category"
                value={formData.categoryId}
                onChange={(v) => setFormData(p => ({ ...p, categoryId: v }))}
                options={toOpts(dynamicData.categories, "name")}
                placeholder="Select category…"
              />
              <SelectField
                label="Location Type"
                value={formData.locationTypeId}
                onChange={(v) => setFormData(p => ({ ...p, locationTypeId: v }))}
                options={toOpts(dynamicData.locationTypes, "type")}
                placeholder="Select location type…"
              />
            </div>

            {/* Row 2: Fuel Policy + Reserve toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Fuel Policy"
                value={formData.fuelPolicyId}
                onChange={(v) => setFormData(p => ({ ...p, fuelPolicyId: v }))}
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
                      setFormData(p => ({ ...p, reserveWithoutConfirmation: !p.reserveWithoutConfirmation }))
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
                onChange={(html) => setFormData(p => ({ ...p, description: html }))}
                placeholder="Tell customers more about this vehicle…"
                minHeight={140}
                className="rounded-xl"
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Prices ── */}
        <SectionCard icon={Tag} title="Prices Section">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <PriceField label="Price 1-2 days"  value={formData.price12}  onChange={(v) => setFormData(p => ({ ...p, price12: v }))} />
            <PriceField label="3 - 7 Days Price" value={formData.price37}  onChange={(v) => setFormData(p => ({ ...p, price37: v }))} />
            <PriceField label="8-30 Days Price"  value={formData.price830} onChange={(v) => setFormData(p => ({ ...p, price830: v }))} />
          </div>
        </SectionCard>

        {/* ── What is Included ── */}
        <SectionCard icon={ShieldCheck} title="What is included?">
          <div className="space-y-3 relative" ref={includedDropdownRef}>
            {/* Trigger */}
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, showIncludedDropdown: !p.showIncludedDropdown }))}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm hover:bg-gray-100 transition-all"
            >
              <span className={selectedFeatures.length > 0 ? "text-gray-900 font-medium" : "text-gray-400"}>
                {selectedFeatures.length > 0
                  ? `${selectedFeatures.length} features selected`
                  : "Select features…"}
              </span>
              {formData.showIncludedDropdown
                ? <ChevronUp size={16} className="text-gray-400" />
                : <ChevronDown size={16} className="text-gray-400" />
              }
            </button>

            {/* Dropdown menu */}
            {formData.showIncludedDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                {dynamicData.includedItems.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">No items available.</div>
                ) : (
                  dynamicData.includedItems.map((item: any) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleFeatureToggle(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                        formData.includedFeatures.includes(item.id) ? "bg-primary-50/50" : ""
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                          formData.includedFeatures.includes(item.id)
                            ? "bg-primary-500 border-primary-500 text-white"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        {formData.includedFeatures.includes(item.id) && (
                          <Check size={12} strokeWidth={3} />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          formData.includedFeatures.includes(item.id) ? "text-primary-700" : "text-gray-700"
                        }`}
                      >
                        {item.what_is_included || item.name}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected tags */}
            {selectedFeatures.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedFeatures.map((feature: any) => (
                  <span
                    key={feature.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg border border-primary-200"
                  >
                    <Check size={12} />
                    {feature.what_is_included || feature.name}
                    <button
                      type="button"
                      onClick={() => handleFeatureToggle(feature.id)}
                      className="ml-1 hover:text-primary-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Specifications ── */}
        <SectionCard icon={Settings} title="Specifications">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dynamicData.specifications.map((spec: any) => (
              <div key={spec.id} className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <SpecIcon name={spec.icon} />
                  </div>
                  {spec.name}
                </label>
                <div className="relative">
                  <select
                    value={formData.specifications[spec.name] || ""}
                    onChange={(e) =>
                      setFormData(p => ({
                        ...p,
                        specifications: {
                          ...p.specifications,
                          [spec.name]: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none transition-all cursor-pointer"
                  >
                    <option value="">Select Option…</option>
                    {spec.options.map((opt: string, i: number) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Submit ── */}
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
