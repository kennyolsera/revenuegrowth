"use client";

import { ResourceManager } from "@/components/shared/ResourceManager";
import { StatusBadge } from "@/components/ui/Badge";
import { useMerchantOptions } from "@/lib/hooks/useMerchantOptions";
import { formatDate } from "@/lib/utils";
import type { ColumnDef } from "@/components/shared/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export default function NetworkPartnerPage() {
  const { t, language } = useLanguage();
  const merchantOptions = useMerchantOptions();

  const STATUS_OPTIONS = [
    { value: "draft", label: "Draft" },
    { value: "siap_handover", label: language === "id" ? "Siap Handover" : "Ready for Handover" },
    { value: "terkirim", label: language === "id" ? "Terkirim ke Partner" : "Sent to Partner" },
    { value: "diproses_partner", label: language === "id" ? "Diproses Partner" : "In Partner Review" },
    { value: "selesai", label: language === "id" ? "Selesai" : "Completed" },
    { value: "ditolak", label: language === "id" ? "Ditolak" : "Rejected" },
  ];

  const columns: ColumnDef<any>[] = [
    { key: "merchant", label: t("np_col_merchant"), render: (r) => r.merchant?.name ?? "-" },
    { key: "partner_name", label: t("np_col_partner") },
    { key: "contact_person", label: t("np_col_contact") },
    { key: "status", label: t("np_col_status"), render: (r) => <StatusBadge status={r.status} /> },
    { key: "pic", label: t("np_col_pic") },
    { key: "created_at", label: t("np_col_date"), render: (r) => formatDate(r.created_at) },
  ];

  return (
    <ResourceManager
      table="network_partner_handovers"
      title={t("np_title")}
      description={t("np_desc")}
      addLabel={t("np_add")}
      selectQuery="*, merchant:merchants(name)"
      searchKeys={["partner_name", "contact_person", "pic"]}
      filters={[{ key: "status", label: t("np_col_status"), options: STATUS_OPTIONS }]}
      defaultValues={{ status: "draft" }}
      columns={columns}
      formFields={[
        { key: "merchant_id", label: t("np_col_merchant"), type: "select", required: true, options: merchantOptions },
        { key: "partner_name", label: language === "id" ? "Nama Partner Tujuan" : "Target Partner Name", required: true },
        { key: "contact_person", label: "Contact Person" },
        { key: "pic", label: t("np_col_pic"), required: true },
        { key: "status", label: t("np_col_status"), type: "select", required: true, options: STATUS_OPTIONS },
        { key: "notes", label: language === "id" ? "Catatan / Kebutuhan Jaringan" : "Network Requirements / Notes", type: "textarea", colSpan: 2 },
      ]}
    />
  );
}
