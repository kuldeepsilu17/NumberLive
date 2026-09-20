'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count?: { games: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sortOrder: 0,
  });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      sortOrder: categories.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      sortOrder: cat.sortOrder,
    });
    setModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slug,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const payload = editingCategory ? { id: editingCategory.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save category');
      }

      setStatusMessage({
        type: 'success',
        text: editingCategory ? 'Category updated successfully.' : 'Category created successfully.',
      });
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? Games in this category will become unassigned.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete category');
      }
      setStatusMessage({ type: 'success', text: `Category "${name}" deleted.` });
      fetchCategories();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 sm:p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              GAME CATEGORIES MANAGER
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Create and manage scalable game categories (Main Games, Regional, Day, Night).
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="h-10 px-4 min-h-[44px] inline-flex items-center gap-2 text-xs font-bold text-[#111113] bg-[#C5A059] hover:bg-[#B38F48] rounded-[6px] transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-[8px] border text-xs font-semibold flex items-center justify-between gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Table / Cards */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] font-bold">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C5A059] mb-2" />
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#71717A]">
            No categories created yet. Click &quot;Add New Category&quot; to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EAE3D5] dark:border-[#2E2E33] bg-[#FAF8F5] dark:bg-[#18181B] text-[#71717A] dark:text-[#A1A1AA] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Assigned Games</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-[#FAF8F5]/80 dark:hover:bg-[#18181B]/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#111113] dark:text-[#FAF8F5]">
                      {cat.sortOrder}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#111113] dark:text-[#FAF8F5]">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#71717A] dark:text-[#A1A1AA]">
                      {cat.slug}
                    </td>
                    <td className="py-3.5 px-4 text-[#71717A] dark:text-[#A1A1AA] max-w-xs truncate">
                      {cat.description || '--'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-[#C5A059]">
                      {cat._count?.games || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="h-8 px-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#FAF8F5] bg-[#18181B] hover:bg-[#222226] border border-[#2E2E33] hover:border-[#C5A059] rounded-[5px] transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-[#C5A059]" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="h-8 px-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-red-500 bg-[#18181B] hover:bg-red-500/10 border border-[#2E2E33] hover:border-red-500/50 rounded-[5px] transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-3">
              <h2 className="text-sm font-black uppercase text-[#111113] dark:text-[#FAF8F5]">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-[#71717A]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Main Games"
                  className="form-input font-bold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. main-games"
                  className="form-input font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this game category..."
                  className="form-textarea"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="form-input font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE3D5] dark:border-[#2E2E33]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-9 px-4 text-xs font-bold text-[#71717A] hover:bg-[#FAF8F5] dark:hover:bg-[#18181B] rounded-[6px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 text-xs font-bold text-[#111113] bg-[#C5A059] hover:bg-[#B38F48] rounded-[6px] inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
