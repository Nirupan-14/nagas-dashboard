import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth-guard';
import { getDb } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const { id } = await params;
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid review ID.' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('reviews').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('[reviews] delete failed', error);
    return NextResponse.json(
      { error: 'Failed to delete review.' },
      { status: 500 }
    );
  }
}
