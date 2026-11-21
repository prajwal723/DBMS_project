import { NextResponse } from 'next/server';
import db from '../../../../lib/db/index';

export async function GET() {
  try {
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
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch service categories', data: [] },
      { status: 500 }
    );
  }
}

