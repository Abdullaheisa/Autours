"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit,
  Edit2, 
  Globe, 
  FileText, 
  Search, 
  Upload, 
  Download, 
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Info,
  Loader2
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsGrid from "@/app/company/components/StatsGrid";
import Pagination from "@/components/ui/Pagination";
import { rentalTermsApi } from "@/services/api";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/shared/RichTextEditor";
import Modal from "@/components/ui/Modal";

export default function CompanyRentalTermsSection() {
  const [terms, setTerms] = useState<any[]>([]);
  const [activeCountries, setActiveCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isLoadingTerms, setIsLoadingTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State (Single Add vs Bulk Upload)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"single" | "bulk">("single");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCountry]);

  // Fetch Active Countries (Countries with active supplier branch AND active vehicle)
  const fetchActiveCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const res: any = await rentalTermsApi.getActiveCountries();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setActiveCountries(list);
      if (list.length > 0) {
        setSelectedCountry(list[0]);
      }
    } catch (err: any) {
      console.warn("Failed to fetch active countries:", err.message);
      toast.error("Failed to load active countries.");
    } finally {
      setIsLoadingCountries(false);
    }
  };

  // Fetch Terms Isolated for Current Supplier and Selected Country
  const fetchTermsForCountry = async (country: string) => {
    if (!country) {
      setTerms([]);
      return;
    }
    setIsLoadingTerms(true);
    try {
      const res: any = await rentalTermsApi.getByCountry(country);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setTerms(list);
    } catch (err: any) {
      console.warn("Failed to fetch terms for country:", err.message);
      toast.error("Failed to load terms for this country.");
    } finally {
      setIsLoadingTerms(false);
    }
  };

  useEffect(() => {
    fetchActiveCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchTermsForCountry(selectedCountry);
    }
  }, [selectedCountry]);

  const openAddModal = () => {
    setModalTab("single");
    setFormData({ title: "", description: "" });
    setSelectedFile(null);
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (term: any) => {
    setModalTab("single");
    setFormData({ title: term.title || "", description: term.description || "" });
    setSelectedFile(null);
    setIsEditing(true);
    setEditId(term.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  // Handle Single Term Create / Edit
  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) {
      toast.error("Please select an active country first.");
      return;
    }
    if (!formData.title.trim() || !formData.description.trim() || formData.description === '<p><br></p>') {
      toast.error("Please enter both title and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editId) {
        await rentalTermsApi.update({ id: editId, ...formData, country: selectedCountry });
        toast.success("Rental term updated successfully.");
      } else {
        await rentalTermsApi.create({ ...formData, country: selectedCountry });
        toast.success("Rental term created successfully.");
      }
      closeModal();
      fetchTermsForCountry(selectedCountry);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save term.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Bulk Upload via Excel
  const handleSubmitBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) {
      toast.error("Please select an active country first.");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select an Excel (.xlsx, .xls, .csv) file.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("file", selectedFile);
      data.append("country", selectedCountry);

      const res: any = await rentalTermsApi.bulkUpload(data);
      toast.success(res?.message || "Terms imported successfully.");
      closeModal();
      fetchTermsForCountry(selectedCountry);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to process bulk upload file.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Delete a single rental term
  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await rentalTermsApi.delete(id);
      setTerms(prev => prev.filter(t => t.id !== id));
      toast.success("Rental term deleted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete rental term");
    } finally {
      setDeletingId(null);
    }
  };

  // Download Sample Template (Excel)
  const handleDownloadTemplate = async () => {
    try {
      toast.loading("Generating template file...", { id: "download" });
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      // Use the Next.js proxy rewrite path so it forwards to Laravel correctly
      const response = await fetch(`/api/backend/api/supplier/get/rental-terms/template?format=excel`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "X-Requested-With": "XMLHttpRequest"
        }
      });
      
      if (!response.ok) throw new Error("Failed to download template");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rental_terms_template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Template downloaded successfully!", { id: "download" });
    } catch (err: any) {
      toast.error("Failed to download template.", { id: "download" });
    }
  };

  const stats = useMemo(() => [
    { label: "Total Terms for Selected Country", value: terms.length, icon: <FileText size={20} />, color: "blue" as const },
    { label: "Available Active Countries", value: activeCountries.length, icon: <Globe size={20} />, color: "amber" as const },
  ], [terms, activeCountries]);

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
        title="Rental Terms & Policies"
        description="Manage rental terms and policies for your vehicles per active country."
        actionLabel={selectedCountry ? "Add or Upload Terms" : undefined}
        onAction={selectedCountry ? openAddModal : undefined}
      />

      <div className="mt-4">
        <StatsGrid stats={stats} />
      </div>

      {/* Active Country Filter Selector Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 mt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Select Your Active Country</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Only countries with active branches and active cars are listed
              </p>
            </div>
          </div>

          <div className="w-full md:w-72">
            {isLoadingCountries ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium py-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span>Loading active countries...</span>
              </div>
            ) : activeCountries.length === 0 ? (
              <div className="text-xs font-bold text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>No countries with active branch &amp; active car found.</span>
              </div>
            ) : (
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                {activeCountries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 my-6">
        <div className="relative group w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search through term titles or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Terms Content List */}
      {isLoadingTerms ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <span className="text-sm font-bold">Loading rental terms...</span>
        </div>
      ) : !selectedCountry ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
          <h3 className="text-base font-black text-slate-900 mb-2">Please Select an Active Country First</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            To add or manage rental terms, your company must have an active branch and car in that country.
          </p>
        </div>
      ) : filteredTerms.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center">
          <FileText size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-black text-slate-900 mb-2">
            No Rental Terms for ({selectedCountry})
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Your company has not added or uploaded any custom rental terms for ({selectedCountry}) yet.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Plus size={18} />
            <span>Add First Term</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-150">
                  <th className="text-left text-xs font-black text-slate-500 uppercase tracking-wider px-6 py-4 w-[240px]">
                    Title
                  </th>
                  <th className="text-left text-xs font-black text-slate-500 uppercase tracking-wider px-6 py-4">
                    Description
                  </th>
                  <th className="text-right text-xs font-black text-slate-500 uppercase tracking-wider px-6 py-4 w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTerms.map((term) => (
                  <tr key={term.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-slate-900 block">{term.title}</span>
                      <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded mt-1">
                        {term.country || selectedCountry}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-xs text-slate-600 font-medium leading-relaxed max-w-xl line-clamp-3 prose prose-slate"
                        dangerouslySetInnerHTML={{ __html: term.description }}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(term)}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(term.id)}
                          disabled={deletingId === term.id}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          {deletingId === term.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Add / Edit / Bulk Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          isEditing
            ? "Edit Rental Term"
            : `Add Terms for (${selectedCountry})`
        }
      >
        {!isEditing && (
          <div className="flex gap-2 border-b border-slate-200 mb-5 pb-3">
            <button
              type="button"
              onClick={() => setModalTab("single")}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                modalTab === "single" ? "bg-primary text-gray-950 shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Single Term
            </button>
            <button
              type="button"
              onClick={() => setModalTab("bulk")}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all inline-flex items-center justify-center gap-1.5 ${
                modalTab === "bulk" ? "bg-primary text-gray-950 shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Upload size={13} className="shrink-0" />
              <span>Bulk Upload (Excel)</span>
            </button>
          </div>
        )}

        {modalTab === "single" ? (
          <form onSubmit={handleSubmitSingle} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">Term Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Minimum Driver Age or Deposit Policy"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">Term Description *</label>
              <RichTextEditor
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                placeholder="Type full term details here..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                <span>{isEditing ? "Save Changes" : "Add Term"}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitBulk} className="space-y-6">
            {/* Template Download Option (Excel Only Design) */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Download Excel Template</h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                      Download the Excel sample structure to fill in your rental terms.
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate()}
                  className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-xs active:scale-95"
                >
                  <Download size={14} />
                  <span>Download Excel Template</span>
                </button>
              </div>
            </div>

            {/* File Dropzone */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-3">
                2. Choose & Upload Your Terms File
              </label>
              <div className="relative group">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="terms-file-input"
                />
                <label 
                  htmlFor="terms-file-input" 
                  className={`cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                    selectedFile 
                      ? 'border-primary bg-primary/5 hover:bg-primary/10 shadow-sm' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-350'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                    selectedFile ? 'bg-primary text-gray-950' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200/80 group-hover:text-slate-650'
                  }`}>
                    {selectedFile ? <CheckCircle2 size={28} /> : <Upload size={28} />}
                  </div>
                  <span className="text-xs font-black text-slate-800">
                    {selectedFile ? selectedFile.name : "Click here to choose file"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1">
                    Supports Excel (.csv, .xlsx, .xls) formats
                  </span>
                  {selectedFile && (
                    <span className="mt-2 text-[10px] font-black text-primary-700 bg-primary/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      File Selected Successfully
                    </span>
                  )}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                <span>Start Bulk Upload</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full relative z-10 shadow-2xl border border-slate-100 transform transition-all scale-100 duration-200 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
                <Trash2 size={28} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-slate-800">Delete Rental Term</h3>
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                  Are you sure you want to delete this rental term? This action cannot be undone and will remove it from all associated vehicles.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-black hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = deleteConfirmId;
                    setDeleteConfirmId(null);
                    handleDelete(id);
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all shadow-md shadow-rose-100 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {deletingId === deleteConfirmId ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionLayout>
  );
}
