import { NextResponse } from 'next/server';
import db from '../../../../lib/db/index';
import { hashPassword } from '../../../../lib/auth/password';
import { createSession } from '../../../../lib/auth/session';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      role = 'customer',
      name = '',
      age = null,
      gender = '',
      mobile = '',
      phone = '',
      address = '',
      specialization = 'General Services',
      experienceYears = '3',
      workingArea = 'Mangaluru Region',
    } = body;

    // 1. Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const normalizedRole = role.toLowerCase();
    // Prevent self-registration into administrative or dispatch roles
    if (!['customer', 'technician'].includes(normalizedRole)) {
      return NextResponse.json(
        { success: false, error: 'Registration is only permitted for Customer or Technician accounts.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const contactMobile = mobile || phone || '';

    // 2. Check duplicate email
    const existing = await db.query('SELECT id FROM public.users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // 3. Hash password
    const passwordHash = await hashPassword(password);

    // 4. Create user and profile records in a clean transaction
    let createdUser;
    await db.transaction(async (client) => {
      const userRes = await client.query(
        `INSERT INTO public.users (email, password_hash, role, status)
         VALUES ($1, $2, $3, 'active')
         RETURNING id, email, role, status, created_at`,
        [normalizedEmail, passwordHash, normalizedRole]
      );

      const userId = userRes.rows[0].id;
      const parsedAge = age ? parseInt(age, 10) : null;
      const validAge = (!isNaN(parsedAge) && parsedAge >= 16 && parsedAge <= 120) ? parsedAge : null;

      // Update the user_profiles row automatically provisioned by the database trigger
      await client.query(
        `UPDATE public.user_profiles
         SET full_name = $1,
             phone = $2,
             age = $3,
             gender = $4,
             updated_at = NOW()
         WHERE user_id = $5`,
        [name, contactMobile, validAge, gender, userId]
      );

      // Save initial address if provided
      if (address && address.trim()) {
        await client.query(
          `INSERT INTO public.customer_addresses (customer_id, address_line, city, state, is_default)
           VALUES ($1, $2, 'Mangaluru', 'Karnataka', TRUE)`,
          [userId, address.trim()]
        );
      }

      createdUser = {
        id: userId,
        email: userRes.rows[0].email,
        role: userRes.rows[0].role,
        name: name,
        age: validAge,
        gender: gender,
        mobile: contactMobile,
        address: address,
        createdAt: userRes.rows[0].created_at,
      };

      if (normalizedRole === 'technician') {
        const parsedExp = parseInt(experienceYears, 10);
        const validExp = (!isNaN(parsedExp) && parsedExp >= 0 && parsedExp <= 60) ? parsedExp : 3;

        await client.query(
          `INSERT INTO public.technicians (id, experience_years, working_area, status)
           VALUES ($1, $2, $3, 'Available')
           ON CONFLICT (id) DO UPDATE SET
             experience_years = EXCLUDED.experience_years,
             working_area = EXCLUDED.working_area,
             status = 'Available',
             updated_at = NOW()`,
          [userId, validExp, workingArea]
        );

        // Normalize technician specialization into technician_skills junction table
        const skillCategoryName = (specialization || 'Plumbing').trim();
        const catRes = await client.query(
          `SELECT id, name FROM public.service_categories
           WHERE LOWER(name) = LOWER($1) OR id = LOWER($1)
           LIMIT 1`,
          [skillCategoryName]
        );
        const resolvedCategoryId = catRes.rows[0]?.id || 'plumbing';
        const resolvedCategoryName = catRes.rows[0]?.name || 'Plumbing';

        await client.query(
          `INSERT INTO public.technician_skills (technician_id, category_id, proficiency)
           VALUES ($1, $2, 'Standard')
           ON CONFLICT (technician_id, category_id) DO NOTHING`,
          [userId, resolvedCategoryId]
        );

        createdUser.technician = {
          specialization: resolvedCategoryName,
          skills: [{ categoryId: resolvedCategoryId, categoryName: resolvedCategoryName, proficiency: 'Standard' }],
          experienceYears: validExp,
          workingArea: workingArea,
          status: 'Available',
          rating: null,
          reviewCount: 0,
          completedJobs: 0,
        };
      }
    });

    // 5. Establish session
    await createSession(createdUser.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully.',
        user: {
          id: createdUser.id,
          email: createdUser.email,
          role: createdUser.role,
          name: createdUser.name,
          mobile: createdUser.mobile,
          address: createdUser.address,
          technician: createdUser.technician || null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed. Please check server connection.' },
      { status: 500 }
    );
  }
}

