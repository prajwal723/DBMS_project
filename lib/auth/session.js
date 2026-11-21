import crypto from 'crypto';
import { cookies } from 'next/headers';
import db from '../db/index';

export const SESSION_COOKIE_NAME = 'fixmate_session';
export const SESSION_DURATION_DAYS = 7;
export const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Generate a cryptographically secure 64-character opaque token.
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash an opaque session token using SHA-256 for secure database storage.
 * @param {string} token - The raw session token.
 * @returns {string} 64-character SHA-256 hex digest.
 */
export function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create a new database-backed session and set the HTTP-only cookie.
 * @param {string} userId - UUID of the user.
 * @returns {Promise<{ token: string, expiresAt: Date }>}
 */
export async function createSession(userId) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.query(
    `INSERT INTO public.sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return { token, expiresAt };
}

/**
 * Validate the current session from incoming HTTP-only cookies and return the user.
 * @returns {Promise<{ session: object, user: object } | null>}
 */
export async function getCurrentSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const tokenHash = hashSessionToken(token);

    const result = await db.query(
      `SELECT
         s.id AS session_id,
         s.user_id,
         s.expires_at,
         s.last_active_at,
         u.id,
         u.email,
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
       FROM public.sessions s
       JOIN public.users u ON u.id = s.user_id
       LEFT JOIN public.user_profiles p ON p.user_id = u.id
       LEFT JOIN public.technicians t ON t.id = u.id
       WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.status = 'active'`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Refresh last active timestamp asynchronously
    db.query(`UPDATE public.sessions SET last_active_at = NOW() WHERE token_hash = $1`, [tokenHash]).catch(
      (err) => console.error('Failed to update session activity:', err)
    );

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

    return {
      session: {
        id: row.session_id,
        userId: row.user_id,
        expiresAt: row.expires_at,
        lastActiveAt: row.last_active_at,
      },
      user,
    };
  } catch (error) {
    console.error('Error fetching current session:', error);
    return null;
  }
}

/**
 * Destroy the current session by revoking the database row and clearing the cookie.
 */
export async function destroySession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      const tokenHash = hashSessionToken(token);
      await db.query(`DELETE FROM public.sessions WHERE token_hash = $1`, [tokenHash]);
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error('Error destroying session:', error);
  }
}

