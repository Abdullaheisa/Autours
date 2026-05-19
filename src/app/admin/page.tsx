"use client";

import { useState } from "react";
import { Sidebar, Header } from "@/app/admin/components";
import { DashboardOverviewPage, CompaniesPage, BlogsPage, BookingsCalendarPage, SupplierIntelligencePage } from "@/app/admin/pages";
import { features } from "@/config/features";

// Other sections still imported directly until page components are created
import ProfileSection from "@/app/admin/sections/profile/ProfileSection";
import ProfitMarginSection from "@/app/admin/sections/profit-margin/ProfitMarginSection";
import VehiclesPhotosSection from "@/app/admin/sections/vehicles-photos/VehiclesPhotosSection";
import VehiclesBulkUploadSection from "@/app/admin/sections/vehicles-bulk-upload/VehiclesBulkUploadSection";
import CategoriesSection from "@/app/admin/sections/categories/CategoriesSection";
import SpecificationsSection from "@/app/admin/sections/specifications/SpecificationsSection";
import MembershipsSection from "@/app/admin/sections/memberships/MembershipsSection";
import CustomersSection from "@/app/admin/sections/customers/CustomersSection";
import RentalsSection from "@/app/admin/sections/rentals/RentalsSection";
import RentalReviewsSection from "@/app/admin/sections/rental-reviews/RentalReviewsSection";
import RentalTermsSection from "@/app/admin/sections/rental-terms/RentalTermsSection";
import WhatIsIncludedSection from "@/app/admin/sections/what-is-included/WhatIsIncludedSection";
import SubscribersSection from "@/app/admin/sections/subscribers/SubscribersSection";
import ContestPopupControlPage from "@/app/admin/sections/contest-control/ContestPopupControlPage";
import BackgroundSettingsSection from "@/app/admin/sections/background-settings/BackgroundSettingsSection";
import LogoutSection from "@/app/admin/sections/logout/LogoutSection";
import { sidebarItems } from "@/lib/data";

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  "supplier-intelligence": "Supplier Intelligence",
  "bookings-calendar": "Bookings Calendar",
  profile: "My Profile",
  companies: "My Companies",
  blogs: "Blog Management",
  profit: "Profit Margin",
  vehicles: "Vehicles Photos",
  bulk: "Vehicles Bulk Upload",
  categories: "Categories",
  specs: "Specifications",
  memberships: "Memberships",
  customers: "Customers",
  rentals: "Rentals",
  reviews: "Rental Reviews",
  terms: "Rental Terms",
  included: "What is included?",
  subscribers: "Subscribers",
  "contest-popup": "Contest Campaign Control",
  background: "Background Settings",
  logout: "Sign Out",
};

/**
 * Map sidebar item IDs to their feature flag keys.
 * Items not listed here are always visible.
 */
const sidebarFeatureMap: Record<string, keyof typeof features> = {
  "supplier-intelligence": "supplierIntelligence",
  "bookings-calendar":    "bookingsCalendar",
  "contest-popup": "contestPopup",
};

export default function AdminDashboard() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🚩 Filter sidebar items: hide any item whose feature flag is disabled
  const visibleSidebarItems = sidebarItems.filter((item) => {
    const flagKey = sidebarFeatureMap[item.id];
    if (!flagKey) return true;           // no flag → always show
    return !!features[flagKey];          // only show if flag is truthy
  });

  const renderContent = () => {
    switch (activeItem) {
      case "profile":     return <ProfileSection />;
      case "companies":   return <CompaniesPage />;
      case "blogs":       return <BlogsPage />;
      case "profit":      return <ProfitMarginSection />;
      case "vehicles":    return <VehiclesPhotosSection />;
      case "bulk":        return <VehiclesBulkUploadSection />;
      case "categories":  return <CategoriesSection />;
      case "specs":       return <SpecificationsSection />;
      case "memberships": return <MembershipsSection />;
      case "customers":   return <CustomersSection />;
      case "rentals":     return <RentalsSection />;
      case "reviews":     return <RentalReviewsSection />;
      case "terms":       return <RentalTermsSection />;
      case "included":    return <WhatIsIncludedSection />;
      case "subscribers": return <SubscribersSection />;
      case "contest-popup": return <ContestPopupControlPage />;
      case "background":  return <BackgroundSettingsSection />;
      case "logout":      return <LogoutSection />;

      // 🚩 Feature-flagged modules — fall back to dashboard if disabled
      case "supplier-intelligence":
        return features.supplierIntelligence
          ? <SupplierIntelligencePage />
          : <DashboardOverviewPage />;

      case "bookings-calendar":
        return features.bookingsCalendar
          ? <BookingsCalendarPage />
          : <DashboardOverviewPage />;

      case "dashboard":
      default: return <DashboardOverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeItem={activeItem}
        onItemClick={setActiveItem}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={visibleSidebarItems}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
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

