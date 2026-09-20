import React from 'react';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import YearlyMatrix from '@/components/charts/YearlyMatrix';
import RightSidebar from '@/components/layout/RightSidebar';

export const metadata: Metadata = {
  title: 'Yearly Number Chart Archive (12-Month Grid) - NumberLive',
  description: 'Interactive 12-month annual chart inspector across all days and regional games. Select game and year to view complete records.',
};

export const revalidate = 10;

interface PageProps {
  searchParams: {
    game?: string;
    year?: string;
  };
}

export default async function YearlyChartPage({ searchParams }: PageProps) {
  const initialGameSlug = searchParams.game || 'delhi';
  const initialYear = searchParams.year ? parseInt(searchParams.year) : 2026;

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
        <YearlyMatrix
          initialGameSlug={initialGameSlug}
          initialYear={initialYear}
          gamesList={games}
        />
      </div>

      <div className="lg:col-span-4 xl:col-span-3">
        <div className="lg:sticky lg:top-20">
          <RightSidebar summary={summary} />
        </div>
      </div>
    </div>
  );
}
