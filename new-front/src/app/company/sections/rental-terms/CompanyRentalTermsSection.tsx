"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search, FileText, CheckCircle, Clock, Trash2, Loader2, Check, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsGrid from "@/app/company/components/StatsGrid";
import Pagination from "@/components/ui/Pagination";
import { rentalTermsApi } from "@/services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import RichTextEditor from "@/components/shared/RichTextEditor";

export default function CompanyRentalTermsSection() {
  const [terms, setTerms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [togglingTermId, setTogglingTermId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchRentalTerms = async () => {
    setIsLoading(true);
    try {
      const res: any = await rentalTermsApi.getAll();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setTerms(list);
    } catch (err: any) {
      console.warn("Failed to fetch rental terms:", err.message);
      toast.error("Failed to load rental terms from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalTerms();
  }, []);

  const handleToggleSelect = async (term: any) => {
    setTogglingTermId(term.id);
    try {
      // Backend expects 'term_id' based on App\Http\Requests\AssignRentalTerm
      const res: any = await rentalTermsApi.selectForSupplier({ term_id: term.id });
      if (res?.status || res?.data) {
        toast.success(
          term.selected
            ? "Rental term unassigned successfully."
            : "Rental term assigned successfully!"
        );
        fetchRentalTerms();
      } else {
        toast.error("Failed to update rental term assignment.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to assign term.";
      toast.error(msg);
    } finally {
      setTogglingTermId(null);
    }
  };

  const stats = useMemo(() => [
    { label: "Total Terms Available", value: terms.length, icon: <FileText size={20} />, color: "blue" as const },
    { label: "Selected Policies", value: terms.filter(t => t.selected === 1 || t.selected === true).length, icon: <CheckCircle size={20} />, color: "emerald" as const },
  ], [terms]);

  const filteredTerms = useMemo(() => {
    return terms.filter(t => {
      const titleText = (t.title || "").replace(/<[^>]+>/g, '').toLowerCase();
      const descText = (t.description || "").replace(/<[^>]+>/g, '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return titleText.includes(query) || descText.includes(query);
    });
  }, [terms, searchQuery]);

  const totalPages = Math.ceil(filteredTerms.length / itemsPerPage);
  const paginatedTerms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTerms.slice(start, start + itemsPerPage);
  }, [filteredTerms, currentPage]);

  return (
    <SectionLayout>
      <PageHeader
        title="Rental Terms"
        description="Select and manage active terms and policies for your vehicles from the Administrator's approved list"
      />

      <div className="mt-4">
        <StatsGrid stats={stats} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 mt-6">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search through titles or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
          <Loader2 size={32} className="animate-spin text-primary-500" />
          <span className="text-sm font-medium">Loading rental policies...</span>
        </div>
      ) : filteredTerms.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
          <FileText size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Rental Terms Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            There are no custom terms matching your query in the administrator database.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="overflow-x-auto" style={{ transform: "rotateX(180deg)" }}>
            <div style={{ transform: "rotateX(180deg)" }}>
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[80px]">Select</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[220px]">Title</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedTerms.map((term) => {
                    const isSelected = term.selected === 1 || term.selected === true;
                    
                    return (
                      <tr key={term.id} className="hover:bg-gray-50/30 transition-colors group animate-in fade-in duration-300">
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(term)}
                            disabled={togglingTermId === term.id}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-primary border-primary text-black shadow-sm"
                                : "bg-white border-gray-300 hover:border-primary"
                            }`}
                          >
                            {togglingTermId === term.id ? (
                              <Loader2 size={12} className="animate-spin text-gray-600" />
                            ) : isSelected ? (
                              <Check size={14} strokeWidth={3} />
                            ) : null}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div 
                            className="text-sm font-bold text-gray-900 leading-snug"
                            dangerouslySetInnerHTML={{ __html: term.title || "" }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div 
                            className="text-xs text-gray-600 leading-relaxed max-w-xl line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: term.description || "" }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          {filteredTerms.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-6 py-4 bg-gray-50/30">
              <span className="text-xs font-bold text-gray-500">
                Showing {Math.min(filteredTerms.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
                {Math.min(filteredTerms.length, currentPage * itemsPerPage)} of {filteredTerms.length} terms
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </SectionLayout>
  );
}
