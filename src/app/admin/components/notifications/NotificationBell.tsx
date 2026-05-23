"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, BookOpen, CalendarCheck, Settings, Check, CheckCheck, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { markLocalRead, markAllLocalRead } from "@/store/slices/notificationsSlice";
import { Notification } from "@/types";

function NotifIcon({ type }: { type: Notification["type"] }) {
  const styles: Record<string, { bg: string; icon: React.ReactNode }> = {
    booking: { bg: "bg-blue-100 text-blue-600", icon: <CalendarCheck size={14} /> },
    blog: { bg: "bg-purple-100 text-purple-600", icon: <BookOpen size={14} /> },
    system: { bg: "bg-gray-100 text-gray-600", icon: <Settings size={14} /> },
  };
  const s = styles[type];
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${s.bg}`}>
      {s.icon}
    </div>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((state: RootState) => state.notifications.items);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => dispatch(markLocalRead(id));
  const markAllAsRead = () => dispatch(markAllLocalRead());

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
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400 font-medium">No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors ${
                    !notif.isRead ? "bg-primary-50/40" : ""
                  }`}
                >
                  <NotifIcon type={notif.type} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${notif.isRead ? "text-gray-600" : "text-gray-900"}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{notif.timestamp}</p>
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                  )}
                  {notif.isRead && (
                    <Check size={14} className="text-gray-300 mt-0.5 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100">
              <button className="w-full text-center text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors py-1">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
