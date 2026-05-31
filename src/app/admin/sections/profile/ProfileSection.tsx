"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Camera, Save } from "lucide-react";
import { getBackendBaseUrl } from "@/utils/getImageUrl";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import { authApi, uploadApi } from "@/services/api";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { updateUser } from "@/store/slices/authSlice";

export default function ProfileSection() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "Admin User",
    email: "admin@autours.net",
    phone_num: "",
    country: "UAE",
    city: "Dubai",
    address: "",
    language: "English",
    company: "Autours",
    gender: "Male",
    bio: "Super Administrator for Autours Platform",
    logo: "",
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    authApi.getUser().then((res: any) => {
      const user = res?.data || res;
      if (user) {
        setFormData({
          name: user.name || user.first_name || "Admin User",
          email: user.email || "admin@autours.net",
          phone_num: user.phone_num || user.phone || "",
          country: user.country || "UAE",
          city: user.city || "Dubai",
          address: user.address || "",
          language: user.language || "English",
          company: user.company || "Autours",
          gender: user.gender || "Male",
          bio: user.description || "Super Administrator",
          logo: user.logo || "",
        });
      }
    }).catch((err) => console.warn(err.message));
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, logo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("phone_num", formData.phone_num);
      payload.append("country", formData.country);
      payload.append("city", formData.city);
      payload.append("address", formData.address);
      payload.append("language", formData.language);
      payload.append("company", formData.company);
      payload.append("gender", formData.gender);
      payload.append("description", formData.bio);

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      await uploadApi.uploadProfile(payload);
      
      try {
        const res: any = await authApi.getUser();
        const userData = res?.data || res;
        if (userData) {
          dispatch(updateUser({
            id: userData.id?.toString() || '1',
            name: userData.user_name || userData.name || formData.name,
            email: userData.email || formData.email,
            role: userData.role || 'admin',
            status: userData.role || 'admin',
            avatar: userData.logo || userData.company_logo || userData.photo || userData.avatar || undefined,
            logo: userData.logo || userData.company_logo || userData.photo || userData.avatar || undefined,
          }));
        }
      } catch (reduxErr) {
        console.warn("Failed updating redux user profile:", reduxErr);
      }

      toast.success("Profile saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
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
            <div className="relative w-24 h-24 mx-auto mb-4 group">
              {formData.logo ? (
                <img 
                  src={formData.logo.startsWith("http") || formData.logo.startsWith("data:") ? formData.logo : `${getBackendBaseUrl()}/img/${formData.logo}`} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg shadow-primary-200 bg-white" 
                />
              ) : (
                <div className="w-24 h-24 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-200">
                  {formData.name.charAt(0)}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors cursor-pointer">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
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
              <span className="text-sm text-gray-600">{formData.phone_num}</span>
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
                value={formData.phone_num}
                onChange={(e) => handleChange("phone_num", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={formData.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="English">English</option>
                <option value="Arabic">Arabic</option>
                <option value="French">French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
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
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary-200"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </SectionLayout>
  );
}
