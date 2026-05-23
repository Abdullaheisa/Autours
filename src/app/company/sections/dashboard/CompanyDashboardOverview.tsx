"use client";

import { useMemo } from "react";
import { Building2, CalendarCheck, DollarSign, Car, TrendingUp } from "lucide-react";
import StatsGrid from "@/app/company/components/StatsGrid";
import { CompanyRecentBookingsTable, CompanyMonthlyBookingsChart, CompanyVehicleCards } from "@/app/company/components/CompanyDashboardComponents";
import { companies, recentBookings, vehiclesPhotos } from "@/lib/data";

const LOGGED_IN_COMPANY = "MAHD Rent";

export default function CompanyDashboardOverview() {
  const companyStats = useMemo(() => {
    const company = companies.find(c => c.name === LOGGED_IN_COMPANY);
    const bookings = recentBookings.filter(b => b.company === LOGGED_IN_COMPANY);
    const vehicles = vehiclesPhotos.filter(v => v.id <= 12); // Mocking company vehicles

    return [
      { 
        label: "Total Earnings", 
        value: company ? `$${(company.revenue / 1000).toFixed(1)}K` : "$0", 
        icon: <DollarSign size={20} />, 
        change: "+12%", 
        trend: "up" as const, 
        color: "emerald" as const 
      },
      { 
        label: "Total Rentals", 
        value: bookings.length * 12, // Mocking multiplier
        icon: <CalendarCheck size={20} />, 
        change: "+8%", 
        trend: "up" as const, 
        color: "blue" as const 
      },
      { 
        label: "My Vehicles", 
        value: 18, // Mocking
        icon: <Car size={20} />, 
        change: "+2", 
        trend: "up" as const, 
        color: "purple" as const 
      },
      { 
        label: "Avg. Rating", 
        value: company?.rating || "0.0", 
        icon: <Building2 size={20} />, 
        change: "+0.2", 
        trend: "up" as const, 
        color: "amber" as const 
      },
    ];
  }, []);

  return (
    <div className="space-y-6">
      <StatsGrid stats={companyStats} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CompanyMonthlyBookingsChart />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Earnings History</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Payment Received</p>
                    <p className="text-[10px] text-gray-500">May {10-i}, 2024</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-600">+$450.00</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <CompanyRecentBookingsTable />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Featured Vehicles</h3>
          <button className="text-sm text-primary-600 font-medium">View Fleet</button>
        </div>
        <CompanyVehicleCards />
      </div>
    </div>
  );
}
