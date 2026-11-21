import { NextResponse } from 'next/server';
import db from '../../../../lib/db/index';
import { getCurrentSession } from '../../../../lib/auth/session';

export async function POST() {
  try {
    const sessionData = await getCurrentSession();
    const currentUser = sessionData?.user;

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await db.query(`UPDATE public.notifications SET is_read = TRUE WHERE user_id = $1`, [currentUser.id]);

    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

