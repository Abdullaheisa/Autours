"use client";

import { useMemo, useEffect, useState } from "react";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import Image from "next/image";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsGrid from "@/app/company/components/StatsGrid";
import { supplierApi } from "@/services/api/supplierApi";

export default function CompanyRentalReviewsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supplierApi.getRentals(1, 100, true).then((res: any) => {
      console.log("REVIEWS API RESPONSE:", res);
      
      const rentals = Array.isArray(res) 
        ? res 
        : (Array.isArray(res?.data) 
          ? res.data 
          : (Array.isArray(res?.data?.data) 
            ? res.data.data 
            : []));
            
      const extractedReviews = rentals
        .filter((r: any) => r.rate !== null && r.rate !== undefined)
        .map((r: any) => ({
          id: r.id,
          customer: r.customer?.name || "Customer",
          avatar: r.customer?.avatar || r.avatar || null,
          bookingNumber: r.order_number || r.booking_number || r.id,
          date: r.start_date || r.created_at || "Recent",
          rating: Math.round(parseFloat(r.rate || "5")),
          comment: r.comment || "No comment provided.",
          vehicle: r.vehicle?.name || "Unknown Vehicle",
          rentalRates: r.rental_rates || r.rentalRates || r.rates || [] // Eager-loaded ratings breakdown fallbacks!
        }));
      setReviews(extractedReviews);
    }).catch((err) => console.warn(err.message)).finally(() => setIsLoading(false));
  }, []);

  const filteredReviews = useMemo(() => reviews, [reviews]);

  const stats = useMemo(() => {
    const avgRating = (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / (filteredReviews.length || 1)).toFixed(1);
    return [
      { label: "Total Reviews", value: filteredReviews.length, icon: <MessageSquare size={20} />, color: "blue" as const },
      { label: "Average Rating", value: avgRating, icon: <Star size={20} />, color: "amber" as const },
      { label: "Positive Feedback", value: `${filteredReviews.length > 0 ? Math.round((filteredReviews.filter(r => r.rating >= 4).length / filteredReviews.length) * 100) : 100}%`, icon: <TrendingUp size={20} />, color: "emerald" as const },
    ];
  }, [filteredReviews]);

  return (
    <SectionLayout>
      <PageHeader
        title="Rental Reviews"
        description="See what your customers are saying"
        showAction={false}
      />

      <StatsGrid stats={stats} />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-400 text-sm font-medium">
          No reviews available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    {review.avatar ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm shrink-0">
                        <Image
                          src={review.avatar}
                          alt={review.customer}
                          fill
                          className="object-cover"
                          loading="lazy"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-amber-500 rounded-full flex items-center justify-center font-black text-gray-900 shadow-inner shrink-0 text-sm">
                        {review.customer.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-sm tracking-tight">{review.customer}</h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400 font-semibold mt-0.5">
                        <span>{review.date}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-md text-[10px]">Booking #{review.bookingNumber}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Overall Star Badge */}
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100/50 shrink-0 shadow-sm">
                    <Star size={13} className="fill-amber-500 text-amber-500 shrink-0" />
                    <span className="text-xs font-black text-amber-700 leading-none">{review.rating}.0/5</span>
                  </div>
                </div>

                {/* Comment Box */}
                <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100/70 relative">
                  <p className="text-sm text-gray-700 leading-relaxed italic font-medium">"{review.comment}"</p>
                </div>

                {/* Breakdown Matrix Progress Bars */}
                {review.rentalRates && review.rentalRates.length > 0 && (
                  <div className="border-t border-gray-100/80 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Detailed Rating Matrix</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                              <span className="font-black text-gray-900">{score}.0/5</span>
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

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100/80">
                <span className="text-xs font-semibold text-gray-500">Vehicle: <span className="text-gray-950 font-black">{review.vehicle}</span></span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50/50 px-2.5 py-1 rounded-lg border border-emerald-100/50 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Verified Rental
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionLayout>
  );
}
