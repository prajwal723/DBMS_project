'use client';

import WelcomeBanner from '../../components/customer/WelcomeBanner';
import QuickActions from '../../components/customer/QuickActions';
import ActiveBookings from '../../components/customer/ActiveBookings';
import BookingHistory from '../../components/customer/BookingHistory';
import EmergencyBanner from '../../components/customer/EmergencyBanner';

export default function CustomerDashboard() {
  return (
    <div className="px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      <WelcomeBanner />

      <QuickActions />

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-[#0A2540] dark:text-white">
            Active Requests
          </h2>

          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Track your ongoing repair requests.
          </p>
        </div>

        <ActiveBookings />
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-[#0A2540] dark:text-white">
            Previous Services
          </h2>

          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            View your completed service history.
          </p>
        </div>

        <BookingHistory />
      </section>

      <EmergencyBanner />
    </div>
  );
}
