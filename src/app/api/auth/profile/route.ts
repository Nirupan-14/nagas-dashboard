import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth-guard';
import { updateMyProfile, createSessionToken, SESSION_COOKIE, SESSION_TTL_MS } from '@/lib';

export async function PUT(request: NextRequest) {
  try {
    const { user, response: guardResponse } = await requireAuth(request);
    if (guardResponse) return guardResponse;

    const body = await request.json();
    const name = body?.name !== undefined ? String(body.name).trim() : undefined;
    const username =
      body?.username !== undefined ? String(body.username).trim().toLowerCase() : undefined;

    if (name !== undefined && !name) {
      return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
    }

    if (username !== undefined && !/^[a-z0-9_.-]+$/i.test(username)) {
      return NextResponse.json(
        { error: 'Username may only contain letters, numbers, dots, dashes and underscores.' },
        { status: 400 }
      );
    }

    if (name === undefined && username === undefined) {
      return NextResponse.json(
        { error: 'Provide at least one field to update.' },
        { status: 400 }
      );
    }

    const updated = await updateMyProfile(user.id, { name, username });
    if (!updated) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
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
      message: 'Profile updated successfully.',
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
    console.error('[auth] profile update failed', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}