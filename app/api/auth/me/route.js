import { NextResponse } from 'next/server';
import { getCurrentSession } from '../../../../lib/auth/session';

export async function GET() {
  try {
    const sessionData = await getCurrentSession();

    if (!sessionData || !sessionData.user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: sessionData.user,
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: error.message,
    });
  }
}

