import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, getSessionUser, type SafeUser } from '@/lib';

type GuardResult =
  | { user: SafeUser; response: null }
  | { user: null; response: NextResponse };

export async function requireAdmin(request: NextRequest): Promise<GuardResult> {
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
