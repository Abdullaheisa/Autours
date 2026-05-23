"use client";

import { Building2, CalendarCheck, DollarSign, Star, TrendingUp } from "lucide-react";
import { companies, recentBookings } from "@/lib/data";

export default function StatsCards() {
  const totalCompanies = companies.length;
  const totalBookings = recentBookings.length * 150;
  const totalRevenue = companies.reduce((sum, c) => sum + c.revenue, 0);
  const avgRating = (companies.reduce((sum, c) => sum + c.rating, 0) / companies.length).toFixed(1);

  const stats = [
    { title: "Total Companies", value: totalCompanies, icon: Building2, change: "+12%", trend: "up", color: "blue", bgColor: "bg-blue-50", iconColor: "text-blue-600", borderColor: "border-blue-200" },
    { title: "Total Bookings", value: totalBookings.toLocaleString(), icon: CalendarCheck, change: "+23%", trend: "up", color: "green", bgColor: "bg-emerald-50", iconColor: "text-emerald-600", borderColor: "border-emerald-200" },
    { title: "Total Revenue", value: `$${(totalRevenue / 1000000).toFixed(2)}M`, icon: DollarSign, change: "+18%", trend: "up", color: "purple", bgColor: "bg-purple-50", iconColor: "text-purple-600", borderColor: "border-purple-200" },
    { title: "Average Rating", value: avgRating, icon: Star, change: "+5%", trend: "up", color: "amber", bgColor: "bg-amber-50", iconColor: "text-amber-600", borderColor: "border-amber-200" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <div key={index} className={`bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
          <div className="flex items-start justify-between">
            <div className={`${stat.bgColor} p-2.5 sm:p-3 rounded-xl`}><stat.icon className={stat.iconColor} size={20} /></div>
            <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
              <TrendingUp size={14} />{stat.change}
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
