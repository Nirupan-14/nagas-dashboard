import { verifySessionToken } from '@/lib/auth/auth';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getSessionUser(
  cookieValue: string | undefined
): Promise<SafeUser | null> {
  if (!cookieValue) return null;
  const payload = verifySessionToken(cookieValue);
  if (!payload) return null;
  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: 'admin',
  };
}
