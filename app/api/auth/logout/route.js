import { NextResponse } from 'next/server';
import { destroySession } from '../../../../lib/auth/session';

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('Logout route error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process logout.' },
      { status: 500 }
    );
  }
}

