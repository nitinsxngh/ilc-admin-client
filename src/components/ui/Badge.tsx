import { cn } from '@/lib/utils';

const variants: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  ready: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  failed: 'bg-red-50 text-red-700 ring-red-600/20',
  confirmed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  rescheduled: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  no_show: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  recommended: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  default: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}
