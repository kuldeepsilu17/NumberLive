import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Non-Gambling & Informational Disclaimer',
  description: 'Read the official compliance statement and non-gambling disclaimer of NumberLive.',
  path: '/disclaimer',
});

export default function DisclaimerPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 rounded-[9px] shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              LEGAL &amp; NON-GAMBLING DISCLAIMER
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Official compliance statement regarding our informational records platform.
            </p>
          </div>
        </div>
      </div>

      {/* Main content body */}
      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-6 shadow-subtle space-y-4 text-xs sm:text-sm text-[#5C5449] dark:text-[#D4D4D8] leading-relaxed">
        <section className="space-y-1.5">
          <h2 className="text-sm sm:text-base font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
            1. Nature of the Platform
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA]">
            <strong>NumberLive</strong> is an open informational database and digital archival service. The platform indexes publicly announced historical records and timetable announcements for informational and statistical analysis only.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm sm:text-base font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
            2. Strict Prohibition on Gambling Services
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA]">
            NumberLive does <strong>not</strong> operate, promote, facilitate, host, or participate in:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#71717A] dark:text-[#A1A1AA] text-xs sm:text-sm">
            <li>Betting, wagering, or monetary staking</li>
            <li>Online casino games, lotteries, or gambling operations</li>
            <li>Financial deposits, withdrawals, or user wallets</li>
            <li>Payment collection via UPI, cards, net banking, or cryptocurrencies</li>
            <li>Bookmaking, betting syndicate referrals, or commission schemes</li>
          </ul>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm sm:text-base font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
            3. Warning Against Fraudulent &quot;Fixed Numbers&quot;
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA]">
            NumberLive strictly condemns claims such as <em>&quot;sure shot numbers&quot;</em>, <em>&quot;fixed leak numbers&quot;</em>, or <em>&quot;100% guaranteed results&quot;</em>. We do not provide, sell, or endorse predictions. Anyone claiming to represent NumberLive and soliciting money for tips is engaging in fraudulent conduct.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm sm:text-base font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
            4. User Responsibility
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA]">
            Users are solely responsible for ensuring that viewing historical number archives complies with all applicable local, state, and national laws in their respective jurisdiction.
          </p>
        </section>
      </div>
    </div>
  );
}
