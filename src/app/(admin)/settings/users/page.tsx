'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Power, Shield } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { api } from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import type { AdminUser } from '@/types';

export default function AdminUsersPage() {
  const { isSuperAdmin } = usePermissions();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.adminUsers.list()
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (id: string, current: string) => {
    await api.adminUsers.updateStatus(id, current === 'active' ? 'inactive' : 'active');
    load();
  };

  return (
    <>
      <Header
        title="User Access Management"
        description="Create users and control dashboard page access with granular permissions"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Shield className="h-4 w-4" />
              Collections: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">ilc_admin_users</code>
            </div>
            {isSuperAdmin && (
              <Link href="/settings/users/new">
                <Button><Plus className="h-4 w-4" /> Add User</Button>
              </Link>
            )}
          </div>
          <CardBody className="p-0">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : (
              <Table>
                <THead>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Role</TH>
                  <TH>Pages</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </THead>
                <TBody>
                  {users.map((u) => (
                    <TR key={u._id}>
                      <TD className="font-medium text-slate-900">
                        {u.firstName} {u.lastName}
                      </TD>
                      <TD>{u.email}</TD>
                      <TD>
                        <Badge variant={u.roleSlug === 'super_admin' ? 'recommended' : 'default'}>
                          {u.roleName}
                        </Badge>
                      </TD>
                      <TD className="text-slate-500">
                        {u.roleSlug === 'super_admin' ? 'All pages' : `${u.pageAccess?.length || 0} pages`}
                      </TD>
                      <TD><Badge variant={u.status}>{u.status}</Badge></TD>
                      <TD>
                        <div className="flex justify-end gap-1">
                          {isSuperAdmin && (
                            <>
                              <Link href={`/settings/users/${u._id}/edit`}>
                                <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
                              </Link>
                              {u.roleSlug !== 'super_admin' && (
                                <Button variant="ghost" size="sm" onClick={() => toggleStatus(u._id, u.status)}>
                                  <Power className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
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
