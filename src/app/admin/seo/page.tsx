'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Save, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminSeoPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [pagePath, setPagePath] = useState('/');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [robots, setRobots] = useState('index, follow');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings || []);
        const homeSetting = data.settings?.find((s: any) => s.pagePath === '/');
        if (homeSetting) {
          setPagePath(homeSetting.pagePath);
          setMetaTitle(homeSetting.metaTitle);
          setMetaDescription(homeSetting.metaDescription || '');
          setCanonicalUrl(homeSetting.canonicalUrl || '');
          setOgTitle(homeSetting.ogTitle || '');
          setOgDescription(homeSetting.ogDescription || '');
          setRobots(homeSetting.robots || 'index, follow');
        }
      }
    } catch (e) {
      console.error('Failed to load SEO settings:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const loadFormValues = (s: any) => {
    setPagePath(s.pagePath);
    setMetaTitle(s.metaTitle);
    setMetaDescription(s.metaDescription || '');
    setCanonicalUrl(s.canonicalUrl || '');
    setOgTitle(s.ogTitle || '');
    setOgDescription(s.ogDescription || '');
    setRobots(s.robots || 'index, follow');
  };

  const handlePageSelect = (path: string) => {
    setPagePath(path);
    const existing = settings.find((s) => s.pagePath === path);
    if (existing) {
      loadFormValues(existing);
    } else {
      setMetaTitle(`NumberLive - ${path === '/' ? 'Home Scoreboard' : path.replace('/', '')}`);
      setMetaDescription('');
      setCanonicalUrl(`https://numberlive.in${path}`);
      setOgTitle('');
      setOgDescription('');
      setRobots('index, follow');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagePath,
          metaTitle,
          metaDescription,
          canonicalUrl,
          ogTitle,
          ogDescription,
          robots,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Failed to update SEO' });
        return;
      }

      setMessage({ type: 'success', text: `SEO settings for ${pagePath} saved successfully!` });
      fetchSettings();
    } catch (e) {
      setMessage({ type: 'error', text: 'Error updating settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111113] p-4 sm:p-5 rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#C5A059]" />
            <span>SEO &amp; Metadata Manager</span>
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Configure title tags, meta descriptions, and indexing directives.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="self-start sm:self-auto btn-secondary text-xs sm:text-sm font-bold min-h-[44px]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Message */}
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

      {/* Form Card */}
      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-6 shadow-subtle space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#71717A] uppercase mb-2">
            Select Route To Configure
          </label>
          <div className="flex flex-wrap gap-2">
            {['/', '/results', '/charts', '/history', '/games', '/faq', '/contact', '/disclaimer'].map(
              (p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageSelect(p)}
                  className={`min-h-[44px] px-3.5 py-2 text-xs sm:text-sm font-bold rounded-[6px] transition-colors ${
                    pagePath === p
                      ? 'bg-[#111113] text-[#C5A059] border border-[#C5A059] shadow-xs'
                      : 'bg-[#FAF8F5] dark:bg-[#18181B] text-[#5C5449] dark:text-[#D4D4D8] hover:bg-[#FAF8F5] border border-[#EAE3D5] dark:border-[#2E2E33]'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
              Page Path
            </label>
            <input
              type="text"
              readOnly
              value={pagePath}
              className="form-input font-mono text-xs sm:text-sm text-[#71717A] font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
              Meta Title Tag *
            </label>
            <input
              type="text"
              required
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="form-input text-xs sm:text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
              Meta Description *
            </label>
            <textarea
              rows={3}
              required
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="form-textarea text-xs sm:text-sm font-medium"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
                Canonical URL
              </label>
              <input
                type="text"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="form-input text-xs sm:text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
                Robots Directive
              </label>
              <input
                type="text"
                value={robots}
                onChange={(e) => setRobots(e.target.value)}
                className="form-input text-xs sm:text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full sm:w-auto text-xs sm:text-sm font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-[#C5A059]" />
            <span>Save SEO Directives</span>
          </button>
        </form>
      </div>
    </div>
  );
}
