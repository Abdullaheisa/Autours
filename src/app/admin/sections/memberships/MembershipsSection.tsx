"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X, Check, Ban } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import EmptyState from "@/components/ui/EmptyState";
import { membershipApi } from "@/services/api";
import { getLogoUrl } from "@/utils/getImageUrl";

type MembershipRequest = {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  fleetSize: string;
  date: string;
  logo: string;
  status: "pending" | "approved" | "rejected";
};

export default function MembershipsPage() {
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res: any = await membershipApi.getRequests();
      const data = res?.data || res || [];
      const sortedData = [...data].sort((a: any, b: any) => b.id - a.id);
      setRequests(sortedData.map((r: any) => ({
        id: r.id,
        companyName: r.company || r.email || r.name || "Unknown Company",
        contactName: r.name || "Unknown",
        email: r.email || "",
        phone: r.phone_num || r.phone || "",
        country: r.country || "",
        city: r.city || "",
        fleetSize: r.fleet_size || "N/A",
        date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "N/A",
        logo: r.logo ? getLogoUrl(r.logo) : "https://ui-avatars.com/api/?name=" + (r.company || r.email || "C"),
        status: (r.role === "under_review" || !r.role) ? "pending" : (r.role === "active_supplier" ? "approved" : "rejected"),
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await membershipApi.accept({ id });
      fetchRequests();
    } catch (e) {
      console.error(e);
      // fallback local update
      setRequests(requests.map(req => req.id === id ? { ...req, status: "approved" } : req));
    }
  };

  const handleReject = async (id: number) => {
    try {
      await membershipApi.delete({ id });
      fetchRequests();
    } catch (e) {
      console.error(e);
      setRequests(requests.map(req => req.id === id ? { ...req, status: "rejected" } : req));
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = searchQuery === "" || req.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || (statusFilter === "Active" && req.status === "approved") || (statusFilter === "Inactive" && req.status === "pending");
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage]);

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
              <option value="Active">Approved</option>
              <option value="Inactive">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
           <div className="flex items-center justify-center py-20">
             <span className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
           </div>
        ) : (
          <div className="overflow-x-auto" style={{ transform: "rotateX(180deg)" }}>
            <div style={{ transform: "rotateX(180deg)" }}>
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">Company</th>
                    <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">Contact</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Location</th>
                    <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">Fleet</th>
                    <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">Date</th>
                    <th className="text-right text-sm font-medium text-gray-500 px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8">
                        <EmptyState title="No requests found" description="Try adjusting your search or filter" actionLabel="Clear all" onAction={clearFilters} />
                      </td>
                    </tr>
                  ) : (
                    paginatedRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50">
                              <img src={req.logo} alt={req.companyName} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{req.companyName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-900">{req.contactName}</p>
                          <p className="text-xs text-gray-500">{req.email}</p>
                          <p className="text-xs text-gray-500">{req.phone}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-900">{req.country}</p>
                          <p className="text-xs text-gray-500">{req.city}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-900">{req.fleetSize}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-500">{req.date}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {req.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleReject(req.id)}
                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <X size={16} />
                              </button>
                              <button
                                onClick={() => handleApprove(req.id)}
                                className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                              >
                                <Check size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => req.status === "approved" ? handleReject(req.id) : handleApprove(req.id)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                  req.status === "approved" 
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-600" 
                                    : "bg-red-50 text-red-600 hover:bg-emerald-50 hover:text-emerald-600"
                                }`}
                              >
                                {req.status === "approved" ? "Approved (Click to Suspend)" : "Suspended (Click to Approve)"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredRequests.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-8 py-4 bg-gray-50/30">
            <span className="text-xs font-bold text-gray-500">
              Showing {Math.min(filteredRequests.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
              {Math.min(filteredRequests.length, currentPage * itemsPerPage)} of {filteredRequests.length} requests
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition-all disabled:opacity-40 disabled:hover:bg-white"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                    currentPage === page
                      ? "bg-primary text-black shadow-sm"
                      : "border border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition-all disabled:opacity-40 disabled:hover:bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </SectionLayout>
  );
}
