'use client';

import React, { useState, useEffect } from 'react';
import { Grid3X3, Calendar, FileSpreadsheet, RefreshCw } from 'lucide-react';
import MonthlyMatrix from '@/components/charts/MonthlyMatrix';
import YearlyMatrix from '@/components/charts/YearlyMatrix';

export default function AdminChartsPage() {
  const [tab, setTab] = useState<'monthly' | 'yearly'>('monthly');
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/games')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setGames(data.games || []);
      })
      .catch((err) => console.error('Error:', err));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 sm:p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              EDITORIAL CHARTS INSPECTOR
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Inspect live public monthly matrices and 12-month yearly datasets directly from editorial database.
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[6px] self-start sm:self-auto">
          <button
            onClick={() => setTab('monthly')}
            className={`h-9 px-3 min-h-[36px] flex items-center gap-1.5 text-xs font-bold rounded-[4px] transition-colors ${
              tab === 'monthly'
                ? 'bg-[#C5A059] text-[#111113]'
                : 'text-[#71717A] dark:text-[#A1A1AA]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Grid</span>
          </button>
          <button
            onClick={() => setTab('yearly')}
            className={`h-9 px-3 min-h-[36px] flex items-center gap-1.5 text-xs font-bold rounded-[4px] transition-colors ${
              tab === 'yearly'
                ? 'bg-[#C5A059] text-[#111113]'
                : 'text-[#71717A] dark:text-[#A1A1AA]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Yearly 12-Month Matrix</span>
          </button>
        </div>
      </div>

      {tab === 'monthly' ? (
        <MonthlyMatrix initialYear={2026} initialMonth={9} />
      ) : (
        <YearlyMatrix
          initialGameSlug="delhi"
          initialYear={2026}
          gamesList={games.map((g) => ({ id: g.id, name: g.name, slug: g.slug }))}
        />
      )}
    </div>
  );
}
