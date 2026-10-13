import React from 'react';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { formatDateToYYYYMMDD, getYesterdayYYYYMMDD } from '@/lib/utils';
import { constructMetadata } from '@/lib/seo';
import SimpleResultsPortal, { GameSummaryItem } from '@/components/home/SimpleResultsPortal';

export const metadata: Metadata = constructMetadata({
  title: "Today's Published Results & Timetable",
  description: 'Official verified number results and daily release timetable published by NumberLive.',
  path: '/results',
});

export const revalidate = 10;

const DEFAULT_FALLBACK_GAMES = [
  { id: 'g-desawar', name: 'Desawar', slug: 'desawar', resultTime: '05:15 AM', description: 'Desawar Morning Record' },
  { id: 'g-delhibazar', name: 'Delhi Bazar', slug: 'delhi-bazar', resultTime: '03:15 PM', description: 'Delhi Bazar Record' },
  { id: 'g-faridabad', name: 'Faridabad', slug: 'faridabad', resultTime: '06:15 PM', description: 'Faridabad Evening Record' },
  { id: 'g-ghaziabad', name: 'Ghaziabad', slug: 'ghaziabad', resultTime: '08:30 PM', description: 'Ghaziabad Record' },
  { id: 'g-gali', name: 'Gali', slug: 'gali', resultTime: '11:15 PM', description: 'Gali Night Record' },
];

async function getResultsData() {
  const now = new Date();
  const todayStr = formatDateToYYYYMMDD(now);
  const yesterdayStr = getYesterdayYYYYMMDD(todayStr);

  try {
    const [games, todayResults, yesterdayResults] = await Promise.all([
      prisma.game.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.result.findMany({
        where: { resultDate: todayStr, status: 'PUBLISHED' },
      }),
      prisma.result.findMany({
        where: { resultDate: yesterdayStr, status: 'PUBLISHED' },
      }),
    ]);

    const activeGames = games.length > 0 ? games : DEFAULT_FALLBACK_GAMES;

    const resultMap: Record<string, { today: any; yesterday: any }> = {};
    activeGames.forEach((g) => {
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

    const summary: GameSummaryItem[] = activeGames.map((game) => {
      const t = resultMap[game.id]?.today;
      const y = resultMap[game.id]?.yesterday;
      return {
        game: {
          id: game.id,
          name: game.name,
          slug: game.slug,
          resultTime: game.resultTime,
          description: game.description || '',
        },
        yesterdayResult: y ? y.resultValue : null,
        todayResult: t ? t.resultValue : null,
        status: t ? 'PUBLISHED' : 'PENDING',
        resultTime: game.resultTime,
        updatedAt: t ? t.updatedAt : null,
      };
    });

    return {
      summary,
      todayStr,
      yesterdayStr,
      lastUpdated: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (err) {
    console.warn('Prisma query warning on /results, using default structure:', err);
    const summary: GameSummaryItem[] = DEFAULT_FALLBACK_GAMES.map((game) => ({
      game,
      yesterdayResult: null,
      todayResult: null,
      status: 'PENDING',
      resultTime: game.resultTime,
      updatedAt: null,
    }));

    return {
      summary,
      todayStr,
      yesterdayStr,
      lastUpdated: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

export default async function ResultsPage() {
  const { summary, todayStr, yesterdayStr, lastUpdated } = await getResultsData();

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <SimpleResultsPortal
        initialSummary={summary}
        todayDateStr={todayStr}
        yesterdayDateStr={yesterdayStr}
        lastUpdatedStr={lastUpdated}
      />
    </div>
  );
}
