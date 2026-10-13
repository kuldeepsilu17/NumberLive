'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CalendarPlus,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  RefreshCw,
  FileCheck2,
  X,
  Eye,
  Archive,
  Trash2,
  Search,
  Filter,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { Game, Result } from '@/types';
import { formatReadableDate } from '@/lib/utils';

function AdminResultsManagementContent() {
  const searchParams = useSearchParams();
  const preselectedGameId = searchParams.get('gameId') || '';

  const [games, setGames] = useState<Game[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingActionId, setSavingActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter states
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>(preselectedGameId);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modals
  const [previewResult, setPreviewResult] = useState<Result | null>(null);
  const [deleteConfirmResult, setDeleteConfirmResult] = useState<Result | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch('/api/games?all=true');
      const data = await res.json();
      if (data.success) {
        setGames(data.games);
      }
    } catch (e) {
      console.error('Failed to load games:', e);
    }
  }, []);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGameFilter) {
        const gameObj = games.find((g) => g.id === selectedGameFilter);
        if (gameObj) params.set('game', gameObj.slug);
      }
      if (statusFilter && statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }
      params.set('page', String(page));
      params.set('limit', '30');

      const res = await fetch(`/api/results?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error('Failed to load results:', e);
      setMessage({ type: 'error', text: 'Failed to load results from server.' });
    } finally {
      setLoading(false);
    }
  }, [selectedGameFilter, statusFilter, page, games]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // 1-Click Publish Action
  const handlePublish = async (r: Result) => {
    setSavingActionId(r.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/results/${r.id}/publish`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Failed to publish result.' });
        return;
      }
      setMessage({
        type: 'success',
        text: `Result (${r.resultValue}) for ${r.game?.name} on ${r.resultDate} is now officially PUBLISHED!`,
      });
      fetchResults();
    } catch (e) {
      setMessage({ type: 'error', text: 'Error executing publication.' });
    } finally {
      setSavingActionId(null);
    }
  };

  // 1-Click Archive Action
  const handleArchive = async (r: Result) => {
    setSavingActionId(r.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/results/${r.id}/archive`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Failed to archive result.' });
        return;
      }
      setMessage({
        type: 'success',
        text: `Result (${r.resultValue}) for ${r.game?.name} archived (removed from public site).`,
      });
      fetchResults();
    } catch (e) {
      setMessage({ type: 'error', text: 'Error executing archiving.' });
    } finally {
      setSavingActionId(null);
    }
  };

  // Delete Action
  const handleDelete = async () => {
    if (!deleteConfirmResult) return;
    setSavingActionId(deleteConfirmResult.id);
    try {
      const res = await fetch(`/api/results/${deleteConfirmResult.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Result record permanently deleted with audit log.' });
        setDeleteConfirmResult(null);
        fetchResults();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete result.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error deleting result.' });
    } finally {
      setSavingActionId(null);
    }
  };

  // Filtered displayed rows
  const displayedResults = results.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    const gameName = String(r.game?.name || '').toLowerCase();
    const date = String(r.resultDate || '').toLowerCase();
    const val = String(r.resultValue || '').toLowerCase();
    return gameName.includes(q) || date.includes(q) || val.includes(q);
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-[#111113] p-4 sm:p-5 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-[#C5A059]" />
            <span>Results Management &amp; Publishing Desk</span>
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            View, draft, preview, publish, and archive official declared numbers with full audit trail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/results/new"
            className="btn-primary text-xs sm:text-sm font-bold min-h-[42px] inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-[#C5A059]" />
            <span>New Result Entry</span>
          </Link>

          <button
            onClick={fetchResults}
            disabled={loading}
            className="btn-secondary text-xs sm:text-sm font-bold min-h-[42px] inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`p-3.5 rounded-[8px] border text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 ${
            message.type === 'success'
              ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A] dark:bg-[#052E16] dark:border-[#166534]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626] dark:bg-[#18181B] dark:border-[#DC2626]/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#16A34A]" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 text-[#DC2626]" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-[#71717A] hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 shadow-subtle grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Game filter */}
        <div>
          <label className="block text-[11px] font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
            Filter Game
          </label>
          <select
            value={selectedGameFilter}
            onChange={(e) => {
              setSelectedGameFilter(e.target.value);
              setPage(1);
            }}
            className="form-select text-xs font-bold"
          >
            <option value="">All Games ({games.length})</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter tabs */}
        <div>
          <label className="block text-[11px] font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="form-select text-xs font-bold"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">PUBLISHED (Live)</option>
            <option value="DRAFT">DRAFT (Pending review)</option>
            <option value="ARCHIVED">ARCHIVED (Hidden)</option>
          </select>
        </div>

        {/* Search filter */}
        <div className="sm:col-span-1 lg:col-span-2">
          <label className="block text-[11px] font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
            Quick Filter
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by number, game name, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input text-xs pl-8 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-3" />
          </div>
        </div>
      </div>

      {/* Result Management Table: Game | Date | Result | Status | Updated | Actions */}
      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden">
        <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-black">
          <span className="flex items-center gap-2 text-[#111113] dark:text-[#FAF8F5] uppercase">
            <FileCheck2 className="w-4 h-4 text-[#C5A059]" />
            <span>OFFICIAL RESULTS RECORDS ({totalCount} TOTAL)</span>
          </span>
          <span className="text-[10px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] px-2.5 py-1 rounded-[4px] font-mono font-bold">
            PAGE {page} OF {totalPages || 1}
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="results-table">
            <thead>
              <tr>
                <th>Game</th>
                <th>Date</th>
                <th className="text-center">Result</th>
                <th>Status</th>
                <th>Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
              {displayedResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-[#71717A]">
                    No results found matching criteria.
                  </td>
                </tr>
              ) : (
                displayedResults.map((r) => {
                  const isBusy = savingActionId === r.id;
                  return (
                    <tr key={r.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] transition-colors">
                      {/* Game */}
                      <td className="font-bold uppercase text-[#111113] dark:text-[#FAF8F5]">
                        <div>{r.game?.name}</div>
                        <span className="text-[10px] text-[#71717A] font-normal">
                          {r.game?.resultTime}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="font-bold text-[#111113] dark:text-[#FAF8F5] text-xs">
                        {formatReadableDate(r.resultDate)}
                      </td>

                      {/* Result */}
                      <td className="text-center">
                        <span className="font-black text-lg text-[#111113] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B] px-3.5 py-1 rounded-[6px] border border-[#EAE3D5] dark:border-[#2E2E33] inline-block min-w-[48px]">
                          {r.resultValue}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge-live ${
                            r.status === 'PUBLISHED'
                              ? ''
                              : r.status === 'DRAFT'
                              ? '!bg-[#FEF3C7] !text-[#D97706] !border-[#FDE68A]'
                              : '!bg-[#FAF8F5] !text-[#71717A] !border-[#EAE3D5]'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      {/* Updated */}
                      <td className="text-xs text-[#71717A]">
                        {r.updatedAt
                          ? new Date(r.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--'}
                        <div className="text-[10px]">
                          {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : ''}
                        </div>
                      </td>

                      {/* Actions: View / Edit / Preview / Publish / Archive */}
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Preview / View Modal */}
                          <button
                            type="button"
                            onClick={() => setPreviewResult(r)}
                            title="Preview Public Card"
                            className="btn-secondary !min-h-[32px] !px-2.5 text-xs font-bold"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>Preview</span>
                          </button>

                          {/* Edit / Correct Page */}
                          <Link
                            href={`/admin/results/${r.id}/edit`}
                            title="Edit Result"
                            className="btn-secondary !min-h-[32px] !px-2.5 text-xs font-bold inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Link>

                          {/* 1-Click Publish */}
                          {r.status !== 'PUBLISHED' && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handlePublish(r)}
                              title="Publish Live"
                              className="btn-primary !min-h-[32px] !px-2.5 text-xs font-bold inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Publish</span>
                            </button>
                          )}

                          {/* 1-Click Archive */}
                          {r.status !== 'ARCHIVED' && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleArchive(r)}
                              title="Archive (Hide from public)"
                              className="btn-secondary !min-h-[32px] !px-2 text-xs font-bold inline-flex items-center gap-1 text-[#71717A]"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              <span>Archive</span>
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmResult(r)}
                            title="Delete"
                            className="btn-secondary !min-h-[32px] !px-2 text-xs font-bold text-[#DC2626] hover:bg-[#FEF2F2]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card List */}
        <div className="lg:hidden p-3.5 space-y-3">
          {displayedResults.map((r) => (
            <div
              key={r.id}
              className="bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[8px] p-3.5 space-y-3 shadow-subtle"
            >
              <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2">
                <div>
                  <span className="font-black text-xs uppercase text-[#111113] dark:text-[#FAF8F5] block">
                    {r.game?.name}
                  </span>
                  <span className="text-[10px] text-[#71717A]">{formatReadableDate(r.resultDate)}</span>
                </div>
                <span
                  className={`badge-live ${
                    r.status === 'PUBLISHED'
                      ? ''
                      : r.status === 'DRAFT'
                      ? '!bg-[#FEF3C7] !text-[#D97706] !border-[#FDE68A]'
                      : '!bg-[#FAF8F5] !text-[#71717A] !border-[#EAE3D5]'
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-[#71717A]">
                  <div>Declared at: {r.resultTime}</div>
                  <div className="text-[10px]">
                    Updated: {r.updatedAt ? new Date(r.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                  </div>
                </div>

                <span className="font-black text-2xl text-[#111113] dark:text-[#FAF8F5] bg-white dark:bg-[#111113] border border-[#2E2E33] px-3.5 py-1 rounded-[6px] shadow-xs">
                  {r.resultValue}
                </span>
              </div>

              {/* Action Toolbar on Mobile */}
              <div className="pt-2 border-t border-[#EAE3D5] dark:border-[#2E2E33] grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewResult(r)}
                  className="btn-secondary w-full text-xs font-bold inline-flex items-center justify-center gap-1 min-h-[38px]"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Preview</span>
                </button>

                <Link
                  href={`/admin/results/${r.id}/edit`}
                  className="btn-secondary w-full text-xs font-bold inline-flex items-center justify-center gap-1 min-h-[38px]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>

                {r.status !== 'PUBLISHED' && (
                  <button
                    type="button"
                    onClick={() => handlePublish(r)}
                    className="btn-primary w-full text-xs font-bold inline-flex items-center justify-center gap-1 min-h-[38px] col-span-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Publish Live</span>
                  </button>
                )}

                {r.status === 'PUBLISHED' && (
                  <button
                    type="button"
                    onClick={() => handleArchive(r)}
                    className="btn-secondary w-full text-xs font-bold inline-flex items-center justify-center gap-1 min-h-[38px] col-span-2 text-[#71717A]"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive (Hide)</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-between text-xs font-bold">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn-secondary min-h-[36px] px-3"
            >
              Previous
            </button>
            <span className="text-[#71717A]">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary min-h-[36px] px-3"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewResult(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-5 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'calc(100% - 32px)' }}
          >
            <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2 text-left">
              <span className="text-xs font-black uppercase">Public Scoreboard Preview</span>
              <button onClick={() => setPreviewResult(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF8F5] dark:bg-[#18181B] rounded-[8px] border-2 border-[#C5A059] space-y-2">
              <div className="text-[10px] font-bold uppercase text-[#C5A059]">OFFICIAL RECORD</div>
              <h4 className="text-base font-black uppercase text-[#111113] dark:text-[#FAF8F5]">
                {previewResult.game?.name}
              </h4>
              <div className="text-xs text-[#71717A]">
                Date: {formatReadableDate(previewResult.resultDate)} • Declared at: {previewResult.resultTime}
              </div>

              <div className="py-2">
                <span className="inline-block font-black text-5xl text-[#111113] dark:text-[#FAF8F5] bg-white dark:bg-[#111113] px-6 py-2 rounded-[8px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-inner">
                  {previewResult.resultValue}
                </span>
              </div>

              <span className="badge-live inline-block">{previewResult.status}</span>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Link
                href={`/admin/results/${previewResult.id}/edit`}
                className="btn-primary w-full text-xs font-bold uppercase tracking-wider"
              >
                Open Edit Desk
              </Link>
              <button
                type="button"
                onClick={() => setPreviewResult(null)}
                className="btn-secondary w-full text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirmResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-xs animate-in fade-in"
          onClick={() => setDeleteConfirmResult(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#111113] border border-[#DC2626]/40 rounded-[9px] p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'calc(100% - 32px)' }}
          >
            <div className="flex items-center gap-2 text-[#DC2626]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-[#5C5449] dark:text-[#D4D4D8] leading-relaxed">
              Delete result record for <strong>{deleteConfirmResult.game?.name}</strong> on{' '}
              <strong>{deleteConfirmResult.resultDate}</strong>?
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleDelete}
                className="btn-primary !bg-[#DC2626] !text-white w-full text-xs font-bold uppercase"
              >
                Delete Record
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmResult(null)}
                className="btn-secondary w-full text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminResultsManagerPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-[#71717A] text-xs sm:text-sm">Loading results desk...</div>}>
      <AdminResultsManagementContent />
    </Suspense>
  );
}
