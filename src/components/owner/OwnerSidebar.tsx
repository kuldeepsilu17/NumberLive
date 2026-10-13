'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Gamepad2,
  CalendarCheck,
  Grid3X3,
  History,
  ShieldAlert,
  Sliders,
  X,
  PlusCircle,
  LogOut,
} from 'lucide-react';

interface OwnerSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function OwnerSidebar({ mobileOpen = false, onCloseMobile }: OwnerSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/owner', icon: LayoutDashboard },
    { name: 'Games', href: '/owner/games', icon: Gamepad2 },
    { name: 'Results', href: '/owner/results', icon: CalendarCheck },
    { name: 'Charts', href: '/owner/charts', icon: Grid3X3 },
    { name: 'History', href: '/owner/history', icon: History },
    { name: 'Audit Log', href: '/owner/audit-log', icon: ShieldAlert },
    { name: 'Settings', href: '/owner/settings', icon: Sliders },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/owner/logout', { method: 'POST' });
      window.location.href = '/owner/login';
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const renderNavContent = () => (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="px-3 pb-3 border-b border-[#E5E5E5] dark:border-[#2E2E33] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">
              OWNER PORTAL
            </div>
            <h2 className="text-sm font-bold text-[#20201E] dark:text-[#FAF8F5] uppercase tracking-tight">
              NumberLive
            </h2>
          </div>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded text-[#71717A] hover:text-[#20201E] dark:hover:text-white"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Action Button: Quick Publish */}
        <div className="px-1">
          <Link
            href="/owner/results/new"
            onClick={onCloseMobile}
            className="w-full flex items-center justify-center gap-2 h-10 px-3 rounded-[6px] text-xs font-semibold bg-[#20201E] dark:bg-[#FAF8F5] text-white dark:text-[#20201E] hover:bg-[#333330] dark:hover:bg-white transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#C5A059]" />
            <span>Publish Result</span>
          </Link>
        </div>

        {/* Core Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/owner'
                ? pathname === '/owner'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-[6px] text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#20201E] text-white dark:bg-[#FAF8F5] dark:text-[#20201E]'
                    : 'text-[#52525B] dark:text-[#D4D4D8] hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] hover:text-[#20201E] dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-[#C5A059]'
                      : 'text-[#71717A] dark:text-[#A1A1AA]'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation: Return to Site / Logout */}
      <div className="pt-3 border-t border-[#E5E5E5] dark:border-[#2E2E33] space-y-1">
        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center gap-2 h-9 px-3 text-xs font-medium text-[#71717A] hover:text-[#20201E] dark:hover:text-white rounded transition-colors"
        >
          <span>View Public Site &rarr;</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 h-9 px-3 text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#2A1515] rounded transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-56 bg-white dark:bg-[#111113] border border-[#E5E5E5] dark:border-[#2E2E33] rounded-[8px] p-3.5 shadow-xs self-start shrink-0 sticky top-4">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] bg-white dark:bg-[#111113] h-full p-4 shadow-xl overflow-y-auto flex flex-col justify-between z-10">
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
}
