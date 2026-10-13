import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'numberlive-secure-jwt-secret-key-2026-super-safe'
);

const OWNER_COOKIE_NAME = 'numberlive_owner_token';
const ADMIN_COOKIE_NAME = 'numberlive_admin_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Protect all /owner routes (except /owner/login)
  if (pathname.startsWith('/owner') && pathname !== '/owner/login') {
    const token =
      request.cookies.get(OWNER_COOKIE_NAME)?.value ||
      request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      const loginUrl = new URL('/owner/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL('/owner/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(OWNER_COOKIE_NAME);
      res.cookies.delete(ADMIN_COOKIE_NAME);
      return res;
    }
  }

  // 2. Protect all /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token =
      request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
      request.cookies.get(OWNER_COOKIE_NAME)?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(ADMIN_COOKIE_NAME);
      res.cookies.delete(OWNER_COOKIE_NAME);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/owner/:path*', '/admin/:path*'],
};
