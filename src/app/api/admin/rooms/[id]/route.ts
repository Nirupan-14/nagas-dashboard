import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/api/auth-guard';
import { getDb } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import {
  saveRoomImages,
  deleteRoomImagesByUrls,
} from '@/lib/rooms/storage';

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

function serialize(doc: RoomDoc) {
  return {
    id: String(doc._id),
    roomNo: doc.roomNo,
    type: doc.type,
    description: doc.description,
    price: doc.price,
    imageUrls: doc.imageUrls || [],
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt),
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : String(doc.updatedAt),
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAuth(request);
  if (response) return response;

  try {
    const { id } = await params;
    const db = await getDb();
    const doc = await db.collection<RoomDoc>('rooms').findOne({
      _id: new ObjectId(id),
    });
    if (!doc) {
      return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
    }
    return NextResponse.json({ room: serialize(doc) });
  } catch (error) {
    console.error('[rooms] get failed', error);
    return NextResponse.json({ error: 'Failed to load room.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const { id } = await params;
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

    const db = await getDb();
    const existing = await db.collection<RoomDoc>('rooms').findOne({
      _id: new ObjectId(id),
    });
    if (!existing) {
      return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
    }

    let keep: string[] = [];
    const keepRaw = form.get('keepImageUrls');
    if (keepRaw) {
      try {
        const parsed = JSON.parse(String(keepRaw));
        if (Array.isArray(parsed)) {
          keep = parsed.filter(
            (u) => typeof u === 'string' && /^\/images\/rooms\//.test(u)
          );
        }
      } catch {
        // ignore malformed keepImageUrls
      }
    }

    const oldUrls = existing.imageUrls || [];
    const newUrls = imageFiles.length > 0 ? await saveRoomImages(imageFiles) : [];
    const finalUrls = [...keep, ...newUrls];
    if (finalUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one room image is required.' },
        { status: 400 }
      );
    }

    const removed = oldUrls.filter(
      (url) => !keep.includes(url) && /^\/images\/rooms\//.test(url)
    );
    await deleteRoomImagesByUrls(removed);

    const updated: RoomDoc = {
      roomNo,
      type,
      description,
      price: price < 0 ? 0 : price,
      imageUrls: finalUrls,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    await db.collection<RoomDoc>('rooms').updateOne(
      { _id: new ObjectId(id) },
      { $set: updated }
    );

    return NextResponse.json({ room: { id, ...updated } });
  } catch (error) {
    console.error('[rooms] update failed', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message.includes('image')
            ? error.message
            : 'Failed to update room.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const { id } = await params;
    const db = await getDb();
    const existing = await db.collection<RoomDoc>('rooms').findOne({
      _id: new ObjectId(id),
    });
    if (!existing) {
      return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
    }

    await db.collection<RoomDoc>('rooms').deleteOne({ _id: new ObjectId(id) });
    await deleteRoomImagesByUrls(existing.imageUrls);

    return NextResponse.json({ message: 'Room deleted successfully.' });
  } catch (error) {
    console.error('[rooms] delete failed', error);
    return NextResponse.json({ error: 'Failed to delete room.' }, { status: 500 });
  }
}