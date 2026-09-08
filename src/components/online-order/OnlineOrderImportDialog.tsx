"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Download } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatRupiah } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";
import { OO_FIELDS, OO_HEADER_MAP, normHeader, parseNumber } from "@/lib/onlineOrderFields";

interface ParsedRow {
  values: Record<string, any>;
  error: string | null;
}

function excelDateToISO(value: any): string | null {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value === "number") {
    const d = XLSX.SSF.parse_date_code(value);
    if (!d) return null;
    return new Date(Date.UTC(d.y, d.m - 1, d.d)).toISOString().slice(0, 10);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export function OnlineOrderImportDialog({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}) {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  async function handleFile(file: File) {
    setParseError(null);
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: false });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
      if (json.length === 0) {
        setParseError(language === "id" ? "File tidak berisi baris data." : "File has no data rows.");
        setRows([]);
        return;
      }

      const parsed: ParsedRow[] = json.map((raw) => {
        // Re-key by normalized header → canonical field key
        const byField: Record<string, any> = {};
        for (const [k, val] of Object.entries(raw)) {
          const field = OO_HEADER_MAP[normHeader(k)];
          if (field) byField[field] = val;
        }
        const values: Record<string, any> = {};
        for (const f of OO_FIELDS) {
          const cell = byField[f.key];
          if (f.kind === "text") {
            const s = String(cell ?? "").trim();
            values[f.key] = s === "" ? null : s;
          } else if (f.kind === "date") {
            values[f.key] = excelDateToISO(cell);
          } else {
            values[f.key] = parseNumber(cell);
          }
        }
        return {
          values,
          error: values.store ? null : language === "id" ? "Store kosong" : "Store is empty",
        };
      });
      setRows(parsed);
    } catch (err: any) {
      setParseError(err?.message ?? (language === "id" ? "Gagal membaca file." : "Failed to parse file."));
      setRows([]);
    }
  }

  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  async function handleImport() {
    if (validRows.length === 0) return;
    setImporting(true);
    setParseError(null);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const payload = validRows.map((r) => ({
        ...r.values,
        source_file: fileName,
        imported_by: userData.user?.email ?? null,
      }));
      const { error } = await supabase.from("online_order_reports").insert(payload);
      if (error) throw error;
      toast.success(t("ooimport_success"));
      reset();
      onImported();
      onClose();
    } catch (err: any) {
      setParseError(err?.message ?? "Failed to import.");
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setFileName(null);
    setRows([]);
    setParseError(null);
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={t("ooimport_title")}
      description={t("ooimport_desc")}
      width="max-w-3xl"
    >
      <a
        href="/templates/online-order-template.csv"
        download
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
      >
        <Download className="h-3.5 w-3.5" /> {t("qimport_download")}
      </a>

      <div className="mb-4 rounded-xl border-2 border-dashed border-surface-border bg-surface-canvas p-6 text-center">
        <FileSpreadsheet className="mx-auto mb-2 h-8 w-8 text-accent" />
        <label className="cursor-pointer text-sm font-semibold text-accent hover:underline">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {language === "id" ? "Klik untuk pilih file Excel / CSV" : "Click to select Excel / CSV file"}
        </label>
        {fileName && <p className="mt-2 text-xs font-semibold text-ink-body">File: {fileName}</p>}
      </div>

      {parseError && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs text-status-danger">{parseError}</p>
      )}

      {rows.length > 0 && (
        <>
          <div className="mb-3 flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> {validRows.length} {language === "id" ? "baris valid" : "valid rows"}
            </span>
            {invalidRows.length > 0 && (
              <span className="flex items-center gap-1.5 text-rose-600">
                <XCircle className="h-4 w-4" /> {invalidRows.length} {language === "id" ? "gagal" : "invalid"}
              </span>
            )}
          </div>
          <div className="scrollbar-thin mb-4 max-h-64 overflow-auto rounded-lg border border-surface-border">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-surface-canvas">
                <tr>
                  <th className="px-3 py-2.5 font-bold text-ink-body">Store</th>
                  <th className="px-3 py-2.5 font-bold text-ink-body">Last Trans</th>
                  <th className="px-3 py-2.5 text-right font-bold text-ink-body">Total Online</th>
                  <th className="px-3 py-2.5 text-right font-bold text-ink-body">Total Fee</th>
                  <th className="px-3 py-2.5 font-bold text-ink-body">{language === "id" ? "Keterangan" : "Note"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {rows.map((r, i) => (
                  <tr key={i} className={r.error ? "bg-red-50/50" : "bg-surface"}>
                    <td className="px-3 py-2 font-medium">{r.values.store || "-"}</td>
                    <td className="px-3 py-2 font-mono">{r.values.last_trans_date ? formatDate(r.values.last_trans_date) : "-"}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.values.total_online_order != null ? formatRupiah(r.values.total_online_order) : "-"}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.values.total_fee != null ? formatRupiah(r.values.total_fee) : "-"}</td>
                    <td className="px-3 py-2">
                      {r.error ? (
                        <span className="font-medium text-rose-600">{r.error}</span>
                      ) : (
                        <span className="font-medium text-emerald-600">{language === "id" ? "Siap" : "Ready"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2.5 border-t border-surface-border pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button type="button" variant="accent" onClick={handleImport} loading={importing} disabled={validRows.length === 0}>
          <Upload className="h-4 w-4" /> {language === "id" ? `Import ${validRows.length || ""}` : `Import ${validRows.length || ""}`}
        </Button>
      </div>
    </Dialog>
  );
}
