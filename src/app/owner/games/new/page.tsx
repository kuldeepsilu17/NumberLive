'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Gamepad2,
  ArrowLeft,
  Clock,
  FolderTree,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export default function CreateGamePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [resultTime, setResultTime] = useState('03:00 PM');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          const cats = data.categories || [];
          setCategories(cats);
          if (cats.length > 0) {
            setCategoryId(cats[0].id);
          }
        }
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    }
    loadCategories();
  }, []);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generated);
    if (!seoTitle) {
      setSeoTitle(`${val} Live Result & Historical Record Chart - NumberLive`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slug.trim() || !resultTime.trim()) {
      setError('Game name, URL slug, and scheduled result time are required.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          categoryId: categoryId || null,
          resultTime: resultTime.trim(),
          description: description.trim(),
          sortOrder: parseInt(sortOrder) || 0,
          isActive,
          seoTitle: seoTitle.trim() || null,
          seoDescription: seoDescription.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create game.');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/owner/games');
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error('Create game error:', err);
      setError('An unexpected network error occurred.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
        <div className="flex items-center gap-3">
          <Link
            href="/owner/games"
            className="p-2 rounded-[6px] bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#71717A] hover:text-[#111113] dark:hover:text-white transition-colors"
            title="Back to Games"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">
              GAMES DIRECTORY
            </div>
            <h2 className="text-xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
              Create New Game
            </h2>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-[8px] bg-[#FEF2F2] dark:bg-[#2A1212] border border-[#FECACA] dark:border-[#521C1C] flex items-center gap-2.5 text-xs text-[#DC2626] dark:text-[#F87171]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-[8px] bg-[#ECFDF5] dark:bg-[#062D20] border border-[#A7F3D0] dark:border-[#065F46] flex items-center gap-2.5 text-xs text-[#047857] dark:text-[#6EE7B7]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Game created successfully! Redirecting to games directory...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Game Info Card */}
        <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-subtle space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tight text-[#111113] dark:text-[#FAF8F5] pb-2 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
            1. Basic Information & Timetable
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Game Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="gameName"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Game Name *
              </label>
              <input
                id="gameName"
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Delhi, Faridabad, Gali"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            {/* URL Slug */}
            <div className="space-y-1.5">
              <label
                htmlFor="gameSlug"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                URL Slug *
              </label>
              <input
                id="gameSlug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="e.g. delhi, faridabad"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-mono bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label
                htmlFor="gameCategory"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Regional Category
              </label>
              <select
                id="gameCategory"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              >
                <option value="">None / Unassigned</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Release Time */}
            <div className="space-y-1.5">
              <label
                htmlFor="gameTime"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Announcement Time *
              </label>
              <input
                id="gameTime"
                type="text"
                required
                value={resultTime}
                onChange={(e) => setResultTime(e.target.value)}
                placeholder="e.g. 03:00 PM, 11:15 PM"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label
                htmlFor="sortOrder"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Display Priority / Sort Order
              </label>
              <input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                placeholder="1"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            {/* Active Status */}
            <div className="space-y-1.5 flex flex-col justify-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]">
                Directory State
              </label>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#C5A059] rounded"
                />
                <span className="text-xs font-bold text-[#111113] dark:text-[#FAF8F5]">
                  Active in public scoreboard & timetable
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
            >
              Public Description & Notes
            </label>
            <textarea
              id="description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Daily daytime public number announcement for Delhi region."
              className="w-full p-3 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
            />
          </div>
        </div>

        {/* SEO Metadata Card */}
        <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-subtle space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tight text-[#111113] dark:text-[#FAF8F5] pb-2 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
            2. SEO & Search Engine Optimization
          </h3>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="seoTitle"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Meta Title Tag
              </label>
              <input
                id="seoTitle"
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="e.g. Delhi Live Result & Record Chart - NumberLive"
                className="w-full min-h-[40px] px-3.5 py-2 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="seoDescription"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Meta Description
              </label>
              <textarea
                id="seoDescription"
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Check daily published Delhi number result at 03:00 PM, timetable schedule, and multi-year historical record chart."
                className="w-full p-3 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/owner/games"
            className="min-h-[44px] px-4 py-2 rounded-[6px] text-xs font-bold text-[#5C5449] dark:text-[#D4D4D8] hover:bg-[#FAF8F5] border border-[#EAE3D5] dark:border-[#2E2E33] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] px-6 py-2.5 rounded-[6px] text-xs font-black uppercase tracking-wider text-black bg-[#C5A059] hover:bg-[#B38F46] active:scale-[0.99] transition-all flex items-center gap-1.5 shadow-sm"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Save & Add Game</span>
          </button>
        </div>
      </form>
    </div>
  );
}
