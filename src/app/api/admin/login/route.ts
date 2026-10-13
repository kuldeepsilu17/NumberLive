import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createAdminToken, COOKIE_NAME } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    // 1. Check Rate Limit (max 5 attempts per 15 min per IP)
    const rateLimit = checkRateLimit(`login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
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
        { error: 'Email/username and password are required.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = String(identifier).toLowerCase().trim();

    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { username: cleanIdentifier },
        ],
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials. Access denied.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials. Access denied.' },
        { status: 401 }
      );
    }

    // Reset rate limiter upon successful login
    resetRateLimit(`login:${ip}`);

    const token = await createAdminToken({
      id: admin.id,
      email: admin.email,
      username: admin.username,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    await recordAuditLog({
      adminId: admin.id,
      adminUsername: admin.username,
      action: 'UPDATE_SETTING',
      reasonNote: 'Admin logged into secure control dashboard',
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}
