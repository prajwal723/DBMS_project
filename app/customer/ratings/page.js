'use client';

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star } from "lucide-react";

function RatingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) return;

      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setBooking(data.data);
        }
      } catch (err) {
        console.error('Error loading booking:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [bookingId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    if (review.trim().length < 10) {
      alert("Please provide feedback (minimum 10 characters).");
      return;
    }

    setSubmitting(true);

    try {
      const techId = booking?.technicianId || null;
      const techName = booking?.technicianName || "";
      const custName = booking?.customerName || "Customer";

      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          rating,
          review: review.trim(),
          technicianId: techId,
          technicianName: techName,
          customerName: custName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit rating.');
      }

      alert("Thank you for your feedback!");
      router.push("/customer");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center text-slate-700 dark:text-slate-300 font-semibold">
        Loading...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-24 flex flex-col justify-center items-center text-slate-900 dark:text-white gap-4">
        <h1 className="text-2xl font-bold">Booking not found.</h1>
        <button
          onClick={() => router.push('/customer')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white mb-2">
          Rate Your Service
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Your feedback helps technicians improve and helps other customers choose trusted professionals.
        </p>

            <div className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-sm text-slate-700 dark:text-slate-300 space-y-1">
              <p><strong className="text-slate-900 dark:text-white">Service:</strong> {booking.service}</p>
              <p><strong className="text-slate-900 dark:text-white">Technician:</strong> {booking.technicianName || "Not Assigned"}</p>
            </div>

            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-3">
              Overall Rating *
            </h3>

            <div className="flex gap-2.5 mb-8">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${value} stars`}
                >
                  <Star
                    size={36}
                    className={
                      value <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-700"
                    }
                  />
                </button>
              ))}
            </div>

            <label className="block font-semibold text-slate-800 dark:text-slate-200 text-sm mb-2">
              Feedback <span className="text-red-500">*</span>
            </label>

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
              placeholder="Tell us about your experience. Mention what the technician did well and what could be improved. (Minimum 10 characters)"
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Your feedback is mandatory and will be shared with the technician to recognize excellent work.
            </p>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-8 w-full bg-[#0A2540] hover:bg-[#13395F] dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </div>
  );
}

export default function RatingPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500 font-bold">Loading...</div>}>
      <RatingPageContent />
    </Suspense>
  );
}
