'use client';

import React from 'react';
import Link from 'next/link';
import { TodayGameResult } from '@/types';
import { Radio } from 'lucide-react';

interface LiveTickerProps {
  summary: TodayGameResult[];
}

export default function LiveTicker({ summary }: LiveTickerProps) {
  if (!summary || summary.length === 0) return null;

  return (
    <div className="w-full bg-[#18181B] text-white border border-[#2E2E33] rounded-[8px] overflow-hidden flex items-center select-none text-xs min-h-[44px]">
      <div className="flex items-center px-3 sm:px-4 bg-[#111113] z-10 shrink-0 border-r border-[#2E2E33] gap-2 font-bold text-[#FAF8F5] h-full min-h-[44px]">
        <Radio className="w-3.5 h-3.5 text-[#16A34A] animate-pulse" />
        <span className="uppercase tracking-wider text-[11px] text-[#C5A059] font-black">LIVE</span>
      </div>

      <div className="flex-1 overflow-x-auto no-scrollbar py-2 px-3 flex items-center gap-4">
        {summary.map((item) => (
          <Link
            key={item.game.id}
            href={`/games/${item.game.slug}`}
            className="inline-flex items-center gap-2 hover:text-[#C5A059] transition-colors shrink-0 py-1"
          >
            <span className="font-bold text-[#FAF8F5] text-xs uppercase">
              {item.game.name}:
            </span>
            {item.todayResult ? (
              <span className="font-black text-[#111113] bg-[#FAF8F5] dark:text-[#FAF8F5] dark:bg-[#111113] border border-[#C5A059] px-2 py-0.5 rounded-[4px] text-xs">
                {item.todayResult}
              </span>
            ) : (
              <span className="text-[#A1A1AA] text-xs font-semibold">
                {item.resultTime}
              </span>
            )}
            <span className="text-[#3F3F46] ml-1">•</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
