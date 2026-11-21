'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Star,
  ArrowRight,
} from 'lucide-react';

export default function BookingHistory() {
  const router = useRouter();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchHistory() {
      try {
        const res = await fetch('/api/bookings?status=completed');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data)) {
          setHistory(data.data);
        }
      } catch (err) {
        console.error('Error fetching booking history:', err);
      }
    }

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section>
      <div className="space-y-5">
        {history.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No Booking History</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Completed and cancelled bookings will appear here.
            </p>
          </div>
        ) : (
          history.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-card transition p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    {booking.status === "Completed" ? (
                      <CheckCircle2 size={24} className="text-green-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle size={24} className="text-red-500 dark:text-rose-400" />
                    )}

                    <h3 className="text-xl font-bold text-[#0A2540] dark:text-white">
                      {booking.service}
                    </h3>
                  </div>

                  <div className="mt-4 space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                    <p>
                      <strong className="text-slate-700 dark:text-slate-300">Booking ID:</strong>{" "}
                      {booking.id}
                    </p>

                    <p>
                      <strong className="text-slate-700 dark:text-slate-300">Technician:</strong>{" "}
                      {booking.technicianName || "Not Assigned"}
                    </p>

                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-slate-400 dark:text-slate-500" />
                      <span>{booking.date || "Emergency Booking"}</span>
                    </div>

                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === "Completed"
                          ? "bg-green-100 dark:bg-emerald-950/60 text-green-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                          : "bg-red-100 dark:bg-rose-950/60 text-red-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                  {booking.status === "Completed" && !booking.isRated && (
                    <button
                      onClick={() =>
                        router.push(
                          `/customer/ratings?bookingId=${booking.id}`
                        )
                      }
                      className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl transition font-semibold text-sm shadow-xs"
                    >
                      <Star size={18} />
                      Rate Service
                    </button>
                  )}

                  <button
                    onClick={() =>
                      router.push(
                        `/customer/bookings/${booking.id}`
                      )
                    }
                    className="flex items-center justify-center gap-2 bg-[#0A2540] hover:bg-[#13395F] dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 py-3 rounded-xl transition font-semibold text-sm shadow-xs whitespace-nowrap"
                  >
                    View Details
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
