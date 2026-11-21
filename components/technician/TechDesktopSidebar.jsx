'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Briefcase, 
  AlertTriangle, 
  TrendingUp, 
  User, 
  Sparkles,
  ShieldCheck,
  LogOut,
  Layers
} from 'lucide-react';

export default function TechDesktopSidebar({ 
  activeTab, 
  setActiveTab, 
  availability, 
  onToggleAvailability,
  pendingCount = 4,
  emergencyCount = 1,
  maxDailyCapacity = 6,
  onOpenAuth,
  currentUser
}) {
  const [isHovered, setIsHovered] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'jobs', label: 'Assigned Jobs', icon: Briefcase, badge: pendingCount > 0 ? `${pendingCount}` : null },
    { id: 'emergency', label: 'Emergency Alerts', icon: AlertTriangle, badge: emergencyCount > 0 ? 'LIVE' : null, isEmergency: true },
    { id: 'performance', label: 'Earnings & Metrics', icon: TrendingUp, badge: null },
    { id: 'profile', label: 'Profile & Settings', icon: User, badge: null }
  ];

  const isCapacityFull = pendingCount >= maxDailyCapacity;

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 bottom-0 h-screen z-40 bg-white dark:bg-black border-r border-slate-200/80 dark:border-slate-800 hidden md:flex flex-col justify-between overflow-x-hidden transition-[width,box-shadow] duration-300 ease-in-out antialiased ${
        isHovered ? 'w-64 shadow-2xl shadow-black/20 dark:shadow-black/80' : 'w-16 shadow-xs'
      }`}
    >
      {/* Top: Logo Header inside Sidebar */}
      <div>
        <div className="h-16 shrink-0 flex items-center px-3 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
          <Link href="/technician" className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B2545] to-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles size={20} className="text-emerald-400 dark:text-white" />
            </div>

            <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ease-in-out ${
              isHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
            }`}>
              <span className="text-base font-black tracking-tight text-[#0B2545] dark:text-white font-heading">
                1tapfix Pro
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider leading-none">
                Technician Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="p-2 space-y-1">
          <div className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-opacity duration-200 ${
            isHovered ? 'opacity-100 block' : 'opacity-0 h-1'
          }`}>
            {isHovered ? 'Menu' : ''}
          </div>

          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={!isHovered ? item.label : undefined}
                className={`w-full group relative flex items-center h-11 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer overflow-hidden ${
                  isActive 
                    ? 'bg-[#0B2545] dark:bg-blue-600 text-white shadow-xs font-bold' 
                    : item.isEmergency 
                      ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-[#0B2545] dark:hover:text-white'
                }`}
              >
                {/* Centered Icon in 64px width */}
                <div className="w-12 h-11 shrink-0 flex items-center justify-center">
                  <IconComp className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive 
                      ? 'text-emerald-400 dark:text-white' 
                      : item.isEmergency 
                        ? 'text-rose-500' 
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-[#0B2545] dark:group-hover:text-white'
                  }`} />
                </div>

                {/* Text Label revealed on hover */}
                <span className={`ml-1 text-xs font-medium whitespace-nowrap transition-all duration-300 ease-in-out truncate ${
                  isHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
                }`}>
                  {item.label}
                </span>

                {item.badge && isHovered && (
                  <span className={`ml-auto mr-2.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    item.isEmergency 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : isActive 
                        ? 'bg-emerald-400 text-[#0B2545]' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Duty Status & Capacity Gauge */}
      <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
        
        {/* Daily Capacity Meter (revealed when expanded) */}
        {isHovered && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-800 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Daily Capacity
              </span>
              <span className={isCapacityFull ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-slate-700 dark:text-slate-200'}>
                {pendingCount} / {maxDailyCapacity}
              </span>
            </div>
            
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                style={{ width: `${Math.min(100, (pendingCount / maxDailyCapacity) * 100)}%` }} 
                className={`h-full transition-all duration-300 ${
                  isCapacityFull ? 'bg-rose-500' : pendingCount >= 4 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
              />
            </div>
          </div>
        )}

        {/* User Card & Duty Status */}
        <div className="flex items-center h-12 rounded-xl overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors p-1">
          {/* Centered Avatar in 64px width */}
          <div className="w-12 h-10 shrink-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#134074] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'T'}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-black ${
                availability === 'ONLINE' || availability === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </div>
          </div>

          <div className={`ml-1 text-left whitespace-nowrap transition-all duration-300 ease-in-out flex-1 truncate ${
            isHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
          }`}>
            <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate leading-tight">
              {currentUser?.name || "Alex Vance"}
            </h5>
            <p className="text-[10px] text-slate-400 font-semibold truncate">
              {currentUser?.specialization || "Technician"} • {availability}
            </p>
          </div>

          {isHovered && (
            <button 
              onClick={() => onOpenAuth && onOpenAuth('login')}
              title="Profile / Duty"
              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </aside>
  );
}
