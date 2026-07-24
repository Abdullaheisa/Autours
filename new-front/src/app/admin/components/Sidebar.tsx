"use client";

import { useState } from "react";
import {
  LayoutDashboard, UserCircle, Building2, BookOpen, TrendingUp, Car, Upload,
  Grid3X3, Settings2, Crown, Users, CalendarCheck, Star, FileText, CheckCircle2,
  Mail, Palette, LogOut, ChevronLeft, ChevronRight, BarChart3, Gift, ListTree, Tag, ListChecks, ChevronDown
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Image from "next/image";
import { getLogoUrl } from "@/utils/getImageUrl";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, UserCircle, Building2, BookOpen, TrendingUp, Car, Upload,
  Grid3X3, Settings2, Crown, Users, CalendarCheck, Star, FileText, CheckCircle2,
  Mail, Palette, LogOut, BarChart3, Gift, ListTree, Tag, ListChecks
};

type SidebarEntry = 
  | { id: string; label: string; icon: string; children?: undefined }
  | { id: string; label: string; icon: string; children: { id: string; label: string; icon: string }[] };

// Exactly 22 items grouped strictly into logical functional domains
const adminSidebarStructure: SidebarEntry[] = [
  { id: "profile", label: "My Profile", icon: "UserCircle" },
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },

  // 1. Companies & Suppliers Function Group (Includes Memberships for supplier activation)
  {
    id: "companies_group",
    label: "Companies & Suppliers",
    icon: "Building2",
    children: [
      { id: "companies", label: "My Companies", icon: "Building2" },
      { id: "profit", label: "Profit Margin", icon: "TrendingUp" },
      { id: "supplier-intelligence", label: "Supplier Intelligence", icon: "BarChart3" },
      { id: "memberships", label: "Memberships", icon: "Crown" },
    ]
  },

  // 2. Rentals & Customers Function Group (Includes Customers who make bookings)
  {
    id: "rentals_group",
    label: "Rentals & Customers",
    icon: "CalendarCheck",
    children: [
      { id: "rentals", label: "Rentals", icon: "CalendarCheck" },
      { id: "bookings-calendar", label: "Bookings Calendar", icon: "CalendarCheck" },
      { id: "customers", label: "Customers", icon: "Users" },
      { id: "reviews", label: "Rental Reviews", icon: "Star" },
    ]
  },

  // 3. Vehicles Function Group
  {
    id: "vehicles_group",
    label: "Vehicles & Fleet",
    icon: "Car",
    children: [
      { id: "vehicles", label: "Vehicles Photos", icon: "Car" },
      { id: "bulk", label: "Vehicles Bulk Upload", icon: "Upload" },
      { id: "categories", label: "Categories", icon: "Grid3X3" },
      { id: "specs", label: "Specifications", icon: "Settings2" },
    ]
  },

  // 4. Inclusions & Promos Function Group
  {
    id: "inclusions_group",
    label: "Inclusions & Promos",
    icon: "CheckCircle2",
    children: [
      { id: "included", label: "What is included?", icon: "CheckCircle2" },
      { id: "bulk-inclusions", label: "Bulk Inclusions", icon: "ListChecks" },
      { id: "promos", label: "Promos", icon: "Tag" },
    ]
  },

  // 5. Marketing & Content Function Group
  {
    id: "content_group",
    label: "Marketing & Content",
    icon: "BookOpen",
    children: [
      { id: "blogs", label: "Blogs", icon: "BookOpen" },
      { id: "contest-popup", label: "Contest Control", icon: "Gift" },
      { id: "subscribers", label: "Subscribers", icon: "Mail" },
    ]
  },

  { id: "background", label: "Background Settings", icon: "Palette" },
  { id: "logout", label: "Sign Out", icon: "LogOut" },
];

interface SidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  items?: any;
}

export default function Sidebar({ activeItem, onItemClick, isOpen = false, onClose, items }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const filterAllowedChildren = (children: { id: string; label: string; icon: string }[]) => {
    if (!items || !Array.isArray(items)) return children;
    const allowedIds = new Set(items.map((i: any) => i.id));
    return children.filter((child) => allowedIds.has(child.id));
  };

  const isItemAllowed = (itemId: string) => {
    if (!items || !Array.isArray(items)) return true;
    return items.some((i: any) => i.id === itemId);
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    adminSidebarStructure.forEach((entry) => {
      if (entry.children) {
        const hasActive = entry.children.some((child) => child.id === activeItem);
        initial[entry.id] = hasActive;
      }
    });
    return initial;
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const avatarUrl = user?.avatar ? getLogoUrl(user.avatar) : null;

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "AU";

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
                <Image src={avatarUrl} alt={user?.name || "User"} width={isCollapsed ? 40 : 150} height={isCollapsed ? 40 : 45} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-primary flex items-center justify-center text-gray-900 font-bold ${isCollapsed ? "text-sm" : "text-base"}`}>
                  {initials}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="mt-1">
                <h1 className="text-base font-bold text-gray-900 tracking-tight leading-snug">{user?.name || "Autours Admin"}</h1>
                <p className="text-xs text-gray-500 mt-0.5">{user?.email || "admin@autours.net"}</p>
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
            {adminSidebarStructure.map((entry) => {
              // Dropdown Group
              if (entry.children) {
                const visibleChildren = filterAllowedChildren(entry.children);
                if (visibleChildren.length === 0) return null;

                const GroupIcon = iconMap[entry.icon];
                const isGroupOpen = !!openGroups[entry.id];
                const hasActiveChild = visibleChildren.some((child) => child.id === activeItem);

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
                        {visibleChildren.map((child) => {
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

              // Standalone Direct Item
              if (!isItemAllowed(entry.id)) return null;
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
          </ul>
        </nav>
      </aside>
    </>
  );
}
