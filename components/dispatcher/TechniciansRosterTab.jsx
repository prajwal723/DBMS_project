'use client';

import React from 'react';

export default function TechniciansRosterTab({
  filteredTechnicians,
  showToast
}) {
  return (
    <div className="space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-in fade-in duration-300">
      <div>
        <h3 className="text-lg font-extrabold text-[#0A2540] dark:text-white">Technicians Roster</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Manage, inspect workloads, and check real-time availability of operatives</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechnicians.map((tech) => (
          <div key={tech.name} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-all space-y-4 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-[#0A2540] dark:text-white">
                  {tech.name.split(' ')[0][0]}{tech.name.split(' ')[1] ? tech.name.split(' ')[1][0] : ''}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">{tech.name}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{tech.specialty}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                tech.status === 'Online' 
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {tech.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">Assigned Tasks</span>
                <span className="font-extrabold text-[#0A2540] dark:text-white">{tech.assigned} Active Jobs</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">Tasks Completed</span>
                <span className="font-extrabold text-[#0A2540] dark:text-white">{tech.completed || 0} Tasks</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">📍 Grid Sector: {tech.zone}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
