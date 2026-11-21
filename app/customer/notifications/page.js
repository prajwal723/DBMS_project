'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle,
  Clock,
  Wrench,
  AlertTriangle,
  Star,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "booking_created":
        return <Bell className="text-blue-600 dark:text-blue-400 shrink-0" size={22} />;
      case "technician_assigned":
        return <Wrench className="text-emerald-600 dark:text-emerald-400 shrink-0" size={22} />;
      case "technician_on_the_way":
        return <Clock className="text-amber-500 dark:text-amber-400 shrink-0" size={22} />;
      case "service_started":
        return <AlertTriangle className="text-indigo-500 dark:text-indigo-400 shrink-0" size={22} />;
      case "service_completed":
        return <CheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0" size={22} />;
      case "technician_arrived":
        return <AlertTriangle className="text-cyan-600 dark:text-cyan-400 shrink-0" size={22} />;
      case "booking_cancelled":
        return <AlertTriangle className="text-rose-600 dark:text-rose-400 shrink-0" size={22} />;
      default:
        return <Bell className="text-slate-500 shrink-0" size={22} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white flex items-center gap-3">
          <Bell className="text-blue-600 dark:text-blue-400" />
          Notifications
        </h1>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-12 text-center text-slate-500 dark:text-slate-400">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-12 text-center text-slate-500 dark:text-slate-400">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`rounded-2xl p-5 sm:p-6 border-l-4 cursor-pointer transition hover:shadow-card
                ${
                  notification.isRead
                    ? "bg-white dark:bg-slate-900 border-l-slate-300 dark:border-l-slate-700 border border-slate-200/80 dark:border-slate-800"
                    : "bg-blue-50/50 dark:bg-blue-950/30 border-l-blue-600 dark:border-l-blue-500 border border-blue-200/60 dark:border-blue-900/50 shadow-sm"
                }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4">
                  <div className="mt-0.5">{getIcon(notification.type)}</div>

                  <div>
                    <h2 className="font-bold text-base text-slate-900 dark:text-white">
                      {notification.title}
                    </h2>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {notification.message}
                    </p>

                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2.5">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                </div>

                {!notification.isRead && (
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5 shrink-0"></span>
                )}
              </div>

              {notification.type === "service_completed" && (
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <Link
                    href={`/customer/ratings?bookingId=${notification.bookingId}`}
                    className="inline-flex items-center gap-2 bg-[#0A2540] hover:bg-[#163B63] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
                  >
                    <Star size={16} />
                    Rate Now
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
