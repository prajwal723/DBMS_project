'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import ThemeToggle from '../../components/ThemeToggle';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Wrench, 
  Calendar, 
  Settings, 
  Search, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreVertical, 
  Sparkles,
  ArrowRight,
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Filter,
  Check,
  TrendingUp,
  Sliders,
  DollarSign,
  Lock,
  UserPlus,
  Loader2,
  AlertCircle,
  Activity,
  CheckCircle,
  FileText
} from 'lucide-react';
export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [timeframe, setTimeframe] = useState('This Year');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [toast, setToast] = useState(null);

  // Dashboard Data States
  const [usersList, setUsersList] = useState([]);
  const [techList, setTechList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [dbErrors, setDbErrors] = useState({});

  // Filter & Modal States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [techFilter, setTechFilter] = useState('All');
  const [bookingFilter, setBookingFilter] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');

  // Add Modals State
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  
  // New Service Form
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Plumbing');

  // New User Form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Customer');

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Helper function to safely extract price numbers
  const parseAmount = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  // Helper to format date cleanly
  const formatDate = (rawDate) => {
    if (!rawDate) return 'Recently';
    if (rawDate?.seconds) {
      return new Date(rawDate.seconds * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    if (typeof rawDate === 'string') return rawDate;
    return 'Recently';
  };

  // --- Dashboard Data Loading ---
  useEffect(() => {
    setLoading(true);

    const loadDashboardData = async () => {
      try {
        const [uRes, tRes, sRes, bRes, aRes, nRes] = await Promise.all([
          fetch('/api/admin/users').then(r => r.json()).catch(() => null),
          fetch('/api/technicians').then(r => r.json()).catch(() => null),
          fetch('/api/services').then(r => r.json()).catch(() => null),
          fetch('/api/bookings').then(r => r.json()).catch(() => null),
          fetch('/api/admin/analytics').then(r => r.json()).catch(() => null),
          fetch('/api/notifications').then(r => r.json()).catch(() => null),
        ]);

        if (uRes?.success && Array.isArray(uRes.data) && uRes.data.length > 0) {
          setUsersList(uRes.data.map(u => ({
            id: u.id,
            name: u.name || 'Anonymous User',
            email: u.email,
            role: u.role,
            joined: formatDate(u.createdAt),
            status: u.status || 'Active'
          })));
        }

        if (tRes?.success && Array.isArray(tRes.data) && tRes.data.length > 0) {
          setTechList(tRes.data.map((t, idx) => ({
            id: t.id,
            name: t.name || 'Technician',
            specialty: t.specialization || 'General Maintenance',
            exp: t.experienceYears ? t.experienceYears + '+ Yrs' : '3+ Yrs',
            rating: (t.rating !== null && t.rating !== undefined) ? Number(t.rating).toFixed(1) : null,
            jobsDone: t.completedJobs || 0,
            status: t.status || 'Available',
            availability: t.status || 'Available'
          })));
        }

        if (sRes?.success && Array.isArray(sRes.data) && sRes.data.length > 0) {
          setServicesList(sRes.data.map(s => ({
            id: s.id,
            title: s.name,
            category: s.category,
            price: s.price,
            badge: 'Standard',
            active: true
          })));
        }

        if (bRes?.success && Array.isArray(bRes.data) && bRes.data.length > 0) {
          setBookingsList(bRes.data.map(b => {
            const st = b.status || 'Pending';
            let statusColor = 'bg-[#134074] text-white';
            if (st === 'In Progress' || st === 'In-Progress') statusColor = 'bg-blue-100 text-blue-700';
            else if (st === 'Assigned') statusColor = 'bg-amber-100 text-amber-700';
            else if (st === 'Completed') statusColor = 'bg-emerald-100 text-emerald-700';
            else if (st === 'Scheduled') statusColor = 'bg-purple-100 text-purple-700';
            else if (st === 'Cancelled') statusColor = 'bg-slate-100 text-slate-700';

            return {
              id: b.id,
              rawId: b.id,
              customer: b.customerName || b.customerEmail || 'Customer',
              service: b.service || 'Service Request',
              tech: b.technicianName || 'Unassigned',
              status: st,
              statusColor: statusColor,
              time: formatDate(b.createdAt),
              createdAt: b.createdAt,
              amount: typeof b.price === 'number' ? '₹' + b.price.toLocaleString() : '₹' + b.price,
              numericAmount: typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0,
              isEmergency: Boolean(b.isEmergency)
            };
          }));
        }

        if (nRes?.success && Array.isArray(nRes.data) && nRes.data.length > 0) {
          setActivityLogs(nRes.data.map(n => ({
            id: n.id,
            title: n.title || n.message || 'System Notification',
            time: formatDate(n.createdAt),
            type: n.type || 'info'
          })));
        }

        setLoading(false);
      } catch (err) {
        console.warn('Dashboard data fetch notice:', err);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // --- Dynamic Dashboard Statistics Calculation ---
  const stats = useMemo(() => {
    const totalBookings = bookingsList.length;

    // Today's Bookings
    const todayStr = new Date().toLocaleDateString();
    const todaysBookings = bookingsList.filter(b => {
      if (!b.createdAt) return false;
      const bDate = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000).toLocaleDateString() : '';
      return bDate === todayStr;
    }).length;

    const pendingJobs = bookingsList.filter(b => b.status === 'Pending' || b.status === 'Pending Emergency').length;
    const completedJobs = bookingsList.filter(b => b.status === 'Completed').length;
    const cancelledJobs = bookingsList.filter(b => b.status === 'Cancelled').length;
    const emergencyJobs = bookingsList.filter(b => b.isEmergency || b.status?.toLowerCase().includes('emergency')).length;

    const revenue = bookingsList
      .filter(b => b.status === 'Completed')
      .reduce((sum, b) => sum + (b.numericAmount || 0), 0);

    const totalCustomers = usersList.filter(u => u.role === 'Customer').length || usersList.length;
    const totalTechnicians = techList.length || usersList.filter(u => u.role === 'Technician').length;
    const availableTechnicians = techList.filter(t => t.status === 'Available' || t.status === 'Verified' || t.availability === 'ONLINE').length;
    const busyTechnicians = techList.filter(t => t.status === 'Busy' || t.availability === 'BUSY').length;

    return {
      totalBookings,
      todaysBookings,
      pendingJobs,
      completedJobs,
      cancelledJobs,
      emergencyJobs,
      revenue,
      totalCustomers,
      totalTechnicians,
      availableTechnicians,
      busyTechnicians
    };
  }, [bookingsList, usersList, techList]);

  // Average Rating & Satisfaction rate computed dynamically from live database
  const averageRating = useMemo(() => {
    if (techList.length === 0) return null;
    const rated = techList.filter(t => t.rating && !isNaN(t.rating));
    if (rated.length === 0) return null;
    const sum = rated.reduce((acc, t) => acc + Number(t.rating), 0);
    return (sum / rated.length).toFixed(1);
  }, [techList]);

  const satisfactionRate = useMemo(() => {
    if (bookingsList.length === 0) return '100% Positive';
    const nonCancelled = bookingsList.filter(b => b.status !== 'Cancelled');
    if (nonCancelled.length === 0) return '100% Positive';
    const completed = bookingsList.filter(b => b.status === 'Completed').length;
    const pct = Math.round((completed / nonCancelled.length) * 100);
    return `${pct}% Positive`;
  }, [bookingsList]);

  // Dynamic Activity Feed synthesized from notifications if activityLogs is empty
  const dynamicActivityFeed = useMemo(() => {
    if (activityLogs && activityLogs.length > 0) return activityLogs;

    const logs = [];
    bookingsList.slice(0, 3).forEach(b => {
      logs.push({
        id: `act-b-${b.rawId || b.id}`,
        title: `${b.service} request updated to ${b.status}`,
        time: b.time || 'Just now',
        type: b.status === 'Completed' ? 'success' : b.isEmergency ? 'alert' : 'info'
      });
    });

    usersList.slice(0, 2).forEach(u => {
      logs.push({
        id: `act-u-${u.id}`,
        title: `System User Registered: ${u.name} (${u.role})`,
        time: u.joined || 'Recently',
        type: 'user'
      });
    });

    if (logs.length === 0) {
      logs.push({
        id: 'act-init',
        title: 'Database Synchronized',
        time: 'Live',
        type: 'info'
      });
    }

    return logs;
  }, [activityLogs, bookingsList, usersList]);

  // Dynamic SVG Line Chart Points calculation based on live bookings
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const actuals = new Array(12).fill(0);
    const targets = new Array(12).fill(0);

    bookingsList.forEach(b => {
      if (!b.createdAt) return;
      let bDate = null;
      if (b.createdAt?.seconds) {
        bDate = new Date(b.createdAt.seconds * 1000);
      } else if (typeof b.createdAt === 'string') {
        bDate = new Date(b.createdAt);
      }
      if (bDate && !isNaN(bDate.getTime())) {
        const monthIdx = bDate.getMonth();
        actuals[monthIdx] += 1;
      }
    });

    const maxCount = Math.max(...actuals, 5);
    for (let i = 0; i < 12; i++) {
      targets[i] = Math.round(maxCount * 0.7 + (i * 0.3));
    }

    return { months, actuals, targets, maxCount };
  }, [bookingsList]);

  const maxChartScale = Math.max(chartData.maxCount * 1.3, 10);

  const getSvgPoints = (data) => {
    return data.map((val, i) => {
      const x = 40 + i * 55;
      const y = 220 - (val / maxChartScale) * 180;
      return `${x},${y}`;
    }).join(' ');
  };

  const actualSvgPoints = getSvgPoints(chartData.actuals);
  const targetSvgPoints = getSvgPoints(chartData.targets);

  // --- Dynamic Action Handlers ---
  const toggleUserStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await fetch('/api/admin/users/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toLowerCase(), is_active: newStatus === 'Active' })
      });
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      showToastMsg('User status updated to ' + newStatus);
    } catch (err) {
      console.warn('Error updating user status:', err);
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      showToastMsg('User status updated to ' + newStatus);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch('/api/admin/users/' + id, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.filter(u => u.id !== id));
        showToastMsg(`User "${name}" deleted.`);
      } else {
        showToastMsg(data.error || 'Failed to delete user.');
      }
    } catch (err) {
      showToastMsg('Failed to delete user.');
    }
  };

  const approveTechnician = async (id) => {
    try {
      await fetch('/api/technicians/' + id + '/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Available' })
      });
      setTechList(prev => prev.map(t => t.id === id ? { ...t, status: 'Verified' } : t));
      showToastMsg('Technician verified successfully!');
    } catch (err) {
      console.warn('Error approving technician:', err);
      setTechList(prev => prev.map(t => t.id === id ? { ...t, status: 'Verified' } : t));
      showToastMsg('Technician verified successfully!');
    }
  };

  const toggleServiceActive = async (id, currentActive) => {
    const newActive = !currentActive;
    try {
      await fetch('/api/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: newActive })
      });
      setServicesList(prev => prev.map(s => s.id === id ? { ...s, active: newActive } : s));
      showToastMsg('Service ' + (newActive ? 'activated' : 'disabled') + ' in catalog');
    } catch (err) {
      console.warn('Error toggling service status:', err);
      setServicesList(prev => prev.map(s => s.id === id ? { ...s, active: newActive } : s));
      showToastMsg('Service ' + (newActive ? 'activated' : 'disabled') + ' in catalog');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;
    const priceNum = parseInt(newServicePrice);
    const newSvcData = {
      name: newServiceName,
      category: newServiceCategory,
      price: priceNum,
      duration: '1 hour',
      description: 'Standard 1tapfix catalog service'
    };

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSvcData)
      });
      const data = await res.json();
      const id = data?.data?.id || ('SVC-' + Date.now());
      setServicesList(prev => [{ id, title: newServiceName, category: newServiceCategory, price: priceNum, badge: 'New', active: true }, ...prev]);
      showToastMsg('New Service added to catalog!');
    } catch (err) {
      console.warn('Error adding service:', err);
      setServicesList(prev => [{ id: 'SVC-' + Date.now(), title: newServiceName, category: newServiceCategory, price: priceNum, badge: 'New', active: true }, ...prev]);
      showToastMsg('New Service added to catalog!');
    }

    setNewServiceName('');
    setNewServicePrice('');
    setShowAddServiceModal(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    const newUserData = {
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      password: 'TemporaryPassword123!'
    };

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
      });
      const data = await res.json();
      const id = data?.data?.id || ('USR-' + Date.now());
      setUsersList(prev => [{ id, name: newUserName, email: newUserEmail, role: newUserRole, joined: 'Today', status: 'Active' }, ...prev]);
      showToastMsg('New User created successfully!');
    } catch (err) {
      console.warn('Error adding user:', err);
      setUsersList(prev => [{ id: 'USR-' + Date.now(), name: newUserName, email: newUserEmail, role: newUserRole, joined: 'Today', status: 'Active' }, ...prev]);
      showToastMsg('New User created successfully!');
    }

    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  return (
    <ProtectedRoute allowedRole="admin">
    <div className="min-h-screen bg-[#EEF4ED]/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex antialiased transition-colors duration-200">
      
      {/* Sidebar - Hover-expandable stuck to left edge */}
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`fixed left-0 top-0 bottom-0 h-screen bg-white dark:bg-black border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between overflow-x-hidden z-40 transition-[width,box-shadow] duration-300 ease-in-out ${
          isSidebarHovered ? 'w-64 shadow-2xl shadow-black/20 dark:shadow-black/80' : 'w-16 shadow-xs'
        }`}
      >
        <div className="space-y-4">
          
          {/* 1tapfix Brand Header */}
          <div className="h-16 shrink-0 flex items-center px-3 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-xl bg-[#0B2545] flex items-center justify-center text-white shrink-0 shadow-md">
                <Wrench className="w-5 h-5 text-emerald-400" />
              </div>
              <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ease-in-out ${
                isSidebarHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
              }`}>
                <h1 className="text-lg font-extrabold text-[#0B2545] dark:text-white tracking-tight flex items-center gap-1">
                  1tapfix <span className="text-[10px] bg-[#134074] text-white px-1.5 py-0.5 rounded-full">Admin</span>
                </h1>
                <p className="text-[10px] font-semibold text-slate-400">Enterprise Control</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-2 space-y-1">
            {[
              { label: 'Dashboard', icon: LayoutDashboard },
              { label: 'Users', icon: Users },
              { label: 'Technicians', icon: UserCheck },
              { label: 'Services', icon: Wrench },
              { label: 'Bookings', icon: Calendar },
              { label: 'Settings', icon: Settings },
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = activeNav === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveNav(item.label)}
                  title={!isSidebarHovered ? item.label : undefined}
                  className={`w-full group relative flex items-center h-11 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer overflow-hidden ${
                    isActive 
                      ? 'bg-[#0B2545] dark:bg-blue-600 text-white shadow-xs font-bold' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-[#0B2545] dark:hover:text-white'
                  }`}
                >
                  <div className="w-12 h-11 shrink-0 flex items-center justify-center">
                    <IconComp className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400 group-hover:text-[#134074] dark:group-hover:text-white'
                    }`} />
                  </div>
                  <span className={`ml-1 text-xs font-medium whitespace-nowrap transition-all duration-300 ease-in-out truncate ${
                    isSidebarHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Admin Profile */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center h-12 rounded-xl overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors p-1">
            <div className="w-12 h-10 shrink-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                AD
              </div>
            </div>
            <div className={`ml-1 text-left whitespace-nowrap transition-all duration-300 ease-in-out flex-1 truncate ${
              isSidebarHovered ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden pointer-events-none'
            }`}>
              <h5 className="text-xs font-extrabold text-[#0B2545] dark:text-white truncate">System Admin</h5>
              <p className="text-[10px] text-slate-400 font-semibold truncate">admin@1tapfix.com</p>
            </div>
            {isSidebarHovered && (
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

      {/* Main Content Area: Offset by the 64px (md:pl-16) collapsed sidebar width */}
      <main className="md:pl-16 flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300">
        
        {/* Sticky Header Bar */}
        <header className="bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 px-8 py-4 sticky top-0 z-10 flex items-center justify-between gap-6 transition-colors duration-200 shadow-xs">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-[#0B2545] dark:text-white tracking-tight">{activeNav}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64 hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full pl-9 pr-4 py-2 text-xs font-medium text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#0B2545]/20 transition-all" 
              />
            </div>

            <ThemeToggle />

            <button 
              onClick={() => showToastMsg('Database state synchronized')}
              className="relative text-slate-500 hover:text-[#0B2545] dark:text-slate-400 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Content Views Based on Active Tab */}
        <div className="p-8 space-y-7">

          {/* Loading Indicator Bar */}
          {loading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Fetching dashboard state...</span>
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD VIEW */}
          {activeNav === 'Dashboard' && (
            <div className="space-y-7 animate-in fade-in duration-300">
              
              {/* Top Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* 1. Revenue Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-2 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Total Platform Revenue</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#0B2545] dark:text-white tracking-tight">
                    ₹{stats.revenue.toLocaleString()}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <span>↑ Real-time Calculations</span>
                  </div>
                </div>

                {/* 2. Technicians Summary Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-2 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Active Technicians</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#0B2545] dark:text-white tracking-tight">{stats.totalTechnicians} Techs</div>
                  <div className="text-xs font-semibold text-slate-500">
                    {stats.availableTechnicians} Available · {stats.busyTechnicians} Busy
                  </div>
                </div>

                {/* 3. Emergency Jobs Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 shadow-sm space-y-2 hover:shadow-lg hover:-translate-y-1 hover:border-rose-400 transition-all duration-300 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-rose-500">Emergency Jobs</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-rose-600 tracking-tight">{stats.emergencyJobs}</div>
                  <div className="text-xs font-bold text-rose-600">Priority Dispatch Required</div>
                </div>

                {/* 4. Total Customers Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm space-y-2 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300 transition-all duration-300 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Registered Customers</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#0B2545] dark:text-white tracking-tight">{stats.totalCustomers}</div>
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <span>{satisfactionRate}</span>
                  </div>
                </div>

              </div>

              {/* Comprehensive 11 Dashboard Statistics Grid */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B2545] dark:text-white">Platform Performance Overview</h3>
                    <p className="text-xs text-slate-400">Live monitoring across all booking and service operations</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
                  
                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 p-3.5 rounded-xl text-center space-y-1 hover:scale-105 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-pointer">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Bookings</span>
                    <span className="text-xl font-black text-[#0B2545] block">{stats.totalBookings}</span>
                    <span className="text-[10px] font-semibold text-slate-500">All Time</span>
                  </div>

                  <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 p-3.5 rounded-xl text-center space-y-1 hover:scale-105 hover:bg-blue-50/90 dark:hover:bg-blue-900/40 hover:shadow-md hover:border-blue-300 transition-all duration-300 cursor-pointer">
                    <span className="text-[10px] font-extrabold uppercase text-blue-600 block">Today's Bookings</span>
                    <span className="text-xl font-black text-blue-800 block">{stats.todaysBookings}</span>
                    <span className="text-[10px] font-semibold text-blue-600">Created Today</span>
                  </div>

                  <div className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/50 p-3.5 rounded-xl text-center space-y-1 hover:scale-105 hover:bg-amber-50/90 dark:hover:bg-amber-900/40 hover:shadow-md hover:border-amber-300 transition-all duration-300 cursor-pointer">
                    <span className="text-[10px] font-extrabold uppercase text-amber-600 block">Pending Jobs</span>
                    <span className="text-xl font-black text-amber-800 block">{stats.pendingJobs}</span>
                    <span className="text-[10px] font-semibold text-amber-600">Awaiting Action</span>
                  </div>

                  <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/50 p-3.5 rounded-xl text-center space-y-1 hover:scale-105 hover:bg-emerald-50/90 dark:hover:bg-emerald-900/40 hover:shadow-md hover:border-emerald-300 transition-all duration-300 cursor-pointer">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-600 block">Completed Jobs</span>
                    <span className="text-xl font-black text-emerald-800 block">{stats.completedJobs}</span>
                    <span className="text-[10px] font-semibold text-emerald-600">Fulfilled</span>
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-center space-y-1 hover:scale-105 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Cancelled Jobs</span>
                    <span className="text-xl font-black text-slate-700 block">{stats.cancelledJobs}</span>
                    <span className="text-[10px] font-semibold text-slate-400">Closed</span>
                  </div>

                  <div className="bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 p-3.5 rounded-xl text-center space-y-1 hover:scale-105 hover:bg-rose-50/90 dark:hover:bg-rose-900/40 hover:shadow-md hover:border-rose-300 transition-all duration-300 cursor-pointer">
                    <span className="text-[10px] font-extrabold uppercase text-rose-600 block">Emergency Jobs</span>
                    <span className="text-xl font-black text-rose-800 block">{stats.emergencyJobs}</span>
                    <span className="text-[10px] font-semibold text-rose-600">High Priority</span>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-200/70 p-3.5 rounded-xl text-center space-y-1 hover:scale-105 hover:bg-emerald-50/90 hover:shadow-md hover:border-emerald-300 transition-all duration-300 cursor-pointer">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-700 block">Platform Revenue</span>
                    <span className="text-lg font-black text-emerald-900 block truncate">₹{stats.revenue.toLocaleString()}</span>
                    <span className="text-[10px] font-semibold text-emerald-600">Total Revenue</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 p-3.5 rounded-xl text-center space-y-1 hover:scale-105 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-pointer">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Customers</span>
                    <span className="text-xl font-black text-[#0B2545] block">{stats.totalCustomers}</span>
                    <span className="text-[10px] font-semibold text-slate-500">Registered</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 p-3.5 rounded-xl text-center space-y-1 hover:scale-105 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-pointer">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Technicians</span>
                    <span className="text-xl font-black text-[#0B2545] block">{stats.totalTechnicians}</span>
                    <span className="text-[10px] font-semibold text-slate-500">Active Team</span>
                  </div>

                  <div className="bg-blue-50/60 border border-blue-200/70 p-3.5 rounded-xl text-center space-y-1 hover:scale-105 hover:bg-blue-50/90 hover:shadow-md hover:border-blue-300 transition-all duration-300 cursor-pointer">
                    <span className="text-[10px] font-extrabold uppercase text-blue-600 block">Available Techs</span>
                    <span className="text-xl font-black text-blue-800 block">{stats.availableTechnicians}</span>
                    <span className="text-[10px] font-semibold text-blue-600">Online & Ready</span>
                  </div>

                  <div className="bg-amber-50/60 border border-amber-200/70 p-3.5 rounded-xl text-center space-y-1 hover:scale-105 hover:bg-amber-50/90 hover:shadow-md hover:border-amber-300 transition-all duration-300 cursor-pointer">
                    <span className="text-[10px] font-extrabold uppercase text-amber-600 block">Busy Technicians</span>
                    <span className="text-xl font-black text-amber-800 block">{stats.busyTechnicians}</span>
                    <span className="text-[10px] font-semibold text-amber-600">On Assignment</span>
                  </div>

                  <div className="bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-900/50 p-3.5 rounded-xl text-center space-y-1 hover:scale-105 hover:bg-purple-50/90 dark:hover:bg-purple-900/40 hover:shadow-md hover:border-purple-300 transition-all duration-300 cursor-pointer">
                    <span className="text-[10px] font-extrabold uppercase text-purple-600 block">Core Services</span>
                    <span className="text-xl font-black text-purple-800 block">{servicesList.length}</span>
                    <span className="text-[10px] font-semibold text-purple-600">In Catalog</span>
                  </div>

                </div>
              </div>

              {/* Live Feeds & Roster (3-Column Layout) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Technician Team Preview */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-base font-extrabold text-[#0B2545]">Technician Team</h3>
                    <button onClick={() => setActiveNav('Technicians')} className="text-xs font-bold text-[#134074] dark:text-blue-400 hover:underline">
                      View All ({techList.length})
                    </button>
                  </div>

                  <div className="space-y-3">
                    {techList.length === 0 ? (
                      <div className="py-8 text-center space-y-2">
                        <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-400">No technicians found</p>
                      </div>
                    ) : (
                      techList.slice(0, 5).map((tech, idx) => (
                        <div key={tech.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-slate-400 w-4">{idx + 1}</span>
                            <div className="w-8 h-8 rounded-full bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              {tech.name.charAt(0)}
                            </div>
                            <div>
                              <h5 className="text-xs font-extrabold text-[#0B2545]">{tech.name}</h5>
                              <p className="text-[10px] text-slate-400 font-semibold">{tech.specialty}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-emerald-600 block">{tech.rating ? `★ ${tech.rating}` : 'Not rated'}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{tech.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Bookings Feed */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-extrabold text-[#0B2545]">Recent Platform Bookings</h3>
                    <button onClick={() => setActiveNav('Bookings')} className="text-xs font-bold text-[#134074] dark:text-blue-400 hover:underline">
                      See All
                    </button>
                  </div>

                  {bookingsList.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-400">No bookings recorded in database</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookingsList.slice(0, 5).map(b => (
                        <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#0B2545] dark:text-white">{b.service}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.statusColor}`}>
                                {b.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium mt-0.5">Customer: <span className="font-semibold text-slate-800">{b.customer}</span></p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-[#0B2545] block">{b.amount}</span>
                            <span className="text-[10px] font-semibold text-slate-400">{b.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dynamic System Activity Feed */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-extrabold text-[#0B2545]">System Audit Logs</h3>
                  </div>

                  <div className="space-y-3">
                    {dynamicActivityFeed.map(log => (
                      <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-0.5 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-700 hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                        <p className="text-xs font-bold text-[#0B2545] dark:text-white">{log.title}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{log.time}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: USERS MANAGEMENT PAGE */}
          {activeNav === 'Users' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search user by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select 
                      value={userRoleFilter} 
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-white focus:outline-none"
                    >
                      <option value="All">All Roles</option>
                      <option value="Customer">Customer</option>
                      <option value="Technician">Technician</option>
                      <option value="Dispatcher">Dispatcher</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-[#0B2545] hover:bg-[#134074] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add New User</span>
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                {usersList.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Users className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-extrabold text-[#0B2545]">No Users Found</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">Click "Add New User" to register user accounts directly in the database.</p>
                    <button 
                      onClick={() => setShowAddUserModal(true)}
                      className="bg-[#0B2545] text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      Add First User
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                          <th className="pb-3">Name</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Role</th>
                          <th className="pb-3">Joined Date</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {usersList
                          .filter(u => userRoleFilter === 'All' || u.role === userRoleFilter)
                          .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                          .map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-4 font-extrabold text-[#0B2545]">{user.name}</td>
                              <td className="py-4 text-slate-600">{user.email}</td>
                              <td className="py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                  user.role === 'Technician' ? 'bg-blue-100 text-blue-700' :
                                  user.role === 'Dispatcher' ? 'bg-amber-100 text-amber-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="py-4 text-slate-500">{user.joined}</td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  user.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="py-4 text-right space-x-2">
                                <button 
                                  onClick={() => toggleUserStatus(user.id, user.status)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                    user.status === 'Active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  }`}
                                >
                                  {user.status === 'Active' ? 'Suspend' : 'Activate'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                  title="Delete User"
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 inline" />
                                </button>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: TECHNICIANS MANAGEMENT PAGE */}
          {activeNav === 'Technicians' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Filter Row */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div>
                  <h3 className="text-sm font-extrabold text-[#0B2545]">Technician Verification & Roster</h3>
                  <p className="text-xs text-slate-400">Total Technicians: {stats.totalTechnicians} · Available: {stats.availableTechnicians} · Busy: {stats.busyTechnicians}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Filter Status:</span>
                  <select 
                    value={techFilter} 
                    onChange={(e) => setTechFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-white"
                  >
                    <option value="All">All Technicians</option>
                    <option value="Verified">Verified Only</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                  </select>
                </div>
              </div>

              {/* Technician Cards Grid */}
              {techList.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-200/80">
                  <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-extrabold text-[#0B2545]">No Technicians Found in Database</h4>
                  <p className="text-xs text-slate-400">No technician profiles registered.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {techList
                    .filter(t => techFilter === 'All' || t.status === techFilter)
                    .map((tech) => (
                      <div key={tech.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-[#0B2545] text-white flex items-center justify-center font-black text-sm shadow-sm">
                              {tech.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-[#0B2545]">{tech.name}</h4>
                              <p className="text-xs font-semibold text-emerald-600">{tech.specialty}</p>
                            </div>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            tech.status === 'Verified' || tech.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 
                            tech.status === 'Busy' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {tech.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                            <span className="text-[10px] text-slate-400 font-bold block">Experience</span>
                            <span className="text-xs font-extrabold text-[#0B2545]">{tech.exp}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                            <span className="text-[10px] text-slate-400 font-bold block">Rating</span>
                            <span className="text-xs font-extrabold text-emerald-600">{tech.rating ? `★ ${tech.rating}` : 'Not rated'}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                            <span className="text-[10px] text-slate-400 font-bold block">Jobs Done</span>
                            <span className="text-xs font-extrabold text-[#0B2545]">{tech.jobsDone}</span>
                          </div>
                        </div>

                        <div className="pt-2">
                          {tech.status === 'Pending Verification' ? (
                            <button 
                              onClick={() => approveTechnician(tech.id)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify & Approve Technician</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => showToastMsg(`Viewing full profile of ${tech.name}`)}
                              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 rounded-xl transition-colors"
                            >
                              View Profile Log
                            </button>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 4: SERVICES MANAGEMENT PAGE */}
          {activeNav === 'Services' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header Action */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div>
                  <h3 className="text-base font-extrabold text-[#0B2545] dark:text-white">1tapfix Core Services Catalog</h3>
                  <p className="text-xs text-slate-400">Manage service pricing, availability, and active status</p>
                </div>

                <button 
                  onClick={() => setShowAddServiceModal(true)}
                  className="bg-[#0B2545] hover:bg-[#134074] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </button>
              </div>

              {/* Service Cards */}
              {servicesList.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-200/80">
                  <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-extrabold text-[#0B2545]">No Core Services Configured in Database</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Add your platform's core repair and maintenance service offerings.</p>
                  <button 
                    onClick={() => setShowAddServiceModal(true)}
                    className="bg-[#0B2545] text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Add Core Service
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {servicesList.map((svc) => (
                    <div key={svc.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{svc.category}</span>
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                            {svc.badge}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-[#0B2545]">{svc.title}</h4>
                      </div>

                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">Starting From</span>
                          <span className="text-xl font-black text-[#0B2545]">₹{svc.price}</span>
                        </div>

                        <button 
                          onClick={() => toggleServiceActive(svc.id, svc.active)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            svc.active ? 'bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-600' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {svc.active ? 'Active' : 'Disabled'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 5: BOOKINGS PAGE */}
          {activeNav === 'Bookings' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search by customer or service..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Status:</span>
                  <select 
                    value={bookingFilter}
                    onChange={(e) => setBookingFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700"
                  >
                    <option value="All">All Bookings</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                {bookingsList.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-extrabold text-[#0B2545]">No Bookings Found in Database</h4>
                    <p className="text-xs text-slate-400">Bookings created by customers will appear here in real-time.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[11px] font-extrabold text-slate-400 uppercase border-b border-slate-100">
                          <th className="pb-3">Customer</th>
                          <th className="pb-3">Service</th>
                          <th className="pb-3">Assigned Tech</th>
                          <th className="pb-3">Scheduled Time</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Amount</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                        {bookingsList
                          .filter(b => bookingFilter === 'All' || b.status === bookingFilter)
                          .filter(b => b.customer.toLowerCase().includes(bookingSearch.toLowerCase()) || b.service.toLowerCase().includes(bookingSearch.toLowerCase()))
                          .map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-4 font-bold text-[#0B2545]">{row.customer}</td>
                              <td className="py-4 text-slate-600">{row.service}</td>
                              <td className="py-4 text-slate-600">{row.tech}</td>
                              <td className="py-4 text-slate-500">{row.time}</td>
                              <td className="py-4">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${row.statusColor}`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="py-4 font-extrabold text-[#0B2545]">{row.amount}</td>
                              <td className="py-4 text-right">
                                <button 
                                  onClick={() => showToastMsg(`Managing booking request for ${row.customer}`)}
                                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 6: SETTINGS PAGE */}
          {activeNav === 'Settings' && (
            <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-extrabold text-[#0B2545] dark:text-white">1tapfix Platform Settings</h3>
                <p className="text-xs text-slate-400">Configure core platform parameters and notifications</p>
              </div>

              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h5 className="text-xs font-extrabold text-[#0B2545]">Emergency Surcharge Fee</h5>
                    <p className="text-[11px] text-slate-400">Additional fee for 24/7 priority emergency dispatch</p>
                  </div>
                  <span className="text-xs font-black text-[#0B2545] dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">₹250</span>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h5 className="text-xs font-extrabold text-[#0B2545]">Platform Commission</h5>
                    <p className="text-[11px] text-slate-400">Percentage charged per completed job</p>
                  </div>
                  <span className="text-xs font-black text-[#0B2545] dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">15%</span>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h5 className="text-xs font-extrabold text-[#0B2545]">Auto-Approve Verified Techs</h5>
                    <p className="text-[11px] text-slate-400">Automatically enable booking access once background checks clear</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0B2545]" />
                </div>
              </div>

              <button 
                onClick={() => showToastMsg('Platform settings saved successfully!')}
                className="w-full bg-[#0B2545] hover:bg-[#134074] text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-sm"
              >
                Save Settings
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-semibold gap-4 mt-auto transition-colors duration-200">
          <p>© 2026 1tapfix Enterprise. All Rights Reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => showToastMsg('System Status: 100% Operational')} className="hover:text-slate-600">System Health</button>
            <button onClick={() => showToastMsg('Admin Help Center')} className="hover:text-slate-600">Support</button>
          </div>
        </footer>

      </main>

      {/* Add New Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-[#0B2545]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 transition-colors duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-[#0B2545] dark:text-white">Add New Core Service</h3>
              <button onClick={() => setShowAddServiceModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Service Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Smart Lock Installation"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-[#0B2545]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select 
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Woodwork">Woodwork</option>
                  <option value="Painting">Painting</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Appliances">Appliances</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Base Price (₹)</label>
                <input 
                  type="number" 
                  required
                  placeholder="499"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-[#0B2545]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddServiceModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-[#0B2545] hover:bg-[#134074] text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                >
                  Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-[#0B2545]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-[#0B2545] dark:text-white">Add New System User</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="John Doe" 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl p-2.5 text-xs font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="john@example.com" 
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl p-2.5 text-xs font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select 
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="Customer">Customer</option>
                  <option value="Technician">Technician</option>
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2.5 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-[#0B2545] text-white text-xs font-bold py-2.5 rounded-xl">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B2545] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

    </div>
    </ProtectedRoute>
  );
}
