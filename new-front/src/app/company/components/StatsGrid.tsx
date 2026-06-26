"use client";

import StatsCard from "@/components/ui/StatsCard";

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  trend?: "up" | "down";
  color: "blue" | "emerald" | "amber" | "purple" | "red" | "cyan" | "pink" | "orange";
}

interface StatsGridProps {
  stats: StatItem[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const total = stats.length;
  
  let gridCols = "grid-cols-2";
  if (total === 2) {
    gridCols += " sm:grid-cols-2";
  } else if (total === 3) {
    gridCols += " sm:grid-cols-3";
  } else if (total === 4) {
    gridCols += " sm:grid-cols-2 lg:grid-cols-4";
  } else if (total === 5) {
    gridCols += " sm:grid-cols-3 lg:grid-cols-5";
  } else {
    gridCols += " sm:grid-cols-3 lg:grid-cols-4";
  }

  return (
    <div className={`grid ${gridCols} gap-3 sm:gap-4 mb-8`}>
      {stats.map((stat, idx) => {
        const isLast = idx === total - 1;
        const isOdd = total % 2 !== 0;
        let cardClass = "";

        if (isLast && isOdd) {
          if (total === 3) {
            cardClass = "col-span-2 sm:col-span-1";
          } else if (total === 5) {
            cardClass = "col-span-2 sm:col-span-1 lg:col-span-1";
          } else {
            cardClass = "col-span-2 sm:col-span-1";
          }
        }

        return (
          <StatsCard 
            key={idx} 
            {...stat} 
            className={cardClass}
          />
        );
      })}
    </div>
  );
}
