import { getToken, clearAuth } from './auth';
import type { AuthUser } from './auth';
import type {
  ApiResponse,
  Counsellor,
  Specialization,
  Availability,
  Booking,
  DashboardStats,
  Pagination,
  AdminUser,
  AdminRole,
  PagePermission,
  PsychometricListItem,
  PsychometricReportDetail,
  PsychometricStats,
  ActivityLog,
  ActivityActionOption,
  NotificationItem,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
const GET_CACHE_TTL_MS = 3000;
const getCache = new Map<string, { expires: number; value: ApiResponse<unknown> }>();

function getCacheKey(endpoint: string) {
  return `${getToken() || 'anon'}:${endpoint}`;
}

function readGetCache<T>(key: string): ApiResponse<T> | null {
  const entry = getCache.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    getCache.delete(key);
    return null;
  }
  return entry.value as ApiResponse<T>;
}

function writeGetCache(key: string, value: ApiResponse<unknown>) {
  getCache.set(key, { expires: Date.now() + GET_CACHE_TTL_MS, value });
}

export function clearApiGetCache() {
  getCache.clear();
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const cacheKey = getCacheKey(endpoint);

  if (isGet) {
    const cached = readGetCache<T>(cacheKey);
    if (cached) return cached;
  } else {
    clearApiGetCache();
  }

  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    clearAuth();
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  if (isGet) writeGetCache(cacheKey, data);
  return data;
}

async function uploadRequest<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
  clearApiGetCache();

  const token = getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers, body: formData });

  if (res.status === 401) {
    clearAuth();
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<AuthUser>('/auth/me'),
    logout: () => request<null>('/auth/logout', { method: 'POST' }),
  },

  adminUsers: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return request<AdminUser[]>(`/admin-users${qs}`);
    },
    get: (id: string) => request<AdminUser>(`/admin-users/${id}`),
    create: (data: Record<string, unknown>) =>
      request<{ user: AdminUser; generatedPassword?: string }>('/admin-users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Record<string, unknown>) =>
      request<AdminUser>(`/admin-users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      request<AdminUser>(`/admin-users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) =>
      request<null>(`/admin-users/${id}`, { method: 'DELETE' }),
  },

  adminRoles: {
    list: () => request<AdminRole[]>('/admin-roles'),
    permissions: () =>
      request<{ permissions: PagePermission[]; grouped: Record<string, PagePermission[]> }>(
        '/admin-roles/permissions'
      ),
    create: (data: { name: string; slug?: string; category?: string; description?: string }) =>
      request<AdminRole>('/admin-roles', { method: 'POST', body: JSON.stringify(data) }),
  },

  dashboard: {
    stats: () => request<DashboardStats>('/dashboard/stats'),
  },

  counsellors: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return request<Counsellor[]>(`/counsellors${qs}`);
    },
    get: (id: string) => request<Counsellor>(`/counsellors/${id}`),
    create: (data: Partial<Counsellor> & { password?: string }) =>
      request<{ counsellor: Counsellor; generatedPassword?: string }>('/counsellors', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Counsellor>) =>
      request<Counsellor>(`/counsellors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      request<Counsellor>(`/counsellors/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) =>
      request<null>(`/counsellors/${id}`, { method: 'DELETE' }),
    uploadProfileImage: (id: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return uploadRequest<Counsellor>(`/counsellors/${id}/profile-image`, formData);
    },
    publicList: () => request<Counsellor[]>('/counsellors/public'),
    publicDetail: (id: string) =>
      request<{ counsellor: Counsellor; availability: Record<string, TimeSlotPublic[]> }>(
        `/counsellors/public/${id}/booking`
      ),
  },

  specializations: {
    list: (all = false) => request<Specialization[]>(`/specializations${all ? '?all=true' : ''}`),
    create: (name: string) =>
      request<Specialization>('/specializations', { method: 'POST', body: JSON.stringify({ name }) }),
    softDelete: (id: string) =>
      request<Specialization>(`/specializations/${id}`, { method: 'DELETE' }),
    permanentDelete: (id: string) =>
      request<null>(`/specializations/${id}/permanent`, { method: 'DELETE' }),
  },

  availability: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return request<Availability[]>(`/availability${qs}`);
    },
    get: (id: string) => request<Availability>(`/availability/${id}`),
    create: (data: Record<string, unknown>) =>
      request<Availability>('/availability', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      request<Availability>(`/availability/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    createRecurring: (data: Record<string, unknown>) =>
      request<Availability[]>('/availability/recurring', { method: 'POST', body: JSON.stringify(data) }),
    block: (data: { counsellorId: string; dates: string[]; reason?: string }) =>
      request<Availability[]>('/availability/block', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<null>(`/availability/${id}`, { method: 'DELETE' }),
    slots: (counsellorId: string, date?: string) => {
      const qs = date ? `?date=${date}` : '';
      return request<Record<string, TimeSlotPublic[]>>(`/availability/slots/${counsellorId}${qs}`);
    },
  },

  bookings: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return request<Booking[]>(`/bookings${qs}`);
    },
    get: (id: string) => request<Booking>(`/bookings/${id}`),
    create: (data: Record<string, unknown>) =>
      request<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, data: { status: string; notes?: string; meetingLink?: string }) =>
      request<Booking>(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
    reschedule: (id: string, data: { availabilityId: string; slotId: string }) =>
      request<Booking>(`/bookings/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  psychometric: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return request<PsychometricListItem[]>(`/psychometric${qs}`);
    },
    get: (id: string) => request<PsychometricReportDetail>(`/psychometric/${id}`),
    stats: () => request<PsychometricStats>('/psychometric/stats'),
  },

  activityLogs: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return request<ActivityLog[]>(`/activity-logs${qs}`);
    },
    meta: () => request<{ actions: ActivityActionOption[] }>('/activity-logs/meta'),
  },

  notifications: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return request<{ notifications: NotificationItem[]; unreadCount: number }>(`/notifications${qs}`);
    },
  },
};

export interface TimeSlotPublic {
  slotId: string;
  availabilityId: string;
  startTime: string;
  endTime: string;
  displayTime?: string;
}

export type { Pagination };
