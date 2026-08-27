import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

type Tone = "blue" | "emerald" | "amber" | "indigo" | "rose";

const toneStyles: Record<
  Tone,
  {
    iconBg: string;
    iconText: string;
    glow: string;
    border: string;
  }
> = {
  blue: {
    iconBg: "bg-gradient-to-tr from-blue-600 to-sky-400",
    iconText: "text-white",
    glow: "group-hover:shadow-blue-500/10",
    border: "hover:border-blue-300",
  },
  emerald: {
    iconBg: "bg-gradient-to-tr from-emerald-600 to-teal-400",
    iconText: "text-white",
    glow: "group-hover:shadow-emerald-500/10",
    border: "hover:border-emerald-300",
  },
  amber: {
    iconBg: "bg-gradient-to-tr from-amber-600 to-yellow-400",
    iconText: "text-white",
    glow: "group-hover:shadow-amber-500/10",
    border: "hover:border-amber-300",
  },
  indigo: {
    iconBg: "bg-gradient-to-tr from-indigo-600 to-purple-400",
    iconText: "text-white",
    glow: "group-hover:shadow-indigo-500/10",
    border: "hover:border-indigo-300",
  },
  rose: {
    iconBg: "bg-gradient-to-tr from-rose-600 to-pink-400",
    iconText: "text-white",
    glow: "group-hover:shadow-rose-500/10",
    border: "hover:border-rose-300",
  },
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  trendTone = "success",
  color = "blue",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendTone?: "success" | "danger" | "neutral";
  color?: Tone;
}) {
  const currentTone = toneStyles[color] ?? toneStyles.blue;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-5 backdrop-blur-sm shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        currentTone.glow,
        currentTone.border
      )}
    >
      {/* Subtle decorative background graphic circle */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-slate-100/60 blur-xl group-hover:bg-slate-200/50 transition-colors" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md transition-transform duration-200 group-hover:scale-110",
            currentTone.iconBg,
            currentTone.iconText
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl font-mono">{value}</div>
        {trend && (
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                trendTone === "success" && "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
                trendTone === "danger" && "bg-rose-50 text-rose-700 border border-rose-200/80",
                trendTone === "neutral" && "bg-slate-100 text-slate-600 border border-slate-200"
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
