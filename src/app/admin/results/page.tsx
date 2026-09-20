'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CalendarPlus,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  RefreshCw,
  FileCheck2,
  X,
} from 'lucide-react';
import { Game, Result } from '@/types';
import { formatReadableDate } from '@/lib/utils';

function AdminResultsContent() {
  const searchParams = useSearchParams();
  const preselectedGameId = searchParams.get('gameId') || '';

  const [games, setGames] = useState<Game[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [selectedGameId, setSelectedGameId] = useState(preselectedGameId);
  const [resultDate, setResultDate] = useState('2026-09-17');
  const [resultValue, setResultValue] = useState('');
  const [resultTime, setResultTime] = useState('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('PUBLISHED');
  const [reasonNote, setReasonNote] = useState('');

  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Correction Modal state
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [editNewValue, setEditNewValue] = useState('');
  const [editStatus, setEditStatus] = useState<'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('PUBLISHED');
  const [editReason, setEditReason] = useState('');

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch('/api/games?all=true');
      const data = await res.json();
      if (data.success) {
        setGames(data.games);
        if (!selectedGameId && data.games.length > 0) {
          setSelectedGameId(data.games[0].id);
          setResultTime(data.games[0].resultTime);
        }
      }
    } catch (e) {
      console.error('Failed to load games:', e);
    }
  }, [selectedGameId]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/results?limit=30`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (e) {
      console.error('Failed to load results:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    fetchResults();
  }, [fetchGames, fetchResults]);

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
    const game = games.find((g) => g.id === gameId);
    if (game) {
      setResultTime(game.resultTime);
    }
  };

  const handleFormSubmitTrigger = (e: React.FormEvent, targetStatus: 'PUBLISHED' | 'DRAFT') => {
    e.preventDefault();
    if (!selectedGameId || !resultDate || resultValue === '') {
      setMessage({ type: 'error', text: 'Please fill in game, date, and result number.' });
      return;
    }
    setStatus(targetStatus);
    setShowConfirmModal(true);
  };

  const executePublish = async () => {
    setShowConfirmModal(false);
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: selectedGameId,
          resultDate,
          resultValue,
          resultTime,
          status,
          reasonNote: reasonNote || `Entered ${status.toLowerCase()} result for ${resultDate}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Failed to save result' });
        return;
      }

      setMessage({
        type: 'success',
        text: `Successfully ${status === 'PUBLISHED' ? 'published' : 'saved draft'} result (${resultValue.padStart(2, '0')})!`,
      });
      setResultValue('');
      setReasonNote('');
      fetchResults();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;

    setSaving(true);
    try {
      const res = await fetch('/api/results', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingResult.id,
          resultValue: editNewValue,
          status: editStatus,
          reasonNote: editReason || `Updated result value to ${editNewValue}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Failed to update result' });
        return;
      }

      setMessage({ type: 'success', text: `Result corrected successfully! Audit log created.` });
      setEditingResult(null);
      fetchResults();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to update result.' });
    } finally {
      setSaving(false);
    }
  };

  const selectedGameObj = games.find((g) => g.id === selectedGameId);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111113] p-4 sm:p-5 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-[#C5A059]" />
            <span>Result Publisher &amp; Corrections Desk</span>
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Publish official results with full tamper-evident audit logging.
          </p>
        </div>

        <button
          onClick={fetchResults}
          disabled={loading}
          className="self-start sm:self-auto btn-secondary text-xs sm:text-sm font-bold min-h-[44px]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Results</span>
        </button>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`p-3.5 rounded-[8px] border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A] dark:bg-[#052E16] dark:border-[#166534]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626] dark:bg-[#18181B] dark:border-[#DC2626]/40'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Layout: 1 col on mobile, 3 cols on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Col 1: Form (100% width, 48px controls) */}
        <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 shadow-subtle space-y-4 self-start">
          <h2 className="text-sm font-black uppercase text-[#111113] dark:text-[#FAF8F5] pb-2 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
            Enter New Result
          </h2>

          <div className="space-y-3.5">
            {/* Game */}
            <div>
              <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
                Game *
              </label>
              <select
                value={selectedGameId}
                onChange={(e) => handleGameSelect(e.target.value)}
                className="form-select text-xs sm:text-sm font-bold"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.resultTime})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={resultDate}
                onChange={(e) => setResultDate(e.target.value)}
                className="form-input text-xs sm:text-sm font-bold"
              />
            </div>

            {/* Result Number */}
            <div>
              <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
                Result Number (00 - 99) *
              </label>
              <input
                type="text"
                maxLength={2}
                required
                placeholder="e.g. 67"
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
                className="form-input text-center font-black text-3xl py-2"
              />
            </div>

            {/* Result Time */}
            <div>
              <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
                Result Time
              </label>
              <input
                type="text"
                placeholder="03:00 PM"
                value={resultTime}
                onChange={(e) => setResultTime(e.target.value)}
                className="form-input text-xs sm:text-sm font-bold"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
                Audit Note / Verification Source
              </label>
              <input
                type="text"
                placeholder="e.g. Verified official regional bulletin"
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                className="form-input text-xs sm:text-sm font-medium"
              />
            </div>

            {/* Action Buttons: Stacked on mobile, 48px height */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={(e) => handleFormSubmitTrigger(e, 'PUBLISHED')}
                className="btn-primary w-full text-xs sm:text-sm font-bold uppercase tracking-wider"
              >
                Publish Result
              </button>
              <button
                type="button"
                onClick={(e) => handleFormSubmitTrigger(e, 'DRAFT')}
                className="btn-secondary w-full text-xs sm:text-sm font-bold uppercase tracking-wider"
              >
                Save Draft
              </button>
            </div>
          </div>
        </div>

        {/* Col 2 & 3: Results Table & Mobile Cards */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden space-y-0">
          <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-black">
            <span className="flex items-center gap-2 text-[#111113] dark:text-[#FAF8F5] uppercase">
              <FileCheck2 className="w-4 h-4 text-[#C5A059]" />
              <span>RECENT PUBLISHED RESULTS ({results.length})</span>
            </span>
            <span className="text-[10px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] px-2.5 py-1 rounded-[4px] text-[#111113] dark:text-[#FAF8F5] font-mono font-bold">
              LAST 30 ENTRIES
            </span>
          </div>

          {/* Desktop Table View (md+ screens) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Game Name</th>
                  <th className="text-center">Result</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] transition-colors">
                    <td className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                      {formatReadableDate(r.resultDate)}
                    </td>
                    <td className="font-bold uppercase text-[#111113] dark:text-[#FAF8F5]">
                      {r.game?.name}
                    </td>
                    <td className="text-center">
                      <span className="font-black text-base text-[#111113] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B] px-3 py-1 rounded-[4px] border border-[#EAE3D5] dark:border-[#2E2E33]">
                        {r.resultValue}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-live ${
                          r.status === 'PUBLISHED' ? '' : '!bg-[#FAF8F5] !text-[#71717A] !border-[#EAE3D5]'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => {
                          setEditingResult(r);
                          setEditNewValue(r.resultValue);
                          setEditStatus(r.status as any);
                          setEditReason('');
                        }}
                        className="btn-secondary !min-h-[36px] !px-3 text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Correct</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (< md screens) */}
          <div className="md:hidden p-3.5 space-y-3">
            {results.map((r) => (
              <div
                key={r.id}
                className="bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[8px] p-3.5 space-y-2.5 shadow-subtle"
              >
                <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2">
                  <span className="font-black text-xs uppercase text-[#111113] dark:text-[#FAF8F5]">
                    {r.game?.name}
                  </span>
                  <span className="badge-live">
                    {r.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#71717A]">
                    <div className="font-semibold text-[#111113] dark:text-[#FAF8F5]">
                      {formatReadableDate(r.resultDate)}
                    </div>
                    <div>Declared at: {r.resultTime}</div>
                  </div>

                  <span className="font-black text-xl text-[#FAF8F5] bg-[#111113] dark:bg-[#18181B] border border-[#2E2E33] px-3.5 py-1 rounded-[6px] shadow-xs">
                    {r.resultValue}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#EAE3D5] dark:border-[#2E2E33] flex justify-end">
                  <button
                    onClick={() => {
                      setEditingResult(r);
                      setEditNewValue(r.resultValue);
                      setEditStatus(r.status as any);
                      setEditReason('');
                    }}
                    className="btn-secondary w-full text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Correct Result</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-5 shadow-2xl space-y-3.5"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'calc(100% - 32px)' }}
          >
            <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2">
              <h3 className="text-sm font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
                Confirm Publication
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-11 h-11 -mr-2 flex items-center justify-center text-[#71717A] hover:text-white"
                aria-label="Close confirm dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#5C5449] dark:text-[#D4D4D8] leading-relaxed">
              Are you sure you want to {status === 'PUBLISHED' ? 'publish' : 'save draft for'}{' '}
              <strong>{selectedGameObj?.name}</strong> result as{' '}
              <strong className="text-[#C5A059] text-xl font-black">{resultValue.padStart(2, '0')}</strong> on{' '}
              <strong>{resultDate}</strong>?
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={executePublish}
                className="btn-primary w-full text-xs sm:text-sm font-bold"
              >
                {saving ? 'Publishing...' : 'Confirm & Publish'}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary w-full text-xs sm:text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audited Result Correction Modal */}
      {editingResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-xs animate-in fade-in"
          onClick={() => setEditingResult(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-5 shadow-2xl space-y-3.5"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'calc(100% - 32px)' }}
          >
            <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2">
              <div>
                <h3 className="text-sm font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
                  Audited Result Correction
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  {editingResult.game?.name} • {formatReadableDate(editingResult.resultDate)}
                </p>
              </div>
              <button
                onClick={() => setEditingResult(null)}
                className="w-11 h-11 -mr-2 flex items-center justify-center text-[#71717A] hover:text-white"
                aria-label="Close correction modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateResult} className="space-y-3.5">
              <div className="p-3 bg-[#FAF8F5] dark:bg-[#18181B] rounded-[8px] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-around text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#71717A] block mb-0.5">
                    Old Result
                  </span>
                  <span className="font-bold text-lg text-[#71717A] line-through">
                    {editingResult.resultValue}
                  </span>
                </div>
                <div className="text-[#71717A] font-bold text-lg">→</div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] block mb-0.5">
                    New Result
                  </span>
                  <span className="font-black text-2xl text-[#111113] dark:text-[#FAF8F5]">
                    {editNewValue || '--'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
                  Corrected Result Number (00 - 99) *
                </label>
                <input
                  type="text"
                  maxLength={2}
                  required
                  value={editNewValue}
                  onChange={(e) => setEditNewValue(e.target.value)}
                  className="form-input text-center font-black text-2xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="form-select text-xs sm:text-sm font-bold"
                >
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
                  Mandatory Audit Reason Note *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain why this result is being corrected (e.g. announcement board typo)"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="form-textarea text-xs sm:text-sm font-medium"
                ></textarea>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary w-full text-xs sm:text-sm font-bold uppercase tracking-wider"
                >
                  {saving ? 'Saving...' : 'Save Correction & Log Audit'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingResult(null)}
                  className="btn-secondary w-full text-xs sm:text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminResultsManagerPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-[#71717A] text-xs sm:text-sm">Loading results desk...</div>}>
      <AdminResultsContent />
    </Suspense>
  );
}
