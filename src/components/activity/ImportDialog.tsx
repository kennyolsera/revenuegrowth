"use client";

import { useEffect, useMemo, useState } from "react";
import { FileXls as FileSpreadsheet, CloudArrowUp as UploadCloud } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Input";
import {
  OPTION_FIELDS,
  draftToRow,
  matchHeaders,
  optionsFor,
  planImport,
  type ActivityOption,
  type ActivityRecord,
  type ImportKey,
  type ImportPlan,
} from "@/lib/activity";
import { chip } from "@/components/activity/options";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";

const BATCH = 500;
const MAX_BYTES = 10 * 1024 * 1024;

const COPY = {
  title: { id: "Impor dari Excel / CSV", en: "Import from Excel / CSV" },
  desc: {
    id: "Kolom dicocokkan dari judul baris pertama (TGL, NAMA TOKO, NO TELP, URL TOKO, SUBS, SUMBER DATA, Scope, Product, STATUS, Notes, Flagging Support).",
    en: "Columns are matched by the first row's headers (TGL, NAMA TOKO, NO TELP, URL TOKO, SUBS, SUMBER DATA, Scope, Product, STATUS, Notes, Flagging Support).",
  },
  file: { id: "File (.xlsx, .xls, .csv, maks 10 MB)", en: "File (.xlsx, .xls, .csv, up to 10 MB)" },
  sheet: { id: "Sheet", en: "Sheet" },
  reading: { id: "Membaca file…", en: "Reading the file…" },
  tooBig: { id: "File melebihi 10 MB.", en: "The file is over 10 MB." },
  unreadable: { id: "File tidak bisa dibaca.", en: "The file couldn't be read." },
  noStore: {
    id: "Kolom NAMA TOKO tidak ditemukan di baris pertama sheet ini.",
    en: "No NAMA TOKO column found in this sheet's first row.",
  },
  toAdd: { id: "baris akan ditambahkan", en: "rows will be added" },
  dupes: { id: "sudah ada, dilewati", en: "already in the app, skipped" },
  problems: { id: "catatan", en: "notes" },
  unmatched: { id: "Kolom tidak dikenali (diabaikan): ", en: "Columns not recognised (ignored): " },
  missing: { id: "Kolom tidak ada di file: ", en: "Columns not in the file: " },
  newOpts: { id: "Opsi baru yang akan dibuat (abu-abu, warnanya bisa diubah nanti)", en: "New options to be created (gray, recolour later)" },
  row: { id: "Baris", en: "Row" },
  more: { id: "dan {n} lainnya", en: "and {n} more" },
  import: { id: "Impor {n} baris", en: "Import {n} rows" },
  nothing: { id: "Tidak ada baris baru untuk diimpor.", en: "No new rows to import." },
  cancel: { id: "Batal", en: "Cancel" },
  close: { id: "Tutup", en: "Close" },
  progress: { id: "Menyimpan {done} / {total}…", en: "Saving {done} / {total}…" },
  done: { id: "{n} baris diimpor", en: "{n} rows imported" },
  partial: {
    id: "{done} dari {total} baris tersimpan, lalu gagal: {err}. Impor ulang file yang sama untuk melanjutkan; baris yang sudah masuk akan dilewati.",
    en: "{done} of {total} rows saved, then it failed: {err}. Import the same file again to continue; rows already saved are skipped.",
  },
};

const FIELD_NAMES: Record<ImportKey, string> = {
  activity_date: "TGL",
  store_name: "NAMA TOKO",
  phone: "NO TELP",
  store_url: "URL TOKO",
  subs: "SUBS",
  source: "SUMBER DATA",
  scope: "Scope",
  product: "Product",
  status: "STATUS",
  notes: "Notes",
  flagging: "Flagging Support",
};

type Parsed = { sheets: string[]; rowsBySheet: Record<string, Record<string, unknown>[]>; headersBySheet: Record<string, string[]> };

