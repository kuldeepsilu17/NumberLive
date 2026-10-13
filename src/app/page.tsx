import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatDateToYYYYMMDD, getYesterdayYYYYMMDD } from '@/lib/utils';
import SimpleResultsPortal, { GameSummaryItem } from '@/components/home/SimpleResultsPortal';
import { ArrowRight } from 'lucide-react';

export const revalidate = 10;

// Default initial games to display gracefully if DB is spinning up
const DEFAULT_FALLBACK_GAMES = [
  { id: 'g-desawar', name: 'Desawar', slug: 'desawar', resultTime: '05:15 AM', description: 'Desawar Morning Record' },
  { id: 'g-delhibazar', name: 'Delhi Bazar', slug: 'delhi-bazar', resultTime: '03:15 PM', description: 'Delhi Bazar Record' },
  { id: 'g-faridabad', name: 'Faridabad', slug: 'faridabad', resultTime: '06:15 PM', description: 'Faridabad Evening Record' },
  { id: 'g-ghaziabad', name: 'Ghaziabad', slug: 'ghaziabad', resultTime: '08:30 PM', description: 'Ghaziabad Record' },
  { id: 'g-gali', name: 'Gali', slug: 'gali', resultTime: '11:15 PM', description: 'Gali Night Record' },
];

async function getHomePageData() {
  const now = new Date();
  const todayStr = formatDateToYYYYMMDD(now);
  const yesterdayStr = getYesterdayYYYYMMDD(todayStr);

  try {
    const [games, todayResults, yesterdayResults, siteSettings] = await Promise.all([
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
      prisma.siteSetting.findMany(),
    ]);

    const activeGames = games.length > 0 ? games : DEFAULT_FALLBACK_GAMES;

    const settingsMap: Record<string, string> = {};
    siteSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

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
      games: activeGames,
      noticeText: settingsMap['notice_board'] || '',
      lastUpdated: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (err) {
    console.warn('Prisma query warning on homepage, using default structure:', err);
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
      games: DEFAULT_FALLBACK_GAMES,
      noticeText: '',
      lastUpdated: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

export default async function HomePage() {
  const { summary, todayStr, yesterdayStr, games, noticeText, lastUpdated } =
    await getHomePageData();

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Notice Banner if published by owner */}
      {noticeText && (
        <div className="bg-white dark:bg-[#111113] border border-[#E5E5E5] dark:border-[#27272A] p-3 rounded-[6px] text-xs text-[#52525B] dark:text-[#A1A1AA]">
          <span>{noticeText}</span>
        </div>
      )}

      {/* Main Results-First List */}
      <SimpleResultsPortal
        initialSummary={summary}
        todayDateStr={todayStr}
        yesterdayDateStr={yesterdayStr}
        lastUpdatedStr={lastUpdated}
      />

      {/* Record Charts Section */}
      <div className="bg-white dark:bg-[#111113] rounded-[8px] border border-[#E5E5E5] dark:border-[#27272A] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="border-b border-[#E5E5E5] dark:border-[#27272A] pb-3">
          <h2 className="text-base font-bold text-[#20201E] dark:text-[#FAF8F5]">
            Record Charts
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Browse published historical records by game.
          </p>
        </div>

        <div className="divide-y divide-[#E5E5E5] dark:divide-[#27272A]">
          {games.map((game) => (
            <div
              key={game.id}
              className="py-2.5 flex items-center justify-between hover:bg-[#FAF8F5]/60 dark:hover:bg-[#161619] transition-colors"
            >
              <span className="text-sm font-semibold text-[#20201E] dark:text-[#FAF8F5]">
                {game.name}
              </span>
              <Link
                href={`/charts/${game.slug}`}
                className="text-xs font-semibold text-[#71717A] hover:text-[#C5A059] dark:text-[#A1A1AA] dark:hover:text-[#C5A059] inline-flex items-center gap-1 transition-colors"
              >
                <span>View Chart</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
