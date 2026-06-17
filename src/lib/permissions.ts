export interface PagePermission {
  slug: string;
  label: string;
  group: string;
  route: string;
}

export const ROUTE_PERMISSION_MAP: Record<string, string | string[]> = {
  '/dashboard': 'dashboard',
  '/counsellors': 'counsellors.list',
  '/counsellors/new': 'counsellors.create',
  '/availability': 'availability',
  '/specializations': 'specializations',
  '/bookings': ['bookings.all', 'bookings.upcoming', 'bookings.completed', 'bookings.cancelled'],
  '/psychometric': 'psychometric.list',
  '/settings/users': 'settings.users',
  '/settings/users/new': 'settings.users',
  '/settings/roles': 'settings.roles',
  '/settings/activity': 'settings.activity',
};

export function getRoutePermission(pathname: string): string | string[] | null {
  if (ROUTE_PERMISSION_MAP[pathname]) return ROUTE_PERMISSION_MAP[pathname];
  if (pathname.startsWith('/counsellors/') && pathname.includes('/edit')) {
    return 'counsellors.edit';
  }
  if (pathname.startsWith('/settings/users/')) {
    return 'settings.users';
  }
  if (pathname.startsWith('/psychometric/')) {
    return 'psychometric.view';
  }
  return null;
}

export function canAccessRoute(pathname: string, pageAccess: string[], isSuperAdmin: boolean): boolean {
  if (isSuperAdmin) return true;
  const required = getRoutePermission(pathname);
  if (!required) return true;
  const slugs = Array.isArray(required) ? required : [required];
  return slugs.some((slug) => pageAccess.includes(slug));
}

export function hasPermission(pageAccess: string[], slug: string, isSuperAdmin: boolean): boolean {
  if (isSuperAdmin) return true;
  return pageAccess.includes(slug);
}

export const BOOKING_PERMISSIONS = [
  'bookings.all',
  'bookings.upcoming',
  'bookings.completed',
  'bookings.cancelled',
] as const;

export function canViewBookings(pageAccess: string[], isSuperAdmin: boolean): boolean {
  return BOOKING_PERMISSIONS.some((slug) => hasPermission(pageAccess, slug, isSuperAdmin));
}
