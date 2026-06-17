export function InfoRow({ label, value, alwaysShow = true }: { label: string; value?: React.ReactNode; alwaysShow?: boolean }) {
  if (!alwaysShow && (value === undefined || value === null || value === '')) return null;

  const display =
    value === undefined || value === null || value === '' ? (
      <span className="text-slate-400">—</span>
    ) : (
      value
    );

  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:gap-4">
      <dt className="w-44 shrink-0 text-sm font-medium text-slate-500">{label}</dt>
      <dd className="flex-1 text-sm text-slate-900">{display}</dd>
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>
  );
}

export function JsonBlock({ data, label }: { data: unknown; label?: string }) {
  if (!data || (typeof data === 'object' && Object.keys(data as object).length === 0)) {
    return <p className="py-3 text-sm text-slate-400">No data</p>;
  }

  return (
    <div className="py-2">
      {label && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>}
      <pre className="max-h-80 overflow-auto rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export function KeyValueGrid({ data, labels }: { data: Record<string, unknown>; labels?: Record<string, string> }) {
  const formatKey = (key: string) =>
    labels?.[key] || key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

  const formatValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined || value === '') return <span className="text-slate-400">—</span>;
    if (Array.isArray(value)) return value.length ? value.join(', ') : <span className="text-slate-400">—</span>;
    if (typeof value === 'object') return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  return (
    <dl>
      {Object.entries(data).map(([key, value]) => (
        <InfoRow key={key} label={formatKey(key)} value={formatValue(value)} />
      ))}
    </dl>
  );
}
