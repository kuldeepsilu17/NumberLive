'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Moon,
  Sun,
  Lock,
  Menu,
  X,
  Radio,
  ChevronRight,
} from 'lucide-react';
import SearchModal from '../search/SearchModal';

export default function Header() {
  const pathname = usePathname();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark =
      localStorage.getItem('numberlive_theme') === 'dark' ||
      (!('numberlive_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('numberlive_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('numberlive_theme', 'light');
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Results', href: '/results' },
    { name: 'Charts', href: '/charts' },
    { name: 'Games', href: '/games' },
    { name: 'History', href: '/history' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/charts') return pathname === '/charts' || pathname.startsWith('/monthly-chart');
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#111113] text-white border-b border-[#2E2E33] shadow-header select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px] sm:h-[64px]">
            {/* 1. Mobile Left: Hamburger Button (44×44px touch area) */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="w-11 h-11 flex items-center justify-center text-[#FAF8F5] hover:text-[#C5A059] active:bg-[#18181B] rounded-[6px] transition-colors -ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                aria-label="Open Navigation Menu"
                id="mobile-nav-toggle"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* 2. Brand Logo (Centered on mobile, Left-aligned on desktop) */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group py-1">
                <div className="w-8 h-8 rounded-[5px] bg-[#18181B] border border-[#C5A059] flex items-center justify-center text-[#C5A059] font-black text-xs sm:text-sm tracking-wider shadow-xs group-hover:border-[#DFBD76] transition-colors">
                  NL
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-base sm:text-lg tracking-tight text-[#FAF8F5] uppercase leading-none font-sans flex items-center gap-1.5">
                    NUMBER<span className="text-[#C5A059]">LIVE</span>
                    <span className="hidden xl:inline-flex items-center gap-1 text-[9px] bg-[#16A34A]/20 text-[#4ADE80] border border-[#16A34A]/40 px-1 py-0.2 rounded font-bold uppercase">
                      <Radio className="w-2.5 h-2.5 animate-pulse" />
                      Live
                    </span>
                  </span>
                  <span className="text-[9px] text-[#A1A1AA] font-semibold tracking-wider uppercase mt-0.5 hidden sm:block">
                    Official Public Records Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* 3. Center: Desktop Unified Navigation Bar (Hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" aria-label="Desktop Navigation">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative px-3 py-2 text-[13px] font-bold tracking-wide transition-all rounded-[6px] min-h-[44px] flex items-center ${
                      active
                        ? 'text-[#C5A059] bg-[#18181B] border-b-2 border-[#C5A059]'
                        : 'text-[#FAF8F5] hover:text-[#C5A059] hover:bg-[#18181B]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* 4. Right: Search & Actions (44×44px touch areas on mobile) */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Button (44×44px touch target on mobile) */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="w-11 h-11 sm:w-auto sm:h-9 sm:px-3 flex items-center justify-center gap-2 text-[#FAF8F5] bg-[#18181B] hover:bg-[#222226] hover:text-[#C5A059] hover:border-[#C5A059]/50 rounded-[6px] border border-[#2E2E33] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                title="Search records (Ctrl+K)"
                aria-label="Search records"
                id="search-btn-header"
              >
                <Search className="w-4 h-4 text-[#C5A059]" />
                <span className="hidden sm:inline text-xs font-semibold">Search</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] bg-[#111113] border border-[#2E2E33] rounded text-[#71717A] font-mono">
                  Ctrl+K
                </kbd>
              </button>

              {/* Theme Toggle (44×44px touch target on mobile) */}
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle light and dark theme"
                className="w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center text-[#A1A1AA] hover:text-[#C5A059] hover:bg-[#18181B] rounded-[6px] border border-transparent hover:border-[#2E2E33] transition-colors focus:outline-none"
              >
                {darkMode ? <Sun className="w-4 h-4 text-[#C5A059]" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Admin Button (Desktop only on right bar, also in mobile menu) */}
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-bold text-[#FAF8F5] bg-[#18181B] hover:bg-[#222226] hover:text-[#C5A059] hover:border-[#C5A059]/50 rounded-[6px] border border-[#2E2E33] transition-colors"
                title="Admin Control Desk"
                aria-label="Admin Control Desk"
              >
                <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
           FULL-WIDTH CLEAN MOBILE NAVIGATION PANEL
           ───────────────────────────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-[#111113]/95 backdrop-blur-md animate-in fade-in duration-200">
            {/* Mobile Drawer Top Bar */}
            <div className="flex items-center justify-between px-4 h-[60px] border-b border-[#2E2E33] bg-[#111113]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[4px] bg-[#18181B] border border-[#C5A059] flex items-center justify-center text-[#C5A059] font-black text-xs">
                  NL
                </div>
                <span className="font-black text-base tracking-tight text-[#FAF8F5] uppercase">
                  NUMBER<span className="text-[#C5A059]">LIVE</span>
                </span>
              </div>

              {/* Close Button (44×44px touch area) */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-11 h-11 flex items-center justify-center text-[#A1A1AA] hover:text-white active:bg-[#18181B] rounded-[6px] transition-colors focus:outline-none"
                aria-label="Close Navigation Menu"
              >
                <X className="w-6 h-6 text-[#C5A059]" />
              </button>
            </div>

            {/* Mobile Menu Links (Each minimum 48px height) */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
              <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider px-3 mb-2">
                Navigation Menu
              </div>

              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between min-h-[48px] px-3.5 py-2.5 rounded-[8px] text-sm font-bold tracking-wide transition-all ${
                      active
                        ? 'bg-[#18181B] text-[#C5A059] border-l-4 border-[#C5A059] shadow-xs'
                        : 'text-[#FAF8F5] hover:bg-[#18181B] hover:text-[#C5A059] active:bg-[#222226]'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className={`w-4 h-4 ${active ? 'text-[#C5A059]' : 'text-[#71717A]'}`} />
                  </Link>
                );
              })}

              {/* Search in Menu */}
              <div className="pt-3 mt-3 border-t border-[#2E2E33] space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between min-h-[48px] px-3.5 py-2.5 rounded-[8px] text-sm font-bold bg-[#18181B] text-[#FAF8F5] border border-[#2E2E33] hover:border-[#C5A059] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#C5A059]" />
                    <span>Search Records &amp; Games</span>
                  </span>
                  <span className="text-[10px] text-[#71717A] font-mono">Open</span>
                </button>

                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between min-h-[48px] px-3.5 py-2.5 rounded-[8px] text-sm font-bold bg-[#18181B] text-[#FAF8F5] border border-[#2E2E33] hover:border-[#C5A059] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#C5A059]" />
                    <span>Admin Control Desk</span>
                  </span>
                  <span className="text-[10px] text-[#C5A059] font-bold uppercase">Staff</span>
                </Link>
              </div>
            </div>

            {/* Mobile Footer Info */}
            <div className="p-4 bg-[#09090B] border-t border-[#2E2E33] text-center text-xs text-[#71717A]">
              <p className="font-semibold text-[11px]">NumberLive Public Records Portal</p>
              <p className="text-[10px] text-[#52525B] mt-0.5">Strictly Non-Gambling Data Archive</p>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
