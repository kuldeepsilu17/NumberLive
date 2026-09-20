import React from 'react';
import Link from 'next/link';
import { Clock, ChevronRight, Calendar, Table, ArrowUpRight, BarChart3 } from 'lucide-react';
import { Game } from '@/types';

interface GameHeaderProps {
  game: Game;
  todayResult?: string | null;
  yesterdayResult?: string | null;
  dateStr: string;
}

export default function GameHeader({
  game,
  todayResult,
  yesterdayResult,
  dateStr,
}: GameHeaderProps) {
  const isPublished = Boolean(todayResult);

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-[#71717A] font-bold uppercase flex-wrap">
        <Link href="/" className="min-h-[36px] flex items-center hover:text-[#C5A059] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#A1A1AA]" />
        <Link href="/games" className="min-h-[36px] flex items-center hover:text-[#C5A059] transition-colors">
          Games
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#A1A1AA]" />
        <span className="text-[#111113] dark:text-[#FAF8F5] font-black">
          {game.name}
        </span>
      </nav>

      {/* Hero Result Card */}
      <div className="result-card p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111113]">
        <div className="space-y-2.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#111113] dark:bg-[#18181B] border border-[#2E2E33] px-3 py-1 rounded-[6px] uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
              Schedule: {game.resultTime}
            </span>
          </div>

          <h1 className="text-lg sm:text-2xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
            {game.name} RESULT &amp; RECORD CHART
          </h1>

          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            {game.description || `Official daily public number records, monthly charts matrix, and announcement schedule for ${game.name}.`}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
            <Link
              href={`/charts/${game.slug}`}
              className="btn-primary w-full sm:w-auto text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2"
              id="view-full-chart-btn"
            >
              <BarChart3 className="w-4 h-4 text-[#C5A059]" />
              <span>View Full Chart</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A059]" />
            </Link>
            <Link
              href={`/yearly-chart?game=${game.slug}`}
              className="btn-secondary w-full sm:w-auto text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#C5A059]" />
              <span>Yearly 12-Month Matrix</span>
            </Link>
            <Link
              href={`/history?game=${game.slug}`}
              className="btn-secondary w-full sm:w-auto text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2"
            >
              <Table className="w-4 h-4" />
              <span>History</span>
            </Link>
          </div>
        </div>

        {/* Today's Result Scoreboard Box */}
        <div className="bg-[#FAF8F5] dark:bg-[#18181B] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 min-w-[220px] text-center space-y-1.5 shadow-subtle self-stretch md:self-auto">
          <div className="flex items-center justify-between text-xs text-[#71717A] dark:text-[#A1A1AA] mb-1">
            <span className="font-bold">Yesterday: <strong className="text-[#111113] dark:text-[#FAF8F5]">{yesterdayResult || '--'}</strong></span>
            <span className={`font-black ${isPublished ? 'text-[#16A34A]' : 'text-[#71717A]'}`}>
              {isPublished ? '● Live' : '○ Wait'}
            </span>
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8275] dark:text-[#71717A] block">
            Today&apos;s Declared Number
          </span>

          <div className="py-1">
            <span className="text-4xl sm:text-5xl font-black text-[#111113] dark:text-[#FAF8F5] block tracking-tight">
              {todayResult || '— —'}
            </span>
            {isPublished && <div className="result-number-accent" />}
          </div>

          <span className="text-xs text-[#71717A] dark:text-[#A1A1AA] font-semibold block">
            {isPublished ? `Declared at ${game.resultTime}` : `Scheduled for ${game.resultTime}`}
          </span>
        </div>
      </div>
    </div>
  );
}
