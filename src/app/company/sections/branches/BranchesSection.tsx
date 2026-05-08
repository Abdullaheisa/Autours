"use client";

import { useState, useMemo } from "react";
import { Plus, Search, MapPin, Building, Activity, CalendarCheck, Filter } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsGrid from "@/app/company/components/StatsGrid";
import { ActionButtons } from "@/components/shared";
import { useSearch } from "../../context/SearchContext";

interface Branch {
  id: number;
  name: string;
  country: string;
  address: string;
  location: string;
  status: "active" | "inactive";
}

const initialBranches: Branch[] = [
  { id: 1, name: "Dubai Marina Branch", country: "UAE", address: "Marina Waterfront, Tower 1", location: "Dubai", status: "active" },
  { id: 2, name: "DXB Terminal 3", country: "UAE", address: "Airport Terminal 3, Arrivals", location: "Dubai", status: "active" },
  { id: 3, name: "Abu Dhabi Mall", country: "UAE", address: "AD Mall Ground Floor", location: "Abu Dhabi", status: "inactive" },
];

export default function BranchesSection() {
  const { searchQuery } = useSearch();
  const [localSearch, setLocalSearch] = useState("");
  const [branches, setBranches] = useState<Branch[]>(initialBranches);

  const stats = useMemo(() => [
    { label: "Total Branches", value: branches.length, icon: <Building size={20} />, color: "blue" as const },
    { label: "Active Branches", value: branches.filter(b => b.status === "active").length, icon: <Activity size={20} />, color: "emerald" as const },
    { label: "Rentals per Branch", value: "142", icon: <CalendarCheck size={20} />, color: "purple" as const },
  ], [branches]);

  const filteredBranches = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase();
    return branches.filter(b => 
      b.name.toLowerCase().includes(query) ||
      b.location.toLowerCase().includes(query) ||
      b.address.toLowerCase().includes(query)
    );
  }, [branches, searchQuery, localSearch]);

  const handleDelete = (id: number) => {
    if (confirm("Delete this branch?")) {
      setBranches(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <SectionLayout>
      <PageHeader
        title="Branches"
        description="Manage your physical locations and service points"
        actionLabel="Add New Branch"
        actionIcon={<Plus size={18} />}
        onAction={() => alert("Add Branch Modal")}
      />

      <div className="mt-4">
        <StatsGrid stats={stats} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search branches by name, location or address..."
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
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">Branch Name</th>
                <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">Country</th>
                <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">Address</th>
                <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">Location</th>
                <th className="text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50/30 transition-all group">
                  <td className="px-8 py-5 font-black text-gray-900 group-hover:text-primary-700 transition-colors">{branch.name}</td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-600">{branch.country}</td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-500">{branch.address}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <div className="p-1.5 bg-primary-50 text-primary-600 rounded-lg">
                        <MapPin size={12} />
                      </div>
                      {branch.location}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-end scale-90 group-hover:scale-100 transition-transform origin-right">
                      <ActionButtons 
                        onEdit={() => alert("Edit Branch")}
                        onDelete={() => handleDelete(branch.id)}
                      />
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
