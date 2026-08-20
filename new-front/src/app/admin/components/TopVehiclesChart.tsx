"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Maximize2, X } from "lucide-react";

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"];

interface TopVehiclesChartProps {
  isMaximized?: boolean;
  onMaximize?: () => void;
  onClose?: () => void;
}

export default function TopVehiclesChart({ isMaximized = false, onMaximize, onClose }: TopVehiclesChartProps) {
  const { rawData } = useSelector((state: RootState) => state.dashboard);
  const vehiclesData = rawData?.topVehicles || [];
  const topVehicles = [...vehiclesData].sort((a: any, b: any) => b.bookings - a.bookings).slice(0, 8);

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 flex flex-col transition-all ${
      isMaximized ? 'h-full w-full border-none p-0 shadow-none' : 'p-5 shadow-sm h-[420px]'
    }`}>
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-base font-bold text-gray-900">Top Vehicles</h3>
          <p className="text-xs text-gray-400 mt-0.5">Most booked vehicles across fleet</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">Top 8</span>
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
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topVehicles} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} width={90} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", padding: "12px" }} formatter={(value: number) => [value.toLocaleString(), "Bookings"]} />
            <Bar dataKey="bookings" radius={[0, 6, 6, 0]} maxBarSize={20}>
              {topVehicles.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
