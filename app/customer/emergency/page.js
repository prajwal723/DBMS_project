'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function EmergencyPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200/80 dark:border-rose-900/40 shadow-card p-8 sm:p-12">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-rose-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={36} />
        </div>

        <h1 className="text-3xl font-extrabold text-red-600 dark:text-red-400">
          Emergency Priority Service
        </h1>

        <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          Need immediate home assistance? Your emergency request will be given
          the highest dispatch priority and routed directly to the nearest on-call specialist.
        </p>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => router.push('/customer/servlist?emergency=true')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-md text-sm cursor-pointer"
          >
            Book Emergency Service Now
          </button>

          <button
            onClick={() => router.back()}
            className="w-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
