'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    sortOrder: 0,
    isActive: true,
  });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/faq?all=true');
      const data = await res.json();
      if (data.success) {
        setFaqs(data.faqs || []);
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      sortOrder: faqs.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sortOrder: faq.sortOrder,
      isActive: faq.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/faq';
      const method = editingFaq ? 'PUT' : 'POST';
      const payload = editingFaq ? { id: editingFaq.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save FAQ');
      }

      setStatusMessage({
        type: 'success',
        text: editingFaq ? 'FAQ updated successfully.' : 'FAQ created successfully.',
      });
      setModalOpen(false);
      fetchFaqs();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ entry?')) return;

    try {
      const res = await fetch(`/api/faq?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete FAQ');
      }
      setStatusMessage({ type: 'success', text: 'FAQ deleted.' });
      fetchFaqs();
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
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              FREQUENTLY ASKED QUESTIONS MANAGER
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Create, edit, reorder, and categorize public FAQ items.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="h-10 px-4 min-h-[44px] inline-flex items-center gap-2 text-xs font-bold text-[#111113] bg-[#C5A059] hover:bg-[#B38F48] rounded-[6px] transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

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

      {/* FAQ Table */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] font-bold">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C5A059] mb-2" />
            Loading FAQs...
          </div>
        ) : faqs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#71717A]">
            No FAQs found. Click &quot;Add New FAQ&quot; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EAE3D5] dark:border-[#2E2E33] bg-[#FAF8F5] dark:bg-[#18181B] text-[#71717A] dark:text-[#A1A1AA] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Question</th>
                  <th className="py-3 px-4">Answer Preview</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
                {faqs.map((f) => (
                  <tr
                    key={f.id}
                    className="hover:bg-[#FAF8F5]/80 dark:hover:bg-[#18181B]/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#111113] dark:text-[#FAF8F5]">
                      {f.sortOrder}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#C5A059]">
                      {f.category}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#111113] dark:text-[#FAF8F5] max-w-xs truncate">
                      {f.question}
                    </td>
                    <td className="py-3.5 px-4 text-[#71717A] dark:text-[#A1A1AA] max-w-sm truncate">
                      {f.answer}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-zinc-500/10 text-zinc-500'
                        }`}
                      >
                        {f.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(f)}
                          className="h-8 px-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#FAF8F5] bg-[#18181B] hover:bg-[#222226] border border-[#2E2E33] hover:border-[#C5A059] rounded-[5px] transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-[#C5A059]" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="h-8 px-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-red-500 bg-[#18181B] hover:bg-red-500/10 border border-[#2E2E33] rounded-[5px] transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
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
          <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-3">
              <h2 className="text-sm font-black uppercase text-[#111113] dark:text-[#FAF8F5]">
                {editingFaq ? 'Edit FAQ Item' : 'Create New FAQ Item'}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-[#71717A]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-select font-bold"
                >
                  <option value="General">General</option>
                  <option value="Results">Results</option>
                  <option value="Timetable">Timetable</option>
                  <option value="Legal">Legal &amp; Policy</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. How fast are results updated?"
                  className="form-input font-bold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Detailed answer text..."
                  className="form-textarea"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C5A059] focus:ring-[#C5A059]"
                    />
                    <span>Active (Publicly Visible)</span>
                  </label>
                </div>
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
                  <span>Save FAQ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
