"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Maximize2, X } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface CompanyPerformanceChartProps {
  isMaximized?: boolean;
  onMaximize?: () => void;
  onClose?: () => void;
}

export default function CompanyPerformanceChart({ isMaximized = false, onMaximize, onClose }: CompanyPerformanceChartProps) {
  const { rawData } = useSelector((state: RootState) => state.dashboard);
  const data = rawData?.companyPerformance || [];

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 flex flex-col transition-all ${
      isMaximized ? 'h-full w-full border-none p-0 shadow-none' : 'p-4 sm:p-5 lg:p-6 shadow-sm h-[400px]'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Company Performance</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Bookings distribution by company</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium w-fit">By Bookings</span>
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

      {/* Fixed height container for ResponsiveContainer to calculate layout correctly */}
      <div className="h-[280px] w-full relative flex items-center justify-center mt-auto">
        {data.length === 0 ? (
          <p className="text-sm text-gray-400">No company booking data available</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="bookings" strokeWidth={0}>
                {data.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", padding: "12px" }} formatter={(value: number, name: string) => [value.toLocaleString(), name]} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value: string) => <span className="text-xs text-gray-600">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
