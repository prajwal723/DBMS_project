import { NextResponse } from 'next/server';
import db from '../../../../lib/db/index';

export async function GET(request, { params }) {
  try {
    const { role } = await params;
    const normalizedRole = (role || '').toLowerCase();

    const validRoles = ['customer', 'technician', 'dispatcher', 'admin'];
    if (!validRoles.includes(normalizedRole)) {
      return NextResponse.json(
        { success: false, error: 'Invalid portal role' },
        { status: 404 }
      );
    }

    let portal = {
      role: normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1),
      region: 'Mangaluru, Karnataka',
    };

    if (normalizedRole === 'customer') {
      const [activeRes, histRes] = await Promise.all([
        db.query(
          `SELECT b.id, COALESCE(s.name, 'General Service') AS service, b.status, b.service_address AS address, b.price
           FROM public.bookings b
           LEFT JOIN public.services s ON b.service_id = s.id
           WHERE b.status NOT IN ('Completed', 'Cancelled')
           ORDER BY b.created_at DESC
           LIMIT 1`
        ),
        db.query(
          `SELECT b.id, COALESCE(s.name, 'General Service') AS service, b.booking_date AS date, b.price, b.status
           FROM public.bookings b
           LEFT JOIN public.services s ON b.service_id = s.id
           WHERE b.status = 'Completed'
           ORDER BY b.created_at DESC
           LIMIT 5`
        ),
      ]);

      const activeRow = activeRes.rows[0];
      portal.title = 'Customer Portal — Mangaluru Operations';
      portal.activeBooking = activeRow
        ? {
            id: activeRow.id,
            service: activeRow.service,
            status: activeRow.status,
            eta: activeRow.status === 'On The Way' ? '10-15 mins' : 'Scheduled',
          }
        : null;

      portal.history = histRes.rows.map((row) => ({
        id: row.id,
        service: row.service,
        date: row.date ? new Date(row.date).toLocaleDateString() : 'Recent',
        cost: `₹${parseFloat(row.price || 0).toFixed(2)}`,
        status: row.status,
      }));
    } else if (normalizedRole === 'technician') {
      const jobsRes = await db.query(
        `SELECT
           b.id,
           COALESCE(p.full_name, 'Customer') AS customer,
           COALESCE(s.name, 'General Service') AS service,
           b.service_address AS address,
           COALESCE(b.time_slot, 'Immediate') AS time,
           b.price,
           b.status
         FROM public.bookings b
         LEFT JOIN public.user_profiles p ON b.customer_id = p.user_id
         LEFT JOIN public.services s ON b.service_id = s.id
         WHERE b.status IN ('Assigned', 'Accepted', 'On The Way', 'Reached Location', 'Service Started', 'In Progress')
         ORDER BY b.created_at DESC
         LIMIT 6`
      );

      portal.title = 'Technician Hub — Mangaluru Operations';
      portal.assignedJobs = jobsRes.rows.map((row) => ({
        id: row.id,
        customer: row.customer,
        service: row.service,
        address: row.address,
        time: row.time,
        price: `₹${parseFloat(row.price || 0).toFixed(2)}`,
        status: row.status,
      }));
    } else if (normalizedRole === 'dispatcher') {
      const [techCountRes, dispCountRes, dispatchesRes] = await Promise.all([
        db.query(`SELECT COUNT(*)::int AS count FROM public.technicians WHERE status = 'Available'`),
        db.query(`SELECT COUNT(*)::int AS count FROM public.dispatches WHERE status = 'Active'`),
        db.query(
          `SELECT
             d.id,
             d.notes,
             d.priority,
             d.status,
             b.service_address AS address,
             COALESCE(p_tech.full_name, 'Unassigned') AS recommended_tech,
             COALESCE(s.name, 'Urgent Service') AS service
           FROM public.dispatches d
           JOIN public.bookings b ON d.booking_id = b.id
           LEFT JOIN public.user_profiles p_tech ON (d.recommended_tech_id = p_tech.user_id OR b.technician_id = p_tech.user_id)
           LEFT JOIN public.services s ON b.service_id = s.id
           WHERE d.status = 'Active'
           ORDER BY d.created_at DESC
           LIMIT 4`
        ),
      ]);

      portal.title = 'Dispatcher Control Terminal — Mangaluru';
      portal.dispatcherEmail = 'dispatcher@1tapfix.com';
      portal.metrics = {
        activeTechnicians: techCountRes.rows[0]?.count || 0,
        pendingDispatches: dispCountRes.rows[0]?.count || 0,
        avgResponseMinutes: 14,
      };

      portal.routes = dispatchesRes.rows.map((d) => ({
        zone: d.notes || d.address || `Emergency: ${d.service}`,
        techCount: d.recommended_tech,
        status: d.priority || 'Active',
      }));
    } else if (normalizedRole === 'admin') {
      const [uRes, bRes, rRes, tRes, dRes] = await Promise.all([
        db.query(`SELECT COUNT(*)::int AS count FROM public.users`),
        db.query(`SELECT COUNT(*)::int AS count, COALESCE(SUM(price), 0)::numeric AS revenue FROM public.bookings WHERE status = 'Completed'`),
        db.query(`SELECT COALESCE(AVG(rating), 0)::numeric(3, 2) AS avg_rating, COUNT(*)::int AS count FROM public.ratings`),
        db.query(`SELECT COUNT(*)::int AS count FROM public.technicians WHERE status = 'Available'`),
        db.query(`SELECT COUNT(*)::int AS count FROM public.dispatches WHERE status = 'Active'`),
      ]);

      const totalUsers = uRes.rows[0]?.count || 0;
      const completedJobs = bRes.rows[0]?.count || 0;
      const monthlyRevenue = `₹${parseFloat(bRes.rows[0]?.revenue || 0).toLocaleString('en-IN')}`;
      const ratingVal = parseFloat(rRes.rows[0]?.avg_rating || 0);
      const ratingCount = rRes.rows[0]?.count || 0;
      const satisfactionRate = ratingCount > 0 ? `${(ratingVal * 20).toFixed(1)}%` : '100.0%';

      portal.title = 'Admin Command Center — Mangaluru Operations';
      portal.adminEmail = 'admin@1tapfix.com';
      portal.analytics = {
        totalUsers,
        completedJobs,
        satisfactionRate,
        monthlyRevenue,
        activeTechnicians: tRes.rows[0]?.count || 0,
        pendingDispatches: dRes.rows[0]?.count || 0,
      };
      portal.pendingApprovals = dRes.rows[0]?.count || 0;
    }

    return NextResponse.json({ success: true, portal });
  } catch (error) {
    console.error('Error fetching portal stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch portal' },
      { status: 500 }
    );
  }
}
