"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { useCountUp } from "@/lib/hooks/useCountUp";

type Tone = "blue" | "emerald" | "amber" | "indigo" | "rose";

/**
 * A stat cell in a premium readout strip. Numbers count up on mount; the label
 * icon sits in a soft brand-tinted chip. Wrap several in KpiStrip.
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
  icon: LucideIcon;
  trend?: string;
  trendTone?: "success" | "danger" | "neutral";
  color?: Tone; // accepted for API compatibility
  loading?: boolean;
  /** When provided, the number animates 0→animateTo and is rendered via `format`. */
  animateTo?: number;
  format?: (n: number) => string;
}) {
  const animated = useCountUp(animateTo ?? 0, { enabled: animateTo != null && !loading });
  const display =
    animateTo != null ? (format ? format(animated) : Math.round(animated).toLocaleString("id-ID")) : value;

  return (
    <div className="group relative flex flex-1 flex-col justify-between px-5 py-4 transition-colors hover:bg-accent-soft/30">
      <div className="flex items-center gap-2 text-ink-muted">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="label-mono">{label}</span>
      </div>

      {loading ? (
        <div className="skeleton mt-3 h-8 w-24 rounded-md" />
      ) : (
        <div className="mt-3 font-mono text-[27px] font-semibold leading-none tracking-tight text-ink tabular-nums">
          {display}
        </div>
      )}

      {!loading && trend && (
        <div className="mt-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              trendTone === "success" && "text-status-success",
              trendTone === "danger" && "text-status-danger",
              trendTone === "neutral" && "text-ink-muted"
            )}
          >
            {trendTone === "success" && <TrendingUp className="h-3 w-3" />}
            {trendTone === "danger" && <TrendingDown className="h-3 w-3" />}
            {trendTone === "neutral" && <Minus className="h-3 w-3" />}
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

/** Bordered strip binding KPI cells into one hairline-divided readout. */
export function KpiStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="stagger-children flex flex-col divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border bg-surface shadow-card sm:flex-row sm:divide-x sm:divide-y-0">
      {children}
    </div>
  );
}
