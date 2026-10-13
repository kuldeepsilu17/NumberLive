'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, RefreshCw, Search } from 'lucide-react';
import { calculateGameStatus, formatReadableDate } from '@/lib/utils';

export interface GameSummaryItem {
  game: {
    id: string;
    name: string;
    slug: string;
    resultTime: string;
    description?: string;
  };
  yesterdayResult: string | null;
  todayResult: string | null;
  status: 'PUBLISHED' | 'DRAFT' | 'PENDING';
  resultTime: string;
  updatedAt?: string | Date | null;
}

interface SimpleResultsPortalProps {
  initialSummary: GameSummaryItem[];
  todayDateStr: string;
  yesterdayDateStr: string;
  lastUpdatedStr?: string;
}

export default function SimpleResultsPortal({
  initialSummary,
  todayDateStr,
  yesterdayDateStr,
  lastUpdatedStr,
}: SimpleResultsPortalProps) {
  const [activeDateTab, setActiveDateTab] = useState<'today' | 'yesterday'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<GameSummaryItem[]>(initialSummary);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/results?view=today_summary&date=${todayDateStr}`);
      const json = await res.json();
      if (json.success && json.summary) {
        setSummary(json.summary);
      }
    } catch (e) {
      console.error('Failed to refresh results:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isToday = activeDateTab === 'today';

  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return summary;
    const q = searchQuery.toLowerCase().trim();
    return summary.filter(
      (item) =>
        item.game.name.toLowerCase().includes(q) ||
        item.game.slug.toLowerCase().includes(q)
    );
  }, [summary, searchQuery]);

  return (
    <div className="w-full space-y-4">
      {/* 1. Header Information Block */}
      <div className="bg-white dark:bg-[#111113] border border-[#E5E5E5] dark:border-[#27272A] rounded-[8px] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#20201E] dark:text-[#FAF8F5] uppercase">
              NumberLive &mdash; Published Results
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Verified daily results record archive. Last Updated:{' '}
              <span className="font-semibold text-[#20201E] dark:text-[#E4E4E7]">
                {lastUpdatedStr || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 h-[34px] px-3 text-xs font-semibold text-[#20201E] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B] hover:bg-[#F4EFE6] dark:hover:bg-[#222226] border border-[#E5E5E5] dark:border-[#27272A] rounded-[6px] transition-colors disabled:opacity-60"
            title="Refresh latest results"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C5A059] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Controls Row: [ TODAY ] [ YESTERDAY ] + Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Simple Date Selector */}
        <div className="inline-flex items-center gap-1 bg-white dark:bg-[#111113] p-1 border border-[#E5E5E5] dark:border-[#27272A] rounded-[6px] shadow-xs">
          <button
            onClick={() => setActiveDateTab('today')}
            className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[4px] transition-colors ${
              activeDateTab === 'today'
                ? 'bg-[#20201E] dark:bg-[#FAF8F5] text-white dark:text-[#20201E]'
                : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#20201E] dark:hover:text-white'
            }`}
          >
            TODAY
          </button>
          <button
            onClick={() => setActiveDateTab('yesterday')}
            className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[4px] transition-colors ${
              activeDateTab === 'yesterday'
                ? 'bg-[#20201E] dark:bg-[#FAF8F5] text-white dark:text-[#20201E]'
                : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#20201E] dark:hover:text-white'
            }`}
          >
            YESTERDAY
          </button>
        </div>

        {/* Compact Search Bar */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[36px] pl-9 pr-3 text-xs font-medium bg-white dark:bg-[#111113] border border-[#E5E5E5] dark:border-[#27272A] rounded-[6px] focus:outline-none focus:border-[#C5A059] text-[#20201E] dark:text-white placeholder-[#A1A1AA]"
          />
        </div>
      </div>

      {/* 3. Clean Results List (Table Structure) */}
      <div className="bg-white dark:bg-[#111113] rounded-[8px] border border-[#E5E5E5] dark:border-[#27272A] shadow-xs overflow-hidden">
        {/* Table Header (Desktop) */}
        <div className="hidden md:grid md:grid-cols-12 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] bg-[#FAF8F5] dark:bg-[#18181B] border-b border-[#E5E5E5] dark:border-[#27272A]">
          <div className="col-span-4">GAME</div>
          <div className="col-span-2 text-center">TIME</div>
          <div className="col-span-2 text-center">RESULT</div>
          <div className="col-span-2 text-center">STATUS</div>
          <div className="col-span-2 text-right">CHART</div>
        </div>

        {/* Rows */}
        {filteredGames.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#71717A] dark:text-[#A1A1AA]">
            No games found.
          </div>
        ) : (
          <div className="divide-y divide-[#E5E5E5] dark:divide-[#27272A]">
            {filteredGames.map((item) => {
              const publishedVal = isToday ? item.todayResult : item.yesterdayResult;
              const hasPublished = Boolean(publishedVal && publishedVal !== '--');
              const liveStatus = calculateGameStatus(item.game.resultTime, hasPublished, isToday);

              return (
                <div
                  key={item.game.id}
                  className="px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-[#FAF8F5]/60 dark:hover:bg-[#161619] transition-colors"
                >
                  {/* Desktop Layout: GAME | TIME | RESULT | STATUS | CHART */}
                  <div className="hidden md:grid md:grid-cols-12 items-center gap-2">
                    {/* Game Name */}
                    <div className="col-span-4">
                      <Link
                        href={`/charts/${item.game.slug}`}
                        className="text-sm font-bold text-[#20201E] dark:text-[#FAF8F5] hover:text-[#C5A059] transition-colors"
                      >
                        {item.game.name}
                      </Link>
                    </div>

                    {/* Time */}
                    <div className="col-span-2 text-center text-xs text-[#71717A] dark:text-[#A1A1AA]">
                      {item.game.resultTime}
                    </div>

                    {/* Result Number: 20-24px, weight 600-700, color #20201E, No glow, no circle, no gradient */}
                    <div className="col-span-2 text-center">
                      <span className="text-[22px] font-bold text-[#20201E] dark:text-[#FAF8F5] leading-none tabular-nums">
                        {hasPublished ? publishedVal : '--'}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 text-center">
                      <StatusBadge status={liveStatus} />
                    </div>

                    {/* Chart Navigation */}
                    <div className="col-span-2 text-right">
                      <Link
                        href={`/charts/${item.game.slug}`}
                        className="text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] hover:text-[#C5A059] transition-colors inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Mobile Responsive Layout */}
                  <div className="md:hidden flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/charts/${item.game.slug}`}
                          className="text-sm font-bold text-[#20201E] dark:text-[#FAF8F5] truncate hover:text-[#C5A059]"
                        >
                          {item.game.name}
                        </Link>
                        <StatusBadge status={liveStatus} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#71717A] dark:text-[#A1A1AA]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#71717A]" />
                          {item.game.resultTime}
                        </span>
                        <span>&bull;</span>
                        <Link
                          href={`/charts/${item.game.slug}`}
                          className="text-[#C5A059] font-medium hover:underline"
                        >
                          View Chart
                        </Link>
                      </div>
                    </div>

                    {/* Result Number on mobile */}
                    <div className="shrink-0 text-right">
                      <div className="text-[22px] font-bold text-[#20201E] dark:text-[#FAF8F5] tabular-nums">
                        {hasPublished ? publishedVal : '--'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: 'RESULT' | 'LIVE' | 'PENDING' | 'UPCOMING';
}) {
  switch (status) {
    case 'RESULT':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#059669] dark:text-[#34D399]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-[#34D399]" />
          RESULT
        </span>
      );
    case 'LIVE':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#D97706] dark:text-[#FBBF24]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
          LIVE
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#71717A]" />
          PENDING
        </span>
      );
    case 'UPCOMING':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4D4D8] dark:bg-[#3F3F46]" />
          UPCOMING
        </span>
      );
  }
}
