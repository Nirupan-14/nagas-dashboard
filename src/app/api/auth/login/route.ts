import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  loginAdmin,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_TTL_MS,
} from '@/lib';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required.' },
        { status: 400 }
      );
    }

    const user = await loginAdmin(identifier, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    const token = createSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      mustChangePassword: user.mustChangePassword,
    });

    const response = NextResponse.json({
      user,
      mustChangePassword: user.mustChangePassword,
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
    console.error('[auth] login failed', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
