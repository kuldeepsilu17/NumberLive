'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Clock, ArrowRight } from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<any[]>([]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setGames([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const json = await res.json();
      if (json.success) {
        setGames(json.games || []);
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
    <div className="space-y-4 max-w-2xl mx-auto py-2">
      {/* Search Header */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#27272A] p-4 sm:p-5 rounded-[8px] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#27272A] flex items-center justify-center text-[#C5A059] shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              SEARCH GAMES
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Search games by name to view official timings and charts.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search game name (e.g. Delhi, Desawar, Gali)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-3 text-xs font-semibold bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#27272A] rounded-[6px] focus:outline-none focus:border-[#C5A059] text-[#111113] dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="h-10 px-5 text-xs font-bold uppercase tracking-wider bg-[#111113] dark:bg-[#FAF8F5] text-white dark:text-[#111113] hover:bg-[#27272A] dark:hover:bg-[#E4E4E7] rounded-[6px] transition-colors"
        >
          Search
        </button>
      </form>

      {/* Search Results */}
      <div className="space-y-3">
        {loading && (
          <div className="py-8 text-center text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Searching games...
          </div>
        )}

        {!loading && query && games.length === 0 && (
          <div className="py-8 bg-white dark:bg-[#111113] rounded-[8px] border border-[#EAE3D5] dark:border-[#27272A] text-center text-xs text-[#71717A] dark:text-[#A1A1AA]">
            No games found for &quot;{query}&quot;
          </div>
        )}

        {games.length > 0 && (
          <div className="bg-white dark:bg-[#111113] rounded-[8px] border border-[#EAE3D5] dark:border-[#27272A] shadow-xs overflow-hidden">
            <div className="bg-[#FAF8F5] dark:bg-[#18181B] border-b border-[#EAE3D5] dark:border-[#27272A] px-3.5 py-2 text-xs font-black uppercase text-[#111113] dark:text-[#FAF8F5]">
              MATCHED GAMES ({games.length})
            </div>
            <div className="divide-y divide-[#EAE3D5] dark:divide-[#27272A]">
              {games.map((g) => (
                <div
                  key={g.id}
                  className="p-3 sm:px-4 flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] transition-colors"
                >
                  <div>
                    <h2 className="text-xs sm:text-sm font-black uppercase text-[#111113] dark:text-[#FAF8F5]">
                      {g.name}
                    </h2>
                    <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#C5A059]" />
                      <span>Result Time: {g.resultTime}</span>
                    </p>
                  </div>
                  <Link
                    href={`/charts/${g.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#C5A059] hover:underline"
                  >
                    <span>Record Chart</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
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
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs text-[#71717A]">
          Loading search...
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
