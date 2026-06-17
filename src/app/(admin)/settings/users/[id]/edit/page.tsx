'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { AdminUserForm } from '@/components/access/AdminUserForm';
import { api } from '@/lib/api';
import type { AdminUser } from '@/types';

export default function EditAdminUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.adminUsers.get(id).then((res) => setUser(res.data)).catch(console.error);
  }, [id]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      await api.adminUsers.update(id, data);
      router.push('/settings/users');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Header title={`Edit ${user.firstName}`} description="Update role and dashboard page access" />
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader title="User Details & Permissions" />
          <CardBody>
            <AdminUserForm initial={user} onSubmit={handleSubmit} loading={loading} submitLabel="Save Changes" />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
