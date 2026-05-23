"use client";

import { useState } from "react";
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

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  profile: "My Profile",
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
};

export default function CompanyDashboard() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeItem) {
      case "profile":         return <CompanyProfileSection />;
      case "calendar":        return <CompanyCalendarSection />;
      case "branches":        return <BranchesSection />;
      case "payment-methods": return <PaymentMethodsSection />;
      case "create-vehicle":  return <CreateVehicleSection />;
      case "price-list":      return <PriceListSection />;
      case "vehicles":        return <MyVehiclesSection />;
      case "membership":      return <CompanyMembershipSection />;
      case "rentals":         return <CompanyRentalsSection />;
      case "rental-terms":    return <CompanyRentalTermsSection />;
      case "promos":          return <PromosSection />;
      case "rental-reviews":  return <CompanyRentalReviewsSection />;
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
