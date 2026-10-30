import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth/authStore';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ success: false, message: 'Please provide a valid name (at least 2 characters).' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const { user, session } = await registerUser(name, email, password);

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Account created successfully.',
    });

    // Set secure HTTP-only cookie
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
      { success: false, message: err?.message || 'Failed to create account.' },
      { status: 400 }
    );
  }
}
