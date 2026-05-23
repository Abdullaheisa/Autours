"use client";

import { useState, useMemo } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { reviewsData, Review } from "@/lib/data";

// Filter options
const countries = ["All", "United Arab Emirates", "Saudi Arabia", "Kuwait", "Oman", "Qatar", "Bahrain", "Jordan"];
const suppliers = ["All", "MAHD Rent", "Autocar Elite", "Nile Motors", "Doha Wheels", "Kuwait Ride", "Bahrain Auto"];
const rentalStatuses = ["All", "confirmed", "pending", "cancelled"];
const ratings = ["All", "5", "4", "3", "2", "1"];

export default function RentalReviewsSection() {
  const [items] = useState<Review[]>(reviewsData);
  const [countryFilter, setCountryFilter] = useState("All");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [referenceFilter, setReferenceFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((review) => {
      const matchesSearch = searchQuery === "" || 
        review.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) || 
        review.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [items, searchQuery]);

  const clearFilters = () => {
    setCountryFilter("All");
    setSupplierFilter("All");
    setStatusFilter("All");
    setReferenceFilter("");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Filters Row - Exact match to screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
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
              {countries.filter(c => c !== "All").map((c) => (
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

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Rentals</h1>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-24">Booking #</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-32">Vehicle</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-32">Country</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-32">Supplier name</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-24">Started At</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-24">Ended At</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-20">Duration</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-24">Review</th>
                <th className="text-left text-sm font-normal text-gray-400 px-4 py-3 w-24">Type to search</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">No Data</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">{review.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{review.vehicle}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{review.company}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{review.company}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{review.date}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{review.date}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">-</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < review.rating ? "#F59E0B" : "#E5E7EB"} stroke="none">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs text-gray-400 focus:outline-none"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
