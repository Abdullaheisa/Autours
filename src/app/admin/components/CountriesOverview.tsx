"use client";

import { MapPin, TrendingUp, Car, DollarSign } from "lucide-react";
import { bookingsByCountry } from "@/lib/data";

export default function CountriesOverview() {
  const totalBookings = bookingsByCountry.reduce((sum, c) => sum + c.bookings, 0);
  const totalRevenue = bookingsByCountry.reduce((sum, c) => sum + c.revenue, 0);
  const totalVehicles = bookingsByCountry.reduce((sum, c) => sum + c.vehicles, 0);
  const topCountry = bookingsByCountry.reduce((max, c) => c.bookings > max.bookings ? c : max, bookingsByCountry[0]);

  const stats = [
    { label: "Total Bookings", value: totalBookings.toLocaleString(), icon: TrendingUp, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Total Revenue", value: `$${(totalRevenue / 1000000).toFixed(2)}M`, icon: DollarSign, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { label: "Total Vehicles", value: totalVehicles.toLocaleString(), icon: Car, color: "text-purple-600", bgColor: "bg-purple-50" },
    { label: "Top Country", value: topCountry.country, icon: MapPin, color: "text-amber-600", bgColor: "bg-amber-50" },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Countries Overview</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Performance across 9 Arab countries</p>
        </div>
        <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium w-fit">9 Countries</div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-2.5 sm:p-3`}>
            <stat.icon className={stat.color} size={16} />
            <p className="text-base sm:text-lg font-bold text-gray-900 mt-1.5">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2.5 sm:space-y-3">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Bookings by Country</h4>
        {bookingsByCountry.map((country, index) => {
          const percentage = (country.bookings / totalBookings) * 100;
          const colors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-red-500", "bg-purple-500", "bg-pink-500", "bg-cyan-500", "bg-lime-500", "bg-orange-500"];
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-gray-700">{country.country}</span>
                <span className="text-gray-500">{country.bookings.toLocaleString()} ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2">
                <div className={`${colors[index % colors.length]} h-1.5 sm:h-2 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
