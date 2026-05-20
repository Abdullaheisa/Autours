"use client";

import { useState } from "react";
import {
  LayoutDashboard, UserCircle, Building2, BookOpen, TrendingUp, Car, Upload,
  Grid3X3, Settings2, Crown, Users, CalendarCheck, Star, FileText, CheckCircle2,
  Mail, Palette, LogOut, ChevronLeft, ChevronRight, BarChart3, Gift
} from "lucide-react";
import { sidebarItems as defaultSidebarItems } from "@/lib/data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, UserCircle, Building2, BookOpen, TrendingUp, Car, Upload,
  Grid3X3, Settings2, Crown, Users, CalendarCheck, Star, FileText, CheckCircle2,
  Mail, Palette, LogOut, BarChart3, Gift
};

interface SidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  /** Pre-filtered list of sidebar items. Falls back to the full list when not provided. */
  items?: typeof defaultSidebarItems;
}

export default function Sidebar({ activeItem, onItemClick, isOpen = false, onClose, items }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const resolvedItems = items ?? defaultSidebarItems;

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
              <p className="text-xs text-gray-500">admin@autours.net</p>
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
            {resolvedItems.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = activeItem === item.id;
              const isLogout = item.id === "logout";
              return (
                <li key={item.id}>
                  <button
                    onClick={() => { onItemClick(item.id); onClose?.(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                      ${isActive ? "bg-primary text-gray-900 shadow-lg shadow-primary/20" : isLogout ? "text-red-500 hover:bg-red-50" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                  >
                    {Icon && <Icon  className={`w-[18px] h-[18px] ${isActive ? "text-gray-900" : ""}`} />}
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
