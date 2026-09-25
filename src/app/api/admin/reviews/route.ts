import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth-guard';
import { getDb } from '@/lib/database/mongodb';

interface ReviewDoc {
  _id?: unknown;
  name: string;
  role: string;
  quote: string;
  rating: number;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  const { response } = await requireAuth(request);
  if (response) return response;

  try {
    const db = await getDb();
    const reviews = await db
      .collection<ReviewDoc>('reviews')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const mapped = reviews.map((r) => ({
      id: String(r._id),
      name: r.name,
      role: r.role,
      quote: r.quote,
      rating: r.rating,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    }));

    return NextResponse.json({ reviews: mapped });
  } catch (error) {
    console.error('[reviews] list failed', error);
    return NextResponse.json(
      { error: 'Failed to load reviews.' },
      { status: 500 }
    );
  }
}
