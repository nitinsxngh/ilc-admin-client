'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import type { AdminRole } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  user: 'Users',
};

export default function RolesPage() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminRoles.list()
      .then((res) => setRoles(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const grouped = roles.reduce<Record<string, AdminRole[]>>((acc, role) => {
    if (!acc[role.category]) acc[role.category] = [];
    acc[role.category].push(role);
    return acc;
  }, {});

  return (
    <>
      <Header title="Roles" description="System roles for access management" />
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader
            title="Role Hierarchy"
            description="Collection: ilc_admin_roles — Super Admin, Admin, and User roles"
          />
          <CardBody>
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-6">
                {['super_admin', 'admin', 'user'].map((category) => (
                  <div key={category}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      {CATEGORY_LABELS[category]}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {(grouped[category] || []).map((role) => (
                        <div key={role._id} className="rounded-xl border border-slate-200 p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-900">{role.name}</p>
                            {role.isSystem && <Badge variant="active">System</Badge>}
                          </div>
                          <p className="mt-1 text-xs text-slate-400">{role.slug}</p>
                          {role.description && (
                            <p className="mt-2 text-sm text-slate-600">{role.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
