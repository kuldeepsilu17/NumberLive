'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Edit,
  Eye,
} from 'lucide-react';

interface HistoryResult {
  id: string;
  gameId: string;
  resultDate: string;
  resultValue: string;
  resultTime: string;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  game: {
    id: string;
    name: string;
    slug: string;
    resultTime: string;
    category?: {
      name: string;
    };
  };
}

export default function OwnerHistoryPage() {
  const [results, setResults] = useState<HistoryResult[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [numberQuery, setNumberQuery] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch('/api/games?all=true');
        if (res.ok) {
          const data = await res.json();
          setGames(data.games || []);
        }
      } catch (e) {
        console.error('Failed to load games:', e);
      }
    }
    loadGames();
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '30');
      if (selectedGame) params.set('game', selectedGame);
      if (selectedYear) params.set('year', selectedYear);
      if (selectedMonth) params.set('month', selectedMonth);
      if (selectedStatus && selectedStatus !== 'ALL') params.set('status', selectedStatus);

      const res = await fetch(`/api/results?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      }
    } catch (e) {
      console.error('Failed to fetch historical records:', e);
    } finally {
      setLoading(false);
    }
  }, [page, selectedGame, selectedYear, selectedMonth, selectedStatus]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleExportCSV = () => {
    setExporting(true);
    try {
      const headers = ['Game Name', 'Date', 'Outcome Number', 'Status', 'Scheduled Time', 'Last Updated'];
      const rows = results.map((r) => [
        `"${r.game.name}"`,
        r.resultDate,
        `"${r.resultValue}"`,
        r.status,
        `"${r.resultTime || r.game.resultTime}"`,
        `"${new Date(r.updatedAt).toISOString()}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `NumberLive_Historical_Records_${selectedYear || 'all'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export error:', e);
    } finally {
      setExporting(false);
    }
  };

  const filteredResults = results.filter((r) => {
    if (!numberQuery) return true;
    return r.resultValue.includes(numberQuery) || r.resultDate.includes(numberQuery);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">
            DATABASE ARCHIVE
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
            Historical Records Explorer
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Query, filter, inspect, and export multi-year archived datasets. Filtered total: {totalCount}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            className="flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-[6px] text-xs font-bold bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] hover:text-[#C5A059] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C5A059]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={exporting || results.length === 0}
            className="flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-[6px] text-xs font-black uppercase tracking-wider text-black bg-[#C5A059] hover:bg-[#B38F46] transition-all shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Card */}
      <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-4 shadow-subtle space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Year */}
          <div>
            <label className="text-[10px] font-bold uppercase text-[#8C8275] block mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[38px] px-2.5 py-1.5 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="text-[10px] font-bold uppercase text-[#8C8275] block mb-1">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[38px] px-2.5 py-1.5 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }).map((_, idx) => (
                <option key={idx + 1} value={String(idx + 1)}>
                  {new Date(2026, idx).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          {/* Game */}
          <div>
            <label className="text-[10px] font-bold uppercase text-[#8C8275] block mb-1">
              Monitored Game
            </label>
            <select
              value={selectedGame}
              onChange={(e) => {
                setSelectedGame(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[38px] px-2.5 py-1.5 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="">All Games</option>
              {games.map((g) => (
                <option key={g.id} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-bold uppercase text-[#8C8275] block mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[38px] px-2.5 py-1.5 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Number Search */}
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[10px] font-bold uppercase text-[#8C8275] block mb-1">
              Find Number
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C8275] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={numberQuery}
                onChange={(e) => setNumberQuery(e.target.value)}
                placeholder="e.g. 89"
                className="w-full min-h-[38px] pl-8 pr-2 py-1.5 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* History Records Table */}
      <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] animate-pulse space-y-2">
            <div className="inline-block w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
            <div>Querying historical database...</div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <History className="w-8 h-8 text-[#8C8275] mx-auto opacity-60" />
            <h4 className="text-sm font-bold text-[#111113] dark:text-[#FAF8F5]">
              No Historical Records Found
            </h4>
            <p className="text-xs text-[#71717A]">
              Try adjusting your year, month, or game filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] dark:bg-[#1C1C20] border-b border-[#EAE3D5] dark:border-[#2E2E33] text-[10px] font-black uppercase text-[#8C8275] dark:text-[#A1A1AA]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Game</th>
                    <th className="py-3 px-4 text-center">Outcome</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Release Time</th>
                    <th className="py-3 px-4">Audit Timestamp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
                  {filteredResults.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-[#FAF8F5]/60 dark:hover:bg-[#1C1C20]/60 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#111113] dark:text-[#FAF8F5]">
                        {r.resultDate}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                          {r.game.name}
                        </span>
                        <span className="text-[10px] text-[#8C8275] block">
                          {r.game.category?.name || 'Main'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-[5px] text-base font-black tabular-nums bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#059669] dark:text-[#34D399]">
                          {r.resultValue.padStart(2, '0')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                            r.status === 'PUBLISHED'
                              ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                              : r.status === 'DRAFT'
                              ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                              : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[#71717A]">
                        {r.resultTime || r.game.resultTime}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-[#8C8275]">
                        {new Date(r.updatedAt).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/owner/results/${r.id}/edit`}
                          className="text-xs font-bold text-[#C5A059] hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1C20] border-t border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-between text-xs">
                <span className="text-[#71717A] dark:text-[#A1A1AA]">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded border border-[#EAE3D5] dark:border-[#2E2E33] bg-white dark:bg-[#151518] disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded border border-[#EAE3D5] dark:border-[#2E2E33] bg-white dark:bg-[#151518] disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
