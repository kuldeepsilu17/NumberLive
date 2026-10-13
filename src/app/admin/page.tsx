import React from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  CalendarPlus,
  Clock,
  ArrowRight,
  FileCheck2,
  FileEdit,
  CheckCircle2,
  Archive,
  AlertCircle,
  Activity,
  PlusCircle,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDateToYYYYMMDD, getYesterdayYYYYMMDD, formatReadableDate } from '@/lib/utils';

export const revalidate = 0;

async function getAdminDashboardData() {
  const todayStr = formatDateToYYYYMMDD();
  const yesterdayStr = getYesterdayYYYYMMDD(todayStr);

  const [
    totalGames,
    activeGames,
    totalPublished,
    totalDrafts,
    totalArchived,
    totalResults,
    totalLogs,
    games,
    todayResults,
    recentResultUpdates,
    recentLogs,
  ] = await Promise.all([
    prisma.game.count(),
    prisma.game.count({ where: { isActive: true } }),
    prisma.result.count({ where: { status: 'PUBLISHED' } }),
    prisma.result.count({ where: { status: 'DRAFT' } }),
    prisma.result.count({ where: { status: 'ARCHIVED' } }),
    prisma.result.count(),
    prisma.auditLog.count(),
    prisma.game.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.result.findMany({ where: { resultDate: todayStr } }),
    prisma.result.findMany({
      take: 6,
      orderBy: { updatedAt: 'desc' },
      include: { game: true },
    }),
    prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const todayPublishedCount = todayResults.filter((r) => r.status === 'PUBLISHED').length;
  const todayDraftCount = todayResults.filter((r) => r.status === 'DRAFT').length;
  const todayPending = activeGames - todayPublishedCount;

  const resultMap: Record<string, any> = {};
  todayResults.forEach((r) => {
    resultMap[r.gameId] = r;
  });

  const gameStatuses = games.map((g) => ({
    game: g,
    result: resultMap[g.id] || null,
  }));

  return {
    stats: {
      totalGames,
      activeGames,
      totalPublished,
      totalDrafts,
      totalArchived,
      totalResults,
      todayPublishedCount,
      todayDraftCount,
      todayPending: Math.max(0, todayPending),
      totalLogs,
    },
    todayStr,
    gameStatuses,
    recentResultUpdates,
    recentLogs,
  };
}

export default async function AdminDashboardPage() {
  const { stats, todayStr, gameStatuses, recentResultUpdates, recentLogs } =
    await getAdminDashboardData();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111113] p-4 sm:p-5 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#C5A059]" />
            <span>Admin Results Control Dashboard</span>
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Server-side verification desk • System Date: {formatReadableDate(todayStr)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/results/new"
            className="btn-primary text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-[#C5A059]" />
            <span>New Result Workflow</span>
          </Link>
          <Link
            href="/admin/results"
            className="btn-secondary text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Manage All Results</span>
          </Link>
          <Link
            href="/admin/games"
            className="btn-secondary text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Games</span>
          </Link>
        </div>
      </div>

      {/* 5 Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Games */}
        <div className="bg-white dark:bg-[#111113] p-4 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-1">
          <span className="text-[11px] font-bold text-[#71717A] uppercase flex items-center gap-1">
            <Gamepad2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Total Games</span>
          </span>
          <div className="text-2xl font-black text-[#111113] dark:text-[#FAF8F5]">
            {stats.activeGames}
            <span className="text-xs text-[#71717A] font-normal"> / {stats.totalGames}</span>
          </div>
          <span className="text-[10px] text-[#71717A] block">Active regional games</span>
        </div>

        {/* Published Results */}
        <div className="bg-white dark:bg-[#111113] p-4 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-1">
          <span className="text-[11px] font-bold text-[#71717A] uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Published</span>
          </span>
          <div className="text-2xl font-black text-[#16A34A]">
            {stats.totalPublished}
          </div>
          <span className="text-[10px] text-[#16A34A] block">
            {stats.todayPublishedCount} published today
          </span>
        </div>

        {/* Draft Results */}
        <div className="bg-white dark:bg-[#111113] p-4 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-1">
          <span className="text-[11px] font-bold text-[#71717A] uppercase flex items-center gap-1">
            <FileEdit className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Draft Results</span>
          </span>
          <div className="text-2xl font-black text-[#D97706]">
            {stats.totalDrafts}
          </div>
          <span className="text-[10px] text-[#71717A] block">
            {stats.todayDraftCount} drafts for today
          </span>
        </div>

        {/* Archived Results */}
        <div className="bg-white dark:bg-[#111113] p-4 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-1">
          <span className="text-[11px] font-bold text-[#71717A] uppercase flex items-center gap-1">
            <Archive className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Archived</span>
          </span>
          <div className="text-2xl font-black text-[#71717A]">
            {stats.totalArchived}
          </div>
          <span className="text-[10px] text-[#71717A] block">Hidden from public</span>
        </div>

        {/* Total Audit Logs */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#111113] p-4 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-1">
          <span className="text-[11px] font-bold text-[#71717A] uppercase flex items-center gap-1">
            <FileCheck2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Audit Logs</span>
          </span>
          <div className="text-2xl font-black text-[#C5A059]">
            {stats.totalLogs}
          </div>
          <span className="text-[10px] text-[#71717A] block">Tamper-evident logs</span>
        </div>
      </div>

      {/* Main Grid: Today's Publishing Scoreboard & Recent Result Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today's Results Status (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden space-y-0">
          <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-black">
            <span className="text-[#111113] dark:text-[#FAF8F5] uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C5A059]" />
              <span>TODAY&apos;S SCHEDULE &amp; PUBLISHING DESK ({gameStatuses.length})</span>
            </span>
            <Link
              href="/admin/results/new"
              className="text-xs text-[#C5A059] hover:underline font-bold inline-flex items-center gap-1"
            >
              <span>+ New Entry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-3 divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
            {gameStatuses.map(({ game, result }) => {
              const isPublished = result && result.status === 'PUBLISHED';
              const isDraft = result && result.status === 'DRAFT';
              return (
                <div
                  key={game.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div>
                    <h3 className="font-bold text-[#111113] dark:text-[#FAF8F5] uppercase">
                      {game.name}
                    </h3>
                    <p className="text-[11px] text-[#71717A] flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-[#8C8275]" /> Scheduled: {game.resultTime}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-base text-[#111113] dark:text-white bg-[#FAF8F5] dark:bg-[#18181B] px-3 py-1 rounded-[6px] border border-[#EAE3D5] dark:border-[#2E2E33] min-w-[44px] text-center">
                      {result ? result.resultValue : '--'}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase ${
                        isPublished
                          ? 'text-[#16A34A] bg-[#F0FDF4] dark:bg-[#052E16] border border-[#BBF7D0] dark:border-[#166534]'
                          : isDraft
                          ? 'text-[#D97706] bg-[#FEF3C7] dark:bg-[#78350F] border border-[#FDE68A]'
                          : 'text-[#71717A] bg-[#FAF8F5] dark:bg-[#18181B]'
                      }`}
                    >
                      {isPublished ? 'Live' : isDraft ? 'Draft' : 'Pending'}
                    </span>

                    {result ? (
                      <Link
                        href={`/admin/results/${result.id}/edit`}
                        className="min-h-[38px] px-2.5 py-1 text-xs font-bold text-[#C5A059] hover:underline flex items-center"
                      >
                        Edit
                      </Link>
                    ) : (
                      <Link
                        href={`/admin/results/new?gameId=${game.id}`}
                        className="min-h-[38px] px-2.5 py-1 text-xs font-bold text-[#C5A059] hover:underline flex items-center"
                      >
                        Publish
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Admin Activity & Audit Feed (1 col) */}
        <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden space-y-0">
          <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-black">
            <span className="flex items-center gap-2 text-[#111113] dark:text-[#FAF8F5] uppercase">
              <FileCheck2 className="w-4 h-4 text-[#C5A059]" />
              <span>RECENT AUDIT TRAIL</span>
            </span>
            <Link
              href="/admin/audit-log"
              className="text-xs text-[#C5A059] hover:underline font-bold"
            >
              All →
            </Link>
          </div>

          <div className="p-3.5 space-y-2 text-xs">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#FAF8F5] dark:bg-[#18181B] rounded-[6px] border border-[#EAE3D5] dark:border-[#2E2E33] space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-[#111113] dark:text-[#FAF8F5]">
                  <span className="text-[11px] uppercase tracking-wide text-[#C5A059]">{log.action}</span>
                  <span className="text-[10px] text-[#71717A] font-normal">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-[#5C5449] dark:text-[#A1A1AA] text-xs">
                  {log.gameName ? (
                    <span>
                      <strong>{log.gameName}</strong>: {log.oldResult ? `${log.oldResult} → ` : ''}
                      <span className="text-[#C5A059] font-black">{log.newResult}</span> ({log.targetDate})
                    </span>
                  ) : (
                    log.reasonNote || 'System action'
                  )}
                </p>

                <div className="text-[10px] text-[#71717A] flex items-center justify-between pt-0.5">
                  <span>By: @{log.adminUsername}</span>
                  <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Result Updates Table */}
      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden">
        <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-black">
          <span className="text-[#111113] dark:text-[#FAF8F5] uppercase flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#C5A059]" />
            <span>RECENT RESULT UPDATES &amp; AUDITS</span>
          </span>
          <Link
            href="/admin/results"
            className="text-xs text-[#C5A059] hover:underline font-bold"
          >
            Full Results Table →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="results-table">
            <thead>
              <tr>
                <th>Game</th>
                <th>Date</th>
                <th className="text-center">Result</th>
                <th>Status</th>
                <th>Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
              {recentResultUpdates.map((r) => (
                <tr key={r.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] transition-colors">
                  <td className="font-bold uppercase text-[#111113] dark:text-[#FAF8F5]">
                    {r.game?.name}
                  </td>
                  <td className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                    {formatReadableDate(r.resultDate)}
                  </td>
                  <td className="text-center">
                    <span className="font-black text-base text-[#111113] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B] px-3 py-1 rounded-[4px] border border-[#EAE3D5] dark:border-[#2E2E33]">
                      {r.resultValue}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge-live ${
                        r.status === 'PUBLISHED'
                          ? ''
                          : r.status === 'DRAFT'
                          ? '!bg-[#FEF3C7] !text-[#D97706] !border-[#FDE68A]'
                          : '!bg-[#FAF8F5] !text-[#71717A] !border-[#EAE3D5]'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="text-xs text-[#71717A]">
                    {new Date(r.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/admin/results/${r.id}/edit`}
                      className="btn-secondary !min-h-[32px] !px-3 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <span>Edit / Correct</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
