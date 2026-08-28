"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Field, Label, Select, Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";
import { parseWeeklySheet, type WeeklyReportRow } from "@/lib/financingWeekly";

const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function WeeklyReportImportDialog({
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
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<WeeklyReportRow[]>([]);
  const [matched, setMatched] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  async function handleFile(file: File) {
    setParseError(null);
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: false });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const aoa = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
      const { rows, matched, error } = parseWeeklySheet(aoa, {
        period_label: MONTH_LABELS[month - 1],
        year,
        month,
      });
      if (error) {
        setParseError(error);
        setRows([]);
        return;
      }
      setRows(rows);
      setMatched(matched);
    } catch (err: any) {
      setParseError(err?.message ?? "Failed to parse file.");
      setRows([]);
    }
  }

  // Re-stamp period metadata onto parsed rows if month/year changed after parse
  function withMeta(list: WeeklyReportRow[]): WeeklyReportRow[] {
    return list.map((r) => ({ ...r, period_label: MONTH_LABELS[month - 1], year, month }));
  }

  async function handleImport() {
    if (rows.length === 0) return;
    setImporting(true);
    setParseError(null);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const payload = withMeta(rows).map((r) => ({
        ...r,
        source_file: fileName,
        imported_by: userData.user?.email ?? null,
      }));
      // Upsert on (year, month, week_no) so re-importing a period overwrites it
      const { error } = await supabase
        .from("financing_weekly_reports")
        .upsert(payload, { onConflict: "year,month,week_no" });
      if (error) throw error;
      toast.success(t("fwimport_success"));
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
    setMatched(0);
    setParseError(null);
  }

  const months = language === "id" ? MONTHS_ID : MONTHS_EN;

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={t("fwimport_title")}
      description={t("fwimport_desc")}
      width="max-w-3xl"
    >
      <div className="mb-4 grid grid-cols-2 gap-4">
        <Field className="mb-0">
          <Label>{t("fwimport_month")}</Label>
          <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
        <Field className="mb-0">
          <Label>{t("fwimport_year")}</Label>
          <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </Field>
      </div>

      <div className="mb-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
        <FileSpreadsheet className="mx-auto mb-2 h-8 w-8 text-accent" />
        <label className="cursor-pointer text-sm font-semibold text-accent hover:underline">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {language === "id" ? "Klik untuk pilih file Excel" : "Click to select Excel file"}
        </label>
        {fileName && <p className="mt-2 text-xs font-semibold text-slate-700">File: {fileName}</p>}
      </div>

      {parseError && (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs text-status-danger">
          {parseError}
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> {matched} {t("fwimport_matched")} · {rows.length}{" "}
            {language === "id" ? "minggu" : "weeks"}
          </div>
          <div className="scrollbar-thin mb-4 max-h-64 overflow-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="px-3 py-2.5 font-bold text-slate-700">{language === "id" ? "Minggu" : "Week"}</th>
                  <th className="px-3 py-2.5 text-right font-bold text-slate-700">B / C</th>
                  <th className="px-3 py-2.5 text-right font-bold text-slate-700">D</th>
                  <th className="px-3 py-2.5 text-right font-bold text-slate-700">{t("fl_col_amount")}</th>
                  <th className="px-3 py-2.5 text-right font-bold text-slate-700">Net Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.week_no}>
                    <td className="px-3 py-2 font-semibold">W{r.week_no}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {r.application_completed} / {r.total_attempts}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{r.new_loan}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatRupiah(r.disbursed_amount)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatRupiah(r.net_fee ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button type="button" variant="accent" onClick={handleImport} loading={importing} disabled={rows.length === 0}>
          <Upload className="h-4 w-4" /> {t("fwimport_confirm")}
        </Button>
      </div>
    </Dialog>
  );
}
