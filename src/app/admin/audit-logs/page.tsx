'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { AuditLogItem } from '@/types';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (actionFilter) params.set('action', actionFilter);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalLogs(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error('Failed to load logs:', e);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'PUBLISH_RESULT':
        return 'text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] dark:bg-[#052E16] dark:border-[#166534]';
      case 'CORRECT_RESULT':
        return 'text-[#C5A059] bg-[#FAF8F5] border border-[#C5A059]/40 dark:bg-[#18181B]';
      case 'CREATE_RESULT':
        return 'text-[#111113] bg-[#FAF8F5] border border-[#EAE3D5] dark:text-[#FAF8F5] dark:bg-[#18181B] dark:border-[#2E2E33]';
      default:
        return 'text-[#71717A] bg-[#FAF8F5] border border-[#EAE3D5] dark:bg-[#18181B] dark:border-[#2E2E33]';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111113] p-4 sm:p-5 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#C5A059]" />
            <span>Audit Trail &amp; Transparency Ledger</span>
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Tamper-evident chronological log of all results published, corrected, and modified.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="self-start sm:self-auto btn-secondary text-xs sm:text-sm font-bold min-h-[44px]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="font-bold text-[#71717A] uppercase text-xs">
            Filter Action:
          </label>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="form-select text-xs sm:text-sm font-bold w-full sm:w-auto"
          >
            <option value="">All Actions ({totalLogs})</option>
            <option value="PUBLISH_RESULT">PUBLISH_RESULT</option>
            <option value="CORRECT_RESULT">CORRECT_RESULT</option>
            <option value="CREATE_RESULT">CREATE_RESULT</option>
            <option value="UPDATE_RESULT">UPDATE_RESULT</option>
            <option value="CREATE_GAME">CREATE_GAME</option>
            <option value="UPDATE_GAME">UPDATE_GAME</option>
          </select>
        </div>

        <div className="text-[#71717A] text-xs font-bold self-end sm:self-auto">
          Showing {logs.length} of {totalLogs} events
        </div>
      </div>

      {/* Logs Table & Mobile Cards */}
      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden">
        {/* Desktop Table View (md+ screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="results-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Editor</th>
                <th>Action</th>
                <th>Target Details</th>
                <th className="text-center">Value Diff</th>
                <th>Editorial Reason</th>
                <th className="text-right">Host</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#71717A] text-xs">
                    Loading audit trail logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-[#71717A] text-xs">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#18181B]">
                    <td className="text-[#71717A] whitespace-nowrap">
                      <div className="font-bold text-[#111113] dark:text-[#FAF8F5] text-xs">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-[#71717A]">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </td>

                    <td className="font-bold text-[#111113] dark:text-[#FAF8F5] uppercase text-xs">
                      {log.adminUsername}
                    </td>

                    <td className="whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td>
                      <div className="font-bold text-[#111113] dark:text-[#FAF8F5] uppercase text-xs">
                        {log.gameName || '--'}
                      </div>
                      {log.targetDate && (
                        <div className="text-[10px] text-[#71717A] font-medium">
                          {log.targetDate}
                        </div>
                      )}
                    </td>

                    <td className="text-center whitespace-nowrap">
                      {log.oldResult || log.newResult ? (
                        <div className="inline-flex items-center gap-1.5 text-xs">
                          {log.oldResult ? (
                            <span className="px-1.5 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#18181B] text-[#71717A] line-through">
                              {log.oldResult}
                            </span>
                          ) : (
                            <span className="text-[#71717A] text-[10px]">New:</span>
                          )}
                          {log.oldResult && <ArrowRight className="w-3.5 h-3.5 text-[#71717A]" />}
                          <span className="px-2 py-0.5 rounded font-black text-[#111113] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#C5A059]/50">
                            {log.newResult}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#71717A]">--</span>
                      )}
                    </td>

                    <td className="text-[#5C5449] dark:text-[#A1A1AA] max-w-xs truncate text-xs">
                      {log.reasonNote || 'Direct publication'}
                    </td>

                    <td className="text-right font-mono text-[10px] text-[#71717A]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (< md screens) */}
        <div className="md:hidden p-3.5 space-y-3">
          {loading ? (
            <div className="py-8 text-center text-xs text-[#71717A]">
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#71717A]">
              No audit logs found.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[8px] p-3.5 space-y-2 text-xs shadow-subtle"
              >
                <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${getActionBadgeColor(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-[10px] text-[#71717A]">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-black text-xs uppercase text-[#111113] dark:text-[#FAF8F5] block">
                      {log.gameName || 'System Target'}
                    </span>
                    <span className="text-[10px] text-[#71717A]">
                      Editor: <strong>{log.adminUsername}</strong>
                    </span>
                  </div>

                  {log.oldResult || log.newResult ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {log.oldResult && <span className="line-through text-[#71717A]">{log.oldResult}</span>}
                      {log.oldResult && <span>→</span>}
                      <span className="text-[#C5A059] font-black text-sm bg-white dark:bg-[#111113] px-2 py-0.5 rounded border border-[#EAE3D5] dark:border-[#2E2E33]">
                        {log.newResult}
                      </span>
                    </div>
                  ) : null}
                </div>

                {log.reasonNote && (
                  <p className="text-[11px] text-[#71717A] bg-white dark:bg-[#111113] p-2 rounded border border-[#EAE3D5] dark:border-[#2E2E33]">
                    {log.reasonNote}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer (44px buttons) */}
        <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#111113] border-t border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-between text-xs sm:text-sm text-[#71717A] font-bold">
          <div>
            Page <span className="text-[#111113] dark:text-[#FAF8F5]">{page}</span> of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="min-h-[44px] px-3.5 sm:px-4 rounded-[6px] border border-[#EAE3D5] dark:border-[#2E2E33] bg-white dark:bg-[#18181B] text-[#111113] dark:text-[#FAF8F5] disabled:opacity-40 hover:bg-[#FAF8F5] text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="min-h-[44px] px-3.5 sm:px-4 rounded-[6px] border border-[#EAE3D5] dark:border-[#2E2E33] bg-white dark:bg-[#18181B] text-[#111113] dark:text-[#FAF8F5] disabled:opacity-40 hover:bg-[#FAF8F5] text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
