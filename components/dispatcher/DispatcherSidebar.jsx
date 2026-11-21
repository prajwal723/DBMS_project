'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  MapPin, 
  Plus, 
  Sparkles,
  LogOut,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

export default function DispatcherSidebar({
  activeTab,
  setActiveTab,
  unassignedCount = 0,
  activeJobsCount = 0,
  liveTechsCount = 0,
  dispatcherStatus = 'Available',
  setDispatcherStatus,
  onOpenNewRequest,
  showToast
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'requests',
      label: 'Service Requests',
      icon: ClipboardList,
      badge: unassignedCount > 0 ? `${unassignedCount}` : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'technicians',
      label: 'Tech Roster',
      icon: Users,
      badge: liveTechsCount > 0 ? `${liveTechsCount}` : null,
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'map',
      label: 'Live Fleet Map',
      icon: MapPin,
      badge: 'LIVE',
      badgeColor: 'bg-blue-600 text-white animate-pulse'
    }
  ];

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 bottom-0 h-screen z-40 bg-white dark:bg-black border-r border-slate-200/80 dark:border-slate-800 hidden md:flex flex-col justify-between overflow-x-hidden transition-[width,box-shadow] duration-300 ease-in-out antialiased ${
        isHovered ? 'w-64 shadow-2xl shadow-black/20 dark:shadow-black/80' : 'w-16 shadow-xs'
      }`}
    >
      {/* Top: Logo Header */}
      <div>
        <div className="h-16 shrink-0 flex items-center px-3 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
          <Link href="/dispatcher" className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B2545] to-[#134074] dark:from-blue-600 dark:to-cyan-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles size={20} className="text-emerald-400 dark:text-white" />
            </div>

            <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ease-in-out ${
              isHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
            }`}>
              <span className="text-base font-black tracking-tight text-[#0B2545] dark:text-white font-heading">
                1tapfix
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider leading-none">
                Dispatcher Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Action Button: New Dispatch */}
        <div className="p-2 pt-3">
          <button
            onClick={onOpenNewRequest}
            title={!isHovered ? "New Dispatch" : undefined}
            className={`w-full flex items-center h-10 rounded-xl bg-[#0B2545] hover:bg-[#133A63] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer overflow-hidden ${
              isHovered ? 'px-3' : 'justify-center'
            }`}
          >
            <div className="w-12 h-10 shrink-0 flex items-center justify-center">
              <Plus size={18} />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
            }`}>
              New Dispatch
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-2 space-y-1">
          <div className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-opacity duration-200 ${
            isHovered ? 'opacity-100 block' : 'opacity-0 h-1'
          }`}>
            {isHovered ? 'Operations' : ''}
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
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-[#0B2545] dark:hover:text-white'
                }`}
              >
                {/* Centered Icon Container in 64px width */}
                <div className="w-12 h-11 shrink-0 flex items-center justify-center">
                  <IconComp className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive 
                      ? 'text-emerald-400 dark:text-white' 
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-[#0B2545] dark:group-hover:text-white'
                  }`} />
                </div>

                <span className={`ml-1 text-xs font-medium whitespace-nowrap transition-all duration-300 ease-in-out truncate ${
                  isHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
                }`}>
                  {item.label}
                </span>

                {item.badge && isHovered && (
                  <span className={`ml-auto mr-2.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Duty Status & Dispatcher Profile */}
      <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
        
        {/* Status Switcher (revealed when expanded) */}
        {isHovered && (
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl p-2.5 space-y-1 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500">
                Station Duty
              </span>
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Change <ChevronDown size={11} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                dispatcherStatus === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`} />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {dispatcherStatus}
              </span>
            </div>

            {showStatusMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50">
                {['Available', 'Busy', 'Offline'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setDispatcherStatus(st);
                      setShowStatusMenu(false);
                      if (showToast) showToast(`Dispatcher status set to ${st}`);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    ● {st}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Card */}
        <div className="flex items-center h-12 rounded-xl overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors p-1">
          <div className="w-12 h-10 shrink-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              DP
            </div>
          </div>

          <div className={`ml-1 text-left whitespace-nowrap transition-all duration-300 ease-in-out flex-1 truncate ${
            isHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
          }`}>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              Central Dispatch
            </h5>
            <p className="text-[10px] text-slate-400 font-semibold truncate">
              Mangaluru Node
            </p>
          </div>

          {isHovered && (
            <Link
              href="/"
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0"
            >
              <LogOut size={16} />
            </Link>
          )}
        </div>
      </div>

    </aside>
  );
}
