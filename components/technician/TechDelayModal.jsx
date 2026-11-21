'use client';
import { useState } from 'react';
import { Ban, X, Send, ShieldAlert } from 'lucide-react';

export default function TechDelayModal({ 
  isOpen, 
  job, 
  onClose, 
  onReportDelay 
}) {
  const [reasonType, setReasonType] = useState('Unable to Reach Customer');
  const [notes, setNotes] = useState('');

  if (!isOpen || !job) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = `Cancel Assignment: ${reasonType}`;

    if (onReportDelay) {
      onReportDelay(job.id, finalReason, notes);
    }
    setNotes('');
    onClose();
  };

  return (
    <div className="modal-overlay animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border-2 border-rose-500 dark:border-rose-600 relative space-y-6 transition-colors duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0 shadow-inner">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0A2540] dark:text-white">Cancel Job Assignment</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Urgent Dispatcher Alert</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Select Mandatory Cancellation Reason *
            </label>

            <div className="space-y-2">
              {[
                { key: 'Unable to Reach Customer', label: '📞 Unable to Reach Customer / No Answer' },
                { key: 'Customer Requested Cancellation', label: '❌ Customer Requested Cancellation' },
                { key: 'Invalid Address / Site Unreachable', label: '📍 Invalid Address / Site Unreachable' },
                { key: 'Technical Emergency Issue', label: '⚠️ Technical Emergency / Equipment Safety Issue' }
              ].map((opt) => (
                <label 
                  key={opt.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer font-bold transition-all ${
                    reasonType === opt.key 
                      ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="cancellationReason"
                    checked={reasonType === opt.key}
                    onChange={() => setReasonType(opt.key)}
                    className="accent-rose-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Additional Justification / Notes</label>
            <textarea 
              rows="3"
              placeholder="Provide specific details regarding why this assignment must be cancelled..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500 transition-all"
            />
          </div>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-[11px] font-semibold flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>
              🚨 Cancelling will immediately lock this job in Read-Only mode, reset your daily workload capacity, and send an Urgent Priority 10 Alert to the Dispatcher terminal.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-lg shadow-rose-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Cancel Job & Notify Dispatcher Immediately</span>
          </button>

        </form>

      </div>
    </div>
  );
}
