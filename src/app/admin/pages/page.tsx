'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface PageItem {
  id: string;
  key: string;
  title: string;
  contentJson: string;
  updatedAt: string;
}

export default function AdminPagesManager() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [activeKey, setActiveKey] = useState('about');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pages');
      const data = await res.json();
      if (data.success && data.pages) {
        setPages(data.pages);
        const current = data.pages.find((p: PageItem) => p.key === activeKey) || data.pages[0];
        if (current) {
          setActiveKey(current.key);
          setTitle(current.title);
          setContent(current.contentJson);
        }
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  }, [activeKey]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleSelectPage = (pageKey: string) => {
    setActiveKey(pageKey);
    const p = pages.find((item) => item.key === pageKey);
    if (p) {
      setTitle(p.title);
      setContent(p.contentJson);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: activeKey,
          title,
          contentJson: content,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update page');
      }

      setStatusMessage({ type: 'success', text: `Page "${title}" saved successfully.` });
      fetchPages();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 sm:p-5 shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              CONTENT PAGES &amp; LEGAL CMS
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Edit public text content for About, Disclaimer, Privacy Policy, and Terms of Service.
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-[8px] border text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Page List Sidebar */}
        <div className="md:col-span-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] px-1">
            Editable Public Pages
          </div>
          {loading ? (
            <div className="p-4 text-center text-xs text-[#71717A]">Loading pages...</div>
          ) : (
            pages.map((p) => {
              const isActive = activeKey === p.key;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPage(p.key)}
                  className={`w-full p-3 rounded-[8px] text-left text-xs font-bold transition-all flex items-center justify-between min-h-[44px] ${
                    isActive
                      ? 'bg-[#111113] text-[#C5A059] border border-[#C5A059] shadow-xs'
                      : 'bg-white dark:bg-[#111113] text-[#111113] dark:text-[#FAF8F5] border border-[#EAE3D5] dark:border-[#2E2E33] hover:border-[#C5A059]'
                  }`}
                >
                  <span className="truncate">{p.title}</span>
                  <span className="text-[10px] font-mono text-[#71717A] uppercase">
                    /{p.key}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Editor Form */}
        <div className="md:col-span-8 bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-5 shadow-subtle space-y-4">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                Page Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input font-bold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                Content Body (JSON / Structured Text) *
              </label>
              <textarea
                rows={12}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="form-textarea font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[#EAE3D5] dark:border-[#2E2E33]">
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-6 text-xs font-bold text-[#111113] bg-[#C5A059] hover:bg-[#B38F48] rounded-[6px] inline-flex items-center gap-1.5 shadow-xs"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Page Content</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
