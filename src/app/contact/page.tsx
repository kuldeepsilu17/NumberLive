'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Info, Mail, AlertCircle, RefreshCw } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Correction Request',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit message.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting your message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-5 rounded-[9px] shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] flex items-center justify-center text-[#C5A059] shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase text-[#111113] dark:text-[#FAF8F5] tracking-tight">
              CONTACT &amp; EDITORIAL DESK
            </h1>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Submit corrections, report discrepancies in records, or send general inquiries.
            </p>
          </div>
        </div>
      </div>

      {/* Notice box */}
      <div className="bg-[#FAF8F5] dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] border-l-4 border-l-[#C5A059] rounded-[9px] p-4 text-xs sm:text-sm text-[#5C5449] dark:text-[#D4D4D8] flex items-start gap-3 shadow-subtle">
        <Info className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          NumberLive is an informational database. We strictly do <strong>not</strong> respond to inquiries regarding betting, gambling tips, predictions, or monetary transactions.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-[#111113] rounded-[9px] border border-[#EAE3D5] dark:border-[#2E2E33] p-4 sm:p-6 shadow-subtle">
        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-[#F0FDF4] dark:bg-[#052E16] text-[#16A34A] border border-[#BBF7D0] dark:border-[#166534] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#111113] dark:text-[#FAF8F5] uppercase">
              Inquiry Received Successfully
            </h2>
            <p className="text-xs text-[#71717A] max-w-md mx-auto leading-relaxed">
              Your inquiry has been stored in our editorial database. Our staff will review official public announcement logs.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', subject: 'Correction Request', message: '' });
              }}
              className="btn-secondary min-h-[48px] px-6 text-xs sm:text-sm font-bold"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-[6px] bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-2">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-2">
                Your Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-2">
                Subject Category *
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="form-select text-xs sm:text-sm font-bold"
              >
                <option value="Correction Request">Historical Result Correction Request</option>
                <option value="General Feedback">General Portal Feedback</option>
                <option value="Timetable Inquiry">Timetable Schedule Verification</option>
                <option value="Compliance Question">Compliance / Legal Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-2">
                Message Details *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Specify game name, date, published result vs official announcement evidence..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="form-textarea text-xs sm:text-sm font-medium"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full text-xs sm:text-sm font-bold uppercase tracking-wider"
              id="contact-submit-btn"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Inquiry...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4 text-[#C5A059]" />
                  <span>Submit Message to Editorial Desk</span>
                </div>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
