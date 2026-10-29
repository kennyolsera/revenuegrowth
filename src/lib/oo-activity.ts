/**
 * Activity Online Order (ADR-013, cloned from Activity Record / ADR-008): the online-order follow-up sheet.
 * Types, list fields and the pure import logic
 * (header matching, date parsing, option matching, duplicate detection).
 * Nothing here talks to Supabase, so it can be unit-tested directly.
 */
import type { EventTypeColor } from "@/lib/calendar-event-types";

export type OptionField = "subs" | "status" | "source" | "product" | "perihal";

export type ActivityOption = {
  id: string;
  field: OptionField;
  label: string;
  color: EventTypeColor;
  sort: number;
};

export type ActivityRecord = {
  id: string;
  activity_date: string | null;
  /** The store's Olsera URL name (sheet column "URL"), e.g. omahsosisbojonegoro. */
  store_name: string;
  phone: string | null;
  subs_id: string | null;
  status_id: string | null;
  source_id: string | null;
  product_id: string | null;
  perihal_id: string | null;
  /** Follow-up duration in minutes (sheet column "Menit"). */
  minutes: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type OptionColumn = `${OptionField}_id`;

export const OPTION_FIELDS: { field: OptionField; column: OptionColumn; label: { id: string; en: string } }[] = [
  { field: "subs", column: "subs_id", label: { id: "Subscription", en: "Subscription" } },
  { field: "status", column: "status_id", label: { id: "Status FU", en: "FU Status" } },
  { field: "source", column: "source_id", label: { id: "Sumber Data", en: "Data Source" } },
  { field: "product", column: "product_id", label: { id: "Produk", en: "Product" } },
  { field: "perihal", column: "perihal_id", label: { id: "Perihal", en: "Subject" } },
];

export const columnOf = (field: OptionField): OptionColumn => `${field}_id`;

export function optionsFor(options: ActivityOption[], field: OptionField): ActivityOption[] {
  return options
    .filter((o) => o.field === field)
    .sort((a, b) => a.sort - b.sort || a.label.localeCompare(b.label));
}

const norm = (s: unknown) => String(s ?? "").trim().replace(/\s+/g, " ").toLowerCase();

export function findOption(options: ActivityOption[], field: OptionField, label: string): ActivityOption | undefined {
  const n = norm(label);
  return options.find((o) => o.field === field && norm(o.label) === n);
}

// ───────────────────────────── import: headers ─────────────────────────────

export type ImportKey = "activity_date" | "store_name" | "phone" | "minutes" | "notes" | OptionField;

const HEADER_ALIASES: Record<ImportKey, string[]> = {
  activity_date: ["tgl", "tanggal", "date", "tglfu", "tglaktivitas"],
  store_name: ["url", "urltoko", "toko", "namatoko", "store", "storename", "merchant", "namamerchant"],
  phone: ["nomortelp", "nomortelepon", "notelp", "telp", "notelepon", "telepon", "phone", "nohp", "hp", "wa", "nowa"],
  subs: ["subscription", "subs", "langganan", "paket"],
  status: ["statusfu", "status", "fu", "followupstatus"],
  source: ["sumberdata", "sumber", "source", "datasource"],
  product: ["produk", "product"],
  perihal: ["perihal", "subject", "hal", "topik"],
  minutes: ["menit", "minutes", "durasi", "duration", "min"],
  notes: ["keterangan", "notes", "note", "catatan"],
};

const headerKey = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Map each sheet header to an import key; unknown headers are ignored. */
export function matchHeaders(headers: string[]): { map: Record<string, ImportKey>; missing: ImportKey[] } {
  const map: Record<string, ImportKey> = {};
  const used = new Set<ImportKey>();
  for (const h of headers) {
    const k = headerKey(h);
    const hit = (Object.keys(HEADER_ALIASES) as ImportKey[]).find((key) => !used.has(key) && HEADER_ALIASES[key].includes(k));
    if (hit) {
      map[h] = hit;
      used.add(hit);
    }
  }
  const missing = (Object.keys(HEADER_ALIASES) as ImportKey[]).filter((k) => !used.has(k));
  return { map, missing };
}

// ───────────────────────────── import: dates ─────────────────────────────

const MONTHS: Record<string, number> = {
  jan: 1, januari: 1, january: 1,
  feb: 2, februari: 2, february: 2, peb: 2,
  mar: 3, maret: 3, march: 3,
  apr: 4, april: 4,
  may: 5, mei: 5,
  jun: 6, juni: 6, june: 6,
  jul: 7, juli: 7, july: 7,
  aug: 8, agu: 8, agt: 8, agustus: 8, august: 8, ags: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, okt: 10, oktober: 10, october: 10,
  nov: 11, november: 11, nop: 11,
  dec: 12, des: 12, desember: 12, december: 12,
};

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

function valid(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2000 || y > 2100) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** No year given: this year, unless that lands more than 30 days in the future (then last year). */
function inferYear(m: number, d: number, today: Date): number {
  const y = today.getFullYear();
  const candidate = Date.UTC(y, m - 1, d);
  const limit = Date.UTC(y, today.getMonth(), today.getDate()) + 30 * 86400000;
  return candidate > limit ? y - 1 : y;
}

/**
 * Parse a sheet date cell into YYYY-MM-DD. Accepts Date objects, Excel serial
 * numbers, ISO strings, d/m/y (day first, Indonesian style) and "5 Oct" / "5 Okt 2026".
 * Returns null for empty input, "invalid" when it can't be read.
 */
export function parseSheetDate(value: unknown, today: Date = new Date()): string | null | "invalid" {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return "invalid";
    return iso(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }
  if (typeof value === "number") {
    if (value < 20000 || value > 80000) return "invalid"; // Excel serial range ≈ 1954–2119
    const ms = Math.round((value - 25569) * 86400000);
    const dt = new Date(ms);
    return iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
  }
  const s = String(value).trim().toLowerCase().replace(/,/g, " ").replace(/\s+/g, " ");
  if (!s) return null;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    const [y, mo, d] = [+m[1], +m[2], +m[3]];
    return valid(y, mo, d) ? iso(y, mo, d) : "invalid";
  }
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/);
  if (m) {
    const d = +m[1], mo = +m[2];
    let y = m[3] ? +m[3] : inferYear(mo, d, today);
    if (y < 100) y += 2000;
    return valid(y, mo, d) ? iso(y, mo, d) : "invalid";
  }
  m = s.match(/^(\d{1,2})[ -]([a-z]+)\.?(?:[ -](\d{2,4}))?$/);
  if (m && MONTHS[m[2]]) {
    const d = +m[1], mo = MONTHS[m[2]];
    let y = m[3] ? +m[3] : inferYear(mo, d, today);
    if (y < 100) y += 2000;
    return valid(y, mo, d) ? iso(y, mo, d) : "invalid";
  }
  return "invalid";
}

