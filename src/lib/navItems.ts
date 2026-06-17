import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Settings,
  Brain,
  type LucideIcon,
} from 'lucide-react';
import { hasPermission } from '@/lib/permissions';

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: string | string[];
  keywords?: string[];
};

export type NavGroup = {
  label: string;
  icon: LucideIcon;
  permission?: string | string[];
  children: {
    href: string;
    label: string;
    permission: string;
    keywords?: string[];
  }[];
};

export type NavItem = NavLink | NavGroup;

export type NavSearchItem = {
  href: string;
  label: string;
  group: string;
  keywords: string[];
  permission: string;
};

export const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard',
    keywords: ['home', 'overview', 'stats'],
  },
  {
    label: 'Counsellors',
    icon: Users,
    permission: ['counsellors.list', 'counsellors.create', 'availability', 'specializations'],
    children: [
      { href: '/counsellors', label: 'List', permission: 'counsellors.list', keywords: ['counsellor', 'team'] },
      { href: '/counsellors/new', label: 'Add Counsellor', permission: 'counsellors.create', keywords: ['create', 'new'] },
      { href: '/availability', label: 'Availability', permission: 'availability', keywords: ['schedule', 'slots', 'calendar'] },
      { href: '/specializations', label: 'Specializations', permission: 'specializations', keywords: ['tags', 'skills'] },
    ],
  },
  {
    label: 'Bookings',
    icon: CalendarCheck,
    permission: ['bookings.all', 'bookings.upcoming', 'bookings.completed', 'bookings.cancelled'],
    children: [
      { href: '/bookings', label: 'All Bookings', permission: 'bookings.all', keywords: ['sessions', 'appointments'] },
      { href: '/bookings?status=confirmed', label: 'Upcoming', permission: 'bookings.upcoming', keywords: ['confirmed', 'future'] },
      { href: '/bookings?status=completed', label: 'Completed', permission: 'bookings.completed' },
      { href: '/bookings?status=cancelled', label: 'Cancelled', permission: 'bookings.cancelled' },
    ],
  },
  {
    label: 'Psychometric',
    icon: Brain,
    permission: ['psychometric.list', 'psychometric.view'],
    children: [
      { href: '/psychometric', label: 'All Reports', permission: 'psychometric.list', keywords: ['tests', 'career', 'reports'] },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    permission: ['settings.users', 'settings.roles', 'settings.activity'],
    children: [
      { href: '/settings/users', label: 'User Access', permission: 'settings.users', keywords: ['admin', 'accounts'] },
      { href: '/settings/roles', label: 'Roles', permission: 'settings.roles', keywords: ['permissions', 'rbac'] },
      { href: '/settings/activity', label: 'Activity Logs', permission: 'settings.activity', keywords: ['audit', 'history', 'sign in', 'login'] },
    ],
  },
];

function canSee(permission: string | string[], pageAccess: string[], isSuperAdmin: boolean) {
  const slugs = Array.isArray(permission) ? permission : [permission];
  return slugs.some((slug) => hasPermission(pageAccess, slug, isSuperAdmin));
}

export function getSearchableNavItems(
  pageAccess: string[],
  isSuperAdmin: boolean
): NavSearchItem[] {
  const items: NavSearchItem[] = [];

  for (const entry of navItems) {
    if ('href' in entry) {
      if (!canSee(entry.permission, pageAccess, isSuperAdmin)) continue;
      items.push({
        href: entry.href,
        label: entry.label,
        group: 'Pages',
        keywords: [entry.label, ...(entry.keywords || [])],
        permission: Array.isArray(entry.permission) ? entry.permission[0] : entry.permission,
      });
      continue;
    }

    const group = entry as NavGroup;
    for (const child of group.children) {
      if (!canSee(child.permission, pageAccess, isSuperAdmin)) continue;
      items.push({
        href: child.href,
        label: child.label,
        group: group.label,
        keywords: [child.label, group.label, ...(child.keywords || [])],
        permission: child.permission,
      });
    }
  }

  return items;
}

export function filterNavSearchItems(items: NavSearchItem[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items.filter((item) => {
    const haystack = [item.label, item.group, item.href, ...item.keywords].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

export function getVisibleNavItems(pageAccess: string[], isSuperAdmin: boolean): NavItem[] {
  return navItems
    .map((item) => {
      if ('href' in item) {
        return canSee(item.permission, pageAccess, isSuperAdmin) ? item : null;
      }
      const group = item as NavGroup;
      const children = group.children.filter((c) => canSee(c.permission, pageAccess, isSuperAdmin));
      if (children.length === 0) return null;
      return { ...group, children };
    })
    .filter(Boolean) as NavItem[];
}
