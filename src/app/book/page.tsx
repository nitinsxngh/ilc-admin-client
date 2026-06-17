'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { CounsellorCard } from '@/components/booking/CounsellorCard';
import { CounsellorDetail } from '@/components/booking/CounsellorDetail';
import { IlcLogo } from '@/components/brand/IlcLogo';
import type { Counsellor } from '@/types';
import type { TimeSlotPublic } from '@/lib/api';

export default function BookSessionPage() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [detail, setDetail] = useState<{ counsellor: Counsellor; availability: Record<string, TimeSlotPublic[]> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.counsellors.publicList()
      .then((res) => {
        setCounsellors(res.data);
        if (res.data.length) setSelectedId(res.data[0]._id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    api.counsellors.publicDetail(selectedId)
      .then((res) => setDetail(res.data))
      .catch(console.error);
  }, [selectedId]);

  const refreshDetail = () => {
    if (selectedId) {
      api.counsellors.publicDetail(selectedId).then((res) => setDetail(res.data)).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 relative">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="absolute left-1/2 hidden -translate-x-1/2 sm:flex">
            <IlcLogo size={32} />
          </div>
          <div className="relative hidden flex-1 max-w-md mx-8 sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search for anything..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white sm:inline">
              Refer & Earn
            </span>
            <span className="text-xs text-slate-500">ILC-03-05-0981464288</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Book a session</h1>
          <p className="mt-2 text-slate-600">
            Choose a career counsellor, pick an available date and time, and get personalised guidance for your next steps.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Our Counsellors
              </p>
              <div className="space-y-3">
                {counsellors.map((c) => (
                  <CounsellorCard
                    key={c._id}
                    counsellor={c}
                    selected={selectedId === c._id}
                    onClick={() => setSelectedId(c._id)}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              {detail ? (
                <CounsellorDetail
                  counsellor={detail.counsellor}
                  availability={detail.availability}
                  onBooked={refreshDetail}
                />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                  <p className="text-slate-500">Select a counsellor to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
