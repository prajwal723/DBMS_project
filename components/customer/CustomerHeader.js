'use client';

import Link from 'next/link';
import { User, LogOut, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NotificationWatcher from "./NotificationWatcher";
import ThemeToggle from "../ThemeToggle";
import { useEffect, useState } from 'react';

export default function CustomerHeader() {
  const router = useRouter();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchUnreadCount() {
      try {
        const res = await fetch('/api/notifications?unreadOnly=true');
        const data = await res.json();
        if (isMounted && data.success) {
          setNotificationCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.warn('Error fetching notification count:', err);
      }
    }

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <NotificationWatcher />

      <header className="sticky top-0 z-30 h-20 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/customer"
            className="flex items-center overflow-visible py-1"
          >
            <img
              src="/assets/images/logo.png"
              alt="1tapfix Logo"
              className="h-14 sm:h-16 w-auto object-contain scale-125 origin-left transition-transform hover:scale-110 dark:invert"
            />
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <ThemeToggle />

            {/* Notifications */}
            <button
              onClick={() => router.push('/customer/notifications')}
              className="relative flex items-center justify-center w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              aria-label="View Notifications"
            >
              <Bell size={20} className="text-[#0B2545] dark:text-blue-400" />

              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[11px] flex items-center justify-center font-semibold">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              onClick={() => router.push('/customer/profile')}
              className="flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0B2545] dark:text-slate-200 text-xs sm:text-sm font-semibold transition"
            >
              <User size={16} />
              <span className="hidden sm:inline">Profile</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#133A63] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition shadow-xs"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
