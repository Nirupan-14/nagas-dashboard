import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth-guard';
import {
  changePassword,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_TTL_MS,
} from '@/lib';

export async function POST(request: NextRequest) {
  try {
    const { user, response: guardResponse } = await requireAuth(request);
    if (guardResponse) return guardResponse;

    const body = await request.json();
    const currentPassword = String(body?.currentPassword || '');
    const password = String(body?.password || '');

    if (!currentPassword || !password) {
      return NextResponse.json(
        { error: 'Current and new passwords are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const updated = await changePassword(user.id, currentPassword, password);
    if (!updated) {
      return NextResponse.json(
        { error: 'The current password is incorrect or has expired.' },
        { status: 400 }
      );
    }

    const token = createSessionToken({
      sub: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      permissions: updated.permissions,
      mustChangePassword: updated.mustChangePassword,
    });

    const response = NextResponse.json({
      message: 'Password updated successfully.',
      user: updated,
    });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    });

    return response;
  } catch (error) {
    console.error('[auth] change-password failed', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
