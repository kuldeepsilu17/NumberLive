import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { constructMetadata } from '@/lib/seo';
import RightSidebar from '@/components/layout/RightSidebar';
import { Clock, ArrowRight, Grid, Calendar, BarChart3, ArrowUpRight } from 'lucide-react';
import { getYesterdayYYYYMMDD } from '@/lib/utils';

export const metadata: Metadata = constructMetadata({
  title: 'All Games Directory & Regional Timetables',
  description: 'Complete directory of all monitored regional games, daily announcement timings, categories, and direct record chart links.',
  path: '/games',
});

export const revalidate = 60;

interface PageProps {
  searchParams: {
    category?: string;
  };
}

async function getGamesData(categorySlug?: string) {
  const todayStr = '2026-09-17';
  const yesterdayStr = getYesterdayYYYYMMDD(todayStr);

  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const where: any = { isActive: true };
    if (categorySlug && categorySlug !== 'all') {
      where.category = { slug: categorySlug };
    }

    const games = await prisma.game.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        category: true,
        results: {
          where: { status: 'PUBLISHED' },
          orderBy: { resultDate: 'desc' },
          take: 1,
        },
      },
    });

    const allGames = await prisma.game.findMany({
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
    allGames.forEach((g) => {
      resultMap[g.id] = { today: null, yesterday: null };
    });

    todayResults.forEach((r) => {
      if (resultMap[r.gameId]) resultMap[r.gameId].today = r;
    });

    yesterdayResults.forEach((r) => {
      if (resultMap[r.gameId]) resultMap[r.gameId].yesterday = r;
    });

    const summary = allGames.map((game) => {
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

    return { games, categories, summary, activeCategory: categorySlug || 'all' };
  } catch (err) {
    console.warn('Prisma query warning on /games:', err);
    return { games: [], categories: [], summary: [], activeCategory: categorySlug || 'all' };
  }
}

export default async function GamesPage({ searchParams }: PageProps) {
  const { games, categories, summary, activeCategory } = await getGamesData(searchParams.category);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Left Content */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-6 sm:space-y-8">
        {/* Banner */}
        <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 rounded-[9px] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
                ALL GAMES DIRECTORY &amp; SCHEDULES
              </h1>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                Verified regional games directory, official release times, and dedicated charts.
              </p>
            </div>
          </div>

          <Link
            href="/yearly-chart"
            className="h-9 px-3 min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 text-xs font-bold text-[#FAF8F5] bg-[#18181B] border border-[#2E2E33] hover:border-[#C5A059] rounded-[6px] transition-colors self-start sm:self-auto"
          >
            <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Yearly 12-Month Matrix</span>
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link
            href="/games"
            className={`min-h-[44px] px-4 py-2 rounded-[6px] text-xs font-bold whitespace-nowrap transition-colors flex items-center ${
              activeCategory === 'all'
                ? 'bg-[#C5A059] text-[#111113]'
                : 'bg-white dark:bg-[#111113] text-[#71717A] dark:text-[#A1A1AA] border border-[#EAE3D5] dark:border-[#2E2E33] hover:border-[#C5A059]'
            }`}
          >
            All Games ({games.length})
          </Link>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/games?category=${cat.slug}`}
                className={`min-h-[44px] px-4 py-2 rounded-[6px] text-xs font-bold whitespace-nowrap transition-colors flex items-center ${
                  isActive
                    ? 'bg-[#C5A059] text-[#111113]'
                    : 'bg-white dark:bg-[#111113] text-[#71717A] dark:text-[#A1A1AA] border border-[#EAE3D5] dark:border-[#2E2E33] hover:border-[#C5A059]'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Games Grid: 1 Column on Mobile (<640px), 2 Columns on Tablet, 3 Columns on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((g) => {
            const latest = g.results[0];
            return (
              <div
                key={g.id}
                className="result-card p-4 min-h-[64px] flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2 border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2">
                    <div>
                      <Link
                        href={`/games/${g.slug}`}
                        className="text-sm sm:text-base font-black text-[#111113] dark:text-[#FAF8F5] group-hover:text-[#C5A059] transition-colors uppercase tracking-tight"
                      >
                        {g.name}
                      </Link>
                      <div className="text-[10px] text-[#71717A] font-semibold">
                        {g.category?.name || 'Main Games'}
                      </div>
                    </div>
                    <span className="font-black text-sm text-[#111113] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B] px-2.5 py-1 rounded-[4px] border border-[#EAE3D5] dark:border-[#2E2E33]">
                      {latest ? latest.resultValue : '--'}
                    </span>
                  </div>

                  <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] line-clamp-2 mb-3 leading-relaxed">
                    {g.description || `Official daily public number result and multi-year chart archive for ${g.name}.`}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-[#5C5449] dark:text-[#A1A1AA] bg-[#FAF8F5] dark:bg-[#18181B] p-2.5 rounded-[6px] border border-[#EAE3D5] dark:border-[#2E2E33] mb-3">
                    <Clock className="w-3.5 h-3.5 text-[#8C8275]" />
                    <span>Daily Schedule: <strong className="text-[#111113] dark:text-[#FAF8F5] font-mono">{g.resultTime}</strong></span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-between text-xs gap-2">
                  <Link
                    href={`/charts/${g.slug}`}
                    className="min-h-[44px] text-[#71717A] hover:text-[#C5A059] font-bold flex items-center gap-1"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Record Chart</span>
                  </Link>

                  <Link
                    href={`/games/${g.slug}`}
                    className="min-h-[44px] text-[#C5A059] font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
                  >
                    <span>View Result</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
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
