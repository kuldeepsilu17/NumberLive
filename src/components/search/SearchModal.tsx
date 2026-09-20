'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight, Clock } from 'lucide-react';
import { formatReadableDate } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    games: any[];
    results: any[];
  }>({ games: [], results: [] });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      setResults({ games: [], results: [] });
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ games: [], results: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults({ games: data.games || [], results: data.results || [] });
        }
      } catch (err) {
        console.error('Search fetch error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 p-4 bg-[#09090B]/85 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'calc(100% - 16px)' }}
      >
        {/* Modal Header */}
        <div className="bg-[#111113] text-white px-4 h-12 flex items-center justify-between border-b border-[#2E2E33] shrink-0">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#C5A059]" />
            <span className="font-black tracking-wider uppercase text-xs text-[#FAF8F5]">
              SEARCH NUMBERLIVE ARCHIVES
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 -mr-2 flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors focus:outline-none"
            aria-label="Close search"
          >
            <X className="w-5 h-5 text-[#C5A059]" />
          </button>
        </div>

        {/* Search Input Bar (48px height touch area) */}
        <div className="flex items-center px-3 sm:px-4 py-2 border-b border-[#EAE3D5] dark:border-[#2E2E33] gap-2.5 bg-[#FAF8F5] dark:bg-[#18181B] shrink-0">
          <Search className="w-5 h-5 text-[#C5A059] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search games, results or charts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-h-[44px] bg-transparent border-none outline-none text-[#111113] dark:text-[#FAF8F5] placeholder:text-[#71717A] text-sm sm:text-base font-semibold"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="w-10 h-10 flex items-center justify-center text-[#71717A] hover:text-[#111113] dark:hover:text-[#FAF8F5]"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-4 space-y-4">
          {loading && (
            <div className="py-8 text-center text-xs text-[#71717A] font-medium">
              Searching official verified database...
            </div>
          )}

          {!loading && !query && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C8275] dark:text-[#71717A] mb-2">
                Quick Regional Lookups
              </p>
              <div className="flex flex-wrap gap-2">
                {['Delhi', 'Faridabad', 'Ghaziabad', 'Gali', 'Desawar', 'Noida', 'Aligarh', 'Kalyan'].map((game) => (
                  <button
                    key={game}
                    onClick={() => setQuery(game)}
                    className="min-h-[44px] px-3.5 py-2 text-xs font-bold bg-[#FAF8F5] dark:bg-[#18181B] hover:bg-[#111113] hover:text-[#C5A059] text-[#111113] dark:text-[#D4D4D8] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[6px] transition-colors active:scale-95"
                  >
                    {game}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query && results.games.length === 0 && results.results.length === 0 && (
            <div className="py-8 text-center text-xs text-[#71717A]">
              <p className="font-bold text-sm text-[#111113] dark:text-[#FAF8F5]">
                No records found for &quot;{query}&quot;
              </p>
              <p className="mt-1 text-[11px]">
                Try checking another game title or number (00–99).
              </p>
            </div>
          )}

          {/* Matched Games */}
          {results.games.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C8275] dark:text-[#71717A] mb-2">
                Matched Games ({results.games.length})
              </p>
              <div className="space-y-2">
                {results.games.map((g) => (
                  <Link
                    key={g.id}
                    href={`/games/${g.slug}`}
                    onClick={onClose}
                    className="min-h-[48px] p-3 bg-[#FAF8F5] dark:bg-[#18181B] hover:border-[#C5A059] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[8px] flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <h4 className="font-black text-[#111113] dark:text-white group-hover:text-[#C5A059] text-xs sm:text-sm uppercase tracking-tight">
                        {g.name}
                      </h4>
                      <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#8C8275]" /> Scheduled at {g.resultTime}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#C5A059] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Results */}
          {results.results.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C8275] dark:text-[#71717A] mb-2">
                Published Number Results ({results.results.length})
              </p>
              <div className="space-y-1.5">
                {results.results.map((r) => (
                  <Link
                    key={r.id}
                    href={`/games/${r.game?.slug || ''}`}
                    onClick={onClose}
                    className="min-h-[48px] p-3 bg-[#FAF8F5] dark:bg-[#18181B] hover:border-[#C5A059] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[8px] flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-black text-base text-[#111113] dark:text-[#FAF8F5] bg-white dark:bg-[#111113] px-2.5 py-1 rounded-[5px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-xs">
                        {r.resultValue}
                      </span>
                      <div>
                        <span className="font-bold text-[#111113] dark:text-white text-xs sm:text-sm uppercase block">
                          {r.game?.name || 'Game'}
                        </span>
                        <span className="text-[10px] text-[#71717A]">
                          Declared at {r.resultTime}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#71717A] font-medium text-right">
                      {formatReadableDate(r.resultDate)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#09090B] border-t border-[#EAE3D5] dark:border-[#2E2E33] text-[10.5px] text-[#71717A] flex items-center justify-between font-bold shrink-0">
          <span>Public Verified Archive</span>
          <span className="text-[#C5A059] font-black">NUMBERLIVE</span>
        </div>
      </div>
    </div>
  );
}
