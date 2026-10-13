'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Globe,
  Mail,
  Phone,
  Shield,
  FileText,
} from 'lucide-react';

export default function OwnerSettingsPage() {
  const [siteTitle, setSiteTitle] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [noticeBoard, setNoticeBoard] = useState('');
  const [alertBanner, setAlertBanner] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [metaKeywords, setMetaKeywords] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          const s = data.settings || {};
          setSiteTitle(s.site_title || 'NumberLive - Official Public Number Records');
          setSiteDescription(s.site_description || 'Independent historical number records and timetable archive.');
          setNoticeBoard(s.notice_board || '');
          setAlertBanner(s.alert_banner || '');
          setContactEmail(s.contact_email || 'editorial@numberlive.in');
          setContactPhone(s.contact_phone || '+91-9876543210');
          setDefaultLanguage(s.default_language || 'en');
          setMetaKeywords(s.meta_keywords || 'NumberLive, live results, chart records, historical scoreboard');
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
        setError('Failed to fetch settings from server.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            site_title: siteTitle,
            site_description: siteDescription,
            notice_board: noticeBoard,
            alert_banner: alertBanner,
            contact_email: contactEmail,
            contact_phone: contactPhone,
            default_language: defaultLanguage,
            meta_keywords: metaKeywords,
          },
        }),
      });

      if (res.ok) {
        setNotice('System settings updated and saved to PostgreSQL successfully!');
        setTimeout(() => setNotice(null), 3500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      console.error('Settings save error:', err);
      setError('An unexpected network error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#71717A] animate-pulse space-y-2">
        <div className="inline-block w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        <div>Loading system configurations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">
            GLOBAL CONFIGURATION
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
            System & Portal Settings
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Configure site identity, contact information, default language, and public editorial disclaimers.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-[8px] bg-[#ECFDF5] dark:bg-[#062D20] border border-[#A7F3D0] dark:border-[#065F46] text-xs text-[#047857] dark:text-[#6EE7B7] flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-[8px] bg-[#FEF2F2] dark:bg-[#2A1212] border border-[#FECACA] dark:border-[#521C1C] flex items-center gap-2.5 text-xs text-[#DC2626] dark:text-[#F87171]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Portal Identity */}
        <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-subtle space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tight text-[#111113] dark:text-[#FAF8F5] pb-2 border-b border-[#EAE3D5] dark:border-[#2E2E33] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#C5A059]" />
            <span>1. Portal Identity & Branding</span>
          </h3>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="siteTitle"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Website Title Tag
              </label>
              <input
                id="siteTitle"
                type="text"
                required
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="siteDescription"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Site Meta Description
              </label>
              <textarea
                id="siteDescription"
                rows={2}
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                className="w-full p-3 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="defaultLanguage"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
                >
                  Default Public Language
                </label>
                <select
                  id="defaultLanguage"
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="en">English (EN)</option>
                  <option value="hi">हिंदी (HI)</option>
                  <option value="bn">বাংলা (BN)</option>
                  <option value="mr">मराठी (MR)</option>
                  <option value="gu">ગુજરાતી (GU)</option>
                  <option value="pa">ਪੰਜਾਬੀ (PA)</option>
                  <option value="ur">اردو (UR)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="metaKeywords"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
                >
                  SEO Keywords
                </label>
                <input
                  id="metaKeywords"
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="Comma-separated keywords"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Disclaimers & Notice Board */}
        <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-subtle space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tight text-[#111113] dark:text-[#FAF8F5] pb-2 border-b border-[#EAE3D5] dark:border-[#2E2E33] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C5A059]" />
            <span>2. Live Notice Board & Headline Alert</span>
          </h3>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="noticeBoard"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Editorial Notice Board (Displayed across Home and Results footer)
              </label>
              <textarea
                id="noticeBoard"
                rows={3}
                value={noticeBoard}
                onChange={(e) => setNoticeBoard(e.target.value)}
                className="w-full p-3 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="alertBanner"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Header Alert Banner (Live announcement bar)
              </label>
              <input
                id="alertBanner"
                type="text"
                value={alertBanner}
                onChange={(e) => setAlertBanner(e.target.value)}
                placeholder="e.g. Real-time record sync active for today."
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
        </div>

        {/* 3. Official Contact Information */}
        <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-subtle space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tight text-[#111113] dark:text-[#FAF8F5] pb-2 border-b border-[#EAE3D5] dark:border-[#2E2E33] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#C5A059]" />
            <span>3. Official Contact & Support Channels</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="contactEmail"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Official Editorial Email
              </label>
              <input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="contactPhone"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Official Editorial Contact Line
              </label>
              <input
                id="contactPhone"
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-[6px] text-xs font-bold bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-6 py-2.5 rounded-[6px] text-xs font-black uppercase tracking-wider text-black bg-[#C5A059] hover:bg-[#B38F46] active:scale-[0.99] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
