'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, RefreshCw, ArrowRight, Flame, Search } from 'lucide-react';
import { TodayGameResult } from '@/types';
import { formatReadableDate } from '@/lib/utils';

interface TodayResultsGridProps {
  initialSummary: TodayGameResult[];
  dateStr: string;
  yesterdayDateStr: string;
}

export default function TodayResultsGrid({
  initialSummary,
  dateStr,
  yesterdayDateStr,
}: TodayResultsGridProps) {
  const [summary, setSummary] = useState<TodayGameResult[]>(initialSummary);
  const [refreshing, setRefreshing] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'PENDING'>('ALL');

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/results?view=today_summary&date=${dateStr}`);
      const data = await res.json();
      if (data.success && data.summary) {
        setSummary(data.summary);
      }
    } catch (e) {
      console.error('Failed to refresh results:', e);
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  };

  const filteredItems = summary.filter((item) => {
    const matchesSearch =
      item.game.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (item.todayResult && item.todayResult.includes(filterQuery));
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PUBLISHED'
        ? item.status === 'PUBLISHED'
        : item.status !== 'PUBLISHED';
    return matchesSearch && matchesStatus;
  });

  return (
    <section className="space-y-3.5 sm:space-y-4">
      {/* Clean Premium Section Header */}
      <div className="section-header-clean bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 rounded-[9px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059] flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#C5A059]" />
            <span>LIVE TIMETABLE SCOREBOARD</span>
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-[#111113] dark:text-[#FAF8F5] uppercase mt-0.5">
            TODAY&apos;S RESULTS ({formatReadableDate(dateStr)})
          </h2>
        </div>

        {/* Toolbar Controls - Mobile Stacked, Desktop Inline */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          {/* Quick Search (100% width on mobile) */}
          <div className="relative w-full sm:w-44">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search game or #..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 min-h-[44px] text-xs sm:text-sm bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#111113] dark:text-[#FAF8F5] rounded-[8px] font-medium focus:outline-none focus:border-[#C5A059] placeholder:text-[#71717A]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {/* Filter Pills (44px touch height) */}
            <div className="flex-1 sm:flex-initial flex items-center bg-[#FAF8F5] dark:bg-[#18181B] p-1 rounded-[8px] border border-[#EAE3D5] dark:border-[#2E2E33]">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`flex-1 sm:flex-initial min-h-[38px] px-3 py-1.5 rounded-[6px] text-xs font-bold transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-[#111113] text-white shadow-xs'
                    : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#111113] dark:hover:text-white'
                }`}
              >
                All ({summary.length})
              </button>
              <button
                onClick={() => setStatusFilter('PUBLISHED')}
                className={`flex-1 sm:flex-initial min-h-[38px] px-3 py-1.5 rounded-[6px] text-xs font-bold transition-colors ${
                  statusFilter === 'PUBLISHED'
                    ? 'bg-[#111113] text-[#C5A059] shadow-xs'
                    : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#C5A059]'
                }`}
              >
                Published
              </button>
            </div>

            {/* Refresh Button (44×44px touch target) */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-11 h-11 flex items-center justify-center bg-white dark:bg-[#18181B] hover:bg-[#FAF8F5] dark:hover:bg-[#222226] active:scale-95 text-[#111113] dark:text-[#FAF8F5] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[8px] transition-all shrink-0"
              title="Refresh Scoreboard"
              aria-label="Refresh Scoreboard"
            >
              <RefreshCw className={`w-4 h-4 text-[#C5A059] ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Grid: 1 col mobile (<640px), 2 cols tablet (640-1024px), 3-4 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredItems.map((item) => {
          const isPublished = item.status === 'PUBLISHED';
          return (
            <div
              key={item.game.id}
              className="result-card flex flex-col justify-between"
            >
              {/* Card Header: Game Name + Status */}
              <div className="flex items-start justify-between gap-2 border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2.5">
                <div>
                  <Link
                    href={`/games/${item.game.slug}`}
                    className="font-black text-sm sm:text-base text-[#111113] dark:text-[#FAF8F5] hover:text-[#C5A059] transition-colors block uppercase tracking-tight"
                  >
                    {item.game.name}
                  </Link>
                  <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] block font-medium mt-0.5">
                    Yesterday: <strong className="text-[#111113] dark:text-[#FAF8F5] font-bold">{item.yesterdayResult || '--'}</strong>
                  </span>
                </div>

                {isPublished ? (
                  <span className="badge-live">
                    ● Live
                  </span>
                ) : (
                  <span className="badge-wait">
                    Wait
                  </span>
                )}
              </div>

              {/* Large Result Number with Champagne Gold Accent */}
              <div className="py-4 text-center">
                <span className="text-[11px] uppercase font-bold text-[#8C8275] dark:text-[#71717A] block mb-1 tracking-wider">
                  Today&apos;s Result
                </span>
                <span
                  className={`font-black text-[34px] sm:text-[38px] leading-none tracking-tight block ${
                    isPublished
                      ? 'text-[#111113] dark:text-[#FAF8F5]'
                      : 'text-[#D4D4D8] dark:text-[#3F3F46]'
                  }`}
                >
                  {isPublished ? item.todayResult : '— —'}
                </span>
                {isPublished && <div className="result-number-accent" />}
                <span className="text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] block mt-2">
                  {isPublished ? 'Official Announcement' : `Scheduled for ${item.resultTime}`}
                </span>
              </div>

              {/* Card Footer: Time & Action (48px tap target) */}
              <div className="pt-2.5 border-t border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-[#71717A] dark:text-[#A1A1AA] font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#8C8275]" />
                  <span>{item.resultTime}</span>
                </span>
                <Link
                  href={`/games/${item.game.slug}`}
                  className="min-h-[44px] px-3 py-2 font-bold text-xs text-[#111113] dark:text-[#FAF8F5] hover:text-[#C5A059] rounded-[6px] hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] inline-flex items-center gap-1 transition-colors"
                >
                  <span>View Chart</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-8 bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] text-center text-xs sm:text-sm text-[#71717A]">
          No games match &quot;{filterQuery}&quot;.
        </div>
      )}
    </section>
  );
}
