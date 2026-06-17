'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Pencil, Power, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { CounsellorAvatar } from '@/components/counsellors/CounsellorAvatar';
import type { Counsellor } from '@/types';

export default function CounsellorsPage() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.counsellors
      .list(search ? { search } : undefined)
      .then((res) => setCounsellors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const toggleStatus = async (id: string, current: string) => {
    const status = current === 'active' ? 'inactive' : 'active';
    await api.counsellors.updateStatus(id, status);
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete counsellor ${name}? This cannot be undone.`)) return;
    await api.counsellors.delete(id);
    load();
  };

  return (
    <>
      <Header title="Counsellors" description="Manage counsellor profiles, pricing, and status" />
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSearch} className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </form>
            <Link href="/counsellors/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add Counsellor
              </Button>
            </Link>
          </div>

          <CardBody className="p-0">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : counsellors.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No counsellors yet"
                description="Create your first counsellor to start managing availability and bookings."
                action={
                  <Link href="/counsellors/new">
                    <Button><Plus className="h-4 w-4" /> Add Counsellor</Button>
                  </Link>
                }
              />
            ) : (
              <Table>
                <THead>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Price</TH>
                  <TH>Experience</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </THead>
                <TBody>
                  {counsellors.map((c) => (
                    <TR key={c._id}>
                      <TD>
                        <div className="flex items-center gap-3">
                          <CounsellorAvatar
                            firstName={c.firstName}
                            lastName={c.lastName}
                            imageUrl={c.profileImageUrl}
                            className="h-9 w-9"
                            textClassName="text-sm"
                          />
                          <div>
                            <p className="font-medium text-slate-900">
                              {c.firstName} {c.lastName}
                              {c.isRecommended && (
                                <Badge variant="recommended" className="ml-2">Recommended</Badge>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{c.designation}</p>
                          </div>
                        </div>
                      </TD>
                      <TD>{c.email}</TD>
                      <TD>{formatCurrency(c.sessionFee)}</TD>
                      <TD>{c.experienceYears} yrs</TD>
                      <TD><Badge variant={c.status}>{c.status}</Badge></TD>
                      <TD>
                        <div className="flex justify-end gap-1">
                          <Link href={`/counsellors/${c._id}/edit`}>
                            <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => toggleStatus(c._id, c.status)}>
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(c._id, c.firstName)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
