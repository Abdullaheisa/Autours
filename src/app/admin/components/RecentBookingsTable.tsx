"use client";

import { ArrowUpRight, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { recentBookings } from "@/lib/data";

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ComponentType<{size?: number, className?: string}> }> = {
  completed: { label: "Completed", color: "text-emerald-700", bgColor: "bg-emerald-50", icon: CheckCircle2 },
  active: { label: "Active", color: "text-blue-700", bgColor: "bg-blue-50", icon: Clock },
  pending: { label: "Pending", color: "text-amber-700", bgColor: "bg-amber-50", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-50", icon: XCircle },
};

export default function RecentBookingsTable() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Recent Bookings</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Latest rental transactions</p>
          </div>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors w-fit">
            View All <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Booking ID</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Customer</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 hidden sm:table-cell">Vehicle</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 hidden md:table-cell">Company</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 hidden lg:table-cell">Country</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Amount</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentBookings.map((booking) => {
              const status = statusConfig[booking.status];
              const StatusIcon = status.icon;
              return (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 sm:px-5 py-3"><span className="text-xs sm:text-sm font-mono font-medium text-gray-900">{booking.id}</span></td>
                  <td className="px-4 sm:px-5 py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary-700">{booking.customer.charAt(0)}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">{booking.customer}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-5 py-3 hidden sm:table-cell"><span className="text-xs sm:text-sm text-gray-600">{booking.vehicle}</span></td>
                  <td className="px-4 sm:px-5 py-3 hidden md:table-cell"><span className="text-xs sm:text-sm text-gray-600">{booking.company}</span></td>
                  <td className="px-4 sm:px-5 py-3 hidden lg:table-cell"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{booking.country}</span></td>
                  <td className="px-4 sm:px-5 py-3"><span className="text-xs sm:text-sm font-semibold text-gray-900">${booking.amount}</span></td>
                  <td className="px-4 sm:px-5 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                      <StatusIcon size={12} /><span className="hidden sm:inline">{status.label}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
