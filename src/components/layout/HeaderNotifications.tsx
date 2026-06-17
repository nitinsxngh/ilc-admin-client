'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { formatRelativeTime } from '@/lib/utils';
import type { NotificationItem } from '@/types';

const LAST_SEEN_KEY = 'ilc_notifications_last_seen';
const POLL_INTERVAL_MS = 60_000;

function getLastSeen(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_SEEN_KEY);
}

function setLastSeen(iso: string) {
  localStorage.setItem(LAST_SEEN_KEY, iso);
}

export function HeaderNotifications() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const user = getUser();
  const canViewActivityLogs = hasPermission(
    user?.pageAccess ?? [],
    'settings.activity',
    user?.isSuperAdmin ?? false
  );

  const load = useCallback(async () => {
    try {
      const since = getLastSeen();
      if (!since) {
        setUnreadCount(0);
        return;
      }

      const res = await api.notifications.list({ limit: '15', since });
      setUnreadCount(res.data.unreadCount);
    } catch {
      // Ignore notification fetch errors in the header
    }
  }, []);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      setLoading(true);
      try {
        const res = await api.notifications.list({ limit: '15' });
        setNotifications(res.data.notifications);
        setLastSeen(new Date().toISOString());
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    }
  };

  const showBadge = unreadCount > 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {showBadge && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {canViewActivityLogs && (
              <Link
                href="/settings/activity"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            )}
          </div>

          {loading ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet.</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto py-1">
              {notifications.map((item) => (
                <li
                  key={item._id}
                  className="border-b border-slate-50 px-4 py-3 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.actionLabel}</p>
                      <p className="mt-0.5 text-sm text-slate-600">{item.description}</p>
                      {item.actorName && (
                        <p className="mt-1 text-xs text-slate-400">{item.actorName}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
