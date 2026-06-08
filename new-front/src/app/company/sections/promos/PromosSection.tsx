"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Trash2, CheckCircle2, XCircle, Loader2, Zap, X, Check, AlertCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import Pagination from "@/components/ui/Pagination";
import { useSearch } from "../../context/SearchContext";
import { supplierApi } from "@/services/api/supplierApi";
import { promoApi } from "@/services/api";
import { getVehicleImageUrl } from "@/utils/getImageUrl";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function PromosSection() {
  const { searchQuery } = useSearch();
  const [localSearch, setLocalSearch] = useState("");
  const [promos, setPromos] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Suggest State
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [newPromoName, setNewPromoName] = useState("");
  const [newPromoDescription, setNewPromoDescription] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Fleet Target Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState<any | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [localSearch, searchQuery]);

  const fetchPromosAndIncluded = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all promo definitions (is_promo = 1)
      const incRes: any = await promoApi.getDefinitions();
      const incList = incRes?.data || incRes || [];

      // 2. Fetch active promo included IDs
      const promoRes: any = await supplierApi.getPromos();
      const promotedIds: number[] = Array.isArray(promoRes) ? promoRes : (promoRes?.data || []);

      // Map included features with their promo status
      const mapped = incList.map((item: any) => ({
        id: item.id,
        name: item.what_is_included || item.name || `Feature #${item.id}`,
        description: item.description || "No description provided.",
        promoted: promotedIds.includes(item.id),
        status: item.status
      }));

      setPromos(mapped);
    } catch (err: any) {
      console.warn("Failed to load promotions:", err.message);
      setPromos([
        { id: 1, name: "Free Cancellation", description: "Cancel for free up to 48 hours before pickup", promoted: true, status: 'approved' },
        { id: 2, name: "Unlimited Mileage", description: "Drive as far as you want without extra charges", promoted: false, status: 'approved' },
        { id: 3, name: "Theft Protection", description: "Coverage in case the vehicle is stolen", promoted: false, status: 'approved' },
        { id: 4, name: "Collision Damage Waiver", description: "Limits your financial liability for damage", promoted: false, status: 'approved' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromosAndIncluded();
  }, []);

  const filteredPromos = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase();
    return promos.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
  }, [promos, searchQuery, localSearch]);

  const totalPages = Math.ceil(filteredPromos.length / itemsPerPage);
  const paginatedPromos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPromos.slice(start, start + itemsPerPage);
  }, [filteredPromos, currentPage]);

  const handleOpenPromoModal = async (promo: any) => {
    if (promo.status === 'pending') {
      toast.error("This promo suggestion is still pending admin approval!");
      return;
    }
    if (promo.status === 'rejected') {
      toast.error("This promo suggestion was rejected by the admin.");
      return;
    }

    setCurrentPromo(promo);
    setIsModalOpen(true);
    setIsLoadingVehicles(true);
    try {
      // 1. Fetch fleet vehicles
      const res: any = await supplierApi.getVehicles(1, 200);
      const list = res?.data?.data || res?.data || res || [];
      
      // 2. Fetch active vehicle IDs for this promo
      let activeVehicleIds: number[] = [];
      if (promo.promoted) {
        const activeRes: any = await supplierApi.getPromos(promo.id);
        activeVehicleIds = Array.isArray(activeRes) ? activeRes : (activeRes?.data || []);
      }

      if (Array.isArray(list)) {
        setVehicles(list);
        if (promo.promoted && activeVehicleIds.length > 0) {
          setSelectedVehicleIds(activeVehicleIds.map((id: any) => Number(id)));
        } else {
          setSelectedVehicleIds(list.map((v: any) => v.id)); // Default select all
        }
      }
    } catch (err) {
      toast.error("Failed to load fleet vehicles.");
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const handleSavePromo = async () => {
    if (!currentPromo) return;
    setIsSubmitting(true);
    try {
      const res: any = await supplierApi.createPromo({
        included_id: currentPromo.id,
        selected_vehicles: selectedVehicleIds.join(",")
      });
      if (res?.status || res?.data) {
        toast.success(`Successfully updated promotions for "${currentPromo.name}"!`);
        setIsModalOpen(false);
        fetchPromosAndIncluded();
      } else {
        toast.error("Failed to update promotions.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update promotions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePromo = async (includedId: number, promoName: string) => {
    try {
      await supplierApi.deletePromo(includedId);
      toast.success(`Removed promotion for "${promoName}"`);
      if (selectedId === includedId) setSelectedId(null);
      fetchPromosAndIncluded();
    } catch (err: any) {
      toast.error("Failed to remove promotion.");
    }
  };

  const handleSuggestSubmit = async () => {
    if (!newPromoName.trim()) {
      toast.error("Please enter a promo title");
      return;
    }
    setIsSuggesting(true);
    try {
      await promoApi.suggest({
        included: newPromoName.trim(),
        description: newPromoDescription.trim()
      });
      setShowSuggestModal(false);
      setNewPromoName("");
      setNewPromoDescription("");
      toast.success("Promo suggestion submitted for admin approval!");
      fetchPromosAndIncluded();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to submit suggestion");
    } finally {
      setIsSuggesting(false);
    }
  };

  const togglePromoted = (promo: any) => {
    handleOpenPromoModal(promo);
  };

  const toggleVehicleSelection = (id: number) => {
    setSelectedVehicleIds(prev => 
      prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
    );
  };

  const selectAllVehicles = () => {
    if (selectedVehicleIds.length === vehicles.length) {
      setSelectedVehicleIds([]);
    } else {
      setSelectedVehicleIds(vehicles.map(v => v.id));
    }
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
        title="Promotions & Highlights" 
        description="Choose which inclusions to highlight as active promotions across your fleet"
        showAction={true}
        actionLabel="Suggest Promo"
        onAction={() => setShowSuggestModal(true)}
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4 mt-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search featured inclusions..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
          />
        </div>
        <button 
          type="button"
          onClick={() => {
            const promo = promos.find(p => p.id === selectedId);
            if (promo && promo.promoted) {
              handleDeletePromo(promo.id, promo.name);
            }
          }}
          disabled={!selectedId || !promos.find(p => p.id === selectedId)?.promoted}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-sm whitespace-nowrap"
        >
          <Trash2 size={16} />
          Cancel Promotion
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <span className="text-sm font-medium">Loading featured inclusions...</span>
        </div>
      ) : filteredPromos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
          <Zap size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Inclusions Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Manage your features or request new inclusions from the administration panel first.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="overflow-x-auto" style={{ transform: "rotateX(180deg)" }}>
            <div style={{ transform: "rotateX(180deg)" }}>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[80px]">Select</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Inclusion Feature</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Description</th>
                    <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[160px]">Promo Status</th>
                    <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedPromos.map((promo) => (
                    <tr 
                      key={promo.id} 
                      onClick={() => setSelectedId(promo.id)}
                      className={`hover:bg-gray-50/30 transition-all group cursor-pointer animate-in fade-in duration-300 ${selectedId === promo.id ? "bg-primary-50/10" : ""}`}
                    >
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedId === promo.id ? "border-primary bg-primary" : "border-gray-300 bg-white group-hover:border-primary"
                          }`}>
                            {selectedId === promo.id && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${promo.promoted ? "bg-emerald-50 text-emerald-600" : "bg-gray-150 text-gray-400"}`}>
                            <Zap size={16} fill={promo.promoted ? "currentColor" : "none"} />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-gray-900 leading-snug block">{promo.name}</span>
                            {promo.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Suggested (Pending)
                              </span>
                            )}
                            {promo.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-750 border border-red-200/50">
                                Suggested (Rejected)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500 leading-relaxed block max-w-lg">{promo.description}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePromoted(promo); }}
                          disabled={promo.status === 'pending' || promo.status === 'rejected'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                            promo.promoted 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50" 
                              : promo.status === 'pending' || promo.status === 'rejected'
                                ? "bg-gray-100 text-gray-350 border-gray-200 cursor-not-allowed"
                                : "bg-gray-50 text-gray-400 border-gray-200 hover:border-primary hover:text-black"
                          }`}
                        >
                          {promo.promoted ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {promo.promoted ? "Promoted" : "Standard"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {promo.promoted && (
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeletePromo(promo.id, promo.name); }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                            title="Remove promo"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          {filteredPromos.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-6 py-4 bg-gray-50/30">
              <span className="text-xs font-bold text-gray-500">
                Showing {Math.min(filteredPromos.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
                {Math.min(filteredPromos.length, currentPage * itemsPerPage)} of {filteredPromos.length} features
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

      {/* Suggest Promo Tailwind Modal */}
      {showSuggestModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setShowSuggestModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 z-10 mx-2 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-150">
              <h3 className="text-base font-bold text-gray-900">Suggest a New Promo</h3>
              <button onClick={() => setShowSuggestModal(false)} className="p-1 text-gray-400 hover:text-gray-650 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="py-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Promo Title / Feature Name</label>
                <input
                  type="text"
                  value={newPromoName}
                  onChange={(e) => setNewPromoName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. GPS Included"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Description</label>
                <textarea
                  value={newPromoDescription}
                  onChange={(e) => setNewPromoDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="e.g. Free GPS navigator included with the rental..."
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-150 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSuggestModal(false)}
                className="flex-1 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSuggestSubmit}
                disabled={isSuggesting}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-black font-black rounded-xl text-xs transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
              >
                {isSuggesting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Submit Suggestion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promos Target Selection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden p-6 z-10 mx-2 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-150">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Promote: {currentPromo?.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Select which fleet vehicles should showcase this promotion</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors animate-all"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
                {isLoadingVehicles ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    <span className="text-xs font-semibold">Loading active fleet...</span>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-500">You don't have any vehicles to apply promotions to.</p>
                  </div>
                ) : (
                  <div>
                    {/* Toggle All Selection */}
                    <div className="flex items-center justify-between bg-gray-50/50 border border-gray-200/60 rounded-xl p-3.5 mb-4">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Select All Fleet Vehicles</span>
                      <button
                        type="button"
                        onClick={selectAllVehicles}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          selectedVehicleIds.length === vehicles.length
                            ? "bg-primary border-primary text-black"
                            : "bg-white border-gray-300 hover:border-primary"
                        }`}
                      >
                        {selectedVehicleIds.length === vehicles.length && <Check size={14} strokeWidth={3} />}
                      </button>
                    </div>

                    {/* Vehicles Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {vehicles.map((v) => {
                        const isSelected = selectedVehicleIds.includes(v.id);
                        return (
                          <div 
                            key={v.id}
                            onClick={() => toggleVehicleSelection(v.id)}
                            className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all hover:bg-gray-50/50 ${
                              isSelected ? "border-primary bg-primary/5/30" : "border-gray-200 bg-white"
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
                              isSelected ? "bg-primary border-primary text-black" : "bg-white border-gray-200"
                            }`}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-150 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePromo}
                  disabled={isSubmitting || selectedVehicleIds.length === 0}
                  className="flex-1 py-3 bg-primary hover:bg-primary/95 disabled:opacity-50 disabled:pointer-events-none text-black font-black rounded-xl text-sm transition-colors uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Promoting...</span>
                    </>
                  ) : (
                    <span>Promote Active</span>
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
