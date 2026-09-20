'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Download,
  Filter,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import Papa from 'papaparse';

interface GameOption {
  id: string;
  name: string;
  slug: string;
}

interface YearlyMatrixProps {
  initialGameSlug?: string;
  initialYear?: number;
  gamesList?: GameOption[];
  compact?: boolean;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function YearlyMatrix({
  initialGameSlug = 'delhi',
  initialYear = 2026,
  gamesList = [],
  compact = false,
}: YearlyMatrixProps) {
  const [games, setGames] = useState<GameOption[]>(gamesList);
  const [selectedGame, setSelectedGame] = useState(initialGameSlug);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [activeGameInfo, setActiveGameInfo] = useState<any>(null);
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, string>> | null>(null);
  const [monthlyCounts, setMonthlyCounts] = useState<Record<string, number>>({});
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch games list if not provided
  useEffect(() => {
    if (games.length === 0) {
      fetch('/api/games')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.games) {
            setGames(data.games);
            if (!selectedGame && data.games.length > 0) {
              setSelectedGame(data.games[0].slug);
            }
          }
        })
        .catch((err) => console.error('Failed to load game dropdown:', err));
    }
  }, [games.length, selectedGame]);

  // Load yearly data
  const loadYearlyData = useCallback(async (gameSlug: string, year: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/results?view=yearly_matrix&game=${gameSlug}&year=${year}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load yearly chart records.');
      }
      setMatrixData(data.matrix);
      setMonthlyCounts(data.monthlyCounts || {});
      setTotalEntries(data.totalEntries || 0);
      setActiveGameInfo(data.game);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching chart records.');
      setMatrixData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedGame) {
      loadYearlyData(selectedGame, selectedYear);
    }
  }, [loadYearlyData, selectedGame, selectedYear]);

  const handleCheckChart = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGame) {
      loadYearlyData(selectedGame, selectedYear);
    }
  };

  const handleExportCSV = () => {
    if (!matrixData || !activeGameInfo) return;

    const rows: any[] = [];
    for (let day = 1; day <= 31; day++) {
      const row: Record<string, string> = { Day: String(day).padStart(2, '0') };
      MONTH_NAMES.forEach((m, idx) => {
        row[m] = matrixData[day]?.[idx + 1] || '--';
      });
      rows.push(row);
    }

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeGameInfo.slug}_yearly_chart_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const years = [2026, 2025, 2024, 2023];

  return (
    <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] overflow-hidden shadow-subtle">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-[#EAE3D5] dark:border-[#2E2E33] bg-[#FAF8F5]/60 dark:bg-[#18181B]/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C5A059]" />
              <h2 className="text-xs sm:text-sm font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-wider">
                Yearly Record Chart Matrix (12-Month Grid)
              </h2>
            </div>
            <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
              Comprehensive 365-day historical dataset inspection for any monitored game
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={!matrixData || loading}
              className="h-9 px-3 min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 text-xs font-bold text-[#FAF8F5] bg-[#18181B] hover:bg-[#222226] border border-[#2E2E33] hover:border-[#C5A059] rounded-[6px] disabled:opacity-50 transition-colors"
              title="Download CSV dataset"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>
        </div>

        {/* Interactive Selector Form */}
        <form
          onSubmit={handleCheckChart}
          className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-[#EAE3D5] dark:border-[#2E2E33]"
        >
          {/* Game Select */}
          <div className="sm:col-span-5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] mb-1">
              Select Game
            </label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full h-11 min-h-[44px] px-3 rounded-[6px] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#111113] dark:text-[#FAF8F5] font-bold text-xs focus:outline-none focus:border-[#C5A059]"
            >
              {games.map((g) => (
                <option key={g.id || g.slug} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Select */}
          <div className="sm:col-span-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] mb-1">
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full h-11 min-h-[44px] px-3 rounded-[6px] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#111113] dark:text-[#FAF8F5] font-bold text-xs focus:outline-none focus:border-[#C5A059]"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>

          {/* Check Chart Button */}
          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 min-h-[48px] sm:min-h-[44px] px-4 rounded-[6px] bg-[#C5A059] hover:bg-[#B38F48] active:bg-[#9C7A3C] text-[#111113] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              id="check-chart-btn"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Check Chart</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Active Game Info Bar */}
      {activeGameInfo && (
        <div className="px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#18181B] border-b border-[#EAE3D5] dark:border-[#2E2E33] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111113] dark:text-[#FAF8F5]">
              {activeGameInfo.name} Yearly Chart ({selectedYear})
            </span>
            <span className="text-[#71717A] dark:text-[#A1A1AA]">•</span>
            <span className="text-[#71717A] dark:text-[#A1A1AA]">
              Scheduled: <strong className="text-[#111113] dark:text-[#FAF8F5] font-mono">{activeGameInfo.resultTime}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-[#71717A] dark:text-[#A1A1AA]">
              Total Records: <strong className="text-[#C5A059]">{totalEntries}</strong>
            </span>
            <Link
              href={`/games/${activeGameInfo.slug}`}
              className="text-[#C5A059] hover:underline font-sans font-bold"
            >
              Game Details →
            </Link>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <p className="text-xs text-red-500 font-semibold">{error}</p>
          <button
            onClick={() => loadYearlyData(selectedGame, selectedYear)}
            className="h-9 px-3 text-xs font-bold bg-[#18181B] text-[#FAF8F5] rounded-[6px]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !matrixData && (
        <div className="p-8 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#C5A059] animate-spin mx-auto" />
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] font-bold">
            Querying database records for {selectedGame} in {selectedYear}...
          </p>
        </div>
      )}

      {/* 12-Month Table Grid */}
      {matrixData && (
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-[#EAE3D5] dark:border-[#2E2E33] bg-[#FAF8F5] dark:bg-[#18181B] text-[#71717A] dark:text-[#A1A1AA] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 border-r border-[#EAE3D5] dark:border-[#2E2E33] w-12 bg-[#EAE3D5]/30 dark:bg-[#222226]">
                  Date
                </th>
                {MONTH_NAMES.map((m, idx) => (
                  <th
                    key={m}
                    className="py-2.5 px-2 border-r border-[#EAE3D5] dark:border-[#2E2E33] min-w-[42px]"
                  >
                    <div>{m}</div>
                    <div className="text-[9px] text-[#A1A1AA] font-normal">
                      ({monthlyCounts[idx + 1] || 0})
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <tr
                  key={day}
                  className="hover:bg-[#FAF8F5]/80 dark:hover:bg-[#18181B]/80 transition-colors"
                >
                  <td className="py-2 px-3 border-r border-[#EAE3D5] dark:border-[#2E2E33] font-bold bg-[#FAF8F5]/50 dark:bg-[#18181B]/50 text-[#111113] dark:text-[#FAF8F5]">
                    {String(day).padStart(2, '0')}
                  </td>
                  {Array.from({ length: 12 }, (_, mIdx) => mIdx + 1).map((monthNum) => {
                    const val = matrixData[day]?.[monthNum] || '--';
                    const hasVal = val !== '--';
                    return (
                      <td
                        key={monthNum}
                        className={`py-2 px-2 border-r border-[#EAE3D5] dark:border-[#2E2E33] text-center font-bold ${
                          hasVal
                            ? 'text-[#111113] dark:text-[#FAF8F5] bg-[#C5A059]/5'
                            : 'text-[#D4CEBF] dark:text-[#3F3F46]'
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
