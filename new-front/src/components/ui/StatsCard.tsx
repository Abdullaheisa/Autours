"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { ReactNode } from "react";
import Card from "./Card";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  trend?: "up" | "down";
  color: "blue" | "emerald" | "amber" | "purple" | "red" | "cyan" | "pink" | "orange";
  className?: string;
}

const colorMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
  pink: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
};

export default function StatsCard({ label, value, icon, change, trend = "up", color, className }: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <Card className={`p-3 sm:p-4 border ${colors.border} ${className || ""}`} hover={false}>
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className={`p-2 sm:p-2.5 rounded-xl ${colors.bg}`}>
          <div className={colors.text}>{icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2 mb-0.5 truncate">
            {value !== undefined && value !== null ? value : 0}
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider truncate">{label}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
