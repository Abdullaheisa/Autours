"use client";

import { Clock, CheckCircle2, XCircle, Globe, ShoppingBag, TrendingUp, Maximize2, X } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ComponentType<{size?: number, className?: string}> }> = {
  completed: { label: "Completed", color: "text-emerald-700", bgColor: "bg-emerald-50/60", icon: CheckCircle2 },
  active: { label: "Active", color: "text-blue-700", bgColor: "bg-blue-50/60", icon: Clock },
  pending: { label: "Pending", color: "text-amber-700", bgColor: "bg-amber-50/60", icon: Clock },
  cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-50/60", icon: XCircle },
};

interface RecentBookingsTableProps {
  isMaximized?: boolean;
  onMaximize?: () => void;
  onClose?: () => void;
}

export default function RecentBookingsTable({ isMaximized = false, onMaximize, onClose }: RecentBookingsTableProps) {
  const { rawData } = useSelector((state: RootState) => state.dashboard);
  const bookings = rawData?.recentBookings || [];
  const summary = rawData?.rentalSummaryStats || rawData?.rental_summary_stats;

  const totalRentals = summary?.total_rentals ?? bookings.length;
  const completedCount = summary?.completed_rentals ?? bookings.filter((b: any) => b.status === "completed").length;
  const activeCount = summary?.active_rentals ?? bookings.filter((b: any) => b.status === "active" || b.status === "pending").length;
  const cancelledCount = summary?.cancelled_rentals ?? bookings.filter((b: any) => b.status === "cancelled").length;
  
  // Real total countries from country locations stats (115 countries) instead of just countries with bookings
  const countriesCount = rawData?.countryLocationsStats?.total_countries || rawData?.country_locations_stats?.total_countries || summary?.total_countries || (rawData?.bookingsByCountry?.length || 1);

  const completedPct = totalRentals > 0 ? Math.round((completedCount / totalRentals) * 100) : 0;
  const activePct = totalRentals > 0 ? Math.round((activeCount / totalRentals) * 100) : 0;
  const cancelledPct = totalRentals > 0 ? Math.round((cancelledCount / totalRentals) * 100) : 0;

  return (
    <div className={`bg-white rounded-3xl border border-gray-200 flex flex-col transition-all ${
      isMaximized ? 'h-full w-full border-none p-0 shadow-none' : 'p-5 sm:p-6 shadow-xs h-[440px] hover:shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex items-center justify-center">
            <ShoppingBag className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Bookings Overview</h3>
            <p className="text-xs text-gray-400 mt-0.5">Rental statistics &amp; status</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-blue-100/50">
            {totalRentals} Orders
          </span>
          {isMaximized ? (
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors cursor-pointer" title="Close">
              <X size={16} />
            </button>
          ) : (
            onMaximize && (
              <button onClick={onMaximize} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors cursor-pointer" title="Maximize">
                <Maximize2 size={16} />
              </button>
            )
          )}
        </div>
      </div>

      {/* Hero Mini-Stats Grid - Fully Responsive (2 columns on mobile, 4 on tablet/desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="bg-emerald-50/40 rounded-2xl p-2.5 text-center border border-emerald-100/50 transition-colors hover:bg-emerald-50/60 flex flex-col items-center justify-center min-w-0">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-emerald-600 w-full">
            <CheckCircle2 size={12} className="shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider truncate">Done</span>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-gray-900 leading-none">{completedCount}</p>
        </div>

        <div className="bg-blue-50/40 rounded-2xl p-2.5 text-center border border-blue-100/50 transition-colors hover:bg-blue-50/60 flex flex-col items-center justify-center min-w-0">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-blue-600 w-full">
            <Clock size={12} className="shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider truncate">Active</span>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-gray-900 leading-none">{activeCount}</p>
        </div>

        <div className="bg-red-50/40 rounded-2xl p-2.5 text-center border border-red-100/50 transition-colors hover:bg-red-50/60 flex flex-col items-center justify-center min-w-0">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-red-600 w-full">
            <XCircle size={12} className="shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider truncate">Canceled</span>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-gray-900 leading-none">{cancelledCount}</p>
        </div>

        <div className="bg-amber-50/40 rounded-2xl p-2.5 text-center border border-amber-100/50 transition-colors hover:bg-amber-50/60 flex flex-col items-center justify-center min-w-0">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-amber-600 w-full">
            <Globe size={12} className="shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider truncate">Countries</span>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-gray-900 leading-none">{countriesCount}</p>
        </div>
      </div>

      {/* Status Bar Chart / Breakdown */}
      <div className="mb-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 mb-2">
          <span>Status Distribution</span>
          <span className="text-gray-400 font-normal">{completedPct}% Completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 flex overflow-hidden">
          <div style={{ width: `${completedPct}%` }} className="bg-emerald-500 h-full transition-all" title={`Completed: ${completedPct}%`} />
          <div style={{ width: `${activePct}%` }} className="bg-blue-500 h-full transition-all" title={`Active: ${activePct}%`} />
          <div style={{ width: `${cancelledPct}%` }} className="bg-red-500 h-full transition-all" title={`Cancelled: ${cancelledPct}%`} />
        </div>
      </div>

      <div className="border-t border-gray-100 mb-3" />

      {/* Recent Transactions list */}
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <TrendingUp size={12} className="text-blue-500" /> Recent Transactions
      </p>

      <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {bookings.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No transactions found</p>
        ) : (
          bookings.map((booking: any) => {
            const status = statusConfig[booking.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <div
                key={booking.id}
                className="flex items-center justify-between bg-gray-50/40 hover:bg-gray-50 border border-gray-100 hover:border-gray-200/80 px-3.5 py-3 rounded-2xl transition-all gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Booking ID - styled inside a bold code badge */}
                  <span className="text-[10px] font-bold font-mono bg-blue-50 border border-blue-100/50 text-blue-700 px-2.5 py-1 rounded-xl shrink-0">
                    {booking.id}
                  </span>

                  {/* Customer Name */}
                  <p className="text-xs font-bold text-gray-800 truncate" title={booking.customer}>
                    {booking.customer}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-current/10 ${status.bgColor} ${status.color}`}>
                    <StatusIcon size={10} />
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
