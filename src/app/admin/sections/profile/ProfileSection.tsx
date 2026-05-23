"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Camera, Save } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";

export default function ProfileSection() {
  const [formData, setFormData] = useState({
    name: "Admin User",
    email: "admin@autours.net",
    phone: "+971 50 123 4567",
    country: "UAE",
    city: "Dubai",
    bio: "Super Administrator for Autours Platform",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SectionLayout>
      <PageHeader
        title="My Profile"
        description="Manage your personal information and account settings"
        showAction={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-200">
                AU
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors">
                <Camera size={14} />
              </button>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{formData.name}</h3>
            <p className="text-sm text-gray-500">Super Admin</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <MapPin size={12} />
              {formData.city}, {formData.country}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">{formData.email}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Phone size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">{formData.phone}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Edit Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary-200">
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </SectionLayout>
  );
}
