'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="py-20 flex items-center justify-center font-bold text-slate-500">Loading services catalog...</div>}>
      <ServicesPageContent />
    </Suspense>
  );
}

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get('category') || 'All Services';
  const emergency = searchParams.get('emergency');

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchServices() {
      try {
        setLoading(true);
        const url = category && category !== 'All Services'
          ? `/api/services?category=${encodeURIComponent(category)}`
          : '/api/services';
        const res = await fetch(url);
        const json = await res.json();
        if (isMounted) {
          if (json.success && Array.isArray(json.data)) {
            setServices(json.data);
          } else {
            setServices([]);
          }
        }
      } catch (err) {
        console.error('Error fetching category services:', err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchServices();
    return () => { isMounted = false; };
  }, [category]);

  const handleBooking = (service) => {
    let url = `/customer/bookings/new?category=${encodeURIComponent(
      category
    )}&service=${encodeURIComponent(service.name)}&price=${encodeURIComponent(
      service.price
    )}&duration=${encodeURIComponent(service.duration || '1 hour')}`;

    if (emergency === "true") {
      url += "&emergency=true";
    }

    router.push(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      <div className="mb-8">
            <Link 
              href="/customer/servlist" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline mb-3"
            >
              <ArrowLeft size={14} />
              <span>Back to all service categories</span>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0A2540] dark:text-white mb-2">
              {category}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Select a specialized service below to book verified professionals.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400 font-semibold text-sm">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span>Loading services from database...</span>
            </div>
          ) : error ? (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-6 rounded-2xl text-center max-w-md mx-auto text-rose-600 dark:text-rose-400 text-sm font-semibold">
              <p>Failed to load services: {error}</p>
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto shadow-sm">
              <p className="text-slate-700 dark:text-slate-200 font-bold text-lg">No services found for {category}</p>
              <p className="text-slate-400 text-xs mt-2">New services for this category are being added by operators.</p>
              <button 
                onClick={() => router.push('/customer/servlist')}
                className="mt-6 px-5 py-2.5 bg-[#0A2540] dark:bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
              >
                Browse Other Categories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-6 hover:shadow-card hover:border-blue-500/40 transition flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-xl font-bold text-[#0A2540] dark:text-white">
                      {service.name}
                    </h2>

                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                      {service.description || service.desc || 'Professional home repair and maintenance service.'}
                    </p>

                    <div className="mt-5 space-y-1.5 text-sm">
                      <p className="text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-900 dark:text-white">Price:</span>{' '}
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{service.price}</span>
                      </p>

                      <p className="text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-900 dark:text-white">Duration:</span>{' '}
                        {service.duration || '1 hour'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBooking(service)}
                    className="mt-6 w-full bg-[#0A2540] hover:bg-[#16395e] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm py-3 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Book Service
                  </button>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}
