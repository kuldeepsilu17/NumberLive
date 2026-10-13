'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  Moon,
  Sun,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import SearchModal from '../search/SearchModal';

export default function Header() {
  const pathname = usePathname();
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
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

  useEffect(() => {
    setMobileMenuOpen(false);
    setLangMenuOpen(false);
  }, [pathname]);

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

  // If on /owner routes, public header is not rendered (owner layout has its own header)
  if (pathname?.startsWith('/owner')) {
    return null;
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Results', href: '/results' },
    { name: 'Charts', href: '/charts' },
    { name: 'History', href: '/history' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#111113] text-white border-b border-[#27272A] shadow-xs select-none">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-[52px]">
            {/* 1. Mobile Hamburger */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-[#E4E4E7] hover:text-[#C5A059] rounded transition-colors"
                aria-label="Open Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Logo */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 rounded bg-[#C5A059] flex items-center justify-center text-black font-black text-xs tracking-wider shadow-xs">
                  NL
                </div>
                <span className="font-black text-base sm:text-lg tracking-tight uppercase leading-none">
                  NUMBER<span className="text-[#C5A059]">LIVE</span>
                </span>
              </Link>
            </div>

            {/* 3. Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
                      active
                        ? 'text-[#C5A059] bg-[#1F1F23]'
                        : 'text-[#D4D4D8] hover:text-white hover:bg-[#18181B]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* 4. Right Controls: Search, Language, Theme */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="w-9 h-9 flex items-center justify-center text-[#A1A1AA] hover:text-[#C5A059] hover:bg-[#18181B] rounded transition-colors"
                title="Search games"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-1 h-8 px-2 text-[11px] font-bold text-[#E4E4E7] bg-[#18181B] hover:bg-[#222226] border border-[#2E2E33] rounded transition-colors"
                  title="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="uppercase">{currentLanguage.code}</span>
                </button>

                {langMenuOpen && (
                  <div className="absolute right-0 mt-1 w-36 bg-[#18181B] border border-[#2E2E33] rounded-[6px] py-1 shadow-xl z-50 animate-in fade-in duration-100">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between ${
                          currentLanguage.code === lang.code
                            ? 'text-[#C5A059] bg-[#222226] font-bold'
                            : 'text-[#D4D4D8] hover:bg-[#27272A] hover:text-white'
                        }`}
                      >
                        <span>{lang.name}</span>
                        <span className="text-[10px] text-[#71717A] uppercase">{lang.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dark/Light toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-8 h-8 flex items-center justify-center text-[#A1A1AA] hover:text-[#C5A059] rounded transition-colors"
                title="Toggle Theme"
                aria-label="Toggle Theme"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-[#C5A059]" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-[#111113]/95 backdrop-blur-md animate-in fade-in duration-150">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 h-[52px] border-b border-[#27272A] bg-[#111113]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#C5A059] flex items-center justify-center text-black font-black text-xs">
                  NL
                </div>
                <span className="font-black text-base uppercase">
                  NUMBER<span className="text-[#C5A059]">LIVE</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center text-[#A1A1AA] hover:text-white rounded"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-[#C5A059]" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between min-h-[44px] px-3.5 rounded text-sm font-bold tracking-wide transition-colors ${
                      active
                        ? 'bg-[#1F1F23] text-[#C5A059]'
                        : 'text-[#E4E4E7] hover:bg-[#18181B]'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className={`w-4 h-4 ${active ? 'text-[#C5A059]' : 'text-[#71717A]'}`} />
                  </Link>
                );
              })}

              <div className="pt-4 mt-4 border-t border-[#27272A] space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 min-h-[44px] px-3.5 rounded bg-[#18181B] text-xs font-bold text-[#E4E4E7] border border-[#27272A]"
                >
                  <Search className="w-4 h-4 text-[#C5A059]" />
                  <span>Search Games</span>
                </button>
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-3 bg-[#09090B] border-t border-[#27272A] text-center text-[11px] text-[#71717A]">
              NumberLive • Official Results &amp; Archives
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
