"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Filter, Edit2, Trash2, CheckCircle2, XCircle, MoreVertical, Loader2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import { useSearch } from "../../context/SearchContext";
import { supplierApi } from "@/services/api/supplierApi";

export default function MyVehiclesSection() {
  const { searchQuery } = useSearch();
  const [localSearch, setLocalSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await supplierApi.getVehicles();
        if (response && Array.isArray(response.data)) {
          setItems(response.data);
        } else if (response && response.data && Array.isArray((response.data as any).data)) {
          setItems((response.data as any).data);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase();
    return items.filter(v => {
      const catName = typeof v.category === 'object' ? v.category?.name : v.category;
      return v.name?.toLowerCase().includes(query) || 
             String(catName || '')?.toLowerCase().includes(query);
    });
  }, [items, searchQuery, localSearch]);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this vehicle from your fleet? Note: Delete API is not available yet.")) {
      setItems(prev => prev.filter(v => v.id !== id));
    }
  };

  const toggleActivation = (id: number, currentStatus: boolean) => {
    // Optimistic UI update
    setItems(prev => prev.map(v => v.id === id ? { ...v, activation: !currentStatus } : v));
    // Note: There is no API endpoint in Swagger for toggling activation yet.
    // If one is added, you would call it here, e.g., supplierApi.toggleVehicleActivation(id)
  };

  const resolveImageUrl = (v: any) => {
    let img = v.image || v.photo || v.car_photo || v.cover_image;
    if (Array.isArray(img)) img = img[0];
    if (img && typeof img === 'object') img = img.url || img.path || img.image || '';
    
    if (!img || typeof img !== 'string') return undefined;
    if (img.startsWith('http')) return img;
    
    img = img.replace(/^\/+/, '');
    return `https://www.autours.net/img/vehicles/${img}`;
  };

  return (
    <SectionLayout>
      <PageHeader 
        title="Fleet Management" 
        description="View and manage your entire vehicle collection across all locations"
        actionLabel="Add New Vehicle"
        actionIcon={<Plus size={18} />}
        onAction={() => window.location.href = "/company/create-vehicle"}
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4 mt-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by vehicle name, category or year..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" 
          />
        </div>
        <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:text-primary-600 hover:border-primary-200 transition-all">
          <Filter size={20} />
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Vehicle Details</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Category</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Daily Price</th>
                <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Active / Available</th>
                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 shrink-0 flex items-center justify-center">
                        {resolveImageUrl(vehicle) ? (
                          <img src={resolveImageUrl(vehicle) as string} alt={vehicle.name || "Car"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Car&background=f3f4f6&color=9ca3af'; }} />
                        ) : (
                          <span className="text-xs text-gray-400 font-bold">No img</span>
                        )}
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{vehicle.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg uppercase tracking-wider border border-primary-100">
                      {typeof vehicle.category === 'object' ? vehicle.category?.name : vehicle.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-bold">
                    {vehicle.price ? `$${vehicle.price}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => toggleActivation(vehicle.id, vehicle.activation)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full shadow-inner transition-colors duration-300 ${vehicle.activation ? 'bg-emerald-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${vehicle.activation ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => window.location.href = `/company/vehicles/edit/${vehicle.id}`}
                        className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-100"
                        title="Edit Vehicle"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(vehicle.id)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-primary-100"
                        title="Delete Vehicle"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <Search size={32} />
                      </div>
                      <p className="text-gray-500 font-medium">No vehicles found matching your search.</p>
                      <button 
                        onClick={() => {setLocalSearch(""); window.location.reload()}} 
                        className="text-primary-600 font-bold text-sm hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SectionLayout>
  );
}
