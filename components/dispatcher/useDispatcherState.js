import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useDispatcherState() {
  const router = useRouter();
  
  // Single Dispatcher Email (Demo Scale)
  const DISPATCHER_EMAIL = 'dispatcher@1tapfix.com';
  
  // Dashboard Status State
  const [dispatcherStatus, setDispatcherStatus] = useState('Online');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTabState] = useState('dashboard'); // dashboard, requests, technicians, map, logs

  // Restore activeTab on mount from URL search params or localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTab = urlParams.get('tab');
      const savedTab = localStorage.getItem('fixmate_dispatcher_active_tab');
      const validTabs = ['dashboard', 'requests', 'technicians', 'map', 'logs'];
      
      const tabToUse = (urlTab && validTabs.includes(urlTab)) 
        ? urlTab 
        : (savedTab && validTabs.includes(savedTab)) 
        ? savedTab 
        : 'dashboard';

      setActiveTabState(tabToUse);
    }
  }, []);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fixmate_dispatcher_active_tab', tab);
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url.toString());
      } catch(e) {}
    }
  };

  // Service Requests specific states
  const [selectedServiceType, setSelectedServiceType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [requests, setRequests] = useState([]);

  // Urgent dispatches loaded dynamically from /api/dispatches
  const [dispatches, setDispatches] = useState([]);

  // Data fetcher for Bookings & Emergency Requests
  useEffect(() => {
    let isMounted = true;

    const getServiceType = (docCategory, docService) => {
      const cat = (docCategory || docService || '').toLowerCase();
      if (cat.includes('plumb')) return 'Plumbing';
      if (cat.includes('elect')) return 'Electrical';
      if (cat.includes('ac_') || cat.includes('ac ') || cat.includes('hvac') || cat.includes('air conditioning')) return 'AC Maintenance';
      if (cat.includes('appliance')) return 'Appliance';
      if (cat.includes('clean')) return 'Cleaning';
      if (cat.includes('carpen')) return 'Carpentry';
      if (cat.includes('paint')) return 'Painting';
      if (cat.includes('pest')) return 'Pest Control';
      return docService || docCategory || 'Other';
    };

    const getServiceColor = (serviceType) => {
      const s = serviceType.toLowerCase();
      if (s.includes('plumb')) return 'bg-blue-100 text-blue-700';
      if (s.includes('elect')) return 'bg-yellow-100 text-yellow-800';
      if (s.includes('ac ') || s.includes('ac_') || s.includes('hvac') || s.includes('air conditioning') || s.includes('maintenance')) return 'bg-indigo-100 text-indigo-800';
      if (s.includes('appliance')) return 'bg-slate-200 text-slate-800';
      if (s.includes('clean')) return 'bg-emerald-100 text-emerald-800';
      if (s.includes('carpen')) return 'bg-amber-100 text-amber-800';
      if (s.includes('paint')) return 'bg-purple-100 text-purple-800';
      if (s.includes('pest')) return 'bg-red-100 text-red-800';
      return 'bg-slate-100 text-slate-700';
    };

    const fetchBookingsData = async () => {
      try {
        const res = await fetch('/api/bookings');
        const json = await res.json();
        if (!isMounted || !json?.success || !Array.isArray(json.data)) return;

        const mapped = json.data.map(b => {
          const rawStatus = b.status || (b.isEmergency ? 'Emergency Pending' : 'Pending');
          let status = 'UNASSIGNED';
          const s = rawStatus.toUpperCase();
          if (s.includes('PENDING') || s === 'UNASSIGNED') {
            status = 'UNASSIGNED';
          } else if (s.includes('COMPLETED') || s.includes('FINISHED') || s.includes('DONE')) {
            status = 'COMPLETED';
          } else if (s.includes('CANCEL')) {
            status = 'CANCELLED';
          } else if (s.includes('WAY') || s.includes('REACHED') || s.includes('START') || s.includes('PROGRESS') || s.includes('ACTIVE') || s.includes('TRANSIT')) {
            status = 'IN-PROGRESS';
          } else if (s.includes('ASSIGN') || s.includes('ACCEPT') || b.technician_id || b.technicianName) {
            status = 'ASSIGNED';
          }

          const serviceType = getServiceType(b.category, b.service);
          const serviceColor = getServiceColor(serviceType);

          return {
            id: b.id,
            jobId: b.id,
            reqId: b.id,
            customer: b.customerName || b.customerEmail || 'Customer',
            customerName: b.customerName || b.customerEmail || 'Customer',
            customerPhone: b.customerPhone || b.phone || '+91 98765 43210',
            location: b.address || 'Mangaluru',
            address: b.address || 'Mangaluru',
            service: b.service || 'General Service',
            serviceType,
            serviceColor,
            serviceIcon: '',
            trade: serviceType,
            category: serviceType.toUpperCase(),
            price: Number(b.price || (b.isEmergency ? 1499 : 499)),
            time: b.time || '10:00 AM',
            rawStatus,
            status,
            isEmergency: Boolean(b.isEmergency),
            assignedTech: b.technicianName || null,
            technicianName: b.technicianName || null,
            notes: b.notes || '',
            date: b.scheduled_at || b.createdAt || new Date().toISOString()
          };
        });

        setRequests(mapped);

        const dynamicActivities = mapped.slice(0, 5).map((r, idx) => ({
          id: r.id || idx,
          text: `${r.service} (${r.id}) ${r.assignedTech ? `assigned to ${r.assignedTech}` : 'is unassigned'}`,
          time: r.time || 'Today',
          meta: r.serviceType || 'Service',
          rating: r.isRated ? 'Rated' : null,
          type: r.status === 'COMPLETED' ? 'success' : r.isEmergency ? 'warning' : 'info',
          dotColor: r.status === 'COMPLETED' ? 'bg-emerald-500' : r.isEmergency ? 'bg-rose-500' : 'bg-blue-500',
        }));
        setActivities(dynamicActivities);

        const dynamicLogs = mapped.slice(0, 8).map((r) => ({
          timestamp: r.time || '10:00 AM',
          event: `${r.service} (#${r.id}) status: ${r.rawStatus || r.status}`,
          user: r.assignedTech || r.customer || 'System',
        }));
        setLogs(dynamicLogs);
      } catch (err) {
        console.warn('Error fetching dispatcher bookings:', err);
      }
    };

    fetchBookingsData();

    const handleStatusUpdateEvent = (e) => {
      let detail = e?.detail;
      if (!detail && e?.key === 'fixmate_last_job_status_update' && e?.newValue) {
        try { detail = JSON.parse(e.newValue); } catch(err) {}
      }
      if (!detail) {
        try {
          const raw = localStorage.getItem('fixmate_last_job_status_update');
          if (raw) detail = JSON.parse(raw);
        } catch(err) {}
      }

      const targetJobId = detail?.id || detail?.jobId;
      const targetStatus = detail?.status;
      const targetTech = detail?.technicianName || detail?.assignedTechName || detail?.assignedTech || detail?.techName;

      if (targetStatus && (targetJobId || targetTech)) {
        setRequests(prev => prev.map(r => {
          const isTarget = (targetJobId && r.id === targetJobId) || 
            (targetTech && r.assignedTech && (
              r.assignedTech.toLowerCase() === targetTech.toLowerCase() ||
              targetTech.toLowerCase().includes(r.assignedTech.toLowerCase()) ||
              r.assignedTech.toLowerCase().includes(targetTech.toLowerCase())
            ));

          if (isTarget) {
            const rawStatus = targetStatus;
            let normStatus = 'IN-PROGRESS';
            const s = targetStatus.toUpperCase();
            if (s.includes('COMPLET') || s.includes('DONE')) normStatus = 'COMPLETED';
            else if (s.includes('CANCEL')) normStatus = 'CANCELLED';
            else if (s.includes('UNASSIGN')) normStatus = 'UNASSIGNED';
            else if (s.includes('ASSIGN') || s.includes('ACCEPT')) normStatus = 'ASSIGNED';

            return {
              ...r,
              rawStatus,
              status: normStatus
            };
          }
          return r;
        }));
      }
    };

    window.addEventListener('fixmate_job_status_updated', handleStatusUpdateEvent);
    window.addEventListener('storage', handleStatusUpdateEvent);

    return () => {
      isMounted = false;
      window.removeEventListener('fixmate_job_status_updated', handleStatusUpdateEvent);
      window.removeEventListener('storage', handleStatusUpdateEvent);
    };
  }, []);

  // Tab 2 Metrics calculations
  const unassignedRequestsCount = useMemo(() => {
    return requests.filter(r => r.status === 'UNASSIGNED').length;
  }, [requests]);

  const inProgressRequestsCount = useMemo(() => {
    return requests.filter(r => r.status === 'ASSIGNED' || r.status === 'IN-PROGRESS').length;
  }, [requests]);

  const completedRequestsCount = useMemo(() => {
    return requests.filter(r => r.status === 'COMPLETED').length;
  }, [requests]);
  
  // Toast notifications state
  const [toast, setToast] = useState(null);
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  // Metrics States
  const activeJobsCount = useMemo(() => {
    return requests.filter(r => r.status === 'ASSIGNED' || r.status === 'IN-PROGRESS').length;
  }, [requests]);

  const totalRequestsCount = useMemo(() => {
    return requests.length;
  }, [requests]);

  const emergencyRequests = useMemo(() => {
    return requests.filter(r => r.isEmergency && r.status === 'UNASSIGNED');
  }, [requests]);

  const pendingEmergenciesCount = useMemo(() => {
    return emergencyRequests.length;
  }, [emergencyRequests]);
  
  const [notifications, setNotifications] = useState([]);

  // Dispatcher alerts / notifications
  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      try {
        const res = await fetch('/api/notifications');
        const json = await res.json();
        if (isMounted && json?.success && Array.isArray(json.data)) {
          setNotifications(json.data.map(n => ({
            id: n.id,
            title: n.title || 'System Alert',
            message: n.message || 'No additional details.',
            time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            createdAt: n.created_at
          })));
        }
      } catch (e) {
        console.warn('Error fetching dispatcher alerts:', e);
      }
    }
    loadNotifications();
    return () => { isMounted = false; };
  }, []);

  // Dynamic subscription for Urgent Broadcasts from /api/dispatches & LocalStorage
  useEffect(() => {
    let isMounted = true;
    async function loadDispatches() {
      try {
        const res = await fetch('/api/dispatches');
        const json = await res.json();
        const apiDispatches = (json?.success && Array.isArray(json.data)) ? json.data : [];

        const localData = (() => {
          try {
            const list = JSON.parse(localStorage.getItem('fixmate_urgent_dispatches') || '[]');
            return list.filter(d => {
              const s = (d.status || '').toUpperCase();
              return s !== 'ASSIGNED' && !s.includes('ASSIGN') && !s.includes('COMPLET');
            });
          } catch(e) { return []; }
        })();

        const combined = [...apiDispatches, ...localData];
        const uniqueMap = new Map();
        combined.forEach(item => {
          if (!item) return;
          const key = item.jobId || item.reqId || item.id;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          } else {
            const existing = uniqueMap.get(key);
            uniqueMap.set(key, { ...existing, ...item });
          }
        });
        if (isMounted) setDispatches(Array.from(uniqueMap.values()));
      } catch(err) {
        console.warn('Dispatches error:', err);
      }
    }
    loadDispatches();
    return () => { isMounted = false; };
  }, []);

  // Technicians List
  const [technicians, setTechnicians] = useState([]);

  // Technicians Roster from /api/technicians
  useEffect(() => {
    let isMounted = true;
    async function loadTechnicians() {
      try {
        const res = await fetch('/api/technicians');
        const json = await res.json();
        if (isMounted && json?.success && Array.isArray(json.data)) {
          const mappedTechs = json.data.map(t => {
            const rawStatus = t.status || 'Available';
            const formattedStatus = rawStatus === 'ONLINE' ? 'Available' : rawStatus === 'BUSY' ? 'Busy' : rawStatus;
            return {
              id: t.id,
              name: t.name || 'Technician',
              assigned: Math.min(6, t.assigned || 0),
              completed: t.completedJobs || 0,
              travel: 1,
              status: formattedStatus,
              specialty: t.specialization || 'Plumbing',
              zone: 'Kodialbail & Hampankatta, Mangaluru',
              phone: t.mobile || t.phone || ''
            };
          });
          setTechnicians(mappedTechs);
        }
      } catch(err) {
        console.warn('Technicians fetch error:', err);
      }
    }
    loadTechnicians();
    return () => { isMounted = false; };
  }, []);

  // Live Technicians (Strictly derived from database assigned/accepted jobs)
  const liveTechnicians = useMemo(() => {
    const knownCoords = {
      kodialbail: { x: 260, y: 240 },
      hampankatta: { x: 320, y: 280 },
      kadri: { x: 420, y: 210 },
      bejai: { x: 380, y: 180 },
      lalbagh: { x: 330, y: 200 },
      padil: { x: 540, y: 320 },
      kavoor: { x: 450, y: 130 },
      urwa: { x: 220, y: 170 },
      attavar: { x: 280, y: 340 },
      surathkal: { x: 180, y: 120 },
      kulshekar: { x: 500, y: 250 },
      falnir: { x: 310, y: 310 }
    };

    const hashStr = (str) => {
      let hash = 0;
      for (let i = 0; i < (str || '').length; i++) {
        hash = (str || '').charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    };

    // Filter requests that are assigned or accepted and currently active
    const assignedRequests = requests.filter(r => {
      if (!r) return false;
      const statusUpper = (r.status || '').toUpperCase();
      if (statusUpper === 'UNASSIGNED' || statusUpper === 'CANCELLED' || statusUpper === 'COMPLETED') return false;

      // Strictly exclude CANCELLATION alert dispatches
      if (r.category === 'CANCELLATION' || (typeof r.title === 'string' && r.title.toUpperCase().includes('CANCELLATION'))) return false;

      const raw = (r.rawStatus || r.status || '').toLowerCase();
      if (raw.includes('cancel')) return false;

      const hasTech = Boolean(r.assignedTech || r.technicianName || r.assignedTechName || r.assignedTo);
      const isActiveStatus = ['assigned', 'accepted', 'on the way', 'in transit', 'enroute', 'reached location', 'reached', 'service started', 'in-progress', 'in progress', 'busy'].some(s => raw.includes(s));
      return hasTech && isActiveStatus;
    });

    // Sort newer jobs first
    assignedRequests.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    const activeList = [];
    const processedTechNames = new Set();

    assignedRequests.forEach(req => {
      const techName = req.assignedTech || req.technicianName || req.assignedTechName || req.assignedTo || 'Technician';
      const techKey = techName.toLowerCase().trim();

      // Exclude technicians who cancelled this specific job
      const cancelledList = [
        req.cancelledBy,
        req.cancelledTechName,
        req.cancelledByTechName,
        ...(Array.isArray(req.cancelledTechs) ? req.cancelledTechs : []),
        ...(Array.isArray(req.cancelledByList) ? req.cancelledByList : [])
      ].filter(Boolean).map(s => String(s).toLowerCase().trim());

      if (cancelledList.some(c => c === techKey || techKey.includes(c) || c.includes(techKey))) {
        return;
      }
      
      // Ensure each technician only appears ONCE in the active fleet list
      if (processedTechNames.has(techKey)) return;
      processedTechNames.add(techKey);

      const techObj = technicians.find(t => 
        t.name.toLowerCase() === techKey ||
        techKey.includes(t.name.toLowerCase()) ||
        t.name.toLowerCase().includes(techKey)
      );

      const techId = techObj?.id || `tech_${hashStr(techName)}`;

      // Check localStorage for any job status override
      const lastStatusUpdate = (() => {
        if (typeof window === 'undefined') return null;
        try {
          const raw = localStorage.getItem('fixmate_last_job_status_update');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.status) {
              const targetTech = parsed.technicianName || parsed.assignedTechName || parsed.assignedTech || parsed.techName;
              const targetJobId = parsed.jobId || parsed.id;
              if (req.id === targetJobId || (targetTech && targetTech.toLowerCase() === techKey)) {
                return parsed.status;
              }
            }
          }
        } catch(e) {}

        try {
          const jobSpecific = localStorage.getItem(`fixmate_job_status_${req.id}`);
          if (jobSpecific) return jobSpecific;
        } catch(e) {}
        return null;
      })();

      const currentStatus = lastStatusUpdate || req.rawStatus || req.status || 'Assigned';
      if (currentStatus.toLowerCase().includes('complete') || currentStatus.toLowerCase().includes('cancel')) {
        return;
      }
      const dbLoc = req.location || req.address || techObj?.zone || 'Mangaluru';

      // Compute dynamic SVG coordinates (cx, cy) from Database Location + Request ID
      const locKey = Object.keys(knownCoords).find(k => dbLoc.toLowerCase().includes(k));
      let baseCx = 350;
      let baseCy = 250;
      if (locKey) {
        baseCx = knownCoords[locKey].x;
        baseCy = knownCoords[locKey].y;
      } else {
        const h = hashStr(dbLoc);
        baseCx = 180 + (h % 440);
        baseCy = 140 + ((h >> 3) % 280);
      }

      const reqHash = hashStr(req.id || techName);
      // Small offset to ensure multiple markers near same area don't overlap exactly
      const offsetX = ((reqHash % 9) - 4) * 16;
      const offsetY = (((reqHash >> 2) % 9) - 4) * 16;
      const cx = Math.max(120, Math.min(680, baseCx + offsetX));
      const cy = Math.max(100, Math.min(460, baseCy + offsetY));

      const initials = techName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'TK';

      // Dynamic timestamps per technician / job
      const assignedMinAgo = Math.max(5, (reqHash % 40) + 10);
      const acceptedMinAgo = Math.max(2, Math.floor(assignedMinAgo * 0.6));
      const onWayMinAgo = Math.max(1, Math.floor(assignedMinAgo * 0.3));

      activeList.push({
        id: techId,
        jobId: req.id,
        name: techName,
        phone: techObj?.phone || '+91 98765 43210',
        role: req.service || req.title || techObj?.specialty || 'Technician',
        activeJobTitle: req.service || req.title || 'Service Request',
        eta: `${5 + (reqHash % 15)} MIN`,
        destination: dbLoc,
        currentLocation: dbLoc,
        status: currentStatus,
        progress: currentStatus.toLowerCase().includes('start') ? 75 : currentStatus.toLowerCase().includes('reach') ? 50 : 25,
        initials,
        cx,
        cy,
        assignedTimeLabel: `${assignedMinAgo}m ago`,
        acceptedTimeLabel: `${acceptedMinAgo}m ago`,
        onWayTimeLabel: `${onWayMinAgo}m ago`
      });
    });

    return activeList;
  }, [technicians, requests]);

  const [selectedTechForStatus, setSelectedTechForStatus] = useState(null);

  const handleTechStatusChange = async (techId, newStatus) => {
    let dbStatus = 'Available';
    if (newStatus === 'Service Started' || newStatus === 'Busy') {
      dbStatus = 'Busy';
    } else if (newStatus === 'Offline') {
      dbStatus = 'Offline';
    }

    try {
      const res = await fetch(`/api/technicians/${techId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: dbStatus, availability: dbStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update technician status');
      }

      setTechnicians(prev => prev.map(t => t.id === techId ? { ...t, status: dbStatus } : t));
      showToast(`Status of technician updated to ${newStatus}.`);
    } catch (err) {
      console.error("Error updating technician status:", err);
      showToast("❌ Failed to update technician status.");
    }
    setSelectedTechForStatus(null);
  };

  // Live Activity Stream dynamically populated from database
  const [activities, setActivities] = useState([]);

  // All logs dynamically populated from database events
  const [logs, setLogs] = useState([]);

  // Modals States
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [newRequestData, setNewRequestData] = useState({
    title: '',
    customerName: '',
    customerPhone: '',
    address: '',
    category: 'PLUMBING',
    service: '',
    price: '',
    type: 'RESIDENTIAL',
    date: '',
    timeSlot: '',
    requestPreviousTechnician: false,
    isEmergency: false,
    notes: ''
  });
  
  const [assigningDispatch, setAssigningDispatch] = useState(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Search Filter
  const filteredActivities = useMemo(() => {
    if (!searchQuery) return activities;
    return activities.filter(act => 
      act.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
      act.meta.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activities, searchQuery]);

  const enrichedTechnicians = useMemo(() => {
    return technicians.map(tech => {
      const techNameNorm = (tech.name || '').toLowerCase().trim();
      const techIdNorm = (tech.id || '').toLowerCase().trim();

      // Find database requests assigned to this technician
      const techRequests = requests.filter(r => {
        if (!r || r.status === 'UNASSIGNED' || r.status === 'CANCELLED') return false;
        const rTech = (r.assignedTech || r.technicianName || r.assignedTechName || r.assignedTo || '').toLowerCase().trim();
        if (!rTech) return false;

        return rTech === techNameNorm || 
               rTech === techIdNorm || 
               (techNameNorm && (rTech.includes(techNameNorm) || techNameNorm.includes(rTech)));
      });

      const activeJobsCount = techRequests.filter(r => r.status === 'ASSIGNED' || r.status === 'IN-PROGRESS').length;
      const completedFromRequests = techRequests.filter(r => r.status === 'COMPLETED').length;

      // Real completed count (max 6)
      const finalCompleted = Math.min(6, completedFromRequests > 0 ? completedFromRequests : (tech.completed || 0));

      // Real active assigned count: capped so (finalAssigned + finalCompleted) never exceeds 6 total jobs capacity
      const remainingCapacity = Math.max(0, 6 - finalCompleted);
      const finalAssigned = Math.min(remainingCapacity, activeJobsCount);

      return {
        ...tech,
        assigned: finalAssigned,
        completed: finalCompleted
      };
    });
  }, [technicians, requests]);

  const filteredTechnicians = useMemo(() => {
    if (!searchQuery) return enrichedTechnicians;
    return enrichedTechnicians.filter(tech => 
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.zone.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [enrichedTechnicians, searchQuery]);

  // Service Requests Filters & Pagination
  const filteredRequests = useMemo(() => {
    const statusPriority = { 'UNASSIGNED': 1, 'ASSIGNED': 2, 'IN-PROGRESS': 3, 'COMPLETED': 4 };
    return requests
      .filter(req => {
        if (selectedServiceType !== 'All' && req.service !== selectedServiceType) {
          return false;
        }
        if (selectedStatus !== 'All' && req.status !== selectedStatus) {
          return false;
        }
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesId = req.id.toLowerCase().includes(query);
          const matchesCustomer = req.customer.toLowerCase().includes(query);
          const matchesLocation = req.location.toLowerCase().includes(query);
          if (!matchesId && !matchesCustomer && !matchesLocation) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => (statusPriority[a.status] || 5) - (statusPriority[b.status] || 5));
  }, [requests, selectedServiceType, selectedStatus, searchQuery]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequests, currentPage]);

  const handleServiceTypeChange = (val) => {
    setSelectedServiceType(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleOpenAssignFromTable = (req) => {
    setAssigningDispatch({
      id: req.id,
      reqId: req.id,
      title: `${req.service} request`,
      time: 'Just now',
      address: req.customerAddress || req.address || req.location,
      priority: req.isEmergency ? 'Priority Level 10' : 'Priority Level 8',
      category: req.service.toUpperCase(),
      type: req.isEmergency ? 'URGENT' : 'RESIDENTIAL',
      icon: req.icon,
      isEmergency: req.isEmergency,
      collectionName: req.collectionName,
      customerName: req.customer,
      customerId: req.customerId,
      customerEmail: req.customerEmail,
      customerPhone: req.customerPhone,
      description: req.description,
      notes: req.notes,
      requestPreviousTechnician: Boolean(req.requestPreviousTechnician || req.requestPreviousTech),
      requestPreviousTech: Boolean(req.requestPreviousTechnician || req.requestPreviousTech),
      requestedTechName: req.requestedTechName || req.requestedTech || req.previousTechnicianName || req.previousTech || '',
      previousTechnicianName: req.previousTechnicianName || req.previousTech || '',
      techSpecialty: req.service,
      cancelledBy: req.cancelledBy,
      cancelledTechName: req.cancelledTechName,
      cancelledTechs: req.cancelledTechs,
      technicianName: req.assignedTech || req.cancelledTechName || req.cancelledBy
    });
  };

  const handleStartJob = async (id) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    
    try {
      await fetch('/api/bookings/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: id, status: 'In Progress' })
      });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'IN-PROGRESS', rawStatus: 'In Progress' } : r));
      showToast('⚡ Job ' + id + ' is now IN-PROGRESS.');
      
      setActivities(prev => [
        { id: Date.now(), text: 'Job ' + id + ' started', time: 'Just now', meta: 'Status updated to IN-PROGRESS', type: 'info', dotColor: 'bg-blue-500' },
        ...prev
      ]);
    } catch (err) {
      console.error("Error starting job:", err);
      showToast("❌ Failed to start job.");
    }
  };

  const handleCompleteJob = async (id) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    
    try {
      await fetch('/api/bookings/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: id, status: 'Completed' })
      });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'COMPLETED', rawStatus: 'Completed' } : r));

      const assignedTechName = req.assignedTech;
      if (assignedTechName) {
        setTechnicians(prev => prev.map(t => {
          if (t.name.toLowerCase() === assignedTechName.toLowerCase()) {
            return {
              ...t,
              assigned: Math.max(0, (t.assigned || 1) - 1),
              completed: (t.completed || 0) + 1
            };
          }
          return t;
        }));
      }

      showToast('✅ Job ' + id + ' marked as COMPLETED.');
      
      setActivities(prev => [
        { id: Date.now(), text: 'Job ' + id + ' completed', time: 'Just now', meta: 'Status updated to COMPLETED', type: 'success', dotColor: 'bg-emerald-500' },
        ...prev
      ]);
    } catch (err) {
      console.error("Error completing job:", err);
      showToast("❌ Failed to complete job.");
    }
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Request ID', 'Customer', 'Service Type', 'Status', 'Location'],
      ...filteredRequests.map(r => [r.id, r.customer, r.service, r.status, r.location])
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `service_requests_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported requests to CSV successfully!');
  };

  const handleOpenAssign = (dispatch) => {
    setAssigningDispatch(dispatch);
  };

  const handleConfirmAssignment = (techName) => {
    const targetDispatch = assigningDispatch || {};
    if (!targetDispatch) return;

    // 1. Close modal and show toast INSTANTLY (0ms latency!)
    setAssigningDispatch(null);
    showToast(`Successfully assigned ${techName}!`);

    const dispatchId = targetDispatch.id;
    const targetJobId = targetDispatch.jobId || targetDispatch.reqId || dispatchId;

    if (dispatchId) {
      setDispatches(prev => prev.filter(d => d.id !== dispatchId && d.id !== targetJobId && d.jobId !== dispatchId && d.jobId !== targetJobId));
      
      
      
      if (targetJobId && targetJobId !== dispatchId) {
        
        
      }

      fetch(`/api/dispatches/${dispatchId}`, { method: 'DELETE' }).catch(() => {});
      try {
        const local = JSON.parse(localStorage.getItem('fixmate_urgent_dispatches') || '[]');
        const updated = local.filter(d => d.id !== dispatchId && d.jobId !== dispatchId && d.id !== targetJobId && d.jobId !== targetJobId);
        localStorage.setItem('fixmate_urgent_dispatches', JSON.stringify(updated));
        window.dispatchEvent(new Event('fixmate_dispatch_updated'));
      } catch(e) {}
    }

    // Find if there is a corresponding booking in requests
    const requestItem = requests.find(r => (targetDispatch.id && r.id === targetDispatch.id) || (targetDispatch.reqId && r.id === targetDispatch.reqId));
    const selectedTech = technicians.find(t => t.name === techName);
    const targetId = requestItem?.id || targetDispatch.id || `JOB-${Date.now()}`;

    const existingCancelled = Array.isArray(targetDispatch.cancelledTechs) 
      ? targetDispatch.cancelledTechs 
      : (requestItem && Array.isArray(requestItem.cancelledTechs)) 
        ? requestItem.cancelledTechs 
        : [];
    const prevCanceller = targetDispatch.cancelledBy || targetDispatch.cancelledTechName || targetDispatch.technicianName;
    const mergedCancelledTechs = Array.from(new Set([...existingCancelled, prevCanceller].filter(Boolean)));

    const descriptionToKeep = requestItem?.description || targetDispatch.description || targetDispatch.notes || requestItem?.notes || 'Customer reported issue requiring on-site technician inspection.';
    const notesToKeep = requestItem?.notes || targetDispatch.notes || 'Assigned by Dispatcher';

    // Determine specific service/category trade name
    const combinedText = `${targetDispatch.title || ''} ${targetDispatch.category || ''} ${targetDispatch.service || ''} ${requestItem?.service || ''} ${requestItem?.category || ''}`.toLowerCase();
    let determinedTrade = '';
    if (combinedText.includes('carpen')) determinedTrade = 'Carpentry';
    else if (combinedText.includes('plumb')) determinedTrade = 'Plumbing';
    else if (combinedText.includes('elect')) determinedTrade = 'Electrical';
    else if (combinedText.includes('ac ') || combinedText.includes('ac_') || combinedText.includes('hvac') || combinedText.includes('air conditioning') || combinedText.includes('maintenance')) determinedTrade = 'AC Maintenance';
    else if (combinedText.includes('clean')) determinedTrade = 'Cleaning';
    else if (combinedText.includes('appliance') || combinedText.includes('microwave') || combinedText.includes('fridge') || combinedText.includes('washing')) determinedTrade = 'Appliance Repair';
    else if (combinedText.includes('paint')) determinedTrade = 'Painting';
    else if (combinedText.includes('pest')) determinedTrade = 'Pest Control';
    else {
      determinedTrade = targetDispatch.category || requestItem?.category || targetDispatch.title || requestItem?.service || 'Plumbing';
      // Clean up common prefixes/suffixes
      determinedTrade = determinedTrade
        .replace(/MID-SERVICE CANCELLATION REQUEST/gi, '')
        .replace(/CANCELLATION REQUEST/gi, '')
        .replace(/EMERGENCY/gi, '')
        .replace(/URGENT/gi, '')
        .replace(/Service Request/gi, '')
        .replace(/-?\s*#[A-Za-z0-9]+/g, '')
        .replace(/[-–—🚨⚡]/g, '')
        .trim() || 'Plumbing';
    }

    let resolvedCustomerName = requestItem?.customer || targetDispatch.customerName;
    if (!resolvedCustomerName || (techName && resolvedCustomerName.trim().toLowerCase() === techName.trim().toLowerCase())) {
      resolvedCustomerName = requestItem?.customerEmail || targetDispatch.customerEmail || 'Customer';
    }

    const jobPayload = {
      id: targetId,
      jobId: targetId,
      status: 'Assigned',
      technicianId: selectedTech?.id || selectedTech?.uid || 'tech_rajesh_kumar',
      technicianName: techName,
      assignedTechName: techName,
      technicianPhone: selectedTech?.phone || '+91 98765 43210',
      cancelledTechs: mergedCancelledTechs,
      cancelledBy: targetDispatch.cancelledBy || null,
      cancelledTechName: targetDispatch.cancelledTechName || null,
      
      // Preserve exact customer identity & description from database
      customerId: requestItem?.customerId || targetDispatch.customerId || 'walk-in-dispatcher',
      customerName: resolvedCustomerName,
      customerEmail: requestItem?.customerEmail || targetDispatch.customerEmail || '',
      customerPhone: requestItem?.customerPhone || targetDispatch.customerPhone || requestItem?.phone || '+91 98123 45678',
      description: descriptionToKeep,
      notes: notesToKeep,

      title: determinedTrade,
      category: determinedTrade,
      location: targetDispatch.address || targetDispatch.location || requestItem?.customerAddress || requestItem?.address || requestItem?.location || 'Mangaluru',
      address: targetDispatch.address || targetDispatch.location || requestItem?.customerAddress || requestItem?.address || requestItem?.location || 'Mangaluru',
      price: Number(targetDispatch.price || requestItem?.price || 499),
      isEmergency: Boolean(targetDispatch.priority?.includes('10') || requestItem?.isEmergency),
      time: targetDispatch.time || '09:30 AM',
      assignedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toISOString()
    };

    // Asynchronous backend updates
    (async () => {
      try {
        const existingLocal = JSON.parse(localStorage.getItem('fixmate_assigned_jobs') || '[]');
        const updatedLocal = [jobPayload, ...existingLocal.filter(j => j.id !== targetId)];
        localStorage.setItem('fixmate_assigned_jobs', JSON.stringify(updatedLocal));

        window.dispatchEvent(new CustomEvent('fixmate_job_assigned', { detail: jobPayload }));
        window.dispatchEvent(new Event('fixmate_dispatch_updated'));

        await fetch('/api/bookings/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobPayload)
        });
      } catch (err) {
        console.error("Error setting assignment in backend:", err);
      }
    })();

    setActivities(prev => [{
      id: Date.now(),
      text: `${targetDispatch.title || determinedTrade} assigned to ${techName}`,
      time: 'Just now',
      meta: `${targetDispatch.category || determinedTrade} • Assigned by Dispatcher`,
      type: 'info',
      dotColor: 'bg-blue-600'
    }, ...prev]);

    setLogs(prev => [{
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      event: `${targetDispatch.title || determinedTrade} assigned to ${techName}`,
      user: 'Dispatcher'
    }, ...prev]);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newRequestData.title || !newRequestData.address) return;

    const isEmerg = newRequestData.isEmergency;
    
    let categoryName = 'Plumbing';
    const catUpper = (newRequestData.category || '').toUpperCase();
    if (catUpper.includes('PLUMB')) categoryName = 'Plumbing';
    else if (catUpper.includes('ELECT')) categoryName = 'Electrical';
    else if (catUpper.includes('AC')) categoryName = 'AC Maintenance';
    else if (catUpper.includes('CARPEN')) categoryName = 'Carpentry';
    else if (catUpper.includes('CLEAN')) categoryName = 'Cleaning';
    else if (catUpper.includes('APPLIANCE')) categoryName = 'Appliance';
    else if (catUpper.includes('PAINT')) categoryName = 'Painting';
    else categoryName = newRequestData.category || 'Plumbing';

    const bookingData = {
      customerId: 'walk-in-dispatcher',
      customerName: newRequestData.customerName?.trim() || 'Walk-In Customer',
      customerEmail: 'dispatcher@1tapfix.com',
      customerPhone: newRequestData.customerPhone?.trim() || '',

      category: categoryName,
      service: newRequestData.service?.trim() || categoryName,
      price: newRequestData.price ? Number(newRequestData.price) : (isEmerg ? 1499 : 499),
      duration: '1-2 hrs',

      description: newRequestData.title,
      address: newRequestData.address,
      location: newRequestData.address,
      date: isEmerg ? null : (newRequestData.date || null),
      timeSlot: isEmerg ? null : (newRequestData.timeSlot || null),

      requestPreviousTechnician: Boolean(newRequestData.requestPreviousTechnician),
      isEmergency: isEmerg,

      notes: newRequestData.notes?.trim() || 'Created by dispatcher',
      status: isEmerg ? 'Emergency Pending' : 'Pending',

      technicianId: null,
      dispatcherId: DISPATCHER_EMAIL,

      createdAt: new Date().toISOString()
    };

    try {
      if (isEmerg) {
        await fetch('/api/emergency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emergencyType: categoryName,
            phone: newRequestData.customerPhone || '',
            address: newRequestData.address
          })
        });
      } else {
        await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: newRequestData.service || categoryName,
            address: newRequestData.address,
            dateTime: newRequestData.date ? (newRequestData.date + ' ' + (newRequestData.timeSlot || '')) : new Date().toISOString()
          })
        });
      }
      showToast('🔥 Created ' + (isEmerg ? 'Emergency' : 'Standard') + ' Request for "' + newRequestData.title + '"!');
    } catch (err) {
      console.error("Error creating request:", err);
      showToast("❌ Failed to create request.");
    }

    setActivities(prev => [
      { 
        id: Date.now(), 
        text: `New dispatch requested: ${newRequestData.title}`, 
        time: 'Just now', 
        meta: `${newRequestData.address}`, 
        type: isEmerg ? 'danger' : 'info',
        dotColor: isEmerg ? 'bg-rose-500' : 'bg-blue-500' 
      },
      ...prev
    ]);

    setLogs(prev => [
      { timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), event: `New dispatch created: ${newRequestData.title}`, user: 'Sarah Jenkins' },
      ...prev
    ]);

    setIsNewRequestOpen(false);
    setNewRequestData({
      title: '',
      customerName: '',
      customerPhone: '',
      address: '',
      category: 'PLUMBING',
      service: '',
      price: '',
      type: 'RESIDENTIAL',
      date: '',
      timeSlot: '',
      requestPreviousTechnician: false,
      isEmergency: false,
      notes: ''
    });
  };

  const staggeredMenuItems = [
    { label: 'Dashboard', ariaLabel: 'Dispatcher Dashboard', onClick: () => setActiveTab('dashboard') },
    { label: 'Requests', ariaLabel: 'View service requests', onClick: () => setActiveTab('requests') },
    { label: 'Technicians', ariaLabel: 'Manage technicians', onClick: () => setActiveTab('technicians') },
    { label: 'Live Map', ariaLabel: 'Live dispatch map', onClick: () => setActiveTab('map') },
    { label: 'Home', ariaLabel: 'Return to home landing page', link: '/' }
  ];

  const socialItems = [
    { label: 'New Request', onClick: () => setIsNewRequestOpen(true) },
    { label: 'Home', link: '/' }
  ];

  return {
    router,
    dispatcherStatus,
    setDispatcherStatus,
    showStatusDropdown,
    setShowStatusDropdown,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedServiceType,
    selectedStatus,
    currentPage,
    setCurrentPage,
    unassignedRequestsCount,
    inProgressRequestsCount,
    completedRequestsCount,
    toast,
    showToast,
    activeJobsCount,
    totalRequestsCount,
    pendingEmergenciesCount,
    dispatches,
    technicians,
    liveTechnicians,
    selectedTechForStatus,
    setSelectedTechForStatus,
    handleTechStatusChange,
    logs,
    setLogs,
    isNewRequestOpen,
    setIsNewRequestOpen,
    newRequestData,
    setNewRequestData,
    assigningDispatch,
    setAssigningDispatch,
    isMapExpanded,
    setIsMapExpanded,
    filteredActivities,
    filteredTechnicians,
    filteredRequests,
    totalPages,
    paginatedRequests,
    handleServiceTypeChange,
    handleStatusChange,
    handleOpenAssignFromTable,
    handleStartJob,
    handleCompleteJob,
    handleExportCSV,
    handleOpenAssign,
    handleConfirmAssignment,
    handleCreateRequest,
    staggeredMenuItems,
    socialItems,
    notifications,
    emergencyRequests
  };
}
