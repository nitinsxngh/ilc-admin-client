'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { CounsellorForm } from '@/components/counsellors/CounsellorForm';
import { api } from '@/lib/api';
import type { Counsellor } from '@/types';

export default function EditCounsellorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [counsellor, setCounsellor] = useState<Counsellor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.counsellors.get(id).then((res) => setCounsellor(res.data)).catch(console.error);
  }, [id]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      await api.counsellors.update(id, data as Partial<Counsellor>);
      router.push('/counsellors');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (!counsellor) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Header title={`Edit ${counsellor.firstName}`} description="Update counsellor profile and settings" />
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader title="Counsellor Details" />
          <CardBody>
            <CounsellorForm initial={counsellor} onSubmit={handleSubmit} loading={loading} submitLabel="Save Changes" />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
