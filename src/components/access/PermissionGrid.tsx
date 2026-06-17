'use client';

import { cn } from '@/lib/utils';
import type { PagePermission } from '@/types';

interface PermissionGridProps {
  grouped: Record<string, PagePermission[]>;
  selected: string[];
  onChange: (slugs: string[]) => void;
  disabled?: boolean;
}

export function PermissionGrid({ grouped, selected, onChange, disabled }: PermissionGridProps) {
  const toggle = (slug: string) => {
    if (disabled) return;
    onChange(
      selected.includes(slug)
        ? selected.filter((s) => s !== slug)
        : [...selected, slug]
    );
  };

  const toggleGroup = (group: string, checked: boolean) => {
    if (disabled) return;
    const slugs = grouped[group].map((p) => p.slug);
    if (checked) {
      onChange([...new Set([...selected, ...slugs])]);
    } else {
      onChange(selected.filter((s) => !slugs.includes(s)));
    }
  };

  const isGroupChecked = (group: string) =>
    grouped[group].every((p) => selected.includes(p.slug));

  const isGroupIndeterminate = (group: string) => {
    const slugs = grouped[group].map((p) => p.slug);
    const count = slugs.filter((s) => selected.includes(s)).length;
    return count > 0 && count < slugs.length;
  };

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([group, permissions]) => (
        <div key={group} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <label className="mb-3 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isGroupChecked(group)}
              ref={(el) => {
                if (el) el.indeterminate = isGroupIndeterminate(group);
              }}
              onChange={(e) => toggleGroup(group, e.target.checked)}
              disabled={disabled}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-slate-900">{group}</span>
            <span className="text-xs text-slate-400">
              ({permissions.filter((p) => selected.includes(p.slug)).length}/{permissions.length})
            </span>
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {permissions.map((perm) => (
              <label
                key={perm.slug}
                className={cn(
                  'flex cursor-pointer items-start gap-2.5 rounded-lg border bg-white px-3 py-2.5 transition-colors',
                  selected.includes(perm.slug)
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300',
                  disabled && 'cursor-not-allowed opacity-60'
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(perm.slug)}
                  onChange={() => toggle(perm.slug)}
                  disabled={disabled}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">{perm.label}</p>
                  <p className="text-xs text-slate-400">{perm.route}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
