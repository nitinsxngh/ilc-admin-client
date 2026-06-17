'use client';

import { getUser } from '@/lib/auth';
import {
  hasPermission as checkPermission,
  canAccessRoute,
  canViewBookings as checkBookings,
} from '@/lib/permissions';

export function usePermissions() {
  const user = getUser();
  const pageAccess = user?.pageAccess ?? [];
  const isSuperAdmin = user?.isSuperAdmin ?? false;

  return {
    user,
    pageAccess,
    isSuperAdmin,
    can: (slug: string) => checkPermission(pageAccess, slug, isSuperAdmin),
    canViewBookings: () => checkBookings(pageAccess, isSuperAdmin),
    canAccessRoute: (pathname: string) => canAccessRoute(pathname, pageAccess, isSuperAdmin),
  };
}
