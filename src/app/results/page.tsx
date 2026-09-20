import React from 'react';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getYesterdayYYYYMMDD } from '@/lib/utils';
import { constructMetadata } from '@/lib/seo';
import TodayResultsGrid from '@/components/home/TodayResultsGrid';
import LatestResultsTable from '@/components/home/LatestResultsTable';
import RightSidebar from '@/components/layout/RightSidebar';
import { Clock, Radio } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: "Today's Published Results & Timetable",
  description: "Live verified number results for Delhi, Faridabad, Ghaziabad, Gali, Desawar, Noida, Aligarh, Haridwar, Meerut and Delhi Night.",
  path: '/results',
});

export const revalidate = 10;

async function getResultsData() {
  const todayStr = '2026-09-17';
  const yesterdayStr = getYesterdayYYYYMMDD(todayStr);

  try {
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

    return { summary, todayStr, yesterdayStr, games };
  } catch (err) {
    console.warn('Prisma query warning on /results:', err);
    return { summary: [], todayStr, yesterdayStr, games: [] };
  }
}

export default async function ResultsPage() {
  const { summary, todayStr, yesterdayStr, games } = await getResultsData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Left Main Content */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-8 sm:space-y-10">
        {/* Banner */}
        <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 rounded-[9px] shadow-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
              <Radio className="w-5 h-5 text-[#16A34A] animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
                TODAY&apos;S PUBLISHED RESULTS &amp; TIMETABLE
              </h1>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                Live verified scoreboard with daytime, evening, and morning updates.
              </p>
            </div>
          </div>
        </div>

        {/* Scoreboard */}
        <TodayResultsGrid
          initialSummary={summary}
          dateStr={todayStr}
          yesterdayDateStr={yesterdayStr}
        />

        {/* Latest Results Table / Mobile Cards */}
        <LatestResultsTable summary={summary} dateStr={todayStr} />

        {/* Daily Release Timetable Grid */}
        <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden space-y-0">
          <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059] flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>OFFICIAL TIMINGS</span>
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-[#111113] dark:text-[#FAF8F5] uppercase mt-0.5">
                DAILY TIMETABLE SCHEDULE
              </h2>
            </div>
            <span className="text-xs bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] px-3 py-1 rounded-[6px] text-[#111113] dark:text-[#FAF8F5] font-bold">
              {games.length} GAMES
            </span>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {games.map((g) => (
                <div
                  key={g.id}
                  className="p-3 bg-[#FAF8F5] dark:bg-[#18181B] rounded-[8px] border border-[#EAE3D5] dark:border-[#2E2E33] text-center"
                >
                  <h3 className="font-extrabold text-[#111113] dark:text-[#FAF8F5] text-xs uppercase truncate">
                    {g.name}
                  </h3>
                  <span className="inline-block mt-1.5 text-xs font-bold text-[#C5A059] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] px-2.5 py-1 rounded-[4px]">
                    {g.resultTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
