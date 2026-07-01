"use client";

import { Building2, CalendarCheck, DollarSign, Star, TrendingUp } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function StatsCards() {
  const { stats, rawData } = useSelector((state: RootState) => state.dashboard);

  const totalCompanies = rawData?.totalCompanies || stats.newUsers || 0;
  const totalBookings = stats.activeBookings || 0;
  const totalRevenue = stats.totalRevenue || 0;
  const avgRating = rawData?.avgRating || "0.0";

  const cards = [
    { title: "Total Companies", value: totalCompanies, icon: Building2, change: "+12%", trend: "up", color: "blue", bgColor: "bg-blue-50", iconColor: "text-blue-600", borderColor: "border-blue-200" },
    { title: "Total Bookings", value: totalBookings.toLocaleString(), icon: CalendarCheck, change: "+23%", trend: "up", color: "green", bgColor: "bg-emerald-50", iconColor: "text-emerald-600", borderColor: "border-emerald-200" },
    { title: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, change: "+18%", trend: "up", color: "purple", bgColor: "bg-purple-50", iconColor: "text-purple-600", borderColor: "border-purple-200" },
    { title: "Average Rating", value: avgRating, icon: Star, change: "+5%", trend: "up", color: "amber", bgColor: "bg-amber-50", iconColor: "text-amber-600", borderColor: "border-amber-200" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {cards.map((stat, index) => (
        <div key={index} className={`bg-white rounded-2xl p-3 sm:p-4 border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 sm:gap-4`}>
          <div className={`${stat.bgColor} p-2.5 sm:p-3 rounded-xl shrink-0`}>
            <stat.icon className={stat.iconColor} size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{stat.title}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mt-0.5 truncate">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
