'use client';

import React from 'react';
import { Info, ShieldCheck } from 'lucide-react';

export default function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="bg-[#FAF8F5] dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] text-[#71717A] dark:text-[#A1A1AA] px-3 py-1.5 text-xs text-center font-medium flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
        <span>
          <strong className="text-[#111113] dark:text-[#F4F4F5]">Informational Portal:</strong> NumberLive is an independent statistical records archive. No betting, gambling, or monetary transactions.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] border-l-3 border-l-[#C5A059] rounded-[6px] p-3.5 sm:p-4 my-4 sm:my-6 shadow-subtle">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <Info className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-[13px] text-[#5C5449] dark:text-[#D4D4D8] leading-relaxed">
          <p className="font-bold text-[#111113] dark:text-[#FAF8F5] uppercase tracking-wide text-xs mb-0.5">
            Non-Gambling &amp; Informational Reference Archive
          </p>
          <p>
            This portal indexes and displays publicly announced number results, historical chart matrices, and daily timetables strictly for informational, educational, and journalistic documentation. It does <strong>not</strong> provide betting services, wagering slips, paid predictions, or financial facilities.
          </p>
        </div>
      </div>
    </div>
  );
}
