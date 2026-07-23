"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search, FileText, CheckCircle, Trash2, Loader2, Edit } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsGrid from "@/app/company/components/StatsGrid";
import Pagination from "@/components/ui/Pagination";
import { rentalTermsApi, profitApi } from "@/services/api";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/shared/RichTextEditor";
import Modal from "@/components/ui/Modal";

export default function CompanyRentalTermsSection() {
  const [activeTab, setActiveTab] = useState<"my-terms" | "system-terms">("my-terms");
  
  const [terms, setTerms] = useState<any[]>([]);
  const [systemTerms, setSystemTerms] = useState<any[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "" });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, selectedCountry]);

  const fetchMyTerms = async () => {
    setIsLoading(true);
    try {
      const res: any = await rentalTermsApi.getMyTerms();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setTerms(list);
    } catch (err: any) {
      console.warn("Failed to fetch my terms:", err.message);
      toast.error("Failed to load your terms.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const res: any = await profitApi.getBranches();
      const list = Array.isArray(res) ? res : (res?.data || []);
      const uniqueCountries = Array.from(new Set(list.map((b: any) => b.country).filter(Boolean))) as string[];
      setCountries(uniqueCountries);
      if (uniqueCountries.length > 0 && !selectedCountry) {
        setSelectedCountry(uniqueCountries[0]);
      }
    } catch (err) {
      console.warn("Failed to fetch countries");
    }
  };

  const fetchSystemTerms = async (country: string) => {
    if (!country) return;
    setIsLoading(true);
    try {
      const res: any = await rentalTermsApi.getAll(country);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setSystemTerms(list);
    } catch (err: any) {
      console.warn("Failed to fetch system terms:", err.message);
      toast.error("Failed to load system terms.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "my-terms") {
      fetchMyTerms();
    } else {
      fetchCountries();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "system-terms" && selectedCountry) {
      fetchSystemTerms(selectedCountry);
    }
  }, [selectedCountry, activeTab]);

  const openAddModal = () => {
    setFormData({ title: "", description: "" });
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (term: any) => {
    setFormData({ title: term.title || "", description: term.description || "" });
    setIsEditing(true);
    setEditId(term.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || formData.description === '<p><br></p>') {
      toast.error("Please enter both title and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editId) {
        await rentalTermsApi.update({ id: editId, ...formData });
        toast.success("Rental term updated successfully.");
      } else {
        await rentalTermsApi.create(formData);
        toast.success("Rental term created successfully.");
      }
      closeModal();
      fetchMyTerms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save term.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this rental term?")) return;
    
    setDeletingId(id);
    try {
      await rentalTermsApi.delete(id);
      toast.success("Rental term deleted.");
      fetchMyTerms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete term.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleSystemTerm = async (termId: number) => {
    if (!selectedCountry) return;
    setTogglingId(termId);
    try {
      await rentalTermsApi.selectForSupplier({ term_id: termId, country: selectedCountry });
      toast.success("Rental term updated for " + selectedCountry);
      fetchSystemTerms(selectedCountry);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update term.");
    } finally {
      setTogglingId(null);
    }
  };

  const currentList = activeTab === "my-terms" ? terms : systemTerms;

  const stats = useMemo(() => [
    { label: "Total Active Terms", value: terms.length, icon: <FileText size={20} />, color: "blue" as const },
  ], [terms]);

  const filteredTerms = useMemo(() => {
    return currentList.filter(t => {
      const titleText = (t.title || "").replace(/<[^>]+>/g, '').toLowerCase();
      const descText = (t.description || "").replace(/<[^>]+>/g, '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return titleText.includes(query) || descText.includes(query);
    });
  }, [currentList, searchQuery]);

  const totalPages = Math.ceil(filteredTerms.length / itemsPerPage);
  const paginatedTerms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTerms.slice(start, start + itemsPerPage);
  }, [filteredTerms, currentPage]);

  return (
    <SectionLayout>
      <PageHeader
        title="Rental Terms"
        description="Manage the rental terms and policies for your vehicles."
        actionLabel={activeTab === "my-terms" ? "Add Term" : undefined}
        onAction={activeTab === "my-terms" ? openAddModal : undefined}
      />

      <div className="mt-4">
        <StatsGrid stats={stats} />
      </div>

      <div className="flex gap-4 mt-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("my-terms")}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "my-terms" ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          My Custom Terms
        </button>
        <button
          onClick={() => setActiveTab("system-terms")}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "system-terms" ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Select System Terms
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 mt-6 flex flex-col md:flex-row gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search through titles or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        {activeTab === "system-terms" && (
          <div className="w-full md:w-64">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            >
              <option value="" disabled>Select Country...</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
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
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            {activeTab === "my-terms" 
              ? "You have not added any custom rental terms yet, or none match your search."
              : "No system terms available for this country, or none match your search."}
          </p>
          {activeTab === "my-terms" && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-800 transition-colors"
            >
              <Plus size={18} />
              <span>Create First Term</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="overflow-x-auto" style={{ transform: "rotateX(180deg)" }}>
            <div style={{ transform: "rotateX(180deg)" }}>
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    {activeTab === "system-terms" && (
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[100px]">Selected</th>
                    )}
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[220px]">Title</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Description</th>
                    {activeTab === "my-terms" && (
                      <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[120px]">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedTerms.map((term) => (
                    <tr key={term.id} className="hover:bg-gray-50/30 transition-colors group animate-in fade-in duration-300">
                      {activeTab === "system-terms" && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleSystemTerm(term.id)}
                            disabled={togglingId === term.id || term.status === 3}
                            className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                              term.selected
                                ? "bg-primary-500 border-primary-500 text-black"
                                : "bg-white border-gray-300 text-transparent"
                            } disabled:opacity-50`}
                          >
                            {togglingId === term.id ? <Loader2 size={12} className="animate-spin text-gray-500" /> : <CheckCircle size={16} />}
                          </button>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div 
                          className="text-sm font-bold text-gray-900 leading-snug"
                          dangerouslySetInnerHTML={{ __html: term.title || "" }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div 
                          className="text-xs text-gray-600 leading-relaxed max-w-xl line-clamp-3 prose prose-sm prose-p:my-0 prose-ul:my-0"
                          dangerouslySetInnerHTML={{ __html: term.description || "" }}
                        />
                      </td>
                      {activeTab === "my-terms" && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(term)}
                              className="p-2 text-gray-400 hover:text-blue-500 bg-white border border-gray-200 rounded-lg shadow-sm transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(term.id)}
                              disabled={deletingId === term.id}
                              className="p-2 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === term.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
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

      {/* Add / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? "Edit Rental Term" : "Add Rental Term"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Driver's License Requirements"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <RichTextEditor
                value={formData.description}
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                placeholder="Detail the requirements..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-black bg-primary hover:bg-primary-600 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Term"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </SectionLayout>
  );
}
