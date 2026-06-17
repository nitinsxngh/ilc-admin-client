'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { PermissionGrid } from '@/components/access/PermissionGrid';
import { api } from '@/lib/api';
import type { AdminUser, AdminRole, PagePermission } from '@/types';

interface AdminUserFormProps {
  initial?: Partial<AdminUser>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

export function AdminUserForm({
  initial,
  onSubmit,
  loading,
  submitLabel = 'Save User',
}: AdminUserFormProps) {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [grouped, setGrouped] = useState<Record<string, PagePermission[]>>({});
  const [form, setForm] = useState({
    firstName: initial?.firstName || '',
    lastName: initial?.lastName || '',
    email: initial?.email || '',
    password: '',
    roleId: typeof initial?.roleId === 'object' ? initial.roleId._id : initial?.roleId || '',
    pageAccess: initial?.pageAccess || [],
    status: initial?.status || 'active',
  });

  const selectedRole = roles.find((r) => r._id === form.roleId);
  const isSuperAdminRole = selectedRole?.slug === 'super_admin';

  useEffect(() => {
    Promise.all([api.adminRoles.list(), api.adminRoles.permissions()])
      .then(([rolesRes, permsRes]) => {
        setRoles(rolesRes.data);
        setGrouped(permsRes.data.grouped);
        if (!form.roleId && rolesRes.data.length) {
          const defaultRole = rolesRes.data.find((r) => r.slug === 'admin') || rolesRes.data[0];
          setForm((p) => ({ ...p, roleId: defaultRole._id }));
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      ...(form.password ? { password: form.password } : {}),
      pageAccess: isSuperAdminRole ? undefined : form.pageAccess,
    });
  };

  const roleOptions = roles.map((r) => ({
    value: r._id,
    label: `${r.name}${r.category === 'user' ? ' (User)' : r.category === 'admin' ? ' (Admin)' : ''}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="First Name *"
          value={form.firstName}
          onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
          required
        />
        <Input
          label="Last Name"
          value={form.lastName}
          onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
        />
        <Input
          label="Email *"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          required
          disabled={!!initial?._id}
        />
        <Input
          label={initial?._id ? 'New Password (optional)' : 'Password (leave blank to auto-generate)'}
          type="text"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
        <Select
          label="Role *"
          value={form.roleId}
          onChange={(e) => setForm((p) => ({ ...p, roleId: e.target.value }))}
          options={[{ value: '', label: 'Select role...' }, ...roleOptions]}
        />
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as 'active' | 'inactive' }))}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold text-slate-900">Dashboard Page Access</h3>
        <p className="mb-4 text-sm text-slate-500">
          Select which pages this user can access. Changes take effect on next login.
        </p>
        {isSuperAdminRole ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Super Admin has full access to all pages automatically.
          </div>
        ) : Object.keys(grouped).length > 0 ? (
          <PermissionGrid
            grouped={grouped}
            selected={form.pageAccess}
            onChange={(pageAccess) => setForm((p) => ({ ...p, pageAccess }))}
          />
        ) : (
          <p className="text-sm text-slate-400">Loading permissions...</p>
        )}
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-6">
        <Button type="submit" loading={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
}
