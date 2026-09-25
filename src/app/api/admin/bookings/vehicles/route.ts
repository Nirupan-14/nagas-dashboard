import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getVehicleBookings, getVehicleAvailabilityForAdmin } from '@/lib';
import { getDb } from '@/lib/database/mongodb';
import { requirePermission } from '@/lib/api/auth-guard';

export async function GET(request: NextRequest) {
  const { response } = await requirePermission(request, 'bookings:read');
  if (response) return response;

  try {
    const [bookings, bookedByVehicle, db] = await Promise.all([
      getVehicleBookings(),
      getVehicleAvailabilityForAdmin(),
      getDb(),
    ]);

    const vehicleDocs = await db
      .collection('vehicles')
      .find({})
      .project({ name: 1, price: 1, imageUrl: 1 })
      .sort({ createdAt: -1 })
      .toArray();

    const vehicles = vehicleDocs.map((v) => ({
      id: String(v._id),
      name: String(v?.name ?? ''),
      price: Number(v?.price) || 0,
      imageUrl: String(v?.imageUrl ?? ''),
    }));

    return NextResponse.json({ bookings, bookedByVehicle, vehicles });
  } catch (error) {
    console.error('[dashboard] vehicle bookings failed', error);
    return NextResponse.json(
      { error: 'Failed to load vehicle bookings.' },
      { status: 500 }
    );
  }
}