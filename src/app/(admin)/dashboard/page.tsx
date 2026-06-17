'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, Calendar, CalendarClock, CheckCircle, IndianRupee } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { canViewBookings } from '@/lib/permissions';
import type { DashboardStats, Booking } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';

export default function DashboardPage() {
  const { pageAccess, isSuperAdmin } = usePermissions();
  const showBookings = canViewBookings(pageAccess, isSuperAdmin);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const statsRes = await api.dashboard.stats();
        setStats(statsRes.data);

        if (showBookings) {
          try {
            const bookingsRes = await api.bookings.list({ limit: '5' });
            setRecentBookings(bookingsRes.data);
          } catch {
            setRecentBookings([]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showBookings]);

  return (
    <>
      <Header
        title="Dashboard"
        description="Overview of platform activity across counsellors, bookings, and operations"
      />
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatCard title="Total Counsellors" value={stats?.totalCounsellors ?? 0} icon={Users} />
              <StatCard title="Active Counsellors" value={stats?.activeCounsellors ?? 0} icon={UserCheck} />
              <StatCard title="Today's Sessions" value={stats?.todaysSessions ?? 0} icon={Calendar} />
              <StatCard title="Upcoming Sessions" value={stats?.upcomingSessions ?? 0} icon={CalendarClock} />
              <StatCard title="Completed Sessions" value={stats?.completedSessions ?? 0} icon={CheckCircle} />
              <StatCard title="Revenue" value={formatCurrency(stats?.revenue ?? 0)} icon={IndianRupee} />
            </div>

            {showBookings && (
              <Card className="mt-6">
                <CardHeader title="Recent Bookings" description="Latest session bookings across all counsellors" />
                <CardBody className="p-0">
                  {recentBookings.length === 0 ? (
                    <p className="px-6 py-8 text-center text-sm text-slate-500">No bookings yet</p>
                  ) : (
                    <Table>
                      <THead>
                        <TH>Student</TH>
                        <TH>Counsellor</TH>
                        <TH>Date</TH>
                        <TH>Time</TH>
                        <TH>Fee</TH>
                        <TH>Status</TH>
                      </THead>
                      <TBody>
                        {recentBookings.map((b) => (
                          <TR key={b._id}>
                            <TD className="font-medium text-slate-900">{b.studentName}</TD>
                            <TD>
                              {typeof b.counsellorId === 'object'
                                ? `${b.counsellorId.firstName} ${b.counsellorId.lastName}`
                                : '—'}
                            </TD>
                            <TD>{formatDate(b.bookingDate)}</TD>
                            <TD>{formatTime(b.startTime)}</TD>
                            <TD>{formatCurrency(b.sessionFee)}</TD>
                            <TD>
                              <Badge variant={b.status}>{b.status.replace('_', ' ')}</Badge>
                            </TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
