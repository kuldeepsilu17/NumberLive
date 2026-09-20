'use client';

import React from 'react';
import Link from 'next/link';
import { Grid, ArrowRight, Clock } from 'lucide-react';
import { Game } from '@prisma/client';
import { TodayGameResult } from '@/types';

interface AllGamesBoxesProps {
  games: Game[];
  summary: TodayGameResult[];
}

export default function AllGamesBoxes({ games, summary }: AllGamesBoxesProps) {
  return (
    <section className="space-y-3.5 sm:space-y-4">
      {/* Clean Premium Section Title */}
      <div className="section-header-clean bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 rounded-[9px] flex items-center justify-between shadow-subtle">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059] flex items-center gap-1.5">
            <Grid className="w-4 h-4 text-[#C5A059]" />
            <span>REGIONAL COVERAGE</span>
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-[#111113] dark:text-[#FAF8F5] uppercase mt-0.5">
            ALL GAMES DIRECTORY
          </h2>
        </div>
        <Link
          href="/games"
          className="min-h-[44px] px-3 py-2 text-xs sm:text-sm text-[#111113] dark:text-[#FAF8F5] hover:text-[#C5A059] font-bold inline-flex items-center gap-1 rounded-[6px] hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] transition-colors"
        >
          <span>View All ({games.length})</span>
          <ArrowRight className="w-4 h-4 text-[#C5A059]" />
        </Link>
      </div>

      {/* Grid of game cards: 1 column on Mobile (<640px), 2 columns on Tablet (sm), 3 on md, 4-5 on lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {games.map((game) => {
          const item = summary.find((s) => s.game.id === game.id);
          const isPublished = item?.status === 'PUBLISHED';

          return (
            <Link
              key={game.id}
              href={`/games/${game.slug}`}
              className="min-h-[64px] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] hover:border-[#C5A059] hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] p-3.5 rounded-[9px] shadow-subtle transition-all flex flex-col justify-between group active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-extrabold text-sm text-[#111113] dark:text-[#FAF8F5] group-hover:text-[#C5A059] transition-colors block uppercase truncate">
                    {game.name}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#C5A059] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-1.5 mt-1">
                  <Clock className="w-3 h-3 text-[#8C8275]" /> Scheduled: {game.resultTime}
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-between">
                <span className="text-xs text-[#71717A] dark:text-[#A1A1AA] font-bold">
                  Latest:
                </span>
                <span
                  className={`font-black text-base ${
                    isPublished ? 'text-[#111113] dark:text-[#FAF8F5]' : 'text-[#A1A1AA]'
                  }`}
                >
                  {isPublished ? item?.todayResult : '—'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
