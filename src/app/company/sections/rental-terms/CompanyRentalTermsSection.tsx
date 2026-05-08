"use client";

import { useState, useMemo } from "react";
import { Plus, Search, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsGrid from "@/app/company/components/StatsGrid";
import { rentalTerms, RentalTerm } from "@/lib/data";

export default function CompanyRentalTermsSection() {
  const [terms] = useState<RentalTerm[]>(rentalTerms);
  const [searchQuery, setSearchQuery] = useState("");

  const stats = useMemo(() => [
    { label: "Total Terms", value: terms.length, icon: <FileText size={20} />, color: "blue" as const },
    { label: "Approved", value: terms.filter(t => t.status === "approved").length, icon: <CheckCircle size={20} />, color: "emerald" as const },
    { label: "Pending", value: terms.filter(t => t.status === "pending").length, icon: <Clock size={20} />, color: "amber" as const },
  ], [terms]);

  const filteredTerms = terms.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SectionLayout>
      <PageHeader
        title="Rental Terms"
        description="Manage your terms and conditions"
        actionLabel="Add Term"
        actionIcon={<Plus size={18} />}
        onAction={() => alert("Add Term")}
      />

      <StatsGrid stats={stats} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredTerms.map((term) => (
          <div key={term.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{term.title}</h3>
                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{term.category}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                term.status === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}>
                {term.status.toUpperCase()}
              </span>
            </div>
            <div 
              className="text-sm text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: term.description }}
            />
          </div>
        ))}
      </div>
    </SectionLayout>
  );
}
