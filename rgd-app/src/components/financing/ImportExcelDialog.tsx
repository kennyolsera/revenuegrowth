"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

interface ParsedRow {
  merchant_name: string;
  merchant_id: string | null;
  loan_amount: number | null;
  disbursed_at: string | null;
  revenue_before: number | null;
  revenue_after: number | null;
  status: string;
  error: string | null;
}

const REQUIRED_COLUMNS = ["Nama Merchant", "Nominal Pembiayaan", "Tanggal Pencairan"];

export function ImportExcelDialog({ open, onClose, onImported }: { open: boolean; onClose: () => void; onImported: () => void }) {
  const { t, language } = useLanguage();
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  function excelDateToISO(value: any): string | null {
    if (!value) return null;
    if (typeof value === "number") {
      const d = XLSX.SSF.parse_date_code(value);
      if (!d) return null;
      return new Date(Date.UTC(d.y, d.m - 1, d.d)).toISOString();
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  async function handleFile(file: File) {
    setParsing(true);
    setParseError(null);
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: false });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

      if (json.length === 0) {
        setParseError(language === "id" ? "File tidak berisi baris data." : "File does not contain data rows.");
        setRows([]);
        setParsing(false);
        return;
      }

      const headerKeys = Object.keys(json[0]);
      const missing = REQUIRED_COLUMNS.filter((c) => !headerKeys.includes(c));
      if (missing.length > 0) {
        setParseError(
          language === "id"
            ? `Kolom wajib tidak ditemukan: ${missing.join(", ")}. Gunakan template yang disediakan.`
            : `Required columns missing: ${missing.join(", ")}.`
        );
        setRows([]);
        setParsing(false);
        return;
      }

      const supabase = createClient();
      const { data: merchants } = await supabase.from("merchants").select("id, name");
      const merchantMap = new Map((merchants ?? []).map((m: any) => [m.name.trim().toLowerCase(), m.id]));

      const parsed: ParsedRow[] = json.map((r) => {
        const name = String(r["Nama Merchant"] ?? "").trim();
        const amount = Number(r["Nominal Pembiayaan"]);
        const merchantId = merchantMap.get(name.toLowerCase()) ?? null;

        let error: string | null = null;
        if (!name) error = language === "id" ? "Nama merchant kosong" : "Merchant name is empty";
        else if (!merchantId) error = language === "id" ? "Merchant tidak ditemukan di master data" : "Merchant not found in master list";
        else if (!amount || Number.isNaN(amount)) error = language === "id" ? "Nominal pembiayaan tidak valid" : "Invalid loan amount";

        return {
          merchant_name: name,
          merchant_id: merchantId,
          loan_amount: Number.isNaN(amount) ? null : amount,
          disbursed_at: excelDateToISO(r["Tanggal Pencairan"]),
          revenue_before: r["Omzet Sebelum"] ? Number(r["Omzet Sebelum"]) : null,
          revenue_after: r["Omzet Sesudah"] ? Number(r["Omzet Sesudah"]) : null,
          status: String(r["Status"] ?? "diajukan").trim().toLowerCase() || "diajukan",
          error,
        };
      });

      setRows(parsed);
    } catch (err: any) {
      setParseError(err?.message ?? (language === "id" ? "Gagal membaca file." : "Failed to parse file."));
    } finally {
      setParsing(false);
    }
  }

  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  async function handleConfirmImport() {
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      const { data: batch, error: batchError } = await supabase
        .from("import_batches")
        .insert({
          file_name: fileName,
          uploaded_by: userData.user?.email ?? null,
          row_count: validRows.length,
          status: "selesai",
        })
        .select()
        .single();
      if (batchError) throw batchError;

      const payload = validRows.map((r) => ({
        merchant_id: r.merchant_id,
        loan_amount: r.loan_amount,
        disbursed_at: r.disbursed_at,
        revenue_before: r.revenue_before,
        revenue_after: r.revenue_after,
        status: r.status,
        import_batch_id: batch?.id ?? null,
      }));

      const { error: insertError } = await supabase.from("financing_loans").insert(payload);
      if (insertError) throw insertError;

      resetState();
      onImported();
      onClose();
    } catch (err: any) {
      setParseError(err?.message ?? "Failed to import data.");
    } finally {
      setImporting(false);
    }
  }

  function resetState() {
    setFileName(null);
    setRows([]);
    setParseError(null);
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        resetState();
        onClose();
      }}
      title={language === "id" ? "Import Data Financing Loan" : "Import Financing Loan Data"}
      description={
        language === "id"
          ? "Unggah file Excel/CSV sesuai template kolom yang telah ditentukan."
          : "Upload an Excel/CSV file following the required column format."
      }
      width="max-w-3xl"
    >
      <div className="mb-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
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
        <p className="mt-1.5 text-xs text-slate-500">
          {language === "id"
            ? `Kolom wajib: ${REQUIRED_COLUMNS.join(", ")}. Opsional: Omzet Sebelum, Omzet Sesudah, Status.`
            : `Required: ${REQUIRED_COLUMNS.join(", ")}. Optional: Revenue Before, Revenue After, Status.`}
        </p>
        {fileName && <p className="mt-2 text-xs font-semibold text-slate-700">File: {fileName}</p>}
      </div>

      {parsing && <p className="text-sm text-slate-500">{t("loading")}</p>}
      {parseError && <p className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs text-status-danger">{parseError}</p>}

      {rows.length > 0 && (
        <>
          <div className="mb-3 flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> {validRows.length} {language === "id" ? "baris valid" : "valid rows"}
            </span>
            {invalidRows.length > 0 && (
              <span className="flex items-center gap-1.5 text-rose-600">
                <XCircle className="h-4 w-4" /> {invalidRows.length} {language === "id" ? "gagal validasi" : "failed validation"}
              </span>
            )}
          </div>
          <div className="scrollbar-thin mb-4 max-h-64 overflow-y-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 font-bold text-slate-700">Merchant</th>
                  <th className="px-3 py-2.5 font-bold text-slate-700">{t("fl_col_amount")}</th>
                  <th className="px-3 py-2.5 font-bold text-slate-700">Status</th>
                  <th className="px-3 py-2.5 font-bold text-slate-700">{language === "id" ? "Keterangan" : "Status Note"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={i} className={r.error ? "bg-red-50/50" : "bg-white"}>
                    <td className="px-3 py-2 font-medium">{r.merchant_name || "-"}</td>
                    <td className="px-3 py-2 font-mono">{r.loan_amount ? formatRupiah(r.loan_amount) : "-"}</td>
                    <td className="px-3 py-2 capitalize">{r.status}</td>
                    <td className="px-3 py-2">
                      {r.error ? (
                        <span className="text-rose-600 font-medium">{r.error}</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">{language === "id" ? "Siap diimpor" : "Ready to import"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button type="button" variant="accent" onClick={handleConfirmImport} loading={importing} disabled={validRows.length === 0}>
          <Upload className="h-4 w-4" /> {language === "id" ? `Import ${validRows.length > 0 ? `${validRows.length} Baris` : ""}` : `Import ${validRows.length > 0 ? `${validRows.length} Rows` : ""}`}
        </Button>
      </div>
    </Dialog>
  );
}
