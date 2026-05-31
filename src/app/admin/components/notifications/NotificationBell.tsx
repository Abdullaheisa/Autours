"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, BookOpen, CalendarCheck, Settings, Check, CheckCheck, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "@/store/slices/notificationsSlice";
import { Notification } from "@/types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function NotifIcon({ type }: { type: Notification["type"] }) {
  const styles: Record<string, { bg: string; icon: React.ReactNode }> = {
    booking: { bg: "bg-blue-100 text-blue-600", icon: <CalendarCheck size={14} /> },
    blog: { bg: "bg-purple-100 text-purple-600", icon: <BookOpen size={14} /> },
    system: { bg: "bg-gray-100 text-gray-600", icon: <Settings size={14} /> },
  };
  const s = styles[type] || styles.system;
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${s.bg}`}>
      {s.icon}
    </div>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const allNotifications = useSelector((state: RootState) => state.notifications.items) || [];
  const unreadCount = allNotifications.filter((n) => !n.isRead).length;
  // Header bell dropdown shows ONLY unread notifications
  const dropdownNotifications = allNotifications.filter((n) => !n.isRead);

  useEffect(() => {
    // Initial fetch
    dispatch(fetchNotifications());

    // Live update polling (every 5 seconds)
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleNotificationClick = (notif: Notification) => {
    dispatch(markNotificationRead(notif.id));
    
    // If it's a cancellation, show a gorgeous persistent toast notification details
    if (notif.title.toLowerCase().includes("cancel") || notif.id.includes("cancel")) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-bold text-sm">🚨 Booking Cancelled</span>
          <span className="text-xs text-gray-600">{notif.message}</span>
        </div>,
        { duration: 8000 }
      );
    } else {
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold text-sm">✨ {notif.title}</span>
          <span className="text-xs text-gray-600">{notif.message}</span>
        </div>,
        { duration: 4000 }
      );
    }

    if (notif.targetUrl) {
      // Map mock absolute route URLs to React sidebar tab IDs
      let tabId = "";
      if (notif.targetUrl.includes("requests")) {
        tabId = "memberships";
      } else if (notif.targetUrl.includes("rentals")) {
        tabId = "rentals";
      } else if (notif.targetUrl.includes("profit")) {
        tabId = "profit";
      }

      if (tabId) {
        // Dispatch custom event to switch tabs without reload
        window.dispatchEvent(new CustomEvent("switch-dashboard-tab", { detail: tabId }));
        
        // Update URL query parameters silently
        const path = window.location.pathname;
        if (path.includes("admin") || path.includes("company")) {
          const newUrl = `${path}?tab=${tabId}`;
          window.history.replaceState({}, "", newUrl);
        } else {
          // If the user is on a different page entirely, redirect using query params
          const targetDashboard = path.includes("company") ? "/company" : "/admin";
          router.push(`${targetDashboard}?tab=${tabId}`);
        }
      } else {
        // Fallback to standard router navigation if no mapping match
        router.push(notif.targetUrl);
      }
    }
    setOpen(false);
  };

  const markAllAsRead = () => {
    dispatch(markAllNotificationsRead());
    toast.success("All notifications marked as read!");
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/80 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 text-xs text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1 font-medium"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {dropdownNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400 font-medium">No new notifications</p>
              </div>
            ) : (
              dropdownNotifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors bg-primary-50/40"
                >
                  <NotifIcon type={notif.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-gray-900">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{notif.timestamp}</p>
                  </div>
                  <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                </button>
              ))
            )}
          </div>

          <div className="px-5 py-3 border-t border-gray-100">
            <button
              onClick={() => {
                const path = window.location.pathname;
                const targetDashboard = path.includes("company") ? "/company" : "/admin";
                window.dispatchEvent(new CustomEvent("switch-dashboard-tab", { detail: "notifications" }));
                if (path.includes("admin") || path.includes("company")) {
                  const newUrl = `${path}?tab=notifications`;
                  window.history.replaceState({}, "", newUrl);
                } else {
                  router.push(`${targetDashboard}?tab=notifications`);
                }
                setOpen(false);
              }}
              className="w-full text-center text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors py-1"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}

      {/* ── ALL NOTIFICATIONS HISTORY MODAL ────────────────────────────────────── */}
      {showAllModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">All Notifications</h3>
                <p className="text-xs text-gray-500 mt-0.5">View your complete notification history</p>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Modal List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[60vh]">
              {allNotifications.length === 0 ? (
                <div className="py-16 text-center">
                  <Bell size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
                </div>
              ) : (
                allNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 p-4 rounded-2xl transition-all border ${
                      !notif.isRead 
                        ? "bg-primary-50/30 border-primary-200/50" 
                        : "bg-gray-50/50 border-gray-100"
                    }`}
                  >
                    <NotifIcon type={notif.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-bold truncate ${notif.isRead ? "text-gray-700" : "text-gray-900"}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead ? (
                          <button
                            onClick={() => dispatch(markNotificationRead(notif.id))}
                            className="text-[10px] font-black text-primary-600 hover:text-primary-700 bg-white border border-primary-200 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                          >
                            Mark Read
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600 font-bold text-[10px] shrink-0">
                            <Check size={12} />
                            Read
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-semibold">{notif.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-3xl">
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    dispatch(markAllNotificationsRead());
                    toast.success("All notifications marked as read!");
                  }}
                  className="px-5 py-2.5 bg-yellow-400 text-gray-950 font-black text-xs uppercase tracking-wider hover:opacity-90 rounded-xl transition-all shadow-md active:scale-95"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setShowAllModal(false)}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 font-black text-xs uppercase tracking-wider hover:bg-gray-300 rounded-xl transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
