"use client";

import { useState } from "react";
import { ExternalLink, ShieldCheck, Clock, Eye, EyeOff } from "lucide-react";
import { apiClient } from "@/services/api/axiosClient";
import { companyApi } from "@/services/api";
import toast from "react-hot-toast";

interface CompanyDetailsSidebarProps {
  company: any;
}

export default function CompanyDetailsSidebar({ company }: CompanyDetailsSidebarProps) {
  const [vehiclesHidden, setVehiclesHidden] = useState<boolean>(company.vehicles_hidden ?? false);
  const [toggling, setToggling] = useState(false);

  const handleToggleVisibility = async () => {
    setToggling(true);
    try {
      const res: any = await companyApi.toggleVehiclesVisibility(company.id);
      if (res && res.status === true) {
        setVehiclesHidden(res.vehicles_hidden);
        toast.success(res.message || (res.vehicles_hidden ? "Vehicles hidden" : "Vehicles visible"));
      } else {
        toast.error(res?.message || "Failed to toggle visibility");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "Failed to toggle visibility");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Visibility Toggle */}
      <div className={`rounded-3xl p-6 border transition-colors duration-300 ${
        vehiclesHidden 
          ? 'bg-red-50 border-red-200' 
          : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {vehiclesHidden ? (
              <EyeOff size={18} className="text-red-600" />
            ) : (
              <Eye size={18} className="text-emerald-600" />
            )}
            <h3 className="text-sm font-bold text-gray-900">Vehicle Visibility</h3>
          </div>
        </div>
        <p className={`text-xs mb-4 ${vehiclesHidden ? 'text-red-600' : 'text-emerald-700'}`}>
          {vehiclesHidden
            ? "All vehicles from this supplier are currently hidden from search results."
            : "All vehicles from this supplier are visible in search results."}
        </p>
        <button
          onClick={handleToggleVisibility}
          disabled={toggling}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            vehiclesHidden
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200'
          }`}
        >
          {toggling ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : vehiclesHidden ? (
            <>
              <Eye size={16} />
              Show Vehicles in Search
            </>
          ) : (
            <>
              <EyeOff size={16} />
              Hide Vehicles from Search
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Business Details</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-xs text-gray-500">Branch Name</span>
            <span className="text-sm font-medium text-gray-900">{company.branchName}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-xs text-gray-500">Parent Company</span>
            <span className="text-sm font-medium text-gray-900">{company.parentCompany || "Independent"}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-xs text-gray-500">Member Since</span>
            <span className="text-sm font-medium text-gray-900">{company.since}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-xs text-gray-500">Role</span>
            <span className="text-sm font-medium text-gray-900">Active Supplier</span>
          </div>
        </div>
        <button 
          onClick={async () => {
            const loadId = toast.loading("Connecting to supplier dashboard...");
            try {
              const res: any = await apiClient.post(`/api/admin/impersonate/${company.id}`, {});
              if (res && (res.status === true || res.status === 'true')) {
                toast.dismiss(loadId);
                const token = res.token;
                const userObj = {
                  id: res.user.id?.toString() || '1',
                  name: res.user.user_name || res.user.name || company.email,
                  email: res.user.email || company.email,
                  role: res.user.role || 'supplier',
                  status: res.user.role || 'supplier',
                  avatar: res.user.logo || undefined,
                  logo: res.user.logo || undefined,
                };
                const url = `/login?impersonate_token=${token}&user=${encodeURIComponent(JSON.stringify(userObj))}`;
                window.open(url, '_blank');
              } else {
                toast.dismiss(loadId);
                toast.error(res?.message || 'Impersonation failed.');
              }
            } catch (e: any) {
              toast.dismiss(loadId);
              console.error(e);
              toast.error(e.response?.data?.message || 'Failed to impersonate supplier.');
            }
          }}
          className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ExternalLink size={16} />
          Visit Website
        </button>
      </div>

      <div className="bg-primary-600 rounded-3xl p-6 text-white shadow-lg shadow-primary-200">
        <ShieldCheck size={32} className="mb-4 text-white/80" />
        <h3 className="text-lg font-bold mb-2">Verified Supplier</h3>
        <p className="text-sm text-white/80 mb-6">This company has passed all verification checks and is an authorized supplier on Autours.</p>
        <div className="flex items-center gap-2 text-xs font-medium bg-white/10 p-3 rounded-xl border border-white/10">
          <Clock size={14} />
          Last verified: 2 days ago
        </div>
      </div>
    </div>
  );
}
