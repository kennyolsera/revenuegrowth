/**
 * Calendar activity types (ADR-006). Types live in `calendar_event_types` so the
 * team can add, rename and recolour them. The keys below are the five that existed
 * before the table; they are also the fallback when the table is not migrated yet.
 */

export type EventTypeColor = "blue" | "green" | "amber" | "red" | "violet" | "teal" | "orange" | "rose" | "gray";

export type CalendarEventType = {
  key: string;
  label: string;
  color: EventTypeColor;
  sort: number;
};

/** Fixed colour set; class strings are literal so Tailwind keeps them. */
export const EVENT_TYPE_COLOR_CLASSES: Record<EventTypeColor, { chip: string; swatch: string }> = {
  blue: { chip: "bg-blue-50 text-blue-700 border border-blue-200", swatch: "bg-blue-500" },
  green: { chip: "bg-green-50 text-green-700 border border-green-200", swatch: "bg-green-500" },
  amber: { chip: "bg-amber-50 text-amber-700 border border-amber-200", swatch: "bg-amber-500" },
  red: { chip: "bg-red-50 text-red-700 border border-red-200", swatch: "bg-red-500" },
  violet: { chip: "bg-violet-50 text-violet-700 border border-violet-200", swatch: "bg-violet-500" },
  teal: { chip: "bg-teal-50 text-teal-700 border border-teal-200", swatch: "bg-teal-500" },
  orange: { chip: "bg-orange-50 text-orange-700 border border-orange-200", swatch: "bg-orange-500" },
  rose: { chip: "bg-rose-50 text-rose-700 border border-rose-200", swatch: "bg-rose-500" },
  gray: { chip: "bg-slate-100 text-slate-700 border border-slate-200", swatch: "bg-slate-400" },
};

export const EVENT_TYPE_COLORS_ORDER: EventTypeColor[] = ["blue", "green", "amber", "red", "violet", "teal", "orange", "rose", "gray"];

export const COLOR_LABELS: Record<EventTypeColor, { id: string; en: string }> = {
  blue: { id: "Biru", en: "Blue" },
  green: { id: "Hijau", en: "Green" },
  amber: { id: "Kuning", en: "Amber" },
  red: { id: "Merah", en: "Red" },
  violet: { id: "Ungu", en: "Violet" },
  teal: { id: "Toska", en: "Teal" },
  orange: { id: "Oranye", en: "Orange" },
  rose: { id: "Merah muda", en: "Rose" },
  gray: { id: "Abu-abu", en: "Gray" },
};

export const FALLBACK_EVENT_TYPES: CalendarEventType[] = [
  { key: "demo", label: "Demo", color: "blue", sort: 10 },
  { key: "onboarding", label: "Onboarding", color: "green", sort: 20 },
  { key: "support", label: "Support", color: "amber", sort: 30 },
  { key: "internal", label: "Internal", color: "violet", sort: 40 },
  { key: "lainnya", label: "Lainnya", color: "gray", sort: 90 },
];

export function isEventTypeColor(v: unknown): v is EventTypeColor {
  return typeof v === "string" && (EVENT_TYPE_COLORS_ORDER as string[]).includes(v);
}

export function chipClass(types: CalendarEventType[], key: string | null | undefined): string {
  const t = types.find((x) => x.key === key);
  return EVENT_TYPE_COLOR_CLASSES[t?.color ?? "gray"].chip;
}

export function typeLabel(types: CalendarEventType[], key: string | null | undefined): string {
  return types.find((x) => x.key === key)?.label ?? key ?? "";
}

/**
 * Stable key for a new type: slug of the label plus a short random suffix so two
 * people adding "Workshop" never collide on the primary key. Matches the DB check
 * `^[a-z0-9][a-z0-9_-]{0,63}$`.
 */
export function makeTypeKey(label: string, rand: () => number = Math.random): string {
  const slug = label
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = Math.floor(rand() * 36 ** 4)
    .toString(36)
    .padStart(4, "0");
  return `${slug || "type"}-${suffix}`;
}

/** Same rule the unique index uses: lower(trim(label)). */
export function labelTaken(types: CalendarEventType[], label: string, exceptKey?: string): boolean {
  const norm = label.trim().toLowerCase();
  return types.some((t) => t.key !== exceptKey && t.label.trim().toLowerCase() === norm);
}

/** PostgREST error for a table that does not exist yet (migration not applied). */
export function isMissingTable(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  const msg = err.message ?? "";
  return err.code === "42P01" || err.code === "PGRST205" || (/calendar_event_types/.test(msg) && /not find|does not exist/i.test(msg));
}

/** Foreign-key violation: the type is still used by events. */
export function isInUse(err: { code?: string } | null | undefined): boolean {
  return err?.code === "23503";
}
