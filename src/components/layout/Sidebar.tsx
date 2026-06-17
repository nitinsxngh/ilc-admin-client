'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  LogOut,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IlcLogo } from '@/components/brand/IlcLogo';
import { clearAuth, type AuthUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { getVisibleNavItems, type NavGroup } from '@/lib/navItems';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Sidebar({ user }: { user: AuthUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const pageAccess = user?.pageAccess ?? [];
  const isSuperAdmin = user?.isSuperAdmin ?? false;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Counsellors: true,
    Bookings: true,
    Psychometric: true,
    Settings: true,
  });

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Still clear local session if logout request fails
    }
    clearAuth();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href.includes('?')) return pathname === href.split('?')[0];
    return pathname === href || pathname.startsWith(href + '/');
  };

  const visibleItems = getVisibleNavItems(pageAccess, isSuperAdmin);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-300">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
        <IlcLogo size={36} className="rounded-lg" />
        <div>
          <p className="text-sm font-semibold text-white">ILC Admin</p>
          <p className="text-xs text-slate-400">Management System</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          if ('href' in item && item.href) {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          }

          const group = item as NavGroup;
          const Icon = group.icon;
          const isOpen = expanded[group.label];

          return (
            <div key={group.label} className="mb-2">
              <button
                onClick={() => setExpanded((p) => ({ ...p, [group.label]: !p[group.label] }))}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {group.label}
                </span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
              </button>
              {isOpen && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-700 pl-3">
                  {group.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'block rounded-lg px-3 py-2 text-sm transition-colors',
                        pathname === child.href.split('?')[0]
                          ? 'bg-blue-600/20 font-medium text-blue-400'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-4 border-t border-slate-800 pt-4">
          <Link
            href="/book"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            Student Booking Preview
          </Link>
        </div>
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-3 rounded-lg bg-slate-800/50 px-3 py-2">
          <p className="truncate text-sm font-medium text-white">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
          {user?.roleName && (
            <p className="mt-1 flex items-center gap-1 text-xs text-blue-400">
              <Shield className="h-3 w-3" />
              {user.roleName}
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
