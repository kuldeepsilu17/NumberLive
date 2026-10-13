'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Mail,
  CheckCircle,
  Clock,
  Trash2,
  RefreshCw,
  Eye,
  X,
  AlertTriangle,
  Megaphone,
} from 'lucide-react';
import ConfirmationModal from '@/components/owner/ConfirmationModal';

interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED';
  ipAddress: string | null;
  createdAt: string;
}

export default function OwnerNotificationsPage() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected message for details view
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notice banner state
  const [alertBanner, setAlertBanner] = useState('');
  const [savingBanner, setSavingBanner] = useState(false);
  const [bannerSuccess, setBannerSuccess] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      const res = await fetch(`/api/owner/notifications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setAlertBanner(data.settings?.alert_banner || '');
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchSettings();
  }, [fetchMessages, fetchSettings]);

  const handleUpdateStatus = async (id: string, newStatus: 'READ' | 'REPLIED' | 'UNREAD') => {
    try {
      const res = await fetch('/api/owner/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        await fetchMessages();
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage({ ...selectedMessage, status: newStatus });
        }
      }
    } catch (e) {
      console.error('Status update error:', e);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/owner/notifications?id=${messageToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        setMessageToDelete(null);
        if (selectedMessage?.id === messageToDelete.id) {
          setSelectedMessage(null);
        }
        await fetchMessages();
      }
    } catch (e) {
      console.error('Delete error:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            alert_banner: alertBanner,
          },
        }),
      });
      if (res.ok) {
        setBannerSuccess(true);
        setTimeout(() => setBannerSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Banner save error:', e);
    } finally {
      setSavingBanner(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">
            PUBLIC INQUIRIES & ALERTS
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
            Inquiries & System Alerts
          </h2>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            Review contact messages from public visitors and configure the live system alert banner. Unread inquiries: {unreadCount}
          </p>
        </div>

        <button
          onClick={fetchMessages}
          className="flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-[6px] text-xs font-bold bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] hover:text-[#C5A059] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C5A059]' : ''}`} />
          <span>Refresh Messages</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         1. LIVE SYSTEM ALERT BANNER CONFIGURATOR
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-subtle space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#C5A059]" />
            <h3 className="text-xs font-black uppercase text-[#111113] dark:text-[#FAF8F5]">
              Live Scoreboard Alert Banner
            </h3>
          </div>
          {bannerSuccess && (
            <span className="text-[11px] text-[#059669] font-bold">
              ✓ Alert banner updated
            </span>
          )}
        </div>

        <form onSubmit={handleSaveBanner} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={alertBanner}
            onChange={(e) => setAlertBanner(e.target.value)}
            placeholder="e.g. Live timetable sync active. Real-time record publishing verified for today."
            className="flex-1 min-h-[40px] px-3.5 py-2 rounded-[6px] text-xs bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059]"
          />
          <button
            type="submit"
            disabled={savingBanner}
            className="min-h-[40px] px-4 py-2 rounded-[6px] text-xs font-black uppercase tracking-wider text-black bg-[#C5A059] hover:bg-[#B38F46] transition-all shrink-0 disabled:opacity-50"
          >
            {savingBanner ? 'Updating...' : 'Update Banner'}
          </button>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         2. VISITOR CONTACT INQUIRIES
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] overflow-hidden shadow-subtle space-y-4 p-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-[#EAE3D5] dark:border-[#2E2E33] pb-3">
          {[
            { label: 'All Inquiries', value: 'ALL' },
            { label: `Unread (${unreadCount})`, value: 'UNREAD' },
            { label: 'Read', value: 'READ' },
            { label: 'Replied', value: 'REPLIED' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-[6px] text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? 'bg-[#111113] text-[#C5A059] border border-[#C5A059] shadow-xs'
                  : 'bg-[#FAF8F5] dark:bg-[#1C1C20] text-[#5C5449] dark:text-[#D4D4D8] border border-[#EAE3D5] dark:border-[#2E2E33]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Message List */}
        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] animate-pulse">
            Loading contact inquiries...
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Mail className="w-8 h-8 text-[#8C8275] mx-auto opacity-50" />
            <h4 className="text-sm font-bold text-[#111113] dark:text-[#FAF8F5]">
              No Contact Inquiries Found
            </h4>
            <p className="text-xs text-[#71717A]">
              Inquiries sent from the public Contact page will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE3D5] dark:divide-[#2E2E33]">
            {messages.map((m) => {
              const isUnread = m.status === 'UNREAD';

              return (
                <div
                  key={m.id}
                  className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isUnread
                      ? 'bg-[#FFFBEB]/40 dark:bg-[#78350F]/10'
                      : 'hover:bg-[#FAF8F5]/60'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#111113] dark:text-[#FAF8F5]">
                        {m.name}
                      </span>
                      <span className="text-[11px] text-[#8C8275] font-mono">
                        &lt;{m.email}&gt;
                      </span>
                      {isUnread && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                          New
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-[#5C5449] dark:text-[#D4D4D8] truncate">
                      {m.subject || 'Public Inquiry'} — {m.message}
                    </div>
                    <div className="text-[10px] text-[#8C8275] flex items-center gap-2">
                      <span>{new Date(m.createdAt).toLocaleString()}</span>
                      {m.ipAddress && <span>• IP: {m.ipAddress}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setSelectedMessage(m);
                        if (m.status === 'UNREAD') {
                          handleUpdateStatus(m.id, 'READ');
                        }
                      }}
                      className="px-3 py-1.5 rounded bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] text-xs font-bold hover:border-[#C5A059] flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => {
                        setMessageToDelete(m);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Message Inspection Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[10px] p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#EAE3D5] dark:border-[#2E2E33]">
              <div>
                <h3 className="text-sm font-black text-[#111113] dark:text-[#FAF8F5]">
                  {selectedMessage.subject || 'Inquiry Details'}
                </h3>
                <div className="text-xs text-[#71717A] mt-0.5">
                  From: <strong>{selectedMessage.name}</strong> ({selectedMessage.email})
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-[#71717A] hover:text-[#111113] dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-[8px] bg-[#FAF8F5] dark:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] text-[#111113] dark:text-[#FAF8F5] leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8C8275]">
                <span>Received: {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                <span>Sender IP: {selectedMessage.ipAddress || 'Unknown'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#EAE3D5] dark:border-[#2E2E33]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedMessage.id, 'UNREAD')}
                  className="px-2.5 py-1 rounded text-xs font-bold text-[#D97706] hover:bg-[#FFFBEB]"
                >
                  Mark as Unread
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedMessage.id, 'REPLIED')}
                  className="px-2.5 py-1 rounded text-xs font-bold text-[#059669] hover:bg-[#ECFDF5]"
                >
                  Mark as Replied
                </button>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-1.5 rounded bg-[#111113] dark:bg-[#FAF8F5] text-white dark:text-black text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Contact Inquiry"
        message={`Are you sure you want to delete the message from ${messageToDelete?.email}?`}
        confirmLabel="Delete Message"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteMessage}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMessageToDelete(null);
        }}
      />
    </div>
  );
}
