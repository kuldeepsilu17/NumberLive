'use client';

import React from 'react';
import { Bell, Info, ShieldAlert } from 'lucide-react';

interface NoticeBoardProps {
  noticeText?: string;
  alertBanner?: string;
}

export default function NoticeBoard({
  noticeText = 'NOTICE: NumberLive is an open, independent statistical records archive. We do not promote, conduct, or facilitate wagering. All published numbers are aggregated from public regional release boards.',
  alertBanner = 'Live timetable sync active. Real-time record publishing verified for September 2026.',
}: NoticeBoardProps) {
  return (
    <div className="space-y-3">
      {/* Top Alert Bar */}
      {alertBanner && (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[8px] bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] text-xs font-semibold">
          <Bell className="w-4 h-4 shrink-0 animate-bounce" />
          <span className="truncate">{alertBanner}</span>
        </div>
      )}

      {/* Main Notice Box */}
      <div className="p-4 rounded-[9px] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle flex items-start gap-3">
        <div className="w-8 h-8 rounded-[6px] bg-[#18181B] border border-[#C5A059] flex items-center justify-center text-[#C5A059] shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <h2 className="font-bold text-[#111113] dark:text-[#FAF8F5] uppercase tracking-wide text-xs sm:text-sm">
            Public Information &amp; Editorial Verification Notice
          </h2>
          <p className="text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            {noticeText}
          </p>
        </div>
      </div>
    </div>
  );
}
