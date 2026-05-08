"use client";

import { useState } from "react";
import CompanySidebar from "./components/CompanySidebar";
import CompanyHeader from "./components/CompanyHeader";
import { usePathname } from "next/navigation";
import { SearchProvider } from "./context/SearchContext";

const pageTitles: Record<string, string> = {
  "/company": "Dashboard",
  "/company/profile": "My Profile",
  "/company/branches": "Branches",
  "/company/payment-methods": "Payment Methods",
  "/company/create-vehicle": "Create Vehicle",
  "/company/price-list": "Price List",
  "/company/vehicles": "My Vehicles",
  "/company/membership": "Membership",
  "/company/rentals": "Rentals",
  "/company/rental-terms": "Rental Terms",
  "/company/promos": "Promos",
  "/company/rental-reviews": "Rental Reviews",
};

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <SearchProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <CompanySidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <CompanyHeader 
            title={pageTitles[pathname] || "Dashboard"} 
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
