import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPayments } from '@/lib';
import { requireAdmin } from '@/lib/api/auth-guard';

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const payments = await getPayments();
    return NextResponse.json({ payments });
  } catch (error) {
    console.error('[dashboard] payments failed', error);
    return NextResponse.json(
      { error: 'Failed to load payments.' },
      { status: 500 }
    );
  }
}
