"use client";

import { useEffect, useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupabaseNotice, ErrorNotice } from "@/components/shared/SupabaseNotice";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { CurrencyInput, Field, Input, Label, Select, Textarea } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { useMerchantOptions } from "@/lib/hooks/useMerchantOptions";
import { MerchantSelectField, resolveMerchantId } from "@/components/shared/MerchantSelectField";
import { formatDate, formatRupiah } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";

const FEATURE_OPTIONS = ["QRIS", "Network Partner", "Online Order", "Financing Loan"];

export default function MerchantStatusPage() {
  const { t, language } = useLanguage();
  const toast = useToast();
  const merchantOptions = useMerchantOptions();

  const DEFAULT_CHECKLIST = [
    {
      label:
        language === "id"
          ? "Volume transaksi minimum tercapai"
          : "Minimum transaction volume threshold met",
      done: false,
    },
    {
      label:
        language === "id"
          ? "Merchant aktif bertransaksi > 30 hari"
          : "Merchant actively transacting > 30 days",
      done: false,
    },
    {
      label:
        language === "id"
          ? "Dokumen pendukung lengkap & terverifikasi"
          : "Supporting documents complete & verified",
      done: false,
    },
  ];

  const STATUS_OPTIONS = [
    { value: "diajukan", label: language === "id" ? "Diajukan" : "Submitted" },
    { value: "review", label: language === "id" ? "Dalam Review" : "In Review" },
    { value: "menunggu_dokumen", label: language === "id" ? "Menunggu Dokumen" : "Waiting Docs" },
    { value: "disetujui", label: language === "id" ? "Disetujui" : "Approved" },
    { value: "ditolak", label: language === "id" ? "Ditolak" : "Rejected" },
  ];

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [newClaim, setNewClaim] = useState<Record<string, any>>({ feature: FEATURE_OPTIONS[0] });
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<any | null>(null);
  const [detailNotes, setDetailNotes] = useState("");
  const [commissionEstimate, setCommissionEstimate] = useState("");

  async function fetchRows() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("merchant_status_claims")
        .select("*, merchant:merchants(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRows(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Error loading data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
  }, []);

  const filtered = rows.filter((r) => {
    const matchSearch =
      !search ||
      r.merchant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.submitted_by_team?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      let merchantId = newClaim.merchant_id;

      if (typeof merchantId === "string" && merchantId.startsWith("manual:")) {
        const rawName = merchantId.replace("manual:", "");
        merchantId = await resolveMerchantId(rawName, merchantOptions);
        if (!merchantId) throw new Error(`Gagal memproses merchant: ${rawName}`);
      }

      const { error } = await supabase.from("merchant_status_claims").insert({
        merchant_id: merchantId,
        feature: newClaim.feature,
        submitted_by_team: newClaim.submitted_by_team,
        checklist: DEFAULT_CHECKLIST,
        status: "diajukan",
      });
      if (error) throw error;
      setCreateOpen(false);
      setNewClaim({ feature: FEATURE_OPTIONS[0] });
      toast.success(t("toast_created"));
      fetchRows();
    } catch (err: any) {
      toast.error(`${t("save_error")}: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function openDetail(row: any) {
    setDetail({ ...row, checklist: row.checklist ?? DEFAULT_CHECKLIST });
    setDetailNotes(row.notes ?? "");
    setCommissionEstimate(row.commission_estimate ?? "");
  }

  function toggleChecklist(idx: number) {
    setDetail((prev: any) => {
      const checklist = [...prev.checklist];
      checklist[idx] = { ...checklist[idx], done: !checklist[idx].done };
      return { ...prev, checklist };
    });
  }

  async function saveDetail(newStatus?: string) {
    if (!detail) return;
    const allDone = detail.checklist.every((c: any) => c.done);
    if (newStatus === "disetujui" && !allDone) {
      if (
        !confirm(
          language === "id"
            ? "Belum semua syarat terpenuhi. Tetap setujui secara manual (override)?"
            : "Not all criteria are met. Approve manually anyway?"
        )
      )
        return;
    }
    const supabase = createClient();
    const { error } = await supabase
      .from("merchant_status_claims")
      .update({
        checklist: detail.checklist,
        notes: detailNotes,
        commission_estimate: commissionEstimate ? Number(commissionEstimate) : null,
        status: newStatus ?? detail.status,
      })
      .eq("id", detail.id);
    if (error) {
      toast.error(`${t("save_error")}: ${error.message}`);
      return;
    }
    setDetail(null);
    toast.success(t("toast_updated"));
    fetchRows();
  }

  const columns: ColumnDef<any>[] = [
    { key: "merchant", label: t("ms_col_merchant"), render: (r) => r.merchant?.name ?? "-" },
    { key: "feature", label: t("ms_col_feature") },
    { key: "submitted_by_team", label: t("ms_col_team") },
    {
      key: "checklist",
      label: t("ms_col_checklist"),
      render: (r) => {
        const list = r.checklist ?? [];
        const done = list.filter((c: any) => c.done).length;
        return (
          <span className="inline-flex items-center gap-1.5 font-medium">
            <CheckCircle2
              className={`h-4 w-4 ${done === list.length && done > 0 ? "text-emerald-600" : "text-slate-300"}`}
            />
            {done}/{list.length}
          </span>
        );
      },
    },
    { key: "status", label: t("ms_col_status"), render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "commission_estimate",
      label: t("ms_col_commission"),
      align: "right",
      render: (r) => formatRupiah(r.commission_estimate),
    },
    { key: "created_at", label: t("ms_col_date"), render: (r) => formatDate(r.created_at) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("ms_title")}
        description={t("ms_desc")}
        action={
          <Button size="sm" variant="accent" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> {t("ms_add")}
          </Button>
        }
      />

      {!isSupabaseConfigured && <SupabaseNotice />}
      {isSupabaseConfigured && error && <ErrorNotice message={error} />}

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={language === "id" ? "Cari merchant / tim..." : "Search merchant / team..."}
        filters={[{ key: "status", label: t("ms_col_status"), options: STATUS_OPTIONS }]}
        filterValues={{ status: statusFilter }}
        onFilterChange={(_, v) => setStatusFilter(v)}
      />

      <DataTable
        columns={columns}
        rows={filtered}
        onRowClick={openDetail}
        emptyText={loading ? t("loading") : t("no_data")}
      />

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={language === "id" ? "Ajukan Merchant untuk Klaim Komisi" : "Submit Merchant for Commission Claim"}
      >
        <form onSubmit={handleCreate}>
          <Field>
            <MerchantSelectField
              required
              label={t("ms_col_merchant")}
              value={newClaim.merchant_id ?? ""}
              onChange={(val) => setNewClaim((p) => ({ ...p, merchant_id: val }))}
            />
          </Field>
          <Field>
            <Label>{language === "id" ? "Fitur VAS Terkait" : "Associated VAS Feature"}</Label>
            <Select
              required
              value={newClaim.feature}
              onChange={(e) => setNewClaim((p) => ({ ...p, feature: e.target.value }))}
            >
              {FEATURE_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label>{t("ms_col_team")}</Label>
            <Input
              required
              placeholder={language === "id" ? "mis. Sales Regional A" : "e.g. Regional Sales Team A"}
              value={newClaim.submitted_by_team ?? ""}
              onChange={(e) => setNewClaim((p) => ({ ...p, submitted_by_team: e.target.value }))}
            />
          </Field>
          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="accent" loading={saving}>
              {t("save")}
            </Button>
          </div>
        </form>
      </Dialog>

      {detail && (
        <Dialog
          open={!!detail}
          onClose={() => setDetail(null)}
          title={detail.merchant?.name ?? (language === "id" ? "Detail Pengajuan" : "Submission Details")}
          width="max-w-xl"
        >
          <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1 border border-slate-200">
              {t("ms_col_feature")}: {detail.feature}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 border border-slate-200">
              {t("ms_col_team")}: {detail.submitted_by_team}
            </span>
            <StatusBadge status={detail.status} />
          </div>

          <Label>{t("ms_col_checklist")}</Label>
          <div className="mb-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            {detail.checklist.map((c: any, idx: number) => (
              <label key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={c.done}
                  onChange={() => toggleChecklist(idx)}
                  className="h-4 w-4 rounded accent-accent cursor-pointer"
                />
                {c.label}
              </label>
            ))}
          </div>

          <Field>
            <Label>{t("ms_col_commission")}</Label>
            <CurrencyInput
              value={commissionEstimate}
              onChange={(digits) => setCommissionEstimate(digits)}
            />
          </Field>
          <Field>
            <Label>{language === "id" ? "Catatan / Alasan" : "Notes / Remarks"}</Label>
            <Textarea
              value={detailNotes}
              onChange={(e) => setDetailNotes(e.target.value)}
              placeholder={language === "id" ? "Alasan verifikasi atau catatan tambahan" : "Verification remarks or notes"}
            />
          </Field>

          <div className="flex flex-wrap justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
            <Button variant="secondary" onClick={() => saveDetail()}>
              {t("save")}
            </Button>
            <Button variant="danger" onClick={() => saveDetail("ditolak")}>
              {t("rejected")}
            </Button>
            <Button variant="accent" onClick={() => saveDetail("disetujui")}>
              {t("approved")}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