/** Phone cells often arrive as numbers; keep digits exactly, no ".0", no exponent. */
export function cellText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number") return Number.isInteger(value) ? value.toFixed(0) : String(value);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

// ───────────────────────────── import: plan ─────────────────────────────

export type RecordDraft = {
  activity_date: string | null;
  store_name: string;
  phone: string | null;
  minutes: number | null;
  notes: string | null;
  /** Option labels as written in the sheet, per list field. */
  labels: Partial<Record<OptionField, string>>;
};

/** "10", 10, "10 menit", "1,5" -> whole minutes (0..1440); anything else -> null. */
export function parseMinutes(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", ".").replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n < 0 || n > 1440 || String(value).replace(/[^0-9]/g, "") === "") return null;
  return Math.round(n);
}

export type ImportPlan = {
  drafts: RecordDraft[];
  /** Option values not yet on the lists: created (gray) before the rows. */
  newOptions: { field: OptionField; label: string }[];
  /** Rows that already exist in the app (exact match on every column). */
  duplicates: number;
  problems: { row: number; message: { id: string; en: string } }[];
  totalRows: number;
};

/** Identity of a row for duplicate detection: every column, normalised. */
export function dedupKey(d: {
  activity_date: string | null;
  store_name: string;
  phone: string | null;
  minutes: number | null;
  notes: string | null;
  labels: Partial<Record<OptionField, string>>;
}): string {
  return [
    d.activity_date ?? "",
    norm(d.store_name),
    norm(d.phone).replace(/[^0-9+]/g, ""),
    d.minutes == null ? "" : String(d.minutes),
    norm(d.notes),
    ...OPTION_FIELDS.map((f) => norm(d.labels[f.field])),
  ].join("|");
}

