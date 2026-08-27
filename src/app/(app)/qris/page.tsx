"use client";

import { ResourceManager } from "@/components/shared/ResourceManager";
import { StatusBadge } from "@/components/ui/Badge";
import { useMerchantOptions } from "@/lib/hooks/useMerchantOptions";
import { formatDate } from "@/lib/utils";
import type { ColumnDef } from "@/components/shared/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export default function QrisPage() {
  const { t, language } = useLanguage();
  const merchantOptions = useMerchantOptions();

  const STATUS_OPTIONS = [
    { value: "diajukan", label: language === "id" ? "Diajukan" : "Submitted" },
    { value: "verifikasi", label: language === "id" ? "Verifikasi Dokumen" : "Doc Verification" },
    { value: "aktivasi", label: language === "id" ? "Aktivasi" : "Activation" },
    { value: "aktif", label: language === "id" ? "Aktif Bertransaksi" : "Active Transacting" },
    { value: "tidak_lanjut", label: language === "id" ? "Tidak Lanjut" : "Dropped" },
  ];

  const columns: ColumnDef<any>[] = [
    { key: "merchant", label: t("qris_col_merchant"), render: (r) => r.merchant?.name ?? "-" },
    { key: "region", label: t("qris_col_region") },
    { key: "status", label: t("qris_col_status"), render: (r) => <StatusBadge status={r.status} /> },
    { key: "transaction_volume", label: t("qris_col_volume"), align: "right" },
    { key: "pic", label: t("qris_col_pic") },
    { key: "submitted_at", label: t("qris_col_date"), render: (r) => formatDate(r.submitted_at) },
  ];

  return (
    <ResourceManager
      table="qris_acquisitions"
      title={t("qris_title")}
      description={t("qris_desc")}
      addLabel={t("qris_add")}
      selectQuery="*, merchant:merchants(name)"
      searchKeys={["region", "pic", "notes"]}
      filters={[{ key: "status", label: t("qris_col_status"), options: STATUS_OPTIONS }]}
      defaultValues={{ status: "diajukan" }}
      columns={columns}
      formFields={[
        { key: "merchant_id", label: t("qris_col_merchant"), type: "select", required: true, options: merchantOptions },
        { key: "region", label: t("qris_col_region"), required: true },
        { key: "pic", label: t("qris_col_pic"), required: true },
        { key: "status", label: t("qris_col_status"), type: "select", required: true, options: STATUS_OPTIONS },
        { key: "transaction_volume", label: t("qris_col_volume"), type: "number" },
        { key: "submitted_at", label: t("qris_col_date"), type: "date", required: true },
        { key: "notes", label: language === "id" ? "Catatan" : "Notes", type: "textarea", colSpan: 2 },
      ]}
    />
  );
}
