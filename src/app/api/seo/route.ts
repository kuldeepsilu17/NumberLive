import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionAdmin } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const settings = await prisma.sEOSetting.findMany();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch SEO settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pagePath, metaTitle, metaDescription, canonicalUrl, ogTitle, ogDescription, robots } =
      await req.json();

    if (!pagePath || !metaTitle) {
      return NextResponse.json({ error: 'Page path and meta title are required' }, { status: 400 });
    }

    const updated = await prisma.sEOSetting.upsert({
      where: { pagePath },
      create: {
        pagePath,
        metaTitle,
        metaDescription: metaDescription || '',
        canonicalUrl,
        ogTitle,
        ogDescription,
        robots: robots || 'index, follow',
      },
      update: {
        metaTitle,
        metaDescription: metaDescription || '',
        canonicalUrl,
        ogTitle,
        ogDescription,
        robots: robots || 'index, follow',
      },
    });

    await recordAuditLog({
      adminId: admin.id,
      adminUsername: admin.username,
      action: 'UPDATE_SEO',
      reasonNote: `Updated SEO meta for route ${pagePath}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update SEO setting' }, { status: 500 });
  }
}
