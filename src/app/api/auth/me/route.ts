import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth-guard';

export async function GET(request: NextRequest) {
  const { user, response } = await requireAdmin(request);
  if (response) return response;
  return NextResponse.json({ user });
}
