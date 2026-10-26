import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * Data table primitives. 40px rows (34 compact), separators only between rows,
 * sticky header, numbers right-aligned via `numeric`.
 * Under 640px, wrap rows in <MobileCardList> instead.
 */
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border bg-surface', className)}>
      <table className="w-full border-collapse text-base">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="sticky top-0 z-[1] bg-surface">{children}</thead>;
}

export function TH({ children, numeric, className }: { children?: React.ReactNode; numeric?: boolean; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        'h-9 whitespace-nowrap border-b border-border px-4 text-xs font-medium text-text-3',
        numeric ? 'text-right' : 'text-left',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TR({
  children,
  onClick,
  selected,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()) : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-selected={selected || undefined}
      className={cn(
        'h-row border-b border-divider transition-colors last:border-b-0',
        onClick && 'cursor-pointer hover:bg-surface-2',
        selected && 'bg-accent-soft hover:bg-accent-soft',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TD({ children, numeric, muted, mono, className }: { children?: React.ReactNode; numeric?: boolean; muted?: boolean; mono?: boolean; className?: string }) {
  return (
    <td
      className={cn(
        'whitespace-nowrap px-4',
        numeric && 'num text-right',
        muted ? 'text-text-3' : 'text-text',
        mono && 'font-mono text-xs text-text-2',
        className,
      )}
    >
      {children}
    </td>
  );
}

/** ≤640px: rows become stacked bordered cards. */
export function MobileCardList({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-col gap-2">{children}</ul>;
}

export function MobileCard({
  title,
  meta,
  status,
  amount,
  onClick,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  status?: React.ReactNode;
  amount?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[56px] w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-left active:bg-surface-2"
      >
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-text">{title}</div>
          {(meta || status) && (
            <div className="mt-1 flex items-center gap-2 text-xs text-text-3">
              {status}
              {meta}
            </div>
          )}
        </div>
        {amount && <div className="num shrink-0 font-semibold text-text">{amount}</div>}
      </button>
    </li>
  );
}
