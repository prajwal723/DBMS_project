'use client';

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  FileText,
  Wrench,
  AlertTriangle,
  Loader2,
  MapPin,
} from 'lucide-react';

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emergency = searchParams.get("emergency");

  const category = searchParams.get('category');
  const service = searchParams.get('service');
  const price = searchParams.get('price');
  const duration = searchParams.get('duration');

  const [formData, setFormData] = useState({
    description: "",
    address: "",
    date: "",
    timeSlot: "",
    requestPreviousTechnician: false,
    isEmergency: false,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [hasPreviousTechnician, setHasPreviousTechnician] = useState(false);
  const [previousTechnician, setPreviousTechnician] = useState(null);

  useEffect(() => {
    if (emergency === "true") {
      setFormData((prev) => ({
        ...prev,
        isEmergency: true,
      }));
    }
  }, [emergency]);

  // Pre-fill user service address from profile
  useEffect(() => {
    async function fetchUserAddress() {
      try {
        const res = await fetch('/api/users/profile');
        const data = await res.json();
        if (data.success && data.data?.address) {
          setFormData((prev) => ({
            ...prev,
            address: data.data.address,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch user profile address:', err);
      }
    }
    fetchUserAddress();
  }, []);

  useEffect(() => {
    const checkPreviousTechnician = async () => {
      if (!category) return;

      try {
        const res = await fetch('/api/bookings?status=completed&limit=5');
        const data = await res.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const match = data.data.find(b => b.category === category && (b.technicianId || b.technician_id)) || data.data[0];

          if (match && (match.technicianId || match.technician_id)) {
            const techId = match.technicianId || match.technician_id;
            let techRating = null;
            try {
              const tRes = await fetch(`/api/technicians/${techId}`);
              const tData = await tRes.json();
              if (tData.success && tData.data) {
                techRating = tData.data.rating;
              }
            } catch (e) {}

            setHasPreviousTechnician(true);
            setPreviousTechnician({
              id: techId,
              name: match.technicianName || match.technician_name,
              phone: match.technicianPhone || match.technician_phone,
              rating: techRating,
            });
            return;
          }
        }

        setHasPreviousTechnician(false);
        setPreviousTechnician(null);
      } catch (error) {
        console.error('Error checking previous technician:', error);
      }
    };

    checkPreviousTechnician();
  }, [category, service]);

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.address.trim()) {
      alert("Please enter your service address.");
      return;
    }

    if (!formData.isEmergency) {
      if (!formData.date) {
        alert("Please select a preferred date.");
        return;
      }
      if (!formData.timeSlot) {
        alert("Please select a time slot.");
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          service,
          price: price ? parseFloat(price) : 499,
          duration,
          description: formData.description,
          address: formData.address.trim(),
          date: formData.isEmergency ? null : formData.date,
          timeSlot: formData.isEmergency ? null : formData.timeSlot,
          isEmergency: formData.isEmergency,
          notes: formData.notes,
          technicianId: formData.requestPreviousTechnician ? previousTechnician?.id : null,
          technicianName: formData.requestPreviousTechnician ? previousTechnician?.name : null,
          technicianPhone: formData.requestPreviousTechnician ? previousTechnician?.phone : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit booking.');
      }

      alert("Booking submitted successfully.");
      router.push("/customer/bookings");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to submit booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white mb-2">
              Book Service
            </h1>

            {/* Service Details */}
            <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-5 mb-8">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#0A2540] dark:text-white">
                <Wrench size={20} className="text-blue-600 dark:text-blue-400" />
                Service Details
              </h2>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Category</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{category}</p>
                </div>

                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Service</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{service}</p>
                </div>

                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Estimated Price</p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{price}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Estimated Duration</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{duration}</p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Issue Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Issue Description *
                </label>

                <div className="relative">
                  <FileText className="absolute top-3.5 left-3 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" />

                  <textarea
                    name="description"
                    rows="3"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the issue in detail..."
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-11 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              {/* Service Address */}
              <div>
                <label className="font-semibold flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300 text-sm">
                  <MapPin size={18} className="text-slate-400 dark:text-slate-500" />
                  Service Address *
                </label>

                <textarea
                  name="address"
                  rows="2"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete service address (house/flat no, street, locality)..."
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Preferred Date */}
              {!formData.isEmergency && (
                <div>
                  <label className="font-semibold flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300 text-sm">
                    <Calendar size={18} className="text-slate-400 dark:text-slate-500" />
                    Preferred Date *
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              )}

              {/* Time Slots */}
              {!formData.isEmergency && (
                <div>
                  <label className="font-semibold flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300 text-sm">
                    <Clock size={18} className="text-slate-400 dark:text-slate-500" />
                    Select Time Slot *
                  </label>

                  <div className="grid md:grid-cols-2 gap-3">
                    {timeSlots.map((slot) => (
                      <label
                        key={slot}
                        className={`border rounded-xl p-3.5 cursor-pointer transition flex items-center gap-3 text-sm font-medium ${
                          formData.timeSlot === slot
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-[#0A2540] dark:text-blue-300"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800"
                        }`}
                      >
                        <input
                          type="radio"
                          name="timeSlot"
                          value={slot}
                          checked={formData.timeSlot === slot}
                          onChange={handleChange}
                          className="accent-blue-600"
                        />
                        <span>{slot}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Previous Technician */}
              {hasPreviousTechnician && previousTechnician && (
                <div className="border border-blue-200 dark:border-blue-800/50 rounded-xl p-5 bg-blue-50 dark:bg-blue-950/40">
                  <h3 className="font-bold text-base text-[#0A2540] dark:text-white mb-3">
                    Previous Technician
                  </h3>

                  <div className="space-y-1.5 mb-4 text-sm text-slate-700 dark:text-slate-300">
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {previousTechnician.name}
                    </p>

                    {previousTechnician.phone && (
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {previousTechnician.phone}
                      </p>
                    )}

                    <p>
                      <span className="font-semibold">Rating:</span>{" "}
                      {previousTechnician.rating ? `⭐ ${previousTechnician.rating}/5` : 'Not rated'}
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requestPreviousTechnician"
                      checked={formData.requestPreviousTechnician}
                      onChange={handleChange}
                      disabled={formData.isEmergency}
                      className="mt-1 w-4 h-4 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <div>
                      <p className="font-semibold text-sm text-[#0A2540] dark:text-white">
                        Request This Technician Again
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Subject to their schedule and availability.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Emergency Notice */}
              {formData.isEmergency && (
                <div className="bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/50 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" size={20} />
                  <div>
                    <h3 className="font-bold text-red-600 dark:text-red-400 text-sm">
                      Emergency Priority Mode Active
                    </h3>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      Your request will be dispatched immediately to the nearest on-duty technician with priority fleet routing.
                    </p>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Additional Instructions / Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g. Near Big Bazaar, Gate #2"
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0A2540] hover:bg-[#13395F] dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Submitting Booking...
                  </>
                ) : (
                  "Confirm & Submit Request"
              )}
            </button>
          </form>
        </div>
      </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
