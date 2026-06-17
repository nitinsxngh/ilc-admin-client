'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Brain, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardBody } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Pagination, PsychometricListItem, PsychometricStats } from '@/types';

const PAGE_SIZE = 25;

export default function PsychometricPage() {
  const [reports, setReports] = useState<PsychometricListItem[]>([]);
  const [stats, setStats] = useState<PsychometricStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (nextPage = page) => {
    setLoading(true);
    const params: Record<string, string> = {
      page: String(nextPage),
      limit: String(PAGE_SIZE),
    };
    if (search) params.search = search;
    if (gradeFilter) params.grade = gradeFilter;
    if (statusFilter) params.reportStatus = statusFilter;

    Promise.all([api.psychometric.list(params), api.psychometric.stats()])
      .then(([listRes, statsRes]) => {
        setReports(listRes.data);
        setPagination(listRes.pagination || null);
        setStats(statsRes.data);
        setPage(nextPage);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  return (
    <>
      <Header
        title="Psychometric Reports"
        description="Career discovery test submissions and generated reports"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Reports" value={stats?.total ?? '—'} icon={Brain} />
          <StatCard title="Ready" value={stats?.ready ?? '—'} icon={CheckCircle} />
          <StatCard title="Pending" value={stats?.pending ?? '—'} icon={Clock} />
          <StatCard title="Failed" value={stats?.failed ?? '—'} icon={XCircle} />
        </div>

        <Card>
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-4 lg:flex-row lg:items-center">
            <form
              onSubmit={(e) => { e.preventDefault(); load(1); }}
              className="relative flex-1"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student, email, career ID, profile type..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </form>
            <div className="flex gap-2">
              <Select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                options={[
                  { value: '', label: 'All grades' },
                  { value: '8-10', label: 'Grade 8–10' },
                  { value: '11-12', label: 'Grade 11–12' },
                ]}
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All statuses' },
                  { value: 'ready', label: 'Ready' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'failed', label: 'Failed' },
                ]}
              />
              <Button type="button" variant="outline" onClick={() => load(1)}>Filter</Button>
            </div>
          </div>

          <CardBody className="p-0">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : reports.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-slate-500">No reports found.</p>
            ) : (
              <Table>
                <THead>
                  <TH>Student</TH>
                  <TH>Grade</TH>
                  <TH>Profile Type</TH>
                  <TH>Score</TH>
                  <TH>Progress</TH>
                  <TH>Status</TH>
                  <TH>Completed</TH>
                  <TH className="text-right">Actions</TH>
                </THead>
                <TBody>
                  {reports.map((r) => (
                    <TR key={r._id}>
                      <TD>
                        <p className="font-medium text-slate-900">{r.studentName || '—'}</p>
                        {r.studentEmail ? (
                          <p className="text-xs text-slate-500">{r.studentEmail}</p>
                        ) : null}
                        {r.careerId && <p className="font-mono text-xs text-slate-400">{r.careerId}</p>}
                      </TD>
                      <TD><Badge variant="default">Grade {r.grade}</Badge></TD>
                      <TD className="max-w-[200px]">
                        <span className="block truncate" title={r.profileType}>{r.profileType || '—'}</span>
                      </TD>
                      <TD>{r.score ? `${r.score.points}/${r.score.weightage}` : '—'}</TD>
                      <TD>{r.answered != null ? `${r.answered}/${r.total}` : '—'}</TD>
                      <TD>
                        {r.reportStatus ? (
                          <Badge variant={r.reportStatus}>{r.reportStatus}</Badge>
                        ) : (
                          <Badge variant="pending">—</Badge>
                        )}
                      </TD>
                      <TD>{r.completedAt ? formatDate(r.completedAt) : '—'}</TD>
                      <TD className="text-right">
                        <Link href={`/psychometric/${r._id}`}>
                          <Button variant="outline" size="sm"><Eye className="h-4 w-4" /> View</Button>
                        </Link>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
            {pagination && (
              <PaginationBar
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={load}
              />
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
