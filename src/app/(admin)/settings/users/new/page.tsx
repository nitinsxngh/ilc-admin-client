'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { AdminUserForm } from '@/components/access/AdminUserForm';
import { api } from '@/lib/api';

export default function NewAdminUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await api.adminUsers.create(data);
      if (res.data.generatedPassword) {
        setGeneratedPassword(res.data.generatedPassword);
      } else {
        router.push('/settings/users');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (generatedPassword) {
    return (
      <>
        <Header title="User Created" />
        <div className="flex-1 overflow-y-auto p-6">
          <Card className="max-w-lg">
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900">User account created</h3>
              <p className="mt-2 text-sm text-slate-600">Share this auto-generated password:</p>
              <code className="mt-4 block rounded-lg bg-slate-100 px-4 py-3 font-mono text-sm">{generatedPassword}</code>
              <button onClick={() => router.push('/settings/users')} className="mt-4 text-sm font-medium text-blue-600">
                Go to user list →
              </button>
            </CardBody>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Add User" description="Create a new admin user and assign page access" />
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader title="User Details & Permissions" description="Assign role and check pages this user can access" />
          <CardBody>
            <AdminUserForm onSubmit={handleSubmit} loading={loading} submitLabel="Create User" />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
