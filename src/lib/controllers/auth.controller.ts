import { generateToken, verifyPassword } from '@/lib/auth/auth';
import {
  findAdminByEmail as findAdminDocByEmail,
  findAdminByUsername as findAdminDocByUsername,
  findAdminById as findAdminDocById,
  ensureAdminSeeded,
  setAdminPasswordById,
  setTempPassword,
  getAllUsers as getAllUsersDoc,
  createUser as createUserDoc,
  updateUser as updateUserDoc,
  deleteUser as deleteUserDoc,
  updateUserProfile as updateUserProfileDoc,
  type SafeAdmin,
  type UserRole,
} from '@/lib/database/mongodb';
import { sendTempPasswordEmail } from '@/lib/mail/nodemailer';

export const TEMP_PASSWORD_TTL_MS = 15 * 60 * 1000; // 15 minutes

export type { SafeAdmin };

function toSafe(doc: any): SafeAdmin {
  return {
    id: doc.id,
    name: doc.name,
    username: doc.username,
    email: doc.email,
    role: doc.role,
    permissions: doc.permissions || [],
    mustChangePassword: doc.mustChangePassword,
    isActive: doc.isActive !== false,
  };
}

export async function findAdminByEmail(email: string) {
  const doc = await findAdminDocByEmail(email);
  if (!doc) return null;
  return toSafe(doc);
}

export async function findAdminById(id: string) {
  const doc = await findAdminDocById(id);
  if (!doc) return null;
  return toSafe(doc);
}

export async function loginAdmin(
  identifier: string,
  password: string
): Promise<SafeAdmin | null> {
  try {
    await ensureAdminSeeded();
  } catch (error) {
    console.error('[auth] failed to seed admin', error);
  }

  // Try to find by email first, then by username
  let doc = await findAdminDocByEmail(identifier);
  if (!doc) {
    doc = await findAdminDocByUsername(identifier);
  }
  if (!doc) return null;

  if (doc.isActive === false) return null;

  const matched = verifyPassword(password, doc.passwordHash);
  const tempActive =
    !!doc.tempPasswordHash &&
    !!doc.tempPasswordExpiresAt &&
    doc.tempPasswordExpiresAt > new Date();
  const tempMatched =
    tempActive && !!doc.tempPasswordHash && verifyPassword(password, doc.tempPasswordHash);

  if (!matched && !tempMatched) return null;

  return {
    id: doc.id,
    name: doc.name,
    username: doc.username,
    email: doc.email,
    role: doc.role,
    permissions: doc.permissions || [],
    mustChangePassword: matched ? doc.mustChangePassword : true,
    isActive: true,
  };
}

export async function requestPasswordReset(
  email: string
): Promise<
  | { sent: false; reason: 'not_found' }
  | { sent: false; reason: 'email_failed' }
  | { sent: true; email: string; name: string }
> {
  try {
    await ensureAdminSeeded();
  } catch (error) {
    console.error('[auth] failed to seed admin', error);
  }

  const doc = await findAdminDocByEmail(email);
  if (!doc) return { sent: false, reason: 'not_found' };

  const tempPassword = generateToken(9).slice(0, 12);

  try {
    await sendTempPasswordEmail(doc.email, doc.name, tempPassword);
  } catch (error) {
    console.error('[auth] failed to send temp password email', error);
    return { sent: false, reason: 'email_failed' };
  }

  await setTempPassword(doc.email, tempPassword, TEMP_PASSWORD_TTL_MS);

  return { sent: true, email: doc.email, name: doc.name };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<SafeAdmin | null> {
  const doc = await findAdminDocById(userId);
  if (!doc) return null;

  const passwordOk = verifyPassword(currentPassword, doc.passwordHash);
  const tempOk =
    !!doc.tempPasswordHash &&
    (!doc.tempPasswordExpiresAt || doc.tempPasswordExpiresAt > new Date()) &&
    verifyPassword(currentPassword, doc.tempPasswordHash);

  if (!passwordOk && !tempOk) return null;

  await setAdminPasswordById(doc.id, newPassword, false);

  return {
    id: doc.id,
    name: doc.name,
    username: doc.username,
    email: doc.email,
    role: doc.role,
    permissions: doc.permissions || [],
    mustChangePassword: false,
    isActive: doc.isActive !== false,
  };
}

export async function getAllUsers(): Promise<SafeAdmin[]> {
  return getAllUsersDoc();
}

export async function createNewUser(data: {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  permissions?: string[];
}): Promise<SafeAdmin> {
  return createUserDoc(data);
}

export async function updateExistingUser(
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
  return updateUserDoc(id, data);
}

export async function deleteExistingUser(id: string): Promise<boolean> {
  return deleteUserDoc(id);
}

export async function updateMyProfile(
  id: string,
  data: Partial<{ name: string; username: string }>
): Promise<SafeAdmin | null> {
  return updateUserProfileDoc(id, data);
}
