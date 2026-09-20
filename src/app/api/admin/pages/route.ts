import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionAdmin } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      const page = await prisma.pageContent.findUnique({ where: { key } });
      return NextResponse.json({ success: true, page });
    }

    const pages = await prisma.pageContent.findMany({
      orderBy: { key: 'asc' },
    });

    return NextResponse.json({ success: true, pages });
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { key, title, contentJson } = body;

    if (!key || !title) {
      return NextResponse.json({ error: 'Page key and title are required' }, { status: 400 });
    }

    const page = await prisma.pageContent.upsert({
      where: { key },
      update: {
        title,
        contentJson: typeof contentJson === 'string' ? contentJson : JSON.stringify(contentJson),
      },
      create: {
        key,
        title,
        contentJson: typeof contentJson === 'string' ? contentJson : JSON.stringify(contentJson),
      },
    });

    await recordAuditLog({
      adminId: admin.id,
      adminUsername: admin.username,
      action: 'UPDATE_SETTING',
      reasonNote: `Updated page content for ${page.title} (${page.key})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error('Error updating page content:', error);
    return NextResponse.json({ error: 'Failed to update page content' }, { status: 500 });
  }
}
