"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { logout, updateUser } from "@/store/slices/authSlice";
import { authApi } from "@/services/api";
import { normalizeAuthRole } from "@/utils/auth";
import {
  LayoutDashboard, UserCircle, Building2, Car, PlusCircle,
  Tag, Crown, CalendarCheck, FileText, Star, Ticket,
  CreditCard, LogOut, ChevronLeft, ChevronRight, Calendar
} from "lucide-react";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Image from "next/image";
import { getUserImageUrl } from "@/utils/getImageUrl";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, UserCircle, Building2, Car, PlusCircle,
  Tag, Crown, CalendarCheck, FileText, Star, Ticket,
  CreditCard, LogOut, Calendar
};


const companySidebarItems = [
  { id: "profile", label: "My Profile", icon: "UserCircle" },
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "calendar", label: "Bookings Calendar", icon: "CalendarCheck" },
  { id: "branches", label: "Branches", icon: "Building2" },
  { id: "payment-methods", label: "Payment Methods", icon: "CreditCard" },
  { id: "create-vehicle", label: "Create Vehicle", icon: "PlusCircle" },
  { id: "price-list", label: "Price List", icon: "Tag" },
  { id: "vehicles", label: "My Vehicles", icon: "Car" },
  { id: "bulk-upload", label: "Bulk Upload", icon: "FileText" },
  { id: "membership", label: "Membership", icon: "Crown" },
  { id: "rentals", label: "Rentals", icon: "CalendarCheck" },
  { id: "rental-terms", label: "Rental Terms", icon: "FileText" },
  { id: "promos", label: "Promos", icon: "Ticket" },
  { id: "rental-reviews", label: "Rental Reviews", icon: "Star" },
  { id: "logout", label: "Sign Out", icon: "LogOut" },
];

interface CompanySidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CompanySidebar({ activeItem, onItemClick, isOpen = false, onClose }: CompanySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      authApi.getUser()
        .then((res: any) => {
          if (res) {
            dispatch(updateUser({
              id: res.id?.toString() || '1',
              name: res.user_name || res.name || '',
              email: res.email || '',
              role: normalizeAuthRole(res.role || 'supplier'),
              status: res.role || 'supplier',
              avatar: res.logo || res.company_logo || res.photo || res.avatar || undefined,
              logo: res.logo || res.company_logo || res.photo || res.avatar || undefined,
            }));
          }
        })
        .catch((err) => console.warn("Failed to refresh user profile in sidebar:", err));
    }
  }, [dispatch]);

  const userAvatar = user?.logo || (user as any)?.company_logo || (user as any)?.photo || user?.avatar;
  const avatarUrl = userAvatar ? getUserImageUrl(userAvatar) : null;

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "CO";

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
          <div className={`flex ${isCollapsed ? "lg:justify-center lg:items-center" : "flex-col items-center text-center"} gap-3`}>
            <div className={`${isCollapsed ? "w-10 h-10" : "w-[150px] h-[45px]"} rounded-md overflow-hidden shadow-lg shadow-primary/20 shrink-0 relative bg-gray-50 flex items-center justify-center border border-gray-100 transition-all duration-300`}>
              {avatarUrl ? (
                <Image src={avatarUrl} alt={user?.name || "Company"} width={isCollapsed ? 40 : 150} height={isCollapsed ? 40 : 45} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-primary flex items-center justify-center text-gray-900 font-bold ${isCollapsed ? "text-sm" : "text-base"}`}>
                  {initials}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="mt-1">
                <h1 className="text-base font-bold text-gray-900 tracking-tight leading-snug">{user?.name || "Autours"}</h1>
                <p className="text-xs text-gray-500 mt-0.5">{user?.email || "company@autours.net"}</p>
              </div>
            )}
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
              const isActive = activeItem === item.id;
              const isLogout = item.id === "logout";
              return (
                <li key={item.id}>
                  <button
                    onClick={async () => {
                      if (isLogout) {
                        try {
                          await authApi.logout();
                        } catch (e) {
                          console.error("Logout API failed:", e);
                        } finally {
                          dispatch(logout()); // Safe clear of state, token, user
                          window.location.href = "/login";
                        }
                        return;
                      }
                      onItemClick(item.id);
                      onClose?.();
                    }}
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
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
