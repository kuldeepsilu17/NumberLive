'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  FileEdit,
  Clock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Check,
  PlusCircle,
} from 'lucide-react';

interface OwnerStats {
  totalGames: number;
  activeGames: number;
  totalPublished: number;
  totalDrafts: number;
  totalArchived: number;
  totalResults: number;
  todayPublished: number;
  todayDrafts: number;
  unreadMessages: number;
  totalUsers: number;
  todayDate: string;
}

interface GameSummary {
  id: string;
  name: string;
  slug: string;
  category: string;
  resultTime: string;
  yesterdayResult: string | null;
  todayResult: string | null;
  status: string;
  todayResultId: string | null;
  updatedAt: string | null;
}

interface RecentResult {
  id: string;
  resultDate: string;
  resultValue: string;
  status: string;
  updatedAt: string;
  game: {
    name: string;
    slug: string;
  };
}

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [gamesSummary, setGamesSummary] = useState<GameSummary[]>([]);
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quickPublishingId, setQuickPublishingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/owner/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setGamesSummary(data.gamesSummary || []);
        setRecentResults(data.recentResults || []);
      }
    } catch (e) {
      console.error('Failed to load owner stats:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleQuickPublish = async (gameId: string, resultId: string | null, gameName: string) => {
    if (!resultId) return;
    setQuickPublishingId(gameId);
    try {
      const res = await fetch('/api/results', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resultId,
          status: 'PUBLISHED',
          reasonNote: `Published from Dashboard`,
        }),
      });

      if (res.ok) {
        setActionSuccess(`Published today's result for ${gameName}`);
        setTimeout(() => setActionSuccess(null), 3000);
        await fetchStats();
      }
    } catch (e) {
      console.error('Quick publish error:', e);
    } finally {
      setQuickPublishingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded-[8px]" />
          ))}
        </div>
      </div>
    );
  }

  const upcomingCount = gamesSummary.filter((g) => g.status === 'PENDING').length;

  return (
    <div className="space-y-5">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5] dark:border-[#27272A]">
        <div>
          <h1 className="text-lg font-bold text-[#20201E] dark:text-[#FAF8F5] uppercase tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Real-time publishing operations &mdash; {stats?.todayDate || 'Today'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 h-[36px] px-3 rounded-[6px] text-xs font-semibold bg-white dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] hover:bg-[#FAF8F5] dark:hover:bg-[#222226] text-[#20201E] dark:text-[#FAF8F5] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/owner/results/new"
            className="flex items-center gap-1.5 h-[36px] px-3.5 rounded-[6px] text-xs font-semibold text-white bg-[#20201E] hover:bg-[#333330] dark:bg-[#FAF8F5] dark:text-[#20201E] dark:hover:bg-white transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Create Result</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-[6px] bg-[#ECFDF5] dark:bg-[#062D20] border border-[#A7F3D0] dark:border-[#065F46] text-xs text-[#047857] dark:text-[#6EE7B7] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 2. Practical Information Blocks: Published Results, Today's Results, Upcoming Results, Draft Results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Published Results */}
        <div className="bg-white dark:bg-[#111113] border border-[#E5E5E5] dark:border-[#27272A] rounded-[8px] p-3.5 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-[#71717A] dark:text-[#A1A1AA]">
            Published Results
          </div>
          <div className="mt-2 text-2xl font-bold text-[#20201E] dark:text-[#FAF8F5] tabular-nums">
            {stats?.totalPublished || 0}
          </div>
          <div className="text-[11px] text-[#71717A] mt-0.5">
            Total in database
          </div>
        </div>

        {/* Today's Results */}
        <div className="bg-white dark:bg-[#111113] border border-[#E5E5E5] dark:border-[#27272A] rounded-[8px] p-3.5 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-[#059669] dark:text-[#34D399]">
            Today&apos;s Results
          </div>
          <div className="mt-2 text-2xl font-bold text-[#059669] dark:text-[#34D399] tabular-nums">
            {stats?.todayPublished || 0}
          </div>
          <div className="text-[11px] text-[#71717A] mt-0.5">
            Published today
          </div>
        </div>

        {/* Upcoming Results */}
        <div className="bg-white dark:bg-[#111113] border border-[#E5E5E5] dark:border-[#27272A] rounded-[8px] p-3.5 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-[#71717A] dark:text-[#A1A1AA]">
            Upcoming Results
          </div>
          <div className="mt-2 text-2xl font-bold text-[#20201E] dark:text-[#FAF8F5] tabular-nums">
            {upcomingCount}
          </div>
          <div className="text-[11px] text-[#71717A] mt-0.5">
            Pending for today
          </div>
        </div>

        {/* Draft Results */}
        <div className="bg-white dark:bg-[#111113] border border-[#E5E5E5] dark:border-[#27272A] rounded-[8px] p-3.5 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-[#D97706] dark:text-[#FBBF24]">
            Draft Results
          </div>
          <div className="mt-2 text-2xl font-bold text-[#D97706] dark:text-[#FBBF24] tabular-nums">
            {stats?.totalDrafts || 0}
          </div>
          <div className="text-[11px] text-[#71717A] mt-0.5">
            Private drafts
          </div>
        </div>
      </div>

      {/* 3. Today's Publishing Table */}
      <div className="bg-white dark:bg-[#111113] border border-[#E5E5E5] dark:border-[#27272A] rounded-[8px] shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-[#FAF8F5] dark:bg-[#18181B] border-b border-[#E5E5E5] dark:border-[#27272A] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#20201E] dark:text-[#FAF8F5]">
            Today&apos;s Games &mdash; Status &amp; Actions
          </h2>
          <Link
            href="/owner/results"
            className="text-xs font-semibold text-[#71717A] hover:text-[#20201E] dark:hover:text-white flex items-center gap-1"
          >
            <span>All Results</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-[#E5E5E5] dark:divide-[#27272A]">
          {gamesSummary.map((item) => {
            const isPublished = item.status === 'PUBLISHED';
            const isDraft = item.status === 'DRAFT';
            const isPending = item.status === 'PENDING';

            return (
              <div
                key={item.id}
                className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-[#FAF8F5]/60 dark:hover:bg-[#161619] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#20201E] dark:text-[#FAF8F5] truncate">
                      {item.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-[4px] border ${
                        isPublished
                          ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#064E3B]/30 dark:border-[#059669]'
                          : isDraft
                          ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] dark:bg-[#78350F]/30 dark:border-[#D97706]'
                          : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1] dark:bg-[#1E293B] dark:border-[#475569]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-[#71717A]" />
                    <span>Time: {item.resultTime}</span>
                  </div>
                </div>

                {/* Result Value */}
                <div className="text-right px-3">
                  <span className="text-[20px] font-bold text-[#20201E] dark:text-[#FAF8F5] tabular-nums">
                    {item.todayResult ? item.todayResult.padStart(2, '0') : '--'}
                  </span>
                </div>

                {/* Action */}
                <div className="shrink-0">
                  {isDraft && item.todayResultId && (
                    <button
                      onClick={() => handleQuickPublish(item.id, item.todayResultId, item.name)}
                      disabled={quickPublishingId === item.id}
                      className="h-8 px-2.5 rounded-[4px] text-xs font-semibold text-[#059669] bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0] dark:border-[#059669] hover:bg-[#D1FAE5] transition-colors flex items-center gap-1"
                    >
                      {quickPublishingId === item.id ? (
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      <span>Publish</span>
                    </button>
                  )}

                  {isPending && (
                    <Link
                      href={`/owner/results/new?gameId=${item.id}`}
                      className="inline-flex items-center h-8 px-3 rounded-[4px] text-xs font-semibold text-[#20201E] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] hover:border-[#C5A059] transition-colors"
                    >
                      + Add Result
                    </Link>
                  )}

                  {isPublished && item.todayResultId && (
                    <Link
                      href={`/owner/results/${item.todayResultId}/edit`}
                      className="inline-flex items-center h-8 px-3 rounded-[4px] text-xs font-semibold text-[#71717A] hover:text-[#20201E] dark:hover:text-white transition-colors"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
