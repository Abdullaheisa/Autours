"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Trash2, CheckCircle2, XCircle, Info, Edit2, Filter, Zap } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import { useSearch } from "../../context/SearchContext";

const initialPromoItems = [
  { id: 1, name: "Free Cancellation (24)", included: "Free Cancellation", promoted: true },
  { id: 2, name: "Free Amendment", included: "Free Amendment", promoted: false },
  { id: 3, name: "Third Party Liability (TPL)", included: "Not Promoted", promoted: false },
  { id: 4, name: "Unlimited Mileage", included: "Not Promoted", promoted: false },
  { id: 5, name: "24/7 Customer Support", included: "Not Promoted", promoted: false },
  { id: 6, name: "Online Check-in", included: "Not Promoted", promoted: false },
  { id: 7, name: "Collision Damage Waiver (CDW)", included: "Not Promoted", promoted: false },
  { id: 8, name: "VAT", included: "Not Promoted", promoted: false },
  { id: 9, name: "Free Breakdown Assistance", included: "Not Promoted", promoted: false },
  { id: 10, name: "Airport Surcharge", included: "Not Promoted", promoted: false },
];

export default function PromosSection() {
  const { searchQuery } = useSearch();
  const [localSearch, setLocalSearch] = useState("");
  const [promos, setPromos] = useState(initialPromoItems);
  const [selectedId, setSelectedId] = useState<number | null>(1);

  const filteredPromos = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase();
    return promos.filter(p => p.name.toLowerCase().includes(query));
  }, [promos, searchQuery, localSearch]);

  const handleDelete = (id: number) => {
    if (confirm("Remove this promotion?")) {
      setPromos(prev => prev.filter(p => p.id !== id));
      if (selectedId === id) setSelectedId(null);
    }
  };

  const togglePromoted = (id: number) => {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, promoted: !p.promoted } : p));
  };

  return (
    <SectionLayout>
      <PageHeader 
        title="Promotions & Highlighted Features" 
        description="Choose which features to highlight as active promotions for your customers"
        actionLabel="Add New Promo"
        actionIcon={<Plus size={18} />}
        onAction={() => alert("Add Promo Modal/Page")}
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4 mt-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search promotions..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" 
          />
        </div>
        <button 
          onClick={() => selectedId && handleDelete(selectedId)}
          disabled={!selectedId}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-red-100 text-sm whitespace-nowrap"
        >
          <Trash2 size={16} />
          Remove selected
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5 w-24">Select</th>
                <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">Feature Name</th>
                <th className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">Status</th>
                <th className="text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPromos.map((promo) => (
                <tr 
                  key={promo.id} 
                  onClick={() => setSelectedId(promo.id)}
                  className={`hover:bg-gray-50/30 transition-all group cursor-pointer ${selectedId === promo.id ? "bg-primary-50/50" : ""}`}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedId === promo.id ? "border-primary-600 bg-primary-600" : "border-gray-300 bg-white group-hover:border-primary-400"
                      }`}>
                        {selectedId === promo.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${promo.promoted ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                        <Zap size={16} fill={promo.promoted ? "currentColor" : "none"} />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{promo.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); togglePromoted(promo.id); }}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                          promo.promoted 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50" 
                            : "bg-gray-50 text-gray-400 border-gray-100"
                        }`}
                      >
                        {promo.promoted ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {promo.promoted ? "Promoted" : "Standard"}
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-primary-100">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(promo.id); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionLayout>
  );
}
