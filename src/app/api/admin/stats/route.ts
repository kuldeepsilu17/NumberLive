import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionAdmin } from '@/lib/auth';
import { formatDateToYYYYMMDD } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayStr = '2026-09-17'; // or formatDateToYYYYMMDD()

    const [
      totalGames,
      activeGames,
      totalCategories,
      todayPublishedCount,
      todayDraftCount,
      totalResultsCount,
      unreadMessagesCount,
      recentAudits,
    ] = await Promise.all([
      prisma.game.count(),
      prisma.game.count({ where: { isActive: true } }),
      prisma.category.count(),
      prisma.result.count({ where: { resultDate: todayStr, status: 'PUBLISHED' } }),
      prisma.result.count({ where: { resultDate: todayStr, status: 'DRAFT' } }),
      prisma.result.count(),
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalGames,
        activeGames,
        totalCategories,
        todayResults: todayPublishedCount + todayDraftCount,
        todayPublished: todayPublishedCount,
        todayDrafts: todayDraftCount,
        totalResults: totalResultsCount,
        unreadMessages: unreadMessagesCount,
        todayDate: todayStr,
      },
      recentAudits,
    });
  } catch (error: any) {
    console.error('Error in admin stats GET:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
