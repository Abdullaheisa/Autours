'use client';

import { useState, useRef, useEffect } from "react";
import { 
  Car, MapPin, Tag, DollarSign, ShieldCheck, Settings, 
  ChevronDown, ChevronUp, Check, X, Info, Image as ImageIcon,
  Wind, DoorOpen, Fuel, Users, Luggage, Settings2
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import { specsData, vehiclesPhotos, includedItems } from "@/lib/data";
import { categories } from "@/data/categories";
import { supplierApi } from "@/services/api/supplierApi";

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

const SelectField = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select..." 
}: { 
  label: string, 
  value: string, 
  onChange?: (val: string) => void, 
  options?: string[], 
  placeholder?: string 
}) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{label}</label>
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none transition-all cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options?.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
    </div>
  </div>
);

const PriceField = ({ label, value, onChange }: { label: string, value: string, onChange?: (val: string) => void }) => (
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

const SpecIcon = ({ name }: { name: string }) => {
  const icons: Record<string, any> = {
    Wind, DoorOpen, Fuel, Users, Luggage, Settings2
  };
  const Icon = icons[name] || Settings;
  return <Icon size={14} />;
};

export default function CreateVehicleSection() {
  const [formData, setFormData] = useState({
    vehiclePhotoId: "",
    pickupLocation: "",
    category: "",
    locationType: "",
    fuelPolicy: "",
    reserveWithoutConfirmation: false,
    description: "",
    price12: "",
    price37: "",
    price830: "",
    includedFeatures: [] as number[],
    showIncludedDropdown: false,
    showVehicleDropdown: false,
    specifications: {
      ac: "",
      doors: "",
      fuel: "",
      seats: "",
      suitcase: "",
      transmission: ""
    }
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const includedDropdownRef = useRef<HTMLDivElement>(null);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (includedDropdownRef.current && !includedDropdownRef.current.contains(event.target as Node)) {
        setFormData(p => ({ ...p, showIncludedDropdown: false }));
      }
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(event.target as Node)) {
        setFormData(p => ({ ...p, showVehicleDropdown: false }));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedPhoto = vehiclesPhotos.find(p => p.id === Number(formData.vehiclePhotoId));

  const handleFeatureToggle = (id: number) => {
    setFormData(prev => ({
      ...prev,
      includedFeatures: prev.includedFeatures.includes(id)
        ? prev.includedFeatures.filter(f => f !== id)
        : [...prev.includedFeatures, id]
    }));
  };

  const selectedFeatures = includedItems.filter(item => formData.includedFeatures.includes(item.id));

  const handleVehicleSelect = (photoId: string) => {
    setFormData(p => ({ 
      ...p, 
      vehiclePhotoId: photoId,
      showVehicleDropdown: false 
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setValidationErrors([]);
    setIsSubmitting(true);
    try {
      const payload = {
        name: selectedPhoto?.name || "Unknown Vehicle",
        description: formData.description || "No description provided",
        price: parseFloat(formData.price12) || 10,
        week_price: parseFloat(formData.price37) || 10,
        month_price: parseFloat(formData.price830) || 10,
        pickup_loc: 1, 
        category: formData.category || 1, // Try sending the string name selected by user
        photo: selectedPhoto?.image || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
        instant_confirmation: !formData.reserveWithoutConfirmation,
        activation: true,
        location_types: [1],
        included: formData.includedFeatures.map(id => includedItems.find(i => i.id === id)?.name).filter(Boolean),
        specifications: Object.entries(formData.specifications)
          .filter(([_, value]) => value !== "")
          .map(([name, value]) => ({ name, value }))
      };
      
      await supplierApi.createVehicle(payload);
      alert("Vehicle created successfully!");
      window.location.href = "/company/vehicles";
    } catch (error: any) {
      if (error.errors && typeof error.errors === 'object') {
        const errorsList = Object.entries(error.errors).map(([key, val]) => `${key}: ${(val as string[]).join(', ')}`);
        setValidationErrors(errorsList);
      } else {
        setValidationErrors([error.message || "An unexpected error occurred."]);
      }
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionLayout>
      <PageHeader 
        title="Create New Vehicle" 
        description="Add a new vehicle to your fleet with details, pricing and specifications"
        showAction={false} 
      />

      <div className="space-y-6 pb-12 mt-6 max-w-5xl mx-auto">
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm">
            <h3 className="text-red-800 font-bold mb-2">Please fix the following errors to create the vehicle:</h3>
            <ul className="list-disc pl-5 text-red-600 text-sm space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Car Details Section */}
        <SectionCard icon={Car} title="Car Details">
          <div className="space-y-6">
            {/* Vehicle Photo - Custom Dropdown with Images */}
            <div className="space-y-2 relative" ref={vehicleDropdownRef}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Vehicle Photo</label>

              {/* Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, showVehicleDropdown: !p.showVehicleDropdown }))}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 hover:bg-gray-100 transition-all"
              >
                <span className={selectedPhoto ? "text-gray-900 font-medium" : "text-gray-400"}>
                  {selectedPhoto 
                    ? `${selectedPhoto.name} (${selectedPhoto.category})` 
                    : "Select a vehicle..."
                  }
                </span>
                {formData.showVehicleDropdown ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>

              {/* Vehicle Dropdown with Images */}
              {formData.showVehicleDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                  {vehiclesPhotos.map((photo) => (
                    <button
                      type="button"
                      key={photo.id}
                      onClick={() => handleVehicleSelect(String(photo.id))}
                      className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                        formData.vehiclePhotoId === String(photo.id) ? "bg-primary-50/50" : ""
                      }`}
                    >
                      {/* Vehicle Image */}
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                        {photo.image ? (
                          <img src={photo.image} alt={photo.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Car size={16} />
                          </div>
                        )}
                      </div>

                      {/* Vehicle Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${
                          formData.vehiclePhotoId === String(photo.id) ? "text-primary-700" : "text-gray-900"
                        }`}>
                          {photo.name}
                        </p>
                        <p className="text-xs text-gray-500">{photo.category}</p>
                      </div>

                      {/* Checkmark for selected */}
                      {formData.vehiclePhotoId === String(photo.id) && (
                        <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Vehicle Preview */}
              {selectedPhoto && (
                <div className="mt-3 p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-center gap-4">
                  <div className="w-24 h-16 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-white">
                    {selectedPhoto.image ? (
                      <img src={selectedPhoto.image} alt={selectedPhoto.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <Car size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{selectedPhoto.name}</p>
                    <p className="text-xs text-primary-600 font-medium">{selectedPhoto.category}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Image auto-filled from vehicle data</p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-primary-200">
                    <ImageIcon size={18} className="text-primary-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Row 1: Vehicle Name, Pickup Location, Category, Location Types */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Vehicle Name</label>
                <input 
                  type="text" 
                  placeholder="Enter vehicle name..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              <SelectField label="Pickup Location" value={formData.pickupLocation} onChange={(v) => setFormData(p => ({ ...p, pickupLocation: v }))} options={["Dubai Marina", "DXB Airport", "Downtown Dubai", "JBR"]} />
              <SelectField label="Category" value={formData.category} onChange={(v) => setFormData(p => ({ ...p, category: v }))} options={categories.map(c => c.name)} />
              <SelectField label="Location Types" value={formData.locationType} onChange={(v) => setFormData(p => ({ ...p, locationType: v }))} options={["Airport", "City", "Hotel", "Marina"]} />
            </div>

            {/* Row 2: Fuel Policy, Reserve Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="Fuel Policy" value={formData.fuelPolicy} onChange={(v) => setFormData(p => ({ ...p, fuelPolicy: v }))} options={["Full to Full", "Same to Same", "Pre-Purchase"]} />
              <div className="flex items-end">
                <div className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-700">Reserve Without Confirmation</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, reserveWithoutConfirmation: !p.reserveWithoutConfirmation }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${formData.reserveWithoutConfirmation ? 'bg-primary-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${formData.reserveWithoutConfirmation ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicle Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Vehicle Description</label>
              <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50/80">
                  <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded text-gray-600 font-bold text-xs transition-colors">B</button>
                  <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded text-gray-600 italic text-xs font-serif transition-colors">I</button>
                  <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded text-gray-600 underline text-xs transition-colors">U</button>
                  <div className="w-px h-3 bg-gray-300 mx-1" />
                  <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded text-gray-600 text-xs transition-colors">equiv</button>
                  <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded text-gray-600 text-xs transition-colors">hamburger</button>
                </div>
                <textarea 
                  rows={4} 
                  placeholder="Tell customers more about this vehicle..."
                  className="w-full p-4 text-sm focus:outline-none resize-none bg-white"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Prices Section */}
        <SectionCard icon={Tag} title="Prices Section">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <PriceField label="Price 1-2 days" value={formData.price12} onChange={(v) => setFormData(p => ({ ...p, price12: v }))} />
            <PriceField label="3 - 7 Days Price" value={formData.price37} onChange={(v) => setFormData(p => ({ ...p, price37: v }))} />
            <PriceField label="8-30 Days Price" value={formData.price830} onChange={(v) => setFormData(p => ({ ...p, price830: v }))} />
          </div>
        </SectionCard>

        {/* What is Included - Dropdown */}
        <SectionCard icon={ShieldCheck} title="What is included ?">
          <div className="space-y-3 relative" ref={includedDropdownRef}>
            {/* Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, showIncludedDropdown: !p.showIncludedDropdown }))}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm hover:bg-gray-100 transition-all"
            >
              <span className={selectedFeatures.length > 0 ? "text-gray-900 font-medium" : "text-gray-400"}>
                {selectedFeatures.length > 0 
                  ? `${selectedFeatures.length} features selected` 
                  : "Select features..."
                }
              </span>
              {formData.showIncludedDropdown ? (
                <ChevronUp size={16} className="text-gray-400" />
              ) : (
                <ChevronDown size={16} className="text-gray-400" />
              )}
            </button>

            {/* Dropdown Menu */}
            {formData.showIncludedDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                {includedItems.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleFeatureToggle(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                      formData.includedFeatures.includes(item.id) ? "bg-primary-50/50" : ""
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                      formData.includedFeatures.includes(item.id)
                        ? "bg-primary-500 border-primary-500 text-white"
                        : "bg-white border-gray-200"
                    }`}>
                      {formData.includedFeatures.includes(item.id) && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span className={`text-sm font-medium ${
                      formData.includedFeatures.includes(item.id) ? "text-primary-700" : "text-gray-700"
                    }`}>
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Features Tags */}
            {selectedFeatures.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedFeatures.map(feature => (
                  <span 
                    key={feature.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg border border-primary-200"
                  >
                    <Check size={12} />
                    {feature.name}
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

        {/* Specifications */}
        <SectionCard icon={Settings} title="Specifications">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {specsData.map((spec) => (
              <div key={spec.id} className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <SpecIcon name={spec.icon} />
                  </div>
                  {spec.name}
                </label>
                <div className="relative">
                  <select 
                    value={formData.specifications[spec.key as keyof typeof formData.specifications]}
                    onChange={(e) => setFormData(p => ({ 
                      ...p, 
                      specifications: { ...p.specifications, [spec.key as keyof typeof p.specifications]: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none transition-all cursor-pointer"
                  >
                    <option value="">Select Option...</option>
                    {spec.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Submit Buttons */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button type="button" className="px-10 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-12 py-3.5 bg-primary-500 text-white font-bold text-sm rounded-xl transition-all hover:bg-primary-600 active:scale-95 shadow-lg shadow-primary-500/20 disabled:opacity-50">
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </SectionLayout>
  );
}