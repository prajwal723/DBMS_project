'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function checkUnread() {
      try {
        const res = await fetch('/api/notifications?unreadOnly=true');
        const data = await res.json();
        if (isMounted && data.success) {
          setCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.warn('Error fetching notification count:', err);
      }
    }

    checkUnread();
    const interval = setInterval(checkUnread, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link
      href="/customer/notifications"
      className="relative text-[#0A2540] dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      title="Notifications"
    >
      <Bell size={24} />

      {count > 0 && (
        <span
          className="absolute -top-2 -right-2
          bg-red-600 text-white rounded-full
          text-xs w-5 h-5 flex items-center
          justify-center border-2 border-white dark:border-slate-900"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
