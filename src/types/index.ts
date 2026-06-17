export interface Specialization {
  _id: string;
  name: string;
  status: 'active' | 'inactive';
}

export interface Counsellor {
  _id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  profileImage: string;
  profileImageUrl?: string;
  designation: string;
  bio: string;
  experienceYears: number;
  sessionFee: number;
  sessionDuration: number;
  languages: string[];
  specializations: Specialization[];
  status: 'active' | 'inactive';
  isRecommended: boolean;
  createdAt: string;
}

export interface TimeSlot {
  slotId: string;
  availabilityId: string;
  startTime: string;
  endTime: string;
  displayTime?: string;
}

export interface Availability {
  _id: string;
  counsellorId: Counsellor | string;
  date: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  slots: { _id: string; startTime: string; endTime: string; isBooked: boolean }[];
  type: 'available' | 'blocked' | 'recurring';
  blockReason?: string;
  status: string;
}

export interface Booking {
  _id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  counsellorId: Counsellor | string;
  availabilityId?: string;
  slotId?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show';
  sessionFee: number;
  meetingLink: string;
  notes: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCounsellors: number;
  activeCounsellors: number;
  todaysSessions: number;
  upcomingSessions: number;
  completedSessions: number;
  revenue: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface AdminRole {
  _id: string;
  name: string;
  slug: string;
  category: 'super_admin' | 'admin' | 'user';
  description: string;
  level: number;
  isSystem: boolean;
  status: 'active' | 'inactive';
}

export interface PagePermission {
  slug: string;
  label: string;
  group: string;
  route: string;
}

export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: AdminRole | string;
  roleSlug: string;
  roleName: string;
  pageAccess: string[];
  status: 'active' | 'inactive';
  lastLoginAt?: string;
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  action: string;
  actionLabel: string;
  description: string;
  actorId?: string;
  actorEmail: string;
  actorName: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  createdAt: string;
}

export interface ActivityActionOption {
  value: string;
  label: string;
}

export interface NotificationItem {
  _id: string;
  action: string;
  actionLabel: string;
  description: string;
  actorName: string;
  actorEmail: string;
  createdAt: string;
}

export interface PsychometricListItem {
  _id: string;
  userId?: string;
  studentName: string;
  studentEmail: string;
  careerId: string;
  grade: '8-10' | '11-12';
  reportShareId: string;
  reportStatus: 'pending' | 'ready' | 'failed';
  profileType: string;
  score: { points: number; weightage: number };
  attention: { total: number; correct: number };
  answered: number;
  total: number;
  constructCount: number;
  completedAt: string;
  createdAt: string;
}

export interface PsychometricReportDetail {
  _id: string;
  userId: string;
  student: { _id: string; fullName: string; email: string; careerId: string; profileSegment: string } | null;
  grade: string;
  reportShareId: string;
  reportStatus: string;
  reportError: string;
  answered: number;
  total: number;
  score: { points: number; weightage: number };
  attention: { total: number; correct: number };
  constructScores: { construct: string; section?: string; points: number; weightage: number }[];
  reportGeneratedAt: string;
  createdAt: string;
  summary: {
    title: string;
    subtitle: string;
    profileType: string;
    dataQualityNote: string;
    topStrengths: { construct: string; insight: string; points: number; weightage: number }[];
    growthAreas: { construct: string; recommendation: string; points: number; weightage: number }[];
    streamDirections: { name: string; whyFit: string; starterActions: string[] }[];
    actionPlan30Days: string[];
    counsellorNotes: string[];
  };
  batteries: { tab: string; constructs: { name: string; pct: number; level: string }[] }[];
  recommendations: { id: string; title: string; match: string; fitScore: number; whyAcrossBatteries?: string }[];
  personalisedRecommendations: unknown[];
  workStyle: Record<string, unknown> | null;
  futureReadiness: { name: string; value: string; level: string }[];
  snapshot: Record<string, unknown> | null;
  pathwayReport: Record<string, unknown> | null;
  cover: Record<string, unknown> | null;
}

export interface PsychometricStats {
  total: number;
  ready: number;
  pending: number;
  failed: number;
  byGrade: { grade: string; count: number }[];
}
