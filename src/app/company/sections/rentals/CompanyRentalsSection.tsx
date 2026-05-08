"use client";

import { useState, useMemo } from "react";
import { Search, Calendar, ChevronDown, CheckCircle, XCircle, Clock, Filter, Eye, Download } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsGrid from "@/app/company/components/StatsGrid";
import { rentals, Rental } from "@/lib/data";
import { useSearch } from "../../context/SearchContext";

const LOGGED_IN_COMPANY_NAME = "MAHD"; 

export default function CompanyRentalsSection() {
  const { searchQuery } = useSearch();
  const [localSearch, setLocalSearch] = useState("");
  const [items] = useState<Rental[]>(rentals);

  const filteredItems = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase();
    return items.filter((rental) => {
      const isMyCompany = rental.supplierName.includes(LOGGED_IN_COMPANY_NAME);
      const matchesSearch = query === "" || 
        rental.bookingNumber.toLowerCase().includes(query) || 
        rental.customerName.toLowerCase().includes(query) ||
        rental.vehicle.toLowerCase().includes(query);
      return isMyCompany && matchesSearch;
    });
  }, [items, searchQuery, localSearch]);

  const stats = useMemo(() => [
    { label: "Total Rentals", value: filteredItems.length, icon: <Calendar size={20} />, color: "blue" as const },
    { label: "Confirmed", value: filteredItems.filter(i => i.rentalStatus === "confirmed").length, icon: <CheckCircle size={20} />, color: "emerald" as const },
    { label: "Cancelled", value: filteredItems.filter(i => i.rentalStatus === "cancelled").length, icon: <XCircle size={20} />, color: "red" as const },
  ], [filteredItems]);

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

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by booking #, customer or vehicle..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:text-primary-600 hover:border-primary-200 transition-all">
          <Filter size={20} />
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
              {filteredItems.map((rental) => (
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
                      <span className="text-[10px] text-gray-400 mt-0.5">Starts {rental.startedAt}</span>
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
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                        rental.rentalStatus === "confirmed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                        rental.rentalStatus === "cancelled" ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {rental.rentalStatus === "confirmed" ? <CheckCircle size={12} /> : 
                         rental.rentalStatus === "cancelled" ? <XCircle size={12} /> : <Clock size={12} />}
                        {rental.rentalStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => window.location.href = `/company/rentals/${rental.id}`}
                        className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-100"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-transparent" title="Download Invoice">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionLayout>
  );
}
