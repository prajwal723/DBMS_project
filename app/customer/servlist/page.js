'use client';

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Zap,
  Wrench,
  Wind,
  Refrigerator,
  Hammer,
  Paintbrush,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const iconMap = {
  Zap,
  Wrench,
  Wind,
  Refrigerator,
  Hammer,
  Paintbrush,
  Sparkles,
  ShieldAlert,
};

export default function ServList() {
  return (
    <Suspense fallback={<div className="py-20 flex items-center justify-center text-slate-500 font-bold">Loading...</div>}>
      <ServListContent />
    </Suspense>
  );
}

function ServListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emergency = searchParams.get("emergency");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        setLoading(true);
        const res = await fetch('/api/services/categories');
        const json = await res.json();
        if (isMounted) {
          if (json.success && Array.isArray(json.data)) {
            setCategories(json.data);
          } else {
            setCategories([]);
          }
        }
      } catch (err) {
        console.error('Error fetching service categories:', err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCategories();
    return () => { isMounted = false; };
  }, []);

  const handleCategory = (categoryName) => {
    let url = `/customer/services?category=${encodeURIComponent(categoryName)}`;
    if (emergency === "true") {
      url += "&emergency=true";
    }
    router.push(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      {/* Header Section */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 border border-blue-200/60 dark:border-blue-900/50">
              <Sparkles size={16} />
              Professional Home Services
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0A2540] dark:text-white tracking-tight">
              1tapfix Service Roster
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm sm:text-base max-w-xl mx-auto font-medium">
              Select a service category below to schedule your expert maintenance assistance.
            </p>
          </div>

          {/* Services List Column */}
          {loading ? (
            <div className="text-center py-16 flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400 font-semibold text-sm">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span>Loading services catalog from database...</span>
            </div>
          ) : error ? (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-6 rounded-2xl text-center max-w-md mx-auto text-rose-600 dark:text-rose-400 text-sm font-semibold">
              <p>Unable to load service categories: {error}</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center max-w-lg mx-auto shadow-sm">
              <p className="text-slate-600 dark:text-slate-300 font-bold">No service categories currently available.</p>
              <p className="text-slate-400 text-xs mt-1">Please check back shortly or contact support.</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
              {categories.map((category) => {
                const Icon = iconMap[category.icon] || Wrench;
                return (
                  <div 
                    key={category.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm hover:shadow-card hover:border-blue-500/40 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                  >
                    {/* Left Side: Icon & Details */}
                    <div className="flex items-start gap-4 sm:gap-5">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-[#0A2540] dark:text-white">{category.name}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    {/* Right Side */}
                    <button
                      onClick={() => handleCategory(category.name)}
                      className="bg-[#0A2540] hover:bg-[#12395f] dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap self-start sm:self-center transition shadow-xs"
                    >
                      <span>Check Out Service</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
    </div>
  );
}
