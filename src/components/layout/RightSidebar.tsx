'use client';

import React from 'react';
import Link from 'next/link';
import {
  Radio,
  Calendar,
  Clock,
  Grid,
  HelpCircle,
  Mail,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { TodayGameResult } from '@/types';

interface RightSidebarProps {
  summary?: TodayGameResult[];
}

export default function RightSidebar({ summary = [] }: RightSidebarProps) {
  const publishedList = summary.filter((s) => s.status === 'PUBLISHED').slice(0, 6);

  const importantLinks = [
    { name: "Today's Live Results Scoreboard", href: '/results', icon: Radio },
    { name: 'Monthly Results Matrix Chart', href: '/monthly-chart', icon: Calendar },
    { name: 'Historical Archive Records', href: '/history', icon: Clock },
    { name: 'Full Games Timetable', href: '/games', icon: Grid },
    { name: 'Frequently Asked Questions', href: '/faq', icon: HelpCircle },
    { name: 'Contact & Inquiries', href: '/contact', icon: Mail },
  ];

  return (
    <aside className="w-full space-y-4">
      {/* 1. Important Quick Links */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 shadow-subtle">
        <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-4 bg-[#C5A059] rounded-full"></div>
            <h3 className="text-xs sm:text-sm font-black text-[#111113] dark:text-[#FAF8F5] tracking-wider uppercase">
              QUICK ACCESS
            </h3>
          </div>
          <span className="text-[10px] text-[#71717A] font-bold uppercase tracking-wider">PORTAL</span>
        </div>

        <div className="space-y-1">
          {importantLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center justify-between min-h-[44px] px-3 py-2 text-xs sm:text-sm font-semibold text-[#5C5449] dark:text-[#D4D4D8] hover:text-[#111113] dark:hover:text-[#FAF8F5] hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] rounded-[6px] transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#8C8275] dark:text-[#71717A] group-hover:text-[#C5A059] transition-colors shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform">{link.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#C5A059] transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. Latest Announced Live Updates */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 shadow-subtle">
        <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-4 bg-[#C5A059] rounded-full"></div>
            <h3 className="text-xs sm:text-sm font-black text-[#111113] dark:text-[#FAF8F5] tracking-wider uppercase">
              LATEST DECLARED
            </h3>
          </div>
          <span className="badge-live">
            ● LIVE
          </span>
        </div>

        <div className="space-y-2">
          {publishedList.length > 0 ? (
            publishedList.map((item) => (
              <Link
                key={item.game.id}
                href={`/games/${item.game.slug}`}
                className="flex items-center justify-between min-h-[48px] p-3 rounded-[8px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] hover:border-[#C5A059] transition-colors group"
              >
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#111113] dark:text-white group-hover:text-[#C5A059] block uppercase tracking-tight">
                    {item.game.name}
                  </span>
                  <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                    Time: {item.resultTime}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-black text-base text-[#111113] dark:text-white bg-white dark:bg-[#111113] px-2.5 py-1 rounded-[6px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-xs inline-block">
                    {item.todayResult}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-[#71717A]">
              Awaiting today&apos;s scheduled releases
            </div>
          )}
        </div>
      </div>

      {/* 3. Informational Disclaimer Box */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 shadow-subtle space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#111113] dark:text-white">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span className="uppercase text-[11px] tracking-wider">Public Records Policy</span>
        </div>
        <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
          NumberLive is an open database recording publicly available numbers. No betting or wagering is accepted or facilitated.
        </p>
      </div>
    </aside>
  );
}
