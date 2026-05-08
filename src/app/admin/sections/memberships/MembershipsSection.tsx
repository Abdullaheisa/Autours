"use client";

import { useState } from "react";
import { Search, X, Ban, Check } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import EmptyState from "@/components/ui/EmptyState";
import { membershipCompanies, MembershipCompany } from "@/lib/data";

export default function MembershipsPage() {
  const [companies, setCompanies] = useState<MembershipCompany[]>(membershipCompanies);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = searchQuery === "" || company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || (statusFilter === "Active" && company.status === "active") || (statusFilter === "Inactive" && company.status === "inactive");
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (id: number) => {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c)));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
  };

  return (
    <SectionLayout>
      <PageHeader title="Memberships" description="Manage supplier memberships" showAction={false} />

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Type to search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-sm font-medium text-gray-500 px-5 py-3 w-1/3">Company</th>
                <th className="text-left text-sm font-medium text-gray-500 px-5 py-3 w-1/3">Status</th>
                <th className="text-right text-sm font-medium text-gray-500 px-5 py-3 w-1/3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8">
                    <EmptyState title="No companies found" description="Try adjusting your search or filter" actionLabel="Clear all" onAction={clearFilters} />
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-gray-900">{company.name}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm ${company.status === "active" ? "text-gray-900" : "text-gray-500"}`}>
                        {company.status === "active" ? "Active Supplier" : "Non Active Supplier"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {company.status === "active" ? (
                        <button
                          onClick={() => handleToggleStatus(company.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                        >
                          <Ban size={12} />
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(company.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
                        >
                          <Check size={12} />
                          Enable
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SectionLayout>
  );
}
