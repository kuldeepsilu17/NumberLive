'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  FileCheck2,
  X,
  Eye,
} from 'lucide-react';

interface AuditItem {
  id: string;
  adminId: string | null;
  adminUsername: string;
  action: string;
  gameId: string | null;
  gameName: string | null;
  targetDate: string | null;
  oldResult: string | null;
  newResult: string | null;
  reasonNote: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export default function OwnerAuditLogPage() {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditItem | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '30');
      if (selectedAction && selectedAction !== 'ALL') {
        params.set('action', selectedAction);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setLoading(false);
    }
  }, [page, selectedAction, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Timestamp (UTC)', 'Admin Username', 'Action', 'Target Game', 'Date', 'Old Value', 'New Value', 'Reason / Notes', 'IP Address'];
      const rows = logs.map((l) => [
        `"${new Date(l.createdAt).toISOString()}"`,
        `"${l.adminUsername}"`,
        `"${l.action}"`,
        `"${l.gameName || 'System'}"`,
        `"${l.targetDate || ''}"`,
        `"${l.oldResult || ''}"`,
        `"${l.newResult || ''}"`,
        `"${(l.reasonNote || '').replace(/"/g, '""')}"`,
        `"${l.ipAddress || ''}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `NumberLive_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">
            COMPLIANCE & TRACEABILITY
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
            Security & Editorial Audit Trail
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Immutable log of all result entries, publishing events, corrections, deletions, and owner logins. Total recorded events: {totalCount}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-[6px] text-xs font-bold bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] hover:text-[#C5A059] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C5A059]' : ''}`} />
            <span>Refresh Trail</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-[6px] text-xs font-black uppercase tracking-wider text-black bg-[#C5A059] hover:bg-[#B38F46] transition-all shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Trail</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Card */}
      <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-4 shadow-subtle space-y-4">
        {/* Action Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-3">
          {[
            { label: 'All Actions', value: 'ALL' },
            { label: 'Logins & Auth', value: 'OWNER_LOGIN' },
            { label: 'Publish Events', value: 'PUBLISH_RESULT' },
            { label: 'Corrections', value: 'CORRECT_RESULT' },
            { label: 'Draft Entries', value: 'CREATE_RESULT' },
            { label: 'Deletions', value: 'DELETE_RESULT' },
            { label: 'Games Config', value: 'CREATE_GAME' },
            { label: 'System Settings', value: 'UPDATE_SETTING' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setSelectedAction(tab.value);
                setPage(1);
              }}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-[6px] text-xs font-bold whitespace-nowrap transition-colors ${
                selectedAction === tab.value
                  ? 'bg-[#111113] text-[#C5A059] border border-[#C5A059] shadow-xs'
                  : 'bg-[#FAF8F5] dark:bg-[#1C1C20] text-[#5C5449] dark:text-[#D4D4D8] border border-[#EAE3D5] dark:border-[#2E2E33] hover:text-[#111113]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C8275] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, game name, date (YYYY-MM-DD), or reason..."
              className="w-full min-h-[40px] pl-9 pr-3 py-1.5 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
            />
          </div>
          <button
            type="submit"
            className="min-h-[40px] px-4 rounded-[6px] text-xs font-bold bg-[#111113] dark:bg-[#FAF8F5] text-white dark:text-black shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] animate-pulse space-y-2">
            <div className="inline-block w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
            <div>Verifying audit integrity...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileCheck2 className="w-8 h-8 text-[#8C8275] mx-auto opacity-50" />
            <h4 className="text-sm font-bold text-[#111113] dark:text-[#FAF8F5]">
              No Audit Records Match Filters
            </h4>
            <p className="text-xs text-[#71717A]">
              Try clearing search parameters to view the complete log.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] dark:bg-[#1C1C20] border-b border-[#EAE3D5] dark:border-[#2E2E33] text-[10px] font-black uppercase text-[#8C8275] dark:text-[#A1A1AA]">
                    <th className="py-3 px-4">Event Timestamp</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Game / Date</th>
                    <th className="py-3 px-4 text-center">Value Transition</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
                  {logs.map((log) => {
                    const isPublish = log.action === 'PUBLISH_RESULT';
                    const isCorrect = log.action === 'CORRECT_RESULT';
                    const isDelete = log.action === 'DELETE_RESULT' || log.action === 'DELETE_GAME';
                    const isLogin = log.action === 'OWNER_LOGIN' || log.action === 'ADMIN_LOGIN';

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-[#FAF8F5]/60 dark:hover:bg-[#1C1C20]/60 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-[11px] text-[#5C5449] dark:text-[#D4D4D8] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                          })}
                        </td>

                        <td className="py-3 px-4 font-bold text-[#111113] dark:text-[#FAF8F5]">
                          @{log.adminUsername}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                              isPublish
                                ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                                : isCorrect
                                ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                                : isDelete
                                ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                                : isLogin
                                ? 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]'
                                : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-[#5C5449] dark:text-[#D4D4D8]">
                          {log.gameName ? (
                            <div>
                              <span className="font-bold">{log.gameName}</span>
                              {log.targetDate && (
                                <span className="text-[10px] text-[#8C8275] block font-mono">
                                  {log.targetDate}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#8C8275] italic">System</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {log.newResult !== null && log.newResult !== undefined ? (
                            <div className="flex items-center justify-center gap-1.5 font-mono text-xs font-black">
                              {log.oldResult && (
                                <>
                                  <span className="text-[#8C8275] line-through">
                                    {log.oldResult.padStart(2, '0')}
                                  </span>
                                  <span className="text-[#8C8275]">→</span>
                                </>
                              )}
                              <span className="text-[#059669] dark:text-[#34D399]">
                                {log.newResult.padStart(2, '0')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#8C8275] text-[10px]">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-[#5C5449] dark:text-[#D4D4D8] max-w-xs truncate text-[11px]">
                          {log.reasonNote || 'Automated verification'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 rounded text-[#71717A] hover:text-[#111113] dark:hover:text-white hover:bg-[#FAF8F5]"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#1C1C20] border-t border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-between text-xs">
                <span className="text-[#71717A] dark:text-[#A1A1AA]">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded border border-[#EAE3D5] dark:border-[#2E2E33] bg-white dark:bg-[#151518] disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded border border-[#EAE3D5] dark:border-[#2E2E33] bg-white dark:bg-[#151518] disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
              <div>
                <h3 className="text-sm font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
                  Audit Record Inspection
                </h3>
                <p className="text-[11px] font-mono text-[#8C8275]">
                  ID: {selectedLog.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-[#71717A] hover:text-[#111113] dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-[8px] bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33]">
                <div>
                  <span className="text-[10px] uppercase text-[#8C8275] block">Action</span>
                  <span className="font-bold text-[#C5A059]">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#8C8275] block">Author</span>
                  <span className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                    @{selectedLog.adminUsername}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#8C8275] block">Timestamp</span>
                  <span className="font-mono text-[#5C5449] dark:text-[#D4D4D8]">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#8C8275] block">Origin IP</span>
                  <span className="font-mono text-[#5C5449] dark:text-[#D4D4D8]">
                    {selectedLog.ipAddress || '127.0.0.1'}
                  </span>
                </div>
              </div>

              {selectedLog.gameName && (
                <div className="p-3 rounded-[8px] bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] space-y-1">
                  <div className="text-[10px] uppercase text-[#8C8275]">Entity Information</div>
                  <div className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                    {selectedLog.gameName} ({selectedLog.targetDate || 'General'})
                  </div>
                  {selectedLog.newResult && (
                    <div className="text-xs font-mono pt-1">
                      Outcome: {selectedLog.oldResult ? `${selectedLog.oldResult} → ` : ''}
                      <strong>{selectedLog.newResult}</strong>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] uppercase text-[#8C8275] block">Editorial / Audit Reason Note</span>
                <div className="p-3 rounded-[6px] bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#111113] dark:text-[#FAF8F5]">
                  {selectedLog.reasonNote || 'No specific note attached.'}
                </div>
              </div>

              {selectedLog.userAgent && (
                <div className="text-[10px] text-[#8C8275] truncate">
                  User-Agent: {selectedLog.userAgent}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#EAE3D5] dark:border-[#2E2E33]">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded bg-[#111113] dark:bg-[#FAF8F5] text-white dark:text-black text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
