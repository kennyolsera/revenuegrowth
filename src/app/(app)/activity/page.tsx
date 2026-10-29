"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileArrowUp as FileUp, ListChecks, Plus, ArrowsClockwise as RefreshCw, MagnifyingGlass as Search, X } from "@/components/icons";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { SupabaseNotice, ErrorNotice } from "@/components/shared/SupabaseNotice";
import { Button } from "@/components/ui/Button";
import { isEventTypeColor } from "@/lib/calendar-event-types";
import {
  OPTION_FIELDS,
  isMissingActivityTables,
  optionsFor,
  type ActivityOption,
  type ActivityRecord,
  type OptionColumn,
  type OptionField,
} from "@/lib/activity";
import { ActivityDialog } from "@/components/activity/ActivityDialog";
import { OptionsManager } from "@/components/activity/OptionsManager";
import { ImportDialog } from "@/components/activity/ImportDialog";
import { ActivityTable } from "@/components/activity/ActivityTable";
import { FilterPill, StatusViews } from "@/components/activity/ActivityFilters";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";

const PAGE = 100;
const FETCH = 1000;
const NONE = "__none__";

type DatePreset = "" | "today" | "7d" | "30d" | "month" | "lastmonth" | "custom";

const COPY = {
  title: { id: "Catatan Aktivitas", en: "Activity Record" },
  desc: {
    id: "Aktivitas tim per toko. Ubah chip langsung di baris; klik baris untuk detail.",
    en: "The team's activity per store. Change a chip right in the row; click a row for details.",
  },
  add: { id: "Aktivitas baru", en: "New activity" },
  import: { id: "Impor", en: "Import" },
  lists: { id: "Kelola daftar", en: "Edit lists" },
  refresh: { id: "Muat ulang", en: "Reload" },
  search: { id: "Cari toko, telepon, catatan…", en: "Search store, phone, notes…" },
  clearSearch: { id: "Hapus pencarian", en: "Clear search" },
  all: { id: "Semua", en: "All" },
  none: { id: "(kosong)", en: "(empty)" },
  noStatus: { id: "Tanpa status", en: "No status" },
  statusViews: { id: "Tampilan status", en: "Status views" },
  clear: { id: "Hapus", en: "Clear" },
  clearAll: { id: "Hapus filter", en: "Clear filters" },
  date: { id: "Tanggal", en: "Date" },
  today: { id: "Hari ini", en: "Today" },
  d7: { id: "7 hari terakhir", en: "Last 7 days" },
  d30: { id: "30 hari terakhir", en: "Last 30 days" },
  month: { id: "Bulan ini", en: "This month" },
  lastmonth: { id: "Bulan lalu", en: "Last month" },
  custom: { id: "Rentang…", en: "Custom range…" },
  from: { id: "Dari", en: "From" },
  to: { id: "Sampai", en: "To" },
  records: { id: "{n} catatan", en: "{n} records" },
  todayCount: { id: "{n} hari ini", en: "{n} today" },
  updated: { id: "diperbarui {t}", en: "updated {t}" },
  showing: { id: "Menampilkan {shown} dari {n}", en: "Showing {shown} of {n}" },
  activities: { id: "{n} aktivitas", en: "{n} activities" },
  more: { id: "Tampilkan {n} lagi", en: "Show {n} more" },
  missing: {
    id: "Menu ini belum aktif: tabel database activity_options dan activity_records belum dibuat (supabase/migrations/20261026_activity_record.sql).",
    en: "This menu isn't switched on yet: the activity_options and activity_records tables haven't been created (supabase/migrations/20261026_activity_record.sql).",
  },
  saveError: { id: "Gagal menyimpan", en: "Couldn't save" },
  kbdSearch: { id: "Tekan / untuk mencari", en: "Press / to search" },
};

