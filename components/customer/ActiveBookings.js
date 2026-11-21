'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export default function ActiveBookings() {
  const [bookings, setBookings] = useState([]);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function fetchActiveBookings() {
      try {
        const res = await fetch('/api/bookings?status=active');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data)) {
          setBookings(data.data);
        }
      } catch (err) {
        console.error('Error fetching active bookings:', err);
      }
    }

    fetchActiveBookings();
    const interval = setInterval(fetchActiveBookings, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned':
        return 'bg-green-100 dark:bg-emerald-950/60 text-green-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40';
      case 'Pending':
      case 'Emergency Pending':
        return 'bg-yellow-100 dark:bg-amber-950/60 text-yellow-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40';
      case 'In Progress':
      case 'On The Way':
      case 'Reached Location':
      case 'Service Started':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <section>
      <div className="space-y-5">
        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              No Active Bookings
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              You don't have any active service requests.
            </p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-card transition p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h3 className="text-xl font-bold text-[#0A2540] dark:text-white">
                      {booking.service}
                    </h3>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-slate-600 dark:text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={18} className="text-slate-400 dark:text-slate-500" />
                      <span>{booking.technicianName || "Not Assigned"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-slate-400 dark:text-slate-500" />
                      <span>{booking.date || "Emergency Booking"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-slate-400 dark:text-slate-500" />
                      <span>{booking.timeSlot || "-"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-slate-400 dark:text-slate-500" />
                      <span>{booking.customerAddress || booking.location || "Mangaluru, Karnataka"}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/customer/bookings/${booking.id}`)}
                  className="flex items-center gap-2 bg-[#0A2540] hover:bg-[#13395F] dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 py-3 rounded-xl transition font-semibold text-sm shadow-xs whitespace-nowrap self-start lg:self-center"
                >
                  View Details
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
