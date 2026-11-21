import { NextResponse } from 'next/server';
import db from '../../../lib/db/index';
import { getCurrentSession } from '../../../lib/auth/session';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get('technicianId');
    const bookingId = searchParams.get('bookingId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    let queryText = `
      SELECT
        r.id,
        r.booking_id,
        b.customer_id,
        b.technician_id,
        r.rating,
        r.review,
        r.created_at,
        COALESCE(p_cust.full_name, 'Customer') AS customer_name,
        COALESCE(p_tech.full_name, 'Technician') AS technician_name,
        COALESCE(s.name, 'Service') AS service_name
      FROM public.ratings r
      JOIN public.bookings b ON r.booking_id = b.id
      LEFT JOIN public.users u_cust ON b.customer_id = u_cust.id
      LEFT JOIN public.user_profiles p_cust ON u_cust.id = p_cust.user_id
      LEFT JOIN public.users u_tech ON b.technician_id = u_tech.id
      LEFT JOIN public.user_profiles p_tech ON u_tech.id = p_tech.user_id
      LEFT JOIN public.services s ON b.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (technicianId) {
      params.push(technicianId);
      queryText += ` AND b.technician_id = $${params.length}`;
    }

    if (bookingId) {
      params.push(bookingId);
      queryText += ` AND r.booking_id = $${params.length}`;
    }

    queryText += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        bookingId: row.booking_id,
        customerId: row.customer_id,
        customerName: row.customer_name,
        technicianId: row.technician_id,
        technicianName: row.technician_name,
        serviceName: row.service_name,
        rating: row.rating,
        review: row.review,
        createdAt: row.created_at,
        created_at: row.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch ratings', data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
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
      bookingId,
      rating,
      review,
    } = body;

    if (!bookingId || !rating || !review) {
      return NextResponse.json(
        { success: false, error: 'Booking ID, rating (1-5), and review text are required.' },
        { status: 400 }
      );
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be an integer between 1 and 5.' },
        { status: 400 }
      );
    }

    // Verify booking ownership and completion status
    const bRes = await db.query('SELECT * FROM public.bookings WHERE id = $1', [bookingId]);
    if (bRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking not found.' },
        { status: 404 }
      );
    }

    const booking = bRes.rows[0];

    // Check ownership
    const isOwner = currentUser.id === booking.customer_id;
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Access denied: you can only rate your own completed bookings.' },
        { status: 403 }
      );
    }

    // Check if booking is completed
    if (booking.status !== 'Completed') {
      return NextResponse.json(
        { success: false, error: 'Only completed services can be rated.' },
        { status: 400 }
      );
    }

    // Check if booking has a valid completed technician
    if (!booking.technician_id) {
      return NextResponse.json(
        { success: false, error: 'Cannot submit a rating for a booking without an assigned technician.' },
        { status: 400 }
      );
    }

    // Determine whether already rated by checking public.ratings existence
    const ratingCheck = await db.query('SELECT id FROM public.ratings WHERE booking_id = $1', [bookingId]);
    if (ratingCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This booking has already been rated.' },
        { status: 400 }
      );
    }

    // Insert normalized rating (customer and technician are resolved relationally via booking)
    await db.query(
      `INSERT INTO public.ratings (booking_id, rating, review)
       VALUES ($1, $2, $3)`,
      [bookingId, numericRating, review.trim()]
    );

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your rating and review have been submitted.',
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit rating' },
      { status: 500 }
    );
  }
}
