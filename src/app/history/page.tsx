import React from 'react';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import HistoricalTable from '@/components/charts/HistoricalTable';
import RightSidebar from '@/components/layout/RightSidebar';
import { constructMetadata } from '@/lib/seo';
import { Clock } from 'lucide-react';
import { getYesterdayYYYYMMDD } from '@/lib/utils';

export const metadata: Metadata = constructMetadata({
  title: 'Historical Number Records & Archive Ledger',
  description: 'Search, filter, and analyze multi-year historical numbers, monthly chart tables, and CSV exports for Delhi, Faridabad, Gali, Desawar, and more.',
  path: '/history',
});

export const revalidate = 10;

async function getGames() {
  const todayStr = '2026-09-17';
  const yesterdayStr = getYesterdayYYYYMMDD(todayStr);

  const games = await prisma.game.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
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

  const summary = games.map((game) => {
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

  return { games, summary };
}

export default async function HistoryPage() {
  const { games, summary } = await getGames();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Left Content */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-6 sm:space-y-8">
        {/* Banner */}
        <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 rounded-[9px] shadow-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
                HISTORICAL NUMBER RECORDS &amp; ARCHIVES
              </h1>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                Multi-year ledger search with date filters, game selectors, and CSV export.
              </p>
            </div>
          </div>
        </div>

        {/* Historical Table */}
        <HistoricalTable games={games} />
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-4 xl:col-span-3">
        <div className="lg:sticky lg:top-20">
          <RightSidebar summary={summary} />
        </div>
      </div>
    </div>
  );
}
