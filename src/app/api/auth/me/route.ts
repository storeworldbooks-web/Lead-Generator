import { NextRequest, NextResponse } from 'next/server';
import { validateSessionToken } from '@/lib/auth/authStore';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = await validateSessionToken(token);
    if (!user) {
      const response = NextResponse.json({ success: false, user: null }, { status: 401 });
      response.cookies.delete('auth_token');
      return response;
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
