import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Database, FileSpreadsheet, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'About NumberLive - Public Records & Open Data Mission',
  description: 'Learn about NumberLive’s transparent editorial data aggregation, historical chart archiving standards, and strict non-gambling mandate.',
};

export const revalidate = 60;

export default async function AboutPage() {
  const pageContent = await prisma.pageContent.findUnique({
    where: { key: 'about' },
  });

  let contentData: any = null;
  if (pageContent) {
    try {
      contentData = JSON.parse(pageContent.contentJson);
    } catch (e) {
      contentData = null;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-6 sm:p-8 shadow-subtle space-y-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#C5A059]/10 text-[#C5A059] font-bold text-xs border border-[#C5A059]/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Independent Data Archive</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
          {contentData?.headline || 'About NumberLive Data Portal'}
        </h1>

        <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
          {contentData?.mission ||
            'NumberLive is an independent, transparent public records archive and statistical reference repository. We systematically document, verify, and catalog published numerical outcomes from open regional announcement boards across India.'}
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-[9px] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-2.5">
          <div className="w-9 h-9 rounded-[6px] bg-[#18181B] border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-sm text-[#111113] dark:text-[#FAF8F5]">
            Immutable Audit Trail
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            Every published number is recorded with an editorial timestamp, change log, and verified reference notes.
          </p>
        </div>

        <div className="p-5 rounded-[9px] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-2.5">
          <div className="w-9 h-9 rounded-[6px] bg-[#18181B] border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-sm text-[#111113] dark:text-[#FAF8F5]">
            Zero Gambling Policy
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            Strict non-transactional mandate. We never host betting, accept deposits, or offer paid predictions.
          </p>
        </div>

        <div className="p-5 rounded-[9px] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle space-y-2.5">
          <div className="w-9 h-9 rounded-[6px] bg-[#18181B] border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-sm text-[#111113] dark:text-[#FAF8F5]">
            Open Data Access
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            Researchers can export monthly and yearly CSV datasets directly for independent statistical analysis.
          </p>
        </div>
      </div>

      {/* Editorial Process */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-6 shadow-subtle space-y-4">
        <h2 className="text-base sm:text-lg font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-wide">
          Editorial Verification &amp; Publishing Workflow
        </h2>

        <div className="space-y-3 text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#111113] dark:text-[#FAF8F5]">1. Announcement Aggregation:</strong> Public release boards and bulletin feeds are monitored by our editorial staff during scheduled time windows.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#111113] dark:text-[#FAF8F5]">2. Multi-Point Confirmation:</strong> Numbers are cross-checked against dual release sources prior to official publishing.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#111113] dark:text-[#FAF8F5]">3. Immediate Archival:</strong> Upon verification, outcomes are committed to our database and integrated into monthly matrices and yearly archives.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#EAE3D5] dark:border-[#2E2E33] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Have inquiries regarding our editorial archive?
          </span>
          <Link
            href="/contact"
            className="h-9 px-4 min-h-[44px] inline-flex items-center gap-1.5 text-xs font-bold text-[#111113] bg-[#C5A059] hover:bg-[#B38F48] rounded-[6px] transition-colors"
          >
            <span>Contact Editorial Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
