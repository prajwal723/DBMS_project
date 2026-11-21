import { NextResponse } from 'next/server';
import db from '../../../../lib/db/index';
import { getCurrentSession } from '../../../../lib/auth/session';

export async function DELETE(request, { params }) {
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

    const userRole = (currentUser.role || '').toLowerCase();
    if (!['dispatcher', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Access denied: only dispatchers and administrators can resolve dispatches.' },
        { status: 403 }
      );
    }

    await db.query(`UPDATE public.dispatches SET status = 'Resolved' WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: 'Dispatch resolved / removed' });
  } catch (error) {
    console.error('Error resolving dispatch:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to resolve dispatch' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const sessionData = await getCurrentSession();
    const currentUser = sessionData?.user;

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const userRole = (currentUser.role || '').toLowerCase();
    if (!['dispatcher', 'admin', 'technician'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Access denied: insufficient permissions to update dispatches.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, recommendedTech, recommendedTechId } = body;

    const updates = [];
    const values = [];

    if (status) {
      values.push(status);
      updates.push(`status = $${values.length}`);
    }

    const techIdToSet = recommendedTechId || (recommendedTech && recommendedTech.length > 20 ? recommendedTech : null);
    if (techIdToSet) {
      values.push(techIdToSet);
      updates.push(`recommended_tech_id = $${values.length}`);
    }

    if (updates.length > 0) {
      values.push(id);
      await db.query(
        `UPDATE public.dispatches SET ${updates.join(', ')} WHERE id = $${values.length}`,
        values
      );
    }

    return NextResponse.json({ success: true, message: 'Dispatch updated successfully' });
  } catch (error) {
    console.error('Error updating dispatch:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update dispatch' },
      { status: 500 }
    );
  }
}
