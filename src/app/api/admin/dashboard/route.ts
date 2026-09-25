import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDashboardOverview } from '@/lib';
import { requireAuth } from '@/lib/api/auth-guard';

export async function GET(request: NextRequest) {
  const { response } = await requireAuth(request);
  if (response) return response;

  try {
    const overview = await getDashboardOverview();
    return NextResponse.json(overview);
  } catch (error) {
    console.error('[dashboard] overview failed', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data.' },
      { status: 500 }
    );
  }
}