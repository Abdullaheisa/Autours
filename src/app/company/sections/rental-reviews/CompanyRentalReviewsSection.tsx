"use client";

import { useMemo } from "react";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsGrid from "@/app/company/components/StatsGrid";
import { reviewsData } from "@/lib/data";

const LOGGED_IN_COMPANY_NAME = "MAHD";

export default function CompanyRentalReviewsSection() {
  const filteredReviews = useMemo(() => 
    reviewsData.filter(r => r.company.includes(LOGGED_IN_COMPANY_NAME)),
    []
  );

  const stats = useMemo(() => {
    const avgRating = (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / (filteredReviews.length || 1)).toFixed(1);
    return [
      { label: "Total Reviews", value: filteredReviews.length, icon: <MessageSquare size={20} />, color: "blue" as const },
      { label: "Average Rating", value: avgRating, icon: <Star size={20} />, color: "amber" as const, change: "+0.3", trend: "up" as const },
      { label: "Positive Feedback", value: "94%", icon: <TrendingUp size={20} />, color: "emerald" as const },
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700">
                  {review.customer.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{review.customer}</h4>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed italic">"{review.comment}"</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-medium text-gray-500">Vehicle: <span className="text-gray-900">{review.vehicle}</span></span>
              <button className="text-xs font-bold text-primary-600 hover:text-primary-700">Reply to Review</button>
            </div>
          </div>
        ))}
      </div>
    </SectionLayout>
  );
}
