import { NextResponse } from 'next/server';
import db from '../../../../lib/db/index';
import { getCurrentSession } from '../../../../lib/auth/session';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const sessionData = await getCurrentSession();
    const currentUser = sessionData?.user;

    // Strict authentication requirement
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const result = await db.query(
      `SELECT
         b.id,
         b.customer_id,
         b.service_id,
         b.service_address,
         b.address_id,
         b.booking_date,
         b.time_slot,
         b.price,
         b.is_emergency,
         b.status,
         b.technician_id,
         b.dispatcher_id,
         b.notes,
         (r.id IS NOT NULL) AS is_rated,
         b.created_at,
         b.updated_at,
         COALESCE(p_cust.full_name, 'Customer') AS customer_name,
         COALESCE(u_cust.email, '') AS customer_email,
         COALESCE(p_cust.phone, '') AS customer_phone,
         COALESCE(p_tech.full_name, 'Not Assigned') AS technician_name,
         COALESCE(p_tech.phone, '') AS technician_phone,
         COALESCE(s.name, 'General Service') AS service,
         CASE
           WHEN s.duration_minutes >= 60 THEN
             (s.duration_minutes / 60)::text || ' hour' || CASE WHEN s.duration_minutes > 60 THEN 's' ELSE '' END
           ELSE s.duration_minutes::text || ' mins'
         END AS duration,
         COALESCE(s.description, b.notes) AS description,
         COALESCE(sc.name, 'General') AS category
       FROM public.bookings b
       LEFT JOIN public.users u_cust ON b.customer_id = u_cust.id
       LEFT JOIN public.user_profiles p_cust ON u_cust.id = p_cust.user_id
       LEFT JOIN public.users u_tech ON b.technician_id = u_tech.id
       LEFT JOIN public.user_profiles p_tech ON u_tech.id = p_tech.user_id
       LEFT JOIN public.services s ON b.service_id = s.id
       LEFT JOIN public.service_categories sc ON s.category_id = sc.id
       LEFT JOIN public.ratings r ON r.booking_id = b.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking not found.' },
        { status: 404 }
      );
    }

    const booking = result.rows[0];

    const isOwner = currentUser.id === booking.customer_id || currentUser.email === booking.customer_email;
    const isAssignedTech = currentUser.id === booking.technician_id;
    const isPrivileged = ['admin', 'dispatcher'].includes((currentUser.role || '').toLowerCase());

    if (!isOwner && !isAssignedTech && !isPrivileged) {
      return NextResponse.json(
        { success: false, error: 'Access denied: not authorized to view this booking.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        customerId: booking.customer_id,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone,
        customerAddress: booking.service_address,
        address: booking.service_address,
        category: booking.category,
        service: booking.service,
        serviceId: booking.service_id,
        price: parseFloat(booking.price || 0),
        duration: booking.duration,
        description: booking.description,
        date: booking.booking_date,
        timeSlot: booking.time_slot,
        isEmergency: booking.is_emergency,
        status: booking.status,
        technicianId: booking.technician_id,
        technicianName: booking.technician_name,
        technicianPhone: booking.technician_phone,
        dispatcherId: booking.dispatcher_id,
        notes: booking.notes,
        isRated: booking.is_rated,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch booking.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const sessionData = await getCurrentSession();
    const currentUser = sessionData?.user;

    // Strict authentication requirement
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const {
      status,
      technicianId,
      technicianName,
      technicianPhone,
      notes,
      isRated,
    } = body;

    // Fetch existing booking
    const existingRes = await db.query('SELECT * FROM public.bookings WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking not found.' },
        { status: 404 }
      );
    }

    const currentBooking = existingRes.rows[0];
    const userRole = (currentUser.role || '').toLowerCase();
    const isOwner = currentUser.id === currentBooking.customer_id || currentUser.email === currentBooking.customer_email;
    const isAssignedTech = currentUser.id === currentBooking.technician_id;
    const isPrivileged = ['admin', 'dispatcher'].includes(userRole);

    // Authorization checks based on user role
    if (userRole === 'customer') {
      if (!isOwner) {
        return NextResponse.json(
          { success: false, error: 'Access denied: not authorized to modify this booking.' },
          { status: 403 }
        );
      }
      // Customers are restricted to cancelling or marking as rated
      if (status && status !== 'Cancelled') {
        return NextResponse.json(
          { success: false, error: 'Customers are only permitted to cancel pending bookings.' },
          { status: 403 }
        );
      }
      if (technicianId || technicianName) {
        return NextResponse.json(
          { success: false, error: 'Customers cannot assign or reassign technicians.' },
          { status: 403 }
        );
      }
    } else if (userRole === 'technician') {
      // Technicians may update their assigned job, or accept an unassigned emergency request
      const canAccept = (!currentBooking.technician_id || currentBooking.status === 'Emergency Pending') && status === 'Accepted';
      if (!isAssignedTech && !canAccept) {
        return NextResponse.json(
          { success: false, error: 'Technicians can only update their assigned jobs.' },
          { status: 403 }
        );
      }
    } else if (!isPrivileged) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions for booking modification.' },
        { status: 403 }
      );
    }

    // Prevent completed booking reassignment (protects historical rating attribution)
    if (currentBooking.status === 'Completed' && technicianId !== undefined && technicianId !== currentBooking.technician_id) {
      return NextResponse.json(
        { success: false, error: 'Historical attribution integrity: Cannot reassign technician on completed booking.' },
        { status: 400 }
      );
    }

    // Verify technician exists in technicians table if technicianId is provided
    if (technicianId !== undefined && technicianId !== null) {
      const techCheck = await db.query('SELECT id FROM public.technicians WHERE id = $1', [technicianId]);
      if (techCheck.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid technician assignment: technician profile does not exist.' },
          { status: 400 }
        );
      }
    }

    // Build parameterized dynamic update
    const updates = [];
    const values = [];

    if (status !== undefined) {
      values.push(status);
      updates.push(`status = $${values.length}`);
    }

    if (technicianId !== undefined && (isPrivileged || userRole === 'technician')) {
      values.push(technicianId);
      updates.push(`technician_id = $${values.length}`);
    }

    if (notes !== undefined) {
      values.push(notes);
      updates.push(`notes = $${values.length}`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true, message: 'No valid fields to update.' });
    }

    values.push(id);
    const updateQuery = `
      UPDATE public.bookings
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;

    let updatedBooking;

    await db.transaction(async (client) => {
      const res = await client.query(updateQuery, values);
      updatedBooking = res.rows[0];

      // Audit trail: Log state transition in booking_status_history
      if (status && status !== currentBooking.status) {
        await client.query(
          `INSERT INTO public.booking_status_history (booking_id, status, changed_by, notes)
           VALUES ($1, $2, $3, $4)`,
          [id, status, currentUser.id, notes || `Status changed to ${status}`]
        ).catch(() => {});
      }

      // Trigger user notifications on important status changes
      if (status && status !== currentBooking.status && currentBooking.customer_id) {
        let notifTitle = 'Booking Status Updated';
        let notifMessage = `Your booking #${id} status is now ${status}.`;

        if (status === 'Assigned') {
          notifTitle = 'Technician Assigned';
          notifMessage = `A technician has been assigned to your booking #${id}.`;
        } else if (status === 'On The Way') {
          notifTitle = 'Technician On The Way';
          notifMessage = `Your technician is on the way to your location.`;
        } else if (status === 'Reached Location') {
          notifTitle = 'Technician Reached Location';
          notifMessage = `Your technician has arrived at your address.`;
        } else if (status === 'Service Started') {
          notifTitle = 'Service Started';
          notifMessage = 'Work has commenced on your service request.';
        } else if (status === 'Completed') {
          notifTitle = 'Service Completed';
          notifMessage = `Your service #${id} has been completed. Please rate your experience!`;
        }

        await client.query(
          `INSERT INTO public.notifications (user_id, booking_id, type, title, message, is_read)
           VALUES ($1, $2, $3, $4, $5, FALSE)`,
          [currentBooking.customer_id, id, `status_${status.toLowerCase().replace(/\s+/g, '_')}`, notifTitle, notifMessage]
        );
      }

      const activeTechId = technicianId || currentBooking.technician_id;
      if (activeTechId) {
        if (status === 'Completed') {
          await client.query(
            `UPDATE public.technicians SET status = 'Available', updated_at = NOW() WHERE id = $1`,
            [activeTechId]
          );
        } else if (['Assigned', 'Accepted', 'On The Way', 'Reached Location', 'Service Started', 'In Progress'].includes(status)) {
          await client.query(
            `UPDATE public.technicians SET status = 'Busy', updated_at = NOW() WHERE id = $1`,
            [activeTechId]
          );
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Booking #${id} updated successfully.`,
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update booking.' },
      { status: 500 }
    );
  }
}
