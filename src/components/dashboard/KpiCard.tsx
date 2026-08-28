import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

type Tone = "blue" | "emerald" | "amber" | "indigo" | "rose";

const toneStyles: Record<Tone, { iconBg: string; iconText: string; accent: string }> = {
  blue: { iconBg: "bg-accent-soft", iconText: "text-accent", accent: "bg-accent" },
  emerald: { iconBg: "bg-emerald-50", iconText: "text-status-success", accent: "bg-status-success" },
  amber: { iconBg: "bg-amber-50", iconText: "text-status-warning", accent: "bg-status-warning" },
  indigo: { iconBg: "bg-accent-soft", iconText: "text-accent", accent: "bg-accent" },
  rose: { iconBg: "bg-rose-50", iconText: "text-status-danger", accent: "bg-status-danger" },
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  trendTone = "success",
  color = "blue",
  loading = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendTone?: "success" | "danger" | "neutral";
  color?: Tone;
  loading?: boolean;
}) {
  const currentTone = toneStyles[color] ?? toneStyles.blue;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-surface-border bg-surface p-4 transition-colors hover:border-accent-line">
      {/* left accent tick */}
      <span className={cn("absolute left-0 top-4 h-6 w-[3px] rounded-r", currentTone.accent)} />

      <div className="flex items-center justify-between pl-2">
        <span className="label-mono text-ink-muted">{label}</span>
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", currentTone.iconBg, currentTone.iconText)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 pl-2">
        {loading ? (
          <div className="skeleton h-8 w-24 rounded sm:h-9" />
        ) : (
          <div className="font-mono text-[26px] font-semibold tracking-tight text-ink sm:text-[28px]">{value}</div>
        )}
        {!loading && trend && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold",
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
    </div>
  );
}
