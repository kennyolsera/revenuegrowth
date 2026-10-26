'use client';

import * as React from 'react';
import type { TooltipProps } from 'recharts';
import { formatIDR, formatNumber } from '@/lib/format';

/**
 * Shared Recharts styling — spread these onto Recharts parts so every chart reads as one system.
 *   <CartesianGrid {...gridProps} />
 *   <XAxis {...axisProps} dataKey="week" />
 *   <YAxis {...axisProps} tickFormatter={idrTick} />
 *   <Tooltip content={<ChartTooltip money />} cursor={cursorProps} />
 *   <Line {...lineProps} dataKey="qris" stroke={CHART_SERIES[0]} />
 */
export const gridProps = { stroke: 'var(--divider)', vertical: false } as const;

export const axisProps = {
  stroke: 'var(--border)',
  tick: { fill: 'var(--text-3)', fontSize: 11 },
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
} as const;

export const lineProps = {
  type: 'monotone' as const,
  strokeWidth: 2,
  dot: false,
  activeDot: { r: 3.5, strokeWidth: 0 },
  isAnimationActive: true,
  animationDuration: 500,
};

export const barProps = {
  radius: [3, 3, 0, 0] as [number, number, number, number],
  maxBarSize: 28,
  isAnimationActive: true,
  animationDuration: 500,
};

export const cursorProps = { stroke: 'var(--border-strong)', strokeWidth: 1 };
export const barCursorProps = { fill: 'var(--surface-2)' };

/** Compact IDR on axes: "Rp 1,25 jt". */
export const idrTick = (v: number) => formatIDR(v, { compact: true });

/** Tooltip: surface + shadow-pop + 10px radius, values in tabular nums with full IDR. */
export function ChartTooltip({
  active,
  payload,
  label,
  money = false,
}: TooltipProps<number, string> & { money?: boolean }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[160px] rounded-lg bg-surface px-3 py-2 shadow-pop">
      {label !== undefined && <div className="mb-1.5 text-xs font-medium text-text-3">{label}</div>}
      <ul className="space-y-1">
        {payload.map((p) => (
          <li key={String(p.dataKey)} className="flex items-center gap-2 text-sm">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
            <span className="flex-1 text-text-2">{p.name}</span>
            <span className="num font-medium text-text">
              {typeof p.value === 'number' ? (money ? formatIDR(p.value) : formatNumber(p.value)) : p.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Legend as plain text with dots — colour is never the only carrier of meaning. */
export function ChartLegend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-2">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-0.5 w-3"
            style={i.dashed ? { borderTop: `2px dashed ${i.color}` } : { background: i.color }}
          />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
