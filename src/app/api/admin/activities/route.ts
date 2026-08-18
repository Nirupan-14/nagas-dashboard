import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getActivities } from '@/lib';
import { requireAdmin } from '@/lib/api/auth-guard';

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const activities = await getActivities();
    return NextResponse.json({ activities });
  } catch (error) {
    console.error('[dashboard] activities failed', error);
    return NextResponse.json(
      { error: 'Failed to load activities.' },
      { status: 500 }
    );
  }
}
