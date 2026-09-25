import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllUsers, createNewUser } from '@/lib';
import { requireAdmin } from '@/lib/api/auth-guard';
import { ROLE_PERMISSIONS } from '@/lib';
import type { UserRole } from '@/lib/database/mongodb';

const VALID_ROLES: UserRole[] = ['admin', 'manager', 'staff', 'viewer'];

export async function GET(request: NextRequest) {
  const { user, response } = await requireAdmin(request);
  if (response) return response;

  try {
    const users = await getAllUsers();
    return NextResponse.json({ users, currentUserId: user.id });
  } catch (error) {
    console.error('[users] list failed', error);
    return NextResponse.json(
      { error: 'Failed to load users.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    const username = String(body?.username || '').trim().toLowerCase();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const role = String(body?.role || '').toLowerCase() as UserRole;
    const permissions = Array.isArray(body?.permissions)
      ? (body.permissions as string[])
      : undefined;

    if (!name || !username || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, username, email, password and role are required.' },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'Role must be one of: admin, manager, staff, viewer.' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters long.' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_.-]+$/i.test(username)) {
      return NextResponse.json(
        { error: 'Username may only contain letters, numbers, dots, dashes and underscores.' },
        { status: 400 }
      );
    }

    const user = await createNewUser({
      name,
      username,
      email,
      password,
      role,
      permissions: permissions || ROLE_PERMISSIONS[role],
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('[users] create failed', error);
    return NextResponse.json(
      { error: 'Failed to create user.' },
      { status: 500 }
    );
  }
}