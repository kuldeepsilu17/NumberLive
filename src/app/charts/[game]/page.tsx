import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import SingleGameChart from '@/components/charts/SingleGameChart';
import RightSidebar from '@/components/layout/RightSidebar';

interface PageProps {
  params: {
    game: string;
  };
  searchParams: {
    year?: string;
    month?: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const game = await prisma.game.findUnique({
    where: { slug: params.game },
  });

  if (!game) {
    return { title: 'Game Record Chart Not Found | NumberLive' };
  }

  return {
    title: `${game.name} Monthly & Yearly Record Chart Archive - NumberLive`,
    description: `Official historical record chart and monthly number archive for ${game.name}. Daily announcement time: ${game.resultTime}.`,
  };
}

export const revalidate = 10;

export default async function GameChartPage({ params, searchParams }: PageProps) {
  const game = await prisma.game.findUnique({
    where: { slug: params.game },
    include: { category: true },
  });

  if (!game) {
    notFound();
  }

  const initialYear = searchParams.year ? parseInt(searchParams.year) : 2026;
  const initialMonth = searchParams.month ? parseInt(searchParams.month) : 9;

  // Fetch summary for right sidebar
  const todayStr = '2026-09-17';
  const games = await prisma.game.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
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
        <SingleGameChart
          game={game}
          initialYear={initialYear}
          initialMonth={initialMonth}
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
