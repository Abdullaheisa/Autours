"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { logout, updateUser } from "@/store/slices/authSlice";
import { authApi } from "@/services/api";
import { normalizeAuthRole } from "@/utils/auth";
import {
  LayoutDashboard, UserCircle, Building2, Car, PlusCircle,
  Tag, Crown, CalendarCheck, FileText, Star, Ticket,
  CreditCard, LogOut, ChevronLeft, ChevronRight, Calendar, ChevronDown
} from "lucide-react";

import Image from "next/image";
import { getUserImageUrl } from "@/utils/getImageUrl";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, UserCircle, Building2, Car, PlusCircle,
  Tag, Crown, CalendarCheck, FileText, Star, Ticket,
  CreditCard, LogOut, Calendar
};

type SidebarItem =
  | { id: string; label: string; icon: string; children?: undefined }
  | { id: string; label: string; icon: string; children: { id: string; label: string; icon: string }[] };

// 15 Total Supplier Items grouped strictly by functional domain
const companySidebarNav: SidebarItem[] = [
  { id: "profile", label: "My Profile", icon: "UserCircle" },
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },

  // 1. Branch & Company Settings Function Group
  {
    id: "company_settings_group",
    label: "Branch & Payment Settings",
    icon: "Building2",
    children: [
      { id: "branches", label: "Branches", icon: "Building2" },
      { id: "payment-methods", label: "Payment Methods", icon: "CreditCard" },
      { id: "promos", label: "Promos", icon: "Ticket" },
    ]
  },

  // 2. Vehicles Function Group
  {
    id: "vehicles_group",
    label: "Vehicles Management",
    icon: "Car",
    children: [
      { id: "vehicles", label: "My Vehicles", icon: "Car" },
      { id: "create-vehicle", label: "Create Vehicle", icon: "PlusCircle" },
      { id: "bulk-upload", label: "Bulk Upload", icon: "FileText" },
      { id: "price-list", label: "Price List", icon: "Tag" },
    ]
  },

  // 3. Rentals Function Group
  {
    id: "rentals_group",
    label: "Rentals & Bookings",
    icon: "CalendarCheck",
    children: [
      { id: "rentals", label: "Rentals List", icon: "CalendarCheck" },
      { id: "calendar", label: "Bookings Calendar", icon: "Calendar" },
      { id: "rental-terms", label: "Rental Terms", icon: "FileText" },
      { id: "rental-reviews", label: "Rental Reviews", icon: "Star" },
    ]
  },

  { id: "membership", label: "Membership", icon: "Crown" },
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

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    companySidebarNav.forEach((item) => {
      if (item.children) {
        const hasActive = item.children.some((child) => child.id === activeItem);
        initial[item.id] = hasActive;
      }
    });
    return initial;
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

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
                <Image src={avatarUrl} alt={user?.name || "Company"} width={isCollapsed ? 40 : 150} height={isCollapsed ? 40 : 45} className="w-full h-full object-cover" unoptimized />
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
            {companySidebarNav.map((entry) => {
              // Dropdown Group
              if (entry.children) {
                const GroupIcon = iconMap[entry.icon];
                const isGroupOpen = !!openGroups[entry.id];
                const hasActiveChild = entry.children.some((child) => child.id === activeItem);

                return (
                  <li key={entry.id} className="space-y-1 py-0.5">
                    <button
                      onClick={() => toggleGroup(entry.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group
                        ${hasActiveChild ? "bg-slate-200 text-slate-900 font-black" : "bg-slate-100/70 text-slate-700 hover:bg-slate-200 hover:text-slate-900"}`}
                    >
                      <div className="flex items-center gap-3">
                        {GroupIcon && <GroupIcon className="w-[18px] h-[18px] text-slate-600" />}
                        <span className={`${isCollapsed ? "lg:hidden" : "block"} truncate`}>
                          {entry.label}
                        </span>
                      </div>
                      {!isCollapsed && (
                        <ChevronDown
                          size={14}
                          className={`text-slate-400 transition-transform duration-200 ${isGroupOpen ? "rotate-180 text-primary-600" : ""}`}
                        />
                      )}
                    </button>

                    {/* Sub-items list */}
                    {(isGroupOpen || isCollapsed) && (
                      <ul className={`space-y-1 ${isCollapsed ? "" : "pl-4 border-l-2 border-slate-100 my-1"}`}>
                        {entry.children.map((child) => {
                          const ChildIcon = iconMap[child.icon];
                          const isChildActive = activeItem === child.id;

                          return (
                            <li key={child.id}>
                              <button
                                onClick={() => {
                                  onItemClick(child.id);
                                  onClose?.();
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 group relative
                                  ${isChildActive 
                                    ? "bg-primary text-gray-950 shadow-md shadow-primary/20" 
                                    : "bg-slate-100/40 text-slate-600 hover:bg-slate-200 hover:text-slate-900"}`}
                              >
                                {ChildIcon && <ChildIcon className={`w-4 h-4 shrink-0 ${isChildActive ? "text-gray-950" : "text-slate-400"}`} />}
                                <span className={`${isCollapsed ? "lg:hidden" : "block"} truncate`}>
                                  {child.label}
                                </span>
                                {isCollapsed && (
                                  <div className="hidden lg:block absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    {child.label}
                                  </div>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              // Direct Standalone Item
              const Icon = iconMap[entry.icon];
              const isActive = activeItem === entry.id;

              return (
                <li key={entry.id}>
                  <button
                    onClick={() => {
                      onItemClick(entry.id);
                      onClose?.();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                      ${isActive ? "bg-primary text-gray-900 shadow-lg shadow-primary/20 font-bold" : "bg-slate-100/70 text-gray-600 hover:bg-slate-200 hover:text-gray-900"}`}
                  >
                    {Icon && <Icon className={`w-[18px] h-[18px] ${isActive ? "text-gray-900" : ""}`} />}
                    <span className={`${isCollapsed ? "lg:hidden" : "block"} truncate`}>
                      {entry.label}
                    </span>
                    {isCollapsed && (
                      <div className="hidden lg:block absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {entry.label}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}

            {/* Standalone Sign Out Button */}
            <li className="pt-2 border-t border-slate-200/80">
              <button
                onClick={async () => {
                  try {
                    await authApi.logout();
                  } catch (e) {
                    console.error("Logout API failed:", e);
                  } finally {
                    dispatch(logout());
                    window.location.href = "/login";
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 bg-red-100/10 hover:bg-red-100/30 transition-all duration-200"
              >
                <LogOut className="w-[18px] h-[18px] shrink-0 text-red-500" />
                <span className={`${isCollapsed ? "lg:hidden" : "block"} truncate`}>
                  Sign Out
                </span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
