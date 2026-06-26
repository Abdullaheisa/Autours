"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Trash2, CheckCircle2, XCircle, Loader2, Zap, X, Check, Edit3, ShieldAlert } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import Pagination from "@/components/ui/Pagination";
import { promoApi, profitApi } from "@/services/api";
import { getVehicleImageUrl } from "@/utils/getImageUrl";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function PromosSection() {
  const [promos, setPromos] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState<any | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Search & Filter States
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalSupplierFilter, setModalSupplierFilter] = useState("All");

  // Form State
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadPromos = async () => {
    setIsLoading(true);
    try {
      const res: any = await promoApi.getDefinitions();
      setPromos(Array.isArray(res) ? res : res?.data || []);
    } catch (err: any) {
      console.warn("Failed to load promotions:", err.message);
      toast.error("Failed to load promotions definitions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const filteredPromos = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return promos.filter(
      (p) =>
        (p.what_is_included || p.name || "").toLowerCase().includes(query) ||
        (p.description || "").toLowerCase().includes(query)
    );
  }, [promos, searchQuery]);

  const totalPages = Math.ceil(filteredPromos.length / itemsPerPage);
  const paginatedPromos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPromos.slice(start, start + itemsPerPage);
  }, [filteredPromos, currentPage]);

  // Open modal to assign promo to vehicles
  const handleOpenAssignModal = async (promo: any) => {
    setModalSearchQuery("");
    setModalSupplierFilter("All");
    setCurrentPromo(promo);
    setIsAssignModalOpen(true);
    setIsLoadingVehicles(true);
    try {
      // 1. Fetch all vehicles in system
      const res: any = await profitApi.getVehicles();
      const list = res?.data?.data || res?.data || res || [];

      // 2. Fetch active vehicle IDs mapped to this promo
      const activeRes: any = await promoApi.getAll();
      // To get vehicles for THIS promo, call with included_id parameter
      // We pass the parameter using index API
      const response: any = await promoApi.getAll(); 
      // The API mapped getAll fetches mapped promo included_ids or vehicles.
      // In PromosController, Route::get('promo') accepts included_id query param.
      // Let's call the index route with a custom query
      const axiosClient = (promoApi as any).getAll.prototype ? null : require("@/services/api/axiosClient").apiClient;
      let activeVehicleIds: number[] = [];
      if (axiosClient) {
        const mappedRes = await axiosClient.get(`/api/supplier/promo?included_id=${promo.id}`);
        activeVehicleIds = Array.isArray(mappedRes) ? mappedRes : (mappedRes?.data || []);
      }

      if (Array.isArray(list)) {
        setVehicles(list);
        setSelectedVehicleIds(activeVehicleIds.map((id: any) => Number(id)));
      }
    } catch (err) {
      toast.error("Failed to load fleet vehicles.");
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const handleSaveAssignments = async () => {
    if (!currentPromo) return;
    setIsSubmitting(true);
    try {
      const res: any = await promoApi.create({
        included_id: currentPromo.id,
        selected_vehicles: selectedVehicleIds.join(",")
      });
      if (res?.status || res?.data) {
        toast.success(`Updated promotions for "${currentPromo.what_is_included}"!`);
        setIsAssignModalOpen(false);
        loadPromos();
      } else {
        toast.error("Failed to update promotions.");
      }
    } catch (err: any) {
      toast.error("Failed to save promo assignments.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add/Edit Promo Definitions
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormName("");
    setFormDescription("");
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (promo: any) => {
    setIsEditing(true);
    setCurrentPromo(promo);
    setFormName(promo.what_is_included || promo.name || "");
    setFormDescription(promo.description || "");
    setIsAddEditModalOpen(true);
  };

  const handleSavePromoDefinition = async () => {
    if (!formName.trim()) {
      toast.error("Promo name is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditing && currentPromo) {
        const res: any = await promoApi.update({
          id: currentPromo.id,
          included: formName.trim(),
          description: formDescription.trim(),
        });
        if (res?.data || res?.status) {
          toast.success("Promo updated successfully!");
          setIsAddEditModalOpen(false);
          loadPromos();
        }
      } else {
        const res: any = await promoApi.suggest({
          included: formName.trim(),
          description: formDescription.trim(),
        });
        if (res?.data || res?.status) {
          toast.success("Promo created successfully!");
          setIsAddEditModalOpen(false);
          loadPromos();
        }
      }
    } catch (err: any) {
      toast.error("Failed to save promo badge.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePromoDefinition = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the promo "${name}"? This will remove it from all vehicles.`)) {
      return;
    }
    try {
      await promoApi.deleteDefinition(id);
      toast.success(`Deleted promo "${name}" successfully.`);
      loadPromos();
    } catch (err: any) {
      toast.error("Failed to delete promo.");
    }
  };

  const handleUpdateStatus = async (id: number, status: "approved" | "rejected") => {
    try {
      await promoApi.updateStatus({ id, status });
      toast.success(`Promo request ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);
      loadPromos();
    } catch (err: any) {
      toast.error("Failed to update status.");
    }
  };

  // List of unique supplier names for dropdown
  const modalSuppliersList = useMemo(() => {
    const list = new Set<string>();
    vehicles.forEach((v) => {
      const name = v.supplier?.company || v.supplier?.name || "Independent Suppliers";
      list.add(name);
    });
    return ["All", ...Array.from(list)];
  }, [vehicles]);

  // Filter vehicles by search and supplier select inside modal
  const filteredModalVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const supplierName = v.supplier?.company || v.supplier?.name || "Independent Suppliers";
      const matchesSupplier = modalSupplierFilter === "All" || supplierName === modalSupplierFilter;
      
      const vName = v.name || "";
      const matchesSearch = modalSearchQuery === "" || vName.toLowerCase().includes(modalSearchQuery.toLowerCase());
      
      return matchesSupplier && matchesSearch;
    });
  }, [vehicles, modalSupplierFilter, modalSearchQuery]);

  // Group filtered vehicles by company/supplier
  const groupedVehicles = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredModalVehicles.forEach((v) => {
      const supplierName = v.supplier?.company || v.supplier?.name || "Independent Suppliers";
      if (!groups[supplierName]) {
        groups[supplierName] = [];
      }
      groups[supplierName].push(v);
    });
    return groups;
  }, [filteredModalVehicles]);

  const toggleVehicleSelection = (id: number) => {
    setSelectedVehicleIds(prev =>
      prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
    );
  };

  const resolveImageUrl = (v: any) => {
    let img = v.image || v.photo || v.car_photo || v.cover_image;
    if (Array.isArray(img)) img = img[0];
    if (img && typeof img === 'object') img = img.photo || img.url || img.path || img.image || '';
    if (!img || typeof img !== 'string') return undefined;
    return getVehicleImageUrl(img);
  };

  return (
    <SectionLayout>
      <PageHeader
        title="Promotions Manager"
        description="Create dynamic promotional badges and assign them to any vehicle in the fleet"
        showAction={true}
        actionLabel="Add New Promo"
        onAction={handleOpenAddModal}
      />

      {/* Search Input */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4 mt-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search promos by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <span className="text-sm font-medium">Loading promotional badges...</span>
        </div>
      ) : filteredPromos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
          <Zap size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Promos Defined</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
            Get started by defining your first promotional badge, which suppliers can also use for their cars.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="bg-primary hover:bg-primary-600 text-gray-900 px-6 py-2.5 font-bold rounded-xl text-sm transition-all"
          >
            Create Promo Badge
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-10">
          {/* Horizontal scroll wrapper - scrollbar appears at top via column-reverse */}
          <div
            className="overflow-x-auto"
            style={{ display: 'flex', flexDirection: 'column-reverse' }}
          >
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-150">
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Promo Badge</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Description</th>
                <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[140px]">Source</th>
                <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[140px]">Status</th>
                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedPromos.map((promo) => {
                const isPending = promo.status === "pending";
                const isRejected = promo.status === "rejected";
                const isSuggested = promo.supplier_id !== null;
                const supplierName = promo.supplier?.company || promo.supplier?.name || "Supplier Suggestion";

                return (
                  <tr key={promo.id} className="hover:bg-gray-50/30 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${promo.status === 'approved' ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400"}`}>
                          <Zap size={16} fill={promo.status === 'approved' ? "currentColor" : "none"} />
                        </div>
                        <span className="text-sm font-bold text-gray-900 leading-snug">{promo.what_is_included || promo.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500 leading-relaxed block max-w-md">{promo.description || "No description provided."}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isSuggested ? (
                        <div className="inline-flex flex-col text-center">
                          <span className="text-xs font-bold text-gray-700">{supplierName}</span>
                          <span className="text-[10px] text-primary-600 font-medium">Supplier suggestion</span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400">Administrator</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        promo.status === 'approved'
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : isPending
                            ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                            : "bg-red-50 text-red-600 border-red-100"
                      }`}>
                        {promo.status === 'approved' ? "Approved" : isPending ? "Pending Review" : "Rejected"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(promo.id, 'approved')}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase rounded-lg transition-colors shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(promo.id, 'rejected')}
                              className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] uppercase rounded-lg transition-colors shadow-sm"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <>
                            {promo.status === 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleOpenAssignModal(promo)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary text-black font-bold text-xs rounded-xl transition-all border border-primary/20"
                                title="Assign to vehicles"
                              >
                                <Zap size={12} fill="currentColor" />
                                <span>Assign</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(promo)}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors border border-transparent"
                              title="Edit promo"
                            >
                              <Edit3 size={15} />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePromoDefinition(promo.id, promo.what_is_included || promo.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent"
                          title="Delete promo"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          {filteredPromos.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-150 px-6 py-4 bg-gray-50/30">
              <span className="text-xs font-bold text-gray-500">
                Showing {Math.min(filteredPromos.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
                {Math.min(filteredPromos.length, currentPage * itemsPerPage)} of {filteredPromos.length} promos
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

      {/* Promos Target Selection Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden p-6 z-10 mx-2 max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-150">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Promote Active: {currentPromo?.what_is_included || currentPromo?.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Toggle which fleet vehicles should display this promo badge next to the car box & logo</p>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search and Filters inside Modal */}
              <div className="flex flex-col sm:flex-row gap-3 py-3 border-b border-gray-150 bg-gray-50/20 px-1">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" size={15} />
                  <input
                    type="text"
                    placeholder="Search vehicle by name..."
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div className="w-full sm:w-56">
                  <select
                    value={modalSupplierFilter}
                    onChange={(e) => setModalSupplierFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer outline-none"
                  >
                    {modalSuppliersList.map((sup, idx) => (
                      <option key={idx} value={sup}>
                        {sup === "All" ? "All Suppliers (Companies)" : sup}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto py-4 space-y-6 no-scrollbar">
                {isLoadingVehicles ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    <span className="text-xs font-semibold">Loading active fleet...</span>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-500">No active vehicles found in system.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedVehicles).map(([supplier, list]) => (
                      <div key={supplier} className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-1.5">
                          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{supplier}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-bold">{list.length} cars</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {list.map((v) => {
                            const isSelected = selectedVehicleIds.includes(v.id);
                            return (
                              <div
                                key={v.id}
                                onClick={() => toggleVehicleSelection(v.id)}
                                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all hover:bg-gray-50/50 ${
                                  isSelected ? "border-primary bg-primary/5" : "border-gray-200 bg-white"
                                }`}
                              >
                                <div className="w-12 h-8 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                                  {resolveImageUrl(v) ? (
                                    <img src={resolveImageUrl(v)} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400 font-bold bg-gray-100">CAR</div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate leading-snug">{v.name}</p>
                                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{v.pickup_loc?.name || "All Branches"}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                                  isSelected ? "bg-primary border-primary text-black" : "bg-white border-gray-300"
                                }`}>
                                  {isSelected && <Check size={12} strokeWidth={3} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-150 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignments}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-primary hover:bg-primary/95 disabled:opacity-50 disabled:pointer-events-none text-black font-black rounded-xl text-sm transition-colors uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Fleet Assignments</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Promo Definition Modal */}
      <AnimatePresence>
        {isAddEditModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 z-10 mx-2 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-150">
                <h3 className="text-lg font-bold text-gray-900">{isEditing ? "Edit Promo Badge" : "Create Promo Badge"}</h3>
                <button
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="py-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Promo Badge Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Super Offer, Best Price"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Description / Details</label>
                  <textarea
                    placeholder="Brief description of the promotion details..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-150 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePromoDefinition}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-primary hover:bg-primary/95 disabled:opacity-50 disabled:pointer-events-none text-black font-black rounded-xl text-sm transition-colors uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Promo</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SectionLayout>
  );
}
