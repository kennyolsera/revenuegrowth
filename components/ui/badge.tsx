import * as React from 'react';
import { cn } from '@/lib/cn';
import { resolveStatus, toneVar, type StatusDef, type Tone } from '@/lib/status';

/** Neutral badge with a 6px coloured dot. Status lives in the dot, never the fill. */
export function Badge({ tone = 'gray', children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1.5 rounded-xs border border-border bg-surface-2 px-1.5 text-xs font-medium text-text-2',
        className,
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: toneVar(tone) }} />
      {children}
    </span>
  );
}

/** Badge driven by a status map from lib/status.ts. */
export function StatusBadge({ map, value, className }: { map: Record<string, StatusDef>; value: string | null | undefined; className?: string }) {
  const s = resolveStatus(map, value);
  return (
    <Badge tone={s.tone} className={className}>
      {s.label}
    </Badge>
  );
}

/** Filter chip: 26px, accent tint when active. */
export function Chip({
  active = false,
  onClick,
  children,
  count,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-h-sm items-center gap-1.5 rounded-sm border px-2.5 text-xs font-medium transition-colors',
        active
          ? 'border-accent-line bg-accent-soft text-text'
          : 'border-border bg-surface text-text-2 hover:bg-surface-2 hover:text-text',
      )}
    >
      {children}
      {count !== undefined && <span className="num text-text-3">{count}</span>}
    </button>
  );
}
