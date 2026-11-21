import { NextResponse } from 'next/server';
import db from '../../../lib/db/index';
import { getCurrentSession } from '../../../lib/auth/session';

export async function GET(request) {
  try {
    const sessionData = await getCurrentSession();
    const currentUser = sessionData?.user;

    if (!currentUser) {
      return NextResponse.json({
        success: true,
        data: [],
        unreadCount: 0,
      });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let queryText = `SELECT * FROM public.notifications WHERE user_id = $1`;
    if (unreadOnly) {
      queryText += ` AND is_read = FALSE`;
    }
    queryText += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await db.query(queryText, [currentUser.id]);

    const countRes = await db.query(
      `SELECT COUNT(*)::int AS unread FROM public.notifications WHERE user_id = $1 AND is_read = FALSE`,
      [currentUser.id]
    );
    const unreadCount = countRes.rows[0]?.unread || 0;

    return NextResponse.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        bookingId: row.booking_id,
        type: row.type,
        title: row.title,
        message: row.message,
        isRead: row.is_read,
        createdAt: row.created_at,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, bookingId, type = 'general', title, message } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'userId, title, and message are required' },
        { status: 400 }
      );
    }

    const result = await db.query(
      `INSERT INTO public.notifications (user_id, booking_id, type, title, message, is_read)
       VALUES ($1, $2, $3, $4, $5, FALSE)
       RETURNING *`,
      [userId, bookingId || null, type, title, message]
    );

    return NextResponse.json({
      success: true,
      notification: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create notification' },
      { status: 500 }
    );
  }
}

