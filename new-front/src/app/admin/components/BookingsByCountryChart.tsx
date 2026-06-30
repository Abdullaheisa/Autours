"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getCountryFlag, getCountryFullName } from "@/utils/countryUtils";
import { Maximize2, X } from "lucide-react";

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316"];

interface BookingsByCountryChartProps {
  isMaximized?: boolean;
  onMaximize?: () => void;
  onClose?: () => void;
}

export default function BookingsByCountryChart({ isMaximized = false, onMaximize, onClose }: BookingsByCountryChartProps) {
  const { rawData } = useSelector((state: RootState) => state.dashboard);
  const rawDataList = rawData?.bookingsByCountry || [];
  const data = rawDataList.map((item: any) => ({
    ...item,
    country: getCountryFullName(item.country),
    flag: getCountryFlag(item.country),
  }));

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 flex flex-col transition-all ${
      isMaximized ? 'h-full w-full border-none p-0 shadow-none' : 'p-5 shadow-sm h-[420px]'
    }`}>
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-base font-bold text-gray-900">Bookings by Country</h3>
          <p className="text-xs text-gray-400 mt-0.5">Total bookings across active countries</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
            {data.length} {data.length === 1 ? "Country" : "Countries"}
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
      <div className="flex-1 min-h-0 flex items-center justify-center">
        {data.length === 0 ? (
          <p className="text-sm text-gray-400">No country booking data available</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="country" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", padding: "12px" }} formatter={(value: number) => [value.toLocaleString(), "Bookings"]} />
              <Bar dataKey="bookings" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {data.map((entry: { country: string; bookings: number }, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
