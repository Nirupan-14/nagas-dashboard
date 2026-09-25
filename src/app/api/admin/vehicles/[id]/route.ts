import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/api/auth-guard';
import { getDb } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import {
  saveVehicleImage,
  deleteVehicleImageByUrl,
} from '@/lib/vehicles/storage';

interface VehicleDoc {
  _id?: ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'vehicle'
  );
}

function parseId(id: string): { ok: true; id: ObjectId } | { ok: false } {
  try {
    return { ok: true, id: new ObjectId(id) };
  } catch {
    return { ok: false };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAuth(request);
  if (response) return response;

  const parsed = parseId((await params).id);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Invalid vehicle ID.' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const doc = await db
      .collection<VehicleDoc>('vehicles')
      .findOne({ _id: parsed.id });
    if (!doc) {
      return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 });
    }

    return NextResponse.json({
      vehicle: {
        id: String(doc._id),
        name: doc.name,
        slug: doc.slug,
        description: doc.description,
        price: doc.price,
        imageUrl: doc.imageUrl,
        createdAt:
          doc.createdAt instanceof Date
            ? doc.createdAt.toISOString()
            : String(doc.createdAt),
      },
    });
  } catch (error) {
    console.error('[vehicles] fetch failed', error);
    return NextResponse.json(
      { error: 'Failed to load vehicle.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const parsed = parseId((await params).id);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Invalid vehicle ID.' }, { status: 400 });
  }

  try {
    const form = await request.formData();
    const name = String(form.get('name') || '').trim();
    const description = String(form.get('description') || '').trim();
    const price = Number(form.get('price')) || 0;
    const image = form.get('image');

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const existing = await db
      .collection<VehicleDoc>('vehicles')
      .findOne({ _id: parsed.id });
    if (!existing) {
      return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 });
    }

    const update: Record<string, unknown> = {
      name,
      slug: slugify(name),
      description,
      price: price < 0 ? 0 : price,
      updatedAt: new Date(),
    };

    let newImageUrl = existing.imageUrl;
    if (image instanceof File && image.size > 0) {
      newImageUrl = await saveVehicleImage(image);
      update.imageUrl = newImageUrl;
    }

    await db
      .collection<VehicleDoc>('vehicles')
      .updateOne({ _id: parsed.id }, { $set: update });

    if (image instanceof File && image.size > 0) {
      await deleteVehicleImageByUrl(existing.imageUrl).catch(() => undefined);
    }

    return NextResponse.json({
      vehicle: {
        id: String(existing._id),
        name,
        slug: update.slug as string,
        description,
        price: update.price as number,
        imageUrl: newImageUrl,
        createdAt: String(existing.createdAt),
      },
    });
  } catch (error) {
    console.error('[vehicles] update failed', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message.includes('Image')
            ? error.message
            : 'Failed to update vehicle.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  const parsed = parseId((await params).id);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Invalid vehicle ID.' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const existing = await db
      .collection<VehicleDoc>('vehicles')
      .findOne({ _id: parsed.id });
    if (!existing) {
      return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 });
    }

    await db.collection<VehicleDoc>('vehicles').deleteOne({ _id: parsed.id });
    await deleteVehicleImageByUrl(existing.imageUrl).catch(() => undefined);

    return NextResponse.json({ message: 'Vehicle deleted successfully.' });
  } catch (error) {
    console.error('[vehicles] delete failed', error);
    return NextResponse.json(
      { error: 'Failed to delete vehicle.' },
      { status: 500 }
    );
  }
}