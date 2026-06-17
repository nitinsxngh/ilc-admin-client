const TOKEN_KEY = 'ilc_admin_token';
const USER_KEY = 'ilc_admin_user';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleSlug: string;
  roleName: string;
  pageAccess: string[];
  isSuperAdmin: boolean;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('ilc_notifications_last_seen');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function updateStoredUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
