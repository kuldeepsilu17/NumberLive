import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#111113] text-[#D4D4D8] border-t border-[#2E2E33] mt-10 sm:mt-14">
      {/* Top Disclaimer Strip */}
      <div className="bg-[#09090B] border-b border-[#2E2E33] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left text-xs">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span className="font-bold text-[#FAF8F5] uppercase text-xs tracking-wider">
                Strictly Non-Gambling &amp; Informational Records Portal
              </span>
            </div>
            <p className="text-[#A1A1AA] text-[11px] max-w-2xl leading-relaxed">
              NumberLive does not host, organize, promote, or facilitate betting, wagering, or financial gaming of any kind.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content: Stacked on mobile, 4 columns on desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[5px] bg-[#18181B] border border-[#C5A059] flex items-center justify-center text-[#C5A059] font-black text-xs">
                NL
              </div>
              <span className="font-black text-lg tracking-tight text-[#FAF8F5] uppercase">
                NUMBER<span className="text-[#C5A059]">LIVE</span>
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              India&apos;s verified public number records, daily timetable announcements, and multi-year historical chart archives.
            </p>
            <div>
              <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-[4px] bg-[#18181B] text-[#C5A059] border border-[#2E2E33]">
                VERIFIED PUBLIC ARCHIVE
              </span>
            </div>
          </div>

          {/* Quick Links (44px min tap targets) */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase border-l-2 border-[#C5A059] pl-2.5">
              QUICK LINKS
            </h3>
            <ul className="space-y-1">
              <li>
                <Link href="/" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#A1A1AA] hover:text-[#C5A059] transition-colors">
                  Home Scoreboard
                </Link>
              </li>
              <li>
                <Link href="/results" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#A1A1AA] hover:text-[#C5A059] transition-colors">
                  Today&apos;s Results
                </Link>
              </li>
              <li>
                <Link href="/charts" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#A1A1AA] hover:text-[#C5A059] transition-colors">
                  Result Charts
                </Link>
              </li>
              <li>
                <Link href="/monthly-chart" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#A1A1AA] hover:text-[#C5A059] transition-colors">
                  Monthly Matrix
                </Link>
              </li>
              <li>
                <Link href="/games" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#A1A1AA] hover:text-[#C5A059] transition-colors">
                  All Tracked Games
                </Link>
              </li>
              <li>
                <Link href="/history" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#A1A1AA] hover:text-[#C5A059] transition-colors">
                  Historical Archives
                </Link>
              </li>
            </ul>
          </div>

          {/* Information & Support */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase border-l-2 border-[#C5A059] pl-2.5">
              INFORMATION
            </h3>
            <ul className="space-y-1">
              <li>
                <Link href="/faq" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#A1A1AA] hover:text-[#C5A059] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#A1A1AA] hover:text-[#C5A059] transition-colors">
                  Contact &amp; Corrections
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#A1A1AA] hover:text-[#C5A059] transition-colors">
                  Legal Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/search" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#A1A1AA] hover:text-[#C5A059] transition-colors">
                  Search Engine
                </Link>
              </li>
              <li>
                <Link href="/admin" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#71717A] hover:text-[#C5A059] transition-colors">
                  Admin Control Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Compliance */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase border-l-2 border-[#C5A059] pl-2.5">
              LEGAL &amp; POLICIES
            </h3>
            <ul className="space-y-1">
              <li>
                <Link href="/privacy-policy" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#A1A1AA] hover:text-[#C5A059] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#A1A1AA] hover:text-[#C5A059] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="min-h-[40px] flex items-center text-xs sm:text-sm text-[#A1A1AA] hover:text-[#C5A059] transition-colors">
                  Non-Gambling Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-5 border-t border-[#2E2E33] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#71717A] text-center sm:text-left">
          <p>© {currentYear} NUMBERLIVE. ALL RIGHTS RESERVED.</p>
          <p>
            Real-time Public Data &amp; Number Archives
          </p>
        </div>
      </div>
    </footer>
  );
}
