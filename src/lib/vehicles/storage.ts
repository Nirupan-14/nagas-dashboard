import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

const ALLOWED_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg',
]);

export function getVehicleUploadDir(): string {
  return path.resolve(process.cwd(), '../nagas-resort/public/images/vehicles');
}

export function publicUrlFor(filename: string): string {
  return `/images/vehicles/${filename}`;
}

function extFor(file: File): string {
  const name = file.name.toLowerCase();
  const match = /\.([a-z0-9]+)$/.exec(name);
  const ext = match ? match[1] : 'png';
  return ALLOWED_EXTENSIONS.has(ext) ? ext : 'png';
}

export async function saveVehicleImage(file: File): Promise<string> {
  const dir = getVehicleUploadDir();
  await mkdir(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length === 0) {
    throw new Error('The uploaded image is empty.');
  }
  if (bytes.length > 5 * 1024 * 1024) {
    throw new Error('Image must be 5MB or smaller.');
  }

  const filename = `vehicle-${Date.now()}-${randomBytes(6).toString('hex')}.${extFor(file)}`;
  await writeFile(path.join(dir, filename), bytes);
  return publicUrlFor(filename);
}

export async function deleteVehicleImageByUrl(imageUrl: string): Promise<void> {
  if (!imageUrl) return;
  const prefix = '/images/vehicles/';
  if (!imageUrl.startsWith(prefix)) return;
  const filename = imageUrl.slice(prefix.length);
  if (filename.includes('..') || filename.includes('/')) return;
  const dir = getVehicleUploadDir();
  try {
    await unlink(path.join(dir, filename));
  } catch {
    // File may already be gone — ignore.
  }
}