'use client';

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Wrench,
  AlertTriangle,
  User,
  Mail,
  FileText,
  Loader2,
} from "lucide-react";

export default function BookingDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${id}`);
        const json = await res.json();
        if (!isMounted) return;

        if (json.success && json.data) {
          setBooking(json.data);
        } else {
          setBooking(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("Booking fetch error:", error);
        if (!isMounted) return;
        setLoading(false);
      }
    }

    fetchBooking();
    const interval = setInterval(fetchBooking, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-24 flex flex-col justify-center items-center text-slate-900 dark:text-white gap-4">
        <h1 className="text-2xl font-bold">Booking Not Found</h1>
        <button
          onClick={() => router.push('/customer/bookings')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
      case "Emergency Pending":
        return "bg-yellow-100 dark:bg-amber-950/60 text-yellow-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40";
      case "Assigned":
      case "Accepted":
        return "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40";
      case "In Progress":
        return "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40";
      case "On The Way":
        return "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40";
      case "Reached Location":
        return "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/40";
      case "Service Started":
        return "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40";
      case "Completed":
        return "bg-green-100 dark:bg-emerald-950/60 text-green-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40";
      case "Cancelled":
        return "bg-red-100 dark:bg-rose-950/60 text-red-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
  };

  const bookingStages = booking.isEmergency
    ? [
        "Pending",
        "Accepted",
        "On The Way",
        "Reached Location",
        "Service Started",
        "Completed",
      ]
    : [
        "Pending",
        "Assigned",
        "On The Way",
        "Reached Location",
        "Service Started",
        "Completed",
      ];

  const getStageIndex = () => {
    switch (booking.status?.trim()) {
      case "Pending":
      case "Emergency Pending":
        return 0;
      case "Assigned":
      case "Accepted":
        return 1;
      case "On The Way":
        return 2;
      case "Reached Location":
        return 3;
      case "Service Started":
      case "In Progress":
        return 4;
      case "Completed":
        return 5;
      default:
        return -1;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card p-6 sm:p-8">
              {/* Header */}
              <div className="flex justify-between items-start flex-wrap gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white">
                    {booking.service}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    {booking.category}
                  </p>
                </div>

                <div className="flex gap-2.5 items-center flex-wrap">
                  {booking.isEmergency && (
                    <span className="bg-red-100 dark:bg-rose-950/60 text-red-700 dark:text-rose-400 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold border border-red-200 dark:border-rose-900/50">
                      <AlertTriangle size={15} />
                      Emergency
                    </span>
                  )}

                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Customer & Booking Details */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5">
                  <h2 className="font-bold text-base text-slate-800 dark:text-slate-200 mb-4">
                    Customer Information
                  </h2>

                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{booking.customerName || "Customer"}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>{booking.customerEmail}</span>
                    </div>

                    {booking.customerAddress && (
                      <div className="flex items-start gap-3">
                        <span className="text-base shrink-0">📍</span>
                        <span>{booking.customerAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5">
                  <h2 className="font-bold text-base text-slate-800 dark:text-slate-200 mb-4">
                    Booking Details
                  </h2>

                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>{booking.date || "Immediate Service"}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>{booking.timeSlot || "-"}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Wrench size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>{booking.duration || "Standard Duration"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={18} className="text-blue-600 dark:text-blue-400" />
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Problem Description
                  </h2>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {booking.description || "No description provided."}
                </p>
              </div>

              {/* Additional Notes */}
              {booking.notes && (
                <div className="mt-6 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5">
                  <h2 className="font-bold text-base text-slate-800 dark:text-slate-200 mb-2">
                    Additional Instructions / Notes
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {booking.notes}
                  </p>
                </div>
              )}

              {/* Technician Status */}
              <div className="mt-6 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5">
                <h2 className="font-bold text-base text-slate-800 dark:text-slate-200 mb-3">
                  Technician Status
                </h2>

                {booking.technicianId || booking.technicianName ? (
                  <div className="space-y-1.5 text-sm">
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span>✅</span> Technician Assigned
                    </p>
                    {booking.technicianName && (
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Name:</strong> {booking.technicianName}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                    <span>⌛</span> Waiting for Technician Assignment
                  </p>
                )}
              </div>

              {/* Billing Details */}
              <div className="mt-6 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">
                  Billing Details
                </h2>

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
                    <span className="font-bold text-slate-800 dark:text-slate-200">Final Price</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{booking.finalTotalBill || booking.price || 0}
                    </span>
                  </div>

                  {booking.extraChargesReason && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/80">
                      <p className="font-semibold text-xs text-slate-700 dark:text-slate-300 mb-1">
                        Reason for Additional Charges:
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {booking.extraChargesReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Progress */}
              <div className="mt-8 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-6">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-8">
                  Booking Progress
                </h2>

                <div className="flex flex-col md:flex-row md:justify-between gap-8">
                  {bookingStages.map((stage, index) => {
                    const currentIndex = getStageIndex();
                    const completed = index < currentIndex;
                    const current = index === currentIndex;

                    return (
                      <div
                        key={stage}
                        className="flex md:flex-col items-center flex-1 relative"
                      >
                        {/* Connector */}
                        {index !== bookingStages.length - 1 && (
                          <>
                            <div
                              className={`hidden md:block absolute top-5 left-1/2 w-full h-1 ${
                                completed
                                  ? "bg-emerald-500"
                                  : "bg-slate-200 dark:bg-slate-700"
                              }`}
                              style={{ transform: "translateX(20px)" }}
                            />
                            <div
                              className={`md:hidden absolute left-5 top-10 w-1 h-12 ${
                                completed
                                  ? "bg-emerald-500"
                                  : "bg-slate-200 dark:bg-slate-700"
                              }`}
                            />
                          </>
                        )}

                        {/* Circle */}
                        <div
                          className={`z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-all text-sm ${
                            completed
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : current
                              ? "bg-blue-600 border-blue-600 text-white shadow-md ring-4 ring-blue-500/20"
                              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400"
                          }`}
                        >
                          {completed ? "✓" : index + 1}
                        </div>

                        {/* Label */}
                        <div className="ml-4 md:ml-0 md:mt-4 text-center">
                          <h3
                            className={`font-semibold text-xs sm:text-sm ${
                              current
                                ? "text-blue-600 dark:text-blue-400 font-bold"
                                : completed
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {stage}
                          </h3>

                          {current && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                              {booking.status}
                            </p>
                          )}

                          {completed && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                              Completed
                            </p>
                          )}

                          {!completed && !current && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              Waiting
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
    </div>
  );
}
