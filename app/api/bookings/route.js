import { NextResponse } from 'next/server';
import db from '../../../lib/db/index';
import { getCurrentSession } from '../../../lib/auth/session';

export async function GET(request) {
  try {
    const sessionData = await getCurrentSession();
    const currentUser = sessionData?.user;

    // Strict authentication requirement
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    let queryText = `
      SELECT
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
        COALESCE(p_cust.full_name, 'Customer') AS resolved_customer_name,
        COALESCE(u_cust.email, '') AS resolved_customer_email,
        COALESCE(p_cust.phone, '') AS resolved_customer_phone,
        COALESCE(p_tech.full_name, 'Not Assigned') AS resolved_technician_name,
        COALESCE(p_tech.phone, '') AS resolved_technician_phone,
        COALESCE(s.name, 'General Service') AS resolved_service_name,
        CASE
          WHEN s.duration_minutes >= 60 THEN
            (s.duration_minutes / 60)::text || ' hour' || CASE WHEN s.duration_minutes > 60 THEN 's' ELSE '' END
          ELSE s.duration_minutes::text || ' mins'
        END AS resolved_duration,
        COALESCE(s.description, b.notes) AS resolved_description,
        COALESCE(sc.name, 'General') AS resolved_category_name
      FROM public.bookings b
      LEFT JOIN public.users u_cust ON b.customer_id = u_cust.id
      LEFT JOIN public.user_profiles p_cust ON u_cust.id = p_cust.user_id
      LEFT JOIN public.users u_tech ON b.technician_id = u_tech.id
      LEFT JOIN public.user_profiles p_tech ON u_tech.id = p_tech.user_id
      LEFT JOIN public.services s ON b.service_id = s.id
      LEFT JOIN public.service_categories sc ON s.category_id = sc.id
      LEFT JOIN public.ratings r ON r.booking_id = b.id
      WHERE 1=1
    `;
    const params = [];

    const userRole = (currentUser.role || '').toLowerCase();

    // Strict role-based scoping to prevent cross-user data access
    if (userRole === 'customer') {
      params.push(currentUser.id);
      queryText += ` AND b.customer_id = $${params.length}`;
    } else if (userRole === 'technician') {
      params.push(currentUser.id);
      queryText += ` AND (b.technician_id = $${params.length} OR b.status IN ('Assigned', 'Emergency Pending'))`;
    }
    // Dispatcher and Admin can see all bookings across the platform

    if (statusFilter) {
      if (statusFilter.toLowerCase() === 'active') {
        queryText += ` AND b.status NOT IN ('Completed', 'Cancelled')`;
      } else if (statusFilter.toLowerCase() === 'completed') {
        queryText += ` AND b.status IN ('Completed')`;
      } else {
        params.push(statusFilter);
        queryText += ` AND b.status = $${params.length}`;
      }
    }

    queryText += ` ORDER BY b.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        customerId: row.customer_id,
        customer_id: row.customer_id,
        customerName: row.resolved_customer_name,
        customer_name: row.resolved_customer_name,
        customerEmail: row.resolved_customer_email,
        customer_email: row.resolved_customer_email,
        customerPhone: row.resolved_customer_phone,
        customer_phone: row.resolved_customer_phone,
        customerAddress: row.service_address,
        customer_address: row.service_address,
        address: row.service_address,
        category: row.resolved_category_name,
        service: row.resolved_service_name,
        serviceId: row.service_id,
        price: parseFloat(row.price || 0),
        duration: row.resolved_duration,
        description: row.resolved_description,
        date: row.booking_date,
        timeSlot: row.time_slot,
        time: row.time_slot || '10:00 AM',
        isEmergency: row.is_emergency,
        is_emergency: row.is_emergency,
        status: row.status,
        technicianId: row.technician_id,
        technician_id: row.technician_id,
        technicianName: row.resolved_technician_name,
        technician_name: row.resolved_technician_name,
        technicianPhone: row.resolved_technician_phone,
        technician_phone: row.resolved_technician_phone,
        dispatcherId: row.dispatcher_id,
        dispatcher_id: row.dispatcher_id,
        notes: row.notes,
        isRated: row.is_rated,
        is_rated: row.is_rated,
        createdAt: row.created_at,
        created_at: row.created_at,
        updatedAt: row.updated_at,
        updated_at: row.updated_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bookings.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const sessionData = await getCurrentSession();
    const currentUser = sessionData?.user;

    const {
      service = 'General Service',
      category = 'Plumbing',
      duration = '1 hour',
      description = '',
      isEmergency = false,
      technicianId = null,
      technicianName = 'Not Assigned',
      technicianPhone = '',
      notes = '',
    } = body;

    let price = typeof body.price === 'number' ? body.price : parseFloat(body.price) || 499.0;

    const serviceAddress = (
      body.address ||
      body.customerAddress ||
      body.serviceAddress ||
      currentUser?.address ||
      ''
    ).trim();

    if (!serviceAddress) {
      return NextResponse.json(
        { success: false, error: 'Service address is required.' },
        { status: 400 }
      );
    }

    // Parse date and time cleanly
    let bookingDate = null;
    let bookingTimeSlot = body.timeSlot || 'Immediate';

    if (body.dateTime) {
      try {
        const dt = new Date(body.dateTime);
        if (!isNaN(dt.getTime())) {
          bookingDate = dt.toISOString().split('T')[0];
          if (!body.timeSlot) {
            bookingTimeSlot = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          }
        }
      } catch (e) {
        bookingDate = null;
      }
    } else if (body.date && typeof body.date === 'string' && body.date.trim() !== '') {
      try {
        const dt = new Date(body.date);
        if (!isNaN(dt.getTime())) {
          bookingDate = dt.toISOString().split('T')[0];
        }
      } catch (e) {
        bookingDate = null;
      }
    }

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to create a booking.' },
        { status: 401 }
      );
    }

    const customerId = currentUser.id;

    const bookingId = isEmergency
      ? `EMG-${Math.floor(100 + Math.random() * 900)}`
      : `FM-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialStatus = isEmergency ? 'Emergency Pending' : 'Pending';

    let createdBooking;

    await db.transaction(async (client) => {
      // 1. Resolve normalized service_id and catalog price if available
      let resolvedServiceId = body.serviceId || null;
      try {
        const srvCheck = await client.query(
          `SELECT id, price FROM public.services
           WHERE id = $1 OR LOWER(name) = LOWER($2) OR id ILIKE $3
           LIMIT 1`,
          [resolvedServiceId, service, `${(category||'').toLowerCase()}%`]
        );
        if (srvCheck.rows.length > 0) {
          resolvedServiceId = srvCheck.rows[0].id;
          if (!body.price) {
            price = parseFloat(srvCheck.rows[0].price);
          }
        }
      } catch {}

      if (!resolvedServiceId) {
        const defaultSrv = await client.query(`SELECT id, price FROM public.services LIMIT 1`);
        resolvedServiceId = defaultSrv.rows[0]?.id || 'plumb-1';
      }

      // 2. Manage saved address reference with ownership enforcement
      let savedAddressId = null;
      if (body.addressId) {
        // Enforce address ownership: customer can only select their own address
        const addrCheck = await client.query(
          `SELECT id, address_line FROM public.customer_addresses
           WHERE id = $1 AND customer_id = $2
           LIMIT 1`,
          [body.addressId, customerId]
        );
        if (addrCheck.rows.length === 0) {
          throw new Error('Address ownership violation: Selected address does not belong to your account.');
        }
        savedAddressId = addrCheck.rows[0].id;
      } else if (serviceAddress) {
        const addrCheck = await client.query(
          `SELECT id FROM public.customer_addresses
           WHERE customer_id = $1 AND LOWER(address_line) = LOWER($2)
           LIMIT 1`,
          [customerId, serviceAddress]
        );
        if (addrCheck.rows.length > 0) {
          savedAddressId = addrCheck.rows[0].id;
        } else {
          const newAddr = await client.query(
            `INSERT INTO public.customer_addresses (customer_id, address_line, city, state, is_default)
             VALUES ($1, $2, 'Mangaluru', 'Karnataka', FALSE)
             RETURNING id`,
            [customerId, serviceAddress]
          );
          savedAddressId = newAddr.rows[0]?.id || null;
        }
      }

      // 3. Validate technicianId if provided
      let validTechId = null;
      if (technicianId) {
        const techCheck = await client.query(
          `SELECT id FROM public.technicians WHERE id = $1`,
          [technicianId]
        );
        if (techCheck.rows.length > 0) {
          validTechId = technicianId;
        }
      }

      // 3. Insert normalized booking record with point-in-time service_address snapshot
      const res = await client.query(
        `INSERT INTO public.bookings (
          id, customer_id, service_id, service_address, address_id,
          booking_date, time_slot, price, is_emergency, status, technician_id, notes
        ) VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE), $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          bookingId,
          customerId,
          resolvedServiceId,
          serviceAddress,
          savedAddressId,
          bookingDate,
          bookingTimeSlot,
          price,
          Boolean(isEmergency),
          initialStatus,
          validTechId,
          notes,
        ]
      );
      createdBooking = res.rows[0];

      // 4. Audit trail: Record initial state transition in booking_status_history
      await client.query(
        `INSERT INTO public.booking_status_history (booking_id, status, changed_by, notes)
         VALUES ($1, $2, $3, $4)`,
        [bookingId, initialStatus, customerId, 'Booking request created']
      ).catch(() => {});

      // 5. User Notification
      if (customerId) {
        await client.query(
          `INSERT INTO public.notifications (user_id, booking_id, type, title, message, is_read)
           VALUES ($1, $2, $3, $4, $5, FALSE)`,
          [
            customerId,
            bookingId,
            'booking_created',
            isEmergency ? 'Emergency Alert Dispatched' : 'Booking Submitted',
            `Your ${service} booking #${bookingId} has been submitted successfully.`,
          ]
        );
      }

      // 6. If Emergency, broadcast to dispatches queue
      if (isEmergency) {
        await client.query(
          `INSERT INTO public.dispatches (
            id, booking_id, priority, status, notes
          ) VALUES ($1, $2, 'Priority Level 10', 'Active', $3)`,
          [
            `DISP-${Math.floor(1000 + Math.random() * 9000)}`,
            bookingId,
            `Emergency: ${service} at ${serviceAddress.slice(0, 30)}...`,
          ]
        );
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully.',
        booking: {
          id: createdBooking.id,
          status: createdBooking.status,
          service: service,
          price: createdBooking.price,
          address: createdBooking.service_address,
          date: createdBooking.booking_date,
          timeSlot: createdBooking.time_slot,
          createdAt: createdBooking.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create booking.' },
      { status: 500 }
    );
  }
}
