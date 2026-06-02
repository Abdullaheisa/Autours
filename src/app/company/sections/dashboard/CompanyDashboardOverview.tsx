"use client";

import { useMemo } from "react";
import { Building2, CalendarCheck, DollarSign, Car, TrendingUp } from "lucide-react";
import StatsGrid from "@/app/company/components/StatsGrid";
import { CompanyRecentBookingsTable, CompanyMonthlyBookingsChart, CompanyVehicleCards } from "@/app/company/components/CompanyDashboardComponents";
import { useState, useEffect } from "react";
import { dashboardApi } from "@/services/api";
import { companies, recentBookings, vehiclesPhotos } from "@/lib/data";

const LOGGED_IN_COMPANY = "MAHD Rent";

export default function CompanyDashboardOverview() {
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    // Trigger schema dump and db info generation on backend
    fetch('/api/backend/test_schema.php').catch(() => {});

    dashboardApi.getSupplier().then((res: any) => {
      const charts = res?.data || {};
      

      const vehicles = charts.debug_total_vehicles_in_db;
      const supplierRevenue = charts.supplierRevenue || [];
      const NumberOfActiveVehicles = charts.NumberOfActiveVehicles || {};
      const numberOfRentalsMonthly = charts.numberOfRentalsMonthly || {};
      
      const totalEarnings = charts.real_total_earnings !== undefined ? Number(charts.real_total_earnings) : supplierRevenue.reduce((acc: number, curr: any) => acc + Number(curr.profit || 0), 0);
      const totalRentals = charts.real_total_rentals !== undefined ? Number(charts.real_total_rentals) : (numberOfRentalsMonthly.done || []).reduce((acc: number, curr: any) => acc + Number(curr.count || 0), 0);
      const totalVehicles = charts.real_total_vehicles !== undefined ? Number(charts.real_total_vehicles) : ((NumberOfActiveVehicles.currentYear?.[0]?.count) || 
                            (NumberOfActiveVehicles.monthly || []).reduce((acc: number, curr: any) => acc + Number(curr.count || 0), 0) || 0);
      const rating = charts.real_avg_rating !== undefined ? String(charts.real_avg_rating) : "4.8";

      setStatsData({
        totalEarnings: totalEarnings.toLocaleString(),
        totalRentals: totalRentals.toLocaleString(),
        totalVehicles: totalVehicles.toLocaleString(),
        rating: rating,
        customerTransactions: charts.customerTransactions || [],
        numberOfRentalsMonthly: numberOfRentalsMonthly,
        latestVehicles: charts.latestVehicles || []
      });
    }).catch((err) => {
      if (err?.response?.status !== 401) {
        console.warn("Using mock data due to API error:", err.message);
      }
      setStatsData({
        totalEarnings: "0",
        totalRentals: "0",
        totalVehicles: "0",
        rating: "0",
        customerTransactions: [],
        numberOfRentalsMonthly: null,
        latestVehicles: []
      });
    });
  }, []);

  const companyStats = useMemo(() => {
    const data = statsData || {};
    return [
      { 
        label: "Total Earnings", 
        value: data.totalEarnings ? `$${data.totalEarnings}` : "$0", 
        icon: <DollarSign size={20} />, 
        change: "+0%", 
        trend: "up" as const, 
        color: "emerald" as const 
      },
      { 
        label: "Total Rentals", 
        value: data.totalRentals || 0,
        icon: <CalendarCheck size={20} />, 
        change: "+0%", 
        trend: "up" as const, 
        color: "blue" as const 
      },
      { 
        label: "My Vehicles", 
        value: data.debug_total_vehicles_in_db|| 0,
        icon: <Car size={20} />, 
        change: "+0", 
        trend: "up" as const, 
        color: "purple" as const 
      },
      { 
        label: "Avg. Rating", 
        value: data.rating || "0.0", 
        icon: <Building2 size={20} />, 
        change: "+0.0", 
        trend: "up" as const, 
        color: "amber" as const 
      },
    ];
  }, [statsData]);

  return (
    <div className="space-y-6">
      <StatsGrid stats={companyStats} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CompanyMonthlyBookingsChart data={statsData?.numberOfRentalsMonthly} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Earnings History</h3>
          <div className="space-y-4">
            {(!statsData || !statsData.customerTransactions || statsData.customerTransactions.length === 0) ? (
              <div className="text-center py-8 text-gray-400 text-sm">No recent transactions</div>
            ) : (
              statsData.customerTransactions.slice(0, 5).map((rental: any) => (
                <div key={rental.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100/60 transition-colors">
                  <div className="flex items-center gap-3">

                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {rental.order_number ? `Booking ${rental.order_number}` : "Payment Received"}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {rental.created_at ? new Date(rental.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    +${parseFloat(rental.price || 0).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <CompanyRecentBookingsTable bookings={statsData?.customerTransactions} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Featured Vehicles</h3>
          <button className="text-sm text-primary-600 font-medium">View Fleet</button>
        </div>
        <CompanyVehicleCards vehicles={statsData?.latestVehicles} />
      </div>
    </div>
  );
}
