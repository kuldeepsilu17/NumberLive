import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionAdmin } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Owner session required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const total = await prisma.contactMessage.count({ where });
    const unreadCount = await prisma.contactMessage.count({ where: { status: 'UNREAD' } });

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      messages,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Owner session required.' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Message ID and status are required' }, { status: 400 });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    await recordAuditLog({
      adminId: session.id,
      adminUsername: session.username,
      action: 'NOTIFICATION_UPDATED',
      reasonNote: `Marked message from ${updated.email} as ${status}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Owner session required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const deleted = await prisma.contactMessage.delete({ where: { id } });

    await recordAuditLog({
      adminId: session.id,
      adminUsername: session.username,
      action: 'NOTIFICATION_UPDATED',
      reasonNote: `Deleted message from ${deleted.email}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({ success: true, message: 'Message deleted' });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
