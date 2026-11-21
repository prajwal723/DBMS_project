import { NextResponse } from 'next/server';
import db from '../../../../../lib/db/index';
import { requireAuth, ROLES } from '../../../../../lib/auth/rbac';

export async function PATCH(request, { params }) {
  try {
    const authCheck = await requireAuth([ROLES.ADMIN]);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { id } = await params;
    const body = await request.json();
    const { role, name, fullName, mobile, phone, address, status, is_active, techStatus, experienceYears, specialization } = body;

    const userUpdates = [];
    const userValues = [];

    if (role !== undefined) {
      userValues.push(role.toLowerCase());
      userUpdates.push(`role = $${userValues.length}`);
    }

    const rawStatus = status !== undefined ? status : (is_active !== undefined ? (is_active ? 'active' : 'suspended') : undefined);
    if (rawStatus !== undefined) {
      const normStatus = String(rawStatus).toLowerCase() === 'active' ? 'active' : 'suspended';
      userValues.push(normStatus);
      userUpdates.push(`status = $${userValues.length}`);
    }

    if (userUpdates.length > 0) {
      userValues.push(id);
      await db.query(
        `UPDATE public.users SET ${userUpdates.join(', ')}, updated_at = NOW() WHERE id = $${userValues.length}`,
        userValues
      );
    }

    // Profile updates
    const resolvedName = name !== undefined ? name : fullName;
    const resolvedPhone = mobile !== undefined ? mobile : phone;

    if (resolvedName !== undefined || resolvedPhone !== undefined) {
      const profUpdates = [];
      const profValues = [];

      if (resolvedName !== undefined) {
        profValues.push(resolvedName);
        profUpdates.push(`full_name = $${profValues.length}`);
      }
      if (resolvedPhone !== undefined) {
        profValues.push(resolvedPhone);
        profUpdates.push(`phone = $${profValues.length}`);
      }

      profValues.push(id);
      await db.query(
        `UPDATE public.user_profiles SET ${profUpdates.join(', ')}, updated_at = NOW() WHERE user_id = $${profValues.length}`,
        profValues
      );
    }

    // Address update
    if (address !== undefined && typeof address === 'string') {
      const cleanAddr = address.trim();
      if (cleanAddr) {
        await db.query(
          `INSERT INTO public.customer_addresses (customer_id, address_line, is_default)
           VALUES ($1, $2, TRUE)
           ON CONFLICT DO NOTHING`,
          [id, cleanAddr]
        );
        // Also update existing default address if present
        await db.query(
          `UPDATE public.customer_addresses SET address_line = $1, updated_at = NOW()
           WHERE customer_id = $2 AND is_default = TRUE`,
          [cleanAddr, id]
        );
      }
    }

    // Technician specific updates
    const resolvedTechStatus = techStatus !== undefined ? techStatus : (status !== undefined && ['Available', 'Busy', 'Offline'].includes(status) ? status : undefined);
    const techUpdates = [];
    const techValues = [];

    if (resolvedTechStatus !== undefined) {
      techValues.push(resolvedTechStatus);
      techUpdates.push(`status = $${techValues.length}`);
    }

    if (experienceYears !== undefined) {
      const parsedExp = typeof experienceYears === 'number' ? experienceYears : (parseInt(experienceYears, 10) || 3);
      const clampedExp = Math.max(0, Math.min(60, parsedExp));
      techValues.push(clampedExp);
      techUpdates.push(`experience_years = $${techValues.length}`);
    }

    if (techUpdates.length > 0) {
      techValues.push(id);
      await db.query(
        `UPDATE public.technicians SET ${techUpdates.join(', ')}, updated_at = NOW() WHERE id = $${techUpdates.length}`,
        techValues
      );
    }

    if (specialization !== undefined && typeof specialization === 'string') {
      const catRes = await db.query(
        `SELECT id FROM public.service_categories WHERE LOWER(name) = LOWER($1) OR id = LOWER($1) LIMIT 1`,
        [specialization.trim()]
      );
      if (catRes.rows.length > 0) {
        await db.query(
          `INSERT INTO public.technician_skills (technician_id, category_id, proficiency)
           VALUES ($1, $2, 'Standard')
           ON CONFLICT (technician_id, category_id) DO NOTHING`,
          [id, catRes.rows[0].id]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const authCheck = await requireAuth([ROLES.ADMIN]);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { id } = await params;
    await db.query(`DELETE FROM public.users WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
