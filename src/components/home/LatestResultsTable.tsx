'use client';

import React from 'react';
import Link from 'next/link';
import { Table, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { TodayGameResult } from '@/types';
import { formatReadableDate } from '@/lib/utils';

interface LatestResultsTableProps {
  summary: TodayGameResult[];
  dateStr: string;
}

export default function LatestResultsTable({
  summary,
  dateStr,
}: LatestResultsTableProps) {
  return (
    <section className="space-y-3.5 sm:space-y-4">
      {/* Clean Premium Section Title */}
      <div className="section-header-clean bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 rounded-[9px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-subtle">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059] flex items-center gap-1.5">
            <Table className="w-4 h-4 text-[#C5A059]" />
            <span>DAILY VERIFIED SUMMARY</span>
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-[#111113] dark:text-[#FAF8F5] uppercase mt-0.5">
            LATEST PUBLISHED RESULTS
          </h2>
        </div>
        <span className="text-xs bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] px-3 py-1.5 rounded-[6px] text-[#111113] dark:text-[#FAF8F5] font-bold self-start sm:self-auto">
          {formatReadableDate(dateStr)}
        </span>
      </div>

      {/* Desktop Table (Visible on md+ screens) */}
      <div className="hidden md:block overflow-x-auto bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle">
        <table className="results-table">
          <thead>
            <tr>
              <th className="w-1/4">Game Name</th>
              <th className="w-1/6">Date</th>
              <th className="w-1/6 text-center">Result</th>
              <th className="w-1/6">Time</th>
              <th className="w-1/6">Status</th>
              <th className="w-1/12 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
            {summary.map((item) => {
              const isPublished = item.status === 'PUBLISHED';
              return (
                <tr key={item.game.id} className="transition-colors">
                  <td className="font-bold text-[#111113] dark:text-[#FAF8F5] uppercase">
                    <Link
                      href={`/games/${item.game.slug}`}
                      className="hover:text-[#C5A059] transition-colors inline-block text-xs sm:text-sm"
                    >
                      {item.game.name}
                    </Link>
                  </td>
                  <td className="text-[#71717A] dark:text-[#A1A1AA] font-medium text-xs">
                    {formatReadableDate(dateStr)}
                  </td>
                  <td className="text-center">
                    <span
                      className={`inline-block font-black text-base px-3 py-0.5 rounded-[4px] ${
                        isPublished
                          ? 'bg-[#FAF8F5] dark:bg-[#18181B] text-[#111113] dark:text-[#FAF8F5] border border-[#EAE3D5] dark:border-[#2E2E33]'
                          : 'text-[#A1A1AA] bg-[#FAF8F5] dark:bg-[#18181B]/40'
                      }`}
                    >
                      {isPublished ? item.todayResult : '— —'}
                    </span>
                  </td>
                  <td className="text-[#71717A] dark:text-[#A1A1AA] font-medium text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#8C8275]" />
                      {item.resultTime}
                    </span>
                  </td>
                  <td>
                    {isPublished ? (
                      <span className="badge-live">
                        <CheckCircle2 className="w-3 h-3" />
                        Published
                      </span>
                    ) : (
                      <span className="badge-wait">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/games/${item.game.slug}`}
                      className="font-bold text-xs text-[#111113] dark:text-[#FAF8F5] hover:text-[#C5A059] hover:underline inline-flex items-center gap-1 py-1"
                    >
                      <span>Chart</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         MOBILE RESULT CARD VIEW (< md screens)
         Convert each row into a compact, beautiful card layout
         ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {summary.map((item) => {
          const isPublished = item.status === 'PUBLISHED';
          return (
            <Link
              key={item.game.id}
              href={`/games/${item.game.slug}`}
              className="block bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] hover:border-[#C5A059] rounded-[9px] p-4 shadow-subtle transition-all active:scale-[0.99] group"
            >
              {/* Card Top: Game Name + Status */}
              <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2.5">
                <span className="font-black text-sm uppercase text-[#111113] dark:text-[#FAF8F5] group-hover:text-[#C5A059] transition-colors">
                  {item.game.name}
                </span>

                {isPublished ? (
                  <span className="badge-live">
                    ● PUBLISHED
                  </span>
                ) : (
                  <span className="badge-wait">
                    PENDING
                  </span>
                )}
              </div>

              {/* Card Body: Result Number + Metadata Grid */}
              <div className="py-3 flex items-center justify-between">
                <div className="space-y-1 text-xs text-[#71717A] dark:text-[#A1A1AA]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase text-[#8C8275]">Date:</span>
                    <span className="font-semibold text-[#111113] dark:text-[#FAF8F5]">{formatReadableDate(dateStr)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase text-[#8C8275]">Time:</span>
                    <span className="font-semibold text-[#111113] dark:text-[#FAF8F5] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#8C8275]" /> {item.resultTime}
                    </span>
                  </div>
                </div>

                {/* Prominent Result Number */}
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8275] block mb-0.5">
                    Result
                  </span>
                  <span
                    className={`inline-block font-black text-2xl sm:text-3xl px-3.5 py-1 rounded-[6px] ${
                      isPublished
                        ? 'bg-[#111113] text-[#FAF8F5] dark:bg-[#18181B] dark:text-[#FAF8F5] border border-[#2E2E33] shadow-xs'
                        : 'bg-[#FAF8F5] dark:bg-[#18181B] text-[#A1A1AA]'
                    }`}
                  >
                    {isPublished ? item.todayResult : '—'}
                  </span>
                </div>
              </div>

              {/* Card Footer: Action */}
              <div className="pt-2.5 border-t border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-[#71717A] dark:text-[#A1A1AA]">
                  Tap to view full monthly chart
                </span>
                <span className="font-bold text-[#C5A059] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  <span>View Chart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
