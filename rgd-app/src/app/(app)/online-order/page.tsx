"use client";

import { ResourceManager } from "@/components/shared/ResourceManager";
import { StatusBadge } from "@/components/ui/Badge";
import { useMerchantOptions } from "@/lib/hooks/useMerchantOptions";
import { formatDate } from "@/lib/utils";
import type { ColumnDef } from "@/components/shared/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export default function OnlineOrderPage() {
  const { t, language } = useLanguage();
  const merchantOptions = useMerchantOptions();

  const TYPE_OPTIONS = [
    { value: "demo", label: "Demo" },
    { value: "onboarding", label: "Onboarding" },
    { value: "support", label: "Support" },
    { value: "upgrade", label: "Upgrade" },
  ];

  const STATUS_OPTIONS = [
    { value: "baru", label: language === "id" ? "Baru" : "New" },
    { value: "dijadwalkan", label: language === "id" ? "Dijadwalkan" : "Scheduled" },
    { value: "diproses", label: language === "id" ? "Diproses" : "In Progress" },
    { value: "selesai", label: language === "id" ? "Selesai" : "Completed" },
    { value: "batal", label: language === "id" ? "Batal" : "Cancelled" },
  ];

  const PRIORITY_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const columns: ColumnDef<any>[] = [
    { key: "merchant", label: t("oo_col_merchant"), render: (r) => r.merchant?.name ?? "-" },
    { key: "activity_type", label: t("oo_col_type"), render: (r) => <StatusBadge status={r.activity_type} /> },
    { key: "priority", label: t("oo_col_priority"), render: (r) => <StatusBadge status={r.priority} /> },
    { key: "status", label: t("oo_col_status"), render: (r) => <StatusBadge status={r.status} /> },
    { key: "pic", label: t("oo_col_pic") },
    { key: "scheduled_at", label: t("oo_col_schedule"), render: (r) => formatDate(r.scheduled_at, true) },
  ];

  return (
    <ResourceManager
      table="online_order_activities"
      title={t("oo_title")}
      description={t("oo_desc")}
      addLabel={t("oo_add")}
      selectQuery="*, merchant:merchants(name)"
      searchKeys={["pic"]}
      filters={[
        { key: "activity_type", label: t("oo_col_type"), options: TYPE_OPTIONS },
        { key: "status", label: t("oo_col_status"), options: STATUS_OPTIONS },
      ]}
      defaultValues={{ status: "baru", priority: "medium", activity_type: "demo" }}
      columns={columns}
      formFields={[
        { key: "merchant_id", label: t("oo_col_merchant"), type: "select", required: true, options: merchantOptions },
        { key: "activity_type", label: t("oo_col_type"), type: "select", required: true, options: TYPE_OPTIONS },
        { key: "priority", label: t("oo_col_priority"), type: "select", required: true, options: PRIORITY_OPTIONS },
        { key: "status", label: t("oo_col_status"), type: "select", required: true, options: STATUS_OPTIONS },
        { key: "pic", label: t("oo_col_pic"), required: true },
        { key: "scheduled_at", label: t("oo_col_schedule"), type: "datetime-local" },
        { key: "notes", label: language === "id" ? "Catatan" : "Notes", type: "textarea", colSpan: 2 },
      ]}
    />
  );
}
