"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchDashboard } from "@/store/slices/dashboardSlice";

import StatsCards from "@/app/admin/components/StatsCards";
import BookingsByCountryChart from "@/app/admin/components/BookingsByCountryChart";
import MonthlyBookingsChart from "@/app/admin/components/MonthlyBookingsChart";
import TopVehiclesChart from "@/app/admin/components/TopVehiclesChart";
import CompanyPerformanceChart from "@/app/admin/components/CompanyPerformanceChart";
import RecentBookingsTable from "@/app/admin/components/RecentBookingsTable";
import CountriesOverview from "@/app/admin/components/CountriesOverview";
import CountryLocationsOverview from "@/app/admin/components/CountryLocationsOverview";
import VehicleCategoriesOverview from "@/app/admin/components/VehicleCategoriesOverview";

export default function DashboardOverview() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Row 1: KPI Stats Cards ── */}
      <StatsCards />

      {/* ── Row 2: Analytics Panels — 3 equal columns ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <CountryLocationsOverview />
        <VehicleCategoriesOverview />
        <CountriesOverview />
      </div>

      {/* ── Row 3: Monthly Trend (wide) + Company Performance (narrow) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <MonthlyBookingsChart />
        </div>
        <div className="xl:col-span-1">
          <CompanyPerformanceChart />
        </div>
      </div>

      {/* ── Row 4: 3 Side-by-Side Widgets — Top Vehicles, Bookings by Country, Recent Bookings ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <TopVehiclesChart />
        <BookingsByCountryChart />
        <RecentBookingsTable />
      </div>

    </div>
  );
}
