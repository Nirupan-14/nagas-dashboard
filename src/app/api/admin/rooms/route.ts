import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/api/auth-guard';
import { getDb } from '@/lib/database/mongodb';
import type { ObjectId } from 'mongodb';
import { saveRoomImages } from '@/lib/rooms/storage';

interface RoomDoc {
  _id?: ObjectId;
  roomNo: string;
  type: string;
  description: string;
  price: number;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  const { response } = await requireAuth(request);
  if (response) return response;

  try {
    const db = await getDb();
    const docs = await db
      .collection<RoomDoc>('rooms')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const rooms = docs.map((r) => ({
      id: String(r._id),
      roomNo: r.roomNo,
      type: r.type,
      description: r.description,
      price: r.price,
      imageUrls: r.imageUrls || [],
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    }));

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('[rooms] list failed', error);
    return NextResponse.json({ error: 'Failed to load rooms.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const form = await request.formData();
    const roomNo = String(form.get('roomNo') || '').trim();
    const type = String(form.get('type') || '').trim();
    const description = String(form.get('description') || '').trim();
    const price = Number(form.get('price')) || 0;
    const imageFiles = form.getAll('images').filter((f) => f instanceof File) as File[];

    if (!roomNo || !type || !description) {
      return NextResponse.json(
        { error: 'Room number, type and description are required.' },
        { status: 400 }
      );
    }

    const imageUrls = await saveRoomImages(imageFiles);
    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one room image is required.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const doc: RoomDoc = {
      roomNo,
      type,
      description,
      price: price < 0 ? 0 : price,
      imageUrls,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDb();
    const result = await db.collection<RoomDoc>('rooms').insertOne(doc);

    return NextResponse.json(
      { room: { id: String(result.insertedId), ...doc } },
      { status: 201 }
    );
  } catch (error) {
    console.error('[rooms] create failed', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message.includes('image')
            ? error.message
            : 'Failed to create room.',
      },
      { status: 500 }
    );
  }
}