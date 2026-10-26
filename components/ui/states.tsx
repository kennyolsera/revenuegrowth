import * as React from 'react';
import { cn } from '@/lib/cn';

/** Empty state: muted glyph, one heading, one sentence on how to fill it, one action. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="text-text-4" aria-hidden>
        {icon}
      </div>
      <h3 className="mt-3 text-md font-semibold text-text">{title}</h3>
      <p className="mt-1 max-w-[340px] text-sm text-text-3">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Warm skeleton block. Use instead of a centred spinner for page content. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton h-3', className)} />;
}

/** Skeleton rows matching table row height. */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div role="status" aria-label="Memuat data">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex h-row items-center gap-6 border-b border-divider px-4 last:border-b-0">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className={c === 0 ? 'w-40' : 'w-20'} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Full-page state (404, offline, no access). */
export function FullPageState({ code, title, description, action }: { code: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-gutter">
      <div className="w-full max-w-[420px] text-center">
        <div className="font-mono text-xs text-text-3">{code}</div>
        <h1 className="mt-2 text-xl text-text">{title}</h1>
        <p className="mt-2 text-sm text-text-3">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
