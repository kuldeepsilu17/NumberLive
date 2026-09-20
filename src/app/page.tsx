import React from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Calendar,
  Layers,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { getYesterdayYYYYMMDD } from '@/lib/utils';
import LiveTicker from '@/components/home/LiveTicker';
import NoticeBoard from '@/components/home/NoticeBoard';
import TodayResultsGrid from '@/components/home/TodayResultsGrid';
import LatestResultsTable from '@/components/home/LatestResultsTable';
import GameScheduleTable from '@/components/home/GameScheduleTable';
import AllGamesBoxes from '@/components/home/AllGamesBoxes';
import MonthlyMatrix from '@/components/charts/MonthlyMatrix';
import YearlyMatrix from '@/components/charts/YearlyMatrix';
import RightSidebar from '@/components/layout/RightSidebar';

export const revalidate = 10;

async function getInitialData() {
  const todayStr = '2026-09-17';
  const yesterdayStr = getYesterdayYYYYMMDD(todayStr);

  try {
    const [games, todayResults, yesterdayResults, siteSettings, faqs] = await Promise.all([
      prisma.game.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { category: true },
      }),
      prisma.result.findMany({
        where: { resultDate: todayStr },
      }),
      prisma.result.findMany({
        where: { resultDate: yesterdayStr, status: 'PUBLISHED' },
      }),
      prisma.siteSetting.findMany(),
      prisma.fAQ.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 4,
      }),
    ]);

    const settingsMap: Record<string, string> = {};
    siteSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const resultMap: Record<string, { today: any; yesterday: any }> = {};
    games.forEach((g) => {
      resultMap[g.id] = { today: null, yesterday: null };
    });

    todayResults.forEach((r) => {
      if (resultMap[r.gameId]) {
        resultMap[r.gameId].today = r;
      }
    });

    yesterdayResults.forEach((r) => {
      if (resultMap[r.gameId]) {
        resultMap[r.gameId].yesterday = r;
      }
    });

    const summary = games.map((game) => {
      const t = resultMap[game.id]?.today;
      const y = resultMap[game.id]?.yesterday;
      return {
        game,
        yesterdayResult: y ? y.resultValue : null,
        todayResult: t && t.status === 'PUBLISHED' ? t.resultValue : null,
        status: t ? (t.status as 'PUBLISHED' | 'DRAFT' | 'PENDING') : ('PENDING' as const),
        resultTime: game.resultTime,
        updatedAt: t ? t.updatedAt : null,
      };
    });

    return { summary, todayStr, yesterdayStr, games, settingsMap, faqs };
  } catch (err) {
    console.warn('Prisma query warning on homepage:', err);
    return { summary: [], todayStr, yesterdayStr, games: [], settingsMap: {}, faqs: [] };
  }
}

export default async function HomePage() {
  const { summary, todayStr, yesterdayStr, games, settingsMap, faqs } = await getInitialData();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Live Ticker for Immediate Result Updates */}
      <div>
        <LiveTicker summary={summary} />
      </div>

      {/* Main Grid Layout: Mobile-first 1-column, Desktop 12-column with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Direct Results & High Information Density */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8 sm:space-y-10">
          {/* 2. Notice & Update Board */}
          <NoticeBoard
            noticeText={settingsMap['notice_board']}
            alertBanner={settingsMap['alert_banner']}
          />

          {/* 3. Today's Results Grid (Immediate first-screen visibility) */}
          <TodayResultsGrid
            initialSummary={summary}
            dateStr={todayStr}
            yesterdayDateStr={yesterdayStr}
          />

          {/* 4. Latest Published Results Table / Mobile Cards */}
          <LatestResultsTable summary={summary} dateStr={todayStr} />

          {/* 5. Game Announcement Schedule Timetable */}
          <GameScheduleTable summary={summary} dateStr={todayStr} />

          {/* 6. All Regional Games Directory */}
          <AllGamesBoxes games={games} summary={summary} />

          {/* 7. Monthly Results Matrix Grid */}
          <MonthlyMatrix initialYear={2026} initialMonth={9} />

          {/* 8. Yearly Chart Interactive Selector */}
          <YearlyMatrix
            initialGameSlug="delhi"
            initialYear={2026}
            gamesList={games.map((g) => ({ id: g.id, name: g.name, slug: g.slug }))}
          />

          {/* 9. Key System Values & Standards */}
          <section className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 sm:p-5 shadow-subtle space-y-3">
            <div className="section-header-clean flex items-center gap-2 text-xs sm:text-sm font-black">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <h3 className="text-[#111113] dark:text-[#FAF8F5] uppercase tracking-wider">
                NUMBERLIVE PUBLIC DATA &amp; TIMETABLE STANDARDS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-[8px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] space-y-1">
                <span className="font-bold text-[#111113] dark:text-[#FAF8F5] flex items-center gap-1.5 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  Uniform Verification
                </span>
                <p className="text-[#71717A] dark:text-[#A1A1AA] text-xs leading-relaxed">
                  Simultaneous public record announcements verified across regional release timetables.
                </p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] space-y-1">
                <span className="font-bold text-[#111113] dark:text-[#FAF8F5] flex items-center gap-1.5 text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-[#C5A059]" />
                  Synchronised Release
                </span>
                <p className="text-[#71717A] dark:text-[#A1A1AA] text-xs leading-relaxed">
                  Daily schedules maintained from morning to night without prediction manipulation.
                </p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] space-y-1">
                <span className="font-bold text-[#111113] dark:text-[#FAF8F5] flex items-center gap-1.5 text-xs sm:text-sm">
                  <FileSpreadsheet className="w-4 h-4 text-[#C5A059]" />
                  Open Data Export
                </span>
                <p className="text-[#71717A] dark:text-[#A1A1AA] text-xs leading-relaxed">
                  Download historical CSV datasets directly for independent statistical research.
                </p>
              </div>
            </div>
          </section>

          {/* 10. Frequently Asked Questions Preview */}
          <section className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 sm:p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#C5A059]" />
                <h3 className="text-xs sm:text-sm font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-wide">
                  Frequently Asked Questions
                </h3>
              </div>
              <Link
                href="/faq"
                className="min-h-[44px] px-2 text-xs font-bold text-[#C5A059] hover:underline inline-flex items-center gap-1"
              >
                <span>View All FAQ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5C5449] dark:text-[#A1A1AA]">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-3.5 bg-[#FAF8F5] dark:bg-[#18181B] rounded-[8px] border border-[#EAE3D5] dark:border-[#2E2E33] space-y-1"
                >
                  <h4 className="font-bold text-[#111113] dark:text-[#FAF8F5] text-xs sm:text-sm">
                    {faq.question}
                  </h4>
                  <p className="text-xs leading-relaxed text-[#71717A] dark:text-[#A1A1AA]">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar Column (Desktop sticky, mobile stacks cleanly below) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="lg:sticky lg:top-20">
            <RightSidebar summary={summary} />
          </div>
        </div>
      </div>
    </div>
  );
}
