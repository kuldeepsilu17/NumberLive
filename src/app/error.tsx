'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="py-16 text-center space-y-4 max-w-md mx-auto">
      <div className="w-14 h-14 bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#C5A059] rounded-[6px] flex items-center justify-center mx-auto shadow-subtle">
        <AlertTriangle className="w-6 h-6 text-[#C5A059]" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
          Data Loading Issue
        </h1>
        <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
          We encountered an issue while querying the historical database. Please try reloading.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-2.5">
        <button
          onClick={() => reset()}
          className="btn-primary !h-8 !px-3.5 text-xs font-bold flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Retry</span>
        </button>
        <Link
          href="/"
          className="btn-secondary !h-8 !px-3.5 text-xs font-bold flex items-center gap-1.5"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}
