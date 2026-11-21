'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Wrench,
  AlertTriangle,
  Eye,
} from 'lucide-react';

export default function MyBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;

    async function loadBookings() {
      try {
        const res = await fetch('/api/bookings');
        const json = await res.json();
        if (!isMounted) return;

        if (json.success && Array.isArray(json.data)) {
          setBookings(json.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadBookings();
    const interval = setInterval(loadBookings, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredBookings =
    filter === 'All'
      ? bookings
      : bookings.filter(
          (booking) => booking.status === filter
        );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
      case 'Emergency Pending':
        return 'bg-yellow-100 dark:bg-amber-950/60 text-yellow-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40';

      case 'Assigned':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40';

      case 'In Progress':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40';

      case 'Completed':
        return 'bg-green-100 dark:bg-emerald-950/60 text-green-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40';

      case 'Cancelled':
        return 'bg-red-100 dark:bg-rose-950/60 text-red-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40';

      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  const cancelBooking = async (booking) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel');
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: 'Cancelled' } : b))
      );
      alert("Booking cancelled successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to cancel booking.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white">
                  My Bookings
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage and track all scheduled and completed services.
                </p>
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs"
              >
                <option>All</option>
                <option>Pending</option>
                <option>Emergency Pending</option>
                <option>Assigned</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            {loading ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-12 text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Loading bookings...
                </h2>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-12 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  No Bookings Found
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  Book your first service to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBookings.map((booking) => (
                  <div
                    key={`${booking.source}-${booking.id}`}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-card transition p-6"
                  >
                    {/* Top */}
                    <div className="flex flex-col md:flex-row justify-between gap-5">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#0A2540] dark:text-white">
                          {booking.service}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                          {booking.category}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        {booking.isEmergency && (
                          <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-rose-950/60 text-red-700 dark:text-rose-400 flex items-center gap-1.5 text-xs font-semibold border border-red-200 dark:border-rose-800/40">
                            <AlertTriangle size={14} />
                            Emergency
                          </span>
                        )}

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    {/* Booking Info */}
                    <div className="grid sm:grid-cols-3 gap-5 mt-6 text-slate-600 dark:text-slate-400 text-sm">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-slate-400 dark:text-slate-500" />
                        <div>
                          <p className="text-slate-400 text-xs font-medium">Date</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{booking.date || 'Emergency'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-slate-400 dark:text-slate-500" />
                        <div>
                          <p className="text-slate-400 text-xs font-medium">Time</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{booking.timeSlot || '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Wrench size={18} className="text-slate-400 dark:text-slate-500" />
                        <div>
                          <p className="text-slate-400 text-xs font-medium">Technician</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {booking.technicianId || booking.technicianName ? "Assigned" : "Waiting"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {booking.description && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          Problem Description
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                          {booking.description}
                        </p>
                      </div>
                    )}

                    {/* Price Details */}
                    <div className="mt-6 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5 space-y-3">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Price Details
                      </h3>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Estimated Price</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            ₹{booking.price || 0}
                          </span>
                        </div>

                        {Number(booking.extraLabour || 0) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Extra Labour Charges</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              ₹{booking.extraLabour || 0}
                            </span>
                          </div>
                        )}

                        {Number(booking.extraMaterial || 0) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Extra Material Charges</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              ₹{booking.extraMaterial || 0}
                            </span>
                          </div>
                        )}

                        <hr className="border-slate-200 dark:border-slate-700/80 my-2" />

                        <div className="flex justify-between text-base">
                          <span className="font-bold text-slate-800 dark:text-slate-200">Final Total</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{booking.finalTotalBill ||
                              (
                                Number(booking.price || 0) +
                                Number(booking.extraLabour || 0) +
                                Number(booking.extraMaterial || 0)
                              )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {booking.extraChargesReason && (
                      <div className="mt-4 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-4 text-sm">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                          Reason for Additional Charges
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          {booking.extraChargesReason}
                        </p>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          router.push(
                            `/customer/bookings/${booking.id}?collection=${booking.source}`
                          )
                        }
                        className="bg-[#0A2540] hover:bg-[#163B63] dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition shadow-xs"
                      >
                        <Eye size={16} />
                        View Details
                      </button>

                      {(booking.status === "Pending" ||
                        booking.status === "Emergency Pending") && (
                        <button
                          onClick={() => cancelBooking(booking)}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
    </div>
  );
}
