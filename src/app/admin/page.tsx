import React from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  CalendarPlus,
  Clock,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { getYesterdayYYYYMMDD, formatReadableDate } from '@/lib/utils';

export const revalidate = 0;

async function getAdminDashboardData() {
  const todayStr = '2026-09-17';
  const yesterdayStr = getYesterdayYYYYMMDD(todayStr);

  const [
    totalGames,
    activeGames,
    totalResults,
    totalLogs,
    games,
    todayResults,
    recentLogs,
  ] = await Promise.all([
    prisma.game.count(),
    prisma.game.count({ where: { isActive: true } }),
    prisma.result.count(),
    prisma.auditLog.count(),
    prisma.game.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.result.findMany({ where: { resultDate: todayStr } }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const todayPublished = todayResults.filter((r) => r.status === 'PUBLISHED').length;
  const todayPending = activeGames - todayPublished;

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
      todayPublished,
      todayPending: Math.max(0, todayPending),
      totalResults,
      totalLogs,
    },
    todayStr,
    gameStatuses,
    recentLogs,
  };
}

export default async function AdminDashboardPage() {
  const { stats, todayStr, gameStatuses, recentLogs } = await getAdminDashboardData();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111113] p-4 sm:p-5 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            System status for {formatReadableDate(todayStr)} • Public Records System
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Link
            href="/admin/results"
            className="btn-primary text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5"
          >
            <CalendarPlus className="w-4 h-4 text-[#C5A059]" />
            <span>Publish Result</span>
          </Link>
          <Link
            href="/admin/games"
            className="btn-secondary text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Manage Games</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards: 1 column on Mobile, 2 on Tablet, 4 on Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#111113] p-4 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-1">
          <span className="text-[11px] font-bold text-[#71717A] uppercase">
            Total Games
          </span>
          <div className="text-2xl font-black text-[#111113] dark:text-[#FAF8F5]">
            {stats.activeGames}
            <span className="text-sm text-[#71717A] font-normal"> / {stats.totalGames}</span>
          </div>
          <span className="text-[11px] text-[#71717A] block">
            Active in timetable
          </span>
        </div>

        <div className="bg-white dark:bg-[#111113] p-4 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-1">
          <span className="text-[11px] font-bold text-[#71717A] uppercase">
            Published Today
          </span>
          <div className="text-2xl font-black text-[#16A34A]">
            {stats.todayPublished}
          </div>
          <span className="text-[11px] text-[#71717A] block">
            Live on scoreboard
          </span>
        </div>

        <div className="bg-white dark:bg-[#111113] p-4 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-1">
          <span className="text-[11px] font-bold text-[#71717A] uppercase">
            Pending Today
          </span>
          <div className="text-2xl font-black text-[#5C5449] dark:text-[#D4D4D8]">
            {stats.todayPending}
          </div>
          <span className="text-[11px] text-[#71717A] block">
            Awaiting release time
          </span>
        </div>

        <div className="bg-white dark:bg-[#111113] p-4 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-1">
          <span className="text-[11px] font-bold text-[#71717A] uppercase">
            Audited Logs
          </span>
          <div className="text-2xl font-black text-[#C5A059]">
            {stats.totalLogs}
          </div>
          <span className="text-[11px] text-[#71717A] block">
            Tamper-evident records
          </span>
        </div>
      </div>

      {/* Main Grid: Publishing Status & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today's Results Status (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden space-y-0">
          <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-black">
            <span className="text-[#111113] dark:text-[#FAF8F5] uppercase">TODAY&apos;S PUBLISHING SCOREBOARD</span>
            <Link
              href="/admin/results"
              className="text-xs text-[#C5A059] hover:underline font-bold inline-flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-3 divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
            {gameStatuses.map(({ game, result }) => {
              const isPublished = result && result.status === 'PUBLISHED';
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
                    <span className="font-black text-base text-[#111113] dark:text-white bg-[#FAF8F5] dark:bg-[#18181B] px-3 py-1 rounded-[6px] border border-[#EAE3D5] dark:border-[#2E2E33] min-w-[40px] text-center">
                      {result ? result.resultValue : '--'}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase ${
                        isPublished
                          ? 'text-[#16A34A] bg-[#F0FDF4] dark:bg-[#052E16] border border-[#BBF7D0] dark:border-[#166534]'
                          : 'text-[#71717A] bg-[#FAF8F5] dark:bg-[#18181B]'
                      }`}
                    >
                      {isPublished ? 'Live' : 'Wait'}
                    </span>

                    <Link
                      href={`/admin/results?gameId=${game.id}`}
                      className="min-h-[38px] px-2.5 py-1 text-xs font-bold text-[#C5A059] hover:underline flex items-center"
                    >
                      {isPublished ? 'Edit' : 'Publish'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Audit Trail Feed (1 col) */}
        <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden space-y-0">
          <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-black">
            <span className="flex items-center gap-2 text-[#111113] dark:text-[#FAF8F5] uppercase">
              <FileCheck2 className="w-4 h-4 text-[#C5A059]" />
              <span>RECENT AUDIT LOGS</span>
            </span>
            <Link
              href="/admin/audit-logs"
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
                  <span>{log.action}</span>
                  <span className="text-[10px] text-[#71717A] font-normal">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-[#5C5449] dark:text-[#A1A1AA] text-xs">
                  {log.gameName ? (
                    <span>
                      {log.gameName}: {log.oldResult ? `${log.oldResult} → ` : ''}
                      <strong className="text-[#C5A059] font-black">{log.newResult}</strong>
                    </span>
                  ) : (
                    log.reasonNote || 'System action'
                  )}
                </p>

                <div className="text-[10px] text-[#71717A]">
                  Editor: {log.adminUsername}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
