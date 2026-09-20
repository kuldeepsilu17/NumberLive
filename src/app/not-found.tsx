import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="py-16 text-center space-y-4 max-w-md mx-auto">
      <div className="w-14 h-14 bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#C5A059] rounded-[6px] flex items-center justify-center mx-auto text-xl font-black font-mono shadow-subtle">
        404
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
          Record or Page Not Found
        </h1>
        <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
          The number chart or route you are attempting to view does not exist or has been relocated in our archive.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-2.5">
        <Link
          href="/"
          className="btn-primary !h-8 !px-3.5 text-xs font-bold flex items-center gap-1.5"
        >
          <Home className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
