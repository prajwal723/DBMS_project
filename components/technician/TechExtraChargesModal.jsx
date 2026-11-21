'use client';
import { useState } from 'react';
import { PlusCircle, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TechExtraChargesModal({ 
  isOpen, 
  job, 
  onClose, 
  onAddCharges 
}) {
  const [laborCharge, setLaborCharge] = useState('');
  const [materialCharge, setMaterialCharge] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !job) return null;

  const fixedPrice = job.price || 0;
  const numLabor = parseFloat(laborCharge) || 0;
  const numMaterial = parseFloat(materialCharge) || 0;
  const totalExtra = numLabor + numMaterial;
  const newTotalBill = fixedPrice + (job.extraCharges || 0) + totalExtra;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (totalExtra <= 0) {
      setError('Please enter a valid additional charge amount greater than ₹0.');
      return;
    }

    if (!reason.trim()) {
      setError('Mandatory rule: Additional charges require a written justification reason.');
      return;
    }

    if (onAddCharges) {
      onAddCharges(job.id, totalExtra, reason.trim(), numLabor, numMaterial);
    }

    setLaborCharge('');
    setMaterialCharge('');
    setReason('');
    onClose();
  };

  return (
    <div className="modal-overlay animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative space-y-6 transition-colors duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#0A2540] dark:text-white">Add Additional Charges</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Job #{job.id} • Final Cost Calculation</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Base Price Display (Uneditable) */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex justify-between items-center">
            <span className="font-bold text-slate-500 dark:text-slate-400">Fixed Service Base Price (Locked)</span>
            <span className="font-extrabold text-[#0A2540] dark:text-white text-sm">₹{fixedPrice.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Additional Labour (₹)</label>
              <input 
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={laborCharge}
                onChange={(e) => setLaborCharge(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Additional Materials (₹)</label>
              <input 
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={materialCharge}
                onChange={(e) => setMaterialCharge(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reason / Justification (Required) *</label>
            <textarea 
              rows="3"
              required
              placeholder="e.g. Required replacement copper fitting and 45 mins extended pipe flushing."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Dynamic Summary */}
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex justify-between items-center text-xs font-bold text-blue-900 dark:text-blue-300">
            <span>New Calculated Total Bill:</span>
            <span className="text-sm font-black text-blue-700 dark:text-blue-400">₹{newTotalBill.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0A2540] hover:bg-[#13395F] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Update Bill</span>
          </button>

        </form>

      </div>
    </div>
  );
}
