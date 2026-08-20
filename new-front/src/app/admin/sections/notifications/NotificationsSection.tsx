"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Bell, BookOpen, CalendarCheck, Settings, Check, CheckCheck, 
  Search, X, Inbox, ArrowRight, Loader2
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { 
  fetchNotifications, 
  markNotificationRead, 
  markAllNotificationsRead 
} from "@/store/slices/notificationsSlice";
import { Notification } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import toast from "react-hot-toast";

function NotifTypeIcon({ type }: { type: Notification["type"] }) {
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    booking: { bg: "bg-blue-50 border-blue-200/60", text: "text-blue-600", icon: <CalendarCheck size={18} /> },
    blog: { bg: "bg-purple-50 border-purple-200/60", text: "text-purple-600", icon: <BookOpen size={18} /> },
    system: { bg: "bg-gray-50 border-gray-200/60", text: "text-gray-600", icon: <Settings size={18} /> },
  };
  const s = styles[type] || styles.system;
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm shadow-gray-100/30 ${s.bg} ${s.text}`}>
      {s.icon}
    </div>
  );
}

export default function NotificationsSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: allNotifications, loading } = useSelector((state: RootState) => state.notifications);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const stats = useMemo(() => {
    const list = allNotifications || [];
    const total = list.length;
    const unread = list.filter((n) => !n.isRead).length;
    const read = total - unread;
    return { total, unread, read };
  }, [allNotifications]);

  const filteredNotifications = useMemo(() => {
    let list = allNotifications || [];

    // Filter by Tab
    if (selectedTab === "unread") {
      list = list.filter((n) => !n.isRead);
    } else if (selectedTab === "read") {
      list = list.filter((n) => n.isRead);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) => 
          n.title.toLowerCase().includes(q) || 
          n.message.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allNotifications, selectedTab, searchQuery]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markNotificationRead(id));
    toast.success("Notification marked as read!");
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsRead());
    toast.success("All notifications marked as read!");
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.isRead) {
      dispatch(markNotificationRead(notif.id));
    }
    
    if (notif.targetUrl) {
      let tabId = "";
      if (notif.targetUrl.includes("requests")) {
        tabId = "memberships";
      } else if (notif.targetUrl.includes("rentals")) {
        tabId = "rentals";
      } else if (notif.targetUrl.includes("profit")) {
        tabId = "profit";
      }

      if (tabId) {
        window.dispatchEvent(new CustomEvent("switch-dashboard-tab", { detail: tabId }));
        const path = window.location.pathname;
        if (path.includes("admin") || path.includes("company")) {
          const newUrl = `${path}?tab=${tabId}`;
          window.history.replaceState({}, "", newUrl);
        }
      }
    }
  };

  return (
    <SectionLayout>
      <PageHeader
        title="Notifications Workspace"
        description="Monitor system events, bookings updates, and content reviews in real-time"
        showAction={false}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard 
          label="Total Notifications" 
          value={stats.total} 
          icon={<Bell size={20} />} 
          color="blue" 
        />
        <StatsCard 
          label="Unread Events" 
          value={stats.unread} 
          icon={<Inbox size={20} />} 
          color="amber" 
        />
        <StatsCard 
          label="Read Archive" 
          value={stats.read} 
          icon={<CheckCheck size={20} />} 
          color="emerald" 
        />
      </div>

      {/* Workspace Controls */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 self-start shrink-0">
            {(["all", "unread", "read"] as const).map((tab) => {
              const isActive = selectedTab === tab;
              const count = tab === "all" ? stats.total : tab === "unread" ? stats.unread : stats.read;
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-gray-900 shadow-md shadow-gray-200/50 border border-gray-100"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab}
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                    isActive ? "bg-primary-50 text-primary-700" : "bg-gray-100 text-gray-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Bulk Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-full transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md hover:bg-gray-200/60 transition-all"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary-500/10 active:scale-95 transition-all"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading && allNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 size={32} className="animate-spin text-primary-500" />
            <p className="text-sm font-medium">Synchronizing notification feeds...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/40 border border-dashed border-gray-200 rounded-2xl">
            <Bell size={40} className="mx-auto text-gray-300 mb-3" />
            <h4 className="text-sm font-bold text-gray-800">No events found</h4>
            <p className="text-xs text-gray-400 mt-1">Try clearing filters or search keyword</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const hasLink = !!notif.targetUrl;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                    hasLink ? "cursor-pointer" : ""
                  } ${
                    !notif.isRead
                      ? "bg-primary-50/10 border-primary-100 hover:bg-primary-50/20"
                      : "bg-white border-gray-100 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <NotifTypeIcon type={notif.type} />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold ${notif.isRead ? "text-gray-700" : "text-gray-900"}`}>
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {notif.timestamp}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {hasLink && (
                      <span className="text-[10px] font-bold text-primary-600 bg-primary-50 border border-primary-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all hover:bg-primary-100 hover:text-primary-700">
                        View Event
                        <ArrowRight size={10} />
                      </span>
                    )}

                    {!notif.isRead ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notif.id);
                        }}
                        className="p-1.5 bg-white hover:bg-gray-100 text-gray-500 hover:text-primary-600 border border-gray-200 rounded-lg transition-all"
                        title="Mark read"
                      >
                        <Check size={14} />
                      </button>
                    ) : (
                      <div className="p-1.5 text-emerald-600 flex items-center gap-1 text-[10px] font-bold">
                        <Check size={12} strokeWidth={3} />
                        Read
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionLayout>
  );
}
