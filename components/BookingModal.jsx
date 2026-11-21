'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function BookingModal({ isOpen, selectedService, onClose, onShowToast }) {
  const [catalog, setCatalog] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [price, setPrice] = useState(0);
  const [address, setAddress] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [loadingServices, setLoadingServices] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load services catalog from database when opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadCatalog() {
      try {
        setLoadingServices(true);
        const res = await fetch('/api/services');
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setCatalog(json.data);

          // If a service was pre-selected, find and use it
          if (selectedService?.id) {
            const match = json.data.find(s => s.id === selectedService.id);
            if (match) {
              setSelectedServiceId(match.id);
              setPrice(match.price);
              return;
            }
          }

          // Otherwise select first service
          if (json.data.length > 0) {
            setSelectedServiceId(json.data[0].id);
            setPrice(json.data[0].price);
          }
        }
      } catch (err) {
        console.error('Error fetching services catalog:', err);
      } finally {
        if (isMounted) setLoadingServices(false);
      }
    }

    // Pre-fill user profile address
    async function loadUserProfile() {
      try {
        const res = await fetch('/api/users/profile');
        const json = await res.json();
        if (isMounted && json.success && json.data?.address) {
          setAddress(json.data.address);
        }
      } catch (err) {}
    }

    loadCatalog();
    loadUserProfile();

    return () => { isMounted = false; };
  }, [isOpen, selectedService]);

  if (!isOpen) return null;

  const handleServiceChange = (e) => {
    const sId = e.target.value;
    setSelectedServiceId(sId);
    const chosen = catalog.find(s => s.id === sId);
    if (chosen) {
      setPrice(chosen.price);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const chosenService = catalog.find(s => s.id === selectedServiceId);
    const serviceName = chosenService?.name || selectedService?.name || 'General Service';
    const categoryName = chosenService?.category || selectedService?.category || 'Plumbing';

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          service: serviceName,
          category: categoryName,
          price,
          address,
          dateTime,
        }),
      });
      const data = await res.json();
      if (data.success && data.booking) {
        onShowToast?.(`Booking Confirmed! (${data.booking.id}) Scheduled.`);
      } else {
        onShowToast?.(data.error || 'Failed to submit booking.');
      }
    } catch (err) {
      onShowToast?.('Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        <div className="bg-slate-50 dark:bg-slate-800/80 px-7 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-[#134074] dark:text-blue-400">Book a Service</h3>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Service Catalog</label>
            {loadingServices ? (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading available services...</span>
              </div>
            ) : (
              <select 
                value={selectedServiceId}
                onChange={handleServiceChange}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-[#0B2545] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              >
                {catalog.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category}) — ₹{s.price}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Service Address</label>
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 104 MG Road, Kodialbail, Mangaluru" 
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Preferred Date & Time</label>
            <input 
              type="datetime-local" 
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
              required 
            />
          </div>

          <div className="bg-[#EEF4ED] dark:bg-slate-800/90 p-4 rounded-xl flex justify-between items-center text-sm font-bold text-[#0B2545] dark:text-white border border-powderBlue/20 dark:border-slate-700">
            <span>Estimated Upfront Cost:</span>
            <span className="text-2xl font-black text-[#134074] dark:text-blue-400">₹{price}</span>
          </div>

          <button 
            type="submit" 
            disabled={submitting || loadingServices}
            className="w-full bg-[#134074] hover:bg-[#13315C] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Confirming Booking...' : 'Confirm Instant Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
