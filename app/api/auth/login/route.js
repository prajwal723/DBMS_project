import { NextResponse } from 'next/server';
import db from '../../../../lib/db/index';
import { comparePassword } from '../../../../lib/auth/password';
import { createSession } from '../../../../lib/auth/session';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Fetch user by email with normalized profile and operational metrics
    const result = await db.query(
      `SELECT
         u.id,
         u.email,
         u.password_hash,
         u.role,
         u.status AS account_status,
         u.created_at,
         COALESCE(p.full_name, '') AS name,
         p.age,
         COALESCE(p.gender, '') AS gender,
         COALESCE(p.phone, '') AS mobile,
         COALESCE(
           (
             SELECT ca.address_line || ', ' || ca.city
             FROM public.customer_addresses ca
             WHERE ca.customer_id = u.id AND ca.is_default = TRUE
             LIMIT 1
           ),
           (
             SELECT ca.address_line || ', ' || ca.city
             FROM public.customer_addresses ca
             WHERE ca.customer_id = u.id
             LIMIT 1
           ),
           ''
         ) AS address,
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
         COALESCE(t.experience_years, 3) AS experience_years,
         COALESCE(t.working_area, 'Mangaluru Region') AS working_area,
         COALESCE(p.avatar_url, '') AS avatar_url,
         COALESCE(t.status, 'Available') AS tech_status,
         (
           SELECT ROUND(AVG(r.rating)::numeric, 1)
           FROM public.ratings r
           JOIN public.bookings bk ON r.booking_id = bk.id
           WHERE bk.technician_id = u.id
         ) AS tech_rating,
         (
           SELECT COUNT(r.id)::int
           FROM public.ratings r
           JOIN public.bookings bk ON r.booking_id = bk.id
           WHERE bk.technician_id = u.id
         ) AS tech_review_count,
         COALESCE(
           (
             SELECT COUNT(*)::int
             FROM public.bookings bk
             WHERE bk.technician_id = u.id AND bk.status = 'Completed'
           ),
           0
         ) AS tech_completed_jobs
       FROM public.users u
       LEFT JOIN public.user_profiles p ON p.user_id = u.id
       LEFT JOIN public.technicians t ON t.id = u.id
       WHERE u.email = $1 AND u.status = 'active'`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const row = result.rows[0];

    // 2. Verify password with bcrypt
    const isPasswordValid = await comparePassword(password, row.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 3. Create session and cookie
    await createSession(row.id);

    const user = {
      id: row.id,
      email: row.email,
      role: row.role,
      name: row.name || '',
      age: row.age,
      gender: row.gender || '',
      mobile: row.mobile || '',
      address: row.address || '',
      createdAt: row.created_at,
    };

    if (row.role === 'technician') {
      user.technician = {
        specialization: row.specialization || 'General Services',
        skills: Array.isArray(row.skills) ? row.skills : [],
        experienceYears: Number(row.experience_years) || 3,
        workingArea: row.working_area || 'Mangaluru Region',
        avatarUrl: row.avatar_url || '',
        status: row.tech_status || 'Available',
        rating: row.tech_rating !== null ? parseFloat(row.tech_rating) : null,
        reviewCount: row.tech_review_count ? parseInt(row.tech_review_count, 10) : 0,
        completedJobs: row.tech_completed_jobs || 0,
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      user,
    });
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed. Please check database configuration.' },
      { status: 500 }
    );
  }
}

