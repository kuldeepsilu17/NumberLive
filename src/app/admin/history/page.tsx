'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AdminHistoryPage() {
  const [results, setResults] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Edit / Correct Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<any | null>(null);
  const [formValue, setFormValue] = useState('');
  const [formStatus, setFormStatus] = useState('PUBLISHED');
  const [formReason, setFormReason] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/games')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setGames(data.games || []);
      })
      .catch((err) => console.error('Error fetching games:', err));
  }, []);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGame) params.set('game', selectedGame);
      if (selectedDate) params.set('date', selectedDate);
      if (selectedStatus) params.set('status', selectedStatus);
      if (selectedYear) params.set('year', selectedYear);
      params.set('page', String(page));
      params.set('limit', '25');

      const res = await fetch(`/api/results?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedGame, selectedDate, selectedStatus, selectedYear, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const openCorrectionModal = (item: any) => {
    setEditingResult(item);
    setFormValue(item.resultValue);
    setFormStatus(item.status);
    setFormReason('');
    setEditModalOpen(true);
  };

  const handleSaveCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;

    try {
      const res = await fetch('/api/results', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingResult.id,
          resultValue: formValue.padStart(2, '0'),
          status: formStatus,
          reasonNote: formReason || `Editorial correction for ${editingResult.game.name} on ${editingResult.resultDate}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update result');
      }

      setActionMessage({ type: 'success', text: `Result updated for ${editingResult.game.name}.` });
      setEditModalOpen(false);
      fetchResults();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteResult = async (id: string, gameName: string, date: string) => {
    if (!confirm(`Are you sure you want to delete the result record for ${gameName} on ${date}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/results?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete record');
      }
      setActionMessage({ type: 'success', text: 'Result record deleted.' });
      fetchResults();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 sm:p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              HISTORICAL RESULTS &amp; ARCHIVES MANAGER
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Filter, audit, correct, and manage database records across all years and regions.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono font-bold text-[#71717A] dark:text-[#A1A1AA]">
          Total Records: <strong className="text-[#C5A059]">{totalCount}</strong>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-[8px] border text-xs font-semibold flex items-center justify-between gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 shadow-subtle grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">
            Game Filter
          </label>
          <select
            value={selectedGame}
            onChange={(e) => {
              setSelectedGame(e.target.value);
              setPage(1);
            }}
            className="form-select font-bold"
          >
            <option value="">All Monitored Games</option>
            {games.map((g) => (
              <option key={g.id} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setPage(1);
            }}
            className="form-select font-bold"
          >
            <option value="">All Years</option>
            <option value="2026">Year 2026</option>
            <option value="2025">Year 2025</option>
            <option value="2024">Year 2024</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">
            Specific Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setPage(1);
            }}
            className="form-input font-bold font-mono"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="form-select font-bold"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CORRECTED">Corrected</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] font-bold">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C5A059] mb-2" />
            Querying database records...
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#71717A]">
            No records match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-[#EAE3D5] dark:border-[#2E2E33] bg-[#FAF8F5] dark:bg-[#18181B] text-[#71717A] dark:text-[#A1A1AA] font-bold uppercase tracking-wider text-[11px] font-sans">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Game</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-center">Declared Result</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
                {results.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-[#FAF8F5]/80 dark:hover:bg-[#18181B]/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-[#111113] dark:text-[#FAF8F5]">
                      {r.resultDate}
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-[#111113] dark:text-[#FAF8F5]">
                      {r.game?.name}
                    </td>
                    <td className="py-3 px-4 text-[#71717A] dark:text-[#A1A1AA]">
                      {r.resultTime}
                    </td>
                    <td className="py-3 px-4 text-center font-black text-sm text-[#C5A059]">
                      {r.resultValue}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : r.status === 'CORRECTED'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openCorrectionModal(r)}
                          className="h-8 px-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#FAF8F5] bg-[#18181B] hover:bg-[#222226] border border-[#2E2E33] hover:border-[#C5A059] rounded-[5px] transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-[#C5A059]" />
                          <span>Correct</span>
                        </button>
                        <button
                          onClick={() => handleDeleteResult(r.id, r.game?.name, r.resultDate)}
                          className="h-8 px-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-red-500 bg-[#18181B] hover:bg-red-500/10 border border-[#2E2E33] rounded-[5px] transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-[#FAF8F5] dark:bg-[#18181B] border-t border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-between text-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9 px-3 min-h-[44px] inline-flex items-center gap-1 font-bold text-[#111113] dark:text-[#FAF8F5] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[6px] disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="font-bold text-[#71717A] dark:text-[#A1A1AA]">
              Page <strong className="text-[#111113] dark:text-[#FAF8F5]">{page}</strong> of{' '}
              <strong className="text-[#111113] dark:text-[#FAF8F5]">{totalPages}</strong>
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-9 px-3 min-h-[44px] inline-flex items-center gap-1 font-bold text-[#111113] dark:text-[#FAF8F5] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[6px] disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Edit/Correction Modal */}
      {editModalOpen && editingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-3">
              <h2 className="text-sm font-black uppercase text-[#111113] dark:text-[#FAF8F5]">
                Correct Historical Entry
              </h2>
              <button onClick={() => setEditModalOpen(false)}>
                <X className="w-5 h-5 text-[#71717A]" />
              </button>
            </div>

            <form onSubmit={handleSaveCorrection} className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF8F5] dark:bg-[#18181B] rounded-[6px] border border-[#EAE3D5] dark:border-[#2E2E33] space-y-1">
                <div className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                  Game: {editingResult.game?.name}
                </div>
                <div className="text-[11px] text-[#71717A] font-mono">
                  Date: {editingResult.resultDate} | Scheduled: {editingResult.resultTime}
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                  Declared Number Value (2 Digits) *
                </label>
                <input
                  type="text"
                  maxLength={2}
                  required
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value.replace(/[^0-9]/g, ''))}
                  className="form-input text-center text-2xl font-black font-mono tracking-widest text-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="form-select font-bold"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="CORRECTED">Corrected (Typo Rectification)</option>
                  <option value="DRAFT">Draft (Unpublished)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                  Audit Reason / Note *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="State verified official release source or reason for correction..."
                  className="form-textarea"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE3D5] dark:border-[#2E2E33]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="h-9 px-4 text-xs font-bold text-[#71717A] hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] rounded-[6px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 text-xs font-bold text-[#111113] bg-[#C5A059] hover:bg-[#B38F48] rounded-[6px] inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Record Correction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
