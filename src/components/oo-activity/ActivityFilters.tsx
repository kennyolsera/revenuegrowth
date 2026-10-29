"use client";

import { CaretDown as ChevronDown, X } from "@/components/icons";
import { EVENT_TYPE_COLOR_CLASSES } from "@/lib/calendar-event-types";
import type { ActivityOption } from "@/lib/oo-activity";
import { cn } from "@/lib/utils";

/**
 * Compact filter pill. The visible text reads "Product: Netzme" when set; an
 * invisible native <select> covers the pill so keyboard and screen readers get
 * the real control. Set pills show a clear (×) button.
 */
export function FilterPill({
  label,
  value,
  options,
  onChange,
  clearLabel,
  allLabel,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  clearLabel: string;
  allLabel: string;
}) {
  const current = options.find((o) => o.value === value);
  const active = !!value && !!current;
  return (
    <span
      className={cn(
        "relative inline-flex h-7 shrink-0 items-center rounded-full border text-[12px] transition-colors focus-within:ring-2 focus-within:ring-accent/30",
        active ? "border-accent-line bg-accent-soft text-accent" : "border-border bg-surface text-text-2 hover:border-border-strong hover:text-text"
      )}
    >
      <span className="pointer-events-none flex items-center gap-1 whitespace-nowrap pl-3 pr-1">
        <span className={cn(active && "text-accent/75")}>{active ? `${label}:` : label}</span>
        {active && <span className="max-w-[160px] truncate font-medium">{current!.label}</span>}
      </span>
      {active ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={`${clearLabel}: ${label}`}
          className="relative z-[1] mr-1 rounded-full p-0.5 hover:bg-accent/10"
        >
          <X className="h-3 w-3" />
        </button>
      ) : (
        <ChevronDown aria-hidden className="pointer-events-none mr-2 h-3 w-3 opacity-60" />
      )}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("absolute inset-y-0 left-0 cursor-pointer appearance-none opacity-0", active ? "right-6" : "right-0")}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  );
}

/**
 * Status as saved views: "All 1,284 · Closed 1,102 · Open 120", with a 3px
 * proportion bar underneath that shows the mix at a glance.
 */
export function StatusViews({
  statuses,
  counts,
  total,
  noneCount,
  value,
  onChange,
  allLabel,
  noneLabel,
  groupLabel,
  locale,
}: {
  statuses: ActivityOption[];
  counts: Map<string, number>;
  total: number;
  noneCount: number;
  value: string;
  onChange: (v: string) => void;
  allLabel: string;
  noneLabel: string;
  groupLabel: string;
  locale: string;
}) {
  const fmt = (n: number) => n.toLocaleString(locale);
  const views = [
    { value: "", label: allLabel, n: total, color: null as null | ActivityOption["color"] },
    ...statuses.map((s) => ({ value: s.id, label: s.label, n: counts.get(s.id) ?? 0, color: s.color })),
    ...(noneCount > 0 ? [{ value: "__none__", label: noneLabel, n: noneCount, color: null }] : []),
  ];
  const segments = [...statuses.map((s) => ({ id: s.id, n: counts.get(s.id) ?? 0, cls: EVENT_TYPE_COLOR_CLASSES[s.color].swatch, label: s.label })), { id: "__none__", n: noneCount, cls: "bg-surface-3", label: noneLabel }].filter((x) => x.n > 0);

  return (
    <div className="space-y-2">
      <div role="group" aria-label={groupLabel} className="-mx-1 flex items-center gap-0.5 overflow-x-auto px-1 pb-0.5">
        {views.map((v) => {
          const on = value === v.value;
          return (
            <button
              key={v.value || "all"}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on && v.value ? "" : v.value)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-2 rounded-md px-2.5 text-[13px] transition-colors active:scale-[0.98]",
                on ? "bg-surface text-text shadow-sm ring-1 ring-border" : "text-text-3 hover:bg-surface-2 hover:text-text"
              )}
            >
              {v.color && <span aria-hidden className={cn("h-2 w-2 rounded-full", EVENT_TYPE_COLOR_CLASSES[v.color].swatch)} />}
              <span className="whitespace-nowrap font-medium">{v.label}</span>
              <span className={cn("font-mono text-[11.5px] tabular-nums", on ? "text-text-2" : "text-text-4")}>{fmt(v.n)}</span>
            </button>
          );
        })}
      </div>
      <div aria-hidden className="flex h-[3px] w-full overflow-hidden rounded-full bg-surface-3">
        {segments.map((s) => (
          <span
            key={s.id}
            title={`${s.label} ${fmt(s.n)}`}
            className={cn("h-full transition-[flex-grow] duration-500", s.cls, value && value !== s.id && "opacity-30")}
            style={{ flexGrow: s.n, flexBasis: 0 }}
          />
        ))}
      </div>
    </div>
  );
}
