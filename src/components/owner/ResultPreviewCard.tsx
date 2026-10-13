'use client';

import React from 'react';
import { Eye, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

interface ResultPreviewCardProps {
  gameName: string;
  resultDate: string;
  resultValue: string;
  resultTime: string;
  status: string;
  categoryName?: string;
}

export default function ResultPreviewCard({
  gameName,
  resultDate,
  resultValue,
  resultTime,
  status,
  categoryName = 'Main Game',
}: ResultPreviewCardProps) {
  const isPublished = status === 'PUBLISHED';
  const isDraft = status === 'DRAFT';
  const isArchived = status === 'ARCHIVED';

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#141416] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#C5A059]">
          <Eye className="w-3.5 h-3.5" />
          <span>Live Public Scoreboard Preview</span>
        </div>
        <span
          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-[4px] border ${
            isPublished
              ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#064E3B]/30 dark:border-[#059669]'
              : isDraft
              ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] dark:bg-[#78350F]/30 dark:border-[#D97706]'
              : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1] dark:bg-[#1E293B] dark:border-[#475569]'
          }`}
        >
          {status}
        </span>
      </div>

      <div className="bg-white dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[8px] p-3.5 flex items-center justify-between">
        <div className="space-y-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C8275] dark:text-[#A1A1AA]">
            {categoryName}
          </div>
          <h4 className="text-base font-black text-[#111113] dark:text-[#FAF8F5] truncate">
            {gameName || 'Select Game'}
          </h4>
          <div className="flex items-center gap-2 text-xs text-[#71717A] dark:text-[#A1A1AA]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#C5A059]" />
              <span>{resultTime || '00:00 PM'}</span>
            </span>
            <span>•</span>
            <span>{resultDate || 'YYYY-MM-DD'}</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] font-bold uppercase text-[#8C8275] dark:text-[#A1A1AA]">
            Outcome
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums ${
              isPublished
                ? 'text-[#059669] dark:text-[#34D399]'
                : isDraft
                ? 'text-[#D97706] dark:text-[#FBBF24]'
                : 'text-[#64748B]'
            }`}
          >
            {resultValue ? resultValue.padStart(2, '0') : '--'}
          </div>
        </div>
      </div>

      {isDraft && (
        <div className="flex items-center gap-2 p-2 rounded-[6px] bg-[#FFFBEB] dark:bg-[#2A2312] border border-[#FDE68A] dark:border-[#6A4B10] text-[11px] text-[#B45309] dark:text-[#FCD34D]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>This result is in <strong>DRAFT</strong> status and is <strong>NOT visible to public users</strong> until you publish it.</span>
        </div>
      )}

      {isPublished && (
        <div className="flex items-center gap-2 p-2 rounded-[6px] bg-[#ECFDF5] dark:bg-[#062D20] border border-[#A7F3D0] dark:border-[#065F46] text-[11px] text-[#047857] dark:text-[#6EE7B7]">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>This result is <strong>PUBLISHED</strong> and visible to all visitors on the public scoreboard and history archives.</span>
        </div>
      )}
    </div>
  );
}
