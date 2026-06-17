'use client';

import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <>
      <Header title="Access Denied" />
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="rounded-full bg-red-50 p-4">
          <ShieldX className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">You don&apos;t have access to this page</h2>
        <p className="mt-2 max-w-md text-center text-sm text-slate-500">
          Contact your Super Admin to request access to this section of the dashboard.
        </p>
        <Link href="/dashboard" className="mt-6">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </>
  );
}
