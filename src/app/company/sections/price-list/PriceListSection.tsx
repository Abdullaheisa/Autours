"use client";

import { useState, useMemo } from "react";
import { Search, Info, MapPin, CheckCircle2, XCircle, Save, RotateCcw } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import { vehiclesPhotos } from "@/lib/data";
import { useSearch } from "../../context/SearchContext";

export default function PriceListSection() {
  const { searchQuery } = useSearch();
  const [localSearch, setLocalSearch] = useState("");
  const [activeItems, setActiveItems] = useState<Record<number, boolean>>(
    Object.fromEntries(vehiclesPhotos.map(v => [v.id, true]))
  );

  const filteredVehicles = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase();
    return vehiclesPhotos.filter(v => 
      v.name.toLowerCase().includes(query) || 
      v.category.toLowerCase().includes(query)
    );
  }, [searchQuery, localSearch]);

  const toggleStatus = (id: number) => {
    setActiveItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SectionLayout>
      <PageHeader 
        title="Price List" 
        description="Monitor and manage your vehicle pricing tiers across all branches"
        showAction={false} 
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 mt-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by vehicle name or branch..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Vehicle & Status</th>
                <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">1-2 Days</th>
                <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">3-7 Days</th>
                <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">8-30 Days</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Location</th>
                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVehicles.map((vehicle) => {
                const isActive = activeItems[vehicle.id];
                return (
                  <tr key={vehicle.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 shrink-0">
                          {vehicle.image && <img src={vehicle.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{vehicle.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {isActive ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                                <CheckCircle2 size={10} /> Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase">
                                <XCircle size={10} /> Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <input type="text" defaultValue="20.00" className="w-20 h-9 text-center bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                        <span className="text-[10px] font-bold text-gray-400">AED</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <input type="text" defaultValue="15.00" className="w-20 h-9 text-center bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                        <span className="text-[10px] font-bold text-gray-400">AED</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <input type="text" defaultValue="10.00" className="w-20 h-9 text-center bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                        <span className="text-[10px] font-bold text-gray-400">AED</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">Muscat Int. Airport</span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                          <MapPin size={10} /> Muscat
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleStatus(vehicle.id)}
                          className={`p-2 rounded-xl border transition-all ${isActive ? 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100' : 'text-red-500 bg-red-50 border-red-100 hover:bg-red-100'}`}
                        >
                          {isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        </button>
                        <button className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all active:scale-95">
                          <Save size={18} />
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
    </SectionLayout>
  );
}
