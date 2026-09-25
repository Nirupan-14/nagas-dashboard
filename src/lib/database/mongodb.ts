import { MongoClient, type Db, type ObjectId } from 'mongodb';
import { resolveSrv, resolveTxt } from 'dns/promises';
import { hashPassword } from '@/lib/auth/auth';
import { ROLE_PERMISSIONS, type UserRole } from '@/lib/roles';

export type { UserRole };

const DB_NAME = 'nagas-resort';
const USERS_COLLECTION = 'users';
const SERVER_SELECTION_TIMEOUT_MS = 15000;

if (!process.env.MONGODB_URI) {
  throw new Error(
    'MONGODB_URI environment variable is required to connect to MongoDB.'
  );
}
const uri: string = process.env.MONGODB_URI;

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

function mergeQueries(...parts: (string | undefined)[]): string {
  const params = new Map<string, string>();
  for (const part of parts) {
    if (!part) continue;
    for (const pair of part.split('&')) {
      if (!pair) continue;
      const eq = pair.indexOf('=');
      if (eq === -1) params.set(pair, '');
      else params.set(pair.slice(0, eq), pair.slice(eq + 1));
    }
  }
  return [...params.entries()].map(([k, v]) => `${k}=${v}`).join('&');
}

async function buildDirectSeedListUri(srvUri: string): Promise<string> {
  const match = srvUri.match(
    /^mongodb\+srv:\/\/([^@]+)@([^/?#]+)(\/[^?]*)?(?:\?(.*))?$/
  );
  if (!match) return srvUri;
  const [, auth, host, dbPath = '', query = ''] = match;

  let hosts: string[] = [];
  try {
    const records = await resolveSrv(`_mongodb._tcp.${host}`);
    hosts = records.map((r) => `${r.name}:${r.port}`);
  } catch (error) {
    console.warn('[mongodb] failed to resolve SRV records for fallback', error);
    return srvUri;
  }
  if (hosts.length === 0) return srvUri;

  let txtOptions = '';
  try {
    const txt = await resolveTxt(host);
    txtOptions = txt.flat().join('&');
  } catch {
    // TXT records are optional — proceed without them.
  }

  const merged = mergeQueries(query, txtOptions, 'tls=true');
  const directUri = `mongodb://${auth}@${hosts.join(',')}${dbPath}?${merged}`;
  console.log('[mongodb] using direct replica set seed list (SRV fallback)');
  return directUri;
}

async function connectWithFallback(srvUri: string): Promise<MongoClient> {
  try {
    client = new MongoClient(srvUri, {
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    });
    return await client.connect();
  } catch (error) {
    console.warn(
      '[mongodb] SRV connection failed, attempting direct seed-list fallback',
      (error as Error).message || error
    );
    try {
      await client?.close();
    } catch {
      // ignore close errors on a failed connection
    }
    const directUri = await buildDirectSeedListUri(srvUri);
    client = new MongoClient(directUri, {
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    });
    try {
      return await client.connect();
    } catch (fallbackError) {
      await client.close().catch(() => undefined);
      throw new Error(
        `MongoDB connection failed (SRV: ${(error as Error).message || 'unknown'}; direct: ${
          (fallbackError as Error).message || 'unknown'
        }). Check MONGODB_URI and your network.`
      );
    }
  }
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = connectWithFallback(uri).catch((error) => {
      clientPromise = undefined;
      throw error;
    });
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const mongoClient = await getMongoClient();
  return mongoClient.db(DB_NAME);
}

export interface AdminDocument {
  _id?: ObjectId;
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  permissions: string[];
  mustChangePassword: boolean;
  isActive: boolean;
  tempPasswordHash?: string;
  tempPasswordExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeAdmin {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: string[];
  mustChangePassword: boolean;
  isActive: boolean;
}

function toSafeAdmin(doc: AdminDocument): SafeAdmin {
  return {
    id: doc.id,
    name: doc.name,
    username: doc.username,
    email: doc.email,
    role: doc.role,
    permissions: doc.permissions,
    mustChangePassword: doc.mustChangePassword,
    isActive: doc.isActive,
  };
}

export async function findSafeAdminByEmail(
  email: string
): Promise<SafeAdmin | null> {
  const doc = await findAdminByEmail(email);
  return doc ? toSafeAdmin(doc) : null;
}

export async function findSafeAdminById(
  id: string
): Promise<SafeAdmin | null> {
  const doc = await findAdminById(id);
  return doc ? toSafeAdmin(doc) : null;
}

export async function findAdminByEmail(
  email: string
): Promise<AdminDocument | null> {
  const db = await getDb();
  const normalized = email.toLowerCase().trim();
  const doc = await db
    .collection<AdminDocument>(USERS_COLLECTION)
    .findOne({ email: normalized });
  return doc ?? null;
}

export async function findAdminByUsername(
  username: string
): Promise<AdminDocument | null> {
  const db = await getDb();
  const normalized = username.toLowerCase().trim();
  const doc = await db
    .collection<AdminDocument>(USERS_COLLECTION)
    .findOne({ username: normalized });
  return doc ?? null;
}

export async function findAdminById(id: string): Promise<AdminDocument | null> {
  const db = await getDb();
  const doc = await db
    .collection<AdminDocument>(USERS_COLLECTION)
    .findOne({ id });
  return doc ?? null;
}

export async function setAdminPassword(
  email: string,
  plainPassword: string,
  mustChangePassword: boolean
): Promise<void> {
  const db = await getDb();
  const passwordHash = hashPassword(plainPassword);
  await db.collection<AdminDocument>(USERS_COLLECTION).updateOne(
    { email: email.toLowerCase().trim() },
    {
      $set: {
        passwordHash,
        mustChangePassword,
        updatedAt: new Date(),
      },
    }
  );
}

export async function setTempPassword(
  email: string,
  tempPassword: string,
  expiresInMs: number
): Promise<void> {
  const db = await getDb();
  const tempPasswordHash = hashPassword(tempPassword);
  await db.collection<AdminDocument>(USERS_COLLECTION).updateOne(
    { email: email.toLowerCase().trim() },
    {
      $set: {
        tempPasswordHash,
        tempPasswordExpiresAt: new Date(Date.now() + expiresInMs),
        mustChangePassword: true,
        updatedAt: new Date(),
      },
    }
  );
}

export async function clearTempPassword(id: string): Promise<void> {
  const db = await getDb();
  await db.collection<AdminDocument>(USERS_COLLECTION).updateOne(
    { id },
    {
      $set: { updatedAt: new Date() },
      $unset: {
        tempPasswordHash: '',
        tempPasswordExpiresAt: '',
      },
    }
  );
}

export async function setAdminPasswordById(
  id: string,
  plainPassword: string,
  mustChangePassword: boolean
): Promise<void> {
  const db = await getDb();
  const passwordHash = hashPassword(plainPassword);
  await db.collection<AdminDocument>(USERS_COLLECTION).updateOne(
    { id },
    {
      $set: {
        passwordHash,
        mustChangePassword,
        updatedAt: new Date(),
      },
      $unset: {
        tempPasswordHash: '',
        tempPasswordExpiresAt: '',
      },
    }
  );
}

export async function ensureAdminSeeded(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin account.');
  }

  const db = await getDb();
  const existing = await db
    .collection<AdminDocument>(USERS_COLLECTION)
    .findOne({ email });

  if (existing) {
    const needsUpdate: Record<string, unknown> = {};
    if (!existing.username) {
      needsUpdate.username = email.split('@')[0];
    }
    if (!existing.permissions || existing.permissions.length === 0) {
      needsUpdate.permissions = ROLE_PERMISSIONS[existing.role as UserRole] || ROLE_PERMISSIONS.admin;
    }
    if (typeof existing.isActive === 'undefined') {
      needsUpdate.isActive = true;
    }
    // Always sync password from env var so ADMIN_PASSWORD stays authoritative
    needsUpdate.passwordHash = hashPassword(password);
    needsUpdate.updatedAt = new Date();
    await db.collection<AdminDocument>(USERS_COLLECTION).updateOne(
      { email },
      { $set: needsUpdate }
    );
    return;
  }

  const now = new Date();
  const id = `admin-${email.replace(/[^a-z0-9]/g, '-')}`;
  await db.collection<AdminDocument>(USERS_COLLECTION).insertOne({
    id,
    name: 'Resort Manager',
    username: email.split('@')[0],
    email,
    passwordHash: hashPassword(password),
    role: 'admin',
    permissions: ROLE_PERMISSIONS.admin,
    mustChangePassword: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getAllUsers(): Promise<SafeAdmin[]> {
  const db = await getDb();
  const docs = await db
    .collection<AdminDocument>(USERS_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(toSafeAdmin);
}

export async function createUser(data: {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  permissions?: string[];
}): Promise<SafeAdmin> {
  const db = await getDb();
  const now = new Date();
  const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const permissions = data.permissions || ROLE_PERMISSIONS[data.role];

  const doc: AdminDocument = {
    id,
    name: data.name,
    username: data.username.toLowerCase().trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash: hashPassword(data.password),
    role: data.role,
    permissions,
    mustChangePassword: true,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection<AdminDocument>(USERS_COLLECTION).insertOne(doc);
  return toSafeAdmin(doc);
}

export async function updateUser(
  id: string,
  data: Partial<{
    name: string;
    username: string;
    email: string;
    role: UserRole;
    permissions: string[];
    isActive: boolean;
    password: string;
  }>
): Promise<SafeAdmin | null> {
  const db = await getDb();
  const update: Record<string, unknown> = { updatedAt: new Date() };

  if (data.name !== undefined) update.name = data.name;
  if (data.username !== undefined) update.username = data.username.toLowerCase().trim();
  if (data.email !== undefined) update.email = data.email.toLowerCase().trim();
  if (data.role !== undefined) {
    update.role = data.role;
    if (data.permissions === undefined) {
      update.permissions = ROLE_PERMISSIONS[data.role];
    }
  }
  if (data.permissions !== undefined) update.permissions = data.permissions;
  if (data.isActive !== undefined) update.isActive = data.isActive;
  if (data.password) update.passwordHash = hashPassword(data.password);

  const result = await db
    .collection<AdminDocument>(USERS_COLLECTION)
    .findOneAndUpdate({ id }, { $set: update }, { returnDocument: 'after' });

  return result ? toSafeAdmin(result) : null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .collection<AdminDocument>(USERS_COLLECTION)
    .deleteOne({ id });
  return result.deletedCount > 0;
}

export async function updateUserProfile(
  id: string,
  data: Partial<{ name: string; username: string }>
): Promise<SafeAdmin | null> {
  const db = await getDb();
  const update: Record<string, unknown> = { updatedAt: new Date() };

  if (data.name !== undefined) update.name = data.name;
  if (data.username !== undefined) update.username = data.username.toLowerCase().trim();

  const result = await db
    .collection<AdminDocument>(USERS_COLLECTION)
    .findOneAndUpdate({ id }, { $set: update }, { returnDocument: 'after' });

  return result ? toSafeAdmin(result) : null;
}

export async function getBookingsCollection() {
  const db = await getDb();
  return db.collection('bookings');
}

export { toSafeAdmin };
