import { NextResponse } from 'next/server';
import db from '../../../../../lib/db/index';
import { getCurrentSession } from '../../../../../lib/auth/session';

export async function PATCH(request, { params }) {
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

    // Only allow updating notification belonging to the current user
    const res = await db.query(
      `UPDATE public.notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, currentUser.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Notification not found or access denied.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function POST(request, context) {
  return PATCH(request, context);
}
