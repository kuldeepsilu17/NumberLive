'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  PlusCircle,
  Edit,
  Trash2,
  Power,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
} from 'lucide-react';
import ConfirmationModal from '@/components/owner/ConfirmationModal';

interface GameItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  resultTime: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  _count?: {
    results: number;
  };
}

export default function OwnerGamesPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<GameItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/games?all=true');
      if (res.ok) {
        const data = await res.json();
        setGames(data.games || []);
      }
    } catch (e) {
      console.error('Failed to load games:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleToggleStatus = async (game: GameItem) => {
    setTogglingId(game.id);
    try {
      const newStatus = !game.isActive;
      const res = await fetch('/api/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: game.id,
          isActive: newStatus,
        }),
      });

      if (res.ok) {
        setNotice(`Game '${game.name}' is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
        setTimeout(() => setNotice(null), 3000);
        await fetchGames();
      }
    } catch (e) {
      console.error('Toggle error:', e);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteGame = async () => {
    if (!gameToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/games?id=${gameToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setNotice(`Deleted game '${gameToDelete.name}'`);
        setTimeout(() => setNotice(null), 3000);
        setDeleteModalOpen(false);
        setGameToDelete(null);
        await fetchGames();
      }
    } catch (e) {
      console.error('Delete error:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
         1. TOP HEADER & ACTIONS
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">
            OFFICIAL TIMETABLE & DIRECTORY
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
            Monitored Games Directory
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Configure announcement schedules, regional categories, SEO metadata, and active states. Total games: {games.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchGames}
            className="flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-[6px] text-xs font-bold bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] hover:text-[#C5A059] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C5A059]' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/owner/games/new"
            className="flex items-center gap-1.5 min-h-[38px] px-4 py-1.5 rounded-[6px] text-xs font-black uppercase tracking-wider text-black bg-[#C5A059] hover:bg-[#B38F46] transition-all shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Game</span>
          </Link>
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-[8px] bg-[#ECFDF5] dark:bg-[#062D20] border border-[#A7F3D0] dark:border-[#065F46] text-xs text-[#047857] dark:text-[#6EE7B7] flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         2. GAMES TABLE & RESPONSIVE CARDS
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] animate-pulse space-y-2">
            <div className="inline-block w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
            <div>Loading games directory...</div>
          </div>
        ) : games.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Gamepad2 className="w-8 h-8 text-[#8C8275] mx-auto opacity-60" />
            <h4 className="text-sm font-black text-[#111113] dark:text-[#FAF8F5]">
              No Games Found
            </h4>
            <p className="text-xs text-[#71717A]">
              Get started by creating your first monitored game in the directory.
            </p>
            <Link
              href="/owner/games/new"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#C5A059] hover:underline"
            >
              + Create New Game
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] dark:bg-[#1C1C20] border-b border-[#EAE3D5] dark:border-[#2E2E33] text-[10px] font-black uppercase text-[#8C8275] dark:text-[#A1A1AA] tracking-wider">
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Game Name & Slug</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Scheduled Release</th>
                    <th className="py-3 px-4">Total Records</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
                  {games.map((g) => (
                    <tr
                      key={g.id}
                      className="hover:bg-[#FAF8F5]/60 dark:hover:bg-[#1C1C20]/60 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#8C8275]">
                        #{g.sortOrder}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                          {g.name}
                        </div>
                        <div className="text-[10px] text-[#8C8275] font-mono">
                          /games/{g.slug}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] text-[11px] font-medium text-[#5C5449] dark:text-[#D4D4D8]">
                          <FolderTree className="w-3 h-3 text-[#C5A059]" />
                          <span>{g.category?.name || 'General'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-[#5C5449] dark:text-[#D4D4D8]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>{g.resultTime}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[#71717A]">
                        {g._count?.results || 0} entries
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(g)}
                          disabled={togglingId === g.id}
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-[4px] border transition-colors ${
                            g.isActive
                              ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] hover:bg-[#D1FAE5]'
                              : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]'
                          }`}
                          title="Click to toggle active state"
                        >
                          <Power className="w-3 h-3" />
                          <span>{g.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/owner/results/new?gameId=${g.id}`}
                            className="min-h-[28px] px-2 py-1 rounded bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] text-[11px] font-bold text-[#C5A059] hover:border-[#C5A059] transition-colors"
                          >
                            + Result
                          </Link>

                          <Link
                            href={`/owner/games/${g.id}/edit`}
                            className="p-1.5 rounded text-[#71717A] hover:text-[#111113] dark:hover:text-white hover:bg-[#FAF8F5] dark:hover:bg-[#1C1C20] transition-colors"
                            title="Edit Game Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => {
                              setGameToDelete(g);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded text-[#71717A] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#2A1515] transition-colors"
                            title="Delete Game"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
              {games.map((g) => (
                <div key={g.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#8C8275]">
                        #{g.sortOrder} • {g.category?.name || 'General'}
                      </span>
                      <h4 className="text-base font-black text-[#111113] dark:text-[#FAF8F5]">
                        {g.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-[#71717A] mt-0.5">
                        <Clock className="w-3 h-3 text-[#C5A059]" />
                        <span>{g.resultTime}</span>
                        <span>•</span>
                        <span>{g._count?.results || 0} results</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(g)}
                      disabled={togglingId === g.id}
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                        g.isActive
                          ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                          : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                      }`}
                    >
                      {g.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EAE3D5] dark:border-[#2E2E33] text-xs">
                    <Link
                      href={`/owner/results/new?gameId=${g.id}`}
                      className="text-[#C5A059] font-bold hover:underline"
                    >
                      + Publish Result
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/owner/games/${g.id}/edit`}
                        className="px-2.5 py-1 rounded bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] font-bold text-xs"
                      >
                        Edit Game
                      </Link>

                      <button
                        onClick={() => {
                          setGameToDelete(g);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1 text-[#DC2626]"
                        aria-label="Delete game"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Monitored Game"
        message={`Are you sure you want to delete '${gameToDelete?.name}'? Warning: Deleting a game will permanently remove all associated historical results (${gameToDelete?._count?.results || 0} records). This action is recorded in the audit trail.`}
        confirmLabel="Delete Game & All Results"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteGame}
        onCancel={() => {
          setDeleteModalOpen(false);
          setGameToDelete(null);
        }}
      />
    </div>
  );
}
