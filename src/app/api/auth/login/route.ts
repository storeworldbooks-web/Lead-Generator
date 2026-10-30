import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth/authStore';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Please provide both email and password.' }, { status: 400 });
    }

    const { user, session } = await loginUser(email, password);

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Signed in successfully.',
    });

    response.cookies.set('auth_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Invalid email or password.' },
      { status: 401 }
    );
  }
}
