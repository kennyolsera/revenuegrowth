"use client";

import { cn } from "@/lib/utils";
import { TrendUp, TrendDown, Minus, type Icon as PhosphorIcon } from "@/components/icons";
import { useCountUp } from "@/lib/hooks/useCountUp";

type Tone = "blue" | "emerald" | "amber" | "indigo" | "rose";

/**
 * One cell of a KpiStrip: small label with its icon, a mono figure, a trend line.
 * No card, tile or shadow of its own: the strip draws the frame and dividers.
 */
export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  trendTone = "success",
  loading = false,
  animateTo,
  format,
}: {
  label: string;
  value: string;
  icon: PhosphorIcon;
  trend?: string;
  trendTone?: "success" | "danger" | "neutral";
  color?: Tone; // accepted for API compatibility
  loading?: boolean;
  animateTo?: number;
  format?: (n: number) => string;
}) {
  const animated = useCountUp(animateTo ?? 0, { enabled: animateTo != null && !loading });
  const display =
    animateTo != null ? (format ? format(animated) : Math.round(animated).toLocaleString("id-ID")) : value;

  return (
    <div className="min-w-0 px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-[12.5px] text-text-3">
        <Icon aria-hidden className="h-[15px] w-[15px] shrink-0 text-text-4" />
        <span className="truncate">{label}</span>
      </div>

      {loading ? (
        <div className="mt-2.5 h-7 w-24 animate-pulse rounded bg-surface-3" />
      ) : (
        <div className="mt-2 truncate font-mono text-[26px] font-medium leading-none tracking-[-0.02em] text-text tabular-nums">
          {display}
        </div>
      )}

      {!loading && trend && (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-[12px] font-medium",
            trendTone === "success" && "text-green",
            trendTone === "danger" && "text-red",
            trendTone === "neutral" && "text-text-3"
          )}
        >
          {trendTone === "success" && <TrendUp aria-hidden className="h-3.5 w-3.5" />}
          {trendTone === "danger" && <TrendDown aria-hidden className="h-3.5 w-3.5" />}
          {trendTone === "neutral" && <Minus aria-hidden className="h-3.5 w-3.5" />}
          {trend}
        </div>
      )}
    </div>
  );
}

/** KPI cells in one framed strip, separated by hairlines (2 columns on small screens, 4 on wide). */
export function KpiStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-surface lg:grid-cols-4 [&>*]:border-divider [&>*:nth-child(n+3)]:border-t lg:[&>*:nth-child(n+3)]:border-t-0 [&>*:not(:first-child)]:border-l [&>*:nth-child(3)]:border-l-0 lg:[&>*:nth-child(3)]:border-l">
      {children}
    </div>
  );
}
