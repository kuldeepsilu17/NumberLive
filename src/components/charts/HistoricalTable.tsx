'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  Archive,
  ArrowRight,
} from 'lucide-react';
import { formatReadableDate } from '@/lib/utils';
import { Game } from '@/types';

interface HistoricalTableProps {
  games?: Game[] | any[];
  gamesList?: Game[] | any[];
  initialGameSlug?: string;
  initialYear?: number | string;
}

export default function HistoricalTable({
  games = [],
  gamesList = [],
  initialGameSlug = '',
  initialYear = '2026',
}: HistoricalTableProps) {
  const allGames = games.length > 0 ? games : gamesList;
  const [gameOptions, setGameOptions] = useState<any[]>(allGames);
  const [selectedGame, setSelectedGame] = useState<string>(initialGameSlug);
  const [selectedYear, setSelectedYear] = useState<string>(String(initialYear || '2026'));
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    if (gameOptions.length === 0) {
      fetch('/api/games')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.games) {
            setGameOptions(data.games);
          }
        })
        .catch((e) => console.error('Error fetching games:', e));
    }
  }, [gameOptions.length]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGame) params.set('game', selectedGame);
      if (selectedYear) params.set('year', selectedYear);
      if (selectedMonth) params.set('month', selectedMonth);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/results?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedGame, selectedYear, selectedMonth, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const displayedResults = results.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.resultValue.includes(q) ||
      r.resultDate.includes(q) ||
      (r.game?.name && r.game.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden space-y-0">
      {/* Clean Section Title */}
      <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059] flex items-center gap-1.5">
            <Archive className="w-4 h-4 text-[#C5A059]" />
            <span>SEARCHABLE ARCHIVES</span>
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-[#111113] dark:text-[#FAF8F5] uppercase mt-0.5">
            HISTORICAL RESULT ARCHIVES ({totalCount} RECORDS)
          </h2>
        </div>

        <a
          href={`/api/export-csv?year=${selectedYear}${selectedMonth ? `&month=${selectedMonth}` : ''}${selectedGame ? `&game=${selectedGame}` : ''}`}
          download
          className="btn-primary w-full sm:w-auto text-xs sm:text-sm font-bold shadow-xs inline-flex items-center justify-center gap-1.5"
        >
          <Download className="w-4 h-4 text-[#C5A059]" />
          <span>Export CSV</span>
        </a>
      </div>

      {/* Filter Controls Toolbar */}
      <div className="p-3.5 sm:p-4 bg-[#FAF8F5] dark:bg-[#18181B] border-b border-[#EAE3D5] dark:border-[#2E2E33] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Game filter */}
        <div>
          <label className="block text-[11px] font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
            Game Name
          </label>
          <select
            value={selectedGame}
            onChange={(e) => {
              setSelectedGame(e.target.value);
              setPage(1);
            }}
            className="form-select text-xs sm:text-sm font-bold"
          >
            <option value="">All Regional Games</option>
            {gameOptions.map((g) => (
              <option key={g.id || g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Month filter */}
        <div>
          <label className="block text-[11px] font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setPage(1);
            }}
            className="form-select text-xs sm:text-sm font-bold"
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>

        {/* Year filter */}
        <div>
          <label className="block text-[11px] font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setPage(1);
            }}
            className="form-select text-xs sm:text-sm font-bold"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="">All Years</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-[11px] font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
            Search Result #
          </label>
          <input
            type="text"
            placeholder="e.g. 67"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input text-xs sm:text-sm font-bold"
          />
        </div>
      </div>

      {/* Desktop Table View (md+ screens) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="results-table">
          <thead>
            <tr>
              <th className="w-1/6">Date</th>
              <th className="w-1/4">Game Name</th>
              <th className="w-1/6 text-center">Result</th>
              <th className="w-1/6">Result Time</th>
              <th className="w-1/6">Status</th>
              <th className="w-1/12 text-right">Chart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#71717A] text-xs">
                  Loading records...
                </td>
              </tr>
            ) : displayedResults.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#71717A] text-xs">
                  No records found matching your filter.
                </td>
              </tr>
            ) : (
              displayedResults.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] transition-colors"
                >
                  <td className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                    {formatReadableDate(item.resultDate)}
                  </td>
                  <td>
                    <Link
                      href={`/games/${item.game?.slug}`}
                      className="font-bold text-[#111113] dark:text-[#FAF8F5] hover:text-[#C5A059] transition-colors uppercase text-xs sm:text-sm"
                    >
                      {item.game?.name || 'Game'}
                    </Link>
                  </td>
                  <td className="text-center">
                    <span className="font-black text-base text-[#111113] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B] px-3 py-0.5 rounded-[4px] border border-[#EAE3D5] dark:border-[#2E2E33]">
                      {item.resultValue}
                    </span>
                  </td>
                  <td className="text-[#71717A] dark:text-[#A1A1AA]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#8C8275]" />
                      <span>{item.resultTime}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-live">
                      {item.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/charts/${item.game?.slug}`}
                      className="text-[#111113] dark:text-[#FAF8F5] hover:text-[#C5A059] hover:underline font-bold text-xs inline-flex items-center gap-1 py-1"
                    >
                      <span>Chart</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (< md screens) */}
      <div className="md:hidden p-3.5 space-y-3">
        {loading ? (
          <div className="py-8 text-center text-[#71717A] text-xs">
            Loading archive records...
          </div>
        ) : displayedResults.length === 0 ? (
          <div className="py-8 text-center text-[#71717A] text-xs">
            No records found.
          </div>
        ) : (
          displayedResults.map((item) => (
            <Link
              key={item.id}
              href={`/games/${item.game?.slug}`}
              className="block bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] hover:border-[#C5A059] rounded-[8px] p-3.5 shadow-subtle transition-all active:scale-[0.99] group"
            >
              <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2">
                <span className="font-black text-xs uppercase text-[#111113] dark:text-[#FAF8F5] group-hover:text-[#C5A059]">
                  {item.game?.name}
                </span>
                <span className="badge-live">
                  {item.status}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div className="space-y-1 text-xs text-[#71717A] dark:text-[#A1A1AA]">
                  <div className="font-semibold text-[#111113] dark:text-[#FAF8F5]">
                    {formatReadableDate(item.resultDate)}
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-[#8C8275]" /> {item.resultTime}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block text-xl font-black text-[#FAF8F5] bg-[#111113] dark:bg-[#18181B] border border-[#2E2E33] px-3.5 py-1 rounded-[6px] shadow-xs">
                    {item.resultValue}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-between text-xs font-bold text-[#C5A059]">
                <span className="text-[11px] text-[#71717A] font-normal">View game charts</span>
                <span className="inline-flex items-center gap-1">
                  <span>Open Chart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#111113] border-t border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-between text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA] font-bold">
        <div className="text-xs sm:text-sm">
          Page <span className="text-[#111113] dark:text-[#FAF8F5]">{page}</span> of {totalPages}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="min-h-[44px] px-3 sm:px-4 rounded-[6px] border border-[#EAE3D5] dark:border-[#2E2E33] bg-white dark:bg-[#18181B] text-[#111113] dark:text-[#FAF8F5] disabled:opacity-40 hover:bg-[#FAF8F5] text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="min-h-[44px] px-3 sm:px-4 rounded-[6px] border border-[#EAE3D5] dark:border-[#2E2E33] bg-white dark:bg-[#18181B] text-[#111113] dark:text-[#FAF8F5] disabled:opacity-40 hover:bg-[#FAF8F5] text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5"
            aria-label="Next Page"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
