"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { UploadCloud, Download, CheckCircle2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupabaseNotice, ErrorNotice } from "@/components/shared/SupabaseNotice";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Label, Select } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

const BUCKET = "leads-raw";

export default function LeadsPage() {
  const { t, language } = useLanguage();

  const FEATURE_OPTIONS = [
    { value: "qris", label: "QRIS" },
    { value: "network_partner", label: "Network Partner" },
    { value: "online_order", label: "Online Order" },
    { value: "financing_loan", label: "Financing Loan" },
    { value: "umum", label: language === "id" ? "Umum" : "General" },
  ];

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [featureCategory, setFeatureCategory] = useState(FEATURE_OPTIONS[0].value);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function fetchRows() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("leads_raw_data").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setRows(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Error loading leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
  }, []);

  const filtered = rows.filter((r) => {
    const matchSearch = !search || r.file_name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !category || r.feature_category === category;
    return matchSearch && matchCategory;
  });

  async function countRows(f: File): Promise<number> {
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      return json.length;
    } catch {
      return 0;
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const path = `${featureCategory}/${Date.now()}-${file.name}`;

      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file);
      if (uploadErr) throw uploadErr;

      const rowCount = await countRows(file);

      const { error: insertErr } = await supabase.from("leads_raw_data").insert({
        feature_category: featureCategory,
        file_name: file.name,
        storage_path: path,
        uploaded_by: userData.user?.email ?? null,
        row_count: rowCount,
        status: "baru",
      });
      if (insertErr) throw insertErr;

      setUploadOpen(false);
      setFile(null);
      fetchRows();
    } catch (err: any) {
      setUploadError(err?.message ?? "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  }

  async function markProcessed(row: any) {
    const supabase = createClient();
    await supabase.from("leads_raw_data").update({ status: "diproses" }).eq("id", row.id);
    fetchRows();
  }

  async function handleDownload(row: any) {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(row.storage_path, 60);
    if (error || !data) {
      alert("Gagal membuat link unduhan.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  const columns: ColumnDef<any>[] = [
    { key: "file_name", label: t("leads_col_file") },
    {
      key: "feature_category",
      label: t("leads_col_category"),
      render: (r) => FEATURE_OPTIONS.find((f) => f.value === r.feature_category)?.label ?? r.feature_category,
    },
    { key: "row_count", label: t("leads_col_rows"), align: "right" },
    { key: "uploaded_by", label: t("leads_col_uploader") },
    { key: "status", label: t("leads_col_status"), render: (r) => <StatusBadge status={r.status} /> },
    { key: "created_at", label: t("leads_col_date"), render: (r) => formatDate(r.created_at, true) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("leads_title")}
        description={t("leads_desc")}
        action={
          <Button size="sm" variant="accent" onClick={() => setUploadOpen(true)}>
            <UploadCloud className="h-4 w-4" /> {t("leads_add")}
          </Button>
        }
      />

      {!isSupabaseConfigured && <SupabaseNotice />}
      {isSupabaseConfigured && error && <ErrorNotice message={error} />}

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={language === "id" ? "Cari nama file..." : "Search file name..."}
        filters={[{ key: "feature_category", label: t("leads_col_category"), options: FEATURE_OPTIONS }]}
        filterValues={{ feature_category: category }}
        onFilterChange={(_, v) => setCategory(v)}
      />

      <DataTable
        columns={columns}
        rows={filtered}
        emptyText={loading ? t("loading") : t("no_data")}
        actions={(row) => (
          <div className="flex justify-end gap-1">
            <button
              onClick={() => handleDownload(row)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-accent transition-colors"
              title={t("download")}
            >
              <Download className="h-4 w-4" />
            </button>
            {row.status !== "diproses" && (
              <button
                onClick={() => markProcessed(row)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-status-success transition-colors"
                title={language === "id" ? "Tandai Diproses" : "Mark Processed"}
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      />

      <Dialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title={language === "id" ? "Upload Data Leads Mentah" : "Upload Raw Leads Data"}
      >
        <form onSubmit={handleUpload}>
          <Field>
            <Label>{language === "id" ? "Kategori / Fitur Tujuan" : "Target Category / Feature"}</Label>
            <Select value={featureCategory} onChange={(e) => setFeatureCategory(e.target.value)}>
              {FEATURE_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label>{language === "id" ? "File Excel / CSV" : "Excel / CSV File"}</Label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 file:px-3.5 file:py-2.5 file:text-xs file:font-semibold file:text-accent hover:file:bg-blue-100 cursor-pointer"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              {language === "id" ? "Maksimum 10MB. Format .xlsx, .xls, atau .csv." : "Maximum 10MB. Formats: .xlsx, .xls, or .csv."}
            </p>
          </Field>

          {uploadError && <p className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-status-danger">{uploadError}</p>}

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="secondary" onClick={() => setUploadOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="accent" loading={uploading}>
              {t("upload")}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
