'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({
  children,
  allowedRole,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!isMounted) return;

        if (!data.authenticated || !data.user) {
          router.replace('/');
          return;
        }

        const userRole = (data.user.role || '').toLowerCase();
        const requiredRole = (allowedRole || '').toLowerCase();

        if (requiredRole && userRole !== requiredRole) {
          router.replace('/');
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error('ProtectedRoute auth verification error:', err);
        if (isMounted) {
          router.replace('/');
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, allowedRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold text-slate-700">
        Loading...
      </div>
    );
  }

  return children;
}
