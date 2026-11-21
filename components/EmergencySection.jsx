'use client';
import { PhoneCall, ShieldAlert } from 'lucide-react';

export default function EmergencySection({ onOpenEmergency }) {
  return (
    <section id="emergency" className="py-24 sm:py-28 md:py-32 bg-mintCream dark:bg-slate-950 border-t border-slate-200/70 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-prussianBlue dark:bg-slate-900 rounded-3xl p-12 sm:p-16 md:p-20 text-white relative overflow-hidden shadow-card border border-prussianBlue-dark dark:border-slate-800">
          
          <div className="max-w-2xl relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2.5 bg-semanticError/20 text-red-300 font-bold text-xs px-4 py-2 rounded-full border border-semanticError/30">
              <ShieldAlert className="w-4 h-4 text-semanticError" />
              <span>24/7 RAPID RESPONSE DISPATCH HOTLINE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight text-white leading-tight">
              Need Immediate Emergency Home Assistance?
            </h2>

            <p className="text-slate-300 dark:text-slate-300 text-sm sm:text-base font-normal leading-relaxed max-w-xl">
              Burst water pipes, major electrical short circuits, or severe AC failures? Our emergency hotline dispatches the nearest certified technician within 45 minutes with priority status.
            </p>

            <div className="pt-2">
              <button 
                onClick={onOpenEmergency}
                className="inline-flex items-center gap-3 bg-white hover:bg-slate-100 dark:bg-blue-600 dark:hover:bg-blue-500 text-prussianBlue dark:text-white font-semibold text-sm sm:text-base px-8 py-4 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PhoneCall className="w-5 h-5 text-regalNavy dark:text-white" />
                <span>Request Emergency Dispatch Now</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
