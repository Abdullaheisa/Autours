"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import { Calendar, ChevronDown, ChevronUp, Star, MessageSquare, MapPin } from "lucide-react";
import { rentalApi } from "@/services/api";
import Pagination from "@/components/ui/Pagination";

const rentalStatuses = ["All", "confirmed", "pending", "completed", "cancelled"];

export default function RentalReviewsSection() {
  const [items, setItems] = useState<any[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRentalId, setExpandedRentalId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      // Fetch all admin rentals (same as old Vue project — show all rentals with or without reviews)
      const res: any = await rentalApi.getAdmin();
      const list = res?.rentals || res?.data?.rentals || (Array.isArray(res) ? res : []);
      const formattedItems = list.map((r: any) => {
        // Calculate duration in days
        let durationDays = r.number_of_days;
        if (!durationDays && r.start_date && r.end_date) {
          const start = new Date(r.start_date);
          const end = new Date(r.end_date);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
          id: r.id,
          order_number: r.order_number,
          customer: r.customer?.name || "Customer",
          vehicle: r.vehicle?.name || r.vehicle?.model || "Vehicle",
          company: r.supplier?.name || r.vehicle?.supplier?.name || "Supplier",
          country: r.country || r.vehicle?.branch?.country || (r.vehicle?.name?.toLowerCase().includes('dubai') || r.supplier?.name?.toLowerCase().includes('dubai') ? "UAE" : r.vehicle?.name?.toLowerCase().includes('riyadh') ? "Saudi" : "Egypt"),
          date: r.start_date,
          end_date: r.end_date,
          duration: durationDays ? `${durationDays} days` : "-",
          rating: r.rate || r.rating || 0,
          comment: r.comment || "",
          status: r.order_status || "confirmed",
          rentalRates: r.rental_rates || r.rentalRates || [] // Include ratings breakdown!
        };
      });
      setItems(formattedItems);

      const uniqueCountries = Array.from(new Set(formattedItems.map((r: any) => r.country).filter((c: any) => c && c !== "Unknown"))) as string[];
      const uniqueSuppliers = Array.from(new Set(formattedItems.map((r: any) => r.company).filter(Boolean))) as string[];
      setCountries(uniqueCountries);
      setSuppliers(uniqueSuppliers);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const [countryFilter, setCountryFilter] = useState("All");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [referenceFilter, setReferenceFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((review) => {
      const customerName = review.customer || "";
      const comment = review.comment || "";
      const vehicle = review.vehicle || "";
      const matchesSearch = searchQuery === "" || 
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        comment.toLowerCase().includes(searchQuery.toLowerCase()) || 
        vehicle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = countryFilter === "All" || review.country === countryFilter;
      const matchesSupplier = supplierFilter === "All" || review.company === supplierFilter;
      
      const statusMap: Record<number, string> = {
        1: "pending",
        2: "confirmed",
        7: "completed",
        3: "cancelled",
        5: "cancelled",
        4: "pending"
      };
      
      const reviewStatusStr = typeof review.status === "number" ? statusMap[review.status] : String(review.status).toLowerCase();
      const matchesStatus = statusFilter === "All" || reviewStatusStr === statusFilter.toLowerCase();
      
      return matchesSearch && matchesCountry && matchesSupplier && matchesStatus;
    });
  }, [items, searchQuery, countryFilter, supplierFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, countryFilter, supplierFilter, statusFilter, referenceFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-700 mb-2 block">Country</label>
          <div className="relative">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="All">Countries...</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-700 mb-2 block">Suppliers</label>
          <div className="relative">
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="All">Suppliers...</option>
              {suppliers.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-700 mb-2 block">Status</label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="All">Rental Status...</option>
              {rentalStatuses.filter(s => s !== "All").map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-700 mb-2 block">Rental Reference</label>
          <input
            type="text"
            placeholder="Reference..."
            value={referenceFilter}
            onChange={(e) => setReferenceFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-700 mb-2 block">Select Date Range</label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex-1 flex items-center px-3 py-2">
              <Calendar size={14} className="text-gray-400 mr-2 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm text-gray-700 focus:outline-none w-full bg-transparent"
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
                className="text-sm text-gray-700 focus:outline-none w-full bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Rentals</h1>

      <div className="border border-gray-200 rounded-2xl shadow-sm overflow-hidden bg-white">
        {isLoading ? (
           <div className="flex items-center justify-center py-20">
             <span className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
           </div>
        ) : (
          <div className="overflow-x-auto" style={{ transform: "rotateX(180deg)" }}>
            <div style={{ transform: "rotateX(180deg)" }}>
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4 w-28">Booking #</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4 w-40">Vehicle</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4 w-32">Country</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4 w-40">Supplier name</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4 w-28">Started At</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4 w-28">Ended At</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4 w-20">Duration</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4 w-32">Review</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4 w-32">Type to search</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedReviews.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400 font-medium">
                        No Rentals Found
                      </td>
                    </tr>
                  ) : (
                    paginatedReviews.map((review) => {
                      const hasReview = review.comment || (review.rentalRates && review.rentalRates.length > 0);
                      const isExpanded = expandedRentalId === review.id;
                      
                      return (
                        <Fragment key={review.id}>
                          <tr 
                            onClick={() => hasReview && setExpandedRentalId(isExpanded ? null : review.id)}
                            className={`hover:bg-gray-50/50 transition-colors ${hasReview ? 'cursor-pointer' : ''} ${isExpanded ? 'bg-primary-50/10' : ''}`}
                          >
                            <td className="px-4 py-4">
                              <span className="font-mono text-sm font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                                {review.order_number || review.id}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm font-bold text-gray-900">{review.vehicle}</span>
                            </td>
                            <td className="px-4 py-4 flex items-center gap-1.5 mt-2 border-0">
                              <MapPin size={12} className="text-gray-400" />
                              <span className="text-sm text-gray-600 font-medium">{review.country}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm text-gray-700 font-semibold">{review.company}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm text-gray-600">{review.date}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm text-gray-600">{review.end_date}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm text-gray-500 font-bold">{review.duration}</span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                {review.rating > 0 ? (
                                  <>
                                    <div className="flex items-center gap-0.5 text-amber-500">
                                      {Array.from({ length: 5 }, (_, i) => (
                                        <Star key={i} size={11} fill={i < Math.round(review.rating) ? "currentColor" : "none"} className={i < Math.round(review.rating) ? "text-amber-500" : "text-gray-200"} />
                                      ))}
                                    </div>
                                    {hasReview && (
                                      <span className="text-[10px] text-primary-600 font-bold bg-primary-50 px-1.5 py-0.5 rounded border border-primary-100 flex items-center gap-0.5">
                                        Detail {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-xs text-gray-400 font-bold">Unrated</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search review"
                                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-gray-50/25">
                              <td colSpan={9} className="px-6 py-6 border-t border-b border-gray-100">
                                <div className="max-w-5xl bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 space-y-5 animate-fade-in">
                                  {/* Header inside detail card */}
                                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-amber-500 rounded-full flex items-center justify-center font-black text-gray-900 text-xs shadow-inner">
                                        {review.customer.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <h4 className="font-extrabold text-gray-900 text-sm tracking-tight">{review.customer}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold mt-0.5">
                                          <span>Started: {review.date}</span>
                                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                          <span>Ended: {review.end_date}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-400 font-bold bg-gray-100 px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider">Booking ID: #{review.order_number || review.id}</span>
                                      <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100/50 shrink-0">
                                        <Star size={11} className="fill-amber-500 text-amber-500" />
                                        <span className="text-xs font-black text-amber-700">{review.rating}.0/5</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Comment box */}
                                  {review.comment && (
                                    <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100 shadow-inner">
                                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Written Comment</p>
                                      <p className="text-sm text-gray-700 leading-relaxed italic font-medium">"{review.comment}"</p>
                                    </div>
                                  )}
    
                                  {/* Breakdown matrix progress bars */}
                                  {review.rentalRates && review.rentalRates.length > 0 && (
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Detailed Rating Matrix</p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {review.rentalRates.map((rr: any) => {
                                          const objective = rr.question?.objective || rr.question?.question || rr.question?.question_en || "Rating";
                                          const score = Number(rr.rate) || 5;
                                          const percentage = (score / 5) * 100;
                                          
                                          let barColor = "bg-rose-500";
                                          if (score >= 4.5) {
                                            barColor = "bg-emerald-500";
                                          } else if (score >= 3.5) {
                                            barColor = "bg-amber-400";
                                          }
                                          
                                          return (
                                            <div key={rr.id} className="space-y-1.5 bg-gray-50/40 p-3 rounded-xl border border-gray-100">
                                              <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-gray-600 truncate mr-2" title={rr.question?.question || rr.question?.question_en || "Question"}>
                                                  {objective}
                                                </span>
                                                <span className="font-black text-gray-955">{score}.0/5</span>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 w-full bg-gray-200/80 rounded-full overflow-hidden">
                                                  <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                                                </div>
                                                <div className="flex text-amber-400 shrink-0">
                                                  {Array.from({ length: 5 }, (_, i) => (
                                                    <Star key={i} size={9} fill={i < Math.round(score) ? "currentColor" : "none"} className={i < Math.round(score) ? "text-amber-400" : "text-gray-200"} />
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredItems.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-8 py-4 bg-gray-50/30">
            <span className="text-xs font-bold text-gray-500">
              Showing {Math.min(filteredItems.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
              {Math.min(filteredItems.length, currentPage * itemsPerPage)} of {filteredItems.length} rentals
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
