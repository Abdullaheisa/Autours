"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, UserCircle, Building2, Car, PlusCircle, 
  Tag, Crown, CalendarCheck, FileText, Star, Ticket, 
  CreditCard, LogOut, ChevronLeft, ChevronRight
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, UserCircle, Building2, Car, PlusCircle, 
  Tag, Crown, CalendarCheck, FileText, Star, Ticket, 
  CreditCard, LogOut
};

const companySidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", href: "/company" },
  { id: "profile", label: "My Profile", icon: "UserCircle", href: "/company/profile" },
  { id: "branches", label: "Branches", icon: "Building2", href: "/company/branches" },
  { id: "payment-methods", label: "Payment Methods", icon: "CreditCard", href: "/company/payment-methods" },
  { id: "create-vehicle", label: "Create Vehicle", icon: "PlusCircle", href: "/company/create-vehicle" },
  { id: "price-list", label: "Price List", icon: "Tag", href: "/company/price-list" },
  { id: "vehicles", label: "My Vehicles", icon: "Car", href: "/company/vehicles" },
  { id: "membership", label: "Membership", icon: "Crown", href: "/company/membership" },
  { id: "rentals", label: "Rentals", icon: "CalendarCheck", href: "/company/rentals" },
  { id: "rental-terms", label: "Rental Terms", icon: "FileText", href: "/company/rental-terms" },
  { id: "promos", label: "Promos", icon: "Ticket", href: "/company/promos" },
  { id: "rental-reviews", label: "Rental Reviews", icon: "Star", href: "/company/rental-reviews" },
  { id: "logout", label: "Sign Out", icon: "LogOut", href: "/" },
];

interface CompanySidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CompanySidebar({ isOpen = false, onClose }: CompanySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm" onClick={onClose} />
      )}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-40
        transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20 w-72" : "w-72"}
      `}>
        <div className="p-6 border-b border-gray-100">
          <div className={`flex items-center gap-3 ${isCollapsed ? "lg:justify-center" : ""}`}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <Car className="text-gray-900" size={22} />
            </div>
            <div className={`${isCollapsed ? "lg:hidden" : "block"}`}>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Autours</h1>
              <p className="text-xs text-gray-500">company@autours.net</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-primary text-gray-900 rounded-full items-center justify-center shadow-md hover:bg-primary-600 transition-colors z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
          <ul className="space-y-1">
            {companySidebarItems.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = pathname === item.href;
              const isLogout = item.id === "logout";
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => { onClose?.(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                      ${isActive ? "bg-primary text-gray-900 shadow-lg shadow-primary/20" : isLogout ? "text-red-500 hover:bg-red-50" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                  >
                    {Icon && <Icon className={`w-[18px] h-[18px] ${isActive ? "text-gray-900" : ""}`} />}
                    <span className={`${isCollapsed ? "lg:hidden" : "block"} truncate`}>{item.label}</span>
                    {isCollapsed && (
                      <div className="hidden lg:block absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center gap-3 ${isCollapsed ? "lg:justify-center" : ""}`}>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
              <UserCircle size={18} className="text-gray-500" />
            </div>
            <div className={`${isCollapsed ? "lg:hidden" : "block"}`}>
              <p className="text-sm font-medium text-gray-900">Company User</p>
              <p className="text-xs text-gray-500">Branch Manager</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
