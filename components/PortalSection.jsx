'use client';
import Link from 'next/link';
import { UserCheck, Briefcase, Radio, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PortalSection() {
  const portals = [
    {
      role: 'customer',
      title: 'Customer Experience',
      subtitle: 'Homeowner Platform',
      desc: 'Track ongoing service requests, view technician ETA on live maps, and access upfront job invoices.',
      icon: UserCheck,
      badge: 'Homeowners'
    },
    {
      role: 'technician',
      title: 'Technician Hub',
      subtitle: 'Field Operations',
      desc: 'Assigned job checklist, availability duty toggle, emergency request acceptance, and earning metrics.',
      icon: Briefcase,
      badge: 'Technicians'
    },
    {
      role: 'dispatcher',
      title: 'Dispatcher Routing',
      subtitle: 'Internal Operations',
      desc: 'Broadcast emergency requests, optimize technician travel zones, and monitor fleet workload in real-time.',
      icon: Radio,
      badge: 'Operations'
    },
    {
      role: 'admin',
      title: 'Admin Command Center',
      subtitle: 'Enterprise Governance',
      desc: 'Manage service pricing catalogs, verify new technician credentials, and oversee operational health.',
      icon: ShieldCheck,
      badge: 'Enterprise'
    }
  ];

  return (
    <section className="py-20 bg-mintCream dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-regalNavy dark:text-blue-300 bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-powderBlue/40 dark:border-slate-800">
            Four Role Ecosystem Architecture
          </span>
          <h2 className="text-3xl md:text-4xl font-black font-heading text-prussianBlue dark:text-white tracking-tight">
            Designed for Every Stakeholder
          </h2>
          <p className="text-sm font-normal text-slate-600 dark:text-slate-400 leading-relaxed">
            1tapfix connects Homeowners, Verified Field Technicians, Regional Operations Dispatchers, and Enterprise Administrators seamlessly.
          </p>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portals.map((p) => {
            const IconComp = p.icon;
            return (
              <div
                key={p.role}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-mintCream dark:bg-slate-800 text-regalNavy dark:text-blue-300 flex items-center justify-center group-hover:bg-regalNavy group-hover:text-white dark:group-hover:bg-blue-600 transition-colors">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-700">
                      {p.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-regalNavy dark:text-blue-400 uppercase tracking-wider block mb-1">
                      {p.subtitle}
                    </span>
                    <h3 className="text-lg font-bold font-heading text-prussianBlue dark:text-white">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed mt-2">
                      {p.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/${p.role}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-regalNavy dark:text-blue-400 hover:text-oxfordNavy dark:hover:text-blue-300 transition-colors group-hover:translate-x-1 duration-200"
                  >
                    <span>Access {p.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
