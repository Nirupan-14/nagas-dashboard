import path from "node:path";
import fs from "node:fs/promises";

const ALLOWED_EXT = /\.(png|jpe?g|webp)$/i;

export function getRoomUploadDir() {
  return path.resolve(process.cwd(), "../nagas-resort/public/images/rooms");
}

export async function saveRoomImages(files: File[]): Promise<string[]> {
  if (files.length === 0) {
    throw new Error("At least one room image is required.");
  }

  const dir = getRoomUploadDir();
  await fs.mkdir(dir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed.");
    }
    const ext = (path.extname(file.name) || ".png").toLowerCase();
    if (!ALLOWED_EXT.test(ext)) {
      throw new Error("Only PNG, JPG or WebP images are allowed.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Each image must be 5MB or smaller.");
    }
    const filename = `room-${Date.now()}-${Math.random().toString(16).slice(2, 10)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, filename), buffer);
    urls.push(`/images/rooms/${filename}`);
  }
  return urls;
}

export async function deleteRoomImagesByUrls(urls: string[] = []) {
  const dir = getRoomUploadDir();
  for (const url of urls) {
    const match = /^\/images\/rooms\/([^/?#]+)$/.exec(url ?? "");
    if (!match) continue;
    try {
      await fs.unlink(path.join(dir, match[1]));
    } catch {
      // ignore missing files
    }
  }
}