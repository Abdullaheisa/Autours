"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Search, Plus, Trash2, CheckCircle2, XCircle, Loader2, Zap, X, Check, 
  Edit3, ShieldAlert, Sparkles, Users, ShieldCheck, Settings2 
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import Pagination from "@/components/ui/Pagination";
import { promoApi, profitApi } from "@/services/api";
import { apiClient } from "@/services/api/axiosClient";
import { getVehicleImageUrl } from "@/utils/getImageUrl";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import usePersistedPage from "@/hooks/usePersistedPage";

export default function PromosSection() {
  const [promos, setPromos] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = usePersistedPage('admin_promos', 1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const prevFiltersRef = useRef({ searchQuery });

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState<any | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [allFilteredVehicles, setAllFilteredVehicles] = useState<any[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  const [activePromoVehicles, setActivePromoVehicles] = useState<any[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [selectedPage, setSelectedPage] = useState(1);
  const selectedPerPage = 20;

  useEffect(() => {
    setSelectedPage(1);
  }, [showSelectedOnly]);

  // Modal Search & Filter States
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [debouncedModalSearchQuery, setDebouncedModalSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedModalSearchQuery(modalSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [modalSearchQuery]);

  const [modalSupplierFilter, setModalSupplierFilter] = useState("All");
  const [modalCountryFilter, setModalCountryFilter] = useState("All");
  const [modalBranchFilter, setModalBranchFilter] = useState("All");
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(1);
  const [modalTotalCount, setModalTotalCount] = useState(0);
  const [modalCountries, setModalCountries] = useState<any[]>([]);
  const [modalBranches, setModalBranches] = useState<any[]>([]);
  const [modalSuppliers, setModalSuppliers] = useState<any[]>([]);

  // Add/Edit Form State
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsSpecialOffer, setFormIsSpecialOffer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filtersChanged = prev.searchQuery !== searchQuery;
    if (filtersChanged) {
      prevFiltersRef.current = { searchQuery };
      setCurrentPage(1);
    }
  }, [searchQuery, setCurrentPage]);

  useEffect(() => {
    if (isAssignModalOpen || isAddEditModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAssignModalOpen, isAddEditModalOpen]);

  const isSpecialOfferName = (name: string) => {
    const n = (name || '').toLowerCase().trim();
    return (
      n.includes('online check') ||
      n.includes('check-in') ||
      n.includes('check in') ||
      n.includes('additional driver') ||
      n.includes('child seat') ||
      n.includes('baby seat')
    );
  };

  const loadPromos = async () => {
    setIsLoading(true);
    try {
      const res: any = await promoApi.getDefinitions();
      const list = Array.isArray(res) ? res : res?.data || [];
      const mapped = list.map((item: any) => ({
        ...item,
        is_special_offer: Boolean(item.is_special_offer) || isSpecialOfferName(item.what_is_included || item.name || '')
      }));
      setPromos(mapped);
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

  const specialOffersList = useMemo(() => {
    return promos.filter(p => p.is_special_offer);
  }, [promos]);

  const customPromosList = useMemo(() => {
    return promos.filter(p => !p.is_special_offer);
  }, [promos]);

  const filteredCustomPromos = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return customPromosList.filter(
      (p) =>
        (p.what_is_included || p.name || "").toLowerCase().includes(query) ||
        (p.description || "").toLowerCase().includes(query)
    );
  }, [customPromosList, searchQuery]);

  const totalPages = Math.ceil(filteredCustomPromos.length / itemsPerPage);
  const paginatedCustomPromos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomPromos.slice(start, start + itemsPerPage);
  }, [filteredCustomPromos, currentPage]);

  const fetchModalVehiclesPage = async (
    page: number,
    country: string,
    branch: string,
    supplier: string,
    search: string
  ) => {
    setIsLoadingVehicles(true);
    try {
      const params: any = {
        paginate: "true",
        page,
        per_page: 20,
      };
      if (country && country !== "All") params.country = country;
      if (branch && branch !== "All") params.branch_id = branch;
      if (supplier && supplier !== "All") params.supplier = supplier;
      if (search) params.search = search;

      const res: any = await apiClient.get("/get/vehicles", { params });
      
      const list = res?.data?.data || res?.data || res || [];
      const total = res?.total || res?.data?.total || list.length;
      const lastPage = res?.last_page || res?.data?.last_page || 1;
      const currentPageNum = res?.current_page || res?.data?.current_page || 1;

      setVehicles(list);
      setModalTotalCount(total);
      setModalTotalPages(lastPage);
      setModalCurrentPage(currentPageNum);
    } catch (err) {
      toast.error("Failed to load fleet vehicles.");
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const fetchAllMatchingVehicles = async (
    country: string,
    branch: string,
    supplier: string,
    search: string
  ) => {
    try {
      const params: any = {
        paginate: "true",
        per_page: 10000,
        compact: "true",
      };
      if (country && country !== "All") params.country = country;
      if (branch && branch !== "All") params.branch_id = branch;
      if (supplier && supplier !== "All") params.supplier = supplier;
      if (search) params.search = search;

      const res: any = await apiClient.get("/get/vehicles", { params });
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setAllFilteredVehicles(list);
    } catch (err) {
      console.warn("Failed to fetch all matching vehicles", err);
    }
  };

  const loadBranchesForCountry = async (country: string) => {
    try {
      const bRes: any = await profitApi.getBranches(undefined, country === "All" ? undefined : country);
      const bData = Array.isArray(bRes?.data) ? bRes.data : Array.isArray(bRes) ? bRes : [];
      setModalBranches(bData);
    } catch (err) {
      console.error("Failed to load branches list", err);
    }
  };

  // Open modal to assign promo to vehicles
  const handleOpenAssignModal = async (promo: any) => {
    setModalSearchQuery("");
    setModalSupplierFilter("All");
    setModalCountryFilter("All");
    setModalBranchFilter("All");
    setModalCurrentPage(1);
    setShowSelectedOnly(false);
    setVehicles([]);
    setModalCountries([]);
    setModalBranches([]);
    setModalSuppliers([]);
    setCurrentPromo(promo);
    setIsAssignModalOpen(true);
    setIsLoadingVehicles(true);
    try {
      const cRes: any = await profitApi.getCountries();
      const cData = Array.isArray(cRes?.data) ? cRes.data : Array.isArray(cRes) ? cRes : [];
      setModalCountries(cData);

      const sRes: any = await profitApi.getSuppliers();
      const sData = Array.isArray(sRes?.data) ? sRes.data : Array.isArray(sRes) ? sRes : [];
      setModalSuppliers(sData.map((item: any) => ({ id: String(item.id), name: item.name })));

      let activeVehicleIds: number[] = [];
      const mappedRes: any = await apiClient.get(`/api/supplier/promo?included_id=${promo.id}`);
      const rawIds = Array.isArray(mappedRes) ? mappedRes : (mappedRes?.data || []);
      activeVehicleIds = Array.isArray(rawIds) ? rawIds : [];
      const normalizedActiveIds = activeVehicleIds.map((id: any) => Number(id));
      setSelectedVehicleIds(normalizedActiveIds);

      let activeVehiclesList: any[] = [];
      if (normalizedActiveIds.length > 0) {
        try {
          const detailRes: any = await apiClient.get("/get/vehicles", {
            params: { ids: normalizedActiveIds.join(",") }
          });
          const detailList = detailRes?.data || detailRes || [];
          activeVehiclesList = Array.isArray(detailList) ? detailList : [];
        } catch (err) {
          console.warn("Failed to load active vehicles details", err);
        }
      }
      setActivePromoVehicles(activeVehiclesList);
    } catch (err) {
      toast.error("Failed to load fleet data.");
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  useEffect(() => {
    if (isAssignModalOpen) {
      fetchModalVehiclesPage(1, modalCountryFilter, modalBranchFilter, modalSupplierFilter, debouncedModalSearchQuery);
      fetchAllMatchingVehicles(modalCountryFilter, modalBranchFilter, modalSupplierFilter, debouncedModalSearchQuery);
    }
  }, [debouncedModalSearchQuery, modalSupplierFilter, modalCountryFilter, modalBranchFilter, isAssignModalOpen]);

  const handleSaveAssignments = async () => {
    if (!currentPromo) return;
    setIsSubmitting(true);
    try {
      const res: any = await promoApi.create({
        included_id: currentPromo.id,
        selected_vehicles: selectedVehicleIds.join(",")
      });
      if (res?.status || res?.data) {
        toast.success(`Updated promotions for "${currentPromo.what_is_included || currentPromo.name}"!`);
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
  const handleOpenAddModal = (isSpecial: boolean = false) => {
    setIsEditing(false);
    setFormName("");
    setFormDescription("");
    setFormIsSpecialOffer(isSpecial);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (promo: any) => {
    setIsEditing(true);
    setCurrentPromo(promo);
    setFormName(promo.what_is_included || promo.name || "");
    setFormDescription(promo.description || "");
    setFormIsSpecialOffer(Boolean(promo.is_special_offer) || isSpecialOfferName(promo.what_is_included || promo.name || ''));
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
          is_special_offer: formIsSpecialOffer,
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
          is_special_offer: formIsSpecialOffer,
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
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This will remove it from all vehicles.`)) {
      return;
    }
    try {
      await promoApi.deleteDefinition(id);
      toast.success(`Deleted "${name}" successfully.`);
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

  const fullSelectedList = useMemo(() => {
    const allLoadedMap = new Map<number, any>();
    activePromoVehicles.forEach(v => allLoadedMap.set(Number(v.id), v));
    allFilteredVehicles.forEach(v => allLoadedMap.set(Number(v.id), v));
    vehicles.forEach(v => allLoadedMap.set(Number(v.id), v));

    return Array.from(allLoadedMap.values()).filter(v => selectedVehicleIds.includes(Number(v.id)));
  }, [activePromoVehicles, allFilteredVehicles, vehicles, selectedVehicleIds]);

  const groupedVehicles = useMemo(() => {
    const groups: Record<string, any[]> = {};
    let listToGroup = [];
    if (showSelectedOnly) {
      const start = (selectedPage - 1) * selectedPerPage;
      listToGroup = fullSelectedList.slice(start, start + selectedPerPage);
    } else {
      listToGroup = vehicles;
    }

    listToGroup.forEach((v) => {
      const supplierName = v.supplierUser?.company || v.supplierUser?.name || v.supplier?.company || v.supplier?.name || "Independent Suppliers";
      if (!groups[supplierName]) {
        groups[supplierName] = [];
      }
      groups[supplierName].push(v);
    });
    return groups;
  }, [vehicles, fullSelectedList, showSelectedOnly, selectedPage]);

  const toggleVehicleSelection = (id: number) => {
    setSelectedVehicleIds(prev => {
      const numId = Number(id);
      return prev.includes(numId) ? prev.filter(vId => vId !== numId) : [...prev, numId];
    });
  };

  const allFilteredVehicleIds = useMemo(() => {
    return allFilteredVehicles.map(v => Number(v.id));
  }, [allFilteredVehicles]);

  const isAllFilteredSelected = useMemo(() => {
    if (allFilteredVehicleIds.length === 0) return false;
    return allFilteredVehicleIds.every(id => selectedVehicleIds.includes(id));
  }, [allFilteredVehicleIds, selectedVehicleIds]);

  const supplierIdsMap = useMemo(() => {
    const map: Record<string, number[]> = {};
    allFilteredVehicles.forEach(v => {
      const supplierName = v.supplierUser?.company || v.supplierUser?.name || v.supplier?.company || v.supplier?.name || "Independent Suppliers";
      if (!map[supplierName]) map[supplierName] = [];
      map[supplierName].push(Number(v.id));
    });
    return map;
  }, [allFilteredVehicles]);

  const toggleAllFilteredSelection = () => {
    if (isAllFilteredSelected) {
      setSelectedVehicleIds(prev => prev.filter(id => !allFilteredVehicleIds.includes(id)));
    } else {
      setSelectedVehicleIds(prev => {
        const next = [...prev];
        allFilteredVehicleIds.forEach(id => {
          if (!next.includes(id)) next.push(id);
        });
        return next;
      });
    }
  };

  const isAllGroupSelected = (supplierName: string) => {
    const listIds = supplierIdsMap[supplierName] || [];
    if (listIds.length === 0) return false;
    return listIds.every(id => selectedVehicleIds.includes(id));
  };

  const toggleGroupSelection = (supplierName: string) => {
    const listIds = supplierIdsMap[supplierName] || [];
    const allSelected = isAllGroupSelected(supplierName);
    if (allSelected) {
      setSelectedVehicleIds(prev => prev.filter(id => !listIds.includes(id)));
    } else {
      setSelectedVehicleIds(prev => {
        const next = [...prev];
        listIds.forEach(id => {
          if (!next.includes(id)) next.push(id);
        });
        return next;
      });
    }
  };

  const resolveImageUrl = (v: any) => {
    let img = v.image || v.photo || v.car_photo || v.cover_image;
    if (Array.isArray(img)) img = img[0];
    if (img && typeof img === 'object') img = img.photo || img.url || img.path || img.image || '';
    if (!img || typeof img !== 'string') return undefined;
    return getVehicleImageUrl(img);
  };

  const getOfferIcon = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('online check') || n.includes('check-in') || n.includes('check in')) {
      return <Zap size={20} className="text-amber-600 fill-amber-500" />;
    }
    if (n.includes('additional driver') || n.includes('driver')) {
      return <Users size={20} className="text-emerald-600" />;
    }
    if (n.includes('child') || n.includes('seat') || n.includes('baby')) {
      return <ShieldCheck size={20} className="text-indigo-600" />;
    }
    return <Sparkles size={20} className="text-amber-500" />;
  };

  return (
    <SectionLayout>
      <PageHeader
        title="Promotions Manager"
        description="Manage Special Offers and create custom promotional badges to assign across the fleet"
        showAction={true}
        actionLabel="Add New Promo"
        onAction={() => handleOpenAddModal(false)}
      />

      {/* ======================================================== */}
      {/* SECTION 1: SPECIAL OFFERS */}
      {/* ======================================================== */}
      <div className="mt-8 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/30 border border-amber-400/40 flex items-center justify-center text-amber-600 shadow-sm">
              <Sparkles size={20} className="fill-amber-400 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Special Offers</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                  Featured
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Exclusive pre-configured perks displayed prominently on search car cards (Online Check-in, Free Additional Driver, Free Child Seat).
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl text-xs transition-all shadow-sm"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Add Special Offer</span>
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-48 flex flex-col justify-between">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-4/5 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : specialOffersList.length === 0 ? (
          <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-8 text-center">
            <p className="text-sm font-semibold text-amber-800">No special offers configured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {specialOffersList.map((offer) => (
              <div
                key={offer.id}
                className="group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-amber-400 p-5 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-center shrink-0">
                      {getOfferIcon(offer.what_is_included || offer.name)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(offer)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Offer"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeletePromoDefinition(offer.id, offer.what_is_included || offer.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Offer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-gray-900 leading-snug mb-1">
                    {offer.what_is_included || offer.name}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed min-h-[36px]">
                    {offer.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAssignModal(offer)}
                    className="w-full py-2.5 px-3 bg-[var(--primary,#f4d849)] hover:brightness-95 text-black font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Settings2 size={14} />
                    <span>Assign to Vehicles</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: CUSTOM PROMO BADGES & INCLUSIONS */}
      {/* ======================================================== */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Custom Promo Badges & Inclusions</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              General inclusions, custom badges, and supplier requested promo items.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search custom promos by name or description..."
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
        ) : filteredCustomPromos.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center mb-10">
            <Zap size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Custom Promos Defined</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
              Get started by defining custom promotional badges, which suppliers can also use for their cars.
            </p>
            <button
              onClick={() => handleOpenAddModal(false)}
              className="bg-primary hover:bg-primary-600 text-gray-900 px-6 py-2.5 font-bold rounded-xl text-sm transition-all"
            >
              Create Promo Badge
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-10">
            <div className="overflow-x-auto" style={{ display: 'flex', flexDirection: 'column-reverse' }}>
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
                  {paginatedCustomPromos.map((promo) => {
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
                            {promo.status === 'approved' && <CheckCircle2 size={12} />}
                            {isRejected && <XCircle size={12} />}
                            {isPending && <ShieldAlert size={12} />}
                            {promo.status || "approved"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(promo.id, 'approved')}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                  title="Approve suggestion"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(promo.id, 'rejected')}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  title="Reject suggestion"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}

                            {promo.status === 'approved' && (
                              <button
                                onClick={() => handleOpenAssignModal(promo)}
                                className="px-3 py-1.5 bg-primary hover:bg-primary-600 text-gray-900 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
                              >
                                <Zap size={13} />
                                <span>Assign Fleet</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEditModal(promo)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                              title="Edit promo definition"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              onClick={() => handleDeletePromoDefinition(promo.id, promo.what_is_included || promo.name)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete promo permanently"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {filteredCustomPromos.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-6 py-4 bg-gray-50/30">
                <span className="text-xs font-bold text-gray-500">
                  Showing {Math.min(filteredCustomPromos.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
                  {Math.min(filteredCustomPromos.length, currentPage * itemsPerPage)} of {filteredCustomPromos.length} promos
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
      </div>

      {/* Assign to Fleet Modal */}
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
              className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden p-6 z-10 mx-2 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-150">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-150 flex items-center justify-center text-amber-600">
                    <Zap size={20} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Assign Promotion: {currentPromo?.what_is_included || currentPromo?.name}
                    </h3>
                    <p className="text-xs text-gray-500">Select which fleet vehicles should showcase this promotion badge</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Filters */}
              <div className="py-4 space-y-3 border-b border-gray-150">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search car name..."
                      value={modalSearchQuery}
                      onChange={(e) => {
                        setModalSearchQuery(e.target.value);
                        setModalCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={modalSupplierFilter}
                      onChange={(e) => {
                        setModalSupplierFilter(e.target.value);
                        setModalCurrentPage(1);
                      }}
                      className="px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl text-xs font-semibold text-gray-700 outline-none"
                    >
                      <option value="All">All Suppliers</option>
                      {modalSuppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <select
                      value={modalCountryFilter}
                      onChange={(e) => {
                        setModalCountryFilter(e.target.value);
                        setModalBranchFilter("All");
                        setModalCurrentPage(1);
                        loadBranchesForCountry(e.target.value);
                      }}
                      className="px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl text-xs font-semibold text-gray-700 outline-none"
                    >
                      <option value="All">All Countries</option>
                      {modalCountries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <select
                      value={modalBranchFilter}
                      onChange={(e) => {
                        setModalBranchFilter(e.target.value);
                        setModalCurrentPage(1);
                      }}
                      className="px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl text-xs font-semibold text-gray-700 outline-none max-w-[160px] truncate"
                    >
                      <option value="All">All Branches</option>
                      {modalBranches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name || `Branch #${b.id}`}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleAllFilteredSelection}
                      className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-primary-200"
                    >
                      <Check size={14} />
                      <span>{isAllFilteredSelected ? "Deselect All Filtered" : `Select All Filtered (${allFilteredVehicleIds.length})`}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border ${
                        showSelectedOnly
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-gray-100 text-gray-700 border-gray-250 hover:bg-gray-200"
                      }`}
                    >
                      <span>Show Selected Only ({selectedVehicleIds.length})</span>
                    </button>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    Total Selected: <strong className="text-gray-900">{selectedVehicleIds.length}</strong>
                  </span>
                </div>
              </div>

              {/* Body: Vehicles List Grouped */}
              <div className="flex-1 overflow-y-auto py-4 space-y-6">
                {isLoadingVehicles ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <span className="text-sm font-medium">Loading fleet vehicles...</span>
                  </div>
                ) : Object.keys(groupedVehicles).length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <p className="text-sm font-semibold">No vehicles found matching filters</p>
                  </div>
                ) : (
                  Object.entries(groupedVehicles).map(([supplierName, groupVehicles]) => (
                    <div key={supplierName} className="space-y-3">
                      <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-150">
                        <span className="text-xs font-black text-gray-800 uppercase tracking-wider">{supplierName}</span>
                        <button
                          type="button"
                          onClick={() => toggleGroupSelection(supplierName)}
                          className="text-[11px] font-bold text-primary-600 hover:text-primary-700"
                        >
                          {isAllGroupSelected(supplierName) ? "Deselect Group" : "Select Group"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {groupVehicles.map((v) => {
                          const isSelected = selectedVehicleIds.includes(Number(v.id));
                          return (
                            <div
                              key={v.id}
                              onClick={() => toggleVehicleSelection(v.id)}
                              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                                isSelected
                                  ? "bg-amber-50/60 border-primary shadow-sm"
                                  : "bg-white border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="w-14 h-11 rounded-xl overflow-hidden border border-gray-150 bg-gray-50 shrink-0 relative flex items-center justify-center">
                                {resolveImageUrl(v) ? (
                                  <img src={resolveImageUrl(v)} alt={v.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400 font-bold bg-gray-100">
                                    CAR
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 pr-1">
                                <p className="text-xs font-bold text-gray-900 truncate leading-snug">{v.name}</p>
                                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                  {v.branch?.name || v.branch?.location || v.pickup_loc_name || "General Fleet"}
                                </p>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                                  isSelected ? "bg-primary border-primary text-black" : "bg-white border-gray-300"
                                }`}
                              >
                                {isSelected && <Check size={12} strokeWidth={3} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Pagination */}
              {!showSelectedOnly && modalTotalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 bg-white">
                  <span className="text-xs font-semibold text-gray-500">
                    Showing page {modalCurrentPage} of {modalTotalPages} ({modalTotalCount} vehicles)
                  </span>
                  <Pagination
                    currentPage={modalCurrentPage}
                    totalPages={modalTotalPages}
                    onPageChange={(p) => {
                      setModalCurrentPage(p);
                      fetchModalVehiclesPage(p, modalCountryFilter, modalBranchFilter, modalSupplierFilter, debouncedModalSearchQuery);
                    }}
                  />
                </div>
              )}

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
                  className="flex-1 py-3 bg-primary hover:bg-primary/95 disabled:opacity-50 disabled:pointer-events-none text-black font-black rounded-xl text-sm transition-colors uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Promo Target ({selectedVehicleIds.length} Selected)</span>
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
              <div className="flex items-center justify-between pb-4 border-b border-gray-150">
                <h3 className="text-lg font-bold text-gray-900">{isEditing ? "Edit Promo Badge" : "Create Promo Badge"}</h3>
                <button
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="py-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Promo Badge Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Online Check-in, Free GPS, Free Child Seat"
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

                {/* Is Special Offer Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={18} className="text-amber-600" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">Classify as Special Offer</span>
                      <span className="text-[11px] text-gray-500 block">Shows in the Special Offers top section</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsSpecialOffer}
                    onChange={(e) => setFormIsSpecialOffer(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>

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
