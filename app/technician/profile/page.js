'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import TechnicianProfileForm from '../../../components/technician/TechnicianProfileForm';
import ThemeToggle from '../../../components/ThemeToggle';

export default function TechnicianProfilePage() {
  return (
    <ProtectedRoute allowedRole="technician">
      <div className="min-h-screen bg-[#EEF4ED] dark:bg-slate-950 text-[#0B2545] dark:text-slate-100 py-8 px-4 sm:px-6 transition-colors duration-200">
        <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
          <Link
            href="/technician"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        <TechnicianProfileForm />
      </div>
    </ProtectedRoute>
  );
}
