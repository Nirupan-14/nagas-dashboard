import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  updateExistingUser,
  deleteExistingUser,
  findAdminById,
} from '@/lib';
import { requireAdmin } from '@/lib/api/auth-guard';
import type { UserRole } from '@/lib/database/mongodb';

const VALID_ROLES: UserRole[] = ['admin', 'manager', 'staff', 'viewer'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const { id } = await params;
    const user = await findAdminById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('[users] fetch failed', error);
    return NextResponse.json(
      { error: 'Failed to load user.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: sessionUser, response } = await requireAdmin(request);
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();

    const name = body?.name !== undefined ? String(body.name).trim() : undefined;
    const username =
      body?.username !== undefined ? String(body.username).trim().toLowerCase() : undefined;
    const email =
      body?.email !== undefined ? String(body.email).trim().toLowerCase() : undefined;
    const role = body?.role !== undefined
      ? String(body.role).toLowerCase() as UserRole
      : undefined;
    const permissions = Array.isArray(body?.permissions)
      ? (body.permissions as string[])
      : undefined;
    const isActive = typeof body?.isActive === 'boolean' ? body.isActive : undefined;
    const password = body?.password !== undefined ? String(body.password) : undefined;

    if (username !== undefined && !/^[a-z0-9_.-]+$/i.test(username)) {
      return NextResponse.json(
        { error: 'Username may only contain letters, numbers, dots, dashes and underscores.' },
        { status: 400 }
      );
    }

    if (email !== undefined && !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'Role must be one of: admin, manager, staff, viewer.' },
        { status: 400 }
      );
    }

    if (password !== undefined && password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters long.' },
        { status: 400 }
      );
    }

    const target = await findAdminById(id);
    if (!target) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (id === sessionUser.id && isActive === false) {
      return NextResponse.json(
        { error: 'You cannot deactivate your own account.' },
        { status: 400 }
      );
    }

    const updated = await updateExistingUser(id, {
      name,
      username,
      email,
      role,
      permissions,
      isActive,
      password,
    });

    if (!updated) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('[users] update failed', error);
    return NextResponse.json(
      { error: 'Failed to update user.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: sessionUser, response } = await requireAdmin(request);
  if (response) return response;

  try {
    const { id } = await params;

    if (id === sessionUser.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account.' },
        { status: 400 }
      );
    }

    const target = await findAdminById(id);
    if (!target) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const deleted = await deleteExistingUser(id);
    if (!deleted) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('[users] delete failed', error);
    return NextResponse.json(
      { error: 'Failed to delete user.' },
      { status: 500 }
    );
  }
}