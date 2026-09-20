import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import MonthlyMatrix from '@/components/charts/MonthlyMatrix';
import { constructMetadata } from '@/lib/seo';
import { BarChart3, ShieldCheck, Calendar, ArrowRight, ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Monthly Charts & Results Matrix Archive - NumberLive',
  description: 'Explore comprehensive interactive monthly charts, day-by-day matrices, number highlighting, and instant CSV downloads.',
  path: '/charts',
});

export const revalidate = 10;

export default async function ChartsPage() {
  let games: any[] = [];
  try {
    games = await prisma.game.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
    });
  } catch (err) {
    console.warn('Prisma query warning on /charts:', err);
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 rounded-[9px] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              RESULT CHART MATRIX &amp; RECORD ARCHIVE
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Interactive day-by-day number chart with CSV downloads, single-game views, and annual matrices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/yearly-chart"
            className="h-9 px-3 min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 text-xs font-bold text-[#FAF8F5] bg-[#18181B] border border-[#2E2E33] hover:border-[#C5A059] rounded-[6px] transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>12-Month Yearly Matrix</span>
          </Link>
        </div>
      </div>

      {/* Game Quick Chart Shortcuts */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 shadow-subtle space-y-3">
        <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2 text-xs font-bold text-[#111113] dark:text-[#FAF8F5]">
          <span>Dedicated Game Record Charts</span>
          <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] font-normal">
            Click any game to open its full statistical chart
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {games.map((g) => (
            <Link
              key={g.id}
              href={`/charts/${g.slug}`}
              className="min-h-[44px] p-2.5 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] hover:border-[#C5A059] flex items-center justify-between text-xs font-bold text-[#111113] dark:text-[#FAF8F5] transition-colors group"
            >
              <span className="truncate">{g.name}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#71717A] group-hover:text-[#C5A059] shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Main Monthly Matrix */}
      <MonthlyMatrix initialYear={2026} initialMonth={9} />
    </div>
  );
}
