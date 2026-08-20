"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle, Trash2, Building2, Eye } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import Pagination from "@/components/ui/Pagination";
import { rentalApi } from "@/services/api";
import toast from "react-hot-toast";
import BookingDetailsModal from "./BookingDetailsModal";

export default function RentalsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rentalsData, setRentalsData] = useState<any[]>([]);
  const [selectedRental, setSelectedRental] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  const mapOrderStatus = (statusVal: any): string => {
    if (statusVal === undefined || statusVal === null) return "upcoming";
    
    // If it's a number, map it
    if (typeof statusVal === "number") {
      switch (statusVal) {
        case 2:
          return "confirmed";
        case 7:
          return "completed";
        case 3:
        case 5:
          return "cancelled";
        case 4:
        default:
          return "pending";
      }
    }

    // If it's a string, check if it's a numerical string
    const str = String(statusVal).trim().toLowerCase();
    if (str === "2") return "confirmed";
    if (str === "7") return "completed";
    if (str === "3" || str === "5") return "cancelled";
    if (str === "4") return "pending";

    // Otherwise return standard string mapping
    if (str === "confirmed") return "confirmed";
    return str || "upcoming";
  };

  const fetchRentals = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res: any = await rentalApi.getAdmin({ page, per_page: itemsPerPage });
      // Backend now returns Laravel paginator: { data:[...], total, last_page, current_page }
      const raw = res?.data ?? res;
      const list: any[] = Array.isArray(raw?.data) ? raw.data
        : Array.isArray(raw?.rentals) ? raw.rentals   // fallback for old format
        : Array.isArray(raw) ? raw
        : [];
      setTotalPages(raw?.last_page || 1);
      setTotalCount(raw?.total || list.length);
      setRentalsData(list.map((r: any) => {
        let durationDays = r.number_of_days;
        if (!durationDays && r.start_date && r.end_date) {
          const start = new Date(r.start_date);
          const end = new Date(r.end_date);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        const companyName = 
          r.supplier?.company || 
          r.supplier?.name || 
          r.vehicle?.supplier?.company || 
          r.vehicle?.supplier?.name || 
          r.vehicle?.supplierUser?.company || 
          r.vehicle?.supplierUser?.name || 
          r.vehicle?.supplier_user?.company || 
          r.vehicle?.supplier_user?.name || 
          "Supplier";

        return {
          id: r.id,
          order_number: r.order_number,
          customer: r.customer?.name || "Customer",
          customer_id: r.customer_id || r.customer?.id,
          customer_email: r.customer?.email || "—",
          customer_phone: r.customer?.phone_num || r.customer?.phone || "—",
          customer_country: r.customer?.country || "—",
          customer_city: r.customer?.city || "—",
          customer_address: r.customer?.address || "—",
          customer_gender: r.customer?.gender || "",
          avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(r.customer?.name || "C"),
          vehicle: r.vehicle?.name || "Vehicle",
          vehicle_photo: r.vehicle?.photo || "",
          vehicle_category: r.vehicle?.category?.name || r.vehicle?.category?.name_en || r.vehicle?.category || "",
          vehicle_branch: r.vehicle?.branch?.name || r.vehicle?.branch?.location || r.vehicle?.branch?.adresse || "",
          vehicle_branch_city: r.vehicle?.branch?.city || "",
          vehicle_branch_country: r.vehicle?.branch?.country || "",
          company: companyName,
          supplier_name: r.supplier?.name || r.vehicle?.supplierUser?.name || r.vehicle?.supplier?.name || "—",
          supplier_company: r.supplier?.company || r.vehicle?.supplierUser?.company || companyName,
          supplier_email: r.supplier?.email || r.vehicle?.supplierUser?.email || r.vehicle?.supplier?.email || "—",
          supplier_phone: r.supplier?.phone_num || r.vehicle?.supplierUser?.phone_num || r.vehicle?.supplier?.phone_num || "—",
          supplier_logo: r.supplier?.logo || r.vehicle?.supplierUser?.logo || r.vehicle?.supplier?.logo || "",
          supplier_city: r.supplier?.city || r.vehicle?.supplierUser?.city || r.vehicle?.branch?.city || "",
          supplier_country: r.supplier?.country || r.vehicle?.supplierUser?.country || r.vehicle?.supplier?.country || r.vehicle?.branch?.country || r.country || "",
          start_date: r.start_date,
          end_date: r.end_date,
          start_time: r.start_time,
          end_time: r.end_time,
          dates: `${r.start_date} - ${r.end_date}`,
          duration: durationDays ? `${durationDays} days` : "-",
          amount: `${r.price} ${r.currency || ""}`,
          price: r.price,
          currency: r.currency || "",
          profit_margin: r.profit_margin,
          supplier_price: r.supplier_price,
          payment_method: r.payment_method?.name || r.paymentMethod?.name || (r.payment_method_id ? `Method #${r.payment_method_id}` : "Online Payment"),
          order_status: r.order_status,
          status: mapOrderStatus(r.order_status),
          status_name: r.status?.name_en || r.status?.name_ar || mapOrderStatus(r.order_status),
          country: r.country || r.vehicle?.branch?.country || "Unknown",
          rating: r.rate || r.rating || (r.rental_rates && r.rental_rates.length > 0 ? r.rental_rates[0].rating : 0) || 0,
          comment: r.comment || "",
          rental_rates: r.rental_rates || [],
          created_at: r.created_at,
          raw: r
        };
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals(1);
  }, []);

  const handleExport = () => {
    if (rentalsData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Order Number",
      "Customer",
      "Vehicle",
      "Supplier",
      "Dates",
      "Duration",
      "Amount",
      "Rating",
      "Status",
      "Country"
    ];

    const csvRows = [
      headers.join(","),
      ...rentalsData.map((r) => [
        `"${(r.order_number || r.id || "").toString().replace(/"/g, '""')}"`,
        `"${r.customer.replace(/"/g, '""')}"`,
        `"${r.vehicle.replace(/"/g, '""')}"`,
        `"${r.company.replace(/"/g, '""')}"`,
        `"${r.dates.replace(/"/g, '""')}"`,
        `"${r.duration.replace(/"/g, '""')}"`,
        `"${r.amount.replace(/"/g, '""')}"`,
        `"${r.rating}"`,
        `"${r.status}"`,
        `"${(r.country || "Unknown").replace(/"/g, '""')}"`
      ].join(","))
    ];

    const csvContent = "\ufeff" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rentals_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report exported successfully!");
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this rental?")) {
      try {
        await rentalApi.delete({ id });
        fetchRentals();
      } catch (e) {
        console.error("Failed to delete rental", e);
      }
    }
  };

  // Client-side filter on current page (search/status filter)
  const filteredRentals = rentalsData.filter((rental) => {
    const matchesSearch = !searchQuery ||
      rental.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.order_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const rentalStatus = String(rental.status || "").toLowerCase();
    const filterLower = statusFilter.toLowerCase();
    let matchesStatus = false;
    if (statusFilter === "All") {
      matchesStatus = true;
    } else if (filterLower === "active") {
      matchesStatus = rentalStatus === "active" || rentalStatus === "confirmed";
    } else if (filterLower === "upcoming") {
      matchesStatus = rentalStatus === "upcoming" || rentalStatus === "pending";
    } else {
      matchesStatus = rentalStatus === filterLower;
    }
    return matchesSearch && matchesStatus;
  });

  // Reset to page 1 when search/filter changes and re-fetch
  useEffect(() => {
    setCurrentPage(1);
    fetchRentals(1);
  }, [searchQuery, statusFilter]);

  // For server-side mode: paginatedRentals = filteredRentals (already one page from backend)
  // When searching locally within the page results:
  const isLocalFiltering = !!(searchQuery || statusFilter !== "All");
  const localTotalPages = Math.ceil(filteredRentals.length / itemsPerPage);
  const effectiveTotalPages = isLocalFiltering ? localTotalPages : totalPages;
  const paginatedRentals = isLocalFiltering
    ? filteredRentals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredRentals;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (!isLocalFiltering) fetchRentals(page);
  };

  const getStatusIcon = (status: any) => {
    const str = String(status || "").toLowerCase();
    switch (str) {
      case "active":
      case "confirmed":
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "upcoming":
      case "pending":
        return <Clock size={16} className="text-amber-500" />;
      case "completed":
        return <CheckCircle2 size={16} className="text-gray-500" />;
      case "cancelled":
      case "canceled":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: any) => {
    const str = String(status || "").toLowerCase();
    switch (str) {
      case "active":
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "upcoming":
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "completed":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "cancelled":
      case "canceled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <SectionLayout>
      <PageHeader 
        title="Rentals" 
        description="Manage and track all vehicle rentals"
        actionLabel="Export Report"
        actionIcon={<Download size={18} />}
        onAction={handleExport}
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search by customer, vehicle, company, or order #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer transition-colors appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active / Confirmed</option>
              <option value="Upcoming">Upcoming / Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {isLoading ? (
           <div className="flex items-center justify-center py-20">
             <span className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
           </div>
        ) : (
          <div className="overflow-x-auto" style={{ transform: "rotateX(180deg)" }}>
            <div style={{ transform: "rotateX(180deg)" }}>
              <table className="w-full min-w-[1000px]">
                 <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Customer</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Vehicle / Supplier</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Country</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Dates / Duration</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Amount</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Rating</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedRentals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">No rentals found</td>
                    </tr>
                  ) : (
                    paginatedRentals.map((rental) => (
                      <tr 
                        key={rental.id} 
                        onClick={() => setSelectedRental(rental)}
                        className="hover:bg-primary-50/20 transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                              <img src={rental.avatar} alt={rental.customer} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{rental.customer}</p>
                              <p className="text-xs text-gray-500">{rental.order_number || `ID: ${rental.id}`}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-900">{rental.vehicle}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Building2 size={13} className="text-primary-600 shrink-0" />
                            <span className="text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100/70 inline-flex items-center">
                              {rental.company}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-gray-950 bg-gray-100/80 px-2.5 py-1 rounded-lg border border-gray-200/50">{rental.country || "Unknown"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-900">{rental.dates}</p>
                          <p className="text-xs text-gray-500">{rental.duration}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-gray-900">{rental.amount}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < rental.rating ? "#F59E0B" : "#E5E7EB"} stroke="none">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(rental.status)}`}>
                            {getStatusIcon(rental.status)}
                            <span className="capitalize">{rental.status}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => setSelectedRental(rental)}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors cursor-pointer"
                              title="View Full Booking Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(rental.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Delete Rental"
                            >
                              <Trash2 size={16} />
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
        )}

        {/* Pagination Footer */}
        {effectiveTotalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-8 py-4 bg-gray-50/30">
            <span className="text-xs font-bold text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, isLocalFiltering ? filteredRentals.length : totalCount)} of{" "}
              {isLocalFiltering ? filteredRentals.length : totalCount} rentals
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={effectiveTotalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={!!selectedRental}
        onClose={() => setSelectedRental(null)}
        rental={selectedRental}
      />
    </SectionLayout>
  );
}
