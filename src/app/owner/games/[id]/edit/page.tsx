'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Gamepad2,
} from 'lucide-react';
import ConfirmationModal from '@/components/owner/ConfirmationModal';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export default function EditGamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params?.id as string;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [resultTime, setResultTime] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!gameId) return;
      try {
        const [catsRes, gamesRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/games?all=true'),
        ]);

        if (catsRes.ok) {
          const catsData = await catsRes.json();
          setCategories(catsData.categories || []);
        }

        if (gamesRes.ok) {
          const gamesData = await gamesRes.json();
          const game = gamesData.games?.find((g: any) => g.id === gameId);
          if (game) {
            setName(game.name);
            setSlug(game.slug);
            setCategoryId(game.categoryId || '');
            setResultTime(game.resultTime);
            setDescription(game.description || '');
            setSortOrder(String(game.sortOrder));
            setIsActive(game.isActive);
            setSeoTitle(game.seoTitle || '');
            setSeoDescription(game.seoDescription || '');
          } else {
            setError('Game not found.');
          }
        }
      } catch (e) {
        console.error('Error loading game data:', e);
        setError('Failed to load game information.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [gameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slug.trim() || !resultTime.trim()) {
      setError('Game name, slug, and scheduled time are required.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: gameId,
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
        setError(data.error || 'Failed to update game.');
        setSubmitting(false);
        return;
      }

      setSuccess('Game settings updated successfully!');
      setTimeout(() => {
        router.push('/owner/games');
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error('Update error:', err);
      setError('An unexpected error occurred.');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/games?id=${gameId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/owner/games');
        router.refresh();
      } else {
        setError('Failed to delete game.');
        setDeleteModalOpen(false);
      }
    } catch (e) {
      console.error('Delete error:', e);
      setError('Network error while deleting game.');
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#71717A] animate-pulse space-y-2">
        <div className="inline-block w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        <div>Loading game settings...</div>
      </div>
    );
  }

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
              CONFIGURATOR
            </div>
            <h2 className="text-xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
              Edit Game: {name}
            </h2>
          </div>
        </div>

        <button
          onClick={() => setDeleteModalOpen(true)}
          className="flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-[6px] text-xs font-bold text-[#DC2626] bg-[#FEF2F2] dark:bg-[#2A1515] border border-[#FECACA] dark:border-[#521C1C] hover:bg-[#FEE2E2] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Game</span>
        </button>
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
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-subtle space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tight text-[#111113] dark:text-[#FAF8F5] pb-2 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
            1. Core Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="editGameName"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Game Name *
              </label>
              <input
                id="editGameName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="editGameSlug"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                URL Slug *
              </label>
              <input
                id="editGameSlug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-mono bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="editGameCategory"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Category
              </label>
              <select
                id="editGameCategory"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="editGameTime"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Announcement Schedule Time *
              </label>
              <input
                id="editGameTime"
                type="text"
                required
                value={resultTime}
                onChange={(e) => setResultTime(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="editSortOrder"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Sort Rank Order
              </label>
              <input
                id="editSortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

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
                  Active in public scoreboard & charts
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="editDescription"
              className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
            >
              Public Description
            </label>
            <textarea
              id="editDescription"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
            />
          </div>
        </div>

        {/* SEO Meta Card */}
        <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-subtle space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tight text-[#111113] dark:text-[#FAF8F5] pb-2 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
            2. SEO Metadata Tags
          </h3>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="editSeoTitle"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Meta Title
              </label>
              <input
                id="editSeoTitle"
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full min-h-[40px] px-3.5 py-2 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="editSeoDesc"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Meta Description
              </label>
              <textarea
                id="editSeoDesc"
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full p-3 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
        </div>

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
            <span>Save Game Settings</span>
          </button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Monitored Game"
        message={`Are you sure you want to permanently delete '${name}'? This will remove all associated results and timetable entries.`}
        confirmLabel="Delete Game"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
