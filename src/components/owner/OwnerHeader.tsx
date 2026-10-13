'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ExternalLink,
  LogOut,
  Shield,
  Menu,
  Clock,
  Sparkles,
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface OwnerHeaderProps {
  onToggleMobileNav?: () => void;
  user?: {
    username: string;
    name: string;
    role: string;
  } | null;
}

export default function OwnerHeader({ onToggleMobileNav, user }: OwnerHeaderProps) {
  const router = useRouter();
  const [timeStr, setTimeStr] = useState<string>('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/owner/logout', { method: 'POST' });
      router.push('/owner/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-[#111113] border border-[#EAE3D5] dark:border-[#2E2E33] rounded-[9px] px-4 py-3 shadow-subtle flex items-center justify-between gap-3 mb-4 sm:mb-6">
        {/* Left Side: Mobile Menu Button + Title / Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileNav}
            className="lg:hidden p-2 rounded-[6px] text-[#5C5449] dark:text-[#D4D4D8] hover:bg-[#FAF8F5] dark:hover:bg-[#1C1C20] border border-[#EAE3D5] dark:border-[#2E2E33] transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[7px] bg-[#111113] dark:bg-[#C5A059] flex items-center justify-center text-[#C5A059] dark:text-[#111113] shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-[#111113] dark:text-[#FAF8F5] tracking-tight uppercase">
                  Owner Management System
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] dark:bg-[#064E3B]/30 dark:border-[#059669]">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Authorized</span>
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-1.5">
                <span>Signed in as:</span>
                <span className="font-bold text-[#111113] dark:text-[#FAF8F5]">
                  {user?.name || user?.username || 'System Owner'}
                </span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-[#FAF8F5] dark:bg-[#202024] border border-[#EAE3D5] dark:border-[#333338] text-[#C5A059]">
                  {user?.role || 'OWNER'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: IST Clock, View Public Site, Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          {timeStr && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] text-xs font-bold text-[#5C5449] dark:text-[#D4D4D8] tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{timeStr}</span>
            </div>
          )}

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-[6px] text-xs font-bold text-[#5C5449] dark:text-[#D4D4D8] bg-[#FAF8F5] dark:bg-[#18181B] border border-[#EAE3D5] dark:border-[#2E2E33] hover:text-[#C5A059] hover:border-[#C5A059] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Public Site</span>
          </Link>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-[6px] text-xs font-bold text-[#DC2626] bg-[#FEF2F2] dark:bg-[#2A1515] border border-[#FECACA] dark:border-[#4B1A1A] hover:bg-[#FEE2E2] transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Sign Out of Owner Management"
        message="Are you sure you want to end your owner session? You will need to enter your credentials again to manage website data."
        confirmLabel="Sign Out Now"
        cancelLabel="Stay Signed In"
        isDestructive={true}
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
