"use client";

import { ExternalLink, ShieldCheck, Clock } from "lucide-react";

interface CompanyDetailsSidebarProps {
  company: any;
}

export default function CompanyDetailsSidebar({ company }: CompanyDetailsSidebarProps) {
  return (
    <div className="space-y-6">
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
        <button className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
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
