import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionAdmin } from '@/lib/auth';
import { formatDateToYYYYMMDD } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const todayStr = formatDateToYYYYMMDD();

    const [
      totalGames,
      activeGames,
      totalPublished,
      totalDrafts,
      totalArchived,
      totalResults,
      todayPublishedCount,
      todayDraftCount,
      recentResults,
      recentAudits,
    ] = await Promise.all([
      prisma.game.count(),
      prisma.game.count({ where: { isActive: true } }),
      prisma.result.count({ where: { status: 'PUBLISHED' } }),
      prisma.result.count({ where: { status: 'DRAFT' } }),
      prisma.result.count({ where: { status: 'ARCHIVED' } }),
      prisma.result.count(),
      prisma.result.count({ where: { resultDate: todayStr, status: 'PUBLISHED' } }),
      prisma.result.count({ where: { resultDate: todayStr, status: 'DRAFT' } }),
      prisma.result.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 6,
        include: { game: true },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalGames,
        activeGames,
        totalPublished,
        totalDrafts,
        totalArchived,
        totalResults,
        todayPublished: todayPublishedCount,
        todayDrafts: todayDraftCount,
        todayDate: todayStr,
      },
      recentResults,
      recentAudits,
    });
  } catch (error: any) {
    console.error('Error in admin stats GET:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
