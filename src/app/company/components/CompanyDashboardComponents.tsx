"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { monthlyBookings, recentBookings, vehiclesPhotos } from "@/lib/data";
import { getVehicleImageUrl } from "@/utils/getImageUrl";

const LOGGED_IN_COMPANY = "MAHD Rent"; // Based on company name in data.ts

const mapStatus = (statusId: any) => {
  const id = Number(statusId);
  if (id === 7) return "completed";
  if (id === 2) return "active";
  if (id === 3 || id === 5) return "cancelled";
  return "pending"; // 1, 4, 6
};

// Filtered Recent Bookings Table
export function CompanyRecentBookingsTable({ bookings }: { bookings?: any[] }) {
  const filteredBookings = useMemo(() => {
    if (bookings) {
      return bookings.map((b: any) => ({
        id: b.order_number || `BK-${b.id}`,
        customer: b.customer?.name || "Unknown Customer",
        vehicle: b.vehicle?.name || `${b.vehicle?.brand || ""} ${b.vehicle?.model || ""}`.trim() || "Unknown Vehicle",
        amount: Number(b.price || b.supplier_price || 0),
        status: mapStatus(b.order_status),
      }));
    }
    return recentBookings.filter(b => b.company === LOGGED_IN_COMPANY);
  }, [bookings]);

  const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    completed: { label: "Completed", color: "text-emerald-700", bgColor: "bg-emerald-50", icon: CheckCircle2 },
    active: { label: "Active", color: "text-blue-700", bgColor: "bg-blue-50", icon: Clock },
    pending: { label: "Pending", color: "text-amber-700", bgColor: "bg-amber-50", icon: AlertCircle },
    cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-50", icon: XCircle },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Recent Transactions</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Your latest rental transactions</p>
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
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Vehicle</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Amount</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm font-medium bg-gray-50/10">
                  No recent transactions found.
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking, idx) => {
                const status = statusConfig[booking.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <tr key={booking.id || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 sm:px-5 py-3 font-mono text-sm font-medium text-gray-900">{booking.id}</td>
                    <td className="px-4 sm:px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary-700">{booking.customer.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{booking.customer}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-sm text-gray-600">{booking.vehicle}</td>
                    <td className="px-4 sm:px-5 py-3 text-sm font-semibold text-gray-900">${booking.amount}</td>
                    <td className="px-4 sm:px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                        <StatusIcon size={12} />{status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Filtered Monthly Bookings Chart
export function CompanyMonthlyBookingsChart({ data }: { data?: any }) {
  const chartData = useMemo(() => {
    if (data && (data.done || data.cancelled)) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthNames.map((name, index) => {
        const monthStr = String(index + 1).padStart(2, '0');
        const doneItem = (data.done || []).find((d: any) => d.month === monthStr);
        const cancelItem = (data.cancelled || []).find((c: any) => c.month === monthStr);
        const doneCount = doneItem ? Number(doneItem.count || 0) : 0;
        const cancelCount = cancelItem ? Number(cancelItem.count || 0) : 0;
        return {
          month: name,
          bookings: doneCount + cancelCount,
        };
      });
    }
    return monthlyBookings.map(d => ({ ...d, bookings: Math.floor(d.bookings * 0.15) }));
  }, [data]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Sales Overview</h3>
        <p className="text-sm text-gray-500">Monthly booking trend for {LOGGED_IN_COMPANY}</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="companyColorBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#companyColorBookings)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Company Vehicle Cards
export function CompanyVehicleCards({ vehicles }: { vehicles?: any[] }) {
  const displayVehicles = useMemo(() => {
    if (vehicles && vehicles.length > 0) {
      return vehicles.map((v: any) => ({
        id: v.id,
        name: v.name || `${v.brand || ""} ${v.model || ""}`.trim() || "Unknown Vehicle",
        category: v.category?.name || v.category || "Car",
        image: v.photo ? getVehicleImageUrl(v.photo) : (v.image || "/images/car-placeholder.png"),
        price: v.final_price || v.price || 45,
        available: v.activation ? "Available" : "Unavailable",
      }));
    }
    return vehiclesPhotos.slice(0, 4).map(v => ({
      id: v.id,
      name: v.name,
      category: v.category,
      image: v.image,
      price: 45,
      available: "Available"
    }));
  }, [vehicles]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayVehicles.map((vehicle) => (
        <div key={vehicle.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group">
          <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 flex items-center justify-center">
            {vehicle.image && (
              <img 
                src={vehicle.image} 
                alt={vehicle.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                onError={(e) => { (e.target as HTMLImageElement).src = "/images/car-placeholder.png"; }}
              />
            )}
            <div className="absolute top-2 right-2">
              <span className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-lg text-gray-700 uppercase tracking-wider">{vehicle.category}</span>
            </div>
          </div>
          <div className="p-4">
            <h4 className="font-bold text-gray-900 truncate">{vehicle.name}</h4>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-primary-600 font-bold text-sm">${vehicle.price}/day</span>
              <span className={`text-[10px] font-bold uppercase ${vehicle.available === "Available" ? "text-emerald-600" : "text-gray-500"}`}>{vehicle.available}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
