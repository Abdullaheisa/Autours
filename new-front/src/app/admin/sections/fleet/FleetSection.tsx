"use client";

import { useState, useEffect } from "react";
import { 
  Car, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Save, 
  X, 
  Layers, 
  ToggleLeft,
  ToggleRight,
  Loader2,
  Users,
  Briefcase
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import ImageUploader from "@/components/ui/ImageUploader";
import { fleetApi } from "@/services/api";
import { BACKEND_URL } from "@/config/api";
import toast from "react-hot-toast";

interface FleetItem {
  id: number;
  category_name: string;
  badge?: string | null;
  car_name: string;
  photo?: string | null;
  price: number;
  currency: string;
  supplier_name?: string | null;
  seats?: string | null;
  doors?: string | null;
  luggage?: string | null;
  description?: string | null;
  order: number;
  active: boolean;
}

const CATEGORY_PRESETS = [
  "Mini",
  "Small",
  "Economy",
  "Standard",
  "Full Size",
  "Compact SUV",
  "SUV",
  "Minivan",
  "Luxury"
];

export default function FleetSection() {
  const [items, setItems] = useState<FleetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FleetItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    category_name: string;
    car_name: string;
    seats: string;
    doors: string;
    luggage: string;
    description: string;
    order: string;
    active: boolean;
    photoUrl: string;
    photoFile: File | null;
  }>({
    category_name: "Economy",
    car_name: "",
    seats: "5 Seats",
    doors: "4 Doors",
    luggage: "2-3 Bags",
    description: "",
    order: "0",
    active: true,
    photoUrl: "",
    photoFile: null,
  });

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const res: any = await fleetApi.getAll();
      const rawData = res?.data || res || [];
      setItems(Array.isArray(rawData) ? rawData : []);
    } catch (err: any) {
      console.error("Failed to load fleet:", err);
      toast.error("Failed to load fleet vehicles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const totalItems = items.length;
  const activeItems = items.filter(i => i.active).length;
  const inactiveItems = totalItems - activeItems;
  const uniqueCategories = new Set(items.map(i => i.category_name.toLowerCase().trim())).size;

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.car_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "active") return matchesSearch && item.active;
    if (statusFilter === "inactive") return matchesSearch && !item.active;
    return matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      category_name: "Economy",
      car_name: "",
      seats: "5 Seats",
      doors: "4 Doors",
      luggage: "2-3 Bags",
      description: "",
      order: (items.length + 1).toString(),
      active: true,
      photoUrl: "",
      photoFile: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FleetItem) => {
    setEditingItem(item);
    
    let fullPhotoUrl = "";
    if (item.photo) {
      fullPhotoUrl = item.photo.startsWith("http") 
        ? item.photo 
        : `${BACKEND_URL}/${item.photo.replace(/^\//, '')}`;
    }

    setFormData({
      category_name: item.category_name || "",
      car_name: item.car_name || "",
      seats: item.seats || "5 Seats",
      doors: item.doors || "4 Doors",
      luggage: item.luggage || "2-3 Bags",
      description: item.description || "",
      order: (item.order ?? 0).toString(),
      active: item.active !== undefined ? item.active : true,
      photoUrl: fullPhotoUrl,
      photoFile: null,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleToggleActive = async (item: FleetItem) => {
    try {
      // Optimistic update
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
      await fleetApi.toggleActive(item.id);
      toast.success(`${item.car_name} status updated!`);
    } catch (err: any) {
      toast.error("Failed to update status.");
      fetchFleet();
    }
  };

  const handleDelete = (item: FleetItem) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-800">
          Delete <strong>{item.car_name}</strong> from fleet?
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await fleetApi.delete(item.id);
                setItems(prev => prev.filter(i => i.id !== item.id));
                toast.success("Fleet vehicle deleted successfully!");
              } catch (err: any) {
                toast.error("Failed to delete vehicle.");
              }
            }}
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    if (!formData.car_name.trim()) {
      toast.error("Car model name is required.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append("category_name", formData.category_name.trim());
      payload.append("car_name", formData.car_name.trim());
      payload.append("price", "0");
      payload.append("currency", "AED");
      if (formData.seats.trim()) payload.append("seats", formData.seats.trim());
      if (formData.doors.trim()) payload.append("doors", formData.doors.trim());
      if (formData.luggage.trim()) payload.append("luggage", formData.luggage.trim());
      if (formData.description.trim()) payload.append("description", formData.description.trim());
      payload.append("order", (parseInt(formData.order) || 0).toString());
      payload.append("active", formData.active ? "1" : "0");

      if (formData.photoFile) {
        payload.append("photo", formData.photoFile);
      } else if (formData.photoUrl && !formData.photoUrl.startsWith("data:")) {
        const clean = formData.photoUrl.replace(BACKEND_URL, "").replace(/^\//, "");
        payload.append("photo", clean);
      }

      if (editingItem) {
        await fleetApi.update(editingItem.id, payload);
        toast.success("Fleet vehicle updated successfully!");
      } else {
        await fleetApi.create(payload);
        toast.success("Fleet vehicle added successfully!");
      }

      handleCloseModal();
      fetchFleet();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err?.response?.data?.message || "Failed to save fleet vehicle.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCarImageUrl = (rawPhoto: string | null | undefined) => {
    if (!rawPhoto) return "/img/placeholder-car.png";
    if (rawPhoto.startsWith("http://") || rawPhoto.startsWith("https://") || rawPhoto.startsWith("data:")) {
      return rawPhoto;
    }
    const clean = rawPhoto.startsWith("/") ? rawPhoto.slice(1) : rawPhoto;
    return `${BACKEND_URL}/${clean}`;
  };

  return (
    <SectionLayout>
      <PageHeader 
        title="Our Fleet" 
        description="Manage the vehicle categories, specifications, and descriptions displayed on the public Our Fleet page." 
        actionLabel="Add Fleet Vehicle"
        onAction={handleOpenAdd}
        showAction={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatsCard label="Total Fleet Cars" value={totalItems} icon={<Car size={20} />} color="blue" />
        <StatsCard label="Active" value={activeItems} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatsCard label="Inactive" value={inactiveItems} icon={<XCircle size={20} />} color="red" />
        <StatsCard label="Categories Covered" value={uniqueCategories} icon={<Layers size={20} />} color="purple" />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search category or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "all" ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({totalItems})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "active" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Active ({activeItems})
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "inactive" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Inactive ({inactiveItems})
          </button>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 size={32} className="animate-spin text-primary-600" />
          <span className="text-sm font-semibold">Loading fleet vehicles...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <Car size={48} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-base font-bold text-gray-900 mb-1">No Fleet Vehicles Found</h4>
          <p className="text-xs text-gray-500 mb-4">Click below to add a vehicle that will appear on the Our Fleet page.</p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus size={16} /> Add First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border ${
                item.active ? "border-gray-200" : "border-red-200 opacity-75"
              } shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative group`}
            >
              {/* Card Header & Image */}
              <div className="relative bg-gradient-to-b from-gray-50 to-white p-5 border-b border-gray-100">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                    {item.category_name}
                  </span>
                  <span className="text-[11px] font-black text-gray-400">
                    Order #{item.order}
                  </span>
                </div>

                {/* Car Photo Preview - properly proportioned */}
                <div className="relative w-full h-40 flex items-center justify-center my-2 p-2">
                  <img
                    src={getCarImageUrl(item.photo)}
                    alt={item.car_name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                <h3 className="text-base font-black text-gray-900 tracking-tight text-center mt-1">
                  {item.car_name}
                </h3>

                {/* Specs Pills under photo */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 mt-2 border-t border-gray-100 text-xs font-semibold text-gray-700">
                  {item.seats && (
                    <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                      <Users size={12} className="text-gray-500" />
                      {item.seats}
                    </span>
                  )}
                  {item.doors && (
                    <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                      <Car size={12} className="text-gray-500" />
                      {item.doors}
                    </span>
                  )}
                  {item.luggage && (
                    <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                      <Briefcase size={12} className="text-gray-500" />
                      {item.luggage}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body: Description */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                {item.description ? (
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    {item.description}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic bg-gray-50/50 p-2.5 rounded-xl">
                    No description added yet.
                  </p>
                )}
              </div>

              {/* Card Footer: Actions */}
              <div className="px-5 py-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActive(item)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                    item.active
                      ? "text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                      : "text-gray-600 bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {item.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {item.active ? "Active" : "Inactive"}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 cursor-pointer"
                    title="Edit vehicle"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    title="Delete vehicle"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simplified, Concise Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 my-8 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  {editingItem ? <Pencil size={17} /> : <Plus size={17} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingItem ? "Edit Fleet Vehicle" : "Add Fleet Vehicle"}
                  </h3>
                  <p className="text-[11px] text-gray-500">Add vehicle details and description for Our Fleet</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form — Concise, easy and streamlined */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
              {/* Photo Uploader (Aspect 16:10 or 4:3) */}
              <div>
                <ImageUploader
                  label="Car Photo (Recommended: 800x500px transparent PNG)"
                  value={formData.photoUrl || null}
                  onChange={(val) => {
                    if (!val) setFormData(prev => ({ ...prev, photoUrl: "", photoFile: null }));
                  }}
                  onFileChange={(file) => setFormData(prev => ({ ...prev, photoFile: file }))}
                />
              </div>

              {/* Row 1: Category & Car Model Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    list="category-presets"
                    required
                    value={formData.category_name}
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                    placeholder="e.g. Economy, SUV, Luxury"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <datalist id="category-presets">
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">
                    Car Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.car_name}
                    onChange={(e) => setFormData({ ...formData, car_name: e.target.value })}
                    placeholder="e.g. Hyundai Accent or similar"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Row 2: Specifications (Seats, Doors, Luggage) */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">
                    Seats
                  </label>
                  <input
                    type="text"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                    placeholder="5 Seats"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">
                    Doors
                  </label>
                  <input
                    type="text"
                    value={formData.doors}
                    onChange={(e) => setFormData({ ...formData, doors: e.target.value })}
                    placeholder="4 Doors"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">
                    Luggage
                  </label>
                  <input
                    type="text"
                    value={formData.luggage}
                    onChange={(e) => setFormData({ ...formData, luggage: e.target.value })}
                    placeholder="2-3 Bags"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Row 3: Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Category Description
                  </label>
                  <span className={`text-[10px] font-bold ${formData.description.length >= 500 ? 'text-rose-500' : 'text-gray-400'}`}>
                    {formData.description.length} / 500 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 500) })}
                  placeholder="Write the full description for this vehicle category (max 500 characters)..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                />
              </div>

              {/* Row 4: Order & Active Checkbox */}
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-600">Display Order:</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-20 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active-checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
                  />
                  <label htmlFor="active-checkbox" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                    Active
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-2.5 px-5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingItem ? "Update Vehicle" : "Save Vehicle"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SectionLayout>
  );
}
