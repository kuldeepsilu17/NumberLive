import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { Lock } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Privacy Policy | NumberLive',
  description: 'Understand how NumberLive handles public data, visitor privacy, cookies, and non-gambling analytics.',
  path: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 rounded-[9px] shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              PRIVACY POLICY
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Commitment to visitor privacy, cookie policies, and data security.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-6 shadow-subtle space-y-4 text-xs sm:text-sm text-[#5C5449] dark:text-[#D4D4D8] leading-relaxed">
        <section className="space-y-1.5">
          <h2 className="text-sm sm:text-base font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
            1. No User Data Collection for Gambling
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA]">
            NumberLive does not collect financial details, bank accounts, UPI IDs, or identification documents. We do not maintain user wallets, wagering histories, or payment profiles.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm sm:text-base font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
            2. Anonymous Browsing
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA]">
            All result scoreboards and historical chart matrices are freely accessible without requiring registration, phone numbers, or passwords.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm sm:text-base font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
            3. Cookies &amp; Local Storage
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA]">
            We use standard browser localStorage only for preserving your theme preference (light/dark mode) and basic analytical tracking.
          </p>
        </section>
      </div>
    </div>
  );
}