export function ImportDialog({
  open,
  onClose,
  options,
  records,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  options: ActivityOption[];
  records: ActivityRecord[];
  onImported: () => Promise<void> | void;
}) {
  const { language } = useLanguage();
  const toast = useToast();
  const t = (k: keyof typeof COPY, vars: Record<string, string | number> = {}) =>
    Object.entries(vars).reduce((s, [k2, v]) => s.replace(`{${k2}}`, String(v)), COPY[k][language]);

  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [sheet, setSheet] = useState("");
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFileName("");
    setParsed(null);
    setSheet("");
    setError(null);
    setProgress(null);
  }, [open]);

  async function onFile(f: File | undefined) {
    setError(null);
    setParsed(null);
    if (!f) return;
    if (f.size > MAX_BYTES) return setError(COPY.tooBig[language]);
    setFileName(f.name);
    setReading(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await f.arrayBuffer(), { type: "array", cellDates: true });
      const rowsBySheet: Parsed["rowsBySheet"] = {};
      const headersBySheet: Parsed["headersBySheet"] = {};
      for (const name of wb.SheetNames) {
        const ws = wb.Sheets[name];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "", raw: true });
        rowsBySheet[name] = rows;
        const head = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, range: 0 })[0] ?? [];
        headersBySheet[name] = head.map((h) => String(h ?? "").trim()).filter(Boolean);
      }
      // Default to the first sheet that has a store-name column.
      const best = wb.SheetNames.find((n) => Object.values(matchHeaders(headersBySheet[n]).map).includes("store_name")) ?? wb.SheetNames[0];
      setParsed({ sheets: wb.SheetNames, rowsBySheet, headersBySheet });
      setSheet(best);
    } catch {
      setError(COPY.unreadable[language]);
    } finally {
      setReading(false);
    }
  }

  const headers = useMemo(() => (parsed && sheet ? parsed.headersBySheet[sheet] : []), [parsed, sheet]);
  const match = useMemo(() => matchHeaders(headers), [headers]);
  const hasStore = Object.values(match.map).includes("store_name");
  const plan: ImportPlan | null = useMemo(
    () => (parsed && sheet && hasStore ? planImport(parsed.rowsBySheet[sheet], match.map, options, records) : null),
    [parsed, sheet, hasStore, match, options, records]
  );
  const unmatched = headers.filter((h) => !match.map[h]);

  async function runImport() {
    if (!plan || plan.drafts.length === 0) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    let all = options;
    // 1) New options first, appended to the end of each list.
    if (plan.newOptions.length) {
      const next: Record<string, number> = {};
      const rows = plan.newOptions.map((o) => {
        const base = next[o.field] ?? Math.max(0, ...optionsFor(all, o.field).map((x) => x.sort));
        next[o.field] = base + 10;
        return { field: o.field, label: o.label, color: "gray", sort: base + 10 };
      });
      const { data, error: err } = await supabase.from("activity_options").insert(rows).select("id, field, label, color, sort");
      if (err) {
        setSaving(false);
        return setError(err.message);
      }
      all = [...all, ...((data ?? []) as ActivityOption[])];
    }
    // 2) Rows in batches.
    const email = (await supabase.auth.getUser()).data.user?.email ?? null;
    const rows = plan.drafts.map((d) => ({ ...draftToRow(d, all), created_by: email }));
    let done = 0;
    for (let i = 0; i < rows.length; i += BATCH) {
      setProgress(t("progress", { done, total: rows.length }));
      const { error: err } = await supabase.from("activity_records").insert(rows.slice(i, i + BATCH));
      if (err) {
        setSaving(false);
        setProgress(null);
        setError(t("partial", { done, total: rows.length, err: err.message }));
        await onImported();
        return;
      }
      done += Math.min(BATCH, rows.length - i);
    }
    setSaving(false);
    setProgress(null);
    toast.success(t("done", { n: done }));
    await onImported();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title={COPY.title[language]} description={COPY.desc[language]} width="max-w-2xl">
      <div className="space-y-4">
        <div>
          <Label htmlFor="act-import-file">{COPY.file[language]}</Label>
          <label
            htmlFor="act-import-file"
            className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border-strong bg-surface-2 px-4 py-3 text-sm text-text-2 hover:border-accent"
          >
            {fileName ? <FileSpreadsheet className="h-4 w-4 text-accent" /> : <UploadCloud className="h-4 w-4 text-text-3" />}
            <span className="truncate">{fileName || (language === "id" ? "Pilih file…" : "Choose a file…")}</span>
          </label>
          <input
            id="act-import-file"
            type="file"
            accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>

        {reading && <p className="text-sm text-text-3">{COPY.reading[language]}</p>}

        {parsed && parsed.sheets.length > 1 && (
          <div>
            <Label htmlFor="act-import-sheet">{COPY.sheet[language]}</Label>
            <Select id="act-import-sheet" value={sheet} onChange={(e) => setSheet(e.target.value)}>
              {parsed.sheets.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        )}

        {parsed && !hasStore && (
          <p role="alert" className="text-sm text-red">
            {COPY.noStore[language]}
          </p>
        )}

        {plan && (
          <div className="space-y-3 rounded-md border border-border p-3 text-sm" aria-live="polite">
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              <span>
                <strong className="num text-text">{plan.drafts.length}</strong> {COPY.toAdd[language]}
              </span>
              <span className="text-text-3">
                <strong className="num">{plan.duplicates}</strong> {COPY.dupes[language]}
              </span>
              {plan.problems.length > 0 && (
                <span className="text-amber">
                  <strong className="num">{plan.problems.length}</strong> {COPY.problems[language]}
                </span>
              )}
            </div>
            {match.missing.length > 0 && (
              <p className="text-xs text-text-3">
                {COPY.missing[language]}
                {match.missing.map((k) => FIELD_NAMES[k]).join(", ")}
              </p>
            )}
            {unmatched.length > 0 && (
              <p className="text-xs text-text-3">
                {COPY.unmatched[language]}
                {unmatched.join(", ")}
              </p>
            )}
            {plan.newOptions.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-text-2">{COPY.newOpts[language]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {plan.newOptions.map((o) => (
                    <span key={`${o.field}|${o.label}`} className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", chip("gray"))}>
                      <span className="font-normal opacity-70">{OPTION_FIELDS.find((f) => f.field === o.field)?.label[language]}: </span>
                      {o.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {plan.problems.length > 0 && (
              <ul className="max-h-32 space-y-0.5 overflow-auto text-xs text-text-2">
                {plan.problems.slice(0, 20).map((p, i) => (
                  <li key={i}>
                    {COPY.row[language]} {p.row}: {p.message[language]}
                  </li>
                ))}
                {plan.problems.length > 20 && <li>{t("more", { n: plan.problems.length - 20 })}</li>}
              </ul>
            )}
            {plan.drafts.length === 0 && <p className="text-text-3">{COPY.nothing[language]}</p>}
          </div>
        )}

        {progress && <p className="text-sm text-text-2">{progress}</p>}
        {error && (
          <p role="alert" className="text-sm text-red">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-divider pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {plan ? COPY.cancel[language] : COPY.close[language]}
          </Button>
          <Button type="button" variant="accent" loading={saving} disabled={!plan || plan.drafts.length === 0} onClick={runImport}>
            {t("import", { n: plan?.drafts.length ?? 0 })}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
