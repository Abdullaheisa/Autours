"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { 
  Search, Plus, Trash2, CheckCircle2, XCircle, Loader2, Zap, X, Check, 
  AlertCircle, Building2, Globe, MapPin, CheckCheck, Square, RotateCcw
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import Pagination from "@/components/ui/Pagination";
import { useSearch } from "../../context/SearchContext";
import { supplierApi } from "@/services/api/supplierApi";
import { promoApi } from "@/services/api";
import { getVehicleImageUrl } from "@/utils/getImageUrl";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { usePersistedPage } from "@/hooks/usePersistedPage";

export default function PromosSection() {
  const { searchQuery } = useSearch();
  const [localSearch, setLocalSearch] = useState("");
  const [promos, setPromos] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = usePersistedPage('company_promos', 1);
  const itemsPerPage = 10;
  const isSearchMount = useRef(true);

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
  const [allFleetIdsState, setAllFleetIdsState] = useState<number[]>([]);
  const [totalFleetCount, setTotalFleetCount] = useState<number>(0);
  const [isAllSelected, setIsAllSelected] = useState(true);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Modal Filters & Pagination
  const [branches, setBranches] = useState<any[]>([]);
  const [modalSearch, setModalSearch] = useState("");
  const [debouncedModalSearch, setDebouncedModalSearch] = useState("");
  const [modalCountry, setModalCountry] = useState("");
  const [modalBranch, setModalBranch] = useState("");
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalVehicles, setModalTotalVehicles] = useState(0);
  const [modalTotalPages, setModalTotalPages] = useState(1);
  const modalPerPage = 24;

  useEffect(() => {
    if (isSearchMount.current) {
      isSearchMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [localSearch, searchQuery, setCurrentPage]);

  // Debounce search in modal
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedModalSearch(modalSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [modalSearch]);

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
    // Preload branches and total fleet in background so modal opens instantly
    supplierApi.getBranches().then((res: any) => {
      const list = res?.data?.data || res?.data || res || [];
      if (Array.isArray(list)) setBranches(list);
    }).catch(() => {});

    supplierApi.getVehicleIds().then((res: any) => {
      const ids: number[] = res?.data || [];
      if (ids.length > 0) {
        setAllFleetIdsState(ids);
        setTotalFleetCount(ids.length);
      }
    }).catch(() => {});
  }, []);

  const filteredPromos = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase();
    return promos.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
  }, [promos, searchQuery, localSearch]);

  const otherActivePromo = useMemo(() => {
    return promos.find(p => p.promoted && p.id !== currentPromo?.id);
  }, [promos, currentPromo]);

  const totalPages = Math.ceil(filteredPromos.length / itemsPerPage);
  const paginatedPromos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPromos.slice(start, start + itemsPerPage);
  }, [filteredPromos, currentPage]);

  // Available countries derived from branches
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    branches.forEach(b => {
      if (b.country && typeof b.country === 'string' && b.country.trim()) {
        set.add(b.country.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [branches]);

  // Branches filtered by selected country
  const availableBranches = useMemo(() => {
    if (!modalCountry) return branches;
    return branches.filter(b => (b.country || '').trim().toLowerCase() === modalCountry.trim().toLowerCase());
  }, [branches, modalCountry]);

  const loadModalVehicles = useCallback(async (page: number, search: string, country: string, branchId: string) => {
    setIsLoadingVehicles(true);
    try {
      const res: any = await supplierApi.getVehicles(page, modalPerPage, {
        search: search.trim() || undefined,
        country: country.trim() || undefined,
        branch_id: branchId.trim() || undefined,
      });
      const data = res?.data || res;
      const list = data?.data || data?.vehicles || (Array.isArray(data) ? data : []);
      setVehicles(list);
      setModalTotalVehicles(data?.total ?? list.length);
      setModalTotalPages(data?.last_page ?? Math.max(1, Math.ceil((data?.total ?? list.length) / modalPerPage)));
    } catch (err) {
      toast.error("Failed to load vehicles.");
    } finally {
      setIsLoadingVehicles(false);
    }
  }, [modalPerPage]);

  useEffect(() => {
    if (!isModalOpen) return;
    loadModalVehicles(modalPage, debouncedModalSearch, modalCountry, modalBranch);
  }, [isModalOpen, modalPage, debouncedModalSearch, modalCountry, modalBranch, loadModalVehicles]);

  const handleSearchChange = (val: string) => {
    setModalSearch(val);
    setModalPage(1);
  };

  const handleCountryChange = (val: string) => {
    setModalCountry(val);
    setModalBranch("");
    setModalPage(1);
  };

  const handleBranchChange = (val: string) => {
    setModalBranch(val);
    setModalPage(1);
  };

  const handleClearFilters = () => {
    setModalSearch("");
    setDebouncedModalSearch("");
    setModalCountry("");
    setModalBranch("");
    setModalPage(1);
  };

  const hasActiveFilters = Boolean(modalSearch || modalCountry || modalBranch);

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
    setModalSearch("");
    setDebouncedModalSearch("");
    setModalCountry("");
    setModalBranch("");
    setModalPage(1);

    // Parallel fetch for active promo details and ensure IDs are loaded
    try {
      const [idsRes, activeRes]: any[] = await Promise.all([
        allFleetIdsState.length === 0 ? supplierApi.getVehicleIds().catch(() => ({ data: [] })) : Promise.resolve({ data: allFleetIdsState }),
        promo.promoted ? supplierApi.getPromos(promo.id).catch(() => ({ data: [] })) : Promise.resolve([]),
      ]);

      const fleetData: any = idsRes;
      const fleetIds: number[] = (fleetData?.data && Array.isArray(fleetData.data) && fleetData.data.length > 0) ? fleetData.data : allFleetIdsState;
      if (allFleetIdsState.length === 0 && fleetIds.length > 0) {
        setAllFleetIdsState(fleetIds);
        setTotalFleetCount(fleetIds.length);
      }

      const activeData: any = activeRes;
      const activeVehicleIds: number[] = Array.isArray(activeData) ? activeData : (activeData?.data || []);
      const hasAllFleetMarker = activeVehicleIds.some((id: any) => Number(id) === 0);

      if (promo.promoted && !hasAllFleetMarker && activeVehicleIds.length > 0 && (fleetIds.length === 0 || activeVehicleIds.length < fleetIds.length)) {
        const cleaned = activeVehicleIds.map((id: any) => Number(id)).filter(id => id > 0);
        setSelectedVehicleIds(cleaned);
        setIsAllSelected(false);
      } else {
        setSelectedVehicleIds(fleetIds);
        setIsAllSelected(true);
      }
    } catch (err) {
      console.error("Failed to initialize promo fleet data", err);
    }
  };

  const handleSavePromo = async () => {
    if (!currentPromo) return;
    setIsSubmitting(true);
    try {
      const applyToAll = isAllSelected || (totalFleetCount > 0 && selectedVehicleIds.length >= totalFleetCount);
      const res: any = await supplierApi.createPromo({
        included_id: currentPromo.id,
        selected_vehicles: applyToAll ? "" : selectedVehicleIds.join(","),
        select_all: applyToAll,
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
    if (isAllSelected) {
      setIsAllSelected(false);
      setSelectedVehicleIds(allFleetIdsState.filter(vId => vId !== id));
      return;
    }

    setSelectedVehicleIds(prev => {
      const isSelected = prev.includes(id);
      const next = isSelected ? prev.filter(vId => vId !== id) : [...prev, id];
      if (allFleetIdsState.length > 0 && next.length >= allFleetIdsState.length) {
        setIsAllSelected(true);
      }
      return next;
    });
  };

  const toggleSelectAllFleet = () => {
    if (isAllSelected || (totalFleetCount > 0 && selectedVehicleIds.length >= totalFleetCount)) {
      setIsAllSelected(false);
      setSelectedVehicleIds([]);
    } else {
      setIsAllSelected(true);
      setSelectedVehicleIds(allFleetIdsState);
    }
  };

  const handleSelectFiltered = async () => {
    setIsActionLoading(true);
    try {
      const res: any = await supplierApi.getVehicleIds({
        search: debouncedModalSearch.trim() || undefined,
        country: modalCountry.trim() || undefined,
        branch_id: modalBranch.trim() || undefined,
      });
      const ids: number[] = res?.data || [];
      if (ids.length === 0) {
        toast.error("No vehicles found in this filter.");
        return;
      }
      setSelectedVehicleIds(prev => {
        const base = isAllSelected ? allFleetIdsState : prev;
        const set = new Set([...base, ...ids]);
        const next = Array.from(set);
        if (allFleetIdsState.length > 0 && next.length >= allFleetIdsState.length) {
          setIsAllSelected(true);
        }
        return next;
      });
      toast.success(`Selected ${ids.length} filtered vehicles.`);
    } catch (e) {
      toast.error("Failed to select filtered vehicles.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeselectFiltered = async () => {
    setIsActionLoading(true);
    try {
      const res: any = await supplierApi.getVehicleIds({
        search: debouncedModalSearch.trim() || undefined,
        country: modalCountry.trim() || undefined,
        branch_id: modalBranch.trim() || undefined,
      });
      const idsToRemove = new Set(res?.data || []);
      if (idsToRemove.size === 0) return;

      setIsAllSelected(false);
      setSelectedVehicleIds(prev => {
        const currentList = isAllSelected ? allFleetIdsState : prev;
        return currentList.filter(id => !idsToRemove.has(id));
      });
      toast.success(`Deselected ${idsToRemove.size} vehicles.`);
    } catch (e) {
      toast.error("Failed to deselect filtered vehicles.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const resolveImageUrl = (v: any) => {
    let img = v.image || v.photo || v.car_photo || v.cover_image || v.vehiclePhoto?.photo || v.vehicle_photo?.photo;
    if (Array.isArray(img)) img = img[0];
    if (img && typeof img === 'object') img = img.photo || img.url || img.path || img.image || '';
    if (!img || typeof img !== 'string') return undefined;
    return getVehicleImageUrl(img);
  };

  const getBranchLabel = (v: any) => {
    if (v.branch) {
      const parts = [
        v.branch.name || v.branch.location || '',
        v.branch.city || '',
        v.branch.country || ''
      ].filter(Boolean);
      return parts.join(' • ');
    }
    return v.pickup_loc_name || "General Fleet";
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
              className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-7 z-10 mx-2 max-h-[92vh] flex flex-col border border-gray-150"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-150">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                    <Zap size={22} className="fill-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
                      Promote: {currentPromo?.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Select which fleet vehicles, branches, or countries should showcase this promotion
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Filters & Action Bar */}
              <div className="py-4 space-y-3 border-b border-gray-150">
                {otherActivePromo && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={17} />
                    <div>
                      <p className="text-xs font-bold text-amber-800">
                        ملاحظة: تفعيل هذا البرومو سيؤدي تلقائياً إلى إلغاء برومو "{otherActivePromo.name}".
                      </p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Note: Activating this promo will replace "{otherActivePromo.name}". Only one promo can be active per company.
                      </p>
                    </div>
                  </div>
                )}

                {/* Filter Controls Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <input
                      type="text"
                      value={modalSearch}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search car name or branch..."
                      className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    {modalSearch && (
                      <button
                        onClick={() => handleSearchChange("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Country Filter */}
                  <div className="relative w-full sm:w-44">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <Globe size={15} />
                    </div>
                    <select
                      value={modalCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full pl-9 pr-7 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="">All Countries</option>
                      {availableCountries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Branch Filter */}
                  <div className="relative w-full sm:w-56">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <Building2 size={15} />
                    </div>
                    <select
                      value={modalBranch}
                      onChange={(e) => handleBranchChange(e.target.value)}
                      className="w-full pl-9 pr-7 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer truncate"
                    >
                      <option value="">All Branches ({availableBranches.length})</option>
                      {availableBranches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name || b.location || `Branch #${b.id}`} {b.city ? `(${b.city})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <RotateCcw size={13} />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Selection Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Master Select All Fleet */}
                    <button
                      type="button"
                      onClick={toggleSelectAllFleet}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                        isAllSelected || (totalFleetCount > 0 && selectedVehicleIds.length >= totalFleetCount)
                          ? "bg-primary text-black border-primary font-black"
                          : "bg-white text-gray-700 border-gray-200 hover:border-primary"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        isAllSelected || (totalFleetCount > 0 && selectedVehicleIds.length >= totalFleetCount)
                          ? "bg-black border-black text-white"
                          : "border-gray-300 bg-white"
                      }`}>
                        {(isAllSelected || (totalFleetCount > 0 && selectedVehicleIds.length >= totalFleetCount)) && (
                          <Check size={11} strokeWidth={3} />
                        )}
                      </div>
                      <span>SELECT ALL FLEET ({totalFleetCount.toLocaleString()})</span>
                    </button>

                    {/* Quick Filter Selection Helper */}
                    {hasActiveFilters && (
                      <>
                        <button
                          type="button"
                          disabled={isActionLoading || modalTotalVehicles === 0}
                          onClick={handleSelectFiltered}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {isActionLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={14} />}
                          <span>Select Filtered ({modalTotalVehicles})</span>
                        </button>
                        <button
                          type="button"
                          disabled={isActionLoading || modalTotalVehicles === 0}
                          onClick={handleDeselectFiltered}
                          className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        >
                          <Square size={13} className="text-gray-400" />
                          <span>Deselect Filtered</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Selected Counter Pill */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      {isAllSelected || (totalFleetCount > 0 && selectedVehicleIds.length >= totalFleetCount)
                        ? `All Fleet Selected (${totalFleetCount.toLocaleString()})`
                        : `${selectedVehicleIds.length.toLocaleString()} Selected`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body: Vehicles Grid */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
                {isLoadingVehicles ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <span className="text-sm font-semibold">Loading vehicles...</span>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                      <Search size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">No Vehicles Found</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                        No vehicles matched your current filters or search query.
                      </p>
                    </div>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-black font-bold text-xs rounded-xl shadow-sm hover:bg-primary/90 transition-all"
                      >
                        <RotateCcw size={13} />
                        Clear All Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {vehicles.map((v) => {
                      const isSelected = isAllSelected || selectedVehicleIds.includes(v.id);
                      return (
                        <div
                          key={v.id}
                          onClick={() => toggleVehicleSelection(v.id)}
                          className={`group relative flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                            isSelected
                              ? "bg-amber-50/50 border-primary shadow-sm"
                              : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                          }`}
                        >
                          {/* Image */}
                          <div className="w-14 h-11 rounded-xl overflow-hidden border border-gray-150 bg-gray-50 shrink-0 relative flex items-center justify-center">
                            {resolveImageUrl(v) ? (
                              <img
                                src={resolveImageUrl(v)}
                                alt={v.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400 font-bold bg-gray-100">
                                CAR
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 pr-1">
                            <p className="text-xs font-bold text-gray-900 truncate leading-snug">
                              {v.name}
                            </p>
                            <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5 truncate">
                              <MapPin size={11} className="text-gray-400 shrink-0" />
                              <span className="truncate">{getBranchLabel(v)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                                {v.category?.name || "Standard"}
                              </span>
                            </div>
                          </div>

                          {/* Checkbox */}
                          <div
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                              isSelected
                                ? "bg-primary border-primary text-black"
                                : "bg-white border-gray-300 group-hover:border-primary"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Pagination Footer */}
              {modalTotalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 bg-white">
                  <span className="text-xs font-semibold text-gray-500">
                    Showing {Math.min(modalTotalVehicles, (modalPage - 1) * modalPerPage + 1)} to{" "}
                    {Math.min(modalTotalVehicles, modalPage * modalPerPage)} of {modalTotalVehicles.toLocaleString()} vehicles
                  </span>
                  <Pagination
                    currentPage={modalPage}
                    totalPages={modalTotalPages}
                    onPageChange={setModalPage}
                  />
                </div>
              )}

              {/* Action Buttons Footer */}
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
                  disabled={isSubmitting || (!isAllSelected && selectedVehicleIds.length === 0)}
                  className="flex-1 py-3 bg-primary hover:bg-primary/95 disabled:opacity-50 disabled:pointer-events-none text-black font-black rounded-xl text-sm transition-colors uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Promoting...</span>
                    </>
                  ) : (
                    <span>
                      Promote Active {isAllSelected ? `(All ${totalFleetCount})` : `(${selectedVehicleIds.length})`}
                    </span>
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
