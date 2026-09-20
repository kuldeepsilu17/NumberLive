'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarPlus,
  Gamepad2,
  FolderTree,
  Grid3X3,
  Layers,
  FileText,
  HelpCircle,
  Settings,
  Sliders,
  FileCheck2,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Results Workflow', href: '/admin/results', icon: CalendarPlus },
    { name: 'Games', href: '/admin/games', icon: Gamepad2 },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Charts View', href: '/admin/charts', icon: Grid3X3 },
    { name: 'History Records', href: '/admin/history', icon: Layers },
    { name: 'Content Pages', href: '/admin/pages', icon: FileText },
    { name: 'FAQ Manager', href: '/admin/faq', icon: HelpCircle },
    { name: 'SEO & Meta', href: '/admin/seo', icon: Settings },
    { name: 'Site Settings', href: '/admin/settings', icon: Sliders },
    { name: 'Audit Trail', href: '/admin/audit-logs', icon: FileCheck2 },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
      {/* ─────────────────────────────────────────────────────────────
         1. MOBILE ADMIN NAVIGATION BAR (< lg screens)
         ───────────────────────────────────────────────────────────── */}
      <div className="lg:hidden bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-3 shadow-subtle space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#C5A059] rounded-full"></div>
            <span className="font-black text-xs uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]">
              ADMIN CONTROL DESK
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold text-[#71717A] hover:text-[#C5A059] flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-[#DC2626] ml-2"
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Scrollable Mobile Tabs for Quick Navigation (44px min height) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#111113] text-[#C5A059] border border-[#C5A059] shadow-xs'
                    : 'bg-[#FAF8F5] dark:bg-[#18181B] text-[#5C5449] dark:text-[#D4D4D8] border border-[#EAE3D5] dark:border-[#2E2E33]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A059]' : 'text-[#8C8275]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         2. DESKTOP ADMIN SIDEBAR (Visible on lg+ screens)
         ───────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:block w-64 bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 shadow-subtle space-y-4 self-start shrink-0">
        {/* Header */}
        <div className="px-2 pb-3 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
          <div className="text-[10px] font-black uppercase tracking-wider text-[#C5A059]">
            EDITORIAL SYSTEM
          </div>
          <h2 className="text-sm font-black text-[#111113] dark:text-[#FAF8F5] uppercase mt-0.5">
            Admin Control Desk
          </h2>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-[6px] text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-[#111113] text-[#C5A059] border border-[#C5A059] shadow-xs'
                    : 'text-[#5C5449] dark:text-[#D4D4D8] hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] hover:text-[#111113] dark:hover:text-[#FAF8F5]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A059]' : 'text-[#8C8275]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Links */}
        <div className="pt-3 border-t border-[#EAE3D5] dark:border-[#2E2E33] space-y-1 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between min-h-[44px] px-3 py-2 rounded-[6px] text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] hover:text-[#111113] dark:hover:text-[#FAF8F5] transition-colors font-bold"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[#8C8275]" />
              <span>Live Scoreboard</span>
            </span>
            <span>↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-[6px] text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#18181B] font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Desk</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
