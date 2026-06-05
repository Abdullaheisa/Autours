"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Filter, Edit2, Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import Pagination from "@/components/ui/Pagination";
import { useSearch } from "../../context/SearchContext";
import { supplierApi } from "@/services/api/supplierApi";
import { getVehicleImageUrl } from "@/utils/getImageUrl";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// ─── Delete Confirmation Modal ───────────────────────────────────────
function DeleteModal({
  vehicleName,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  vehicleName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
      />
      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-50"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 border-2 border-red-100 mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-500" />
        </div>

        {/* Text */}
        <h3 className="text-lg font-black text-gray-900 text-center mb-1">Delete Vehicle</h3>
        <p className="text-sm text-gray-500 text-center mb-2">Are you sure you want to delete</p>
        <p className="text-sm font-bold text-gray-900 text-center bg-gray-50 rounded-xl px-4 py-2 mb-3 border border-gray-100 truncate">
          &ldquo;{vehicleName}&rdquo;
        </p>
        <p className="text-xs text-red-500 text-center mb-6">
          This action cannot be undone. The vehicle will be permanently removed.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function MyVehiclesSection({
  onEditVehicle,
  onAddVehicle,
}: {
  onEditVehicle?: (id: number) => void;
  onAddVehicle?: () => void;
}) {
  const { searchQuery } = useSearch();
  const { user } = useSelector((state: RootState) => state.auth);
  const isActiveSupplier = user?.role === 'admin' || user?.status === 'active_supplier';

  const [localSearch, setLocalSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const fetchVehicles = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await supplierApi.getVehicles(page, itemsPerPage);
      const raw: any = response?.data;
      // Backend returns paginated: { data: [...], total, last_page, ... }
      if (raw && Array.isArray(raw.data)) {
        setItems(raw.data);
        setTotalPages(raw.last_page || 1);
        setTotalCount(raw.total || raw.data.length);
      } else if (Array.isArray(raw)) {
        setItems(raw);
        setTotalPages(1);
        setTotalCount(raw.length);
      } else {
        setItems([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error: any) {
      console.error("Failed to fetch vehicles:", error.message);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(currentPage);
  }, [currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [localSearch, searchQuery]);

  // Client-side filter for search (applied on top of server-side page)
  const filteredVehicles = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase();
    if (!query) return items;
    return items.filter((v) => {
      const catName = typeof v.category === "object" ? v.category?.name : v.category;
      return (
        v.name?.toLowerCase().includes(query) ||
        String(catName || "")?.toLowerCase().includes(query)
      );
    });
  }, [items, searchQuery, localSearch]);

  // Use server-supplied pagination unless user is searching (then paginate client-side)
  const isSearching = !!(searchQuery || localSearch);
  const effectiveTotalPages = isSearching ? Math.ceil(filteredVehicles.length / itemsPerPage) : totalPages;
  const paginatedVehicles = isSearching
    ? filteredVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredVehicles;

  const handleDeleteClick = (vehicle: any) => {
    setDeleteModal({ id: vehicle.id, name: vehicle.name || "this vehicle" });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      await supplierApi.deleteVehicle(deleteModal.id);
      toast.success("Vehicle deleted successfully.");
      setDeleteModal(null);
      // Re-fetch the current page so count + list are accurate
      fetchVehicles(currentPage);
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
      toast.error("Failed to delete vehicle. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleActivation = async (id: number, currentStatus: boolean) => {
    setItems((prev) =>
      prev.map((v) => (v.id === id ? { ...v, activation: !currentStatus } : v))
    );
    try {
      await supplierApi.toggleVehicleActivation(id, !currentStatus);
      toast.success(!currentStatus ? "Vehicle activated." : "Vehicle deactivated.");
    } catch (error) {
      console.error("Failed to toggle vehicle activation:", error);
      toast.error("Failed to update vehicle status.");
      setItems((prev) =>
        prev.map((v) => (v.id === id ? { ...v, activation: currentStatus } : v))
      );
    }
  };

  const resolveImageUrl = (v: any) => {
    if (v.vehiclePhoto?.photo) return getVehicleImageUrl(v.vehiclePhoto.photo);
    let img = v.image || v.photo || v.car_photo || v.cover_image;
    if (Array.isArray(img)) img = img[0];
    if (img && typeof img === "object")
      img = img.photo || img.url || img.path || img.image || "";
    if (!img || typeof img !== "string") return undefined;
    return getVehicleImageUrl(img);
  };

  return (
    <SectionLayout>
      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <DeleteModal
          vehicleName={deleteModal.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !isDeleting && setDeleteModal(null)}
          isDeleting={isDeleting}
        />
      )}

      <PageHeader
        title="Fleet Management"
        description="View and manage your entire vehicle collection across all locations"
        actionLabel={isActiveSupplier ? "Add New Vehicle" : undefined}
        actionIcon={isActiveSupplier ? <Plus size={18} /> : undefined}
        onAction={isActiveSupplier ? () => {
          if (onAddVehicle) onAddVehicle();
          else window.location.href = "/company/create-vehicle";
        } : undefined}
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4 mt-4">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by vehicle name, category or year..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:text-primary-600 hover:border-primary-200 transition-all">
          <Filter size={20} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm font-medium">Loading your fleet...</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="overflow-x-auto" style={{ transform: "rotateX(180deg)" }}>
            <div style={{ transform: "rotateX(180deg)" }}>
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">
                      Vehicle Details
                    </th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">
                      Category
                    </th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">
                      Daily Price
                    </th>
                    <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">
                      Active / Available
                    </th>
                    <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">
                      Management
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedVehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-gray-50/30 transition-colors group animate-in fade-in duration-300"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 shrink-0 flex items-center justify-center">
                            {resolveImageUrl(vehicle) ? (
                              <img
                                src={resolveImageUrl(vehicle) as string}
                                alt={vehicle.name || "Car"}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://ui-avatars.com/api/?name=Car&background=f3f4f6&color=9ca3af";
                                }}
                              />
                            ) : (
                              <span className="text-xs text-gray-400 font-bold">No img</span>
                            )}
                          </div>
                          <span className="font-bold text-gray-900 text-sm">{vehicle.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg uppercase tracking-wider border border-primary-100">
                          {typeof vehicle.category === "object"
                            ? vehicle.category?.name
                            : vehicle.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-bold">
                        {vehicle.price ? `$${vehicle.price}` : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => toggleActivation(vehicle.id, vehicle.activation)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full shadow-inner transition-colors duration-300 ${
                              vehicle.activation ? "bg-emerald-500" : "bg-gray-300"
                            }`}
                            title={vehicle.activation ? "Click to deactivate" : "Click to activate"}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                                vehicle.activation ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              if (onEditVehicle) onEditVehicle(vehicle.id);
                              else
                                window.location.href = `/company/vehicles/edit/${vehicle.id}`;
                            }}
                            className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-100"
                            title="Edit Vehicle"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(vehicle)}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                            title="Delete Vehicle"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredVehicles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                            <Search size={32} />
                          </div>
                          <p className="text-gray-500 font-medium">
                            No vehicles found matching your search.
                          </p>
                          <button
                            onClick={() => setLocalSearch("")}
                            className="text-primary-600 font-bold text-sm hover:underline"
                          >
                            Clear search
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          {(paginatedVehicles.length > 0 || totalCount > 0) && effectiveTotalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-6 py-4 bg-gray-50/30">
              <span className="text-xs font-bold text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, isSearching ? filteredVehicles.length : totalCount)} of{" "}
                {isSearching ? filteredVehicles.length : totalCount} vehicles
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={effectiveTotalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </SectionLayout>
  );
}
