import { NextResponse } from 'next/server';
import db from '../../../lib/db/index';

export async function GET() {
  try {
    const result = await db.query(
      `SELECT
         d.id,
         d.booking_id,
         d.priority,
         d.status,
         d.notes,
         d.created_at,
         b.service_address AS address,
         b.price,
         COALESCE(s.name, 'Emergency Service') AS service_name,
         COALESCE(sc.name, 'General') AS category_name,
         COALESCE(sc.icon, 'AlertTriangle') AS category_icon,
         COALESCE(p_cust.full_name, 'Customer') AS customer_name,
         COALESCE(p_tech.full_name, 'Pending Assignment') AS recommended_tech
       FROM public.dispatches d
       JOIN public.bookings b ON d.booking_id = b.id
       LEFT JOIN public.user_profiles p_cust ON b.customer_id = p_cust.user_id
       LEFT JOIN public.user_profiles p_tech ON (d.recommended_tech_id = p_tech.user_id OR b.technician_id = p_tech.user_id)
       LEFT JOIN public.services s ON b.service_id = s.id
       LEFT JOIN public.service_categories sc ON s.category_id = sc.id
       WHERE d.status = 'Active'
       ORDER BY d.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        bookingId: row.booking_id,
        title: row.notes || `Emergency: ${row.service_name}`,
        time: 'Just now',
        address: row.address,
        priority: row.priority,
        category: row.category_name,
        type: 'URGENT',
        icon: '🚨',
        colorClass: 'bg-rose-50 border-rose-100 hover:border-rose-300',
        iconBg: 'bg-rose-100 text-rose-600',
        recommendedTech: row.recommended_tech,
        techSpecialty: row.category_name,
        distance: 'In vicinity',
        price: row.price ? String(row.price) : '0.00',
        customerName: row.customer_name,
        targetDispatcher: 'dispatcher@1tapfix.com',
        region: 'Mangaluru, Karnataka',
        status: row.status,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error('Dispatches DB query failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dispatches', data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const item = await request.json();

    if (!item || !item.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid dispatch payload: id is required' },
        { status: 400 }
      );
    }

    await db.query(
      `INSERT INTO public.dispatches (
        id, booking_id, priority, status, notes
      ) VALUES ($1, $2, $3, 'Active', $4)
      ON CONFLICT (id) DO UPDATE SET
        priority = EXCLUDED.priority,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes`,
      [
        item.id,
        item.bookingId || null,
        item.priority || 'Priority Level 10',
        item.title || item.notes || 'Urgent Dispatch',
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Urgent dispatch alert recorded',
      data: item,
    });
  } catch (error) {
    console.error('Error posting dispatch:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save dispatch' },
      { status: 500 }
    );
  }
}
