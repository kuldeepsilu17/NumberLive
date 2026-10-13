'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Archive,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import ConfirmationModal from '@/components/owner/ConfirmationModal';

interface ResultItem {
  id: string;
  gameId: string;
  resultDate: string;
  resultValue: string;
  resultTime: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
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

export default function OwnerResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Confirmation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<{
    type: 'DELETE' | 'PUBLISH' | 'DRAFT' | 'ARCHIVE';
    resultId: string;
    gameName: string;
    date: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Fetch games for filter dropdown
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

  // Fetch results based on filters & pagination
  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '25');
      if (selectedStatus && selectedStatus !== 'ALL') {
        params.set('status', selectedStatus);
      }
      if (selectedGame) {
        params.set('game', selectedGame);
      }
      if (selectedDate) {
        params.set('date', selectedDate);
      }

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
      console.error('Failed to load results:', e);
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, selectedGame, selectedDate]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleExecuteModalAction = async () => {
    if (!modalAction) return;
    setIsProcessing(true);

    try {
      if (modalAction.type === 'DELETE') {
        const res = await fetch(`/api/results?id=${modalAction.resultId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setActionNotice(`Deleted result record for ${modalAction.gameName} (${modalAction.date})`);
        }
      } else {
        const targetStatus = modalAction.type; // PUBLISHED, DRAFT, ARCHIVED
        const res = await fetch('/api/results', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: modalAction.resultId,
            status: targetStatus,
            reasonNote: `Changed status to ${targetStatus} via Owner Results Workflow`,
          }),
        });
        if (res.ok) {
          setActionNotice(`Updated ${modalAction.gameName} to ${targetStatus}`);
        }
      }

      setTimeout(() => setActionNotice(null), 3500);
      setModalOpen(false);
      setModalAction(null);
      await fetchResults();
    } catch (e) {
      console.error('Action error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter client-side search query if user typed number or name
  const filteredResults = results.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.game.name.toLowerCase().includes(q) ||
      r.resultValue.includes(q) ||
      r.resultDate.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
         1. HEADER & ACTIONS
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">
            OFFICIAL LEDGER
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
            Results Workflow
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Manage drafts, publish verified numbers, or archive historical records. Total records: {totalCount}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchResults}
            className="flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-[6px] text-xs font-bold bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] hover:text-[#C5A059] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C5A059]' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/owner/results/new"
            className="flex items-center gap-1.5 min-h-[38px] px-4 py-1.5 rounded-[6px] text-xs font-black uppercase tracking-wider text-black bg-[#C5A059] hover:bg-[#B38F46] transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Result</span>
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-[8px] bg-[#ECFDF5] dark:bg-[#062D20] border border-[#A7F3D0] dark:border-[#065F46] text-xs text-[#047857] dark:text-[#6EE7B7] flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         2. FILTER BAR & STATUS TABS
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-4 shadow-subtle space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-3">
          {[
            { label: 'All Statuses', value: 'ALL' },
            { label: 'Published (Public)', value: 'PUBLISHED' },
            { label: 'Drafts (Private)', value: 'DRAFT' },
            { label: 'Archived', value: 'ARCHIVED' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setSelectedStatus(tab.value);
                setPage(1);
              }}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-[6px] text-xs font-bold whitespace-nowrap transition-colors ${
                selectedStatus === tab.value
                  ? 'bg-[#111113] text-[#C5A059] border border-[#C5A059] shadow-xs'
                  : 'bg-[#FAF8F5] dark:bg-[#1C1C20] text-[#5C5449] dark:text-[#D4D4D8] border border-[#EAE3D5] dark:border-[#2E2E33] hover:text-[#111113]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Controls: Search, Game Selector, Date Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C8275] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search game, number (e.g. 42)..."
              className="w-full min-h-[40px] pl-9 pr-3 py-1.5 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Game Dropdown */}
          <div>
            <select
              value={selectedGame}
              onChange={(e) => {
                setSelectedGame(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[40px] px-3 py-1.5 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="">All Monitored Games</option>
              {games.map((g) => (
                <option key={g.id} value={g.slug}>
                  {g.name} ({g.resultTime})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[40px] px-3 py-1.5 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
            />
            {selectedDate && (
              <button
                onClick={() => {
                  setSelectedDate('');
                  setPage(1);
                }}
                className="text-xs text-[#DC2626] font-bold shrink-0 hover:underline px-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         3. RESULTS TABLE & RESPONSIVE CARDS
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] animate-pulse space-y-2">
            <div className="inline-block w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
            <div>Loading verified results database...</div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-[#8C8275] mx-auto opacity-60" />
            <h4 className="text-sm font-black text-[#111113] dark:text-[#FAF8F5]">
              No results found
            </h4>
            <p className="text-xs text-[#71717A] max-w-sm mx-auto">
              No result records match your selected status, game, or date filter.
            </p>
            <Link
              href="/owner/results/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C5A059] hover:underline"
            >
              + Create New Result Entry
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] dark:bg-[#1C1C20] border-b border-[#EAE3D5] dark:border-[#2E2E33] text-[10px] font-black uppercase text-[#8C8275] dark:text-[#A1A1AA] tracking-wider">
                    <th className="py-3 px-4">Game</th>
                    <th className="py-3 px-4">Result Date</th>
                    <th className="py-3 px-4 text-center">Outcome</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Schedule Time</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
                  {filteredResults.map((item) => {
                    const isPublished = item.status === 'PUBLISHED';
                    const isDraft = item.status === 'DRAFT';
                    const isArchived = item.status === 'ARCHIVED';

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-[#FAF8F5]/60 dark:hover:bg-[#1C1C20]/60 transition-colors"
                      >
                        <td className="py-3 px-4 font-bold text-[#111113] dark:text-[#FAF8F5]">
                          <div>{item.game.name}</div>
                          <div className="text-[10px] font-normal text-[#8C8275]">
                            {item.game.category?.name || 'General'}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#5C5449] dark:text-[#D4D4D8] font-mono">
                          {item.resultDate}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-[6px] text-base font-black tabular-nums ${
                              isPublished
                                ? 'bg-[#ECFDF5] text-[#059669] dark:bg-[#064E3B]/40 dark:text-[#34D399]'
                                : isDraft
                                ? 'bg-[#FFFBEB] text-[#D97706] dark:bg-[#78350F]/40 dark:text-[#FBBF24]'
                                : 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#1E293B]'
                            }`}
                          >
                            {item.resultValue.padStart(2, '0')}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center text-[10px] font-black uppercase px-2 py-0.5 rounded-[4px] border ${
                              isPublished
                                ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#064E3B]/30 dark:border-[#059669]'
                                : isDraft
                                ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] dark:bg-[#78350F]/30 dark:border-[#D97706]'
                                : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1] dark:bg-[#1E293B] dark:border-[#475569]'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-[#71717A] dark:text-[#A1A1AA]">
                          {item.resultTime || item.game.resultTime}
                        </td>

                        <td className="py-3 px-4 text-[11px] text-[#8C8275] dark:text-[#71717A]">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Publish / Draft Toggle */}
                            {isDraft ? (
                              <button
                                onClick={() => {
                                  setModalAction({
                                    type: 'PUBLISH',
                                    resultId: item.id,
                                    gameName: item.game.name,
                                    date: item.resultDate,
                                  });
                                  setModalOpen(true);
                                }}
                                className="min-h-[30px] px-2 py-1 rounded bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] text-[11px] font-bold transition-colors"
                                title="Publish to public visitors"
                              >
                                Publish
                              </button>
                            ) : isPublished ? (
                              <button
                                onClick={() => {
                                  setModalAction({
                                    type: 'DRAFT',
                                    resultId: item.id,
                                    gameName: item.game.name,
                                    date: item.resultDate,
                                  });
                                  setModalOpen(true);
                                }}
                                className="min-h-[30px] px-2 py-1 rounded bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7] text-[11px] font-bold transition-colors"
                                title="Unpublish / Set to Draft"
                              >
                                Unpublish
                              </button>
                            ) : null}

                            {/* Edit Button */}
                            <Link
                              href={`/owner/results/${item.id}/edit`}
                              className="p-1.5 rounded text-[#71717A] hover:text-[#111113] dark:hover:text-white hover:bg-[#FAF8F5] dark:hover:bg-[#1C1C20] transition-colors"
                              title="Edit Result"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* Archive Button */}
                            {!isArchived && (
                              <button
                                onClick={() => {
                                  setModalAction({
                                    type: 'ARCHIVE',
                                    resultId: item.id,
                                    gameName: item.game.name,
                                    date: item.resultDate,
                                  });
                                  setModalOpen(true);
                                }}
                                className="p-1.5 rounded text-[#71717A] hover:text-[#D97706] hover:bg-[#FAF8F5] dark:hover:bg-[#1C1C20] transition-colors"
                                title="Archive Result"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                setModalAction({
                                  type: 'DELETE',
                                  resultId: item.id,
                                  gameName: item.game.name,
                                  date: item.resultDate,
                                });
                                setModalOpen(true);
                              }}
                              className="p-1.5 rounded text-[#71717A] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#2A1515] transition-colors"
                              title="Delete Result"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< md screens) */}
            <div className="md:hidden divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
              {filteredResults.map((item) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-[#8C8275]">
                        {item.game.category?.name || 'General'}
                      </div>
                      <h4 className="text-sm font-black text-[#111113] dark:text-[#FAF8F5]">
                        {item.game.name}
                      </h4>
                      <div className="text-xs text-[#71717A] font-mono mt-0.5">
                        {item.resultDate} • {item.resultTime || item.game.resultTime}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-[6px] text-xl font-black tabular-nums ${
                          item.status === 'PUBLISHED'
                            ? 'bg-[#ECFDF5] text-[#059669]'
                            : item.status === 'DRAFT'
                            ? 'bg-[#FFFBEB] text-[#D97706]'
                            : 'bg-[#F1F5F9] text-[#64748B]'
                        }`}
                      >
                        {item.resultValue.padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EAE3D5] dark:border-[#2E2E33] text-xs">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-[4px] border ${
                        item.status === 'PUBLISHED'
                          ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                          : item.status === 'DRAFT'
                          ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                          : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]'
                      }`}
                    >
                      {item.status}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.status === 'DRAFT' ? (
                        <button
                          onClick={() => {
                            setModalAction({
                              type: 'PUBLISH',
                              resultId: item.id,
                              gameName: item.game.name,
                              date: item.resultDate,
                            });
                            setModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-[#ECFDF5] text-[#059669] text-xs font-bold"
                        >
                          Publish
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setModalAction({
                              type: 'DRAFT',
                              resultId: item.id,
                              gameName: item.game.name,
                              date: item.resultDate,
                            });
                            setModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-[#FFFBEB] text-[#D97706] text-xs font-bold"
                        >
                          Draft
                        </button>
                      )}

                      <Link
                        href={`/owner/results/${item.id}/edit`}
                        className="px-2.5 py-1 rounded bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] text-xs font-bold"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => {
                          setModalAction({
                            type: 'DELETE',
                            resultId: item.id,
                            gameName: item.game.name,
                            date: item.resultDate,
                          });
                          setModalOpen(true);
                        }}
                        className="p-1 text-[#DC2626]"
                        aria-label="Delete result"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1C20] border-t border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-between text-xs">
                <span className="text-[#71717A] dark:text-[#A1A1AA]">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded border border-[#EAE3D5] dark:border-[#2E2E33] bg-white dark:bg-[#151518] disabled:opacity-40"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded border border-[#EAE3D5] dark:border-[#2E2E33] bg-white dark:bg-[#151518] disabled:opacity-40"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
         4. WORKFLOW CONFIRMATION MODAL
         ───────────────────────────────────────────────────────────── */}
      <ConfirmationModal
        isOpen={modalOpen}
        title={
          modalAction?.type === 'DELETE'
            ? 'Delete Result Record'
            : modalAction?.type === 'PUBLISH'
            ? 'Publish Result to Public'
            : modalAction?.type === 'ARCHIVE'
            ? 'Archive Result Record'
            : 'Unpublish Result Record'
        }
        message={
          modalAction?.type === 'DELETE'
            ? `Are you sure you want to permanently delete the result for ${modalAction?.gameName} on ${modalAction?.date}? This will be recorded in the audit log.`
            : modalAction?.type === 'PUBLISH'
            ? `Publish the official outcome for ${modalAction?.gameName} (${modalAction?.date})? It will become immediately visible to all public visitors.`
            : modalAction?.type === 'ARCHIVE'
            ? `Archive the result for ${modalAction?.gameName} (${modalAction?.date})?`
            : `Set the result for ${modalAction?.gameName} (${modalAction?.date}) back to DRAFT? It will be hidden from public visitors.`
        }
        confirmLabel={
          modalAction?.type === 'DELETE'
            ? 'Delete Record'
            : modalAction?.type === 'PUBLISH'
            ? 'Publish Now'
            : modalAction?.type === 'ARCHIVE'
            ? 'Archive'
            : 'Set to Draft'
        }
        isDestructive={modalAction?.type === 'DELETE'}
        isLoading={isProcessing}
        onConfirm={handleExecuteModalAction}
        onCancel={() => {
          setModalOpen(false);
          setModalAction(null);
        }}
      />
    </div>
  );
}
