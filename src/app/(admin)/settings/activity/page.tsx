'use client';

import { useEffect, useState } from 'react';
import { Search, ScrollText } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import type { ActivityActionOption, ActivityLog, Pagination } from '@/types';

const PAGE_SIZE = 50;

function actionBadgeVariant(action: string) {
  if (action.startsWith('auth.')) return action.includes('failed') ? 'cancelled' : 'confirmed';
  if (action.includes('deleted') || action.includes('deactivated')) return 'cancelled';
  if (action.includes('created')) return 'active';
  if (action.includes('updated') || action.includes('changed') || action.includes('rescheduled')) return 'rescheduled';
  return 'default';
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [actions, setActions] = useState<ActivityActionOption[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.activityLogs.meta().then((res) => setActions(res.data.actions)).catch(console.error);
  }, []);

  const load = (nextPage = page) => {
    setLoading(true);
    const params: Record<string, string> = {
      page: String(nextPage),
      limit: String(PAGE_SIZE),
    };
    if (search.trim()) params.search = search.trim();
    if (actionFilter) params.action = actionFilter;

    api.activityLogs
      .list(params)
      .then((res) => {
        setLogs(res.data);
        setPagination(res.pagination || null);
        setPage(nextPage);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, [actionFilter]);

  return (
    <>
      <Header
        title="Activity Logs"
        description="Audit trail of sign-ins, admin actions, and platform changes"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardBody>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Search by user, email, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && load(1)}
                />
              </div>
              <Select
                className="sm:w-56"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                options={[
                  { value: '', label: 'All actions' },
                  ...actions.map((action) => ({ value: action.value, label: action.label })),
                ]}
              />
            </div>

            {loading ? (
              <p className="py-12 text-center text-sm text-slate-500">Loading activity...</p>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-slate-500">
                <ScrollText className="h-8 w-8 text-slate-300" />
                <p className="text-sm">No activity recorded yet.</p>
              </div>
            ) : (
              <>
                <Table>
                  <THead>
                    <TH>Time</TH>
                    <TH>User</TH>
                    <TH>Action</TH>
                    <TH>Description</TH>
                    <TH>IP</TH>
                  </THead>
                  <TBody>
                    {logs.map((log) => (
                      <TR key={log._id}>
                        <TD className="whitespace-nowrap text-slate-600">
                          {formatDateTime(log.createdAt)}
                        </TD>
                        <TD>
                          <div className="min-w-[10rem]">
                            <p className="font-medium text-slate-900">
                              {log.actorName || 'System'}
                            </p>
                            {log.actorEmail && (
                              <p className="text-xs text-slate-500">{log.actorEmail}</p>
                            )}
                          </div>
                        </TD>
                        <TD>
                          <Badge variant={actionBadgeVariant(log.action)}>
                            {log.actionLabel}
                          </Badge>
                        </TD>
                        <TD className="max-w-md text-slate-700">{log.description}</TD>
                        <TD className="whitespace-nowrap text-xs text-slate-500">
                          {log.ip || '—'}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>

                {pagination && (
                  <PaginationBar
                    page={pagination.page}
                    pages={pagination.pages}
                    total={pagination.total}
                    limit={pagination.limit}
                    onPageChange={load}
                  />
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
