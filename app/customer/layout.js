'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import CustomerHeader from '../../components/customer/CustomerHeader';
import CustomerSidebar from '../../components/customer/CustomerSidebar';
import CustomerFooter from '../../components/customer/CustomerFooter';

export default function CustomerRootLayout({ children }) {
  return (
    <ProtectedRoute allowedRole="customer">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
        
        {/* Left-stuck Hover-expandable Sidebar */}
        <CustomerSidebar />

        {/* Main Content Area: Offset by the 64px (md:pl-16) collapsed sidebar width */}
        <div className="md:pl-16 flex flex-col flex-1 min-w-0 transition-all duration-300">
          <CustomerHeader />
          <main className="flex-1 w-full max-w-7xl mx-auto min-w-0">
            {children}
          </main>
          <CustomerFooter />
        </div>

      </div>
    </ProtectedRoute>
  );
}
