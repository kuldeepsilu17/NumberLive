'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Gamepad2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  History,
} from 'lucide-react';
import ResultPreviewCard from '@/components/owner/ResultPreviewCard';
import ConfirmationModal from '@/components/owner/ConfirmationModal';

interface ResultData {
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

export default function EditResultPage() {
  const router = useRouter();
  const params = useParams();
  const resultId = params?.id as string;

  const [result, setResult] = useState<ResultData | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('PUBLISHED');
  const [resultTime, setResultTime] = useState('');
  const [reasonNote, setReasonNote] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Result Details
  useEffect(() => {
    async function loadResult() {
      if (!resultId) return;
      try {
        const res = await fetch(`/api/results?id=${resultId}`);
        if (res.ok) {
          const data = await res.json();
          // Results endpoint returns list or single
          const found = data.results?.find((r: any) => r.id === resultId) || data.result;
          if (found) {
            setResult(found);
            setResultValue(found.resultValue);
            setStatus(found.status);
            setResultTime(found.resultTime || found.game.resultTime);
          } else {
            setError('Result record not found.');
          }
        } else {
          setError('Failed to load result record.');
        }
      } catch (e) {
        console.error('Error fetching result:', e);
        setError('Network error loading result.');
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [resultId]);

  const handleUpdate = async (overrideStatus?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED') => {
    setError(null);
    const finalStatus = overrideStatus || status;

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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resultId,
          resultValue: cleanNum,
          status: finalStatus,
          reasonNote: reasonNote || `Updated result from owner edit screen`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update result.');
        setSubmitting(false);
        return;
      }

      setSuccess('Result updated successfully!');
      setTimeout(() => {
        router.push('/owner/results');
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error('Update error:', err);
      setError('An unexpected error occurred.');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/results?id=${resultId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/owner/results');
        router.refresh();
      } else {
        setError('Failed to delete result record.');
        setDeleteModalOpen(false);
      }
    } catch (e) {
      console.error('Delete error:', e);
      setError('Network error while deleting result.');
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#71717A] animate-pulse space-y-2">
        <div className="inline-block w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        <div>Loading result record details...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 text-center space-y-3 bg-white dark:bg-[#151518] rounded-[10px] border border-[#EAE3D5] dark:border-[#2E2E33]">
        <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto" />
        <h3 className="text-base font-bold text-[#111113] dark:text-[#FAF8F5]">
          Result Record Not Found
        </h3>
        <p className="text-xs text-[#71717A]">
          The result record you are trying to edit does not exist or has been removed.
        </p>
        <Link
          href="/owner/results"
          className="inline-block text-xs font-bold text-[#C5A059] hover:underline"
        >
          ← Return to Results Workflow
        </Link>
      </div>
    );
  }

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
              EDIT RECORD
            </div>
            <h2 className="text-xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
              {result.game.name} — {result.resultDate}
            </h2>
          </div>
        </div>

        <button
          onClick={() => setDeleteModalOpen(true)}
          className="flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-[6px] text-xs font-bold text-[#DC2626] bg-[#FEF2F2] dark:bg-[#2A1515] border border-[#FECACA] dark:border-[#521C1C] hover:bg-[#FEE2E2] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Record</span>
        </button>
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
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-subtle space-y-5">
          <div className="space-y-4">
            {/* Read-Only Context Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-[8px] bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] text-xs">
              <div>
                <span className="text-[10px] uppercase text-[#8C8275] block">Game</span>
                <span className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                  {result.game.name}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#8C8275] block">Date</span>
                <span className="font-bold font-mono text-[#111113] dark:text-[#FAF8F5]">
                  {result.resultDate}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#8C8275] block">Schedule</span>
                <span className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                  {result.resultTime || result.game.resultTime}
                </span>
              </div>
            </div>

            {/* Outcome Value */}
            <div className="space-y-1.5">
              <label
                htmlFor="editResultValue"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Published Number (00 - 99)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="editResultValue"
                  type="text"
                  maxLength={2}
                  value={resultValue}
                  onChange={(e) => setResultValue(e.target.value.replace(/[^0-9]/g, ''))}
                  disabled={submitting}
                  className="w-32 min-h-[48px] text-center text-2xl font-black tabular-nums rounded-[8px] bg-[#FAF8F5] dark:bg-[#1F1F23] border-2 border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059] tracking-widest text-[#111113] dark:text-[#FAF8F5]"
                />
                <div className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                  Modifying this number will log a <code>CORRECT_RESULT</code> audit entry.
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
                    desc: 'Publicly visible',
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
                    desc: 'Archived record',
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

            {/* Reason / Audit Note */}
            <div className="space-y-1.5">
              <label
                htmlFor="editReasonNote"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Audit / Correction Reason
              </label>
              <input
                id="editReasonNote"
                type="text"
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                disabled={submitting}
                placeholder="e.g. Corrected typo from official regional board release"
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
                {status !== 'PUBLISHED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdate('PUBLISHED')}
                    disabled={submitting}
                    className="min-h-[44px] px-4 py-2 rounded-[6px] text-xs font-bold text-[#059669] bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0] dark:border-[#059669] hover:bg-[#D1FAE5] transition-colors"
                  >
                    Publish Now
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleUpdate()}
                  disabled={submitting}
                  className="min-h-[44px] px-5 py-2 rounded-[6px] text-xs font-black uppercase tracking-wider text-black bg-[#C5A059] hover:bg-[#B38F46] active:scale-[0.99] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {submitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <ResultPreviewCard
            gameName={result.game.name}
            resultDate={result.resultDate}
            resultValue={resultValue}
            resultTime={resultTime || result.game.resultTime}
            status={status}
            categoryName={result.game.category?.name || 'Main Game'}
          />

          <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 space-y-2 text-xs text-[#5C5449] dark:text-[#D4D4D8]">
            <div className="font-bold text-[#111113] dark:text-[#FAF8F5] flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#C5A059]" />
              <span>Audit Logging Notice</span>
            </div>
            <p className="text-[11px] text-[#71717A] leading-relaxed">
              Every change made to this record (from old number <strong>{result.resultValue}</strong> to <strong>{resultValue || '--'}</strong>) is permanently recorded with your owner credentials in the audit trail.
            </p>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Permanently Delete Result Record"
        message={`Are you sure you want to delete the result for ${result.game.name} on ${result.resultDate}? This action cannot be undone and will be logged.`}
        confirmLabel="Delete Record"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
