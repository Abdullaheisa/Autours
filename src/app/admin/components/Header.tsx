"use client";

import { Search, X, Menu } from "lucide-react";
import { useState } from "react";
import NotificationBell from "@/app/admin/components/notifications/NotificationBell";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function Header({ title = "Dashboard", onMenuClick }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className={`${searchOpen ? "flex" : "hidden sm:flex"} items-center relative`}>
            <Search className="absolute left-3 text-gray-400 pointer-events-none" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-40 sm:w-60 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-200">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-xl flex items-center justify-center text-gray-900 font-bold text-xs sm:text-sm shadow-lg shadow-primary/20">
              AU
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
