import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, getSessionUser, type SafeUser } from '@/lib';

type GuardResult =
  | { user: SafeUser; response: null }
  | { user: null; response: NextResponse };

export async function requireAuth(request: NextRequest): Promise<GuardResult> {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(cookie);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}

export async function requireAdmin(request: NextRequest): Promise<GuardResult> {
  const result = await requireAuth(request);
  if (result.response) return result;

  if (result.user.role !== 'admin') {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Admin access required.' },
        { status: 403 }
      ),
    };
  }

  return result;
}

export async function requirePermission(
  request: NextRequest,
  permission: string
): Promise<GuardResult> {
  const result = await requireAuth(request);
  if (result.response) return result;

  if (!result.user.permissions.includes(permission)) {
    return {
      user: null,
      response: NextResponse.json(
        { error: `Permission denied: ${permission}` },
        { status: 403 }
      ),
    };
  }

  return result;
}
