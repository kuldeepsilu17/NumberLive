'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import {
  FileCheck2,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { AuditLogItem } from '@/types';
import { formatReadableDate } from '@/lib/utils';

function AdminAuditLogContent() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '25');
      if (actionFilter) params.set('action', actionFilter);
      if (searchQuery) params.set('search', searchQuery);

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
  }, [page, actionFilter, searchQuery]);

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
      case 'ARCHIVE_RESULT':
      case 'UNPUBLISH_RESULT':
        return 'text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A] dark:bg-[#78350F]';
      case 'DELETE_RESULT':
      case 'DELETE_GAME':
        return 'text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] dark:bg-[#18181B]';
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
            Tamper-evident chronological log of all results created, published, corrected, and archived.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="self-start sm:self-auto btn-secondary text-xs sm:text-sm font-bold min-h-[42px] inline-flex items-center gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 shadow-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="font-bold text-[#71717A] uppercase text-[11px] block mb-1">
            Filter Action
          </label>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="form-select text-xs font-bold"
          >
            <option value="">All Actions ({totalLogs})</option>
            <option value="PUBLISH_RESULT">PUBLISH_RESULT</option>
            <option value="CREATE_RESULT">CREATE_RESULT</option>
            <option value="CORRECT_RESULT">CORRECT_RESULT</option>
            <option value="UPDATE_RESULT">UPDATE_RESULT</option>
            <option value="ARCHIVE_RESULT">ARCHIVE_RESULT</option>
            <option value="UNPUBLISH_RESULT">UNPUBLISH_RESULT</option>
            <option value="DELETE_RESULT">DELETE_RESULT</option>
            <option value="CREATE_GAME">CREATE_GAME</option>
            <option value="UPDATE_GAME">UPDATE_GAME</option>
            <option value="UPDATE_SETTING">UPDATE_SETTING</option>
          </select>
        </div>

        <div className="sm:col-span-1 lg:col-span-2">
          <label className="font-bold text-[#71717A] uppercase text-[11px] block mb-1">
            Search Audit Trail
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by admin username, game name, date, or note..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="form-input text-xs pl-8 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-3" />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden">
        <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-black">
          <span className="flex items-center gap-2 text-[#111113] dark:text-[#FAF8F5] uppercase">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>AUDIT RECORDS ({totalLogs} TOTAL)</span>
          </span>
          <span className="text-[10px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] px-2.5 py-1 rounded-[4px] font-mono font-bold">
            PAGE {page} OF {totalPages || 1}
          </span>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="results-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Game &amp; Date</th>
                <th className="text-center">Value Diff</th>
                <th>Audit Note / IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-[#71717A]">
                    No audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] transition-colors">
                    {/* Timestamp */}
                    <td className="text-xs text-[#71717A] whitespace-nowrap">
                      <div className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </td>

                    {/* Admin */}
                    <td className="font-bold text-xs text-[#111113] dark:text-[#FAF8F5] whitespace-nowrap">
                      @{log.adminUsername}
                    </td>

                    {/* Action */}
                    <td>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase whitespace-nowrap ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Game & Date */}
                    <td className="text-xs">
                      {log.gameName ? (
                        <div>
                          <strong className="text-[#111113] dark:text-[#FAF8F5] uppercase block">{log.gameName}</strong>
                          <span className="text-[10px] text-[#71717A] font-mono">{log.targetDate}</span>
                        </div>
                      ) : (
                        <span className="text-[#71717A]">—</span>
                      )}
                    </td>

                    {/* Value Diff */}
                    <td className="text-center whitespace-nowrap">
                      {log.newResult ? (
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                          {log.oldResult ? (
                            <span className="line-through text-[#71717A]">{log.oldResult}</span>
                          ) : null}
                          {log.oldResult ? <span>→</span> : null}
                          <span className="font-black text-sm text-[#111113] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B] px-2 py-0.5 rounded border border-[#EAE3D5] dark:border-[#2E2E33]">
                            {log.newResult}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#71717A] text-xs">—</span>
                      )}
                    </td>

                    {/* Reason Note / IP */}
                    <td className="text-xs max-w-xs">
                      <div className="text-[#111113] dark:text-[#FAF8F5] truncate font-medium" title={log.reasonNote || ''}>
                        {log.reasonNote || 'System automated event'}
                      </div>
                      <div className="text-[10px] text-[#71717A] font-mono mt-0.5">
                        IP: {log.ipAddress || '127.0.0.1'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden p-3.5 space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[8px] p-3.5 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase ${getActionBadgeColor(log.action)}`}>
                  {log.action}
                </span>
                <span className="text-[10px] text-[#71717A]">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {log.gameName && (
                <div className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                  {log.gameName} ({log.targetDate})
                </div>
              )}

              {log.newResult && (
                <div className="flex items-center gap-2">
                  <span className="text-[#71717A]">Result Diff:</span>
                  {log.oldResult && <span className="line-through text-[#71717A]">{log.oldResult} →</span>}
                  <strong className="text-[#C5A059] font-black text-sm">{log.newResult}</strong>
                </div>
              )}

              {log.reasonNote && (
                <p className="text-xs text-[#5C5449] dark:text-[#A1A1AA]">{log.reasonNote}</p>
              )}

              <div className="flex items-center justify-between text-[10px] text-[#71717A] pt-1 border-t border-[#EAE3D5] dark:border-[#2E2E33]">
                <span>By: @{log.adminUsername}</span>
                <span>{new Date(log.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
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
    </div>
  );
}

export default function AdminAuditLogPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-[#71717A] text-xs">Loading audit ledger...</div>}>
      <AdminAuditLogContent />
    </Suspense>
  );
}
