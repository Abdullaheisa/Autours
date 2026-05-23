"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { companyPerformance } from "@/lib/data";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function CompanyPerformanceChart() {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Company Performance</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Bookings distribution by company</p>
        </div>
        <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium w-fit">By Bookings</div>
      </div>
      <div className="h-[250px] sm:h-[300px] lg:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={companyPerformance} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="bookings" strokeWidth={0}>
              {companyPerformance.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", padding: "12px" }} formatter={(value: number, name: string) => [value.toLocaleString(), name]} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value: string) => <span className="text-xs text-gray-600">{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
