"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FileUp, ListChecks, Plus, RefreshCw } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupabaseNotice, ErrorNotice } from "@/components/shared/SupabaseNotice";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { isEventTypeColor } from "@/lib/calendar-event-types";
import {
  OPTION_FIELDS,
  isMissingActivityTables,
  optionsFor,
  type ActivityOption,
  type ActivityRecord,
  type OptionColumn,
} from "@/lib/activity";
import { OptionChipSelect, chip } from "@/components/activity/options";
import { ActivityDialog } from "@/components/activity/ActivityDialog";
import { OptionsManager } from "@/components/activity/OptionsManager";
import { ImportDialog } from "@/components/activity/ImportDialog";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";

const PAGE = 100;
const FETCH = 1000;
const NONE = "__none__";

const COPY = {
  desc: {
    id: "Catatan aktivitas tim per toko: sumber data, scope, produk, status dan flagging support. Ubah chip langsung di baris.",
    en: "The team's activity per store: data source, scope, product, status and support flag. Change a chip right in the row.",
  },
  add: { id: "Aktivitas baru", en: "New activity" },
  import: { id: "Impor", en: "Import" },
  lists: { id: "Kelola daftar", en: "Edit lists" },
  refresh: { id: "Muat ulang", en: "Reload" },
  search: { id: "Cari toko, telepon, catatan…", en: "Search store, phone, notes…" },
  from: { id: "Dari", en: "From" },
  to: { id: "Sampai", en: "To" },
  none: { id: "(kosong)", en: "(empty)" },
  count: { id: "{n} aktivitas", en: "{n} activities" },
  of: { id: "dari {n}", en: "of {n}" },
  more: { id: "Tampilkan {n} lagi", en: "Show {n} more" },
  date: { id: "TGL", en: "Date" },
  store: { id: "Nama Toko", en: "Store" },
  phone: { id: "No Telp", en: "Phone" },
  notes: { id: "Catatan", en: "Notes" },
  empty: { id: "Belum ada aktivitas. Tambah satu atau impor dari sheet tim.", en: "No activity yet. Add one or import the team sheet." },
  noMatch: { id: "Tidak ada aktivitas yang cocok dengan filter.", en: "No activity matches these filters." },
  loading: { id: "Memuat…", en: "Loading…" },
  missing: {
    id: "Menu ini belum aktif: tabel database activity_options dan activity_records belum dibuat (supabase/migrations/20261026_activity_record.sql).",
    en: "This menu isn't switched on yet: the activity_options and activity_records tables haven't been created (supabase/migrations/20261026_activity_record.sql).",
  },
  saveError: { id: "Gagal menyimpan", en: "Couldn't save" },
  clear: { id: "Hapus filter", en: "Clear filters" },
  openUrl: { id: "Buka URL toko", en: "Open store URL" },
};

