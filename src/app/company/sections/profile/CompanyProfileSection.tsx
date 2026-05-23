"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Camera, Save, Building, Globe, Languages } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import ImageUploader from "@/components/ui/ImageUploader";

export default function CompanyProfileSection() {
  const [formData, setFormData] = useState({
    userName: "John Doe",
    userEmail: "manager@company.com",
    userPhone: "+971 50 987 6543",
    companyName: "Premium Car Rental",
    country: "United Arab Emirates",
    city: "Dubai",
    address: "Dubai Marina, Waterfront, Tower A",
    language: "English",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <ImageUploader onChange={(url) => console.log(url)} />
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
              <button className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-200">
                <Save size={20} />
                Save Profile Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </SectionLayout>
  );
}
