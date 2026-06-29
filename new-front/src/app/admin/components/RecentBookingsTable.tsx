"use client";

import { Clock, CheckCircle2, XCircle, Globe, ShoppingBag, TrendingUp } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ComponentType<{size?: number, className?: string}> }> = {
  completed: { label: "Completed", color: "text-emerald-700", bgColor: "bg-emerald-50", icon: CheckCircle2 },
  active: { label: "Active", color: "text-blue-700", bgColor: "bg-blue-50", icon: Clock },
  pending: { label: "Pending", color: "text-amber-700", bgColor: "bg-amber-50", icon: Clock },
  cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-50", icon: XCircle },
};

export default function RecentBookingsTable() {
  const { rawData } = useSelector((state: RootState) => state.dashboard);
  const bookings = rawData?.recentBookings || [];
  const summary = rawData?.rentalSummaryStats || rawData?.rental_summary_stats;

  const totalRentals = summary?.total_rentals ?? bookings.length;
  const completedCount = summary?.completed_rentals ?? bookings.filter((b: any) => b.status === "completed").length;
  const activeCount = summary?.active_rentals ?? bookings.filter((b: any) => b.status === "active" || b.status === "pending").length;
  const cancelledCount = summary?.cancelled_rentals ?? bookings.filter((b: any) => b.status === "cancelled").length;
  const countriesCount = summary?.total_countries ?? (rawData?.bookingsByCountry?.length || 1);

  const completedPct = totalRentals > 0 ? Math.round((completedCount / totalRentals) * 100) : 0;
  const activePct = totalRentals > 0 ? Math.round((activeCount / totalRentals) * 100) : 0;
  const cancelledPct = totalRentals > 0 ? Math.round((cancelledCount / totalRentals) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm h-[420px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50 p-2.5 rounded-xl">
            <ShoppingBag className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Bookings Overview</h3>
            <p className="text-xs text-gray-400 mt-0.5">Rental statistics &amp; status</p>
          </div>
        </div>
        <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
          {totalRentals} Orders
        </span>
      </div>

      {/* Hero Mini-Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-emerald-50/70 rounded-xl p-2.5 text-center border border-emerald-100/60">
          <div className="flex items-center justify-center gap-1 mb-1 text-emerald-600">
            <CheckCircle2 size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Done</span>
          </div>
          <p className="text-lg font-extrabold text-gray-900">{completedCount}</p>
        </div>

        <div className="bg-blue-50/70 rounded-xl p-2.5 text-center border border-blue-100/60">
          <div className="flex items-center justify-center gap-1 mb-1 text-blue-600">
            <Clock size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Active</span>
          </div>
          <p className="text-lg font-extrabold text-gray-900">{activeCount}</p>
        </div>

        <div className="bg-red-50/70 rounded-xl p-2.5 text-center border border-red-100/60">
          <div className="flex items-center justify-center gap-1 mb-1 text-red-600">
            <XCircle size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Canceled</span>
          </div>
          <p className="text-lg font-extrabold text-gray-900">{cancelledCount}</p>
        </div>

        <div className="bg-amber-50/70 rounded-xl p-2.5 text-center border border-amber-100/60">
          <div className="flex items-center justify-center gap-1 mb-1 text-amber-600">
            <Globe size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Countries</span>
          </div>
          <p className="text-lg font-extrabold text-gray-900">{countriesCount}</p>
        </div>
      </div>

      {/* Status Bar Chart / Breakdown */}
      <div className="mb-3.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-1.5">
          <span>Status Distribution</span>
          <span className="text-gray-400 font-normal">{completedPct}% Completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 flex overflow-hidden">
          <div style={{ width: `${completedPct}%` }} className="bg-emerald-500 h-full transition-all" title={`Completed: ${completedPct}%`} />
          <div style={{ width: `${activePct}%` }} className="bg-blue-500 h-full transition-all" title={`Active: ${activePct}%`} />
          <div style={{ width: `${cancelledPct}%` }} className="bg-red-500 h-full transition-all" title={`Cancelled: ${cancelledPct}%`} />
        </div>
      </div>

      <div className="border-t border-gray-100 mb-2.5" />

      {/* Recent Transactions list */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
        <TrendingUp size={12} className="text-blue-500" /> Recent Transactions
      </p>

      <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {bookings.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No transactions found</p>
        ) : (
          bookings.map((booking: any) => {
            const status = statusConfig[booking.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const cleanVehicleName = booking.vehicle && !booking.vehicle.includes("ص") && !booking.vehicle.includes("ؤ") 
              ? booking.vehicle 
              : "Rental Car";

            return (
              <div
                key={booking.id}
                className="flex items-center justify-between bg-gray-50/70 hover:bg-gray-100/70 px-3 py-2 rounded-xl transition-colors gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {booking.customer ? booking.customer.charAt(0).toUpperCase() : "B"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-gray-900 truncate max-w-[110px]" title={booking.customer}>
                        {booking.customer}
                      </p>
                      <span className="text-[10px] font-mono bg-gray-200 text-gray-700 px-1 py-0.2 rounded shrink-0">
                        {booking.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {cleanVehicleName} • <span className="font-semibold text-gray-800">${booking.amount}</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${status.bgColor} ${status.color}`}>
                    <StatusIcon size={11} />
                    <span>{status.label}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
