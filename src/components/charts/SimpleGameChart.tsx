'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Clock, ArrowLeft, Download } from 'lucide-react';
import Papa from 'papaparse';

interface GameInfo {
  id: string;
  name: string;
  slug: string;
  resultTime: string;
  description?: string;
}

interface SimpleGameChartProps {
  game: GameInfo;
  initialYear?: number;
  initialMonth?: number;
}

const MONTHS = [
  { num: 1, name: 'Jan', fullName: 'January' },
  { num: 2, name: 'Feb', fullName: 'February' },
  { num: 3, name: 'Mar', fullName: 'March' },
  { num: 4, name: 'Apr', fullName: 'April' },
  { num: 5, name: 'May', fullName: 'May' },
  { num: 6, name: 'Jun', fullName: 'June' },
  { num: 7, name: 'Jul', fullName: 'July' },
  { num: 8, name: 'Aug', fullName: 'August' },
  { num: 9, name: 'Sep', fullName: 'September' },
  { num: 10, name: 'Oct', fullName: 'October' },
  { num: 11, name: 'Nov', fullName: 'November' },
  { num: 12, name: 'Dec', fullName: 'December' },
];

const YEARS = [2026, 2025, 2024, 2023];

export default function SimpleGameChart({
  game,
  initialYear = 2026,
  initialMonth = 9,
}: SimpleGameChartProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [resultsByDay, setResultsByDay] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchChartData = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/results?view=game_chart&game=${encodeURIComponent(game.slug)}&year=${year}&month=${month}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        const dayMap: Record<number, string> = {};
        data.results.forEach((r: any) => {
          const parts = r.resultDate.split('-');
          const dayNum = parseInt(parts[2], 10);
          if (dayNum) {
            dayMap[dayNum] = r.resultValue;
          }
        });
        setResultsByDay(dayMap);
      } else {
        setResultsByDay({});
      }
    } catch (err) {
      console.error('Error fetching game chart:', err);
      setResultsByDay({});
    } finally {
      setLoading(false);
    }
  }, [game.slug]);

  useEffect(() => {
    fetchChartData(selectedYear, selectedMonth);
  }, [fetchChartData, selectedYear, selectedMonth]);

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayRows = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const currentMonthName = MONTHS.find((m) => m.num === selectedMonth)?.fullName || '';

  const handleExportCSV = () => {
    const csvRows = dayRows.map((d) => {
      const paddedDay = String(d).padStart(2, '0');
      const paddedMonth = String(selectedMonth).padStart(2, '0');
      const dateStr = `${selectedYear}-${paddedMonth}-${paddedDay}`;
      return {
        Date: dateStr,
        Day: paddedDay,
        Game: game.name,
        Result: resultsByDay[d] || '--',
      };
    });

    const csvString = Papa.unparse(csvRows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${game.slug}-${selectedYear}-${selectedMonth}-record-chart.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto py-2">
      {/* 1. Header Information Block */}
      <div className="bg-white dark:bg-[#111113] border border-[#E5E5E5] dark:border-[#27272A] rounded-[8px] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/charts"
                className="text-xs font-medium text-[#71717A] hover:text-[#20201E] dark:hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Charts</span>
              </Link>
              <span className="text-[#A1A1AA] text-xs">/</span>
              <span className="text-xs font-semibold text-[#71717A] uppercase">{game.name}</span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold uppercase text-[#20201E] dark:text-[#FAF8F5] tracking-tight">
              Record Chart &mdash; {game.name}
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-[#71717A]" />
              <span>Official Result Time: {game.resultTime}</span>
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 h-[34px] px-3 text-xs font-semibold text-[#20201E] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B] hover:bg-[#F4EFE6] dark:hover:bg-[#222226] border border-[#E5E5E5] dark:border-[#27272A] rounded-[6px] transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Selectors: Year & Month */}
      <div className="bg-white dark:bg-[#111113] border border-[#E5E5E5] dark:border-[#27272A] rounded-[8px] p-3 sm:p-4 shadow-xs space-y-3">
        {/* Year Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase text-[#71717A] dark:text-[#A1A1AA] min-w-[50px]">
            Year:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1 text-xs font-semibold rounded-[6px] transition-colors ${
                  selectedYear === y
                    ? 'bg-[#20201E] dark:bg-[#FAF8F5] text-white dark:text-[#20201E]'
                    : 'bg-[#FAF8F5] dark:bg-[#18181B] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#20201E] dark:hover:text-white border border-[#E5E5E5] dark:border-[#27272A]'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#E5E5E5] dark:border-[#27272A]">
          <span className="text-xs font-bold uppercase text-[#71717A] dark:text-[#A1A1AA] min-w-[50px]">
            Month:
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {MONTHS.map((m) => (
              <button
                key={m.num}
                onClick={() => setSelectedMonth(m.num)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-[6px] transition-colors ${
                  selectedMonth === m.num
                    ? 'bg-[#20201E] dark:bg-[#FAF8F5] text-white dark:text-[#20201E]'
                    : 'bg-[#FAF8F5] dark:bg-[#18181B] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#20201E] dark:hover:text-white border border-[#E5E5E5] dark:border-[#27272A]'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Professional Archive Table: Date | Result */}
      <div className="bg-white dark:bg-[#111113] rounded-[8px] border border-[#E5E5E5] dark:border-[#27272A] shadow-xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="bg-[#FAF8F5] dark:bg-[#18181B] border-b border-[#E5E5E5] dark:border-[#27272A] px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#20201E] dark:text-[#FAF8F5]">
            {game.name} &mdash; {currentMonthName} {selectedYear}
          </span>
          <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
            {daysInMonth} Days
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Loading records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] dark:bg-[#18181B] border-b border-[#E5E5E5] dark:border-[#27272A] text-[11px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA]">
                  <th className="py-2.5 px-4 w-1/2 text-center border-r border-[#E5E5E5] dark:border-[#27272A]">
                    DATE
                  </th>
                  <th className="py-2.5 px-4 w-1/2 text-center">RESULT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#27272A] text-xs">
                {dayRows.map((dayNum) => {
                  const paddedDay = String(dayNum).padStart(2, '0');
                  const resultVal = resultsByDay[dayNum];
                  const hasResult = Boolean(resultVal && resultVal !== '--');

                  return (
                    <tr
                      key={dayNum}
                      className="hover:bg-[#FAF8F5]/60 dark:hover:bg-[#18181B] transition-colors"
                    >
                      <td className="py-2.5 px-4 border-r border-[#E5E5E5] dark:border-[#27272A] text-[#52525B] dark:text-[#A1A1AA] font-medium">
                        {paddedDay} {MONTHS.find((m) => m.num === selectedMonth)?.name}
                      </td>
                      <td className="py-2.5 px-4">
                        {hasResult ? (
                          <span className="text-[20px] font-bold text-[#20201E] dark:text-[#FAF8F5] tabular-nums">
                            {resultVal}
                          </span>
                        ) : (
                          <span className="text-[#A1A1AA] dark:text-[#52525B] font-medium">
                            --
                          </span>
                        )}
                      </td>
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
