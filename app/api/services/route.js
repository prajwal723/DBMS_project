import { NextResponse } from 'next/server';
import db from '../../../lib/db/index';
import { requireAuth, ROLES } from '../../../lib/auth/rbac';

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '60 mins';
  if (minutes < 60) return `${minutes} mins`;
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (rem === 0) return hrs === 1 ? '1 hour' : `${hrs} hours`;
  return `${hrs} hr ${rem} mins`;
}

function parseDurationMinutes(val) {
  if (typeof val === 'number' && !isNaN(val) && val > 0) return Math.round(val);
  if (typeof val === 'string') {
    const num = parseInt(val.match(/\d+/)?.[0] || '60', 10);
    if (val.toLowerCase().includes('hr') || val.toLowerCase().includes('hour')) {
      return num * 60;
    }
    return num > 0 ? num : 60;
  }
  return 60;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category');
    const categoriesOnly = searchParams.get('categories') === 'true';

    // If caller requests distinct categories catalog
    if (categoriesOnly) {
      const catRes = await db.query(
        `SELECT id, name, description, icon, created_at
         FROM public.service_categories
         ORDER BY name ASC`
      );
      return NextResponse.json({
        success: true,
        data: catRes.rows,
        categories: catRes.rows
      });
    }

    let queryText = `
      SELECT
        s.id,
        s.name,
        s.category_id,
        s.price,
        s.duration_minutes,
        s.description,
        s.is_active,
        COALESCE(c.name, 'General') AS category_name,
        COALESCE(c.icon, 'Wrench') AS category_icon
      FROM public.services s
      LEFT JOIN public.service_categories c ON s.category_id = c.id
      WHERE s.is_active = TRUE
    `;
    const params = [];

    if (categoryParam && categoryParam.trim() !== '') {
      params.push(`%${categoryParam.trim().toLowerCase()}%`);
      params.push(categoryParam.trim().toLowerCase());
      queryText += ` AND (LOWER(c.name) LIKE $1 OR LOWER(s.category_id) = $2)`;
    }

    queryText += ` ORDER BY c.name ASC, s.price ASC`;

    const result = await db.query(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category_name,
        categoryId: row.category_id,
        price: parseFloat(row.price),
        duration_minutes: row.duration_minutes,
        duration: formatDuration(row.duration_minutes),
        desc: row.description,
        description: row.description,
        icon: row.category_icon || 'Wrench',
        isActive: row.is_active
      })),
    });
  } catch (error) {
    console.error('Database query for services failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch services', data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authCheck = await requireAuth([ROLES.ADMIN]);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const body = await request.json();
    const { id, name, title, category, categoryId, description, desc, price, duration, duration_minutes, durationMinutes } = body;
    const serviceName = (name || title || '').trim();
    const servicePrice = Number(price) >= 0 ? Number(price) : 0;
    const serviceDesc = description || desc || '';
    const serviceCategory = category || 'General';
    const resolvedCategoryId = categoryId || (serviceCategory.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    const generatedId = id || `${resolvedCategoryId}-${Date.now().toString(36)}`;
    const parsedDurationMinutes = parseDurationMinutes(duration_minutes || durationMinutes || duration);

    if (!serviceName) {
      return NextResponse.json(
        { success: false, error: 'Service name is required' },
        { status: 400 }
      );
    }

    // Ensure category exists in service_categories if possible
    await db.query(
      `INSERT INTO public.service_categories (id, name, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [resolvedCategoryId, serviceCategory, `${serviceCategory} service domain`]
    ).catch(() => {});

    const res = await db.query(
      `INSERT INTO public.services (id, name, category_id, description, price, duration_minutes, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category_id = EXCLUDED.category_id,
         description = EXCLUDED.description,
         price = EXCLUDED.price,
         duration_minutes = EXCLUDED.duration_minutes
       RETURNING id, name, category_id, description, price, duration_minutes, is_active`,
      [generatedId, serviceName, resolvedCategoryId, serviceDesc, servicePrice, parsedDurationMinutes]
    );

    const saved = res.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        ...saved,
        duration: formatDuration(saved.duration_minutes)
      }
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const authCheck = await requireAuth([ROLES.ADMIN]);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const body = await request.json();
    const { id, is_active, isActive, active, price, duration_minutes, durationMinutes, duration } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Service ID is required' }, { status: 400 });
    }

    const updates = [];
    const values = [];

    const activeVal = is_active !== undefined ? is_active : (isActive !== undefined ? isActive : active);
    if (activeVal !== undefined) {
      values.push(Boolean(activeVal));
      updates.push(`is_active = $${values.length}`);
    }

    if (price !== undefined && !isNaN(Number(price))) {
      values.push(Number(price));
      updates.push(`price = $${values.length}`);
    }

    const durationVal = duration_minutes || durationMinutes || duration;
    if (durationVal !== undefined) {
      values.push(parseDurationMinutes(durationVal));
      updates.push(`duration_minutes = $${values.length}`);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      values.push(id);
      const res = await db.query(
        `UPDATE public.services SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
      );
      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
      }
      const updated = res.rows[0];
      return NextResponse.json({
        success: true,
        data: {
          ...updated,
          duration: formatDuration(updated.duration_minutes)
        }
      });
    }

    return NextResponse.json({ success: true, message: 'No updates provided' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
