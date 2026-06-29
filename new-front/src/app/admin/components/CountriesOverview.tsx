"use client";

import { MapPin, TrendingUp, Car, DollarSign } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function CountriesOverview() {
  const { rawData, stats } = useSelector((state: RootState) => state.dashboard);
  const data = rawData?.bookingsByCountry || [];

  // Bookings: sum from bookingsByCountry array, fallback to redux stats
  const totalBookings = data.reduce((sum: number, c: any) => sum + (Number(c.bookings) || 0), 0)
    || stats.activeBookings || 0;

  // Revenue: only show if field exists and is a valid number
  const rawRevenue = data.reduce((sum: number, c: any) => sum + (Number(c.revenue) || 0), 0);
  const revenueDisplay = rawRevenue > 0
    ? `$${rawRevenue >= 1_000_000 ? (rawRevenue / 1_000_000).toFixed(1) + "M" : rawRevenue.toLocaleString()}`
    : `$${(stats.totalRevenue || 0).toLocaleString()}`;

  // Vehicles: only show if field exists
  const rawVehicles = data.reduce((sum: number, c: any) => sum + (Number(c.vehicles) || 0), 0);
  const vehiclesDisplay = rawVehicles > 0 ? rawVehicles.toLocaleString() : "—";

  // Top country by bookings
  const topCountry = data.length > 0
    ? data.reduce((max: any, c: any) => (Number(c.bookings) || 0) > (Number(max.bookings) || 0) ? c : max, data[0])
    : null;
  const topCountryName = topCountry?.country || "N/A";

  const summaryStats = [
    { label: "Total Bookings", value: totalBookings.toLocaleString(), icon: TrendingUp, color: "text-blue-600",    bgColor: "bg-blue-50"    },
    { label: "Total Revenue",  value: revenueDisplay,                 icon: DollarSign,  color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { label: "Total Vehicles", value: vehiclesDisplay,                icon: Car,         color: "text-purple-600",  bgColor: "bg-purple-50"  },
    { label: "Top Country",    value: topCountryName,                 icon: MapPin,      color: "text-amber-600",   bgColor: "bg-amber-50"   },
  ];

  const barColors = [
    "bg-blue-500","bg-emerald-500","bg-amber-500","bg-red-500",
    "bg-purple-500","bg-pink-500","bg-cyan-500","bg-lime-500","bg-orange-500",
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm h-[420px] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary-50 p-2.5 rounded-xl">
            <MapPin className="text-primary-600" size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Countries Overview</h3>
            <p className="text-xs text-gray-400 mt-0.5">Bookings performance by country</p>
          </div>
        </div>
        <span className="shrink-0 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
          {data.length || "—"} Countries
        </span>
      </div>

      {/* Summary mini-cards */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {summaryStats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-3`}>
            <stat.icon className={stat.color} size={18} />
            <p className="text-sm sm:text-base font-bold text-gray-900 mt-2 truncate leading-tight" title={stat.value}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bookings list */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Bookings by Country</p>
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {data.length === 0 ? (
          <p className="text-xs text-gray-400 text-center pt-6">No data available</p>
        ) : (
          data.map((country: any, index: number) => {
            const pct = totalBookings > 0 ? (Number(country.bookings) / totalBookings) * 100 : 0;
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 truncate max-w-[60%]" title={country.country}>
                    {country.country}
                  </span>
                  <span className="shrink-0 text-gray-500 ml-1 text-xs">
                    {Number(country.bookings).toLocaleString()} ({pct.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`${barColors[index % barColors.length]} h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
