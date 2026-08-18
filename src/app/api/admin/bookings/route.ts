import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getBookings } from '@/lib';
import { requireAdmin } from '@/lib/api/auth-guard';

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const bookings = await getBookings();
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('[dashboard] bookings failed', error);
    return NextResponse.json(
      { error: 'Failed to load bookings.' },
      { status: 500 }
    );
  }
}
