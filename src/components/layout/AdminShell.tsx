'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, setAuth, getToken, getUser, type AuthUser } from '@/lib/auth';
import { canAccessRoute } from '@/lib/permissions';
import { api } from '@/lib/api';
import { Sidebar } from './Sidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!isAuthenticated()) {
        router.replace('/login');
        return;
      }

      try {
        const res = await api.auth.me();
        if (!active) return;
        setAuth(getToken()!, res.data);
        setUser(res.data);
        setReady(true);
      } catch {
        if (active) router.replace('/login');
      }
    }

    bootstrap();
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (!ready || !user) return;
    if (pathname === '/unauthorized') return;
    if (!canAccessRoute(pathname, user.pageAccess, user.isSuperAdmin)) {
      router.replace('/unauthorized');
    }
  }, [pathname, ready, user, router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar user={user || getUser()} />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
