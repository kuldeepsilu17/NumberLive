import React from 'react';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { constructMetadata } from '@/lib/seo';
import { HelpCircle, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Frequently Asked Questions & Public Policy - NumberLive',
  description: 'Learn about NumberLive data integrity, result timetables, non-gambling policies, and archive verification.',
  path: '/faq',
});

export const revalidate = 30;

export default async function FaqPage() {
  let faqs: any[] = [];
  try {
    faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  } catch (err) {
    console.warn('Prisma query warning on /faq:', err);
  }

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 rounded-[9px] shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              FREQUENTLY ASKED QUESTIONS &amp; ARCHIVE POLICIES
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Information regarding data sourcing, timetable synchronisation, CSV exports, and compliance.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion Groups */}
      <div className="space-y-6">
        {categories.map((category) => {
          const catFaqs = faqs.filter((f) => f.category === category);
          return (
            <div
              key={category}
              className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] overflow-hidden shadow-subtle"
            >
              <div className="px-4 py-3 bg-[#FAF8F5] dark:bg-[#18181B] border-b border-[#EAE3D5] dark:border-[#2E2E33] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                <h2 className="text-xs font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-wider">
                  {category} Questions
                </h2>
              </div>

              <div className="p-4 sm:p-6 divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
                {catFaqs.map((faq) => (
                  <div key={faq.id} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                    <h3 className="text-sm font-bold text-[#111113] dark:text-[#FAF8F5]">
                      {faq.question}
                    </h3>
                    <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
