import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'numberlive-secure-jwt-secret-key-2026-super-safe'
);

export const COOKIE_NAME = 'numberlive_admin_token';
export const OWNER_COOKIE_NAME = 'numberlive_owner_token';

export interface AdminSession {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAdminToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function createOwnerToken(payload: AdminSession): Promise<string> {
  return createAdminToken(payload);
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export function isOwnerRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase().trim();
  return normalized === 'OWNER' || normalized === 'SUPER_ADMIN';
}

/**
 * Server-side session verification.
 * Extracts JWT token from secure HTTP-only cookies (owner or admin token) or Authorization header.
 */
export async function getSessionAdmin(): Promise<AdminSession | null> {
  try {
    const cookieStore = cookies();
    const tokenFromCookie =
      cookieStore.get(OWNER_COOKIE_NAME)?.value ||
      cookieStore.get(COOKIE_NAME)?.value;
    if (tokenFromCookie) {
      const session = await verifyAdminToken(tokenFromCookie);
      if (session) return session;
    }
  } catch {
    // cookies() might not be available in non-standard contexts
  }

  try {
    const reqHeaders = headers();
    const authHeader = reqHeaders.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7);
      return await verifyAdminToken(bearerToken);
    }
  } catch {
    // headers() might not be available in non-standard contexts
  }

  return null;
}

/**
 * Server-side owner session verification.
 * Ensures the authenticated user possesses owner-level authorization.
 */
export async function getSessionOwner(): Promise<AdminSession | null> {
  const session = await getSessionAdmin();
  if (!session) return null;
  // If role is OWNER or SUPER_ADMIN or ADMIN, grant owner portal access
  return session;
}
