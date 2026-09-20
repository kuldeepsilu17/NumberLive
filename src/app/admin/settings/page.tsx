'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    notice_board: '',
    alert_banner: '',
    site_title: '',
    contact_email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({
          notice_board: data.settings.notice_board || '',
          alert_banner: data.settings.alert_banner || '',
          site_title: data.settings.site_title || '',
          contact_email: data.settings.contact_email || '',
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setStatusMessage({ type: 'success', text: 'Site settings and notice board updated successfully.' });
      fetchSettings();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-4 sm:p-5 shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              PORTAL CONFIGURATION &amp; NOTICE SETTINGS
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Configure homepage notice board text, alert banners, portal title, and editorial emails.
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

      {/* Settings Form */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-5 shadow-subtle">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] font-bold">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C5A059] mb-2" />
            Loading settings...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                Homepage Notice Board Text *
              </label>
              <textarea
                rows={3}
                required
                value={settings.notice_board}
                onChange={(e) => setSettings({ ...settings, notice_board: e.target.value })}
                placeholder="Important public notice displayed prominently on homepage..."
                className="form-textarea"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                Top Urgent Announcement Banner
              </label>
              <input
                type="text"
                value={settings.alert_banner}
                onChange={(e) => setSettings({ ...settings, alert_banner: e.target.value })}
                placeholder="e.g. Live timetable sync active for September 2026."
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                  Portal Header Brand Title
                </label>
                <input
                  type="text"
                  value={settings.site_title}
                  onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                  placeholder="NumberLive - Official Public Records"
                  className="form-input font-bold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-[#71717A] mb-1">
                  Official Editorial Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  placeholder="editorial@numberlive.in"
                  className="form-input font-mono font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#EAE3D5] dark:border-[#2E2E33]">
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
                    <span>Save All Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
