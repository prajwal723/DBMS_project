'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  Bell, 
  User, 
  Star,
  LogOut,
  Zap,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function CustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const navItems = [
    { 
      label: 'Dashboard', 
      href: '/customer', 
      icon: LayoutDashboard,
      isActive: pathname === '/customer'
    },
    { 
      label: 'Book Service', 
      href: '/customer/servlist', 
      icon: Wrench,
      isActive: pathname.startsWith('/customer/servlist') || pathname === '/customer/services'
    },
    { 
      label: 'My Bookings', 
      href: '/customer/bookings', 
      icon: Calendar,
      isActive: pathname.startsWith('/customer/bookings')
    },
    { 
      label: 'Emergency Alert', 
      href: '/customer/emergency', 
      icon: AlertTriangle,
      badge: '24/7',
      isEmergency: true,
      isActive: pathname.startsWith('/customer/emergency')
    },
    { 
      label: 'Notifications', 
      href: '/customer/notifications', 
      icon: Bell,
      isActive: pathname.startsWith('/customer/notifications')
    },
  ];

  const secondaryNavItems = [
    { 
      label: 'Profile & Address', 
      href: '/customer/profile', 
      icon: User,
      isActive: pathname.startsWith('/customer/profile')
    },
    { 
      label: 'Reviews & Ratings', 
      href: '/customer/ratings', 
      icon: Star,
      isActive: pathname.startsWith('/customer/ratings')
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 bottom-0 h-screen z-40 bg-white dark:bg-black border-r border-slate-200/80 dark:border-slate-800 hidden md:flex flex-col justify-between overflow-x-hidden transition-[width,box-shadow] duration-300 ease-in-out ${
        isHovered ? 'w-64 shadow-2xl shadow-black/20 dark:shadow-black/80' : 'w-16 shadow-xs'
      }`}
    >
      {/* Top Section: Logo Header inside Sidebar */}
      <div>
        {/* Brand Logo Header */}
        <div className="h-16 shrink-0 flex items-center px-3 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
          <Link href="/customer" className="flex items-center gap-3 w-full">
            {/* Centered Logo Badge in 64px width */}
            <div className="w-10 h-10 rounded-xl bg-[#0B2545] dark:bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles size={20} className="text-emerald-400 dark:text-white" />
            </div>

            {/* Brand Title (revealed on hover) */}
            <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ease-in-out ${
              isHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
            }`}>
              <span className="text-base font-black tracking-tight text-[#0B2545] dark:text-white font-heading">
                1tapfix
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-none">
                Customer Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Section 1: MENU Items */}
        <div className="p-2 space-y-1">
          <div className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-opacity duration-200 ${
            isHovered ? 'opacity-100 block' : 'opacity-0 h-1'
          }`}>
            {isHovered ? 'Menu' : ''}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isHovered ? item.label : undefined}
                className={`group relative flex items-center h-11 rounded-xl text-xs font-semibold transition-all duration-200 overflow-hidden ${
                  active
                    ? 'bg-[#0B2545] dark:bg-blue-600 text-white shadow-xs font-bold'
                    : item.isEmergency
                      ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-[#0B2545] dark:hover:text-white'
                }`}
              >
                {/* Fixed Center-Icon Box (Centered in 64px width) */}
                <div className="w-12 h-11 shrink-0 flex items-center justify-center">
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    active 
                      ? 'text-emerald-400 dark:text-white' 
                      : item.isEmergency 
                        ? 'text-rose-500 animate-pulse' 
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-[#0B2545] dark:group-hover:text-white'
                  }`} />
                </div>

                {/* Text Label on hover */}
                <span className={`ml-1 text-xs font-medium whitespace-nowrap transition-all duration-300 ease-in-out truncate ${
                  isHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
                }`}>
                  {item.label}
                </span>

                {item.badge && isHovered && (
                  <span className="ml-auto mr-2.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500 text-white animate-pulse shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Section 2: ACCOUNT Items */}
        <div className="p-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <div className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-opacity duration-200 ${
            isHovered ? 'opacity-100 block' : 'opacity-0 h-1'
          }`}>
            {isHovered ? 'Account' : ''}
          </div>

          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isHovered ? item.label : undefined}
                className={`group relative flex items-center h-10 rounded-xl text-xs font-semibold transition-all duration-200 overflow-hidden ${
                  active
                    ? 'bg-[#0B2545] dark:bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-[#0B2545] dark:hover:text-white'
                }`}
              >
                <div className="w-12 h-10 shrink-0 flex items-center justify-center">
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    active 
                      ? 'text-emerald-400 dark:text-white' 
                      : 'text-slate-400 group-hover:text-[#0B2545] dark:group-hover:text-white'
                  }`} />
                </div>

                <span className={`ml-1 text-xs font-medium whitespace-nowrap transition-all duration-300 ease-in-out truncate ${
                  isHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom User Avatar Section */}
      <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        
        {/* Emergency Assistance card (only visible on hover) */}
        {isHovered && (
          <div className="mb-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
              <Zap size={14} className="text-amber-500 shrink-0" />
              <span>Need Urgent Fix?</span>
            </div>
            <Link
              href="/customer/emergency"
              className="block w-full py-1 text-center text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
            >
              24/7 Priority Dispatch
            </Link>
          </div>
        )}

        {/* User Avatar + Profile / Logout */}
        <div className="flex items-center h-12 rounded-xl overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors p-1">
          {/* Centered Avatar (Anchored in 64px width) */}
          <div className="w-12 h-10 shrink-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0B2545] to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              C
            </div>
          </div>

          <div className={`ml-1 text-left whitespace-nowrap transition-all duration-300 ease-in-out flex-1 truncate ${
            isHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
          }`}>
            <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate leading-tight">
              Customer Account
            </h5>
            <p className="text-[10px] text-slate-400 font-semibold truncate">
              Verified User
            </p>
          </div>

          {isHovered && (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

    </aside>
  );
}
