import { NextResponse } from 'next/server';
import db from '../../../../lib/db/index';
import { getCurrentSession } from '../../../../lib/auth/session';

export async function GET() {
  try {
    const sessionData = await getCurrentSession();
    const currentUser = sessionData?.user;

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const res = await db.query(
      `SELECT
         u.id,
         u.email,
         u.role,
         u.status AS account_status,
         u.created_at,
         COALESCE(p.full_name, '') AS name,
         p.age,
         COALESCE(p.gender, '') AS gender,
         COALESCE(p.phone, '') AS mobile,
         COALESCE(p.avatar_url, '') AS avatar_url,
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
             SELECT json_agg(
               json_build_object(
                 'id', ca.id,
                 'addressLine', ca.address_line,
                 'city', ca.city,
                 'state', ca.state,
                 'postalCode', ca.postal_code,
                 'isDefault', ca.is_default
               )
             )
             FROM public.customer_addresses ca
             WHERE ca.customer_id = u.id
           ),
           '[]'::json
         ) AS addresses,
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
       WHERE u.id = $1`,
      [currentUser.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const row = res.rows[0];
    const data = {
      id: row.id,
      email: row.email,
      role: row.role,
      name: row.name || '',
      fullName: row.name || '',
      age: row.age,
      gender: row.gender || '',
      mobile: row.mobile || '',
      phone: row.mobile || '',
      address: row.address || '',
      addresses: Array.isArray(row.addresses) ? row.addresses : [],
      avatarUrl: row.avatar_url || '',
      createdAt: row.created_at,
    };

    if (row.role === 'technician') {
      data.specialization = row.specialization || 'General Services';
      data.skills = Array.isArray(row.skills) ? row.skills : [];
      data.experienceYears = Number(row.experience_years) || 3;
      data.workingArea = row.working_area || 'Mangaluru Region';
      data.avatarUrl = row.avatar_url || '';
      data.status = row.tech_status;
      data.rating = row.tech_rating !== null ? parseFloat(row.tech_rating) : null;
      data.reviewCount = Number(row.tech_review_count) || 0;
      data.completedJobs = row.tech_completed_jobs;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const sessionData = await getCurrentSession();
    const currentUser = sessionData?.user;

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      fullName,
      age,
      gender,
      mobile,
      phone,
      address,
      skills,
      specialization,
      experience,
      experienceYears,
      serviceArea,
      workingArea,
    } = body;

    const contactMobile = (mobile || phone || '').trim();
    const contactAddress = (address || '').trim();
    const displayName = (name || fullName || '').trim();

    // Validate and clamp age if provided to satisfy CHECK (age IS NULL OR (age >= 16 AND age <= 120))
    let numericAge = null;
    if (age !== undefined && age !== null && age !== '') {
      const parsed = parseInt(age, 10);
      if (!isNaN(parsed) && parsed >= 16 && parsed <= 120) {
        numericAge = parsed;
      }
    }

    await db.transaction(async (client) => {
      // 1. Update public.user_profiles
      await client.query(
        `INSERT INTO public.user_profiles (user_id, full_name, phone, age, gender, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           full_name = CASE WHEN $2 <> '' THEN $2 ELSE public.user_profiles.full_name END,
           phone = CASE WHEN $3 <> '' THEN $3 ELSE public.user_profiles.phone END,
           age = COALESCE($4, public.user_profiles.age),
           gender = CASE WHEN $5 <> '' THEN $5 ELSE public.user_profiles.gender END,
           updated_at = NOW()`,
        [currentUser.id, displayName, contactMobile, numericAge, (gender || '').trim()]
      );

      // 2. Manage saved address in public.customer_addresses if provided
      if (contactAddress) {
        const addrCheck = await client.query(
          `SELECT id FROM public.customer_addresses WHERE customer_id = $1 AND is_default = TRUE LIMIT 1`,
          [currentUser.id]
        );
        if (addrCheck.rows.length > 0) {
          await client.query(
            `UPDATE public.customer_addresses
             SET address_line = $1, updated_at = NOW()
             WHERE id = $2`,
            [contactAddress, addrCheck.rows[0].id]
          );
        } else {
          await client.query(
            `INSERT INTO public.customer_addresses (customer_id, address_line, city, state, is_default)
             VALUES ($1, $2, 'Mangaluru', 'Karnataka', TRUE)`,
            [currentUser.id, contactAddress]
          );
        }
      }

      // 3. Update public.technicians & skills if the user role is technician
      if (currentUser.role === 'technician') {
        const parsedExp = parseInt(experienceYears !== undefined && experienceYears !== null ? experienceYears : experience, 10);
        const validExp = (!isNaN(parsedExp) && parsedExp >= 0 && parsedExp <= 60) ? parsedExp : null;
        const workArea = (workingArea || serviceArea || '').trim() || null;

        await client.query(
          `INSERT INTO public.technicians (id, experience_years, working_area, updated_at)
           VALUES ($1, COALESCE($2, 3), COALESCE($3, 'Mangaluru Region'), NOW())
           ON CONFLICT (id) DO UPDATE
           SET experience_years = COALESCE($2, public.technicians.experience_years),
               working_area = COALESCE($3, public.technicians.working_area),
               updated_at = NOW()`,
          [currentUser.id, validExp, workArea]
        );

        // Handle skills / specialization update in technician_skills junction table
        const skillsToProcess = [];
        if (Array.isArray(skills)) {
          for (const s of skills) {
            if (typeof s === 'string') skillsToProcess.push(s.trim());
            else if (s?.categoryName) skillsToProcess.push(s.categoryName);
            else if (s?.categoryId) skillsToProcess.push(s.categoryId);
          }
        } else if (typeof specialization === 'string') {
          skillsToProcess.push(...specialization.split(',').map(s => s.trim()).filter(Boolean));
        }

        if (skillsToProcess.length > 0) {
          for (const skillName of skillsToProcess) {
            const catRes = await client.query(
              `SELECT id FROM public.service_categories
               WHERE LOWER(name) = LOWER($1) OR id = LOWER($1)
               LIMIT 1`,
              [skillName]
            );
            if (catRes.rows.length > 0) {
              await client.query(
                `INSERT INTO public.technician_skills (technician_id, category_id, proficiency)
                 VALUES ($1, $2, 'Standard')
                 ON CONFLICT (technician_id, category_id) DO NOTHING`,
                [currentUser.id, catRes.rows[0].id]
              );
            }
          }
        }
      }
    });

    // 4. Return full updated profile
    const profileRes = await db.query(
      `SELECT
         u.id,
         u.email,
         u.role,
         u.status AS account_status,
         u.created_at,
         COALESCE(p.full_name, '') AS name,
         p.age,
         COALESCE(p.gender, '') AS gender,
         COALESCE(p.phone, '') AS mobile,
         COALESCE(p.avatar_url, '') AS avatar_url,
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
             SELECT json_agg(
               json_build_object(
                 'id', ca.id,
                 'addressLine', ca.address_line,
                 'city', ca.city,
                 'state', ca.state,
                 'postalCode', ca.postal_code,
                 'isDefault', ca.is_default
               )
             )
             FROM public.customer_addresses ca
             WHERE ca.customer_id = u.id
           ),
           '[]'::json
         ) AS addresses,
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
       WHERE u.id = $1`,
      [currentUser.id]
    );

    const row = profileRes.rows[0];
    const data = {
      id: row.id,
      email: row.email,
      role: row.role,
      name: row.name || '',
      fullName: row.name || '',
      age: row.age,
      gender: row.gender || '',
      mobile: row.mobile || '',
      phone: row.mobile || '',
      address: row.address || '',
      addresses: Array.isArray(row.addresses) ? row.addresses : [],
      avatarUrl: row.avatar_url || '',
      createdAt: row.created_at,
    };

    if (row.role === 'technician') {
      data.specialization = row.specialization || 'General Services';
      data.skills = Array.isArray(row.skills) ? row.skills : [];
      data.experienceYears = Number(row.experience_years) || 3;
      data.workingArea = row.working_area || 'Mangaluru Region';
      data.avatarUrl = row.avatar_url || '';
      data.status = row.tech_status;
      data.rating = row.tech_rating !== null ? parseFloat(row.tech_rating) : null;
      data.reviewCount = Number(row.tech_review_count) || 0;
      data.completedJobs = row.tech_completed_jobs;
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
