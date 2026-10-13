'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Edit3,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Archive,
  Trash2,
  Eye,
  ShieldAlert,
  FileCheck2,
  X,
} from 'lucide-react';
import { Result } from '@/types';
import { formatReadableDate } from '@/lib/utils';

export default function EditResultPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params?.id as string;

  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [resultValue, setResultValue] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');
  const [reasonNote, setReasonNote] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    async function loadResult() {
      if (!resultId) return;
      try {
        const res = await fetch(`/api/results/${resultId}`);
        const data = await res.json();
        if (data.success && data.result) {
          setResult(data.result);
          setResultValue(data.result.resultValue);
          setStatus(data.result.status as any);
        } else {
          setFeedback({ type: 'error', text: data.error || 'Failed to load result.' });
        }
      } catch (e) {
        setFeedback({ type: 'error', text: 'Error connecting to database.' });
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [resultId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;

    if (!resultValue || isNaN(Number(resultValue)) || Number(resultValue) < 0 || Number(resultValue) > 99) {
      setFeedback({ type: 'error', text: 'Please enter a valid 2-digit number (00 - 99).' });
      return;
    }

    if (!reasonNote.trim()) {
      setFeedback({
        type: 'error',
        text: 'Mandatory audit reason note is required for all updates/corrections.',
      });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/results/${result.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultValue: resultValue.padStart(2, '0'),
          status,
          reasonNote: reasonNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data.error || 'Failed to update result.' });
        return;
      }

      setResult(data.result);
      setFeedback({
        type: 'success',
        text: 'Result record updated successfully! Tamper-evident audit log created.',
      });
      setReasonNote('');
    } catch (e) {
      setFeedback({ type: 'error', text: 'Failed to update result due to server error.' });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickPublish = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/results/${result.id}/publish`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
        setStatus('PUBLISHED');
        setFeedback({ type: 'success', text: 'Result officially published!' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Failed to publish result.' });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickArchive = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/results/${result.id}/archive`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
        setStatus('ARCHIVED');
        setFeedback({ type: 'success', text: 'Result archived (hidden from public site).' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Failed to archive result.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/results/${result.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/results');
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to delete.' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Failed to delete result.' });
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-[#71717A] text-sm">Loading result record...</div>;
  }

  if (!result) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-[#DC2626]">Result Record Not Found</h2>
        <Link href="/admin/results" className="btn-secondary text-sm">
          Return to Results List
        </Link>
      </div>
    );
  }

  const isCorrection = result.resultValue !== resultValue;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
              <Edit3 className="w-5 h-5 text-[#C5A059]" />
              <span>Result Correction &amp; Status Desk</span>
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              {result.game?.name} • {formatReadableDate(result.resultDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {result.status !== 'PUBLISHED' && (
            <button
              type="button"
              disabled={saving}
              onClick={handleQuickPublish}
              className="btn-primary text-xs font-bold min-h-[38px] inline-flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Publish Live</span>
            </button>
          )}

          {result.status !== 'ARCHIVED' && (
            <button
              type="button"
              disabled={saving}
              onClick={handleQuickArchive}
              className="btn-secondary text-xs font-bold min-h-[38px] inline-flex items-center gap-1"
            >
              <Archive className="w-3.5 h-3.5 text-[#71717A]" />
              <span>Archive</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-[8px] border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A] dark:bg-[#052E16] dark:border-[#166534]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626] dark:bg-[#18181B] dark:border-[#DC2626]/40'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Edit Form */}
      <form
        onSubmit={handleUpdate}
        className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] p-5 sm:p-6 shadow-subtle space-y-5"
      >
        {/* Record Overview Summary Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#FAF8F5] dark:bg-[#18181B] rounded-[8px] border border-[#EAE3D5] dark:border-[#2E2E33] text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#71717A] block">Game</span>
            <strong className="text-[#111113] dark:text-[#FAF8F5] font-black">{result.game?.name}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#71717A] block">Date</span>
            <strong className="text-[#111113] dark:text-[#FAF8F5]">{formatReadableDate(result.resultDate)}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#71717A] block">Current Status</span>
            <span
              className={`badge-live mt-0.5 inline-block ${
                result.status === 'PUBLISHED'
                  ? ''
                  : result.status === 'DRAFT'
                  ? '!bg-[#FEF3C7] !text-[#D97706] !border-[#FDE68A]'
                  : '!bg-[#FAF8F5] !text-[#71717A] !border-[#EAE3D5]'
              }`}
            >
              {result.status}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#71717A] block">Declared Time</span>
            <span className="text-[#111113] dark:text-[#FAF8F5] font-mono">{result.resultTime}</span>
          </div>
        </div>

        {/* Live Diff Transformation Box */}
        <div className="p-4 bg-[#FAF8F5] dark:bg-[#18181B] rounded-[8px] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-around text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#71717A] block mb-0.5">
              Original In Database
            </span>
            <span className="font-black text-2xl text-[#71717A] line-through">
              {result.resultValue}
            </span>
          </div>

          <div className="text-[#71717A] font-bold text-xl">→</div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#C5A059] block mb-0.5">
              Updated Number
            </span>
            <span className="font-black text-3xl text-[#111113] dark:text-[#FAF8F5]">
              {resultValue ? resultValue.padStart(2, '0') : '--'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Result Number Input */}
          <div>
            <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
              Result Number (00 - 99) *
            </label>
            <input
              type="text"
              maxLength={2}
              required
              value={resultValue}
              onChange={(e) => setResultValue(e.target.value.replace(/[^0-9]/g, ''))}
              className="form-input text-center font-black text-3xl py-2"
            />
          </div>

          {/* Status Selector */}
          <div>
            <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
              Result Status *
            </label>
            <select
              value={status}
              onChange={(e: any) => setStatus(e.target.value)}
              className="form-select text-xs sm:text-sm font-bold"
            >
              <option value="PUBLISHED">PUBLISHED (Visible to public)</option>
              <option value="DRAFT">DRAFT (Internal only)</option>
              <option value="ARCHIVED">ARCHIVED (Hidden from public)</option>
            </select>
          </div>
        </div>

        {/* Mandatory Audit Reason Note */}
        <div>
          <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1 flex items-center justify-between">
            <span>Mandatory Audit Reason Note *</span>
            <span className="text-[10px] text-[#C5A059]">Logged to permanent audit trail</span>
          </label>
          <textarea
            rows={2}
            required
            placeholder="e.g. Corrected regional announcement typo after verifying regional bulletin."
            value={reasonNote}
            onChange={(e) => setReasonNote(e.target.value)}
            className="form-textarea text-xs sm:text-sm font-medium"
          ></textarea>
        </div>

        {/* Form Actions */}
        <div className="pt-3 border-t border-[#EAE3D5] dark:border-[#2E2E33] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="text-xs font-bold text-[#DC2626] hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Result Record</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="btn-secondary w-full sm:w-auto text-xs sm:text-sm font-bold min-h-[44px] inline-flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-[#C5A059]" />
              <span>Preview</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full sm:w-auto text-xs sm:text-sm font-bold min-h-[44px] uppercase tracking-wider inline-flex items-center justify-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Log Audit'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#111113] border border-[#DC2626]/40 rounded-[9px] p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'calc(100% - 32px)' }}
          >
            <div className="flex items-center gap-2 text-[#DC2626]">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase">Confirm Record Deletion</h3>
            </div>
            <p className="text-xs text-[#5C5449] dark:text-[#D4D4D8] leading-relaxed">
              Are you sure you want to delete the result record for <strong>{result.game?.name}</strong> on <strong>{result.resultDate}</strong>? This action will be permanently recorded in the audit log.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={handleDelete}
                className="btn-primary !bg-[#DC2626] !text-white w-full text-xs font-bold uppercase"
              >
                {saving ? 'Deleting...' : 'Confirm Deletion'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary w-full text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Public Preview Modal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-5 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'calc(100% - 32px)' }}
          >
            <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2 text-left">
              <span className="text-xs font-black uppercase">Public Scoreboard Preview</span>
              <button onClick={() => setShowPreviewModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF8F5] dark:bg-[#18181B] rounded-[8px] border border-[#C5A059] space-y-2">
              <h4 className="text-sm font-black uppercase">{result.game?.name}</h4>
              <div className="text-xs text-[#71717A]">{formatReadableDate(result.resultDate)}</div>
              <div className="text-4xl font-black py-2 text-[#111113] dark:text-[#FAF8F5]">
                {resultValue.padStart(2, '0')}
              </div>
              <span className="badge-live">{status}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="btn-secondary w-full text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
