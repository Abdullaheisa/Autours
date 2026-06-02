"use client";

import { useState, useEffect } from "react";
import CompanySidebar from "./components/CompanySidebar";
import CompanyHeader from "./components/CompanyHeader";

// Import all sections
import CompanyDashboardOverview from "./sections/dashboard/CompanyDashboardOverview";
import CompanyProfileSection from "./sections/profile/CompanyProfileSection";
import CompanyCalendarSection from "./sections/calendar/CompanyCalendarSection";
import BranchesSection from "./sections/branches/BranchesSection";
import PaymentMethodsSection from "./sections/payment-methods/PaymentMethodsSection";
import CreateVehicleSection from "./sections/create-vehicle/CreateVehicleSection";
import PriceListSection from "./sections/price-list/PriceListSection";
import MyVehiclesSection from "./sections/vehicles/MyVehiclesSection";
import CompanyMembershipSection from "./sections/membership/CompanyMembershipSection";
import CompanyRentalsSection from "./sections/rentals/CompanyRentalsSection";
import CompanyRentalTermsSection from "./sections/rental-terms/CompanyRentalTermsSection";
import PromosSection from "./sections/promos/PromosSection";
import CompanyRentalReviewsSection from "./sections/rental-reviews/CompanyRentalReviewsSection";
import CompanyBulkUploadSection from "./sections/bulk-upload/CompanyBulkUploadSection";
import EditVehicleSection from "./sections/create-vehicle/EditVehicleSection";
import NotificationsSection from "@/app/admin/sections/notifications/NotificationsSection";

const pageTitles: Record<string, string> = {
  profile: "My Profile",
  dashboard: "Dashboard",
  calendar: "Bookings Calendar",
  branches: "Branches",
  "payment-methods": "Payment Methods",
  "create-vehicle": "Create Vehicle",
  "price-list": "Price List",
  vehicles: "My Vehicles",
  membership: "Membership",
  rentals: "Rentals",
  "rental-terms": "Rental Terms",
  promos: "Promos",
  "rental-reviews": "Rental Reviews",
  "bulk-upload": "Bulk Upload",
  "edit-vehicle": "Edit Vehicle",
  notifications: "Notifications Workspace",
};

export default function CompanyDashboard() {
  const [activeItem, setActiveItem] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && pageTitles[tab]) {
        setActiveItem(tab);
        // Clear query parameters to keep the URL clean
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const tabId = (e as CustomEvent).detail;
      if (tabId && pageTitles[tabId]) {
        setActiveItem(tabId);
      }
    };
    window.addEventListener("switch-dashboard-tab", handleSwitchTab);
    return () => window.removeEventListener("switch-dashboard-tab", handleSwitchTab);
  }, []);

  const handleEditVehicle = (id: number) => {
    setEditVehicleId(id);
    setActiveItem("edit-vehicle");
  };

  const renderContent = () => {
    switch (activeItem) {
      case "profile":         return <CompanyProfileSection />;
      case "calendar":        return <CompanyCalendarSection />;
      case "branches":        return <BranchesSection />;
      case "payment-methods": return <PaymentMethodsSection />;
      case "create-vehicle":  return <CreateVehicleSection />;
      case "edit-vehicle":    return <EditVehicleSection vehicleId={editVehicleId!} onBack={() => setActiveItem("vehicles")} />;
      case "price-list":      return <PriceListSection />;
      case "vehicles":        return <MyVehiclesSection onEditVehicle={handleEditVehicle} onAddVehicle={() => setActiveItem("create-vehicle")} />;
      case "membership":      return <CompanyMembershipSection />;
      case "rentals":         return <CompanyRentalsSection />;
      case "rental-terms":    return <CompanyRentalTermsSection />;
      case "promos":          return <PromosSection />;
      case "rental-reviews":  return <CompanyRentalReviewsSection />;
      case "bulk-upload":     return <CompanyBulkUploadSection />;
      case "notifications":   return <NotificationsSection />;
      case "dashboard":
      default:                return <CompanyDashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CompanySidebar
        activeItem={activeItem}
        onItemClick={setActiveItem}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <CompanyHeader
          title={pageTitles[activeItem] || "Dashboard"}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
