import { NextResponse } from 'next/server';
import db from '../../../../lib/db/index';
import { requireAuth, ROLES } from '../../../../lib/auth/rbac';
import { hashPassword } from '../../../../lib/auth/password';

export async function GET(request) {
  try {
    const authCheck = await requireAuth([ROLES.ADMIN]);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');

    let queryText = `
      SELECT
        u.id,
        u.email,
        u.role,
        u.status AS user_status,
        u.created_at,
        p.full_name AS name,
        p.phone AS mobile,
        p.age,
        p.gender,
        p.avatar_url,
        COALESCE(addr.address_line, '') AS address,
        COALESCE(
          (
            SELECT string_agg(sc.name, ', ')
            FROM public.technician_skills ts
            JOIN public.service_categories sc ON ts.category_id = sc.id
            WHERE ts.technician_id = u.id
          ),
          'General Services'
        ) AS specialization,
        COALESCE(
          (
            SELECT json_agg(json_build_object('categoryId', ts.category_id, 'categoryName', sc.name, 'proficiency', ts.proficiency))
            FROM public.technician_skills ts
            JOIN public.service_categories sc ON ts.category_id = sc.id
            WHERE ts.technician_id = u.id
          ),
          '[]'::json
        ) AS skills,
        t.experience_years,
        t.working_area,
        t.status AS tech_status,
        (
          SELECT ROUND(AVG(r.rating)::numeric, 1)
          FROM public.ratings r
          JOIN public.bookings b ON r.booking_id = b.id
          WHERE b.technician_id = u.id
        ) AS tech_rating,
        (
          SELECT COUNT(r.id)::int
          FROM public.ratings r
          JOIN public.bookings b ON r.booking_id = b.id
          WHERE b.technician_id = u.id
        ) AS tech_review_count,
        COALESCE(
          (
            SELECT COUNT(*)::int
            FROM public.bookings b
            WHERE b.technician_id = u.id AND b.status = 'Completed'
          ),
          0
        ) AS tech_completed_jobs
      FROM public.users u
      LEFT JOIN public.user_profiles p ON p.user_id = u.id
      LEFT JOIN LATERAL (
        SELECT address_line
        FROM public.customer_addresses
        WHERE customer_id = u.id
        ORDER BY is_default DESC, created_at DESC
        LIMIT 1
      ) addr ON TRUE
      LEFT JOIN public.technicians t ON t.id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (roleFilter) {
      params.push(roleFilter.toLowerCase());
      queryText += ` AND u.role = $${params.length}`;
    }

    queryText += ` ORDER BY u.created_at DESC`;

    const result = await db.query(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        email: row.email,
        role: row.role,
        name: row.name || 'User',
        fullName: row.name || 'User',
        age: row.age,
        gender: row.gender,
        mobile: row.mobile || '',
        phone: row.mobile || '',
        address: row.address,
        createdAt: row.created_at,
        specialization: row.specialization,
        skills: row.skills,
        experienceYears: typeof row.experience_years === 'number' ? row.experience_years : (parseInt(row.experience_years, 10) || 3),
        workingArea: row.working_area,
        status: row.tech_status || row.user_status || 'Active',
        rating: row.tech_rating !== null ? parseFloat(row.tech_rating) : null,
        reviewCount: Number(row.tech_review_count) || 0,
        completedJobs: row.tech_completed_jobs || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
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
    const {
      email,
      password = '1tapfix@DefaultPassword2026',
      role = 'customer',
      name = '',
      fullName = '',
      mobile = '',
      phone = '',
      address = '',
      age,
      gender,
      specialization = 'General Services',
      experienceYears = 3,
      workingArea = 'Mangaluru Region',
    } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role.toLowerCase();
    const resolvedName = (name || fullName || '').trim();
    const resolvedPhone = (mobile || phone || '').trim();
    const parsedExp = typeof experienceYears === 'number' ? experienceYears : (parseInt(experienceYears, 10) || 3);
    const clampedExp = Math.max(0, Math.min(60, parsedExp));

    // Check duplicate
    const existing = await db.query('SELECT id FROM public.users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    let createdUser;

    await db.transaction(async (client) => {
      const res = await client.query(
        `INSERT INTO public.users (email, password_hash, role, status)
         VALUES ($1, $2, $3, 'active')
         RETURNING id, email, role, status, created_at`,
        [normalizedEmail, passwordHash, normalizedRole]
      );
      createdUser = res.rows[0];

      // Update profile provisioned by database trigger
      await client.query(
        `UPDATE public.user_profiles
         SET full_name = $1,
             phone = $2,
             age = COALESCE($3, age),
             gender = COALESCE($4, gender),
             updated_at = NOW()
         WHERE user_id = $5`,
        [
          resolvedName || (normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)),
          resolvedPhone || '',
          age ? parseInt(age, 10) : null,
          gender || '',
          createdUser.id,
        ]
      );

      // If customer address provided (customers only)
      if (normalizedRole === 'customer' && address && address.trim()) {
        await client.query(
          `INSERT INTO public.customer_addresses (customer_id, address_line, is_default)
           VALUES ($1, $2, TRUE)`,
          [createdUser.id, address.trim()]
        );
      }

      if (normalizedRole === 'technician') {
        await client.query(
          `INSERT INTO public.technicians (id, experience_years, working_area, status)
           VALUES ($1, $2, $3, 'Available')
           ON CONFLICT (id) DO UPDATE SET
             experience_years = EXCLUDED.experience_years,
             working_area = EXCLUDED.working_area,
             status = 'Available',
             updated_at = NOW()`,
          [createdUser.id, clampedExp, workingArea]
        );

        const skillName = (specialization || 'Plumbing').trim();
        const catRes = await client.query(
          `SELECT id FROM public.service_categories WHERE LOWER(name) = LOWER($1) OR id = LOWER($1) LIMIT 1`,
          [skillName]
        );
        const catId = catRes.rows[0]?.id || 'plumbing';
        await client.query(
          `INSERT INTO public.technician_skills (technician_id, category_id, proficiency)
           VALUES ($1, $2, 'Standard')
           ON CONFLICT (technician_id, category_id) DO NOTHING`,
          [createdUser.id, catId]
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        ...createdUser,
        name: resolvedName,
        fullName: resolvedName,
        phone: resolvedPhone,
        mobile: resolvedPhone,
        address,
        rating: 5.0,
        completedJobs: 0,
      },
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
