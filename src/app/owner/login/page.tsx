'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/owner';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/owner/me');
        if (res.ok) {
          router.replace(redirectUrl);
        }
      } catch {
        // Not authenticated
      }
    }
    checkAuth();
  }, [redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please check credentials.');
        setLoading(false);
        return;
      }

      // Successfully authenticated
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      setError('An unexpected network error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#111113] dark:bg-[#FAF8F5] text-[#C5A059] dark:text-[#111113] shadow-md mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">
            PRIVATE MANAGEMENT DESK
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111113] dark:text-[#FAF8F5] tracking-tight">
            Owner Authentication
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] max-w-xs mx-auto">
            Authorized owner access only. All login attempts are rate-limited and logged.
          </p>
        </div>

        {/* Security Badge */}
        <div className="bg-[#FAF8F5] dark:bg-[#141416] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] p-3 text-[11px] text-[#5C5449] dark:text-[#D4D4D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span>Server-side verified sessions</span>
          </div>
          <span className="text-[10px] font-bold text-[#059669] flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Protected
          </span>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#151518] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[12px] p-6 shadow-subtle space-y-5">
          {error && (
            <div className="p-3.5 rounded-[8px] bg-[#FEF2F2] dark:bg-[#2A1212] border border-[#FECACA] dark:border-[#521C1C] flex items-start gap-2.5 text-xs text-[#DC2626] dark:text-[#F87171] animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold">Access Denied</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="identifier"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Owner Email or Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. owner@numberlive.in or owner"
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2 rounded-[6px] text-xs font-medium bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059] dark:focus:border-[#C5A059] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#111113] dark:text-[#FAF8F5]"
              >
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full min-h-[44px] pl-10 pr-10 py-2 rounded-[6px] text-xs font-medium bg-[#FAF8F5] dark:bg-[#1F1F23] border border-[#EAE3D5] dark:border-[#2E2E33] focus:outline-none focus:border-[#C5A059] dark:focus:border-[#C5A059] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8275] hover:text-[#111113] dark:hover:text-white p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-[6px] text-xs font-black uppercase tracking-wider text-black bg-[#C5A059] hover:bg-[#B38F46] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In As Owner</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Development Quick Fill Hint */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="pt-3 border-t border-[#EAE3D5] dark:border-[#2E2E33] text-[11px] text-[#71717A] dark:text-[#A1A1AA] flex items-center justify-between">
              <span>Dev Credentials:</span>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('owner@numberlive.in');
                  setPassword('Owner@NumberLive2026!');
                }}
                className="text-[#C5A059] font-bold hover:underline"
              >
                Fill Default Owner
              </button>
            </div>
          )}
        </div>

        {/* Security Disclaimers */}
        <p className="text-[11px] text-center text-[#8C8275] dark:text-[#71717A] leading-relaxed">
          This portal is strictly for the authorized system owner. Public registration is permanently disabled.
        </p>
      </div>
    </div>
  );
}

export default function OwnerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-xs text-[#71717A]">
          Loading Owner Desk...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
