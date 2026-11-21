'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  Users, 
  BarChart3, 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  User, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function HoverExpandableLayout({
  children,
  currentRole = 'Customer',
  currentUser = { name: 'Prajjwal Sharma', email: 'prajjwal@1tapfix.com', role: 'Customer' },
  activeItemId = 'dashboard',
  onNavigate
}) {
  const [activeItem, setActiveItem] = useState(activeItemId);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3);

  // Primary Navigation Items
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      badge: null 
    },
    { 
      id: 'services', 
      label: 'Transactions History', 
      icon: Wrench, 
      badge: null 
    },
    { 
      id: 'bookings', 
      label: 'My Bookings', 
      icon: Calendar, 
      badge: '3 Active' 
    },
    { 
      id: 'partners', 
      label: 'Partners', 
      icon: Users, 
      badge: null 
    },
    { 
      id: 'pricing', 
      label: 'Plan And Pricing', 
      icon: BarChart3, 
      badge: null 
    },
    { 
      id: 'emergency', 
      label: 'Emergency Alert', 
      icon: AlertTriangle, 
      badge: '24/7',
      isEmergency: true 
    },
  ];

  // Secondary "Users / Contacts" Section (like in the reference image)
  const userContacts = [
    { id: 'u1', name: 'Jaylon Dias', role: 'Plumbing Specialist', initials: 'JD', bg: 'bg-indigo-600' },
    { id: 'u2', name: 'Mignon Heintz', role: 'HVAC Engineer', initials: 'MH', bg: 'bg-emerald-600' },
    { id: 'u3', name: 'Sarah Miller', role: 'Lead Electrician', initials: 'SM', bg: 'bg-blue-600', isSelected: true },
    { id: 'u4', name: 'Doug Walsh', role: 'Appliance Repair', initials: 'DW', bg: 'bg-amber-600' },
    { id: 'u5', name: 'Kallie Schneider', role: 'Carpentry Tech', initials: 'KS', bg: 'bg-rose-600' },
  ];

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    if (onNavigate) onNavigate(item);
    setIsMobileMenuOpen(false);
  };

  const isExpanded = isSidebarHovered || isMobileMenuOpen;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#0B2545] selection:text-white transition-colors duration-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. LEFT HOVER-EXPANDABLE SIDEBAR (Stuck directly to left edge)
             - Fixed left-0 top-0 bottom-0 h-screen
             - Before hover: Width = w-16 (64px), shows ONLY icons, centered!
             - After hover: Expands to w-64 (256px), shows icons + labels side-by-side
             - Floating overlay: Subtle shadow-2xl floats over content without shifting page!
         ───────────────────────────────────────────────────────────── */}
      
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`fixed left-0 top-0 bottom-0 h-screen z-50 bg-white dark:bg-black border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between overflow-x-hidden transition-[width,box-shadow,transform] duration-300 ease-in-out
          ${/* Collapsed (w-16) vs Expanded (w-64) */ ''}
          ${isExpanded ? 'w-64 shadow-2xl shadow-black/20 dark:shadow-black/80' : 'w-16 shadow-xs'}
          ${/* Mobile drawer behavior */ ''}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top: Brand Logo / Header inside the Sidebar (matches reference image) */}
        <div className="h-16 shrink-0 flex items-center px-3 border-b border-slate-100 dark:border-slate-800/80 overflow-hidden">
          <Link href="/" className="flex items-center gap-3 w-full">
            {/* Centered Logo Icon Badge (Anchored in the 64px width) */}
            <div className="w-10 h-10 rounded-xl bg-[#0B2545] dark:bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles size={20} className="text-emerald-400 dark:text-white" />
            </div>

            {/* Brand Title (Fades in when expanded) */}
            <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ease-in-out ${
              isExpanded ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
            }`}>
              <span className="text-base font-black tracking-tight text-[#0B2545] dark:text-white font-heading">
                1tapfix
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium leading-none">
                Home Web Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Scrollable Navigation Options */}
        <div className="flex-1 overflow-y-auto py-3 space-y-5 overflow-x-hidden scrollbar-none">
          
          {/* SECTION 1: MENU */}
          <div className="space-y-1 px-2">
            
            {/* "MENU" Section Label */}
            <div className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-opacity duration-200 ${
              isExpanded ? 'opacity-100 block' : 'opacity-0 h-2'
            }`}>
              {isExpanded ? 'Menu' : ''}
            </div>

            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  title={!isExpanded ? item.label : undefined}
                  className={`w-full group relative flex items-center h-11 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer overflow-hidden
                    ${
                      isActive
                        ? 'bg-[#0B2545] dark:bg-blue-600 text-white font-bold shadow-xs'
                        : item.isEmergency
                          ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  {/* Left Icon Container: Exactly 48px wide to be horizontally centered in 64px collapsed sidebar */}
                  <div className="w-12 h-11 shrink-0 flex items-center justify-center">
                    <IconComp 
                      size={20} 
                      className={`transition-transform duration-200 group-hover:scale-110 ${
                        isActive
                          ? 'text-white'
                          : item.isEmergency
                            ? 'text-rose-500 animate-pulse'
                            : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                      }`} 
                    />
                  </div>

                  {/* Full Text Label next to icon (Revealed side-by-side on hover) */}
                  <span
                    className={`ml-1 text-xs font-medium whitespace-nowrap transition-all duration-300 ease-in-out truncate ${
                      isExpanded
                        ? 'opacity-100 translate-x-0 w-auto'
                        : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Badge Pill (Only visible when expanded) */}
                  {item.badge && isExpanded && (
                    <span className={`ml-auto mr-2.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase transition-opacity duration-200 shrink-0 ${
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

          {/* SECTION 2: USERS / SPECIALISTS (Matches the reference image) */}
          <div className="space-y-1 px-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            
            {/* "USERS" Section Label */}
            <div className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-opacity duration-200 ${
              isExpanded ? 'opacity-100 block' : 'opacity-0 h-2'
            }`}>
              {isExpanded ? 'Users' : ''}
            </div>

            {userContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleItemClick({ id: contact.id, label: contact.name })}
                title={!isExpanded ? `${contact.name} (${contact.role})` : undefined}
                className={`w-full group relative flex items-center h-10 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer overflow-hidden
                  ${
                    contact.isSelected
                      ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                  }
                `}
              >
                {/* Circular Contact Avatar (Centered in collapsed 64px width) */}
                <div className="w-12 h-10 shrink-0 flex items-center justify-center">
                  <div className={`w-7 h-7 rounded-full ${contact.bg} text-white flex items-center justify-center text-[10px] font-bold shadow-2xs`}>
                    {contact.initials}
                  </div>
                </div>

                {/* Contact Full Name & Subtitle on Hover */}
                <div className={`ml-1 text-left whitespace-nowrap transition-all duration-300 ease-in-out truncate ${
                  isExpanded
                    ? 'opacity-100 translate-x-0 w-auto'
                    : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
                }`}>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {contact.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {contact.role}
                  </p>
                </div>
              </button>
            ))}

            {/* "See More" Button when expanded */}
            {isExpanded && (
              <div className="pt-1 px-3">
                <button className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer">
                  <span>See More</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Section: User Profile Avatar & Details (Matches reference image) */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center h-12 rounded-xl overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors p-1">
            
            {/* Centered User Avatar (Always visible in collapsed 64px width) */}
            <div className="w-12 h-10 shrink-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0B2545] to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>

            {/* User Name & Details on Hover */}
            <div className={`ml-1 text-left whitespace-nowrap transition-all duration-300 ease-in-out flex-1 truncate ${
              isExpanded
                ? 'opacity-100 translate-x-0 w-auto'
                : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
            }`}>
              <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate leading-tight">
                {currentUser.name}
              </h5>
              <p className="text-[10px] text-slate-400 font-semibold truncate">
                {currentUser.role || 'UI/UX Lead'}
              </p>
            </div>

            {/* Logout Shortcut on Hover */}
            {isExpanded && (
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

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA (Offset to the right of the collapsed sidebar)
             - Offset: md:pl-16 (64px) so content starts right next to collapsed sidebar
             - When sidebar expands to 256px on hover, it FLOATS OVER with shadow-2xl
               WITHOUT pushing or shifting the main content sideways!
         ───────────────────────────────────────────────────────────── */}
      <div className="md:pl-16 min-h-screen flex flex-col transition-all duration-300">
        
        {/* Top Header Bar inside the main content area */}
        <header className="sticky top-0 z-30 h-16 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
            
            {/* Left: Mobile hamburger toggle & title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <h2 className="text-lg font-bold text-[#0B2545] dark:text-white capitalize">
                {activeItem}
              </h2>
            </div>

            {/* Center: Search input */}
            <div className="hidden sm:flex items-center flex-1 max-w-sm mx-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search portal..."
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full pl-9 pr-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            {/* Right: Theme Toggle & Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              <button
                onClick={() => setNotificationsCount(0)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Notifications"
              >
                <Bell size={18} className="text-[#0B2545] dark:text-blue-400" />
                {notificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {notificationsCount}
                  </span>
                )}
              </button>

              <div className="w-8 h-8 rounded-full bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>

          </div>
        </header>

        {/* Main Page Canvas Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children ? (
            children
          ) : (
            /* Rich Interactive Showcase Content */
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Header Title Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    <span>Web Portal</span>
                    <ChevronRight size={12} />
                    <span className="capitalize">{activeItem}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] dark:text-white tracking-tight">
                    Left-Stuck Hover-Expandable Navigation
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Matches the attached reference UX: stuck to the left edge, icons-only by default, expands on hover as an overlay.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={14} />
                    <span>Active & Ready</span>
                  </span>

                  <button className="px-4 py-2 bg-[#0B2545] hover:bg-[#133A63] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2">
                    <span>Create New</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>

              {/* KPI Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Requests', value: '142 Jobs', change: '+12% this week', isPositive: true },
                  { label: 'Active Specialists', value: '28 Online', change: '5 available now', isPositive: true },
                  { label: 'Avg Rating', value: '4.9 / 5.0', change: 'Top tier service', isPositive: true },
                  { label: 'Avg Dispatch Latency', value: '18 Mins', change: 'Fast turnaround', isPositive: true },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card transition hover:shadow-md"
                  >
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-black text-[#0B2545] dark:text-white mt-1">
                      {stat.value}
                    </h3>
                    <p className={`text-[11px] font-bold mt-2 ${stat.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                      {stat.change}
                    </p>
                  </div>
                ))}
              </div>

              {/* Explanatory Cards */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
                <div className="flex items-center gap-2 text-[#0B2545] dark:text-blue-400 font-bold text-sm">
                  <Sparkles size={18} />
                  <span>Exact Reference Image Behavior Implemented</span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                    <p className="font-bold text-slate-900 dark:text-white">1. Stuck Directly to Left</p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      The sidebar is positioned with <code>fixed left-0 top-0 bottom-0 h-screen</code>, firmly attached to the leftmost screen boundary at all times.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                    <p className="font-bold text-slate-900 dark:text-white">2. Icons-Only Before Hover</p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      When the cursor is away, the sidebar remains at <code>w-16</code> (64px) showing only centered icons. All text labels are completely hidden.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                    <p className="font-bold text-slate-900 dark:text-white">3. Smooth Hover Overlay</p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Hovering smoothly expands the sidebar to <code>w-64</code> (256px) floating over the page with <code>shadow-2xl</code> without shifting the main content.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>

    </div>
  );
}
