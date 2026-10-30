import { NextRequest, NextResponse } from 'next/server';
import { validateSessionToken, getAdminMetrics } from '@/lib/auth/authStore';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const user = await validateSessionToken(token);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 });
  }

  try {
    const metrics = await getAdminMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Failed fetching metrics.' }, { status: 500 });
  }
}