function fmtDate(iso: string | null, language: "id" | "en") {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const sameYear = y === new Date().getFullYear();
  return dt.toLocaleDateString(language === "id" ? "id-ID" : "en-GB", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
}

function safeHref(url: string) {
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return `https://${u}`;
  return null; // never render javascript:, data: etc. as links
}

export default function ActivityRecordPage() {
  const { language } = useLanguage();
  const toast = useToast();
  const c = (k: keyof typeof COPY, vars: Record<string, string | number> = {}) =>
    Object.entries(vars).reduce((s, [k2, v]) => s.replace(`{${k2}}`, String(v)), COPY[k][language]);

  const [options, setOptions] = useState<ActivityOption[]>([]);
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [shown, setShown] = useState(PAGE);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityRecord | null>(null);
  const [listsOpen, setListsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  async function fetchOptions() {
    const { data, error: err } = await createClient()
      .from("activity_options")
      .select("id, field, label, color, sort")
      .order("sort", { ascending: true });
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
        .select(
          "id, activity_date, store_name, phone, store_url, subs_id, source_id, scope_id, product_id, status_id, flagging_id, notes, created_by, created_at, updated_at"
        )
        .order("activity_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: true })
        .range(from, from + FETCH - 1);
      if (err) throw err;
      all.push(...((data ?? []) as ActivityRecord[]));
      if (!data || data.length < FETCH) break;
    }
    setRecords(all);
  }

  async function load() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
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

  const usage = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of records)
      for (const f of OPTION_FIELDS) {
        const id = r[f.column];
        if (id) m.set(id, (m.get(id) ?? 0) + 1);
      }
    return m;
  }, [records]);

  const optionById = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (q) {
        const hay = [r.store_name, r.phone, r.notes, r.store_url].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      for (const f of OPTION_FIELDS) {
        const want = filters[f.field];
        if (!want) continue;
        if (want === NONE ? r[f.column] !== null : r[f.column] !== want) return false;
      }
      if (dateFrom && (!r.activity_date || r.activity_date < dateFrom)) return false;
      if (dateTo && (!r.activity_date || r.activity_date > dateTo)) return false;
      return true;
    });
  }, [records, search, filters, dateFrom, dateTo]);

  useEffect(() => setShown(PAGE), [search, filters, dateFrom, dateTo]);

  // Breakdown by status for the filtered rows (most used first).
  const statusSummary = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of filtered) if (r.status_id) m.set(r.status_id, (m.get(r.status_id) ?? 0) + 1);
    return [...m.entries()]
      .map(([id, n]) => ({ o: optionById.get(id), n }))
      .filter((x) => x.o)
      .sort((a, b) => b.n - a.n)
      .slice(0, 6);
  }, [filtered, optionById]);

  async function changeOption(row: ActivityRecord, column: OptionColumn, id: string | null) {
    const before = row[column];
    if (before === id) return;
    setRecords((rs) => rs.map((r) => (r.id === row.id ? { ...r, [column]: id } : r)));
    const { error: err } = await createClient().from("activity_records").update({ [column]: id }).eq("id", row.id);
    if (err) {
      setRecords((rs) => rs.map((r) => (r.id === row.id ? { ...r, [column]: before } : r)));
      toast.error(`${COPY.saveError[language]}: ${err.message}`);
    }
  }

  const anyFilter = !!search || Object.values(filters).some(Boolean) || !!dateFrom || !!dateTo;

  const columns: ColumnDef<ActivityRecord>[] = [
    {
      key: "activity_date",
      label: COPY.date[language],
      render: (r) => <span className="num whitespace-nowrap text-text-2">{fmtDate(r.activity_date, language)}</span>,
    },
    {
      key: "store_name",
      label: COPY.store[language],
      render: (r) => {
        const href = r.store_url ? safeHref(r.store_url) : null;
        return (
          <span className="flex min-w-[180px] max-w-[260px] items-center gap-1.5">
            <span className="truncate font-medium text-text" title={r.store_name}>
              {r.store_name}
            </span>
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label={`${COPY.openUrl[language]}: ${r.store_name}`}
                title={r.store_url ?? ""}
                className="shrink-0 rounded p-0.5 text-text-4 hover:text-accent"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </span>
        );
      },
    },
    { key: "phone", label: COPY.phone[language], render: (r) => <span className="num whitespace-nowrap text-text-2">{r.phone}</span> },
    ...OPTION_FIELDS.map<ColumnDef<ActivityRecord>>((f) => ({
      key: f.column,
      label: f.label[language],
      render: (r) => (
        <OptionChipSelect
          label={`${f.label[language]}: ${r.store_name}`}
          value={r[f.column]}
          options={optionsFor(options, f.field)}
          onChange={(id) => changeOption(r, f.column, id)}
        />
      ),
    })),
    {
      key: "notes",
      label: COPY.notes[language],
      render: (r) => (
        <span className="block max-w-[240px] truncate text-text-2" title={r.notes ?? ""}>
          {r.notes}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={language === "id" ? "Catatan Aktivitas" : "Activity Record"}
        description={COPY.desc[language]}
        action={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={load} aria-label={COPY.refresh[language]} title={COPY.refresh[language]}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" disabled={missing} onClick={() => setImportOpen(true)}>
              <FileUp className="h-4 w-4" /> {COPY.import[language]}
            </Button>
            <Button size="sm" variant="secondary" disabled={missing} onClick={() => setListsOpen(true)}>
              <ListChecks className="h-4 w-4" /> {COPY.lists[language]}
            </Button>
            <Button
              size="sm"
              variant="accent"
              disabled={missing}
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> {COPY.add[language]}
            </Button>
          </div>
        }
      />

      {!isSupabaseConfigured && <SupabaseNotice />}
      {isSupabaseConfigured && error && <ErrorNotice message={error} />}
      {missing && (
        <div role="status" className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {COPY.missing[language]}
        </div>
      )}

      {!missing && (
        <>
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={COPY.search[language]}
            filters={OPTION_FIELDS.map((f) => ({
              key: f.field,
              label: f.label[language],
              options: [...optionsFor(options, f.field).map((o) => ({ value: o.id, label: o.label })), { value: NONE, label: COPY.none[language] }],
            }))}
            filterValues={filters}
            onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
          />

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <Label htmlFor="act-from">{COPY.from[language]}</Label>
                <Input id="act-from" type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
              </div>
              <div>
                <Label htmlFor="act-to">{COPY.to[language]}</Label>
                <Input id="act-to" type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
              </div>
              {anyFilter && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setFilters({});
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  {COPY.clear[language]}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-3" aria-live="polite">
              <span className="text-sm font-medium text-text">
                {c("count", { n: filtered.length.toLocaleString(language === "id" ? "id-ID" : "en-US") })}
              </span>
              {anyFilter && <span>{c("of", { n: records.length.toLocaleString(language === "id" ? "id-ID" : "en-US") })}</span>}
              {statusSummary.map(({ o, n }) => (
                <span key={o!.id} className={cn("rounded-md px-1.5 py-0.5 font-semibold", chip(o!.color))}>
                  {o!.label} <span className="num">{n}</span>
                </span>
              ))}
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={filtered.slice(0, shown)}
            emptyText={loading ? COPY.loading[language] : records.length === 0 ? COPY.empty[language] : COPY.noMatch[language]}
            onRowClick={(row) => {
              setEditing(row);
              setDialogOpen(true);
            }}
          />

          {filtered.length > shown && (
            <div className="flex justify-center">
              <Button variant="secondary" size="sm" onClick={() => setShown((s) => s + PAGE)}>
                {c("more", { n: Math.min(PAGE, filtered.length - shown) })}
              </Button>
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
