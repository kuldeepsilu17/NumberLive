'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // If on /owner routes, public footer is not rendered
  if (pathname?.startsWith('/owner')) {
    return null;
  }

  const primaryLinks = [
    { name: 'Home', href: '/' },
    { name: 'Results', href: '/results' },
    { name: 'Charts', href: '/charts' },
    { name: 'History', href: '/history' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  const policyLinks = [
    { name: 'Privacy', href: '/privacy-policy' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ];

  return (
    <footer className="w-full bg-white dark:bg-[#111113] text-[#71717A] dark:text-[#A1A1AA] border-t border-[#E5E5E5] dark:border-[#27272A] py-6 mt-auto text-xs">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-3">
        {/* Brand & Tagline */}
        <div>
          <div className="font-bold text-sm tracking-tight text-[#20201E] dark:text-[#FAF8F5] uppercase">
            NUMBER<span className="text-[#C5A059]">LIVE</span>
          </div>
          <p className="text-[11px] text-[#71717A] dark:text-[#8C8275] mt-0.5">
            Results and historical information portal.
          </p>
        </div>

        {/* Primary Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 font-medium">
          {primaryLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[#52525B] dark:text-[#A1A1AA] hover:text-[#20201E] dark:hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Policy Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px]">
          {policyLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[#71717A] hover:text-[#20201E] dark:hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="pt-2 text-[11px] text-[#A1A1AA] dark:text-[#71717A]">
          &copy; 2026 NumberLive
        </div>
      </div>
    </footer>
  );
}
