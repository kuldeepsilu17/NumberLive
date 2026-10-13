'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarPlus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  FileEdit,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import { Game } from '@/types';
import { formatDateToYYYYMMDD, formatReadableDate } from '@/lib/utils';

function NewResultWorkflowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedGameId = searchParams.get('gameId') || '';

  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState(preselectedGameId);
  const [resultDate, setResultDate] = useState(formatDateToYYYYMMDD());
  const [resultValue, setResultValue] = useState('');
  const [resultTime, setResultTime] = useState('');
  const [reasonNote, setReasonNote] = useState('');

  const [loadingGames, setLoadingGames] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string; resultId?: string } | null>(null);

  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch('/api/games?all=true');
        const data = await res.json();
        if (data.success && data.games.length > 0) {
          setGames(data.games);
          if (!selectedGameId) {
            setSelectedGameId(data.games[0].id);
            setResultTime(data.games[0].resultTime);
          } else {
            const found = data.games.find((g: Game) => g.id === selectedGameId);
            if (found) setResultTime(found.resultTime);
          }
        }
      } catch (e) {
        console.error('Failed to load games:', e);
      } finally {
        setLoadingGames(false);
      }
    }
    loadGames();
  }, [selectedGameId]);

  const handleGameChange = (gameId: string) => {
    setSelectedGameId(gameId);
    const found = games.find((g) => g.id === gameId);
    if (found) {
      setResultTime(found.resultTime);
    }
  };

  const selectedGame = games.find((g) => g.id === selectedGameId);

  const handleSubmit = async (targetStatus: 'DRAFT' | 'PUBLISHED') => {
    setFeedback(null);

    if (!selectedGameId) {
      setFeedback({ type: 'error', text: 'Please select a game.' });
      return;
    }
    if (!resultDate) {
      setFeedback({ type: 'error', text: 'Please select a date.' });
      return;
    }
    if (resultValue === '' || isNaN(Number(resultValue)) || Number(resultValue) < 0 || Number(resultValue) > 99) {
      setFeedback({ type: 'error', text: 'Please enter a valid 2-digit number (00 - 99).' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: selectedGameId,
          resultDate,
          resultValue: resultValue.padStart(2, '0'),
          resultTime: resultTime || selectedGame?.resultTime,
          status: targetStatus,
          reasonNote:
            reasonNote ||
            `${targetStatus === 'PUBLISHED' ? 'Official publication' : 'Draft entry'} for ${selectedGame?.name || 'game'} on ${resultDate}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data.error || 'Failed to save result.' });
        return;
      }

      setFeedback({
        type: 'success',
        text: `Result successfully saved as ${targetStatus}! Official record created with audit log.`,
        resultId: data.result?.id,
      });

      if (targetStatus === 'PUBLISHED') {
        setShowPreviewModal(false);
      }
    } catch (e: any) {
      setFeedback({ type: 'error', text: 'Network or server error while saving result.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111113] p-4 sm:p-5 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/results"
            className="w-9 h-9 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#71717A] hover:text-[#C5A059]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-[#C5A059]" />
              <span>Official Result Workflow Desk</span>
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Multi-step verified entry: Select Game → Date → Number → Draft / Preview → Publish.
            </p>
          </div>
        </div>

        <Link
          href="/admin/results"
          className="btn-secondary text-xs sm:text-sm font-bold self-start sm:self-auto"
        >
          View All Results
        </Link>
      </div>

      {/* 8-Step Visual Process Bar */}
      <div className="bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-3.5 hidden sm:grid grid-cols-5 gap-2 text-center text-xs font-bold">
        <div className="p-2 rounded bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#111113] dark:text-[#FAF8F5]">
          <span className="text-[#C5A059] block text-[10px]">STEP 1</span>
          Select Game
        </div>
        <div className="p-2 rounded bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#111113] dark:text-[#FAF8F5]">
          <span className="text-[#C5A059] block text-[10px]">STEP 2</span>
          Target Date
        </div>
        <div className="p-2 rounded bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#111113] dark:text-[#FAF8F5]">
          <span className="text-[#C5A059] block text-[10px]">STEP 3</span>
          Enter Number
        </div>
        <div className="p-2 rounded bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#111113] dark:text-[#FAF8F5]">
          <span className="text-[#C5A059] block text-[10px]">STEP 4</span>
          Draft / Preview
        </div>
        <div className="p-2 rounded bg-[#C5A059]/15 border border-[#C5A059] text-[#111113] dark:text-[#FAF8F5]">
          <span className="text-[#C5A059] block text-[10px]">STEP 5</span>
          Publish Live
        </div>
      </div>

      {/* Alert Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-[8px] border text-xs sm:text-sm font-bold flex items-start gap-3 ${
            feedback.type === 'success'
              ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A] dark:bg-[#052E16] dark:border-[#166534]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626] dark:bg-[#18181B] dark:border-[#DC2626]/40'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#16A34A] mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-[#DC2626] mt-0.5" />
          )}
          <div className="space-y-1 flex-1">
            <p>{feedback.text}</p>
            {feedback.resultId && (
              <div className="flex gap-2 pt-1">
                <Link
                  href={`/admin/results/${feedback.resultId}/edit`}
                  className="underline text-xs"
                >
                  Edit this result record →
                </Link>
                <Link href="/" target="_blank" className="underline text-xs flex items-center gap-1">
                  <span>View on live scoreboard</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Workflow Form Card */}
      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] p-5 sm:p-7 shadow-subtle space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* 1. Game Selector */}
          <div>
            <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
              1. Select Game *
            </label>
            {loadingGames ? (
              <div className="text-xs text-[#71717A] py-2">Loading games directory...</div>
            ) : (
              <select
                value={selectedGameId}
                onChange={(e) => handleGameChange(e.target.value)}
                className="form-select text-xs sm:text-sm font-bold"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.resultTime})
                  </option>
                ))}
              </select>
            )}
            {selectedGame && (
              <p className="text-[11px] text-[#71717A] mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C5A059]" />
                Scheduled release: <strong>{selectedGame.resultTime}</strong>
              </p>
            )}
          </div>

          {/* 2. Target Date */}
          <div>
            <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
              2. Target Announcement Date *
            </label>
            <input
              type="date"
              required
              value={resultDate}
              onChange={(e) => setResultDate(e.target.value)}
              className="form-input text-xs sm:text-sm font-bold"
            />
            <p className="text-[11px] text-[#71717A] mt-1">
              Formatted: {formatReadableDate(resultDate)}
            </p>
          </div>
        </div>

        {/* 3. Number Input and Live Number Badge Preview */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] dark:bg-[#18181B] rounded-[8px] border border-[#EAE3D5] dark:border-[#2E2E33] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-black text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
                3. Enter Official Result Number (00 - 99) *
              </label>
              <p className="text-xs text-[#71717A] mb-2">
                Type the verified 2-digit declared number for this game.
              </p>
              <input
                type="text"
                maxLength={2}
                placeholder="e.g. 78"
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value.replace(/[^0-9]/g, ''))}
                className="form-input font-black text-center text-4xl tracking-widest py-3 max-w-[180px]"
              />
            </div>

            {/* Live Number Badge Display */}
            <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-[#EAE3D5] dark:border-[#2E2E33] pt-3 sm:pt-0 sm:pl-6">
              <span className="text-[10px] font-bold uppercase text-[#71717A] block mb-1">
                Public Card Display Preview
              </span>
              <div className="inline-flex items-center justify-center w-24 h-20 bg-[#111113] dark:bg-[#18181B] text-[#FAF8F5] text-4xl font-black rounded-[8px] border-2 border-[#C5A059] shadow-lg">
                {resultValue ? resultValue.padStart(2, '0') : '--'}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Release Time & Verification Audit Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
              Announcement Time Label
            </label>
            <input
              type="text"
              placeholder="03:00 PM"
              value={resultTime}
              onChange={(e) => setResultTime(e.target.value)}
              className="form-input text-xs sm:text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
              Audit Reason / Source Note
            </label>
            <input
              type="text"
              placeholder="e.g. Verified official regional bulletin"
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
              className="form-input text-xs sm:text-sm font-medium"
            />
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="pt-4 border-t border-[#EAE3D5] dark:border-[#2E2E33] flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            disabled={!resultValue}
            className="btn-secondary w-full sm:w-auto text-xs sm:text-sm font-bold min-h-[46px] inline-flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-[#C5A059]" />
            <span>Preview Public Card</span>
          </button>

          <button
            type="button"
            disabled={saving || !resultValue}
            onClick={() => handleSubmit('DRAFT')}
            className="btn-secondary w-full sm:w-auto text-xs sm:text-sm font-bold min-h-[46px] inline-flex items-center justify-center gap-1.5"
          >
            <FileEdit className="w-4 h-4 text-[#D97706]" />
            <span>{saving ? 'Saving...' : 'Save as Draft'}</span>
          </button>

          <button
            type="button"
            disabled={saving || !resultValue}
            onClick={() => handleSubmit('PUBLISHED')}
            className="btn-primary w-full sm:w-auto text-xs sm:text-sm font-bold min-h-[46px] uppercase tracking-wider inline-flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
            <span>{saving ? 'Publishing...' : 'Publish Official Result'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Public Card Preview Modal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'calc(100% - 32px)' }}
          >
            <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
                <h3 className="text-sm font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
                  Scoreboard Card Preview
                </h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-10 h-10 flex items-center justify-center text-[#71717A] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Exact Public Card Representation */}
            <div className="bg-[#FAF8F5] dark:bg-[#18181B] border-2 border-[#C5A059] rounded-[8px] p-4 text-center space-y-2 shadow-md">
              <div className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">
                {selectedGame?.category?.name || 'REGIONAL RESULT'}
              </div>
              <h4 className="text-base font-black uppercase text-[#111113] dark:text-[#FAF8F5]">
                {selectedGame?.name}
              </h4>
              <div className="text-xs text-[#71717A]">
                Date: {formatReadableDate(resultDate)} • Declared at: {resultTime || selectedGame?.resultTime}
              </div>

              <div className="py-2">
                <span className="inline-block font-black text-5xl text-[#111113] dark:text-[#FAF8F5] bg-white dark:bg-[#111113] px-6 py-2 rounded-[8px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-inner tracking-wider">
                  {resultValue ? resultValue.padStart(2, '0') : '--'}
                </span>
              </div>

              <span className="badge-live inline-block">OFFICIAL PUBLISHED</span>
            </div>

            <p className="text-xs text-[#71717A] text-center leading-relaxed">
              Upon publishing, this number will immediately appear on the homepage ticker, scoreboard grid, monthly matrix, and history records.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSubmit('PUBLISHED')}
                className="btn-primary w-full text-xs sm:text-sm font-bold uppercase tracking-wider"
              >
                {saving ? 'Publishing...' : 'Confirm & Publish Now'}
              </button>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="btn-secondary w-full text-xs sm:text-sm font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewResultWorkflowPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-[#71717A] text-sm">Loading workflow desk...</div>}>
      <NewResultWorkflowContent />
    </Suspense>
  );
}
