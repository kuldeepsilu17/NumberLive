import React from 'react';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getYesterdayYYYYMMDD } from '@/lib/utils';
import TodayResultsGrid from '@/components/home/TodayResultsGrid';
import LatestResultsTable from '@/components/home/LatestResultsTable';
import GameScheduleTable from '@/components/home/GameScheduleTable';
import RightSidebar from '@/components/layout/RightSidebar';

export const metadata: Metadata = {
  title: "Today's Published Results & Timetable Schedule - NumberLive",
  description: "Check today's live published numerical results, scoreboard, and official schedule for Delhi, Faridabad, Ghaziabad, Gali, Desawar, and regional games.",
};

export const revalidate = 10;

export default async function TodayResultsPage() {
  const todayStr = '2026-09-17';
  const yesterdayStr = getYesterdayYYYYMMDD(todayStr);

  let games: any[] = [];
  let summary: any[] = [];

  try {
    games = await prisma.game.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
    });

    const todayResults = await prisma.result.findMany({
      where: { resultDate: todayStr },
    });

    const yesterdayResults = await prisma.result.findMany({
      where: { resultDate: yesterdayStr, status: 'PUBLISHED' },
    });

    const resultMap: Record<string, { today: any; yesterday: any }> = {};
    games.forEach((g) => {
      resultMap[g.id] = { today: null, yesterday: null };
    });

    todayResults.forEach((r) => {
      if (resultMap[r.gameId]) {
        resultMap[r.gameId].today = r;
      }
    });

    yesterdayResults.forEach((r) => {
      if (resultMap[r.gameId]) {
        resultMap[r.gameId].yesterday = r;
      }
    });

    summary = games.map((game) => {
      const t = resultMap[game.id]?.today;
      const y = resultMap[game.id]?.yesterday;
      return {
        game,
        yesterdayResult: y ? y.resultValue : null,
        todayResult: t && t.status === 'PUBLISHED' ? t.resultValue : null,
        status: t ? (t.status as 'PUBLISHED' | 'DRAFT' | 'PENDING') : ('PENDING' as const),
        resultTime: game.resultTime,
        updatedAt: t ? t.updatedAt : null,
      };
    });
  } catch (err) {
    console.warn('Prisma query warning on /today-results:', err);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      <div className="lg:col-span-8 xl:col-span-9 space-y-8">
        {/* Page Title */}
        <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 sm:p-5 shadow-subtle">
          <h1 className="text-xl sm:text-2xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
            Today&apos;s Live Published Results ({todayStr})
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-1">
            Real-time public scoreboard, verified outcomes, and synchronized regional timetables.
          </p>
        </div>

        {/* 1. Today's Results Grid */}
        <TodayResultsGrid
          initialSummary={summary}
          dateStr={todayStr}
          yesterdayDateStr={yesterdayStr}
        />

        {/* 2. Official Timetable */}
        <GameScheduleTable summary={summary} dateStr={todayStr} />

        {/* 3. Detailed Results Table */}
        <LatestResultsTable summary={summary} dateStr={todayStr} />
      </div>

      <div className="lg:col-span-4 xl:col-span-3">
        <div className="lg:sticky lg:top-20">
          <RightSidebar summary={summary} />
        </div>
      </div>
    </div>
  );
}
