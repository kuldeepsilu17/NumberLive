import React from 'react';
import MonthlyMatrix from '@/components/charts/MonthlyMatrix';
import { constructMetadata } from '@/lib/seo';
import { ShieldCheck, Calendar } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Monthly Results Chart Matrix | NumberLive',
  description:
    'Complete monthly day 1 to 31 number-results matrix table across all verified regional games. Filter by month, year, and download CSV records.',
  path: '/monthly-chart',
});

export default function MonthlyChartPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 rounded-[9px] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              MONTHLY RESULT MATRIX CHART
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Full 30/31-day synchronized historical number matrix for all regional announcements.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] px-3 py-1.5 rounded-[6px] text-[#111113] dark:text-[#FAF8F5] font-bold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>Official Public Data</span>
        </div>
      </div>

      <MonthlyMatrix initialYear={2026} initialMonth={9} />
    </div>
  );
}
