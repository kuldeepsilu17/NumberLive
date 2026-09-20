'use client';

import React, { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, Calendar, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { Game } from '@/types';

interface MonthlyMatrixProps {
  initialYear?: number;
  initialMonth?: number;
}

export default function MonthlyMatrix({
  initialYear = 2026,
  initialMonth = 9,
}: MonthlyMatrixProps) {
  const [year, setYear] = useState<number>(initialYear);
  const [month, setMonth] = useState<number>(initialMonth);
  const [loading, setLoading] = useState<boolean>(false);
  const [games, setGames] = useState<Game[]>([]);
  const [matrix, setMatrix] = useState<Record<number, Record<string, string>>>({});
  const [daysInMonth, setDaysInMonth] = useState<number>(30);
  const [highlightNum, setHighlightNum] = useState<string>('');
  const [selectedGameSlug, setSelectedGameSlug] = useState<string>('ALL');
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'matrix'>('cards');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchMatrix = async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/results?view=monthly_matrix&year=${y}&month=${m}`);
      const data = await res.json();
      if (data.success) {
        setGames(data.games || []);
        setMatrix(data.matrix || {});
        setDaysInMonth(data.daysInMonth || 30);
      }
    } catch (err) {
      console.error('Failed to fetch matrix data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix(year, month);
  }, [year, month]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const visibleGames =
    selectedGameSlug === 'ALL'
      ? games
      : games.filter((g) => g.slug === selectedGameSlug);

  return (
    <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden space-y-0">
      {/* Clean Premium Header */}
      <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#C5A059]" />
            <span>HISTORICAL ARCHIVE MATRIX</span>
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-[#111113] dark:text-[#FAF8F5] uppercase mt-0.5">
            MONTHLY RESULT CHART — {monthNames[month - 1]} {year}
          </h2>
        </div>
        <span className="text-xs bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] px-3 py-1.5 rounded-[6px] text-[#111113] dark:text-[#FAF8F5] font-bold self-start sm:self-auto">
          DAY 1–{daysInMonth} MATRIX
        </span>
      </div>

      {/* Toolbar Controls: Stacked Vertically on Mobile (48px controls), Inline on Desktop */}
      <div className="p-3.5 sm:p-4 bg-[#FAF8F5] dark:bg-[#18181B] border-b border-[#EAE3D5] dark:border-[#2E2E33] space-y-3">
        {/* Month Switcher Row (48px height) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center bg-white dark:bg-[#111113] rounded-[8px] p-1 border border-[#EAE3D5] dark:border-[#2E2E33] shadow-xs w-full sm:w-auto">
            <button
              onClick={handlePrevMonth}
              className="min-h-[44px] px-3 hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] rounded-[6px] text-[#111113] dark:text-[#FAF8F5] flex items-center justify-center transition-colors"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="flex-1 px-4 font-black text-[#111113] dark:text-[#FAF8F5] text-center text-sm sm:text-base">
              {monthNames[month - 1]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="min-h-[44px] px-3 hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] rounded-[6px] text-[#111113] dark:text-[#FAF8F5] flex items-center justify-center transition-colors"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile View Switcher (Cards vs Matrix) */}
          <div className="flex sm:hidden items-center justify-between bg-white dark:bg-[#111113] p-1 rounded-[8px] border border-[#EAE3D5] dark:border-[#2E2E33]">
            <span className="text-xs font-bold px-2 text-[#71717A]">Mobile View:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileViewMode('cards')}
                className={`min-h-[38px] px-3 py-1 text-xs font-bold rounded-[6px] flex items-center gap-1.5 transition-colors ${
                  mobileViewMode === 'cards'
                    ? 'bg-[#111113] text-[#C5A059] shadow-xs'
                    : 'text-[#71717A] hover:text-[#111113]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Daily Cards</span>
              </button>
              <button
                onClick={() => setMobileViewMode('matrix')}
                className={`min-h-[38px] px-3 py-1 text-xs font-bold rounded-[6px] flex items-center gap-1.5 transition-colors ${
                  mobileViewMode === 'matrix'
                    ? 'bg-[#111113] text-[#C5A059] shadow-xs'
                    : 'text-[#71717A] hover:text-[#111113]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Full Matrix</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tools Grid: Full width on mobile, inline flex on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Game Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
              Filter Game
            </label>
            <select
              value={selectedGameSlug}
              onChange={(e) => setSelectedGameSlug(e.target.value)}
              className="form-select text-xs sm:text-sm font-bold"
            >
              <option value="ALL">All Regional Games ({games.length})</option>
              {games.map((g) => (
                <option key={g.id} value={g.slug}>
                  {g.name} ({g.resultTime})
                </option>
              ))}
            </select>
          </div>

          {/* Highlight Number */}
          <div>
            <label className="block text-[11px] font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
              Highlight Number (00-99)
            </label>
            <input
              type="text"
              placeholder="e.g. 67"
              value={highlightNum}
              onChange={(e) => setHighlightNum(e.target.value)}
              className="form-input text-xs sm:text-sm font-bold"
            />
          </div>

          {/* Export CSV Button */}
          <div className="flex flex-col justify-end">
            <span className="hidden sm:block text-[11px] font-bold uppercase mb-1 opacity-0">Export</span>
            <a
              href={`/api/export-csv?year=${year}&month=${month}${selectedGameSlug !== 'ALL' ? `&game=${selectedGameSlug}` : ''}`}
              download
              className="btn-primary w-full text-xs sm:text-sm font-bold shadow-xs"
            >
              <Download className="w-4 h-4 text-[#C5A059]" />
              <span>Export CSV Matrix</span>
            </a>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         1. MOBILE DAILY CARDS VIEW (Clean, legible, no squeeze)
         ───────────────────────────────────────────────────────────── */}
      {mobileViewMode === 'cards' && (
        <div className="sm:hidden p-3.5 space-y-3">
          {loading ? (
            <div className="py-10 text-center text-xs text-[#71717A]">
              Loading chart records for {monthNames[month - 1]} {year}...
            </div>
          ) : (
            Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStrPadded = `${String(day).padStart(2, '0')} ${monthNames[month - 1]} ${year}`;
              const rowData = matrix[day] || {};

              return (
                <div
                  key={day}
                  className="bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[8px] p-3 space-y-2 shadow-subtle"
                >
                  <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-1.5">
                    <span className="font-black text-xs uppercase text-[#111113] dark:text-[#FAF8F5]">
                      Day {day} ({dateStrPadded})
                    </span>
                    <span className="text-[10px] text-[#71717A] font-semibold">
                      {visibleGames.length} Games
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {visibleGames.map((g) => {
                      const val = rowData[g.slug] || '--';
                      const isHighlighted =
                        highlightNum &&
                        val !== '--' &&
                        val.toLowerCase() === highlightNum.trim().toLowerCase();

                      return (
                        <div
                          key={g.id}
                          className={`p-2 rounded-[6px] border flex items-center justify-between transition-colors ${
                            isHighlighted
                              ? 'bg-[#111113] border-[#C5A059] text-white shadow-xs'
                              : 'bg-white dark:bg-[#111113] border-[#EAE3D5] dark:border-[#2E2E33]'
                          }`}
                        >
                          <div>
                            <span className="font-extrabold text-[11px] block uppercase truncate max-w-[90px]">
                              {g.name}
                            </span>
                            <span className="text-[9px] text-[#71717A]">
                              {g.resultTime}
                            </span>
                          </div>
                          <span
                            className={`font-black text-sm px-2 py-0.5 rounded-[4px] ${
                              isHighlighted
                                ? 'text-[#C5A059] bg-[#18181B]'
                                : val !== '--'
                                ? 'text-[#111113] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B]'
                                : 'text-[#A1A1AA]'
                            }`}
                          >
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         2. FULL MATRIX TABLE VIEW (Tablet/Desktop & optional mobile)
         ───────────────────────────────────────────────────────────── */}
      <div className={`${mobileViewMode === 'cards' ? 'hidden sm:block' : 'block'} overflow-x-auto`}>
        <table className="w-full text-left border-collapse min-w-[560px] text-xs">
          <thead>
            <tr className="bg-[#111113] text-white font-bold text-xs uppercase">
              <th className="py-2.5 px-3 sticky left-0 bg-[#111113] z-10 border-r border-[#2E2E33] w-20 text-center text-xs">
                Date
              </th>
              {visibleGames.map((g) => (
                <th
                  key={g.id}
                  className="py-2 px-2 text-center border-r border-[#2E2E33] min-w-[75px]"
                >
                  <div className="font-black text-white text-xs">{g.name}</div>
                  <div className="text-[10px] font-medium text-[#C5A059]">{g.resultTime}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
            {loading ? (
              <tr>
                <td
                  colSpan={visibleGames.length + 1}
                  className="py-10 text-center text-[#71717A] text-xs"
                >
                  Loading chart matrix for {monthNames[month - 1]} {year}...
                </td>
              </tr>
            ) : (
              Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dateStrPadded = `${String(day).padStart(2, '0')} ${monthNames[month - 1].slice(0, 3)}`;
                const rowData = matrix[day] || {};

                return (
                  <tr
                    key={day}
                    className="hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] transition-colors"
                  >
                    <td className="py-2 px-2 sticky left-0 bg-[#FAF8F5] dark:bg-[#111113] z-10 border-r border-[#EAE3D5] dark:border-[#2E2E33] font-bold text-[#111113] dark:text-[#FAF8F5] text-center text-xs">
                      {dateStrPadded}
                    </td>

                    {visibleGames.map((g) => {
                      const val = rowData[g.slug] || '--';
                      const isHighlighted =
                        highlightNum &&
                        val !== '--' &&
                        val.toLowerCase() === highlightNum.trim().toLowerCase();

                      return (
                        <td
                          key={g.id}
                          className="py-1.5 px-1 text-center border-r border-[#EAE3D5] dark:border-[#2E2E33]"
                        >
                          <span
                            className={`inline-block min-w-[32px] py-1 px-1 rounded-[4px] font-black text-xs text-center transition-all ${
                              isHighlighted
                                ? 'bg-[#111113] text-[#C5A059] border border-[#C5A059] scale-110 shadow-xs'
                                : val !== '--'
                                ? 'text-[#111113] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B] font-bold'
                                : 'text-[#D4D4D8] dark:text-[#3F3F46]'
                            }`}
                          >
                            {val}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#FAF8F5] dark:bg-[#111113] border-t border-[#EAE3D5] dark:border-[#2E2E33] text-xs text-[#71717A] flex flex-col sm:flex-row items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span>{daysInMonth} Days Verified Record Matrix</span>
          <span>•</span>
          <span>Public archive database</span>
        </div>
        <span>Strictly Non-Gambling Reference</span>
      </div>
    </div>
  );
}
