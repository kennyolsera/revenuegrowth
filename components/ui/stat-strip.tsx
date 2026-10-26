import * as React from 'react';
import { cn } from '@/lib/cn';
import { toneText, type Tone } from '@/lib/status';

export interface Stat {
  label: string;
  value: React.ReactNode;
  /** Full value shown in a tooltip when `value` is compact (e.g. "Rp 1.250.000.000"). */
  fullValue?: string;
  caption?: React.ReactNode;
  /** Colour the caption only when it needs attention. */
  captionTone?: Tone;
}

/** KPI strip: one bordered strip with internal dividers, not separate cards. 2×2 under 900px. */
export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-surface min-[901px]:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            'px-4 py-3.5',
            // internal dividers: vertical between columns, horizontal between rows on mobile
            i % 2 === 1 && 'border-l border-divider',
            i >= 2 && 'border-t border-divider min-[901px]:border-t-0',
            i === 2 && 'min-[901px]:border-l',
          )}
        >
          <div className="text-xs font-medium text-text-3">{s.label}</div>
          <div className="num mt-1 text-stat font-semibold text-text" title={s.fullValue}>
            {s.value}
          </div>
          {s.caption && (
            <div className={cn('num mt-0.5 text-xs', s.captionTone ? toneText[s.captionTone] : 'text-text-3')}>
              {s.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** 4px progress toward target. Over 100% caps the bar and shows the % in green. */
export function Progress({ ratio, label }: { ratio: number; label: string }) {
  const p = Math.max(0, Math.min(1, ratio));
  const pct = Math.round(ratio * 100);
  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className="h-full origin-left rounded-full bg-accent [animation:growX_500ms_var(--ease)_both]"
          style={{ transform: `scaleX(${p})` }}
        />
      </div>
      <span className={cn('num w-10 text-right text-xs font-medium', ratio >= 1 ? 'text-green' : 'text-text-2')}>
        {pct}%
      </span>
    </div>
  );
}
