'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IlcLogo } from '@/components/brand/IlcLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      setAuth(res.data.token, res.data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <IlcLogo size={40} priority />
          <span className="text-lg font-semibold text-white">Management System</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            One portal for<br />all ILC operations
          </h1>
          <p className="mt-4 max-w-md text-slate-400">
            Centralized management for counsellors, schedules, bookings, psychometric reports, user access, and more — with role-based control over every module.
          </p>
        </div>
        <p className="text-sm text-slate-500">ILC Admin · Management System</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <IlcLogo size={40} priority />
              <span className="text-lg font-semibold text-slate-900">Management System</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Sign in to ILC Admin</h2>
          <p className="mt-1 text-sm text-slate-500">Access the centralized management dashboard</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
