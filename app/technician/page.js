'use client';
import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import TechHeader from '../../components/technician/TechHeader';
import TechDesktopSidebar from '../../components/technician/TechDesktopSidebar';
import TechDashboard from '../../components/technician/TechDashboard';
import TechJobList from '../../components/technician/TechJobList';
import TechJobDetail from '../../components/technician/TechJobDetail';
import TechProfile from '../../components/technician/TechProfile';
import TechPerformance from '../../components/technician/TechPerformance';
import TechEmergencyModal from '../../components/technician/TechEmergencyModal';
import TechExtraChargesModal from '../../components/technician/TechExtraChargesModal';
import TechDelayModal from '../../components/technician/TechDelayModal';
import TechAuthModal from '../../components/technician/TechAuthModal';
import { Info } from 'lucide-react';

export default function TechnicianModulePage() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | jobs | emergency | performance | profile
  const [selectedJob, setSelectedJob] = useState(null);
  const [availability, setAvailability] = useState('Available'); // Available | Busy | Offline
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Single Dispatcher & Admin Scope for Mangaluru, Karnataka
  const DISPATCHER_EMAIL = 'dispatcher@1tapfix.com';
  const MANGALURU_REGION = 'Mangaluru, Karnataka';

  // Authentication & Technician Profile State (Mangaluru Region Focus)
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [currentUser, setCurrentUser] = useState(null);

  const normalizeTechName = (str) => {
    if (!str) return '';
    return String(str).toLowerCase().replace(/[\._\-]/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const resolveCustomerName = (data) => {
    if (!data) return 'Customer';
    const cName = data.customerName || data.customer;
    if (cName && cName !== 'Customer' && cName !== 'customer' && String(cName).trim() !== '') {
      return cName;
    }
    if (data.customerEmail && String(data.customerEmail).trim() !== '') return data.customerEmail;
    if (data.email && String(data.email).trim() !== '') return data.email;
    return cName || 'Customer';
  };

  const resolveJobTime = (data, isEmg) => {
    if (!data) return '09:30 AM';

    // 1. For Emergency Requests: prioritize createdAt timestamp (to indicate exact creation time)
    if (isEmg && data.createdAt) {
      try {
        if (typeof data.createdAt === 'object' && data.createdAt.seconds) {
          return new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        if (typeof data.createdAt === 'string' && data.createdAt.trim() !== '') {
          const d = new Date(data.createdAt);
          if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }
      } catch(e) {}
    }

    // 2. Explicit time slots
    if (data.timeSlot && data.timeSlot !== 'null' && data.timeSlot !== 'Just now') return data.timeSlot;
    if (data.time && data.time !== 'null' && data.time !== 'Just now') return data.time;
    if (data.scheduledTime && data.scheduledTime !== 'null') return data.scheduledTime;

    // 3. Fallback to createdAt timestamp
    if (data.createdAt) {
      try {
        if (typeof data.createdAt === 'object' && data.createdAt.seconds) {
          return new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        if (typeof data.createdAt === 'string' && data.createdAt.trim() !== '') {
          const d = new Date(data.createdAt);
          if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }
      } catch(e) {}
    }

    return '09:30 AM';
  };

  // Modals and Data State
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [extraChargesModalOpen, setExtraChargesModalOpen] = useState(false);
  const [delayModalOpen, setDelayModalOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [emergencyList, setEmergencyList] = useState([]);
  const [ratingsList, setRatingsList] = useState([]);

  // Persistent Availability & Data Loading for logged in Technician
  useEffect(() => {
    try {
      const cached = localStorage.getItem('fixmate_tech_availability');
      if (cached) setAvailability(cached);
    } catch(e) {}

    let isMounted = true;

    async function loadTechnicianData() {
      try {
        const authRes = await fetch('/api/auth/me');
        const authJson = await authRes.json();
        if (!isMounted) return;

        if (authJson.authenticated && authJson.user) {
          const u = authJson.user;
          const t = u.technician || {};
          const currentStatus = t.status || 'Available';
          setAvailability(currentStatus);
          setCurrentUser({
            uid: u.id,
            id: u.id,
            name: u.name || 'Technician',
            email: u.email || '',
            phone: u.phone || u.mobile || '',
            specialization: t.specialization || 'Technician',
            experienceYears: String(t.experienceYears || '5'),
            workingArea: t.workingArea || 'Mangaluru Region',
            status: currentStatus,
          });

          const [bRes, rRes] = await Promise.all([
            fetch('/api/bookings').then(r => r.json()).catch(() => null),
            fetch('/api/ratings').then(r => r.json()).catch(() => null)
          ]);

          if (isMounted && bRes?.success && Array.isArray(bRes.data)) {
            const myJobs = [];
            const emgList = [];
            bRes.data.forEach(b => {
              if (b.isEmergency && (!b.technician_id || b.status === 'Pending')) {
                emgList.push({
                  id: b.id,
                  title: b.service || 'Emergency Service Request',
                  category: b.category || 'Emergency Plumbing',
                  location: b.address || 'Mangaluru',
                  customerName: b.customerName || 'Customer',
                  customerPhone: b.customerPhone || 'Not provided',
                  price: Number(b.price || 0),
                  description: b.notes || 'Urgent emergency repair required.',
                  distance: '1.2 km away',
                  isEmergency: true,
                  status: 'Assigned'
                });
              } else if (b.technician_id === u.id || !b.technician_id) {
                myJobs.push({
                  id: b.id,
                  title: b.service || 'Service Request',
                  service: b.service || 'General Service',
                  customerName: b.customerName || 'Customer',
                  customerPhone: b.customerPhone || 'Not provided',
                  location: b.address || 'Mangaluru',
                  address: b.address || 'Mangaluru',
                  price: Number(b.price || 0),
                  time: b.time || '10:00 AM',
                  status: b.status || 'Assigned',
                  isEmergency: Boolean(b.isEmergency),
                  checklist: [
                    { id: 'arrive', label: 'Arrived at Site', done: b.status === 'In Progress' || b.status === 'In-Progress' || b.status === 'Completed' },
                    { id: 'inspect', label: 'Initial Inspection & Diagnosis', done: b.status === 'In Progress' || b.status === 'In-Progress' || b.status === 'Completed' },
                    { id: 'work', label: 'Execution & Component Fix', done: b.status === 'In Progress' || b.status === 'In-Progress' || b.status === 'Completed' },
                    { id: 'verify', label: 'Testing & Quality Check', done: b.status === 'Completed' },
                    { id: 'invoice', label: 'Final Handover & Billing', done: b.status === 'Completed' }
                  ]
                });
              }
            });
            setJobs(myJobs);
            setEmergencyList(emgList);
          }

          if (isMounted && rRes?.success && Array.isArray(rRes.data)) {
            setRatingsList(rRes.data.map(r => ({
              id: r.id,
              customerName: r.customerName || 'Verified Customer',
              rating: Number(r.rating || 5),
              comment: r.review || 'Great work!',
              date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recently',
              serviceName: r.serviceName || 'Home Repair'
            })));
          }
        }
      } catch (err) {
        console.warn('Error loading technician hub data:', err);
      }
    }

    loadTechnicianData();
    return () => { isMounted = false; };
  }, []);

  // Daily Workload Capacity Rule (Max 6 assigned jobs per day)
  const MAX_DAILY_CAPACITY = 6;

  

  // Dynamic Real-Time Notifications Stream (Emergency Broadcasts -> Rating Reviews -> Dispatcher Assignments -> Cancelled Requests)
  useEffect(() => {
    const isCancelledJob = (j) => 
      j.status === 'Cancelled' || 
      j.status === 'CANCELLED' || 
      j.status === 'cancelled' ||
      (typeof j.status === 'string' && j.status.toLowerCase().includes('cancel'));

    const emgNotifs = emergencyList.map(e => ({
      id: `emg-${e.id}`,
      title: 'Emergency Service Call',
      message: `Emergency request for "${e.title || e.service || 'Service'}" in ${e.location || 'your area'}`,
      time: 'Live Broadcast',
      type: 'EMERGENCY'
    }));

    const ratingNotifs = ratingsList.map(r => ({
      id: `rating-${r.id}`,
      title: `${r.rating}/5 Star Rating`,
      message: `${r.customerName || 'Customer'} rated ${r.rating} stars for "${r.service}": "${r.review}"`,
      time: r.date,
      type: 'RATING'
    }));

    const assignedNotifs = jobs.filter(j => (j.status === 'Assigned' || j.status === 'Accepted') && !isCancelledJob(j)).map(j => ({
      id: `assign-${j.id}`,
      title: 'New Job Assigned',
      message: `"${j.title || j.service || 'Service'}" in ${j.location || 'your area'} • ${j.timeSlot || j.time || 'Scheduled'}`,
      time: j.timeSlot || j.time || 'Today',
      type: 'ASSIGNMENT'
    }));

    const cancelledNotifs = jobs.filter(j => isCancelledJob(j)).map(j => {
      const cleanReason = j.cancellationReason 
        ? j.cancellationReason.replace(/^Cancel Assignment:\s*/i, '').trim()
        : 'Mid-Duty Cancellation';
      const serviceName = j.title || j.service || j.category || 'Service Request';

      return {
        id: `cancel-${j.id}`,
        title: 'Service Cancelled',
        message: `"${serviceName}" was cancelled. Reason: ${cleanReason}`,
        time: 'Cancelled',
        type: 'CANCELLATION'
      };
    });

    setNotifications([...emgNotifs, ...ratingNotifs, ...assignedNotifs, ...cancelledNotifs]);
  }, [emergencyList, jobs, ratingsList]);

  // Dynamic Rating Metrics Calculations
  const totalRatingSum = ratingsList.reduce((acc, r) => acc + r.rating, 0);
  const avgRating = ratingsList.length > 0 ? (totalRatingSum / ratingsList.length).toFixed(2) : null;
  const positiveCount = ratingsList.filter(r => r.rating >= 4).length;
  const positivePercentage = ratingsList.length > 0 ? Math.round((positiveCount / ratingsList.length) * 100) : 0;

  const [notifications, setNotifications] = useState([]);

  // Toast notification helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Availability Switcher & Backend Sync
  const handleToggleAvailability = async (forcedStatus) => {
    let nextStatus = 'Available';
    if (typeof forcedStatus === 'string') {
      nextStatus = (forcedStatus === 'ONLINE' || forcedStatus === 'Available') ? 'Available' : (forcedStatus === 'BUSY' || forcedStatus === 'Busy') ? 'Busy' : 'Offline';
    } else {
      nextStatus = availability === 'Available' ? 'Busy' : availability === 'Busy' ? 'Offline' : 'Available';
    }

    setAvailability(nextStatus);
    const techName = currentUser?.name || 'Technician';
    const techUid = currentUser?.uid || currentUser?.id || 'tech_rajesh_kumar';

    const techPayload = {
      id: techUid,
      uid: techUid,
      name: techName,
      status: nextStatus,
      availability: nextStatus,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('fixmate_tech_availability', nextStatus);
      localStorage.setItem('fixmate_tech_availability_' + techUid, nextStatus);
      window.dispatchEvent(new CustomEvent('fixmate_tech_status_updated', { detail: techPayload }));
    } catch(e) {}

    fetch('/api/technicians/' + techUid + '/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus, availability: nextStatus })
    }).catch(err => console.warn('API status update error:', err));

    showToast('🟢 Duty Status: Updated to "' + nextStatus + '"');
  };

  // Real-Time Checklist Progression & Multi-Module Sync Handler
  const handleUpdateStatus = async (jobId, nextStatus) => {
    const targetJob = jobs.find(j => j.id === jobId) || selectedJob;
    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentTimestamps = targetJob?.timestamps || {};
    const updatedTimestamps = { ...currentTimestamps, [nextStatus]: currentTimeStr };

    // 1. Update local UI state immediately with timestamp record
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: nextStatus, timestamps: updatedTimestamps, updatedAt: new Date().toISOString() } : j));
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(prev => ({ ...prev, status: nextStatus, timestamps: updatedTimestamps, updatedAt: new Date().toISOString() }));
    }

    const jobPayload = {
      id: jobId,
      jobId: jobId,
      status: nextStatus,
      technicianName: currentUser?.name || 'Rajesh Kumar',
      technicianPhone: currentUser?.phone || '+91 98765 43210',
      title: targetJob?.title || 'Service Request',
      customerName: targetJob?.customerName || 'Customer',
      location: targetJob?.location || 'Kodialbail & Hampankatta, Mangaluru',
      updatedAt: new Date().toISOString(),
      timestamps: updatedTimestamps,
      syncMessage: `Status updated to "${nextStatus}" at ${currentTimeStr} by ${currentUser?.name || 'Rajesh Kumar'}`
    };

    // 2. Post status sync API
    fetch('/api/bookings/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobPayload)
    }).catch(err => console.warn('Booking status sync error:', err));

    // 4. LocalStorage & Window Custom Event broadcast
    try {
      localStorage.setItem(`fixmate_job_status_${jobId}`, nextStatus);
      localStorage.setItem('fixmate_last_job_status_update', JSON.stringify(jobPayload));
      window.dispatchEvent(new CustomEvent('fixmate_job_status_updated', { detail: jobPayload }));
    } catch(e) {}

    // 5. Add Live Notification entry
    const newNotif = {
      id: Date.now(),
      title: 'Status Synchronized Real-Time',
      message: `Job #${jobId} updated to "${nextStatus}". Synced with Customer, Dispatcher (${DISPATCHER_EMAIL}) & Admin.`,
      time: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast(`Status updated to "${nextStatus}"`);
  };

  // Emergency Acceptance Handler (First-to-Accept Lock Rule)
  const handleAcceptEmergency = async (emgJob) => {
    const activeCount = jobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled').length;

    if (activeCount >= MAX_DAILY_CAPACITY) {
      showToast(`⚠️ Daily Capacity Limit Reached (${MAX_DAILY_CAPACITY} Jobs Max). Complete existing jobs first!`);
      return;
    }

    const techName = currentUser?.name || 'Rajesh Kumar';
    const techUid = currentUser?.id || currentUser?.uid || 'tech_rajesh_kumar';

    const acceptPayload = {
      id: emgJob.id,
      jobId: emgJob.id,
      status: 'Accepted',
      isEmergency: true,
      tag: 'EMERGENCY',
      category: emgJob.category || 'Emergency Plumbing',
      assignedTechId: techUid,
      assignedTechName: techName,
      technicianName: techName,
      technicianPhone: currentUser?.phone || '+91 98765 43210',
      acceptedByTechId: techUid,
      acceptedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newJob = {
      ...emgJob,
      ...acceptPayload,
      extraCharges: 0,
      extraChargesReason: '',
      time: 'Immediate'
    };

    // 1. Sync accepted status
    fetch('/api/bookings/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(acceptPayload)
    }).catch(err => console.warn('Emergency accept sync error:', err));

    // 3. Update React state and select job
    setJobs(prev => [newJob, ...prev.filter(j => j.id !== emgJob.id)]);
    setEmergencyList(prev => prev.filter(e => e.id !== emgJob.id));
    setEmergencyModalOpen(false);
    setSelectedJob(newJob);

    showToast(`🚨 Emergency Job #${emgJob.id} Accepted & Locked! Synced with Dispatcher (${DISPATCHER_EMAIL}).`);
  };

  // Extra Charges Handler & Backend Sync
  const handleAddExtraCharges = async (jobId, totalExtra, reason, extraLabour = 0, extraMaterial = 0) => {
    const targetJob = jobs.find(j => j.id === jobId) || selectedJob;
    const basePrice = targetJob?.price || 0;
    const currentExtra = targetJob?.extraCharges || 0;
    const updatedExtra = currentExtra + totalExtra;
    const finalTotalBill = basePrice + updatedExtra;

    const extraChargesPayload = {
      id: jobId,
      jobId: jobId,
      price: basePrice,
      extraCharges: updatedExtra,
      extraLabour: (targetJob?.extraLabour || 0) + extraLabour,
      extraMaterial: (targetJob?.extraMaterial || 0) + extraMaterial,
      extraChargesReason: reason,
      finalTotalBill: finalTotalBill,
      updatedAt: new Date().toISOString()
    };

    // 1. Local state update
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...extraChargesPayload } : j));
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(prev => ({ ...prev, ...extraChargesPayload }));
    }

    // 2. Post extra charges sync
    fetch('/api/bookings/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(extraChargesPayload)
    }).catch(err => console.warn('Extra charges sync error:', err));

    showToast(`⚡ Real-Time Bill Updated: +₹${totalExtra.toFixed(2)} added to #${jobId} (Final Total: ₹${finalTotalBill.toFixed(2)})`);
  };

  // Job Cancellation Report Handler (Instant Non-Blocking Execution & Priority 10 Alert)
  const handleReportDelay = (jobId, reasonType, notes) => {
    const targetJob = jobs.find(j => j.id === jobId) || selectedJob;
    const cancellationReasonStr = notes ? `${reasonType} — ${notes}` : reasonType;

    const updatedJobState = {
      status: 'Cancelled',
      cancellationReason: cancellationReasonStr,
      cancelledBy: currentUser?.name || 'Rajesh Kumar',
      updatedAt: new Date().toISOString()
    };

    // 1. INSTANT Synchronous Local State & UI Lock (0ms delay)
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...updatedJobState } : j));
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(prev => ({ ...prev, ...updatedJobState }));
    }
    setDelayModalOpen(false);

    showToast(`Job cancelled successfully`);

    const alertId = `DISP-ALERT-${Date.now()}`;
    const alertItem = {
      id: alertId,
      jobId: jobId,
      title: `🚨 MID-SERVICE CANCELLATION REQUEST - #${jobId}`,
      time: 'Just now',
      address: targetJob?.location || '104 MG Road, Kodialbail, Mangaluru',
      priority: 'Priority Level 10',
      category: 'CANCELLATION',
      type: 'URGENT',
      icon: '🚫',
      colorClass: 'bg-rose-50 border-rose-200 hover:border-rose-400',
      iconBg: 'bg-rose-100 text-rose-700 font-bold',
      customerName: targetJob?.customerName || 'Customer',
      customerPhone: targetJob?.customerPhone || '',
      technicianName: currentUser?.name || 'Rajesh Kumar',
      technicianPhone: currentUser?.phone || '+91 98765 43210',
      targetDispatcher: DISPATCHER_EMAIL,
      region: MANGALURU_REGION,
      reasonType: reasonType,
      notes: cancellationReasonStr,
      price: targetJob?.price ? `${targetJob.price.toFixed(2)}` : '499.00',
      createdAt: new Date().toISOString()
    };

    // 2. Broadcast local events instantly for Dispatcher UI updates
    try {
      const localData = JSON.parse(localStorage.getItem('fixmate_urgent_dispatches') || '[]');
      localStorage.setItem('fixmate_urgent_dispatches', JSON.stringify([alertItem, ...localData]));
      window.dispatchEvent(new Event('fixmate_dispatch_updated'));
      window.dispatchEvent(new CustomEvent('fixmate_job_status_updated', { detail: { jobId, status: 'Cancelled', cancellationReason: cancellationReasonStr } }));
    } catch(e) {}

    // 3. Background Persistence
    const cancelPayload = {
      id: jobId,
      jobId: jobId,
      status: 'Cancelled',
      cancellationReason: cancellationReasonStr,
      cancelledBy: currentUser?.name || 'Rajesh Kumar',
      updatedAt: new Date().toISOString()
    };

    const logId = `LOG-${Date.now()}`;
    const auditPayload = {
      id: logId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      event: `🚨 MID-SERVICE CANCELLATION REQUEST for Job #${jobId} by ${currentUser?.name || 'Rajesh Kumar'}. Reason: "${cancellationReasonStr}"`,
      user: currentUser?.name || 'Rajesh Kumar',
      role: 'technician',
      jobId: jobId,
      priority: 'URGENT',
      createdAt: new Date().toISOString()
    };

    fetch('/api/dispatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertItem)
      }).catch(err => console.warn('Cancellation sync error:', err));
  };

  // Auth Handler
  const handleAuthSuccess = (userData, message) => {
    setCurrentUser(userData);
    showToast(message);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout error:', err);
    }

    try {
      localStorage.removeItem('fixmate_user');
      localStorage.removeItem('fixmate_tech_availability');
      localStorage.removeItem('fixmate_assigned_jobs');
      localStorage.removeItem('fixmate_urgent_dispatches');
    } catch (e) {}

    setJobs([]);
    setSelectedJob(null);
    setEmergencyList([]);
    setRatingsList([]);
    setNotifications([]);
    setCurrentUser(null);

    showToast('🔒 Logged out successfully! Account state cleared.');

    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const getPageTitle = () => {
    if (selectedJob) return `Job Details: #${selectedJob.id}`;
    switch (activeTab) {
      case 'dashboard': return 'Technician Hub — Mangaluru Region';
      case 'jobs': return 'Assigned Jobs Hub (Mangaluru)';
      case 'emergency': return 'Emergency Requests (Mangaluru)';
      case 'performance': return 'Performance & Analytics';
      case 'profile': return 'Technician Profile & Settings';
      default: return 'Technician Portal — Mangaluru';
    }
  };

  return (
    <ProtectedRoute allowedRole="technician">
      <div className="min-h-screen bg-[#EEF4ED] dark:bg-slate-950 text-[#0B2545] dark:text-slate-100 font-sans flex flex-col antialiased selection:bg-[#134074] selection:text-white transition-colors duration-200">
        
        {/* Left-stuck Hover-expandable Sidebar */}
        <TechDesktopSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedJob(null);
          }}
          availability={availability}
          onToggleAvailability={handleToggleAvailability}
          pendingCount={jobs.filter(j => j.status === 'Assigned' || j.status === 'In Progress').length}
          emergencyCount={emergencyList.length}
          maxDailyCapacity={MAX_DAILY_CAPACITY}
          onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
          currentUser={currentUser}
        />

        {/* Main Content Area: Offset by the 64px (md:pl-16) collapsed sidebar width */}
        <div className="md:pl-16 flex flex-col flex-1 min-w-0 transition-all duration-300">
          <TechHeader 
            title={getPageTitle()}
            availability={availability}
            onToggleAvailability={handleToggleAvailability}
            notifications={notifications}
            onTriggerEmergency={() => setEmergencyModalOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setSelectedJob(null);
            }}
            currentUser={currentUser}
            onLogout={handleLogout}
          />

          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
          {selectedJob ? (
            <div className="animate-in fade-in duration-300">
              <TechJobDetail 
                job={selectedJob}
                onBack={() => setSelectedJob(null)}
                onUpdateStatus={handleUpdateStatus}
                onOpenExtraCharges={() => setExtraChargesModalOpen(true)}
                onOpenReportDelay={() => setDelayModalOpen(true)}
              />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="animate-in fade-in duration-300">
                  <TechDashboard 
                    jobs={jobs}
                    onSelectJob={(j) => setSelectedJob(j)}
                    onViewAllJobs={() => setActiveTab('jobs')}
                    onTriggerEmergency={() => setEmergencyModalOpen(true)}
                    maxCapacity={MAX_DAILY_CAPACITY}
                    avgRating={avgRating}
                    positivePercentage={positivePercentage}
                  />
                </div>
              )}

              {activeTab === 'jobs' && (
                <div className="animate-in fade-in duration-300">
                  <TechJobList 
                    jobs={jobs}
                    onSelectJob={(j) => setSelectedJob(j)}
                  />
                </div>
              )}

              {activeTab === 'emergency' && (
                <div className="animate-in fade-in duration-300 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/60 dark:border-slate-800 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#0B2545] dark:text-white">Emergency Requests</h3>
                      <p className="text-xs text-slate-500 font-normal mt-1">Urgent service calls and accepted emergency jobs</p>
                    </div>
                    {emergencyList.length > 0 && (
                      <button 
                        onClick={() => setEmergencyModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <span>View Emergency Calls ({emergencyList.length})</span>
                      </button>
                    )}
                  </div>

                  {emergencyList.length > 0 && (
                    <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                      <div>
                        <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">{emergencyList.length} Emergency Call{emergencyList.length > 1 ? 's' : ''} Available</h4>
                        <p className="text-xs text-rose-700 dark:text-rose-300 font-normal mt-0.5">Available emergency requests in your service zone.</p>
                      </div>
                      <button 
                        onClick={() => setEmergencyModalOpen(true)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all shrink-0"
                      >
                        View Requests
                      </button>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Assigned Emergency Jobs</h4>
                    <TechJobList 
                      jobs={jobs.filter(j => j.isEmergency || j.tag === 'EMERGENCY')}
                      onSelectJob={(j) => setSelectedJob(j)}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="animate-in fade-in duration-300">
                  <TechPerformance 
                    jobs={jobs}
                    currentUser={currentUser}
                    availability={availability}
                    ratingsList={ratingsList}
                    avgRating={avgRating}
                    positivePercentage={positivePercentage}
                  />
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="animate-in fade-in duration-300">
                  <TechProfile 
                    availability={availability}
                    onToggleAvailability={handleToggleAvailability}
                    currentUser={currentUser}
                    onUpdateProfile={(updated) => setCurrentUser(prev => ({ ...prev, ...updated }))}
                    onLogout={handleLogout}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
        <TechAuthModal 
          isOpen={authModal.isOpen}
          mode={authModal.mode}
          onClose={() => setAuthModal({ ...authModal, isOpen: false })}
          onAuthSuccess={handleAuthSuccess}
        />

        <TechEmergencyModal 
          isOpen={emergencyModalOpen}
          emergencyList={emergencyList}
          onAccept={handleAcceptEmergency}
          onDecline={() => setEmergencyModalOpen(false)}
        />

        <TechExtraChargesModal 
          isOpen={extraChargesModalOpen}
          job={selectedJob}
          onClose={() => setExtraChargesModalOpen(false)}
          onAddCharges={handleAddExtraCharges}
        />

        <TechDelayModal 
          isOpen={delayModalOpen}
          job={selectedJob}
          onClose={() => setDelayModalOpen(false)}
          onReportDelay={handleReportDelay}
        />

        {/* Floating Toast Notice */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[3000] bg-[#134074] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-medium border border-white/20 animate-in slide-in-from-bottom duration-300">
            <Info className="w-4 h-4 text-[#8DA9C4] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
