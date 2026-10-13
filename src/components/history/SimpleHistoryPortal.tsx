'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import Papa from 'papaparse';

interface GameItem {
  id: string;
  name: string;
  slug: string;
  resultTime: string;
}

interface SimpleHistoryPortalProps {
  games: GameItem[];
  initialYear?: number;
  initialMonth?: number;
}

const YEARS = [2026, 2025, 2024, 2023];

const MONTHS = [
  { num: 1, name: 'January' },
  { num: 2, name: 'February' },
  { num: 3, name: 'March' },
  { num: 4, name: 'April' },
  { num: 5, name: 'May' },
  { num: 6, name: 'June' },
  { num: 7, name: 'July' },
  { num: 8, name: 'August' },
  { num: 9, name: 'September' },
  { num: 10, name: 'October' },
  { num: 11, name: 'November' },
  { num: 12, name: 'December' },
];

export default function SimpleHistoryPortal({
  games,
  initialYear = 2026,
  initialMonth = 9,
}: SimpleHistoryPortalProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedGameSlug, setSelectedGameSlug] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [matrixData, setMatrixData] = useState<{
    daysInMonth: number;
    matrix: Record<number, Record<string, string>>;
    gamesList: GameItem[];
  }>({
    daysInMonth: 30,
    matrix: {},
    gamesList: games,
  });

  const fetchHistory = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/results?view=monthly_matrix&year=${year}&month=${month}`);
      const json = await res.json();
      if (json.success) {
        setMatrixData({
          daysInMonth: json.daysInMonth || 30,
          matrix: json.matrix || {},
          gamesList: json.games || games,
        });
      }
    } catch (e) {
      console.error('Failed to load history matrix:', e);
    } finally {
      setLoading(false);
    }
  }, [games]);

  useEffect(() => {
    fetchHistory(selectedYear, selectedMonth);
  }, [fetchHistory, selectedYear, selectedMonth]);

  const displayedGames =
    selectedGameSlug === 'all'
      ? matrixData.gamesList
      : matrixData.gamesList.filter((g) => g.slug === selectedGameSlug);

  const daysArray = Array.from({ length: matrixData.daysInMonth }, (_, i) => i + 1);
  const currentMonthName = MONTHS.find((m) => m.num === selectedMonth)?.name || '';

  const handleExportCSV = () => {
    const rows: any[] = [];
    daysArray.forEach((dayNum) => {
      const paddedDay = String(dayNum).padStart(2, '0');
      const paddedMonth = String(selectedMonth).padStart(2, '0');
      const dateStr = `${selectedYear}-${paddedMonth}-${paddedDay}`;
      const rowObj: Record<string, string> = { Date: dateStr };
      displayedGames.forEach((g) => {
        rowObj[g.name] = matrixData.matrix[dayNum]?.[g.slug] || '--';
      });
      rows.push(rowObj);
    });

    const csvString = Papa.unparse(rows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `numberlive-history-${selectedYear}-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto py-2">
      {/* 1. Header Information Block */}
      <div className="bg-white dark:bg-[#111113] border border-[#E5E5E5] dark:border-[#27272A] p-4 sm:p-5 rounded-[8px] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold uppercase text-[#20201E] dark:text-[#FAF8F5] tracking-tight">
              History
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Browse previously published records.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 h-[36px] px-3 text-xs font-semibold text-[#20201E] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B] hover:bg-[#F4EFE6] dark:hover:bg-[#222226] border border-[#E5E5E5] dark:border-[#27272A] rounded-[6px] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Filters (Year, Month, Game) - Horizontal on desktop, Vertical on mobile, 44-48px height */}
      <div className="bg-white dark:bg-[#111113] border border-[#E5E5E5] dark:border-[#27272A] rounded-[8px] p-3.5 sm:p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Year Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#71717A] dark:text-[#A1A1AA] mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full h-11 px-3 text-xs font-semibold bg-[#FAF8F5] dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] rounded-[6px] focus:outline-none focus:border-[#C5A059] text-[#20201E] dark:text-white"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#71717A] dark:text-[#A1A1AA] mb-1">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full h-11 px-3 text-xs font-semibold bg-[#FAF8F5] dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] rounded-[6px] focus:outline-none focus:border-[#C5A059] text-[#20201E] dark:text-white"
            >
              {MONTHS.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Game Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#71717A] dark:text-[#A1A1AA] mb-1">
              Game
            </label>
            <select
              value={selectedGameSlug}
              onChange={(e) => setSelectedGameSlug(e.target.value)}
              className="w-full h-11 px-3 text-xs font-semibold bg-[#FAF8F5] dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] rounded-[6px] focus:outline-none focus:border-[#C5A059] text-[#20201E] dark:text-white"
            >
              <option value="all">All Games ({matrixData.gamesList.length})</option>
              {matrixData.gamesList.map((g) => (
                <option key={g.id} value={g.slug}>
                  {g.name} ({g.resultTime})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Historical Archive Table */}
      <div className="bg-white dark:bg-[#111113] rounded-[8px] border border-[#E5E5E5] dark:border-[#27272A] shadow-xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="bg-[#FAF8F5] dark:bg-[#18181B] border-b border-[#E5E5E5] dark:border-[#27272A] px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#20201E] dark:text-[#FAF8F5]">
            {currentMonthName} {selectedYear} &mdash; Published Ledger
          </span>
          <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
            {daysArray.length} Days
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Loading historical records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] dark:bg-[#18181B] border-b border-[#E5E5E5] dark:border-[#27272A] text-[11px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA]">
                  <th className="py-2.5 px-3 border-r border-[#E5E5E5] dark:border-[#27272A] sticky left-0 bg-[#FAF8F5] dark:bg-[#18181B] z-10 w-16">
                    DATE
                  </th>
                  {displayedGames.map((g) => (
                    <th
                      key={g.id}
                      className="py-2.5 px-3 border-r border-[#E5E5E5] dark:border-[#27272A] min-w-[90px]"
                    >
                      <Link
                        href={`/charts/${g.slug}`}
                        className="hover:text-[#C5A059] transition-colors inline-block uppercase font-bold text-[#20201E] dark:text-[#FAF8F5]"
                        title={`Open ${g.name} chart`}
                      >
                        {g.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#27272A]">
                {daysArray.map((dayNum) => {
                  const paddedDay = String(dayNum).padStart(2, '0');
                  return (
                    <tr
                      key={dayNum}
                      className="hover:bg-[#FAF8F5]/60 dark:hover:bg-[#18181B] transition-colors"
                    >
                      <td className="py-2 px-3 border-r border-[#E5E5E5] dark:border-[#27272A] sticky left-0 bg-white dark:bg-[#111113] z-10 text-[#71717A] dark:text-[#A1A1AA] font-medium">
                        {paddedDay}
                      </td>
                      {displayedGames.map((g) => {
                        const val = matrixData.matrix[dayNum]?.[g.slug];
                        const hasVal = Boolean(val && val !== '--');
                        return (
                          <td
                            key={g.id}
                            className="py-2 px-3 border-r border-[#E5E5E5] dark:border-[#27272A]"
                          >
                            {hasVal ? (
                              <span className="font-bold text-sm text-[#20201E] dark:text-[#FAF8F5] tabular-nums">
                                {val}
                              </span>
                            ) : (
                              <span className="text-[#A1A1AA] dark:text-[#52525B]">
                                --
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
