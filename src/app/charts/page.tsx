import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { constructMetadata } from '@/lib/seo';
import { BarChart3, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Record Charts & Monthly Archives - NumberLive',
  description: 'View historical monthly and annual record charts for all active games on NumberLive.',
  path: '/charts',
});

export const revalidate = 10;

export default async function ChartsPage() {
  let games: any[] = [];
  try {
    games = await prisma.game.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  } catch (err) {
    console.warn('Prisma query warning on /charts:', err);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#27272A] p-4 sm:p-5 rounded-[8px] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#27272A] flex items-center justify-center text-[#C5A059] shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              GAME RECORD CHARTS
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Select any game below to view its complete historical number chart and monthly ledger.
            </p>
          </div>
        </div>
      </div>

      {/* Games List / Cards */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#27272A] rounded-[8px] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#27272A] pb-2 text-xs font-black uppercase text-[#111113] dark:text-[#FAF8F5]">
          <span>AVAILABLE GAME CHARTS ({games.length})</span>
        </div>

        {games.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#71717A] dark:text-[#A1A1AA]">
            No game charts available.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {games.map((g) => (
              <Link
                key={g.id}
                href={`/charts/${g.slug}`}
                className="p-3.5 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#27272A] hover:border-[#C5A059] flex items-center justify-between group transition-colors shadow-2xs"
              >
                <div>
                  <h2 className="text-xs sm:text-sm font-black uppercase text-[#111113] dark:text-[#FAF8F5] group-hover:text-[#C5A059] transition-colors">
                    {g.name}
                  </h2>
                  <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-[#C5A059]" />
                    <span>Time: {g.resultTime}</span>
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#C5A059] group-hover:translate-x-0.5 transition-transform">
                  <span>Chart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
