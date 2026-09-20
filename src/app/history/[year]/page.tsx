import React from 'react';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import HistoricalTable from '@/components/charts/HistoricalTable';
import RightSidebar from '@/components/layout/RightSidebar';

interface PageProps {
  params: {
    year: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `${params.year} Historical Published Results Archive - NumberLive`,
    description: `Complete searchable historical numerical results and archives for the year ${params.year}. Filter by game, date, and export datasets.`,
  };
}

export const revalidate = 10;

export default async function YearHistoryPage({ params }: PageProps) {
  const targetYear = parseInt(params.year) || 2026;

  const games = await prisma.game.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  const todayStr = '2026-09-17';
  const todayResults = await prisma.result.findMany({
    where: { resultDate: todayStr },
  });
  const resultMap: Record<string, any> = {};
  todayResults.forEach((r) => {
    resultMap[r.gameId] = r;
  });

  const summary = games.map((g) => ({
    game: g,
    todayResult: resultMap[g.id]?.status === 'PUBLISHED' ? resultMap[g.id].resultValue : null,
    yesterdayResult: null,
    status: resultMap[g.id] ? (resultMap[g.id].status as 'PUBLISHED' | 'DRAFT' | 'PENDING') : ('PENDING' as const),
    resultTime: g.resultTime,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      <div className="lg:col-span-8 xl:col-span-9 space-y-6">
        <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 sm:p-5 shadow-subtle">
          <h1 className="text-xl sm:text-2xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
            Year {targetYear} Historical Results Archive
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-1">
            Browse and filter all published historical number records registered during {targetYear}.
          </p>
        </div>

        <HistoricalTable initialYear={targetYear} games={games} />
      </div>

      <div className="lg:col-span-4 xl:col-span-3">
        <div className="lg:sticky lg:top-20">
          <RightSidebar summary={summary} />
        </div>
      </div>
    </div>
  );
}
