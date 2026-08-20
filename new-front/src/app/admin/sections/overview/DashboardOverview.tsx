"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboard());
    setMounted(true);
  }, [dispatch]);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeModal]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const renderComponent = (key: string, isMaximized = false) => {
    switch (key) {
      case "CountryLocationsOverview":
        return <CountryLocationsOverview isMaximized={isMaximized} onClose={() => setActiveModal(null)} />;
      case "VehicleCategoriesOverview":
        return <VehicleCategoriesOverview isMaximized={isMaximized} onClose={() => setActiveModal(null)} />;
      case "CountriesOverview":
        return <CountriesOverview isMaximized={isMaximized} onClose={() => setActiveModal(null)} />;
      case "MonthlyBookingsChart":
        return <MonthlyBookingsChart isMaximized={isMaximized} onClose={() => setActiveModal(null)} />;
      case "CompanyPerformanceChart":
        return <CompanyPerformanceChart isMaximized={isMaximized} onClose={() => setActiveModal(null)} />;
      case "TopVehiclesChart":
        return <TopVehiclesChart isMaximized={isMaximized} onClose={() => setActiveModal(null)} />;
      case "BookingsByCountryChart":
        return <BookingsByCountryChart isMaximized={isMaximized} onClose={() => setActiveModal(null)} />;
      case "RecentBookingsTable":
        return <RecentBookingsTable isMaximized={isMaximized} onClose={() => setActiveModal(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 relative">

      {/* ── Row 1: KPI Stats Cards ── */}
      <StatsCards />

      {/* ── Row 2: Analytics Panels — 3 equal columns ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <CountryLocationsOverview onMaximize={() => setActiveModal("CountryLocationsOverview")} />
        <VehicleCategoriesOverview onMaximize={() => setActiveModal("VehicleCategoriesOverview")} />
        <CountriesOverview onMaximize={() => setActiveModal("CountriesOverview")} />
      </div>

      {/* ── Row 3: Monthly Trend (wide) + Company Performance (narrow) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <MonthlyBookingsChart onMaximize={() => setActiveModal("MonthlyBookingsChart")} />
        </div>
        <div className="xl:col-span-1">
          <CompanyPerformanceChart onMaximize={() => setActiveModal("CompanyPerformanceChart")} />
        </div>
      </div>

      {/* ── Row 4: 3 Side-by-Side Widgets — Top Vehicles, Bookings by Country, Recent Bookings ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <TopVehiclesChart onMaximize={() => setActiveModal("TopVehiclesChart")} />
        <BookingsByCountryChart onMaximize={() => setActiveModal("BookingsByCountryChart")} />
        <RecentBookingsTable onMaximize={() => setActiveModal("RecentBookingsTable")} />
      </div>

      {/* ── Modal Overlay ── */}
      {activeModal && mounted && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 transition-all duration-300">
          {/* Backdrop Click Closes Modal */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveModal(null)} />
          
          <div className="bg-white rounded-[2rem] w-full max-w-5xl h-[85vh] p-6 sm:p-8 shadow-2xl relative z-10 flex flex-col border border-gray-100 transform transition-transform scale-100">
            <div className="flex-1 overflow-y-auto min-h-0">
              {renderComponent(activeModal, true)}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
