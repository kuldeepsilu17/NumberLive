import { NextResponse } from 'next/server';
import { getSessionAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Owner session required.' }, { status: 401 });
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Owner me error:', error);
    return NextResponse.json({ error: 'Failed to verify session.' }, { status: 500 });
  }
}
