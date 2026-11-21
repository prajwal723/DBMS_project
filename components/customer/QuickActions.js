'use client';

import { CalendarPlus, ClipboardList, Siren, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: 'Book Service',
      description: 'Schedule a repair service',
      icon: CalendarPlus,
      color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
      path: '/customer/servlist',
    },
    {
      title: 'Track Requests',
      description: 'View your ongoing services',
      icon: ClipboardList,
      color: 'bg-green-100 dark:bg-emerald-950/60 text-green-600 dark:text-emerald-400',
      path: '/customer/bookings',
    },
    {
      title: 'Emergency',
      description: 'Immediate assistance',
      icon: Siren,
      color: 'bg-red-100 dark:bg-rose-950/60 text-red-600 dark:text-rose-400',
      path: '/customer/emergency',
    },
    {
      title: 'My Profile',
      description: 'Manage account settings',
      icon: UserCircle,
      color: 'bg-yellow-100 dark:bg-amber-950/60 text-yellow-600 dark:text-amber-400',
      path: '/customer/profile',
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              onClick={() => router.push(action.path)}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-card transition-all duration-300 p-6 text-left border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 hover:-translate-y-1"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${action.color}`}
              >
                <Icon size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#0A2540] dark:text-white">
                {action.title}
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
