import { generateToken } from '@/lib/auth/auth';

export interface SafeAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
}

const DEMO_ADMIN: SafeAdmin & { password: string } = {
  id: 'demo-admin-001',
  name: 'Resort Manager',
  email: (process.env.ADMIN_EMAIL || 'admin@nagasresort.com').toLowerCase(),
  password: process.env.ADMIN_PASSWORD || 'nagas123',
  role: 'admin',
};

function toSafeUser(user: SafeAdmin) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function findAdminByEmail(email: string) {
  const normalized = email.toLowerCase().trim();
  if (normalized === DEMO_ADMIN.email) return DEMO_ADMIN;
  return null;
}

export async function findAdminById(id: string) {
  if (id === DEMO_ADMIN.id) return DEMO_ADMIN;
  return null;
}

export async function loginAdmin(email: string, password: string) {
  const user = await findAdminByEmail(email);
  if (!user || user.password !== password) return null;
  return toSafeUser(user);
}

export async function requestPasswordReset(
  email: string
): Promise<{ sent: false } | { sent: true; token: string; email: string; name: string }> {
  const user = await findAdminByEmail(email);
  if (!user) return { sent: false };

  const token = generateToken(48);
  return { sent: true, token, email: user.email, name: user.name };
}

export async function resetPassword(token: string, _newPassword: string) {
  if (!token) return null;
  return toSafeUser(DEMO_ADMIN);
}
