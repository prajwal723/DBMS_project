import { NextResponse } from 'next/server';
import db from '../../../../lib/db/index';
import { requireAuth, ROLES } from '../../../../lib/auth/rbac';

export async function GET() {
  try {
    const authCheck = await requireAuth([ROLES.ADMIN]);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const [uRes, bRes, rRes, tRes, dRes] = await Promise.all([
      db.query(`SELECT COUNT(*)::int AS count FROM public.users`),
      db.query(`SELECT COUNT(*)::int AS count, COALESCE(SUM(price), 0)::numeric AS revenue FROM public.bookings WHERE status = 'Completed'`),
      db.query(`SELECT COALESCE(AVG(rating), 0)::numeric(3, 2) AS avg_rating, COUNT(*)::int AS total_ratings FROM public.ratings`),
      db.query(`SELECT COUNT(*)::int AS count FROM public.technicians WHERE status = 'Available'`),
      db.query(`SELECT COUNT(*)::int AS count FROM public.dispatches WHERE status = 'Active'`),
    ]);

    const totalUsers = uRes.rows[0]?.count || 0;
    const completedJobs = bRes.rows[0]?.count || 0;
    const revenueVal = parseFloat(bRes.rows[0]?.revenue || 0);
    const avgRatingVal = parseFloat(rRes.rows[0]?.avg_rating || 0);
    const totalRatingsVal = rRes.rows[0]?.total_ratings || 0;
    const activeTechnicians = tRes.rows[0]?.count || 0;
    const pendingDispatches = dRes.rows[0]?.count || 0;

    const satisfactionPct = totalRatingsVal > 0 ? (avgRatingVal * 20).toFixed(1) : '100.0';
    const monthlyRevenue = `₹${revenueVal.toLocaleString('en-IN')}`;

    const stats = {
      totalUsers,
      completedJobs,
      satisfactionRate: `${satisfactionPct}%`,
      monthlyRevenue,
      activeTechnicians,
      pendingDispatches,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
