"use client";

import { useState } from "react";
import { ImageIcon, Upload, Trash2, Eye, EyeOff, Save, X, Plus, Layout, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";

interface Banner {
  id: number;
  url: string;
  visible: boolean;
}

export default function BackgroundSettingsSection() {
  const [logo, setLogo] = useState<string | null>("https://i.ibb.co/3pYhPZ6/logo.png");
  const [banners, setBanners] = useState<Banner[]>([
    { id: 1, url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=400&fit=crop", visible: true },
    { id: 2, url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=400&fit=crop", visible: true },
  ]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newBanner: Banner = {
          id: Date.now(),
          url: reader.result as string,
          visible: true
        };
        setBanners([...banners, newBanner]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteBanner = (id: number) => {
    setBanners(banners.filter(b => b.id !== id));
  };

  const toggleBannerVisibility = (id: number) => {
    setBanners(banners.map(b => b.id === id ? { ...b, visible: !b.visible } : b));
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Homepage Banners</h3>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg shadow-primary-100">
                <Plus size={16} />
                Add Banner
                <input type="file" accept="image/*" onChange={handleAddBanner} className="hidden" />
              </label>
            </div>

            <div className="space-y-4">
              {banners.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
                  <ImageIcon size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-sm text-gray-400 font-medium">No banners added yet</p>
                </div>
              ) : (
                banners.map((banner) => (
                  <div key={banner.id} className="relative group rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 hover:border-primary-200 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center p-3 gap-4">
                      <div className="w-full sm:w-48 aspect-video bg-gray-200 rounded-xl overflow-hidden relative">
                        <img src={banner.url} alt="Banner" className="w-full h-full object-cover" />
                        {!banner.visible && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/40 px-2 py-1 rounded-lg">Hidden</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate mb-1">Banner #{banner.id.toString().slice(-6)}</p>
                        <p className="text-xs text-gray-500">Dimensions: 1920x800px · Type: JPG</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleBannerVisibility(banner.id)}
                          className={`p-2 rounded-xl transition-all ${banner.visible ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                          title={banner.visible ? "Hide Banner" : "Show Banner"}
                        >
                          {banner.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button 
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                          title="Delete Banner"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
              <button className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-primary-200 active:scale-95">
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </SectionLayout>
  );
}
