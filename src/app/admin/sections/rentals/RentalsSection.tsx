"use client";

import { useState, useMemo } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { rentals, countries, suppliers, rentalStatuses, Rental } from "@/lib/data";

export default function RentalsSection() {
  const [items] = useState<Rental[]>(rentals);
  const [countryFilter, setCountryFilter] = useState("All");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [referenceFilter, setReferenceFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((rental) => {
      const matchesCountry = countryFilter === "All" || rental.country === countryFilter;
      const matchesSupplier = supplierFilter === "All" || rental.supplierName === supplierFilter;
      const matchesStatus = statusFilter === "All" || rental.rentalStatus === statusFilter;
      const matchesReference = referenceFilter === "" || rental.bookingNumber.toLowerCase().includes(referenceFilter.toLowerCase());
      const matchesDateRange = (() => {
        if (!startDate && !endDate) return true;
        const rentalStart = new Date(rental.startedAt);
        const rentalEnd = new Date(rental.endedAt);
        const filterStart = startDate ? new Date(startDate) : null;
        const filterEnd = endDate ? new Date(endDate) : null;
        if (filterStart && filterEnd) return rentalStart >= filterStart && rentalEnd <= filterEnd;
        if (filterStart) return rentalStart >= filterStart;
        if (filterEnd) return rentalEnd <= filterEnd;
        return true;
      })();
      return matchesCountry && matchesSupplier && matchesStatus && matchesReference && matchesDateRange;
    });
  }, [items, countryFilter, supplierFilter, statusFilter, referenceFilter, startDate, endDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-emerald-600";
      case "cancelled":
        return "text-red-500";
      case "pending":
        return "text-amber-500";
      default:
        return "text-gray-600";
    }
  };

  const clearFilters = () => {
    setCountryFilter("All");
    setSupplierFilter("All");
    setStatusFilter("All");
    setReferenceFilter("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Filters Section - 2 Rows */}
      <div className="mb-6">
        {/* Row 1: Country, Suppliers, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {/* Country */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Country</label>
            <div className="relative">
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-400 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="All">Countries...</option>
                {Array.from(new Set(rentals.map(r => r.country))).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Suppliers */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Suppliers</label>
            <div className="relative">
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-400 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="All">Suppliers...</option>
                {suppliers.filter(s => s !== "All").map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-400 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="All">Rental Status...</option>
                {rentalStatuses.filter(s => s !== "All").map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Row 2: Rental Reference, Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Rental Reference */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Rental Reference</label>
            <input
              type="text"
              placeholder="Reference..."
              value={referenceFilter}
              onChange={(e) => setReferenceFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-400 focus:outline-none"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Select Date Range</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex-1 flex items-center px-3 py-2">
                <Calendar size={14} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-sm text-gray-400 focus:outline-none w-full bg-transparent"
                />
              </div>
              <div className="px-2 py-2 bg-gray-50 border-x border-gray-200">
                <span className="text-xs text-gray-400 font-medium">TO</span>
              </div>
              <div className="flex-1 flex items-center px-3 py-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm text-gray-400 focus:outline-none w-full bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Rentals</h1>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-24">Booking #</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-32">Vehicle</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-28">Customer Name</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-32">Country</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-24">Total Price</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-16">Profit</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-24">Supplier price</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-24">Supplier name</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-24">Rental Status</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-24">Started At</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-24">Ended At</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-16">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((rental) => (
                <tr key={rental.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-900">{rental.bookingNumber}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{rental.vehicle}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{rental.customerName}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{rental.country}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-900">{rental.totalPrice}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{rental.profit}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{rental.supplierPrice}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{rental.supplierName}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm capitalize ${getStatusColor(rental.rentalStatus)}`}>
                      {rental.rentalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{rental.startedAt}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{rental.endedAt}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{rental.duration}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-500">No rentals found matching your filters</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
