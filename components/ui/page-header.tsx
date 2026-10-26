import * as React from 'react';

/**
 * Page header: 23/600 title + one muted sub-line, actions on the right.
 * Put secondary actions first and exactly one primary last.
 */
export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-xl text-text sm:text-2xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-text-3">{sub}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Segmented control for small saved filters: "Semua 128 · Perlu tindakan 14". */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-sm bg-surface-3 p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={
              'inline-flex h-[24px] items-center gap-1.5 rounded-xs px-2.5 text-sm font-medium transition-colors ' +
              (active ? 'bg-surface text-text shadow-sm' : 'text-text-2 hover:text-text')
            }
          >
            {o.label}
            {o.count !== undefined && <span className="num text-text-3">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
