import { NextResponse } from 'next/server';
import db from '../../../../../lib/db/index';
import { getCurrentSession } from '../../../../../lib/auth/session';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, availability } = body;

    const raw = (status || availability || 'Available').toString().trim().toLowerCase();
    let normalizedStatus = 'Available';
    if (raw === 'busy' || raw === 'on-job' || raw === 'in-progress' || raw === 'on the way') {
      normalizedStatus = 'Busy';
    } else if (raw === 'offline' || raw === 'inactive') {
      normalizedStatus = 'Offline';
    } else {
      normalizedStatus = 'Available';
    }

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
    const isSelf = currentUser.id === id;
    const isPrivileged = ['admin', 'dispatcher'].includes(userRole);

    if (!isSelf && !isPrivileged) {
      return NextResponse.json(
        { success: false, error: 'Access denied: not authorized to update this technician status.' },
        { status: 403 }
      );
    }

    // Upsert technician status so that if the technician record doesn't exist yet, it's created
    await db.query(
      `INSERT INTO public.technicians (id, status, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET status = $2, updated_at = NOW()`,
      [id, normalizedStatus]
    );

    return NextResponse.json({
      success: true,
      message: `Technician status updated to ${normalizedStatus}`,
      data: {
        id,
        status: normalizedStatus,
        availability: normalizedStatus,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating technician status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update technician status' },
      { status: 500 }
    );
  }
}

export async function POST(request, context) {
  return PUT(request, context);
}
