'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Calendar, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

interface GameScheduleProps {
  summary: Array<{
    game: {
      id: string;
      name: string;
      slug: string;
      resultTime: string;
      category?: { name: string } | null;
    };
    todayResult: string | null;
    yesterdayResult: string | null;
    status: 'PUBLISHED' | 'DRAFT' | 'PENDING';
    resultTime: string;
  }>;
  dateStr: string;
}

export default function GameScheduleTable({ summary, dateStr }: GameScheduleProps) {
  return (
    <section className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] overflow-hidden shadow-subtle">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#EAE3D5] dark:border-[#2E2E33] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]/50 dark:bg-[#18181B]/50">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C5A059]" />
            <h2 className="text-xs sm:text-sm font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-wider">
              Official Game Announcement Timetable
            </h2>
          </div>
          <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
            Daily publishing schedule &amp; live verification status for {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#16A34A]/10 text-[#16A34A] dark:text-[#4ADE80] font-bold text-[11px] border border-[#16A34A]/20">
            <CheckCircle2 className="w-3 h-3" />
            Live Sync
          </span>
        </div>
      </div>

      {/* Desktop Table View (md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EAE3D5] dark:border-[#2E2E33] bg-[#FAF8F5] dark:bg-[#18181B] text-[#71717A] dark:text-[#A1A1AA] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Game</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Scheduled Time</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Today ({dateStr.slice(5)})</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
            {summary.map((item) => {
              const isPublished = item.status === 'PUBLISHED' && item.todayResult;
              return (
                <tr
                  key={item.game.id}
                  className="hover:bg-[#FAF8F5]/80 dark:hover:bg-[#18181B]/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-[#111113] dark:text-[#FAF8F5]">
                    <Link
                      href={`/games/${item.game.slug}`}
                      className="hover:text-[#C5A059] transition-colors"
                    >
                      {item.game.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-[#71717A] dark:text-[#A1A1AA]">
                    <span className="px-2 py-0.5 rounded bg-[#EAE3D5]/50 dark:bg-[#2E2E33] text-[10px] font-semibold">
                      {item.game.category?.name || 'Main Games'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#111113] dark:text-[#FAF8F5]">
                    {item.resultTime}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#16A34A]/10 text-[#16A34A] dark:text-[#4ADE80] font-bold text-[10px] border border-[#16A34A]/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#C5A059]/10 text-[#C5A059] font-bold text-[10px] border border-[#C5A059]/20">
                        <AlertCircle className="w-3 h-3" />
                        Awaiting
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-sm">
                    {isPublished ? (
                      <span className="text-[#C5A059]">{item.todayResult}</span>
                    ) : (
                      <span className="text-[#A1A1AA]">--</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/charts/${item.game.slug}`}
                        className="h-8 px-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#FAF8F5] bg-[#18181B] hover:bg-[#222226] border border-[#2E2E33] hover:border-[#C5A059] rounded-[5px] transition-colors"
                      >
                        <span>Chart</span>
                        <ArrowUpRight className="w-3 h-3 text-[#C5A059]" />
                      </Link>
                      <Link
                        href={`/games/${item.game.slug}`}
                        className="h-8 px-2.5 inline-flex items-center text-[11px] font-bold text-[#71717A] hover:text-[#C5A059] transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (<md) */}
      <div className="md:hidden divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
        {summary.map((item) => {
          const isPublished = item.status === 'PUBLISHED' && item.todayResult;
          return (
            <div key={item.game.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/games/${item.game.slug}`}
                    className="font-black text-sm text-[#111113] dark:text-[#FAF8F5] hover:text-[#C5A059]"
                  >
                    {item.game.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-[#71717A] dark:text-[#A1A1AA]">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#C5A059]" />
                      {item.resultTime}
                    </span>
                    <span>•</span>
                    <span className="text-[10px]">{item.game.category?.name || 'Main Games'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-[#71717A] dark:text-[#A1A1AA]">
                    Result
                  </div>
                  <div className="text-xl font-black font-mono text-[#C5A059]">
                    {isPublished ? item.todayResult : '--'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  {isPublished ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#16A34A]/10 text-[#16A34A] dark:text-[#4ADE80] font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#C5A059]/10 text-[#C5A059] font-bold text-[10px]">
                      <AlertCircle className="w-3 h-3" />
                      Awaiting Release
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/charts/${item.game.slug}`}
                    className="h-10 px-3 min-h-[44px] inline-flex items-center gap-1 text-xs font-bold text-[#FAF8F5] bg-[#18181B] border border-[#2E2E33] hover:border-[#C5A059] rounded-[6px]"
                  >
                    <span>Record Chart</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A059]" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
