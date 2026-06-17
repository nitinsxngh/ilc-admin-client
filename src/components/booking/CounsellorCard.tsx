import { cn, formatCurrency } from '@/lib/utils';
import { CounsellorAvatar } from '@/components/counsellors/CounsellorAvatar';
import type { Counsellor } from '@/types';

export function CounsellorCard({
  counsellor,
  selected,
  onClick,
}: {
  counsellor: Counsellor;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border p-4 text-left transition-all',
        selected
          ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
          : 'border-slate-200 bg-white hover:border-slate-300'
      )}
    >
      <div className="flex gap-3">
        <CounsellorAvatar
          firstName={counsellor.firstName}
          lastName={counsellor.lastName}
          imageUrl={counsellor.profileImageUrl}
          className="h-12 w-12"
          textClassName="text-sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              {counsellor.firstName} {counsellor.lastName}
            </span>
            {counsellor.isRecommended && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                Recommended
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">{counsellor.designation}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {formatCurrency(counsellor.sessionFee)} · {counsellor.sessionDuration} min
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {counsellor.specializations?.slice(0, 2).map((s) => (
              <span key={s._id} className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
