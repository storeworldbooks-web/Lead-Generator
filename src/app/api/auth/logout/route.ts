import { NextRequest, NextResponse } from 'next/server';
import { deleteSessionToken } from '@/lib/auth/authStore';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      await deleteSessionToken(token);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully.',
    });

    response.cookies.delete('auth_token');
    return response;
  } catch (err: any) {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth_token');
    return response;
  }
}
