'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Download,
  TrendingUp,
  FileSpreadsheet,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BarChart3,
  ListFilter,
  CheckCircle2,
} from 'lucide-react';
import Papa from 'papaparse';

interface GameInfo {
  id: string;
  name: string;
  slug: string;
  resultTime: string;
  description: string;
  category?: { name: string } | null;
}

interface SingleGameChartProps {
  game: GameInfo;
  initialYear?: number;
  initialMonth?: number;
}

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

export default function SingleGameChart({
  game,
  initialYear = 2026,
  initialMonth = 9,
}: SingleGameChartProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    mostFrequent: '--',
    mostFrequentCount: 0,
    latestResult: '--',
    latestDate: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchGameChart = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/results?view=game_chart&game=${game.slug}&year=${year}&month=${month}`
      );
      const data = await res.json();
      if (data.success) {
        setChartData(data.results || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error('Error fetching game chart:', err);
    } finally {
      setLoading(false);
    }
  }, [game.slug]);

  useEffect(() => {
    fetchGameChart(selectedYear, selectedMonth);
  }, [fetchGameChart, selectedYear, selectedMonth]);

  const handleExportCSV = () => {
    if (chartData.length === 0) return;

    const rows = chartData.map((r) => ({
      Date: r.resultDate,
      Game: game.name,
      Result: r.resultValue,
      Time: r.resultTime,
      Status: r.status,
    }));

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${game.slug}_chart_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayMap: Record<number, string> = {};
  chartData.forEach((r) => {
    const d = parseInt(r.resultDate.split('-')[2]);
    dayMap[d] = r.resultValue;
  });

  const years = [2026, 2025, 2024, 2023];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner & Breadcrumb */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 sm:p-6 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/charts"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#71717A] hover:text-[#C5A059] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Charts</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/yearly-chart?game=${game.slug}`}
              className="h-9 px-3 min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 text-xs font-bold text-[#FAF8F5] bg-[#18181B] border border-[#2E2E33] hover:border-[#C5A059] rounded-[6px] transition-colors"
            >
              <span>12-Month Yearly Grid</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-[#EAE3D5] dark:border-[#2E2E33] pt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#C5A059]/10 text-[#C5A059] font-bold text-[10px] uppercase border border-[#C5A059]/20">
                {game.category?.name || 'Main Games'}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#71717A] dark:text-[#A1A1AA] font-mono">
                <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                {game.resultTime}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
              {game.name} Record Chart Archive
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] max-w-2xl">
              {game.description || `Official monthly historical chart records for ${game.name}.`}
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={chartData.length === 0}
            className="h-10 px-4 min-h-[44px] inline-flex items-center gap-2 text-xs font-bold text-[#111113] bg-[#C5A059] hover:bg-[#B38F48] rounded-[6px] shadow-xs transition-colors self-start md:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Dataset</span>
          </button>
        </div>
      </div>

      {/* Statistical Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-[8px] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA]">
            Month Records
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#111113] dark:text-[#FAF8F5]">
            {stats.total} / {daysInMonth}
          </div>
          <div className="text-[10px] text-[#71717A] dark:text-[#A1A1AA]">
            Published entries in {MONTHS[selectedMonth - 1]?.name}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-[8px] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA]">
            Latest Result
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#C5A059]">
            {stats.latestResult}
          </div>
          <div className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] truncate">
            {stats.latestDate ? `Date: ${stats.latestDate}` : 'Awaiting publication'}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-[8px] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA]">
            Most Frequent
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#16A34A] dark:text-[#4ADE80]">
            {stats.mostFrequent}
          </div>
          <div className="text-[10px] text-[#71717A] dark:text-[#A1A1AA]">
            Repeated {stats.mostFrequentCount} times
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-[8px] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA]">
            Release Time
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#111113] dark:text-[#FAF8F5]">
            {game.resultTime}
          </div>
          <div className="text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Active Schedule
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="h-11 min-h-[44px] px-3 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#111113] dark:text-[#FAF8F5] font-bold text-xs"
          >
            {MONTHS.map((m) => (
              <option key={m.num} value={m.num}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="h-11 min-h-[44px] px-3 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#111113] dark:text-[#FAF8F5] font-bold text-xs"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[6px] w-full sm:w-auto justify-center">
          <button
            onClick={() => setViewMode('calendar')}
            className={`h-9 px-3 min-h-[36px] flex items-center gap-1.5 text-xs font-bold rounded-[4px] transition-colors ${
              viewMode === 'calendar'
                ? 'bg-[#C5A059] text-[#111113] shadow-xs'
                : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#C5A059]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Grid</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`h-9 px-3 min-h-[36px] flex items-center gap-1.5 text-xs font-bold rounded-[4px] transition-colors ${
              viewMode === 'table'
                ? 'bg-[#C5A059] text-[#111113] shadow-xs'
                : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#C5A059]'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>List Table</span>
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] font-bold">
            Loading chart dataset...
          </div>
        ) : viewMode === 'calendar' ? (
          /* Day 1 to 31 Grid */
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D5] dark:border-[#2E2E33] text-xs">
              <span className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                {MONTHS[selectedMonth - 1]?.name} {selectedYear} Day-by-Day Results
              </span>
              <span className="text-[11px] text-[#71717A] font-mono">
                {stats.total} Published Records
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const val = dayMap[day];
                const hasVal = Boolean(val);
                return (
                  <div
                    key={day}
                    className={`p-3 rounded-[8px] border text-center transition-all ${
                      hasVal
                        ? 'bg-[#FAF8F5] dark:bg-[#18181B] border-[#EAE3D5] dark:border-[#2E2E33] hover:border-[#C5A059]'
                        : 'bg-transparent border-dashed border-[#EAE3D5] dark:border-[#2E2E33] opacity-60'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA]">
                      Day {String(day).padStart(2, '0')}
                    </div>
                    <div
                      className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
                        hasVal ? 'text-[#C5A059]' : 'text-[#D4CEBF] dark:text-[#3F3F46]'
                      }`}
                    >
                      {hasVal ? val : '--'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Detailed List Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EAE3D5] dark:border-[#2E2E33] bg-[#FAF8F5] dark:bg-[#18181B] text-[#71717A] dark:text-[#A1A1AA] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Game</th>
                  <th className="py-3 px-4">Scheduled Time</th>
                  <th className="py-3 px-4 text-center">Result</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
                {chartData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#71717A] text-xs">
                      No published results available for this selection.
                    </td>
                  </tr>
                ) : (
                  chartData.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-[#FAF8F5]/80 dark:hover:bg-[#18181B]/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#111113] dark:text-[#FAF8F5]">
                        {r.resultDate}
                      </td>
                      <td className="py-3 px-4 text-[#111113] dark:text-[#FAF8F5] font-semibold">
                        {game.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#71717A] dark:text-[#A1A1AA]">
                        {r.resultTime}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-base text-[#C5A059]">
                        {r.resultValue}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-[#16A34A]/10 text-[#16A34A] dark:text-[#4ADE80] font-bold text-[10px]">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
