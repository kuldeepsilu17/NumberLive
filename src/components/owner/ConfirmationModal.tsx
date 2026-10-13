'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-2xl space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isDestructive
                  ? 'bg-[#FEF2F2] dark:bg-[#2D1515] text-[#DC2626]'
                  : 'bg-[#FFFBEB] dark:bg-[#2B220B] text-[#D97706]'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#111113] dark:text-[#FAF8F5]">
                {title}
              </h3>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                Confirmation required
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-[#71717A] hover:text-[#111113] dark:hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[#5C5449] dark:text-[#D4D4D8] leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EAE3D5] dark:border-[#2E2E33]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="min-h-[40px] px-4 py-2 rounded-[6px] text-xs font-bold text-[#5C5449] dark:text-[#D4D4D8] bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] hover:bg-[#F0EBE1] dark:hover:bg-[#2A2A30] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`min-h-[40px] px-4 py-2 rounded-[6px] text-xs font-bold text-white transition-all flex items-center gap-2 ${
              isDestructive
                ? 'bg-[#DC2626] hover:bg-[#B91C1C] active:scale-[0.98]'
                : 'bg-[#C5A059] hover:bg-[#B38F46] text-[#111113] font-black active:scale-[0.98]'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