export function recordToKey(r: ActivityRecord, options: ActivityOption[]): string {
  const byId = new Map(options.map((o) => [o.id, o.label]));
  const labels: Partial<Record<OptionField, string>> = {};
  for (const f of OPTION_FIELDS) {
    const id = r[f.column];
    if (id) labels[f.field] = byId.get(id) ?? "";
  }
  return dedupKey({ ...r, labels });
}

/**
 * Turn parsed sheet rows (objects keyed by header) into an import plan.
 * Rows equal to existing records are skipped one-for-one, so repeats inside the
 * sheet still come in the first time and a re-import adds nothing.
 */
export function planImport(
  rows: Record<string, unknown>[],
  headerMap: Record<string, ImportKey>,
  options: ActivityOption[],
  existing: ActivityRecord[],
  today: Date = new Date()
): ImportPlan {
  const plan: ImportPlan = { drafts: [], newOptions: [], duplicates: 0, problems: [], totalRows: 0 };
  const seen = new Map<string, number>();
  for (const r of existing) {
    const k = recordToKey(r, options);
    seen.set(k, (seen.get(k) ?? 0) + 1);
  }
  const newKeys = new Set<string>();

  rows.forEach((raw, i) => {
    const rowNo = i + 2; // header is row 1
    const get = (key: ImportKey) => {
      const header = Object.keys(headerMap).find((h) => headerMap[h] === key);
      return header ? raw[header] : undefined;
    };
    const values = Object.keys(headerMap).map((h) => cellText(raw[h]));
    if (values.every((v) => v === "")) return; // fully blank line
    plan.totalRows++;

    const store = cellText(get("store_name")).replace(/\s+/g, " ");
    if (!store) {
      plan.problems.push({ row: rowNo, message: { id: "URL toko kosong, baris dilewati.", en: "No store URL, row skipped." } });
      return;
    }
    let date = parseSheetDate(get("activity_date"), today);
    if (date === "invalid") {
      plan.problems.push({
        row: rowNo,
        message: {
          id: `Tanggal "${cellText(get("activity_date"))}" tidak terbaca, dikosongkan.`,
          en: `Date "${cellText(get("activity_date"))}" not recognised, left empty.`,
        },
      });
      date = null;
    }
    const labels: Partial<Record<OptionField, string>> = {};
    for (const f of OPTION_FIELDS) {
      const label = cellText(get(f.field)).replace(/\s+/g, " ").slice(0, 120);
      if (!label) continue;
      labels[f.field] = label;
      const nk = `${f.field}|${norm(label)}`;
      if (!findOption(options, f.field, label) && !newKeys.has(nk)) {
        newKeys.add(nk);
        plan.newOptions.push({ field: f.field, label });
      }
    }
    const draft: RecordDraft = {
      activity_date: date,
      store_name: store.slice(0, 200),
      phone: cellText(get("phone")).slice(0, 40) || null,
      minutes: parseMinutes(get("minutes")),
      notes: cellText(get("notes")).slice(0, 2000) || null,
      labels,
    };
    const key = dedupKey(draft);
    const left = seen.get(key) ?? 0;
    if (left > 0) {
      seen.set(key, left - 1);
      plan.duplicates++;
      return;
    }
    plan.drafts.push(draft);
  });
  return plan;
}

/** Resolve a draft's labels to option ids (after new options were created). */
export function draftToRow(d: RecordDraft, options: ActivityOption[]) {
  const row: Record<string, string | number | null> = {
    activity_date: d.activity_date,
    store_name: d.store_name,
    phone: d.phone,
    minutes: d.minutes,
    notes: d.notes,
  };
  for (const f of OPTION_FIELDS) {
    const label = d.labels[f.field];
    row[f.column] = label ? findOption(options, f.field, label)?.id ?? null : null;
  }
  return row;
}

/** PostgREST error for tables that are not there yet (migration not applied). */
export function isMissingActivityTables(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  const msg = err.message ?? "";
  return err.code === "42P01" || err.code === "PGRST205" || (/online_order_followup(s|_options)/.test(msg) && /not find|does not exist/i.test(msg));
}
