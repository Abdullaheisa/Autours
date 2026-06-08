"use client";

import { useState, useEffect } from "react";
import { ImageIcon, Upload, Trash2, Eye, EyeOff, Save, X, Plus, Layout, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import { bannerApi, referenceApi, uploadApi } from "@/services/api";
import { toast } from "react-hot-toast";
import { getImageUrl } from "@/utils/getImageUrl";

interface Banner {
  id: number;
  url: string;
  image?: string;
  visible: boolean;
  sectionKey?: string;
  sectionName?: string;
}

export default function BackgroundSettingsSection() {
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      referenceApi.getLogos(),
      bannerApi.getAll()
    ]).then(([logoRes, bgRes]: any) => {
      const logos = logoRes?.data || [];
      if (logos.length > 0) {
        setLogo(logos[0].image || logos[0].url || null);
      }
      
      const bgs = bgRes?.data || [];
      setBanners(bgs.map((b: any) => ({
        id: b.id,
        url: b.image_path ? `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${b.image_path}` : b.default_image_path ? `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${b.default_image_path}` : '',
        visible: b.visible !== undefined ? b.visible : b.is_active !== undefined ? b.is_active : true,
        sectionKey: b.section_key,
        sectionName: b.section_name,
      })));
    }).catch((err) => {
      console.warn(err.message);
      toast.error("Failed to load data");
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
      
      try {
        const formData = new FormData();
        formData.append("image", file);
        await uploadApi.uploadProfile(formData);
        toast.success("Logo uploaded successfully!");
        loadData();
      } catch (e) {
        console.error(e);
        toast.error("Failed to upload logo!");
      }
    }
  };

  const handleUpdateBanner = async (e: React.ChangeEvent<HTMLInputElement>, bannerId: number) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("image", file);
        await bannerApi.update(bannerId, formData);
        toast.success("Section image updated successfully!");
        loadData();
      } catch (err) {
        console.error(err);
        toast.error("Failed to update section image!");
      }
    }
  };

  const handleDeleteBanner = async (id: number) => {
    try {
      await bannerApi.delete(id);
      toast.success("Banner deleted successfully!");
      loadData();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete banner!");
    }
  };

  const toggleBannerVisibility = async (id: number) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;
    setBanners(banners.map(b => b.id === id ? { ...b, visible: !b.visible } : b));
    try {
      await bannerApi.toggleVisibility(id, !banner.visible);
      toast.success(banner.visible ? "Banner hidden!" : "Banner visible!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to toggle visibility!");
      setBanners(banners.map(b => b.id === id ? { ...b, visible: banner.visible } : b)); // Revert UI
    }
  };

  return (
    <SectionLayout>
      <PageHeader title="Background Settings" description="Customize website logo and banners" showAction={false} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard label="Active Banners" value={banners.filter(b => b.visible).length} icon={<Layout size={20} />} color="blue" />
        <StatsCard label="Hidden Banners" value={banners.filter(b => !b.visible).length} icon={<EyeOff size={20} />} color="amber" />
        <StatsCard label="Last Updated" value="Today" icon={<ShieldCheck size={20} />} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logo Management */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Website Logo</h3>
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden mb-4 group transition-all hover:border-primary-400">
                {logo ? (
                  <>
                    <img src={logo} alt="Logo Preview" className="max-w-[80%] max-h-[80%] object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => setLogo(null)} className="p-2 bg-white text-red-500 rounded-xl shadow-lg">
                        <X size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon size={40} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase">No Logo</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <p className="text-xs text-gray-500 text-center mb-6 px-4">
                Recommended size: 200x200px. Supports PNG, JPG, SVG.
              </p>
              <button className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary-50 text-primary-600 rounded-2xl text-sm font-bold hover:bg-primary-100 transition-colors">
                <Upload size={18} />
                Upload New Logo
              </button>
            </div>
          </div>
        </div>

        {/* Banner Management */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Homepage Section Backgrounds</h3>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Each section below controls a specific background image shown on the homepage. Click &ldquo;Change Image&rdquo; to upload a new photo.
            </p>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : banners.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
                  <ImageIcon size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-sm text-gray-400 font-medium">No section backgrounds found</p>
                  <p className="text-xs text-gray-400 mt-1">Visit <code className="bg-gray-100 px-1 rounded">/seed-dummy</code> to seed default sections</p>
                </div>
              ) : (
                banners.map((banner) => (
                  <div key={banner.id} className="relative group rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 hover:border-primary-200 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center p-3 gap-4">
                      {/* Thumbnail */}
                      <div className="w-full sm:w-48 aspect-video bg-gray-200 rounded-xl overflow-hidden relative flex-shrink-0">
                        {banner.url ? (
                          <img
                            src={banner.url}
                            alt={banner.sectionName || "Banner"}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon size={24} />
                          </div>
                        )}
                        {!banner.visible && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/40 px-2 py-1 rounded-lg">Hidden</span>
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate mb-1">
                          {banner.sectionName || `Banner #${banner.id}`}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          key: <span className="text-primary-600">{banner.sectionKey || 'custom'}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Controls this section on the homepage</p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* Change Image */}
                        <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-xl text-xs font-bold cursor-pointer transition-all">
                          <Upload size={14} />
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUpdateBanner(e, banner.id)}
                          />
                        </label>
                        {/* Toggle Visibility */}
                        <button
                          onClick={() => toggleBannerVisibility(banner.id)}
                          className={`p-2 rounded-xl transition-all ${banner.visible ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                          title={banner.visible ? "Hide on homepage" : "Show on homepage"}
                        >
                          {banner.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </SectionLayout>
  );
}
