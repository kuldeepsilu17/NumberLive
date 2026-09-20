'use client';

import React from 'react';
import { Bell, ShieldCheck } from 'lucide-react';

export default function NoticeBar() {
  return (
    <div className="w-full bg-[#F4EFE6] dark:bg-[#18181B] border-b border-[#EAE3D5] dark:border-[#2E2E33]">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-1.5 sm:py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#111113] text-[#FAF8F5] border border-[#2E2E33] font-bold text-[9.5px] sm:text-[10px] tracking-wider uppercase shrink-0">
              <Bell className="w-3 h-3 text-[#C5A059]" />
              LIVE RECORD NOTICE
            </span>
            <p className="text-[#111113] dark:text-[#F4F4F5] font-semibold truncate text-[11px] sm:text-xs">
              Daily verified number records are updated live per official regional announcement schedules.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[#71717A] dark:text-[#A1A1AA] text-[11px] font-medium shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Strictly Informational &amp; Free Public Archive</span>
          </div>
        </div>
      </div>
    </div>
  );
}
