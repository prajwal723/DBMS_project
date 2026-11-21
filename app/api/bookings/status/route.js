import { NextResponse } from 'next/server';
import db from '../../../../lib/db/index';

export async function POST(request) {
  try {
    const body = await request.json();
    const targetId = body.jobId || body.id || body.bookingId;
    const rawStatus = body.status;

    if (!targetId || !rawStatus) {
      return NextResponse.json(
        { success: false, error: 'Job ID and status required' },
        { status: 400 }
      );
    }

    // Normalize status to respect database check constraints
    let status = rawStatus;
    const lower = rawStatus.toString().trim().toLowerCase();
    if (lower === 'in progress' || lower === 'in-progress' || lower === 'inprogress') {
      status = 'In Progress';
    } else if (lower === 'assigned') {
      status = 'Assigned';
    } else if (lower === 'accepted') {
      status = 'Accepted';
    } else if (lower === 'on the way') {
      status = 'On The Way';
    } else if (lower === 'reached location') {
      status = 'Reached Location';
    } else if (lower === 'service started') {
      status = 'Service Started';
    } else if (lower === 'completed') {
      status = 'Completed';
    } else if (lower === 'cancelled') {
      status = 'Cancelled';
    } else if (lower === 'emergency pending') {
      status = 'Emergency Pending';
    } else if (lower === 'pending') {
      status = 'Pending';
    }

    let techId = body.technicianId || body.assignedTechId || body.technician_id || null;
    let techName = body.technicianName || body.assignedTech || body.technician_name || null;
    let techPhone = body.technicianPhone || body.assignedTechPhone || body.technician_phone || null;
    const timestamp = body.updatedAt || new Date().toISOString();

    await db.transaction(async (client) => {
      // 0. Verify existing booking & prevent completed reassignment
      const existing = await client.query('SELECT status, technician_id FROM public.bookings WHERE id = $1', [targetId]);
      if (existing.rows.length === 0) {
        throw new Error(`Booking #${targetId} not found`);
      }
      const currentBooking = existing.rows[0];
      if (currentBooking.status === 'Completed' && techId && techId !== currentBooking.technician_id) {
        throw new Error(`Historical attribution integrity violation: Cannot reassign technician on completed booking #${targetId}`);
      }

      // Verify technician exists in technicians table if techId is provided
      if (techId) {
        const tCheck = await client.query('SELECT id FROM public.technicians WHERE id = $1', [techId]);
        if (tCheck.rows.length === 0) {
          throw new Error(`Invalid technician assignment: technician profile #${techId} does not exist.`);
        }
      }

      // 1. Update booking
      await client.query(
        `UPDATE public.bookings
         SET status = $1,
             technician_id = COALESCE($2, technician_id),
             updated_at = NOW()
         WHERE id = $3`,
        [status, techId, targetId]
      );

      // 2. Synchronize dispatches table if an urgent dispatch is linked to this booking
      if (['Assigned', 'Accepted', 'On The Way', 'Reached Location', 'Service Started', 'In Progress'].includes(status)) {
        await client.query(
          `UPDATE public.dispatches
           SET status = 'Assigned',
               recommended_tech_id = COALESCE($2, recommended_tech_id)
           WHERE booking_id = $1`,
          [targetId, techId]
        ).catch(() => {});
      } else if (status === 'Completed') {
        await client.query(
          `UPDATE public.dispatches SET status = 'Resolved' WHERE booking_id = $1`,
          [targetId]
        ).catch(() => {});
      }

      // 3. Update technician availability status if technicianId was provided
      if (techId) {
        if (['Assigned', 'Accepted', 'On The Way', 'Reached Location', 'Service Started', 'In Progress'].includes(status)) {
          await client.query(
            `UPDATE public.technicians SET status = 'Busy', updated_at = NOW() WHERE id = $1`,
            [techId]
          ).catch(() => {});
        } else if (status === 'Completed') {
          await client.query(
            `UPDATE public.technicians SET status = 'Available', updated_at = NOW() WHERE id = $1`,
            [techId]
          ).catch(() => {});
        }
      }

      // 4. Record status change in booking_status_history
      await client.query(
        `INSERT INTO public.booking_status_history (booking_id, status, changed_by, notes)
         VALUES ($1, $2, $3, $4)`,
        [targetId, status, techId, body.notes || `Booking status transitioned to ${status}`]
      ).catch(() => {});
    });

    return NextResponse.json({
      success: true,
      message: `Job #${targetId} status updated to ${status} across all portals.`,
      data: {
        jobId: targetId,
        status,
        technicianId: techId,
        technicianName: techName,
        technicianPhone: techPhone,
        updatedAt: timestamp,
      },
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update job status' },
      { status: 500 }
    );
  }
}