const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function presetRange(p: DatePreset, from: string, to: string): [string, string] {
  const now = new Date();
  const today = isoOf(now);
  const back = (n: number) => isoOf(new Date(now.getFullYear(), now.getMonth(), now.getDate() - n));
  switch (p) {
    case "today":
      return [today, today];
    case "7d":
      return [back(6), today];
    case "30d":
      return [back(29), today];
    case "month":
      return [isoOf(new Date(now.getFullYear(), now.getMonth(), 1)), today];
    case "lastmonth":
      return [isoOf(new Date(now.getFullYear(), now.getMonth() - 1, 1)), isoOf(new Date(now.getFullYear(), now.getMonth(), 0))];
    case "custom":
      return [from, to];
    default:
      return ["", ""];
  }
}

function isTypingTarget(el: EventTarget | null) {
  const t = el as HTMLElement | null;
  return !!t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
}

export default function ActivityRecordPage() {
  const { language } = useLanguage();
  const toast = useToast();
  const locale = language === "id" ? "id-ID" : "en-US";
  const c = (k: keyof typeof COPY, vars: Record<string, string | number> = {}) =>
    Object.entries(vars).reduce((s, [k2, v]) => s.replace(`{${k2}}`, String(v)), COPY[k][language]);
  const fmt = (n: number) => n.toLocaleString(locale);

  const [options, setOptions] = useState<ActivityOption[]>([]);
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Partial<Record<OptionField, string>>>({});
  const [preset, setPreset] = useState<DatePreset>("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [flashId, setFlashId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityRecord | null>(null);
  const [listsOpen, setListsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  async function fetchOptions() {
    const { data, error: err } = await createClient().from("activity_options").select("id, field, label, color, sort").order("sort", { ascending: true });
    if (err) throw err;
    setOptions(((data ?? []) as any[]).map((o) => ({ ...o, color: isEventTypeColor(o.color) ? o.color : "gray" })));
  }

  async function fetchRecords() {
    const supabase = createClient();
    const all: ActivityRecord[] = [];
    // PostgREST caps a response at 1000 rows: page through.
    for (let from = 0; ; from += FETCH) {
      const { data, error: err } = await supabase
        .from("activity_records")
        .select("id, activity_date, store_name, phone, store_url, subs_id, source_id, scope_id, product_id, status_id, flagging_id, notes, created_by, created_at, updated_at")
        .order("activity_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: true })
        .range(from, from + FETCH - 1);
      if (err) throw err;
      all.push(...((data ?? []) as ActivityRecord[]));
      if (!data || data.length < FETCH) break;
    }
    setRecords(all);
    setLoadedAt(new Date());
  }

  async function load() {
    if (!isSupabaseConfigured) return setLoading(false);
    setLoading(true);
    setError(null);
    try {
      await fetchOptions();
      await fetchRecords();
      setMissing(false);
    } catch (err: any) {
      if (isMissingActivityTables(err)) setMissing(true);
      else setError(err?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const anyDialog = dialogOpen || listsOpen || importOpen;
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (anyDialog || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if ((e.key === "n" || e.key === "N") && !missing) {
        e.preventDefault();
        setEditing(null);
        setDialogOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [anyDialog, missing]);

  const [dateFrom, dateTo] = presetRange(preset, customFrom, customTo);

  const usage = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of records)
      for (const f of OPTION_FIELDS) {
        const id = r[f.column];
        if (id) m.set(id, (m.get(id) ?? 0) + 1);
      }
    return m;
  }, [records]);

  /** Every filter except status, so status views can show counts for the current slice. */
  const beforeStatus = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (q && ![r.store_name, r.phone, r.notes, r.store_url].join(" ").toLowerCase().includes(q)) return false;
      for (const f of OPTION_FIELDS) {
        if (f.field === "status") continue;
        const want = filters[f.field];
        if (!want) continue;
        if (want === NONE ? r[f.column] !== null : r[f.column] !== want) return false;
      }
      if (dateFrom && (!r.activity_date || r.activity_date < dateFrom)) return false;
      if (dateTo && (!r.activity_date || r.activity_date > dateTo)) return false;
      return true;
    });
  }, [records, search, filters, dateFrom, dateTo]);

  const statusCounts = useMemo(() => {
    const m = new Map<string, number>();
    let none = 0;
    for (const r of beforeStatus) {
      if (r.status_id) m.set(r.status_id, (m.get(r.status_id) ?? 0) + 1);
      else none++;
    }
    return { m, none };
  }, [beforeStatus]);

  const filtered = useMemo(() => {
    const want = filters.status;
    if (!want) return beforeStatus;
    return beforeStatus.filter((r) => (want === NONE ? r.status_id === null : r.status_id === want));
  }, [beforeStatus, filters.status]);

  useEffect(() => setShown(PAGE), [search, filters, preset, customFrom, customTo]);

  const todayIso = isoOf(new Date());
  const todayCount = useMemo(() => records.filter((r) => r.activity_date === todayIso).length, [records, todayIso]);

  async function changeOption(row: ActivityRecord, column: OptionColumn, id: string | null) {
    const before = row[column];
    if (before === id) return;
    setRecords((rs) => rs.map((r) => (r.id === row.id ? { ...r, [column]: id } : r)));
    const { error: err } = await createClient().from("activity_records").update({ [column]: id }).eq("id", row.id);
    if (err) {
      setRecords((rs) => rs.map((r) => (r.id === row.id ? { ...r, [column]: before } : r)));
      toast.error(`${COPY.saveError[language]}: ${err.message}`);
      return;
    }
    setFlashId(null);
    requestAnimationFrame(() => setFlashId(row.id));
  }

  function clearAll() {
    setSearch("");
    setFilters({});
    setPreset("");
    setCustomFrom("");
    setCustomTo("");
  }

  const activeCount = Object.values(filters).filter(Boolean).length + (search ? 1 : 0) + (preset ? 1 : 0);
  const statuses = optionsFor(options, "status");

  const datePresetOptions: { value: DatePreset; label: string }[] = [
    { value: "today", label: c("today") },
    { value: "7d", label: c("d7") },
    { value: "30d", label: c("d30") },
    { value: "month", label: c("month") },
    { value: "lastmonth", label: c("lastmonth") },
    { value: "custom", label: c("custom") },
  ];

  return (
    <div className="space-y-4">
      {/* Header: left-aligned title with a monospace meta line; actions on the right */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-text">{c("title")}</h1>
          <p className="mt-1 max-w-[65ch] text-[13px] text-text-3">{c("desc")}</p>
          {!missing && !loading && (
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11.5px] text-text-3">
              <span>{c("records", { n: fmt(records.length) })}</span>
              <span aria-hidden className="text-text-4">/</span>
              <span>{c("todayCount", { n: fmt(todayCount) })}</span>
              {loadedAt && (
                <>
                  <span aria-hidden className="text-text-4">/</span>
                  <span>{c("updated", { t: loadedAt.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) })}</span>
                </>
              )}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="ghost" onClick={load} aria-label={c("refresh")} title={c("refresh")} className="active:scale-[0.98]">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button size="sm" variant="secondary" disabled={missing} onClick={() => setImportOpen(true)} className="active:scale-[0.98]">
            <FileUp className="h-4 w-4" /> {c("import")}
          </Button>
          <Button size="sm" variant="secondary" disabled={missing} onClick={() => setListsOpen(true)} className="active:scale-[0.98]">
            <ListChecks className="h-4 w-4" /> {c("lists")}
          </Button>
          <Button
            size="sm"
            variant="accent"
            disabled={missing}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            aria-keyshortcuts="n"
            className="active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" /> {c("add")}
            <kbd aria-hidden className="ml-1 hidden rounded border border-accent-on/30 px-1 font-mono text-[10px] leading-4 text-accent-on/80 sm:inline">N</kbd>
          </Button>
        </div>
      </header>

      {!isSupabaseConfigured && <SupabaseNotice />}
      {isSupabaseConfigured && error && <ErrorNotice message={error} />}
      {missing && (
        <div role="status" className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {c("missing")}
        </div>
      )}

      {!missing && (
        <>
          <StatusViews
            statuses={statuses}
            counts={statusCounts.m}
            total={beforeStatus.length}
            noneCount={statusCounts.none}
            value={filters.status ?? ""}
            onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
            allLabel={c("all")}
            noneLabel={c("noStatus")}
            groupLabel={c("statusViews")}
            locale={locale}
          />

          {/* Filter bar: search + pills, one line on desktop, wraps on small screens */}
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
            <label className="relative block w-full lg:w-72">
              <span className="sr-only">{c("search")}</span>
              <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-4" />
              <input
                ref={searchRef}
                aria-keyshortcuts="/"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={c("search")}
                className="h-8 w-full rounded-md border border-border bg-surface pl-8 pr-14 text-[13px] text-text placeholder:text-text-4 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label={c("clearSearch")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-text-4 hover:text-text"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <kbd aria-hidden title={c("kbdSearch")} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 font-mono text-[10.5px] leading-4 text-text-4">
                  /
                </kbd>
              )}
            </label>

            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {OPTION_FIELDS.filter((f) => f.field !== "status").map((f) => (
                <FilterPill
                  key={f.field}
                  label={f.label[language]}
                  value={filters[f.field] ?? ""}
                  options={[...optionsFor(options, f.field).map((o) => ({ value: o.id, label: o.label })), { value: NONE, label: c("none") }]}
                  onChange={(v) => setFilters((p) => ({ ...p, [f.field]: v }))}
                  clearLabel={c("clear")}
                  allLabel={c("all")}
                />
              ))}
              <FilterPill
                label={c("date")}
                value={preset}
                options={datePresetOptions}
                onChange={(v) => setPreset(v as DatePreset)}
                clearLabel={c("clear")}
                allLabel={c("all")}
              />
              {preset === "custom" && (
                <span className="inline-flex items-center gap-1 font-mono text-[12px] text-text-3">
                  <input
                    id="act-from"
                    type="date"
                    aria-label={c("from")}
                    value={customFrom}
                    max={customTo || undefined}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="h-7 rounded-md border border-border bg-surface px-2 text-[12px] text-text focus:border-accent focus:outline-none"
                  />
                  <span aria-hidden>-</span>
                  <input
                    id="act-to"
                    type="date"
                    aria-label={c("to")}
                    value={customTo}
                    min={customFrom || undefined}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="h-7 rounded-md border border-border bg-surface px-2 text-[12px] text-text focus:border-accent focus:outline-none"
                  />
                </span>
              )}
              {activeCount > 0 && (
                <button type="button" onClick={clearAll} className="h-7 whitespace-nowrap rounded-md px-2 text-[12px] font-medium text-text-3 hover:bg-surface-2 hover:text-text">
                  {c("clearAll")}
                </button>
              )}
            </div>

            <p className="shrink-0 whitespace-nowrap font-mono text-[11.5px] text-text-3" aria-live="polite">
              {c("activities", { n: fmt(filtered.length) })}
            </p>
          </div>

          <ActivityTable
            rows={filtered.slice(0, shown)}
            options={options}
            loading={loading}
            totalRecords={records.length}
            flashId={flashId}
            language={language}
            onOpen={(r) => {
              setEditing(r);
              setDialogOpen(true);
            }}
            onChangeOption={changeOption}
            onImport={() => setImportOpen(true)}
            onNew={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            onClearFilters={clearAll}
          />

          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[11.5px] text-text-3">{c("showing", { shown: fmt(Math.min(shown, filtered.length)), n: fmt(filtered.length) })}</p>
              {filtered.length > shown && (
                <Button variant="secondary" size="sm" onClick={() => setShown((s) => s + PAGE)} className="active:scale-[0.98]">
                  {c("more", { n: Math.min(PAGE, filtered.length - shown) })}
                </Button>
              )}
            </div>
          )}
        </>
      )}

      <ActivityDialog
        open={dialogOpen}
        record={editing}
        options={options}
        onClose={() => setDialogOpen(false)}
        onSaved={() => fetchRecords().catch((e) => setError(e.message))}
        onOptionCreated={(o) => setOptions((os) => [...os, o])}
      />
      <OptionsManager
        open={listsOpen}
        onClose={() => setListsOpen(false)}
        options={options}
        usage={usage}
        onChanged={() => fetchOptions().catch((e) => setError(e.message))}
      />
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} options={options} records={records} onImported={load} />
    </div>
  );
}
