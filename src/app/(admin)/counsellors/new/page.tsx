'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { CounsellorForm } from '@/components/counsellors/CounsellorForm';
import { api } from '@/lib/api';

export default function NewCounsellorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await api.counsellors.create(data as Parameters<typeof api.counsellors.create>[0]);
      return res.data;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create counsellor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleAfterSubmit = (result: unknown) => {
    const data = result as { generatedPassword?: string };
    if (data?.generatedPassword) {
      setGeneratedPassword(data.generatedPassword);
    } else {
      router.push('/counsellors');
    }
  };

  if (generatedPassword) {
    return (
      <>
        <Header title="Counsellor Created" />
        <div className="flex-1 overflow-y-auto p-6">
          <Card className="max-w-lg">
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900">Counsellor account created</h3>
              <p className="mt-2 text-sm text-slate-600">
                Share this auto-generated password with the counsellor (for future portal access):
              </p>
              <code className="mt-4 block rounded-lg bg-slate-100 px-4 py-3 font-mono text-sm">{generatedPassword}</code>
              <button
                onClick={() => router.push('/counsellors')}
                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Go to counsellor list →
              </button>
            </CardBody>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Add Counsellor" description="Create a new counsellor profile" />
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader title="Counsellor Details" description="All fields marked with * are required" />
          <CardBody>
            <CounsellorForm
              onSubmit={handleSubmit}
              onAfterSubmit={handleAfterSubmit}
              loading={loading}
              submitLabel="Create Counsellor"
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
