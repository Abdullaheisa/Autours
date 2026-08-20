"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { updateUser } from "@/store/slices/authSlice";
import { normalizeAuthRole } from "@/utils/auth";
import { User, Mail, Phone, MapPin, Camera, Save, Building, Globe, Languages, Sliders, Plus, Trash2, Tag, Sparkles, Calendar } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import ImageUploader from "@/components/ui/ImageUploader";
import { authApi, uploadApi } from "@/services/api";
import { getBackendBaseUrl } from "@/utils/getImageUrl";
import toast from "react-hot-toast";

interface CustomPriceTierTemplate {
  id: string;
  minDays: number;
  maxDays: number;
}

export default function CompanyProfileSection() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    companyName: "",
    country: "",
    city: "",
    address: "",
    language: "English",
    description: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Default Company Pricing System State
  const [defaultPricingMode, setDefaultPricingMode] = useState<'standard' | 'granular' | 'dynamic'>('standard');
  const [defaultCustomPriceTiers, setDefaultCustomPriceTiers] = useState<CustomPriceTierTemplate[]>([
    { id: "1", minDays: 1, maxDays: 3 },
    { id: "2", minDays: 4, maxDays: 7 },
    { id: "3", minDays: 8, maxDays: 15 },
    { id: "4", minDays: 16, maxDays: 30 },
  ]);

  useEffect(() => {
    authApi.getUser()
      .then((res: any) => {
        const data = res || res?.data || {};
        setFormData({
          userName: data.name || "",
          userEmail: data.email || "",
          userPhone: data.phone_num || data.phone || "",
          companyName: data.company || data.company_name || "",
          country: data.country || "",
          city: data.city || "",
          address: data.address || "",
          language: data.language || "English",
          description: data.description || "",
        });
        setLogo(data.logo || null);

        // Load pricing preferences
        if (data.default_pricing_mode) {
          setDefaultPricingMode(data.default_pricing_mode);
        } else {
          const cachedMode = localStorage.getItem('company_default_pricing_mode');
          if (cachedMode && ['standard', 'granular', 'dynamic'].includes(cachedMode)) {
            setDefaultPricingMode(cachedMode as any);
          }
        }

        let loadedTiers = data.default_custom_price_tiers;
        if (typeof loadedTiers === 'string') {
          try { loadedTiers = JSON.parse(loadedTiers); } catch {}
        }
        if (!loadedTiers || !Array.isArray(loadedTiers) || loadedTiers.length === 0) {
          const cachedTiers = localStorage.getItem('company_default_custom_tiers');
          if (cachedTiers) {
            try { loadedTiers = JSON.parse(cachedTiers); } catch {}
          }
        }
        if (Array.isArray(loadedTiers) && loadedTiers.length > 0) {
          setDefaultCustomPriceTiers(loadedTiers);
        }
      })
      .catch((err) => {
        console.warn("Using mock profile due to API error:", err.message);
        setFormData({
          userName: "",
          userEmail: "",
          userPhone: "",
          companyName: "",
          country: "",
          city: "",
          address: "",
          language: "English",
          description: "",
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTier = () => {
    const lastTier = defaultCustomPriceTiers[defaultCustomPriceTiers.length - 1];
    const newMin = lastTier ? lastTier.maxDays + 1 : 1;
    const newMax = newMin + 3;
    setDefaultCustomPriceTiers(prev => [
      ...prev,
      { id: Date.now().toString(), minDays: newMin, maxDays: newMax }
    ]);
  };

  const handleUpdateTier = (id: string, field: 'minDays' | 'maxDays', value: number) => {
    setDefaultCustomPriceTiers(prev =>
      prev.map(tier => tier.id === id ? { ...tier, [field]: value } : tier)
    );
  };

  const handleDeleteTier = (id: string) => {
    setDefaultCustomPriceTiers(prev => prev.filter(t => t.id !== id));
  };

  const handleSave = async () => {
    if (!formData.userName.trim()) {
      toast.error("User Name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const form = new FormData();
      form.append("name", formData.userName);
      form.append("email", formData.userEmail);
      form.append("phone_num", formData.userPhone);
      form.append("company", formData.companyName);
      form.append("country", formData.country);
      form.append("city", formData.city);
      form.append("address", formData.address);
      form.append("language", formData.language);
      form.append("description", formData.description);

      // Pricing settings
      form.append("default_pricing_mode", defaultPricingMode);
      form.append("default_custom_price_tiers", JSON.stringify(defaultCustomPriceTiers));

      if (logoFile) {
        form.append("logo", logoFile);
      }

      await uploadApi.uploadProfile(form);

      // Cache locally for instant loading
      localStorage.setItem('company_default_pricing_mode', defaultPricingMode);
      localStorage.setItem('company_default_custom_tiers', JSON.stringify(defaultCustomPriceTiers));

      // Re-fetch fresh user data from server and synchronize to Redux & localStorage
      try {
        const freshUserRes: any = await authApi.getUser();
        const freshData = freshUserRes?.data || freshUserRes || {};
        if (freshData) {
          if (freshData.logo) {
            setLogo(freshData.logo);
          }
          setLogoFile(null);
          dispatch(updateUser({
            id: freshData.id?.toString() || user?.id || '1',
            name: freshData.user_name || freshData.name || formData.userName,
            email: freshData.email || formData.userEmail,
            role: normalizeAuthRole(freshData.role || 'supplier'),
            status: freshData.role || 'supplier',
            avatar: freshData.logo || freshData.company_logo || freshData.photo || freshData.avatar || undefined,
            logo: freshData.logo || freshData.company_logo || freshData.photo || freshData.avatar || undefined,
            phone_num: freshData.phone_num || formData.userPhone,
            country: freshData.country || formData.country,
          }));
        }
      } catch (syncErr) {
        console.warn("Failed to sync fresh user data to Redux:", syncErr);
      }

      toast.success("Profile and Company Pricing Settings updated successfully!");
    } catch (err: any) {
      console.error("Failed to update profile", err);
      const apiError = err?.response?.data?.message || err?.message || "Failed to update profile. Please try again.";
      toast.error(apiError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionLayout>
      <PageHeader
        title="Company Profile"
        description="Manage your personal profile, company details, logo, and default pricing settings."
        showAction={false}
      />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Manager Info & Logo */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="text-primary-600" size={20} /> Manager Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">User Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formData.userName}
                      onChange={(e) => handleChange("userName", e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={formData.userEmail}
                      onChange={(e) => handleChange("userEmail", e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={formData.userPhone}
                      onChange={(e) => handleChange("userPhone", e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Company Logo</h3>
              <ImageUploader
                value={logo && !logo.startsWith('blob:') && !logo.startsWith('data:') ? (logo.startsWith('http') ? logo : `${getBackendBaseUrl()}/img/${logo}`) : logo}
                onChange={(url) => {
                  setLogo(url);
                }}
                onFileChange={(file) => {
                  setLogoFile(file);
                }}
              />
              {logo && typeof logo === 'string' && !logo.startsWith('blob:') && !logo.startsWith('data:') && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Current Logo:</p>
                  <div className="w-[150px] h-[45px] relative rounded-lg border border-gray-200 overflow-hidden bg-white p-1 flex items-center justify-center">
                    <img src={logo.startsWith('http') ? logo : `${getBackendBaseUrl()}/img/${logo}`} alt="Current Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3 text-center">Click or drag to upload your company logo</p>
            </div>
          </div>

          {/* Right Column: Company Info & Pricing Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">

            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Building className="text-primary-600" size={20} /> Company Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Description / Biography</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  placeholder="Enter details about your company, when it started, and what services it offers..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                <div className="relative">
                  <Languages className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={formData.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    <option value="English">English</option>
                    <option value="Arabic">Arabic</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Company Pricing System Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="text-primary-600" size={20} /> Company Pricing Template Settings
              </h3>
              <span className="text-xs bg-primary-50 text-primary-700 font-bold px-2.5 py-1 rounded-full border border-primary-200">
                Auto-Applies to Fleet
              </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Choose the default pricing mode and day range template for your company. All new vehicle additions and Excel bulk upload templates will automatically use this layout.
            </p>

            {/* Mode selector */}
            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setDefaultPricingMode('standard')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  defaultPricingMode === 'standard'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Standard (3 Tiers)
              </button>
              <button
                type="button"
                onClick={() => setDefaultPricingMode('granular')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  defaultPricingMode === 'granular'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Granular (5 Tiers)
              </button>
              <button
                type="button"
                onClick={() => setDefaultPricingMode('dynamic')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  defaultPricingMode === 'dynamic'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Sparkles size={13} /> Custom Ranges
              </button>
            </div>

            {/* If Dynamic is selected, render template builder */}
            {defaultPricingMode === 'dynamic' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Company Day Ranges Template:</label>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Day Range
                  </button>
                </div>

                <div className="space-y-2">
                  {defaultCustomPriceTiers.map((tier, idx) => (
                    <div key={tier.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <span className="w-6 h-6 rounded-md bg-primary-100 text-primary-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-400 block mb-0.5">Min Days</label>
                          <input
                            type="number"
                            min={1}
                            value={tier.minDays}
                            onChange={(e) => handleUpdateTier(tier.id, 'minDays', parseInt(e.target.value) || 1)}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <span className="text-xs text-gray-400 font-bold mt-3">to</span>
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-400 block mb-0.5">Max Days</label>
                          <input
                            type="number"
                            min={tier.minDays}
                            value={tier.maxDays}
                            onChange={(e) => handleUpdateTier(tier.id, 'maxDays', parseInt(e.target.value) || tier.minDays)}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTier(tier.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors mt-3"
                        title="Delete Tier"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-200"
              >
                <Save size={20} />
                {isSaving ? "Saving Settings..." : "Save Profile & Pricing Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </SectionLayout>
  );
}

