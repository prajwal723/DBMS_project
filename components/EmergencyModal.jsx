'use client';
import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose, onShowToast }) {
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyType, setEmergencyType] = useState('Water Pipe Burst / Severe Leakage');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill user contact info if logged in
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchUserProfile() {
      try {
        const res = await fetch('/api/users/profile');
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          if (json.data.mobile) setPhone(json.data.mobile);
          if (json.data.address) setAddress(json.data.address);
        }
      } catch (err) {}
    }

    fetchUserProfile();
    return () => { isMounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emergencyType, phone, address })
      });
      const data = await res.json();

      if (data.success && data.dispatch) {
        // Dispatch local event for instant UI update
        try {
          window.dispatchEvent(new Event('fixmate_dispatch_updated'));
        } catch(err) {}

        const techMsg = data.dispatch.assignedTechnician && data.dispatch.assignedTechnician !== 'Pending Dispatch'
          ? `Tech (${data.dispatch.assignedTechnician}) assigned!`
          : `Dispatch alert sent to fleet.`;
        onShowToast?.(`EMERGENCY ALERT DISPATCHED! (${data.dispatch.id}) ${techMsg} ETA: ${data.dispatch.etaMinutes || 20} mins.`);
      } else {
        onShowToast?.(data.error || 'Failed to dispatch emergency response.');
      }
    } catch (err) {
      onShowToast?.('Failed to dispatch emergency response. Please call emergency hotline.');
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full mx-4 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 border-t-4 border-t-red-600 dark:border-t-red-500 transition-colors duration-200">
        <div className="bg-red-50 dark:bg-rose-950/40 px-7 py-6 border-b border-red-100 dark:border-rose-900/50 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span>24/7 Emergency Dispatch</span>
          </h3>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-red-700 dark:hover:text-white">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Nearest emergency technician dispatched within 45 minutes guaranteed across Mangaluru and service regions.</p>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Emergency Issue</label>
            <select 
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-[#0B2545] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option>Water Pipe Burst / Severe Leakage</option>
              <option>Power Outage / Short Circuit</option>
              <option>Gas Appliance Hazard</option>
              <option>Emergency Lockout</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Contact Phone Number</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210" 
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50" 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Current Location Address</label>
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 104 MG Road, Kodialbail, Mangaluru" 
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Dispatching Response Unit...</span>
              </>
            ) : (
              <span>Dispatch Emergency Technician Now</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
