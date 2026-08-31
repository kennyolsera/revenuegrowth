"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { useCountUp } from "@/lib/hooks/useCountUp";

type Tone = "blue" | "emerald" | "amber" | "indigo" | "rose";

/**
 * Soft, self-contained KPI card (Pollinate-style): icon chip + label, a large
 * animated number, and a trend line. Wrap several in KpiStrip.
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
  animateTo?: number;
  format?: (n: number) => string;
}) {
  const animated = useCountUp(animateTo ?? 0, { enabled: animateTo != null && !loading });
  const display =
    animateTo != null ? (format ? format(animated) : Math.round(animated).toLocaleString("id-ID")) : value;

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-5 shadow-card transition-shadow duration-200 hover:shadow-lift">
      <div className="flex items-center gap-2 text-ink-muted">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-xs font-medium">{label}</span>
      </div>

      {loading ? (
        <div className="skeleton mt-3.5 h-8 w-28 rounded-md" />
      ) : (
        <div className="mt-3.5 text-[28px] font-bold leading-none tracking-tight text-ink tabular-nums">{display}</div>
      )}

      {!loading && trend && (
        <div className="mt-2.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold",
              trendTone === "success" && "text-status-success",
              trendTone === "danger" && "text-status-danger",
              trendTone === "neutral" && "text-ink-muted"
            )}
          >
            {trendTone === "success" && <TrendingUp className="h-3.5 w-3.5" />}
            {trendTone === "danger" && <TrendingDown className="h-3.5 w-3.5" />}
            {trendTone === "neutral" && <Minus className="h-3.5 w-3.5" />}
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

/** Responsive grid of KPI cards with a staggered entrance. */
export function KpiStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="stagger-children grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
  );
}
