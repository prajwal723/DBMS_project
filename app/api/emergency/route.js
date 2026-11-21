import { NextResponse } from 'next/server';
import db from '../../../lib/db/index';
import { getCurrentSession } from '../../../lib/auth/session';

export async function POST(request) {
  try {
    const body = await request.json();
    const { emergencyType, phone, address } = body;

    if (!emergencyType || !phone || !address) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const sessionData = await getCurrentSession();
    const currentUser = sessionData?.user;

    const emergencyId = `EMG-${Math.floor(100 + Math.random() * 900)}`;
    const etaMinutes = 20;
    const timestamp = new Date().toISOString();

    let assignedTech = 'Pending Dispatch';
    let assignedTechId = null;
    let assignedTechPhone = '';
    let dispatchAlert;

    // Save to database in a clean transaction
    await db.transaction(async (client) => {
      // 1. Dynamic check for an available technician
      const techRes = await client.query(
        `SELECT
           u.id,
           COALESCE(p.full_name, 'Technician') AS name,
           COALESCE(p.phone, '') AS mobile,
           (
             SELECT ROUND(AVG(r.rating)::numeric, 1)
             FROM public.ratings r
             JOIN public.bookings b ON r.booking_id = b.id
             WHERE b.technician_id = u.id
           ) AS avg_rating,
           COALESCE((
             SELECT COUNT(*)
             FROM public.bookings b
             WHERE b.technician_id = u.id AND b.status = 'Completed'
           ), 0) AS completed_jobs
         FROM public.users u
         JOIN public.technicians t ON t.id = u.id
         LEFT JOIN public.user_profiles p ON p.user_id = u.id
         WHERE u.role = 'technician' AND t.status = 'Available'
         ORDER BY avg_rating DESC NULLS LAST, completed_jobs DESC
         LIMIT 1`
      );

      if (techRes.rows.length > 0) {
        assignedTechId = techRes.rows[0].id;
        assignedTech = techRes.rows[0].name;
        assignedTechPhone = techRes.rows[0].mobile || '';

        // Mark assigned technician as busy
        await client.query(
          `UPDATE public.technicians SET status = 'Busy', updated_at = NOW() WHERE id = $1`,
          [assignedTechId]
        );
      }

      // 2. Identify service category / service ID if matching catalog service exists
      const srvRes = await client.query(
        `SELECT id, category_id, price FROM public.services
         WHERE category_id ILIKE $1 OR name ILIKE $1
         LIMIT 1`,
        [`%${emergencyType}%`]
      );
      const serviceId = srvRes.rows[0]?.id || 'plumb-2';

      // 3. Resolve customer ID
      let customerId = currentUser?.id;
      if (!customerId) {
        const custRes = await client.query(
          `SELECT id FROM public.users WHERE role = 'customer' ORDER BY created_at ASC LIMIT 1`
        );
        customerId = custRes.rows[0]?.id;
      }
      if (!customerId) {
        const guestEmail = `guest-${Date.now()}@emergency.1tapfix.com`;
        const guestUser = await client.query(
          `INSERT INTO public.users (email, password_hash, role, status)
           VALUES ($1, 'N/A', 'customer', 'Active')
           RETURNING id`,
          [guestEmail]
        );
        customerId = guestUser.rows[0].id;
        await client.query(
          `INSERT INTO public.user_profiles (user_id, full_name, phone)
           VALUES ($1, 'Emergency Caller', $2)
           ON CONFLICT DO NOTHING`,
          [customerId, phone]
        );
      }

      // 4. Create emergency booking
      await client.query(
        `INSERT INTO public.bookings (
          id, customer_id, service_id, service_address, price, is_emergency, status, technician_id
        ) VALUES ($1, $2, $3, $4, 1499.00, TRUE, 'Emergency Pending', $5)
        ON CONFLICT (id) DO NOTHING`,
        [
          emergencyId,
          customerId,
          serviceId,
          address,
          assignedTechId,
        ]
      );

      // 5. Create dispatch record
      const dispatchId = `DISP-${Math.floor(1000 + Math.random() * 9000)}`;
      await client.query(
        `INSERT INTO public.dispatches (
          id, booking_id, priority, status, recommended_tech_id, notes
        ) VALUES ($1, $2, 'Priority Level 10', 'Active', $3, $4)
        ON CONFLICT (id) DO NOTHING`,
        [
          dispatchId,
          emergencyId,
          assignedTechId,
          `EMERGENCY: ${emergencyType} reported at ${address.slice(0, 30)}`,
        ]
      );

      // 6. Audit trail: Record status history
      await client.query(
        `INSERT INTO public.booking_status_history (booking_id, status, notes)
         VALUES ($1, 'Emergency Pending', $2)`,
        [emergencyId, `Emergency dispatch created: ${emergencyType}`]
      ).catch(() => {});

      // 7. User notification if logged in
      if (currentUser?.id) {
        await client.query(
          `INSERT INTO public.notifications (user_id, booking_id, type, title, message)
           VALUES ($1, $2, 'emergency_created', 'Emergency Dispatch Initiated', $3)`,
          [currentUser.id, emergencyId, `Emergency assistance dispatched for ${emergencyType}.`]
        ).catch(() => {});
      }

      dispatchAlert = {
        id: emergencyId,
        dispatchId,
        emergencyType,
        phone,
        address,
        etaMinutes,
        assignedTechnician: assignedTech,
        assignedTechnicianPhone: assignedTechPhone,
        timestamp,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Emergency team dispatched!',
      dispatch: dispatchAlert,
    });
  } catch (error) {
    console.error('Error handling emergency alert:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to dispatch emergency response.' },
      { status: 500 }
    );
  }
}
