'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Clock, ArrowRight } from 'lucide-react';
import { formatReadableDate } from '@/lib/utils';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ games: any[]; results: any[] }>({
    games: [],
    results: [],
  });

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setData({ games: [], results: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const json = await res.json();
      if (json.success) {
        setData({ games: json.games || [], results: json.results || [] });
      }
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 rounded-[9px] shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              SEARCH NUMBER RECORDS &amp; GAMES
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Instant search across game titles, number records (00–99), and dates.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar (48px height) */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search game, number (00-99), or date (YYYY-MM-DD)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-input pl-11 text-xs sm:text-sm font-bold"
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full sm:w-auto font-bold text-xs sm:text-sm px-6"
        >
          Search
        </button>
      </form>

      {/* Results */}
      <div className="space-y-6">
        {loading && (
          <div className="py-10 text-center text-[#71717A] text-xs sm:text-sm">
            Searching official records...
          </div>
        )}

        {!loading && query && data.games.length === 0 && data.results.length === 0 && (
          <div className="py-10 bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] text-center text-[#71717A] text-xs sm:text-sm">
            <p className="font-bold text-[#111113] dark:text-[#FAF8F5] text-base">
              No results found for &quot;{query}&quot;
            </p>
            <p className="text-[#71717A] mt-1 text-xs">
              Try searching for a game name like &quot;Delhi&quot; or numbers 00 to 99.
            </p>
          </div>
        )}

        {/* Matched Games */}
        {data.games.length > 0 && (
          <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] overflow-hidden shadow-subtle space-y-0">
            <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 text-xs sm:text-sm font-black">
              <span className="text-[#111113] dark:text-[#FAF8F5] uppercase">MATCHED GAMES ({data.games.length})</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.games.map((g) => (
                <Link
                  key={g.id}
                  href={`/games/${g.slug}`}
                  className="min-h-[56px] p-3.5 bg-[#FAF8F5] dark:bg-[#18181B] hover:border-[#C5A059] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[8px] flex items-center justify-between group transition-colors active:scale-[0.99]"
                >
                  <div>
                    <h3 className="font-black text-[#111113] dark:text-white group-hover:text-[#C5A059] text-xs sm:text-sm uppercase">
                      {g.name}
                    </h3>
                    <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-[#8C8275]" /> Scheduled: {g.resultTime}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#C5A059] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Matched Results */}
        {data.results.length > 0 && (
          <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] overflow-hidden shadow-subtle space-y-0">
            <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 text-xs sm:text-sm font-black">
              <span className="text-[#111113] dark:text-[#FAF8F5] uppercase">PUBLISHED NUMBER RECORDS ({data.results.length})</span>
            </div>
            <div className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
              {data.results.map((r) => (
                <Link
                  key={r.id}
                  href={`/games/${r.game?.slug || ''}`}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs sm:text-sm hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] transition-colors block"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-base text-[#111113] dark:text-[#FAF8F5] bg-[#FAF8F5] dark:bg-[#18181B] px-3 py-1 rounded-[6px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-xs">
                      {r.resultValue}
                    </span>
                    <div>
                      <span className="font-bold text-[#111113] dark:text-white text-xs sm:text-sm uppercase block">
                        {r.game?.name}
                      </span>
                      <p className="text-[11px] text-[#71717A]">
                        {r.resultTime}
                      </p>
                    </div>
                  </div>
                  <div className="text-[#71717A] dark:text-[#A1A1AA] font-bold text-xs">
                    {formatReadableDate(r.resultDate)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-[#71717A] text-xs sm:text-sm">Loading search engine...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
