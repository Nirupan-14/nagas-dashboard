import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/api/auth-guard';
import { getDb } from '@/lib/database/mongodb';
import type { ObjectId } from 'mongodb';
import { saveVehicleImage } from '@/lib/vehicles/storage';

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

export async function GET(request: NextRequest) {
  const { response } = await requireAuth(request);
  if (response) return response;

  try {
    const db = await getDb();
    const docs = await db
      .collection<VehicleDoc>('vehicles')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const vehicles = docs.map((v) => ({
      id: String(v._id),
      name: v.name,
      slug: v.slug,
      description: v.description,
      price: v.price,
      imageUrl: v.imageUrl,
      createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : String(v.createdAt),
    }));

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('[vehicles] list failed', error);
    return NextResponse.json(
      { error: 'Failed to load vehicles.' },
      { status: 500 }
    );
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'vehicle';
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;

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

    let imageUrl = '';
    if (image instanceof File) {
      imageUrl = await saveVehicleImage(image);
    } else {
      return NextResponse.json(
        { error: 'A vehicle photo is required.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const doc: VehicleDoc = {
      name,
      slug: slugify(name),
      description,
      price: price < 0 ? 0 : price,
      imageUrl,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDb();
    const result = await db.collection<VehicleDoc>('vehicles').insertOne(doc);

    return NextResponse.json(
      { vehicle: { id: String(result.insertedId), ...doc } },
      { status: 201 }
    );
  } catch (error) {
    console.error('[vehicles] create failed', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message.includes('Image')
            ? error.message
            : 'Failed to create vehicle.',
      },
      { status: 500 }
    );
  }
}