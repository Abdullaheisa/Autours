"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, CheckCircle2, XCircle, Save, Loader2, DollarSign } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import Pagination from "@/components/ui/Pagination";
import { supplierApi } from "@/services/api/supplierApi";
import { useSearch } from "../../context/SearchContext";
import { getVehicleImageUrl } from "@/utils/getImageUrl";
import toast from "react-hot-toast";

export default function PriceListSection() {
  const { searchQuery } = useSearch();
  const [localSearch, setLocalSearch] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeItems, setActiveItems] = useState<Record<number, boolean>>({});
  const [prices, setPrices] = useState<Record<number, { price: string; week_price: string; month_price: string }>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [localSearch, searchQuery]);

  const fetchVehicles = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res: any = await supplierApi.getVehicles(page, itemsPerPage);
      const raw: any = res?.data;
      // Paginated response: { data: [...], total, last_page }
      const list = raw?.data && Array.isArray(raw.data) ? raw.data : (Array.isArray(raw) ? raw : []);
      if (list.length > 0 || Array.isArray(raw?.data)) {
        setTotalPages(raw?.last_page || 1);
        setTotalCount(raw?.total || list.length);
      }
      setVehicles(list);
      const activeMap: Record<number, boolean> = {};
      const priceMap: Record<number, any> = {};
      list.forEach((v: any) => {
        activeMap[v.id] = !!v.activation;
        priceMap[v.id] = {
          price: v.price?.toString() || "0",
          week_price: v.week_price?.toString() || "0",
          month_price: v.month_price?.toString() || "0"
        };
      });
      setActiveItems(activeMap);
      setPrices(priceMap);
    } catch (err: any) {
      console.warn("Failed to fetch vehicles:", err.message);
      toast.error("Failed to load vehicle pricing data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(currentPage);
  }, [currentPage]);

  // Client-side filter on top of the current page results
  const filteredVehicles = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase();
    if (!query) return vehicles;
    return vehicles.filter(v => {
      const catName = typeof v.category === 'object' ? v.category?.name : v.category;
      return v.name?.toLowerCase().includes(query) || String(catName || '').toLowerCase().includes(query);
    });
  }, [vehicles, searchQuery, localSearch]);

  // Server-side pagination; fall back to client-side when searching
  const isSearching = !!(searchQuery || localSearch);
  const effectiveTotalPages = isSearching ? Math.ceil(filteredVehicles.length / itemsPerPage) : totalPages;
  const paginatedVehicles = isSearching
    ? filteredVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredVehicles;

  const toggleStatus = async (id: number) => {
    const nextStatus = !activeItems[id];
    setTogglingId(id);
    try {
      const res: any = await supplierApi.toggleVehicleActivation(id, nextStatus);
      if (res?.status || res?.data) {
        setActiveItems(prev => ({ ...prev, [id]: nextStatus }));
        toast.success(`Vehicle activation set to ${nextStatus ? 'Active' : 'Inactive'}`);
      } else {
        toast.error("Failed to toggle vehicle status.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to update vehicle status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handlePriceChange = (id: number, field: string, value: string) => {
    setPrices(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSave = async (id: number) => {
    const p = prices[id];
    setSavingId(id);
    try {
      const res: any = await supplierApi.updateVehiclePrice(id, { 
        price: parseFloat(p.price) || 0,
        week_price: parseFloat(p.week_price) || 0,
        month_price: parseFloat(p.month_price) || 0
      });
      if (res?.status || res?.data) {
        toast.success("Pricing tiers updated successfully!");
      } else {
        toast.error("Failed to update pricing tiers.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to update pricing.");
    } finally {
      setSavingId(null);
    }
  };

  const resolveImageUrl = (v: any) => {
    let img = v.image || v.photo || v.car_photo || v.cover_image;
    if (Array.isArray(img)) img = img[0];
    if (img && typeof img === 'object') img = img.photo || img.url || img.path || img.image || '';
    if (!img || typeof img !== 'string') return undefined;
    return getVehicleImageUrl(img);
  };

  return (
    <SectionLayout>
      <PageHeader 
        title="Price List" 
        description="Monitor and manage your vehicle pricing tiers across all branches"
        showAction={false} 
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 mt-6">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by vehicle name or brand..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <span className="text-sm font-medium">Loading price lists...</span>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
          <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Vehicles Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Add vehicles to your fleet to configure their daily, weekly, and monthly pricing rates.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="overflow-x-auto" style={{ transform: "rotateX(180deg)" }}>
            <div style={{ transform: "rotateX(180deg)" }}>
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Vehicle & Status</th>
                    <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[160px]">Daily Rate (1-2 Days)</th>
                    <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[160px]">Weekly Rate (3-7 Days)</th>
                    <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[160px]">Monthly Rate (8-30 Days)</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Location</th>
                    <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[150px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedVehicles.map((vehicle) => {
                    const isActive = activeItems[vehicle.id];
                    const isSaving = savingId === vehicle.id;
                    const isToggling = togglingId === vehicle.id;

                    return (
                      <tr key={vehicle.id} className="hover:bg-gray-50/30 transition-colors group animate-in fade-in duration-300">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-10 rounded-xl overflow-hidden border border-gray-150 shadow-sm bg-gray-50 shrink-0">
                              {resolveImageUrl(vehicle) ? (
                                <img src={resolveImageUrl(vehicle) as string} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-350" />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 font-bold text-xs">NO IMG</div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm leading-tight">{vehicle.name}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                {isActive ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    <CheckCircle2 size={10} /> Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                                    <XCircle size={10} /> Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <input 
                              type="number" 
                              min="0"
                              value={prices[vehicle.id]?.price || "0"} 
                              onChange={(e) => handlePriceChange(vehicle.id, 'price', e.target.value)} 
                              className="w-24 h-9 text-center bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                            />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">AED</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <input 
                              type="number" 
                              min="0"
                              value={prices[vehicle.id]?.week_price || "0"} 
                              onChange={(e) => handlePriceChange(vehicle.id, 'week_price', e.target.value)} 
                              className="w-24 h-9 text-center bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                            />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">AED</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <input 
                              type="number" 
                              min="0"
                              value={prices[vehicle.id]?.month_price || "0"} 
                              onChange={(e) => handlePriceChange(vehicle.id, 'month_price', e.target.value)} 
                              className="w-24 h-9 text-center bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                            />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">AED</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900">
                              {typeof vehicle.pickup_loc === 'object' ? (vehicle.pickup_loc?.adresse || vehicle.pickup_loc?.name) : vehicle.pickup_loc || "All Branches"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              type="button"
                              onClick={() => toggleStatus(vehicle.id)}
                              disabled={isToggling}
                              className={`p-2.5 rounded-xl border transition-all ${
                                isActive 
                                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100' 
                                  : 'text-red-500 bg-red-50 border-red-100 hover:bg-red-100'
                              }`}
                              title={isActive ? "Set Inactive" : "Set Active"}
                            >
                              {isToggling ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : isActive ? (
                                <CheckCircle2 size={16} />
                              ) : (
                                <XCircle size={16} />
                              )}
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleSave(vehicle.id)}
                              disabled={isSaving}
                              className="p-2.5 bg-primary hover:bg-primary/95 text-black font-bold rounded-xl transition-all shadow-md shadow-primary/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                              title="Save Pricing"
                            >
                              {isSaving ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Save size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          {(paginatedVehicles.length > 0 || totalCount > 0) && effectiveTotalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-6 py-4 bg-gray-50/30">
              <span className="text-xs font-bold text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, isSearching ? filteredVehicles.length : totalCount)} of{" "}
                {isSearching ? filteredVehicles.length : totalCount} vehicles
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={effectiveTotalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </SectionLayout>
  );
}
