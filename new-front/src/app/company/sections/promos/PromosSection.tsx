"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCircle2, Loader2, Trash2, X, XCircle, Zap } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import Pagination from "@/components/ui/Pagination";
import { useSearch } from "../../context/SearchContext";
import { supplierApi } from "@/services/api/supplierApi";
import { promoApi } from "@/services/api";
import { getVehicleImageUrl } from "@/utils/getImageUrl";
import toast from "react-hot-toast";
import { usePersistedPage } from "@/hooks/usePersistedPage";

const toNumberId = (value: unknown): number => Number(value);

const unwrapArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

export default function PromosSection() {
  const { searchQuery } = useSearch();
  const [localSearch, setLocalSearch] = useState("");
  const [promos, setPromos] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  const [currentPromo, setCurrentPromo] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = usePersistedPage("company_promos", 1);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [newPromoName, setNewPromoName] = useState("");
  const [newPromoDescription, setNewPromoDescription] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const initialSearch = useRef(true);
  const itemsPerPage = 10;

  useEffect(() => {
    if (initialSearch.current) {
      initialSearch.current = false;
      return;
    }
    setCurrentPage(1);
  }, [localSearch, searchQuery, setCurrentPage]);

  const loadPromos = async () => {
    setIsLoading(true);
    try {
      const [definitionsResponse, activeResponse] = await Promise.all([
        promoApi.getDefinitions(),
        supplierApi.getPromos(),
      ]);

      const definitions = unwrapArray(definitionsResponse);
      const activeIds = new Set(
        unwrapArray(activeResponse).map((id: any) => toNumberId(id))
      );

      setPromos(definitions.map((item: any) => ({
        id: toNumberId(item.id),
        name: item.what_is_included || item.name || `Feature #${item.id}`,
        description: item.description || "No description provided.",
        promoted: activeIds.has(toNumberId(item.id)),
        status: item.status,
      })));
    } catch (error: any) {
      toast.error(error?.message || "Failed to load promotions.");
      setPromos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPromos();
  }, []);

  const filteredPromos = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase().trim();
    return promos.filter((promo) =>
      promo.name.toLowerCase().includes(query) ||
      promo.description.toLowerCase().includes(query)
    );
  }, [promos, searchQuery, localSearch]);

  const paginatedPromos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPromos.slice(start, start + itemsPerPage);
  }, [filteredPromos, currentPage]);

  const otherActivePromo = promos.find(
    (promo) => promo.promoted && promo.id !== currentPromo?.id
  );

  const openPromo = async (promo: any) => {
    if (promo.status === "pending" || promo.status === "rejected") {
      toast.error(promo.status === "pending"
        ? "This promo suggestion is still pending admin approval!"
        : "This promo suggestion was rejected by the admin.");
      return;
    }

    setCurrentPromo(promo);
    setSelectedVehicleIds([]);
    setVehicles([]);
    setIsModalOpen(true);
    setIsLoadingVehicles(true);

    try {
      const vehicleResponse: any = await supplierApi.getVehicles(1, 200);
      const rawVehicles = unwrapArray(vehicleResponse);
      const normalizedVehicles = rawVehicles
        .map((vehicle: any) => ({ ...vehicle, id: toNumberId(vehicle.id) }))
        .filter((vehicle: any) => Number.isFinite(vehicle.id) && vehicle.id > 0);

      let activeIds: number[] = [];
      if (promo.promoted) {
        const activeResponse: any = await supplierApi.getPromos(toNumberId(promo.id));
        activeIds = unwrapArray(activeResponse)
          .map((id: any) => toNumberId(id))
          .filter((id: number) => Number.isFinite(id) && id > 0);
      }

      setVehicles(normalizedVehicles);
      setSelectedVehicleIds(
        promo.promoted && activeIds.length > 0
          ? activeIds
          : normalizedVehicles.map((vehicle: any) => vehicle.id)
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load fleet vehicles.");
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const toggleVehicle = (value: number | string) => {
    const id = toNumberId(value);
    setSelectedVehicleIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleAllVehicles = () => {
    const allIds = vehicles.map((vehicle) => toNumberId(vehicle.id));
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedVehicleIds.includes(id));
    setSelectedVehicleIds(allSelected ? [] : allIds);
  };

  const savePromo = async () => {
    if (!currentPromo || selectedVehicleIds.length === 0) {
      toast.error("Select at least one vehicle.");
      return;
    }

    setIsSubmitting(true);
    try {
      await supplierApi.createPromo({
        included_id: toNumberId(currentPromo.id),
        selected_vehicles: selectedVehicleIds.map(String).join(","),
      });
      toast.success(`Successfully updated promotions for "${currentPromo.name}"!`);
      setIsModalOpen(false);
      await loadPromos();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update promotions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePromo = async (id: number, name: string) => {
    try {
      await supplierApi.deletePromo(toNumberId(id));
      toast.success(`Removed promotion for "${name}"`);
      setSelectedId(null);
      await loadPromos();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to remove promotion.");
    }
  };

  const submitSuggestion = async () => {
    if (!newPromoName.trim()) {
      toast.error("Please enter a promo title.");
      return;
    }
    setIsSuggesting(true);
    try {
      await promoApi.suggest({
        included: newPromoName.trim(),
        description: newPromoDescription.trim(),
      });
      setShowSuggestModal(false);
      setNewPromoName("");
      setNewPromoDescription("");
      toast.success("Promo suggestion submitted for admin approval!");
      await loadPromos();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit suggestion.");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <SectionLayout>
      <PageHeader
        title="Promotions & Highlights"
        description="Choose which inclusions to highlight as active promotions across your fleet"
        showAction
        actionLabel="Suggest Promo"
        onAction={() => setShowSuggestModal(true)}
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4 mt-6">
        <input
          type="text"
          placeholder="Search featured inclusions..."
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          disabled={!selectedId || !promos.find((promo) => promo.id === selectedId)?.promoted}
          onClick={() => {
            const promo = promos.find((item) => item.id === selectedId);
            if (promo) void deletePromo(promo.id, promo.name);
          }}
          className="shrink-0 flex items-center gap-2 px-5 py-3 bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl"
        >
          <Trash2 size={16} /> Cancel Promotion
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50 text-xs uppercase text-gray-400">
              <th className="px-6 py-5 text-center">Select</th>
              <th className="px-6 py-5 text-left">Inclusion Feature</th>
              <th className="px-6 py-5 text-left">Description</th>
              <th className="px-6 py-5 text-center">Promo Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {paginatedPromos.map((promo) => (
                <tr key={promo.id} onClick={() => setSelectedId(promo.id)} className="cursor-pointer hover:bg-gray-50">
                  <td className="px-6 py-4 text-center">{selectedId === promo.id ? "●" : "○"}</td>
                  <td className="px-6 py-4 font-bold">{promo.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{promo.description}</td>
                  <td className="px-6 py-4 text-center">
                    <button type="button" onClick={(event) => { event.stopPropagation(); void openPromo(promo); }} disabled={promo.status === "pending" || promo.status === "rejected"} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold">
                      {promo.promoted ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {promo.promoted ? "Promoted" : "Standard"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">{promo.promoted && <button type="button" onClick={(event) => { event.stopPropagation(); void deletePromo(promo.id, promo.name); }}><Trash2 size={16} /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPromos.length > itemsPerPage && <div className="p-4 border-t"><Pagination currentPage={currentPage} totalPages={Math.ceil(filteredPromos.length / itemsPerPage)} onPageChange={setCurrentPage} /></div>}
        </div>
      )}

      {showSuggestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
            <h3 className="font-bold">Suggest a New Promo</h3>
            <input value={newPromoName} onChange={(event) => setNewPromoName(event.target.value)} placeholder="Promo title" className="w-full border rounded-xl p-3" />
            <textarea value={newPromoDescription} onChange={(event) => setNewPromoDescription(event.target.value)} placeholder="Description" className="w-full border rounded-xl p-3" rows={4} />
            <div className="flex gap-3"><button type="button" onClick={() => setShowSuggestModal(false)} className="flex-1 p-3 bg-gray-100 rounded-xl">Cancel</button><button type="button" disabled={isSuggesting} onClick={() => void submitSuggestion()} className="flex-1 p-3 bg-primary rounded-xl">{isSuggesting ? "Saving..." : "Submit"}</button></div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-4"><div><h3 className="font-bold text-lg">Promote: {currentPromo?.name}</h3><p className="text-sm text-gray-500">Select fleet vehicles for this promotion</p></div><button type="button" onClick={() => setIsModalOpen(false)}><X /></button></div>
            {otherActivePromo && <p className="my-4 p-3 rounded-xl bg-amber-50 text-sm">Activating this promo will replace "{otherActivePromo.name}".</p>}
            <div className="overflow-y-auto py-4 flex-1">
              {isLoadingVehicles ? <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div> : vehicles.length === 0 ? <p className="text-center py-12 text-gray-500">No vehicles found.</p> : <>
                <button type="button" onClick={toggleAllVehicles} className="mb-4 p-3 rounded-xl bg-gray-50 border w-full text-left font-bold">{selectedVehicleIds.length === vehicles.length ? "Unselect all vehicles" : "Select all vehicles"}</button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{vehicles.map((vehicle) => { const id = toNumberId(vehicle.id); const selected = selectedVehicleIds.includes(id); return <button type="button" key={id} onClick={() => toggleVehicle(id)} className={`flex items-center gap-3 p-3 rounded-xl border text-left ${selected ? "border-primary bg-primary/10" : "border-gray-200"}`}><div className="w-12 h-8 rounded overflow-hidden bg-gray-100">{getVehicleImageUrl(vehicle.image || vehicle.photo) && <img src={getVehicleImageUrl(vehicle.image || vehicle.photo)} alt="" className="w-full h-full object-cover" />}</div><span className="flex-1 text-sm font-bold truncate">{vehicle.name}</span>{selected && <Check size={18} />}</button>; })}</div>
              </>}
            </div>
            <div className="border-t pt-4 flex gap-3"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-3 bg-gray-100 rounded-xl">Cancel</button><button type="button" disabled={isSubmitting || selectedVehicleIds.length === 0} onClick={() => void savePromo()} className="flex-1 p-3 bg-primary rounded-xl disabled:opacity-50">{isSubmitting ? "Saving..." : "Promote Active"}</button></div>
          </div>
        </div>
      )}
    </SectionLayout>
  );
}
