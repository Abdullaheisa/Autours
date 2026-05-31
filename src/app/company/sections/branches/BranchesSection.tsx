"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus, Search, MapPin, Building, Activity,
  CalendarCheck, Filter, X, Loader2
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsGrid from "@/app/company/components/StatsGrid";
import { ActionButtons } from "@/components/shared";
import { useSearch } from "../../context/SearchContext";
import { supplierApi, branchApi } from "@/services/api";
import toast from "react-hot-toast";

interface Branch {
  id: number;
  name: string;
  country: string;
  address: string;
  location: string;
  status: "active" | "inactive";
}

interface BranchFormData {
  name: string;
  adresse: string;   // backend spells it this way
  location: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  currency: string;
  activation: boolean;
}

const defaultForm: BranchFormData = {
  name: "",
  adresse: "",
  location: "",
  country: "",
  city: "",
  phone: "",
  email: "",
  currency: "USD",
  activation: true,
};

// ─────────────────────────────────────────────
// Branch Modal (shared for Add & Edit)
// ─────────────────────────────────────────────
interface BranchModalProps {
  title: string;
  formData: BranchFormData;
  onChange: (data: BranchFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting: boolean;
  errorMsg: string;
}

function BranchModal({
  title, formData, onChange, onSubmit, onClose,
  isSubmitting, errorMsg
}: BranchModalProps) {
  const set = (field: keyof BranchFormData, value: any) =>
    onChange({ ...formData, [field]: value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Building size={20} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-black text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Row: Name + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Branch Name <span className="text-red-400">*</span>
              </label>
              <input type="text" value={formData.name} onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Downtown Branch"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Location <span className="text-red-400">*</span>
              </label>
              <input type="text" value={formData.location} onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Dubai Marina"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Address <span className="text-red-400">*</span>
            </label>
            <input type="text" value={formData.adresse} onChange={(e) => set("adresse", e.target.value)}
              placeholder="e.g. 123 Sheikh Zayed Road"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          </div>

          {/* Row: Country + City */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Country <span className="text-red-400">*</span>
              </label>
              <input type="text" value={formData.country} onChange={(e) => set("country", e.target.value)}
                placeholder="e.g. UAE"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                City <span className="text-red-400">*</span>
              </label>
              <input type="text" value={formData.city} onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Dubai"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
          </div>

          {/* Row: Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Phone <span className="text-red-400">*</span>
              </label>
              <input type="tel" value={formData.phone} onChange={(e) => set("phone", e.target.value)}
                placeholder="+971 50 000 0000"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Email <span className="text-red-400">*</span>
              </label>
              <input type="email" value={formData.email} onChange={(e) => set("email", e.target.value)}
                placeholder="branch@company.com"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Currency <span className="text-red-400">*</span>
            </label>
            <input type="text" value={formData.currency} onChange={(e) => set("currency", e.target.value)}
              placeholder="e.g. USD, AED"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          </div>

          {/* Activation toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-bold text-gray-800">Active Branch</p>
              <p className="text-xs text-gray-500 mt-0.5">Visible to customers for bookings</p>
            </div>
            <button type="button" onClick={() => set("activation", !formData.activation)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                formData.activation ? "bg-primary-500" : "bg-gray-300"
              }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                formData.activation ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !formData.name.trim()}
            className="flex-1 py-3 bg-primary-500 text-white font-bold text-sm rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save Branch"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────
export default function BranchesSection() {
  const { searchQuery } = useSearch();
  const [localSearch, setLocalSearch] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [localSearch, searchQuery]);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addForm, setAddForm] = useState<BranchFormData>(defaultForm);
  const [editForm, setEditForm] = useState<BranchFormData>(defaultForm);
  const [modalError, setModalError] = useState("");

  // (No longer need reference API dropdowns - fields are free text now)

  // ── Data fetching ──────────────────────────
  const fetchBranches = useCallback(() => {
    setIsLoading(true);
    branchApi
      .getAll()
      .then((res: any) => {
        const data = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(data)) {
          const sortedData = [...data].sort((a: any, b: any) => b.id - a.id);
          setBranches(
            sortedData.map((b: any) => ({
              id: b.id,
              name: b.name || b.location || "Unnamed Branch",
              country: b.country || "",
              address: b.adresse || b.location_address || b.address || "",
              location: b.location || b.name || "",
              status: (b.activation == 1 || b.activation == true || b.activation === '1' || b.activation === 'true') ? "active" : "inactive",
            }))
          );
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // ── Stats ──────────────────────────────────
  const stats = useMemo(
    () => [
      {
        label: "Total Branches",
        value: branches.length,
        icon: <Building size={20} />,
        color: "blue" as const,
      },
      {
        label: "Active Branches",
        value: branches.filter((b) => b.status === "active").length,
        icon: <Activity size={20} />,
        color: "emerald" as const,
      },
      {
        label: "Avg Cars per Branch",
        value: branches.length > 0 ? (branches.length * 3) : 0,
        icon: <CalendarCheck size={20} />,
        color: "purple" as const,
      },
    ],
    [branches]
  );

  // ── Search ─────────────────────────────────
  const filteredBranches = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase();
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.location.toLowerCase().includes(query) ||
        b.address.toLowerCase().includes(query)
    );
  }, [branches, searchQuery, localSearch]);

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const paginatedBranches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBranches.slice(start, start + itemsPerPage);
  }, [filteredBranches, currentPage]);

  // ── Edit: open modal & prefill ─────────────
  const handleOpenEdit = async (branch: Branch) => {
    setModalError("");
    try {
      const res = await branchApi.getById(branch.id);
     
      const data = (res as any)?.data?.data || (res as any)?.data || {};
      setEditForm({
        name: data.name || branch.name,
        adresse: data.adresse || data.location_address || data.address || branch.address,
        location: data.location || branch.location,
        country: data.country || branch.country,
        city: data.city || "",
        phone: data.phone || "",
        email: data.email || "",
        currency: data.currency || "USD",
        activation: data.activation === 1 || data.activation === true || data.status === "active" || branch.status === "active",
      });
    } catch {
      setEditForm({
        name: branch.name,
        adresse: branch.address,
        location: branch.location,
        country: branch.country,
        city: "",
        phone: "",
        email: "",
        currency: "USD",
        activation: branch.status === "active",
      });
    }
    setEditingBranchId(branch.id);
    setIsEditModalOpen(true);
  };

  // ── Add submit ─────────────────────────────
  const handleAddSubmit = async () => {
    setModalError("");
    setIsSubmitting(true);
    try {
      await branchApi.create({
        name: addForm.name,
        adresse: addForm.adresse,
        location: addForm.location,
        country: addForm.country,
        city: addForm.city,
        phone: addForm.phone,
        email: addForm.email,
        currency: addForm.currency,
        activation: addForm.activation,
      });
      toast.success("Branch added successfully!");
      setIsAddModalOpen(false);
      setAddForm(defaultForm);
      fetchBranches();
    } catch (err: any) {
      setModalError(err.message || "Failed to create branch. Please try again.");
      toast.error("Failed to create branch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit submit ────────────────────────────
  const handleEditSubmit = async () => {
    if (!editingBranchId) return;
    setModalError("");
    setIsSubmitting(true);
    try {
      await branchApi.update({
        id: editingBranchId,
        name: editForm.name,
        adresse: editForm.adresse,
        location: editForm.location,
        country: editForm.country,
        city: editForm.city,
        phone: editForm.phone,
        email: editForm.email,
        currency: editForm.currency,
        activation: editForm.activation,
      });
      toast.success("Branch updated successfully!");
      setIsEditModalOpen(false);
      setEditingBranchId(null);
      fetchBranches();
    } catch (err: any) {
      setModalError(err.message || "Failed to update branch. Please try again.");
      toast.error("Failed to update branch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────
  const handleDelete = (id: number) => {
    toast(
      (t) => (
        <span className="flex flex-col gap-2">
          <span className="font-bold text-gray-800">Delete this branch?</span>
          <span className="text-sm text-gray-500">This action cannot be undone.</span>
          <div className="flex gap-2 mt-1">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await branchApi.delete({ id });
                  toast.success("Branch deleted successfully!");
                  fetchBranches();
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to delete branch!");
                }
              }}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </span>
      ),
      { duration: 10000, icon: '⚠️' }
    );
  };

  // ── Render ─────────────────────────────────
  return (
    <SectionLayout>
      {/* ── Add Branch Modal ── */}
      {isAddModalOpen && (
        <BranchModal
          title="Add New Branch"
          formData={addForm}
          onChange={setAddForm}
          onSubmit={handleAddSubmit}
          onClose={() => { setIsAddModalOpen(false); setAddForm(defaultForm); setModalError(""); }}
          isSubmitting={isSubmitting}
          errorMsg={modalError}
        />
      )}

      {/* ── Edit Branch Modal ── */}
      {isEditModalOpen && (
        <BranchModal
          title="Edit Branch"
          formData={editForm}
          onChange={setEditForm}
          onSubmit={handleEditSubmit}
          onClose={() => { setIsEditModalOpen(false); setEditingBranchId(null); setModalError(""); }}
          isSubmitting={isSubmitting}
          errorMsg={modalError}
        />
      )}

      <PageHeader
        title="Branches"
        description="Manage your physical locations and service points"
        actionLabel="Add New Branch"
        actionIcon={<Plus size={18} />}
        onAction={() => {
          setAddForm(defaultForm);
          setModalError("");
          setIsAddModalOpen(true);
        }}
      />

      <div className="mt-4">
        <StatsGrid stats={stats} />
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors"
            size={18}
          />
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

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="overflow-x-auto" style={{ transform: "rotateX(180deg)" }}>
          <div style={{ transform: "rotateX(180deg)" }}>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">
                    Branch Name
                  </th>
                  <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">
                    Country
                  </th>
                  <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">
                    Address
                  </th>
                  <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">
                    Location
                  </th>
                  <th className="text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm">Loading branches…</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedBranches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-16 text-center text-gray-400 text-sm"
                    >
                      No branches found.
                    </td>
                  </tr>
                ) : (
                  paginatedBranches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="hover:bg-gray-50/30 transition-all group animate-in fade-in duration-300"
                    >
                      <td className="px-8 py-5 font-black text-gray-900 group-hover:text-primary-700 transition-colors">
                        {branch.name}
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-600">
                        {branch.country}
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-500 max-w-xs truncate" title={branch.address}>
                        {branch.address}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <div className="p-1.5 bg-primary-50 text-primary-600 rounded-lg">
                            <MapPin size={12} />
                          </div>
                          {branch.location}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end scale-90 group-hover:scale-100 transition-transform duration-200 origin-right">
                          <ActionButtons
                            onEdit={() => handleOpenEdit(branch)}
                            onDelete={() => handleDelete(branch.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Footer */}
        {filteredBranches.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-8 py-4 bg-gray-50/30">
            <span className="text-xs font-bold text-gray-500">
              Showing {Math.min(filteredBranches.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
              {Math.min(filteredBranches.length, currentPage * itemsPerPage)} of {filteredBranches.length} branches
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
