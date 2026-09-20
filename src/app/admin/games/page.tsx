'use client';

import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

export default function AdminGamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<any | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formResultTime, setFormResultTime] = useState('03:00 PM');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(0);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/games?all=true');
      const data = await res.json();
      if (data.success) {
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

  const openAddModal = () => {
    setEditingGame(null);
    setFormName('');
    setFormSlug('');
    setFormResultTime('03:00 PM');
    setFormDescription('');
    setFormIsActive(true);
    setFormSortOrder(games.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (game: any) => {
    setEditingGame(game);
    setFormName(game.name);
    setFormSlug(game.slug);
    setFormResultTime(game.resultTime);
    setFormDescription(game.description || '');
    setFormIsActive(game.isActive);
    setFormSortOrder(game.sortOrder);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingGame) {
      setFormSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const endpoint = '/api/games';
    const method = editingGame ? 'PUT' : 'POST';
    const payload = {
      ...(editingGame ? { id: editingGame.id } : {}),
      name: formName,
      slug: formSlug,
      resultTime: formResultTime,
      description: formDescription,
      isActive: formIsActive,
      sortOrder: Number(formSortOrder),
    };

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Failed to save game' });
        return;
      }

      setMessage({
        type: 'success',
        text: editingGame ? 'Game updated successfully!' : 'New game added successfully!',
      });
      setIsModalOpen(false);
      fetchGames();
    } catch (e) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    }
  };

  const handleToggleActive = async (game: any) => {
    try {
      const res = await fetch('/api/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: game.id,
          isActive: !game.isActive,
        }),
      });
      if (res.ok) {
        fetchGames();
      }
    } catch (e) {
      console.error('Failed to toggle status:', e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove all associated results.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/games?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Deleted game ${name}` });
        fetchGames();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Error deleting game' });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111113] p-4 sm:p-5 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[#C5A059]" />
            <span>Games &amp; Timetables Manager</span>
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Configure regional games, official timetable release times, and display order.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-primary text-xs sm:text-sm font-bold self-start sm:self-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>Add New Game</span>
        </button>
      </div>

      {/* Alert message */}
      {message && (
        <div
          className={`p-3.5 rounded-[8px] border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A] dark:bg-[#052E16] dark:border-[#166534]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626] dark:bg-[#18181B] dark:border-[#DC2626]/40'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Games Table & Mobile Cards */}
      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle overflow-hidden space-y-0">
        <div className="section-header-clean bg-white dark:bg-[#111113] border-b border-[#EAE3D5] dark:border-[#2E2E33] p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-black">
          <span className="text-[#111113] dark:text-[#FAF8F5] uppercase">ACTIVE REGIONAL GAMES DIRECTORY</span>
          <span className="text-[10px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] px-2.5 py-1 rounded-[4px] text-[#111113] dark:text-[#FAF8F5] font-mono font-bold">
            {games.length} REGISTERED
          </span>
        </div>

        {/* Desktop Table View (md+ screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="results-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Game Name</th>
                <th>Slug</th>
                <th>Release Schedule</th>
                <th className="text-center">Records</th>
                <th className="text-center">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#71717A] text-xs">
                    Loading games...
                  </td>
                </tr>
              ) : games.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-[#71717A] text-xs">
                    No games found. Click &apos;Add New Game&apos; to create one.
                  </td>
                </tr>
              ) : (
                games.map((g) => (
                  <tr key={g.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#18181B]">
                    <td className="font-bold text-[#71717A]">
                      #{g.sortOrder}
                    </td>
                    <td className="font-bold uppercase text-[#111113] dark:text-[#FAF8F5]">
                      {g.name}
                    </td>
                    <td className="text-[#71717A] font-mono text-xs">
                      /games/{g.slug}
                    </td>
                    <td>
                      <span className="font-bold text-xs bg-[#FAF8F5] dark:bg-[#18181B] px-2.5 py-1 rounded border border-[#EAE3D5] dark:border-[#2E2E33]">
                        {g.resultTime}
                      </span>
                    </td>
                    <td className="text-center text-[#5C5449] dark:text-[#A1A1AA] font-bold">
                      {g._count?.results || 0}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleToggleActive(g)}
                        className={`badge-live ${
                          g.isActive ? '' : '!bg-[#FAF8F5] !text-[#71717A] !border-[#EAE3D5]'
                        }`}
                      >
                        {g.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(g)}
                          className="btn-secondary !min-h-[34px] !px-2.5 text-xs font-bold"
                          title="Edit Game"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#C5A059]" />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id, g.name)}
                          className="btn-secondary !min-h-[34px] !px-2.5 text-xs font-bold text-[#DC2626] hover:bg-[#FEF2F2]"
                          title="Delete Game"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (< md screens) */}
        <div className="md:hidden p-3.5 space-y-3">
          {games.map((g) => (
            <div
              key={g.id}
              className="bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[8px] p-3.5 space-y-2.5 shadow-subtle"
            >
              <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2">
                <div>
                  <span className="font-bold text-[10px] text-[#71717A] block">
                    Order #{g.sortOrder}
                  </span>
                  <span className="font-black text-sm uppercase text-[#111113] dark:text-[#FAF8F5]">
                    {g.name}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleActive(g)}
                  className={`badge-live ${
                    g.isActive ? '' : '!bg-[#FAF8F5] !text-[#71717A] !border-[#EAE3D5]'
                  }`}
                >
                  {g.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="text-xs space-y-1 text-[#71717A]">
                <div>Schedule: <strong className="text-[#111113] dark:text-[#FAF8F5]">{g.resultTime}</strong></div>
                <div className="font-mono text-[11px]">Key: /games/{g.slug}</div>
              </div>

              <div className="pt-2 border-t border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(g)}
                  className="btn-secondary flex-1 text-xs font-bold inline-flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Edit Game</span>
                </button>
                <button
                  onClick={() => handleDelete(g.id, g.name)}
                  className="btn-secondary min-h-[44px] px-3 text-xs font-bold text-[#DC2626]"
                  title="Delete Game"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Game Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-5 shadow-2xl space-y-3.5 text-xs sm:text-sm"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'calc(100% - 32px)' }}
          >
            <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-2">
              <h3 className="text-sm sm:text-base font-black text-[#111113] dark:text-[#FAF8F5] uppercase">
                {editingGame ? 'Edit Game' : 'Add New Game'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-11 h-11 -mr-2 flex items-center justify-center text-[#71717A] hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
                  Game Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delhi, Faridabad"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="form-input text-xs sm:text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
                    Slug (URL Key) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. delhi"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase())}
                    className="form-input font-mono text-xs sm:text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
                    Scheduled Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 03:00 PM"
                    value={formResultTime}
                    onChange={(e) => setFormResultTime(e.target.value)}
                    className="form-input text-xs sm:text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
                  Description / Archive Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Official daytime public number result and archive for Delhi region."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="form-textarea text-xs sm:text-sm font-medium"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="form-input text-xs sm:text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1">
                    Active Status
                  </label>
                  <select
                    value={formIsActive ? '1' : '0'}
                    onChange={(e) => setFormIsActive(e.target.value === '1')}
                    className="form-select text-xs sm:text-sm font-bold"
                  >
                    <option value="1">Active (Visible)</option>
                    <option value="0">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  className="btn-primary w-full text-xs sm:text-sm font-bold uppercase tracking-wider"
                >
                  {editingGame ? 'Save Changes' : 'Create Game'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary w-full text-xs sm:text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
