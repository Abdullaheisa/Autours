"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Camera, Save, Building, Globe, Languages } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import ImageUploader from "@/components/ui/ImageUploader";
import { authApi, uploadApi } from "@/services/api";
import { getBackendBaseUrl } from "@/utils/getImageUrl";
import toast from "react-hot-toast";

export default function CompanyProfileSection() {
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
      
      if (logoFile) {
        form.append("logo", logoFile);
      }

      await uploadApi.uploadProfile(form);
      toast.success("Profile updated successfully!");
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
        title="My Profile"
        description="Manage your personal information and company settings"
        showAction={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Manager Info */}
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
              onChange={(url) => {
                setLogo(url);
              }} 
              onFileChange={(file) => {
                setLogoFile(file);
              }}
            />
            {logo && typeof logo === 'string' && !logo.startsWith('blob:') && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Current Logo:</p>
                <img src={logo.startsWith('http') || logo.startsWith('data:') ? logo : `${getBackendBaseUrl()}/img/${logo}`} alt="Current Logo" className="w-20 h-20 object-contain bg-gray-50 border border-gray-100 rounded-xl" />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3 text-center">Click or drag to upload your company logo</p>
          </div>
        </div>

        {/* Right Column: Company Info */}
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

            <div className="mt-8">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-200"
              >
                <Save size={20} />
                {isSaving ? "Saving..." : "Save Profile Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SectionLayout>
  );
}
