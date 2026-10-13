import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createOwnerToken, OWNER_COOKIE_NAME, COOKIE_NAME } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    // 1. Rate Limit Enforcement (5 attempts / 15 mins per IP)
    const rateLimit = checkRateLimit(`owner-login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Access temporarily restricted for security. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await req.json();
    const identifier = body.identifier || body.username || body.email;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Please enter your username/email and password.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = String(identifier).toLowerCase().trim();

    // Query database for owner/admin account
    const user = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { username: cleanIdentifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. Access denied.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials. Access denied.' },
        { status: 401 }
      );
    }

    // Reset rate limiter on successful authentication
    resetRateLimit(`owner-login:${ip}`);

    const tokenPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    const token = await createOwnerToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      user: tokenPayload,
    });

    // Set secure HTTP-only cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days session
    };

    response.cookies.set(OWNER_COOKIE_NAME, token, cookieOptions);
    response.cookies.set(COOKIE_NAME, token, cookieOptions);

    // Audit log
    await recordAuditLog({
      adminId: user.id,
      adminUsername: user.username,
      action: 'OWNER_LOGIN',
      reasonNote: `Owner logged in from IP ${ip}`,
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    return response;
  } catch (error: any) {
    console.error('Owner login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during authentication.' },
      { status: 500 }
    );
  }
}
