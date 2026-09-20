'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [identifier, setIdentifier] = useState('admin@numberlive.in');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials. Access denied.');
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError('An error occurred during authentication.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-5 sm:p-7 shadow-card space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-[8px] bg-[#111113] dark:bg-[#18181B] text-[#C5A059] border border-[#C5A059]/40 flex items-center justify-center mx-auto font-black shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-lg sm:text-xl font-black text-[#111113] dark:text-[#FAF8F5] uppercase tracking-tight">
            Editorial Admin Desk
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Authorized portal editors and publishers login
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 bg-[#FEF2F2] dark:bg-[#18181B] border border-[#FECACA] dark:border-[#DC2626]/40 text-xs sm:text-sm text-[#DC2626] font-bold rounded-[8px] flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
              Email or Username
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="form-input text-xs sm:text-sm font-semibold"
              placeholder="admin@numberlive.in"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111113] dark:text-[#FAF8F5] uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input text-xs sm:text-sm font-semibold pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="w-11 h-11 absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#71717A] hover:text-[#111113] dark:hover:text-[#FAF8F5]"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs sm:text-sm font-bold uppercase tracking-wider"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Desk</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Credentials Pill */}
        <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#18181B] rounded-[8px] border border-[#EAE3D5] dark:border-[#2E2E33] text-xs text-[#71717A] space-y-1">
          <span className="font-bold text-[#111113] dark:text-[#FAF8F5] block">
            Pre-configured Admin Credentials:
          </span>
          <div className="flex flex-col sm:flex-row sm:justify-between font-mono text-[11px] gap-1">
            <span>admin@numberlive.in</span>
            <span className="font-bold text-[#111113] dark:text-[#FAF8F5]">Admin@123456</span>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="min-h-[44px] inline-flex items-center text-xs font-bold text-[#71717A] hover:text-[#C5A059] transition-colors"
          >
            ← Return to Public Scoreboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-[#71717A] text-xs sm:text-sm">Loading admin portal...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
