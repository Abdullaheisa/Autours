"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Navbar from "@/components/shared/layout/Navbar";
import Footer from "@/components/shared/layout/Footer";
import CustomerBookings from "./sections/CustomerBookings";
import UserProfileInfo from "./sections/UserProfileInfo";
import { RootState, AppDispatch } from "@/store";
import { restoreAuth, logout } from "@/store/slices/authSlice";
import { LogOut, Car, User } from "lucide-react";

type Tab = "bookings" | "about";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [checked, setChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("bookings");

  useEffect(() => {
    dispatch(restoreAuth());
    setChecked(true);
  }, [dispatch]);

  useEffect(() => {
    if (checked && !isAuthenticated && !localStorage.getItem("token")) {
      router.replace("/login");
    }
  }, [checked, isAuthenticated, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "bookings",
      label: "My Bookings",
      icon: <Car size={16} />,
    },
    {
      id: "about",
      label: "My Profile",
      icon: <User size={16} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome
                {(() => {
                  if (!user?.name) return "";
                  const parts = user.name.trim().split(" ");
                  if (parts.length > 1 && (parts[0].toLowerCase() === "mr." || parts[0].toLowerCase() === "mrs.")) {
                    return `, ${parts[1]}`;
                  }
                  return `, ${parts[0]}`;
                })()}
              </h1>
              <p className="text-gray-500 mt-1">
                Manage your bookings and personal information.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 font-bold text-sm rounded-xl transition-all active:scale-95 shrink-0 self-start sm:self-auto shadow-sm"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm mb-8 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-[var(--primary)] text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 gap-8">
            {activeTab === "bookings" && <CustomerBookings />}
            {activeTab === "about" && <UserProfileInfo />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
