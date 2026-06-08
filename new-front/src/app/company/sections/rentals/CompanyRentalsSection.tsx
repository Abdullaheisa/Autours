"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Calendar, ChevronDown, CheckCircle, XCircle, Clock, Filter, Download } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsGrid from "@/app/company/components/StatsGrid";
import { supplierApi } from "@/services/api/supplierApi";
import { axiosClient } from "@/services/api/axiosClient";
import toast from "react-hot-toast";
import { useSearch } from "../../context/SearchContext";
import Pagination from "@/components/ui/Pagination";
import CreateRentalModal from "./CreateRentalModal";

export default function CompanyRentalsSection() {
  const { searchQuery } = useSearch();
  const [localSearch, setLocalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const itemsPerPage = 15;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const mapStatus = (statusId: number, statusObj?: any): string => {
    if (statusId === 2) return "confirmed";
    if (statusId === 7) return "completed";
    if (statusId === 3 || statusId === 5) return "cancelled";
    if (statusId === 4) return "pending";
    return (statusObj?.name_en || "pending").toLowerCase();
  };

  const fetchRentals = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res: any = await supplierApi.getRentals(page, itemsPerPage);
      // Backend returns Laravel paginator: { data:[...], total, last_page }
      const raw: any = res?.data ?? res;
      const list: any[] = Array.isArray(raw?.data) ? raw.data
        : Array.isArray(raw?.rentals) ? raw.rentals
        : Array.isArray(raw) ? raw
        : [];
      setTotalPages(raw?.last_page || 1);
      setTotalCount(raw?.total || list.length);
      setItems(list.map((r: any) => ({
        id: r.id,
        bookingNumber: r.order_number || `BK-${r.id}`,
        vehicle: r.vehicle?.name || "Unknown Vehicle",
        customerName: r.customer?.name || "Unknown Customer",
        country: r.customer?.country || "UAE",
        duration: r.number_of_days || (r.start_date && r.end_date ? Math.ceil(Math.abs(new Date(r.end_date).getTime() - new Date(r.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 1),
        period: r.start_date && r.end_date ? `${r.start_date} - ${r.end_date}` : (r.start_date || "N/A"),
        startedAt: r.start_date || r.created_at || "N/A",
        totalPrice: `${r.currency || "USD"} ${r.price || r.supplier_price || 0}`,
        rentalStatus: mapStatus(r.order_status, r.status)
      })));
    } catch (err: any) {
      console.warn("Rentals API error:", err.message);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (rentalId: number, newStatusId: number) => {
    try {
      setStatusUpdatingId(rentalId);
      const base64Request = btoa(JSON.stringify({ rental_id: rentalId }));
      const params = `status=${newStatusId}&request=${base64Request}`;
      
      const token = localStorage.getItem("token");
      await fetch(`/api/backend/booking/update-status?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const statusMap: Record<number, string> = {
        2: "confirmed",
        7: "completed",
        3: "cancelled",
        5: "cancelled",
        4: "pending"
      };
      
      toast.success(`Booking status updated to ${statusMap[newStatusId]} successfully!`);
      fetchRentals();
    } catch (error: any) {
      console.error("UPDATE STATUS ERROR:", error);
      toast.error("Failed to update status.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDownloadInvoice = async (rentalId: number) => {
    try {
      toast("Downloading invoice...", { icon: 'ℹ️' });
      const response = await axiosClient.get(`/invoice/booking/${rentalId}`, {
        responseType: 'blob'
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${rentalId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download invoice.");
    }
  };

  useEffect(() => {
    fetchRentals(1);
  }, []);

  // Reset to page 1 and re-fetch when search/status filter changes
  useEffect(() => {
    setCurrentPage(1);
    fetchRentals(1);
  }, [searchQuery, localSearch, statusFilter]);

  const filteredItems = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase();
    return items.filter((rental) => {
      const matchesSearch = query === "" ||
        rental.bookingNumber.toLowerCase().includes(query) ||
        rental.customerName.toLowerCase().includes(query) ||
        rental.vehicle.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || rental.rentalStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, localSearch, statusFilter]);

  const stats = useMemo(() => [
    { label: "Total Rentals", value: totalCount || items.length, icon: <Calendar size={20} />, color: "blue" as const },
    { label: "Pending", value: items.filter(i => i.rentalStatus === "pending").length, icon: <Clock size={20} />, color: "amber" as const },
    { label: "Confirmed", value: items.filter(i => i.rentalStatus === "confirmed").length, icon: <CheckCircle size={20} />, color: "emerald" as const },
    { label: "Completed", value: items.filter(i => i.rentalStatus === "completed").length, icon: <CheckCircle size={20} />, color: "blue" as const },
    { label: "Cancelled", value: items.filter(i => i.rentalStatus === "cancelled").length, icon: <XCircle size={20} />, color: "red" as const },
  ], [items, totalCount]);

  // Use server pagination for normal browsing; client-side when filtering
  const isLocalFiltering = !!(searchQuery || localSearch || statusFilter !== "all");
  const localTotalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const effectiveTotalPages = isLocalFiltering ? localTotalPages : totalPages;
  const paginatedItems = isLocalFiltering
    ? filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredItems;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (!isLocalFiltering) fetchRentals(page);
  };

  return (
    <SectionLayout>
      <PageHeader
        title="Rentals"
        description="Monitor your active and past rentals"
        showAction={false}
      />

      <div className="mt-4">
        <StatsGrid stats={stats} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by booking #, customer or vehicle..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            aria-label="Search bookings"
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="relative w-full sm:w-[200px] shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by status"
            className="w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto" style={{ transform: "rotateX(180deg)" }}>
          <div style={{ transform: "rotateX(180deg)" }}>
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Booking ID</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Vehicle</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Customer Details</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Rental Period</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Price</th>
                  <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Status</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                      No rentals match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((rental) => (
                    <tr key={rental.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200 group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:border-primary-100 transition-colors">
                          {rental.bookingNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{rental.vehicle}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Automatic</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{rental.customerName}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{rental.country}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700">{rental.duration} Days</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">{rental.period || `Starts ${rental.startedAt}`}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900">{rental.totalPrice}</span>
                          <span className="text-[10px] text-emerald-600 font-bold">Paid</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className="relative">
                            <select
                              value={
                                rental.rentalStatus === "confirmed" ? "2" :
                                rental.rentalStatus === "completed" ? "7" :
                                rental.rentalStatus === "cancelled" ? "3" : "4"
                              }
                              onChange={(e) => handleUpdateStatus(rental.id, Number(e.target.value))}
                              disabled={statusUpdatingId === rental.id}
                              aria-label="Change rental status"
                              className={`appearance-none inline-flex items-center gap-1.5 pl-3 pr-8 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                                rental.rentalStatus === "confirmed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                rental.rentalStatus === "completed" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                rental.rentalStatus === "cancelled" ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-600 border-amber-100"
                              }`}
                            >
                              <option value="4" className="bg-white text-amber-600 font-bold">Pending</option>
                              <option value="2" className="bg-white text-emerald-600 font-bold">Confirmed</option>
                              <option value="7" className="bg-white text-blue-600 font-bold">Completed</option>
                              <option value="3" className="bg-white text-red-600 font-bold">Cancelled</option>
                            </select>
                            <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none w-3.5 h-3.5 ${
                              rental.rentalStatus === "confirmed" ? "text-emerald-600" : 
                              rental.rentalStatus === "completed" ? "text-blue-600" :
                              rental.rentalStatus === "cancelled" ? "text-red-600" : "text-amber-600"
                            }`} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 items-center">
                          <button 
                            onClick={() => handleDownloadInvoice(rental.id)}
                            className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-100"
                            title="Download Invoice"
                            aria-label="Download Invoice"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination component */}
        {effectiveTotalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-bold text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, isLocalFiltering ? filteredItems.length : totalCount)} of{" "}
              {isLocalFiltering ? filteredItems.length : totalCount} rentals
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={effectiveTotalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <CreateRentalModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchRentals();
        }}
      />
    </SectionLayout>
  );
}
