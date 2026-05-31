"use client";
import { useEffect, useState, useRef } from "react";
import { authApi, uploadApi } from "@/services/api";
import { User, Mail, Phone, Globe, Camera, Edit2, Lock, Save, X, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { updateUser } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import { getUserImageUrl } from "@/utils/getImageUrl";

interface ProfileData {
  name?: string;
  email?: string;
  phone_num?: string;
  phone?: string;
  country?: string;
  logo?: string;
}

export default function UserProfileInfo() {
  const dispatch = useDispatch<AppDispatch>();
  const { user: sessionUser } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  
  // Password States
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res: any = await authApi.getProfile();
      const data = res?.data || res;
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Could not load profile information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditClick = () => {
    if (!profile) return;
    setEditName(profile.name || "");
    setEditPhone(profile.phone_num || profile.phone || "");
    setEditCountry(profile.country || "");
    setLogoFile(null);
    setLogoPreview(profile.logo ? getUserImageUrl(profile.logo) : "");
    setOldPass("");
    setNewPass("");
    setConfirmNewPass("");
    setShowPasswordChange(false);
    setIsEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Name field cannot be empty.");
      return;
    }

    if (showPasswordChange) {
      if (!oldPass) {
        toast.error("Please enter your current password.");
        return;
      }
      if (!newPass || newPass.length < 6) {
        toast.error("New password must be at least 6 characters.");
        return;
      }
      if (newPass !== confirmNewPass) {
        toast.error("New passwords do not match.");
        return;
      }
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("name", editName.trim());
      formData.append("phone_num", editPhone.trim());
      formData.append("country", editCountry.trim());

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (showPasswordChange) {
        formData.append("oldPass", oldPass);
        formData.append("newPass", newPass);
        formData.append("confirmNewPass", confirmNewPass);
      }

      const res: any = await uploadApi.uploadProfile(formData);

      if (res?.message === 1 || res?.status === true) {
        toast.success("Profile updated successfully! 🎉");
        
        // Re-fetch profile and sync with Redux to update navbar
        const freshProfileRes: any = await authApi.getProfile();
        const freshData = freshProfileRes?.data || freshProfileRes;
        setProfile(freshData);

        if (sessionUser) {
          dispatch(
            updateUser({
              ...sessionUser,
              name: freshData.name || sessionUser.name,
              avatar: freshData.logo || sessionUser.avatar,
              logo: freshData.logo || sessionUser.logo,
            } as any)
          );
        }
        
        setIsEditing(false);
      } else if (res?.message === 0) {
        toast.error("Incorrect current password. Please try again.");
      } else {
        toast.error(res?.message || "Failed to update profile.");
      }
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      const msg = error.response?.data?.message || error.message || "Failed to save profile details.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="animate-pulse space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="h-px bg-gray-100 w-full" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <p className="text-gray-500 text-sm">Profile information is not available.</p>
      </div>
    );
  }

  const infoRows = [
    {
      icon: <User size={16} className="text-yellow-600" />,
      label: "Full Name",
      value: profile.name || "—",
    },
    {
      icon: <Mail size={16} className="text-yellow-600" />,
      label: "Email Address",
      value: profile.email || "—",
    },
    {
      icon: <Phone size={16} className="text-yellow-600" />,
      label: "Phone Number",
      value: profile.phone_num || profile.phone || "—",
    },
    {
      icon: <Globe size={16} className="text-yellow-600" />,
      label: "Country",
      value: profile.country || "—",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header Banner */}
      <div
        className="h-24 w-full"
        style={{
          background: "linear-gradient(135deg, #f4d849 0%, #e5c73a 50%, #d4a820 100%)",
        }}
      />

      {/* Profile Details or Edit Form */}
      <div className="px-6 pb-6">
        {!isEditing ? (
          /* ── VIEW MODE ───────────────────────────────────────────────────────── */
          <>
            <div className="flex items-end justify-between gap-4 -mt-10 mb-6 flex-wrap">
              <div className="flex items-end gap-4">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-gray-100 flex items-center justify-center overflow-hidden">
                    {profile.logo ? (
                      <img
                        src={getUserImageUrl(profile.logo)}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <User size={36} className="text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="pb-1">
                  <h3 className="text-xl font-bold text-gray-900">{profile.name || "Your Name"}</h3>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
              </div>

              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-xs rounded-xl shadow-md shadow-yellow-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Edit2 size={13} />
                Edit Profile
              </button>
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            {/* Info Rows */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Account Details
              </h4>
              {infoRows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-yellow-50 transition-colors group"
                >
                  <div className="w-9 h-9 bg-yellow-100 group-hover:bg-yellow-200 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                    {row.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {row.label}
                    </p>
                    <p className="text-sm font-bold text-gray-800 truncate">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ── EDIT MODE ───────────────────────────────────────────────────────── */
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-end gap-4 -mt-10 mb-6">
              <div className="relative shrink-0 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gray-50 flex items-center justify-center overflow-hidden relative">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={36} className="text-gray-400" />
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <Camera size={10} className="text-gray-900" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="pb-1">
                <h3 className="text-xl font-bold text-gray-900">Edit Profile Details</h3>
                <p className="text-xs text-gray-500">Update your avatar and personal details</p>
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all"
                    placeholder="+20 123 456 7890"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                  Country
                </label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all"
                    placeholder="e.g. Egypt, UAE"
                  />
                </div>
              </div>

              {/* Password Change Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="flex items-center gap-2 text-xs font-bold text-yellow-600 hover:text-yellow-700 transition-colors outline-none"
                >
                  <Lock size={14} />
                  {showPasswordChange ? "Cancel Password Change" : "Change Password?"}
                </button>
              </div>

              {showPasswordChange && (
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-4 animate-fadeIn">
                  {/* Current Password */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                      className="block w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* New Password */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="block w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmNewPass}
                        onChange={(e) => setConfirmNewPass(e.target.value)}
                        className="block w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-3 text-xs font-black text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all active:scale-[0.97]"
              >
                <X size={14} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 text-xs font-black text-gray-900 bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-all active:scale-[0.97] shadow-lg shadow-yellow-100 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
