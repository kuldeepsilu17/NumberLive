import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { constructMetadata, generateStructuredData } from '@/lib/seo';
import { getYesterdayYYYYMMDD } from '@/lib/utils';
import GameHeader from '@/components/games/GameHeader';
import GameFaq from '@/components/games/GameFaq';
import HistoricalTable from '@/components/charts/HistoricalTable';
import RightSidebar from '@/components/layout/RightSidebar';
import Link from 'next/link';
import { ArrowRight, Grid } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
  });

  if (!game) {
    return constructMetadata({ title: 'Game Not Found' });
  }

  return constructMetadata({
    title: `${game.name} Results & Historical Chart`,
    description: `Check live ${game.name} published number results, daily announcement timetable (${game.resultTime}), and complete historical monthly charts. Non-gambling informational archive.`,
    path: `/games/${game.slug}`,
  });
}

export const revalidate = 10;

export default async function GameDetailPage({ params }: Props) {
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
  });

  if (!game) {
    notFound();
  }

  const todayStr = '2026-09-17';
  const yesterdayStr = getYesterdayYYYYMMDD(todayStr);

  const todayResult = await prisma.result.findUnique({
    where: {
      gameId_resultDate: {
        gameId: game.id,
        resultDate: todayStr,
      },
    },
  });

  const yesterdayResult = await prisma.result.findUnique({
    where: {
      gameId_resultDate: {
        gameId: game.id,
        resultDate: yesterdayStr,
      },
    },
  });

  const allGames = await prisma.game.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  const allTodayResults = await prisma.result.findMany({
    where: { resultDate: todayStr },
  });
  const allYesterdayResults = await prisma.result.findMany({
    where: { resultDate: yesterdayStr, status: 'PUBLISHED' },
  });

  const resultMap: Record<string, { today: any; yesterday: any }> = {};
  allGames.forEach((g) => {
    resultMap[g.id] = { today: null, yesterday: null };
  });
  allTodayResults.forEach((r) => {
    if (resultMap[r.gameId]) resultMap[r.gameId].today = r;
  });
  allYesterdayResults.forEach((r) => {
    if (resultMap[r.gameId]) resultMap[r.gameId].yesterday = r;
  });

  const summary = allGames.map((g) => {
    const t = resultMap[g.id]?.today;
    const y = resultMap[g.id]?.yesterday;
    return {
      game: g,
      yesterdayResult: y ? y.resultValue : null,
      todayResult: t && t.status === 'PUBLISHED' ? t.resultValue : null,
      status: t ? (t.status as 'PUBLISHED' | 'DRAFT' | 'PENDING') : ('PENDING' as const),
      resultTime: g.resultTime,
      updatedAt: t ? t.updatedAt : null,
    };
  });

  const relatedGames = allGames.filter((g) => g.slug !== game.slug).slice(0, 3);

  const structuredData = generateStructuredData(
    game.name,
    todayStr,
    todayResult && todayResult.status === 'PUBLISHED' ? todayResult.resultValue : 'Pending'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Left Main Content */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-8 sm:space-y-10">
        {/* Game Header with Hero Card */}
        <GameHeader
          game={game}
          todayResult={
            todayResult && todayResult.status === 'PUBLISHED'
              ? todayResult.resultValue
              : null
          }
          yesterdayResult={
            yesterdayResult && yesterdayResult.status === 'PUBLISHED'
              ? yesterdayResult.resultValue
              : null
          }
          dateStr={todayStr}
        />

        {/* Game Historical Table */}
        <HistoricalTable games={allGames} initialGameSlug={game.slug} />

        {/* Related Regional Games */}
        <section className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden space-y-0">
          <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059] flex items-center gap-1.5">
                <Grid className="w-4 h-4" />
                <span>EXPLORE MORE</span>
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-[#111113] dark:text-[#FAF8F5] uppercase mt-0.5">
                OTHER REGIONAL TIMETABLES
              </h2>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {relatedGames.map((rg) => (
              <Link
                key={rg.id}
                href={`/games/${rg.slug}`}
                className="min-h-[56px] p-3.5 bg-[#FAF8F5] dark:bg-[#18181B] rounded-[8px] border border-[#EAE3D5] dark:border-[#2E2E33] hover:border-[#C5A059] flex items-center justify-between group transition-colors active:scale-[0.99]"
              >
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#111113] dark:text-white group-hover:text-[#C5A059] uppercase">
                    {rg.name}
                  </h4>
                  <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                    Time: {rg.resultTime}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#C5A059] transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* Game FAQ */}
        <GameFaq game={game} />
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
