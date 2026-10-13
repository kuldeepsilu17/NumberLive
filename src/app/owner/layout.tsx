'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import OwnerSidebar from '@/components/owner/OwnerSidebar';
import OwnerHeader from '@/components/owner/OwnerHeader';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [user, setUser] = useState<{
    username: string;
    name: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/owner/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function checkOwnerSession() {
      try {
        const res = await fetch('/api/owner/me');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && data.user) {
            setUser(data.user);
          }
        } else if (res.status === 401) {
          if (isMounted) {
            router.push(`/owner/login?redirect=${encodeURIComponent(pathname)}`);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkOwnerSession();
    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <OwnerSidebar
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />
        <div className="flex-1 min-w-0">
          <OwnerHeader
            user={user}
            onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
          />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
