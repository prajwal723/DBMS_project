import { NextResponse } from 'next/server';
import db from '../../../lib/db/index';

export async function GET() {
  try {
    const result = await db.query(
      `SELECT
         u.id,
         u.email,
         COALESCE(p.full_name, 'Technician') AS name,
         COALESCE(p.phone, '') AS mobile,
         COALESCE(
           (
             SELECT ca.address_line || ', ' || ca.city
             FROM public.customer_addresses ca
             WHERE ca.customer_id = u.id AND ca.is_default = TRUE
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
         COALESCE(t.experience_years, 3) AS experience_years,
         COALESCE(t.working_area, 'Mangaluru Region') AS working_area,
         COALESCE(p.avatar_url, '') AS avatar_url,
         COALESCE(t.status, 'Available') AS status,
         (
           SELECT ROUND(AVG(r.rating)::numeric, 1)
           FROM public.ratings r
           JOIN public.bookings bk ON r.booking_id = bk.id
           WHERE bk.technician_id = u.id
         ) AS rating,
         (
           SELECT COUNT(r.id)::int
           FROM public.ratings r
           JOIN public.bookings bk ON r.booking_id = bk.id
           WHERE bk.technician_id = u.id
         ) AS review_count,
         COALESCE(
           (
             SELECT COUNT(*)::int
             FROM public.bookings bk
             WHERE bk.technician_id = u.id AND bk.status = 'Completed'
           ),
           0
         ) AS completed_jobs,
         COALESCE(
           (
             SELECT json_agg(json_build_object('categoryId', ts.category_id, 'proficiency', ts.proficiency, 'categoryName', sc.name))
             FROM public.technician_skills ts
             LEFT JOIN public.service_categories sc ON ts.category_id = sc.id
             WHERE ts.technician_id = u.id
           ),
           '[]'::json
         ) AS skills
       FROM public.users u
       LEFT JOIN public.user_profiles p ON p.user_id = u.id
       LEFT JOIN public.technicians t ON t.id = u.id
       WHERE u.role = 'technician' AND u.status = 'active'
       ORDER BY COALESCE(t.status, 'Available') = 'Available' DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        mobile: row.mobile,
        phone: row.mobile,
        address: row.address,
        specialization: row.specialization,
        skills: Array.isArray(row.skills) ? row.skills : [],
        experienceYears: Number(row.experience_years) || 3,
        workingArea: row.working_area,
        avatarUrl: row.avatar_url,
        status: row.status,
        rating: row.rating !== null ? parseFloat(row.rating) : null,
        reviewCount: Number(row.review_count) || 0,
        completedJobs: row.completed_jobs || 0,
      })),
    });
  } catch (error) {
    console.error('Technicians DB query failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch technicians', data: [] },
      { status: 500 }
    );
  }
}
