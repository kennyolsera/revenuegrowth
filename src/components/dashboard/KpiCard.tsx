import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

type Tone = "blue" | "emerald" | "amber" | "indigo" | "rose";

/**
 * A single stat cell in a financial-readout strip. Deliberately borderless and
 * tile-free — the number carries the weight. Wrap several in a bordered,
 * divide-x container (see KpiStrip) so they read as one terminal band.
 */
export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  trendTone = "success",
  loading = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendTone?: "success" | "danger" | "neutral";
  color?: Tone; // accepted for API compatibility; the strip is monochrome by design
  loading?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col justify-between px-5 py-4">
      <div className="flex items-center gap-1.5 text-ink-muted">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="label-mono">{label}</span>
      </div>

      {loading ? (
        <div className="skeleton mt-3 h-8 w-24 rounded" />
      ) : (
        <div className="mt-3 font-mono text-[27px] font-semibold leading-none tracking-tight text-ink">
          {value}
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

/** Bordered strip that binds KPI cells into one hairline-divided readout. */
export function KpiStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col divide-y divide-surface-border overflow-hidden rounded-lg border border-surface-border bg-surface sm:flex-row sm:divide-x sm:divide-y-0">
      {children}
    </div>
  );
}
