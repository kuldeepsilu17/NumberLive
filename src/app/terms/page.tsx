import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { FileText } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Terms of Service | NumberLive',
  description: 'Terms and conditions for accessing and using the NumberLive public records and chart archive platform.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 rounded-[9px] shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              TERMS OF SERVICE
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Terms and conditions for utilizing the NumberLive informational archive.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-6 shadow-subtle space-y-4 text-xs sm:text-sm text-[#5C5449] dark:text-[#D4D4D8] leading-relaxed">
        <section className="space-y-1.5">
          <h2 className="text-sm sm:text-base font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
            1. Acceptance of Terms
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA]">
            By accessing or using NumberLive, you agree to comply with and be bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm sm:text-base font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
            2. Informational Use Only
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA]">
            All data, matrices, schedules, and charts published on this website are for educational, journalistic, and statistical documentation only.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm sm:text-base font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
            3. Intellectual Property
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA]">
            The NumberLive brand, design system, layout, software code, and database compilation are protected by intellectual property laws.
          </p>
        </section>
      </div>
    </div>
  );
}
