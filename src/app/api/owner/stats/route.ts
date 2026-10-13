import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionAdmin } from '@/lib/auth';
import { formatDateToYYYYMMDD, getYesterdayYYYYMMDD } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Owner session required.' }, { status: 401 });
    }

    const todayStr = formatDateToYYYYMMDD();
    const yesterdayStr = getYesterdayYYYYMMDD(todayStr);

    const [
      totalGames,
      activeGames,
      totalPublished,
      totalDrafts,
      totalArchived,
      totalResults,
      todayPublishedCount,
      todayDraftCount,
      unreadMessagesCount,
      totalUsers,
      recentResults,
      recentAudits,
      allActiveGames,
      todayResults,
      yesterdayResults,
    ] = await Promise.all([
      prisma.game.count(),
      prisma.game.count({ where: { isActive: true } }),
      prisma.result.count({ where: { status: 'PUBLISHED' } }),
      prisma.result.count({ where: { status: 'DRAFT' } }),
      prisma.result.count({ where: { status: 'ARCHIVED' } }),
      prisma.result.count(),
      prisma.result.count({ where: { resultDate: todayStr, status: 'PUBLISHED' } }),
      prisma.result.count({ where: { resultDate: todayStr, status: 'DRAFT' } }),
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      prisma.adminUser.count(),
      prisma.result.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 8,
        include: { game: true },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.game.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { category: true },
      }),
      prisma.result.findMany({
        where: { resultDate: todayStr },
      }),
      prisma.result.findMany({
        where: { resultDate: yesterdayStr, status: 'PUBLISHED' },
      }),
    ]);

    // Build today status summary for each active game
    const todayMap: Record<string, any> = {};
    const yesterdayMap: Record<string, any> = {};

    todayResults.forEach((r) => {
      todayMap[r.gameId] = r;
    });

    yesterdayResults.forEach((r) => {
      yesterdayMap[r.gameId] = r;
    });

    const gamesSummary = allActiveGames.map((game) => {
      const todayEntry = todayMap[game.id];
      const yesterdayEntry = yesterdayMap[game.id];

      return {
        id: game.id,
        name: game.name,
        slug: game.slug,
        category: game.category?.name || 'General',
        resultTime: game.resultTime,
        yesterdayResult: yesterdayEntry ? yesterdayEntry.resultValue : null,
        todayResult: todayEntry ? todayEntry.resultValue : null,
        status: todayEntry ? todayEntry.status : 'PENDING',
        todayResultId: todayEntry ? todayEntry.id : null,
        updatedAt: todayEntry ? todayEntry.updatedAt : null,
      };
    });

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
        unreadMessages: unreadMessagesCount,
        totalUsers,
        todayDate: todayStr,
      },
      gamesSummary,
      recentResults,
      recentAudits,
    });
  } catch (error: any) {
    console.error('Owner stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch owner stats.' }, { status: 500 });
  }
}
