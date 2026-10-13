'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  PlusCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Gamepad2,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import ResultPreviewCard from '@/components/owner/ResultPreviewCard';
import { formatDateToYYYYMMDD } from '@/lib/utils';

interface GameItem {
  id: string;
  name: string;
  slug: string;
  resultTime: string;
  category?: {
    name: string;
  };
}

function CreateResultForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGameId = searchParams.get('gameId') || '';

  const [games, setGames] = useState<GameItem[]>([]);
  const [selectedGameId, setSelectedGameId] = useState(initialGameId);
  const [resultDate, setResultDate] = useState(formatDateToYYYYMMDD());
  const [resultValue, setResultValue] = useState('');
  const [resultTime, setResultTime] = useState('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('PUBLISHED');
  const [reasonNote, setReasonNote] = useState('');

  const [loadingGames, setLoadingGames] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch active games
  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch('/api/games?all=true');
        if (res.ok) {
          const data = await res.json();
          const activeGames = data.games || [];
          setGames(activeGames);

          if (activeGames.length > 0) {
            const defaultGame = initialGameId
              ? activeGames.find((g: GameItem) => g.id === initialGameId) || activeGames[0]
              : activeGames[0];
            setSelectedGameId(defaultGame.id);
            setResultTime(defaultGame.resultTime);
          }
        }
      } catch (e) {
        console.error('Error fetching games:', e);
      } finally {
        setLoadingGames(false);
      }
    }
    loadGames();
  }, [initialGameId]);

  // When game selection changes, auto-fill standard resultTime
  const handleGameChange = (gameId: string) => {
    setSelectedGameId(gameId);
    const selected = games.find((g) => g.id === gameId);
    if (selected) {
      setResultTime(selected.resultTime);
    }
  };

  const selectedGameObj = games.find((g) => g.id === selectedGameId);

  const handleSubmit = async (e: React.FormEvent, overrideStatus?: 'PUBLISHED' | 'DRAFT') => {
    e.preventDefault();
    setError(null);

    const finalStatus = overrideStatus || status;

    if (!selectedGameId) {
      setError('Please select a game.');
      return;
    }

    if (!resultValue || resultValue.trim() === '') {
      setError('Please enter a valid 2-digit number outcome (00-99).');
      return;
    }

    const cleanNum = resultValue.trim().padStart(2, '0');
    if (!/^\d{2}$/.test(cleanNum)) {
      setError('Result must be exactly 2 digits (between 00 and 99).');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: selectedGameId,
          resultDate,
          resultValue: cleanNum,
          resultTime: resultTime || selectedGameObj?.resultTime,
          status: finalStatus,
          reasonNote: reasonNote || `Entry published via Owner Portal`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit result.');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/owner/results');
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error('Submission error:', err);
      setError('An unexpected network error occurred.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
        <div className="flex items-center gap-3">
          <Link
            href="/owner/results"
            className="p-2 rounded-[6px] bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#71717A] hover:text-[#111113] dark:hover:text-white transition-colors"
            title="Back to Results"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">
              NEW ENTRY
            </div>
            <h2 className="text-xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
              Publish / Draft Result
            </h2>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-[8px] bg-[#FEF2F2] dark:bg-[#2A1212] border border-[#FECACA] dark:border-[#521C1C] flex items-center gap-2.5 text-xs text-[#DC2626] dark:text-[#F87171]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-[8px] bg-[#ECFDF5] dark:bg-[#062D20] border border-[#A7F3D0] dark:border-[#065F46] flex items-center gap-2.5 text-xs text-[#047857] dark:text-[#6EE7B7]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Result saved successfully! Redirecting to results workflow...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─────────────────────────────────────────────────────────────
           LEFT: RESULT CREATION FORM (7 Cols)
           ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-subtle space-y-5">
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            {/* Game Selector */}
            <div className="space-y-1.5">
              <label
                htmlFor="gameSelect"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Target Game
              </label>
              <div className="relative">
                <Gamepad2 className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="gameSelect"
                  value={selectedGameId}
                  onChange={(e) => handleGameChange(e.target.value)}
                  disabled={loadingGames || submitting}
                  className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
                >
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} — ({g.category?.name || 'Main'}) • Scheduled: {g.resultTime}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Date */}
              <div className="space-y-1.5">
                <label
                  htmlFor="resultDate"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
                >
                  Result Date (YYYY-MM-DD)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="resultDate"
                    type="date"
                    required
                    value={resultDate}
                    onChange={(e) => setResultDate(e.target.value)}
                    disabled={submitting}
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Scheduled Time */}
              <div className="space-y-1.5">
                <label
                  htmlFor="resultTime"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
                >
                  Official Release Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="resultTime"
                    type="text"
                    required
                    value={resultTime}
                    onChange={(e) => setResultTime(e.target.value)}
                    disabled={submitting}
                    placeholder="e.g. 03:00 PM"
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>
            </div>

            {/* Outcome Value (2-Digit Number) */}
            <div className="space-y-1.5">
              <label
                htmlFor="resultValue"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Official Published Number (00 - 99)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="resultValue"
                  type="text"
                  maxLength={2}
                  required
                  autoFocus
                  value={resultValue}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setResultValue(val);
                  }}
                  disabled={submitting}
                  placeholder="00"
                  className="w-32 min-h-[48px] text-center text-2xl font-black tabular-nums rounded-[8px] bg-[#FAF8F5] dark:bg-[#1F1F23] border-2 border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059] tracking-widest text-[#111113] dark:text-[#FAF8F5]"
                />

                <div className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                  Enter official 2-digit outcome number. Single digit numbers (e.g. 7) will automatically format to 07.
                </div>
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]">
                Publication Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    val: 'PUBLISHED',
                    label: 'Published',
                    desc: 'Live on public scoreboard',
                    color: 'border-[#059669] text-[#059669] bg-[#ECFDF5] dark:bg-[#064E3B]/20',
                  },
                  {
                    val: 'DRAFT',
                    label: 'Draft',
                    desc: 'Private to owner',
                    color: 'border-[#D97706] text-[#D97706] bg-[#FFFBEB] dark:bg-[#78350F]/20',
                  },
                  {
                    val: 'ARCHIVED',
                    label: 'Archived',
                    desc: 'Historical storage',
                    color: 'border-[#64748B] text-[#64748B] bg-[#F1F5F9] dark:bg-[#1E293B]/20',
                  },
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => setStatus(s.val as any)}
                    className={`p-2.5 rounded-[8px] border text-left transition-all ${
                      status === s.val
                        ? `${s.color} font-black shadow-xs`
                        : 'border-[#EAE3D5] dark:border-[#2E2E33] text-[#71717A] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="text-xs font-bold">{s.label}</div>
                    <div className="text-[10px] opacity-75">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Audit / Reason Note */}
            <div className="space-y-1.5">
              <label
                htmlFor="reasonNote"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Editorial Verification Note (Audit Trail)
              </label>
              <input
                id="reasonNote"
                type="text"
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                disabled={submitting}
                placeholder="e.g. Verified against official regional announcement board"
                className="w-full min-h-[40px] px-3.5 py-2 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#EAE3D5] dark:border-[#2E2E33] flex flex-wrap items-center justify-between gap-2">
              <Link
                href="/owner/results"
                className="min-h-[44px] px-4 py-2 rounded-[6px] text-xs font-bold text-[#5C5449] dark:text-[#D4D4D8] hover:bg-[#FAF8F5] border border-[#EAE3D5] dark:border-[#2E2E33] transition-colors"
              >
                Cancel
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'DRAFT')}
                  disabled={submitting}
                  className="min-h-[44px] px-4 py-2 rounded-[6px] text-xs font-bold text-[#D97706] bg-[#FFFBEB] dark:bg-[#78350F]/20 border border-[#FDE68A] dark:border-[#D97706] hover:bg-[#FEF3C7] transition-colors"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'PUBLISHED')}
                  disabled={submitting}
                  className="min-h-[44px] px-5 py-2 rounded-[6px] text-xs font-black uppercase tracking-wider text-black bg-[#C5A059] hover:bg-[#B38F46] active:scale-[0.99] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {submitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Publish Immediately</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ─────────────────────────────────────────────────────────────
           RIGHT: LIVE RESULT PREVIEW & SECURITY NOTES (5 Cols)
           ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          <ResultPreviewCard
            gameName={selectedGameObj?.name || 'Selected Game'}
            resultDate={resultDate}
            resultValue={resultValue}
            resultTime={resultTime || selectedGameObj?.resultTime || '00:00 PM'}
            status={status}
            categoryName={selectedGameObj?.category?.name || 'Main Game'}
          />

          <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 space-y-2 text-xs text-[#5C5449] dark:text-[#D4D4D8]">
            <div className="font-bold text-[#111113] dark:text-[#FAF8F5] flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#C5A059]" />
              <span>Publishing Security Rule</span>
            </div>
            <p className="text-[11px] text-[#71717A] leading-relaxed">
              When published, this outcome is instantly written to the primary PostgreSQL database and propagated across all cached public pages (Home Scoreboard, Results Matrix, Monthly Matrix, and Charts).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateResultPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#71717A]">
          Loading Result Creation Form...
        </div>
      }
    >
      <CreateResultForm />
    </Suspense>
  );
}
