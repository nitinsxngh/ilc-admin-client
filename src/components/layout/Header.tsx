'use client';

import { HeaderSearch } from './HeaderSearch';
import { HeaderNotifications } from './HeaderNotifications';

export function Header({ title, description }: { title: string; description?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <HeaderSearch />
          <HeaderNotifications />
        </div>
      </div>
    </header>
  );
}
