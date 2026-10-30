import { NextRequest, NextResponse } from 'next/server';
import { validateSessionToken, getAllUsers, updateUserRole, updateUserPlan, updateUserStatus, deleteUser } from '@/lib/auth/authStore';

export const runtime = 'edge';

async function checkAdmin(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  const user = await validateSessionToken(token);
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function GET(request: NextRequest) {
  const admin = await checkAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const users = await getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Failed fetching users.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await checkAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, role, plan, status } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    if (role && (role === 'admin' || role === 'user')) {
      await updateUserRole(userId, role);
    }

    if (plan && ['FREE', 'STARTER', 'PRO', 'AGENCY'].includes(plan)) {
      await updateUserPlan(userId, plan);
    }

    if (status && (status === 'active' || status === 'suspended')) {
      await updateUserStatus(userId, status);
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Failed updating user.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await checkAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing user id' }, { status: 400 });
    }

    if (userId === admin.id) {
      return NextResponse.json({ success: false, message: 'Cannot delete your own admin account.' }, { status: 400 });
    }

    await deleteUser(userId);
    return NextResponse.json({ success: true, message: 'User deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Failed deleting user.' }, { status: 500 });
  }
}
