"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Download } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";

interface ParsedRow {
  qris_name: string;
  phone: string | null;
  mid: string | null;
  email: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  address: string | null;
  submitted_at: string | null;
  error: string | null;
}

/** Normalize a header cell → lowercase, single-spaced, no punctuation. */
function norm(s: any): string {
  return String(s ?? "").toLowerCase().replace(/[._]/g, " ").replace(/\s+/g, " ").trim();
}

/** Map of normalized header → target field. Tolerant of common variants. */
const HEADER_MAP: Record<string, keyof ParsedRow> = {
  "date": "submitted_at",
  "qris name": "qris_name",
  "name": "qris_name",
  "phone number": "phone",
  "phone": "phone",
  "mid": "mid",
  "email": "email",
  "bank name": "bank_name",
  "bank account number": "bank_account_number",
  "account number": "bank_account_number",
  "bank account holder": "bank_account_holder",
  "account holder": "bank_account_holder",
  "address": "address",
};

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

export function QrisImportDialog({
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
        // Re-key each row by normalized header → target field
        const v: Record<string, any> = {};
        for (const [key, val] of Object.entries(raw)) {
          const field = HEADER_MAP[norm(key)];
          if (field) v[field] = val;
        }
        const qris_name = String(v.qris_name ?? "").trim();
        const str = (x: any) => {
          const s = String(x ?? "").trim();
          return s === "" ? null : s;
        };
        const submitted_at = excelDateToISO(v.submitted_at);
        const dateProvided = String(v.submitted_at ?? "").trim() !== "";

        let error: string | null = null;
        if (!qris_name) error = language === "id" ? "Nama QRIS kosong" : "QRIS Name is empty";
        else if (!dateProvided) error = language === "id" ? "Tanggal kosong" : "Date is empty";
        else if (!submitted_at) error = language === "id" ? "Tanggal tidak valid" : "Invalid date";

        return {
          qris_name,
          phone: str(v.phone),
          mid: str(v.mid),
          email: str(v.email),
          bank_name: str(v.bank_name),
          bank_account_number: str(v.bank_account_number),
          bank_account_holder: str(v.bank_account_holder),
          address: str(v.address),
          submitted_at,
          error,
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
      // Valid rows are guaranteed a date (blank/invalid dates are rejected in
      // the preview). status & provider_id are never sent, so their defaults
      // apply cleanly.
      const payload = validRows.map((r) => ({
        qris_name: r.qris_name,
        phone: r.phone,
        mid: r.mid,
        email: r.email,
        bank_name: r.bank_name,
        bank_account_number: r.bank_account_number,
        bank_account_holder: r.bank_account_holder,
        address: r.address,
        submitted_at: r.submitted_at,
      }));
      const { error } = await supabase.from("qris_acquisitions").insert(payload);
      if (error) throw error;
      toast.success(t("qimport_success"));
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
      title={t("qimport_title")}
      description={t("qimport_desc")}
      width="max-w-3xl"
    >
      <a
        href="/templates/qris-import-template.csv"
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
        <p className="mt-1.5 text-xs text-ink-muted">
          {language === "id"
            ? "Kolom: Date, QRIS Name, Phone Number, MID, email, bank name, bank account number, bank account holder, address (opsional)."
            : "Columns: Date, QRIS Name, Phone Number, MID, email, bank name, bank account number, bank account holder, address (optional)."}
        </p>
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
                  <th className="px-3 py-2.5 font-bold text-ink-body">{t("qris_col_qris_name")}</th>
                  <th className="px-3 py-2.5 font-bold text-ink-body">{t("qris_col_mid")}</th>
                  <th className="px-3 py-2.5 font-bold text-ink-body">{t("qris_col_bank_name")}</th>
                  <th className="px-3 py-2.5 font-bold text-ink-body">{t("qris_col_date")}</th>
                  <th className="px-3 py-2.5 font-bold text-ink-body">{language === "id" ? "Keterangan" : "Note"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {rows.map((r, i) => (
                  <tr key={i} className={r.error ? "bg-red-50/50" : "bg-surface"}>
                    <td className="px-3 py-2 font-medium">{r.qris_name || "-"}</td>
                    <td className="px-3 py-2 font-mono">{r.mid ?? "-"}</td>
                    <td className="px-3 py-2">{r.bank_name ?? "-"}</td>
                    <td className="px-3 py-2 font-mono">{r.submitted_at ? formatDate(r.submitted_at) : "-"}</td>
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
