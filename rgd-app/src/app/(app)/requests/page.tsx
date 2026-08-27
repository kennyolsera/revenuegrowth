"use client";

import { ResourceManager } from "@/components/shared/ResourceManager";
import { StatusBadge } from "@/components/ui/Badge";
import { useTableOptions } from "@/lib/hooks/useTableOptions";
import { formatDate } from "@/lib/utils";
import type { ColumnDef } from "@/components/shared/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export default function RequestsPage() {
  const { t, language } = useLanguage();
  const categoryOptions = useTableOptions("request_categories", "name");

  const STATUS_OPTIONS = [
    { value: "baru", label: language === "id" ? "Baru" : "New" },
    { value: "ditugaskan", label: language === "id" ? "Ditugaskan" : "Assigned" },
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
    { key: "title", label: t("req_col_title") },
    { key: "category", label: t("req_col_category"), render: (r) => r.category?.name ?? "-" },
    { key: "requester_name", label: t("req_col_requester") },
    { key: "priority", label: t("req_col_priority"), render: (r) => <StatusBadge status={r.priority} /> },
    { key: "status", label: t("req_col_status"), render: (r) => <StatusBadge status={r.status} /> },
    { key: "assigned_pic", label: t("req_col_pic") },
    { key: "created_at", label: t("req_col_date"), render: (r) => formatDate(r.created_at) },
  ];

  return (
    <ResourceManager
      table="requests"
      title={t("req_title")}
      description={t("req_desc")}
      addLabel={t("req_add")}
      selectQuery="*, category:request_categories(name)"
      searchKeys={["title", "requester_name", "assigned_pic"]}
      filters={[
        { key: "status", label: t("req_col_status"), options: STATUS_OPTIONS },
        { key: "priority", label: t("req_col_priority"), options: PRIORITY_OPTIONS },
      ]}
      defaultValues={{ status: "baru", priority: "medium" }}
      columns={columns}
      formFields={[
        { key: "title", label: t("req_col_title"), required: true, colSpan: 2 },
        { key: "category_id", label: t("req_col_category"), type: "select", required: true, options: categoryOptions },
        { key: "priority", label: t("req_col_priority"), type: "select", required: true, options: PRIORITY_OPTIONS },
        { key: "requester_name", label: language === "id" ? "Nama Pengaju" : "Requester Name", required: true },
        { key: "requester_division", label: language === "id" ? "Divisi Pengaju" : "Requester Division" },
        { key: "status", label: t("req_col_status"), type: "select", required: true, options: STATUS_OPTIONS },
        { key: "assigned_pic", label: t("req_col_pic") },
        { key: "description", label: language === "id" ? "Deskripsi Kebutuhan" : "Request Description", type: "textarea", colSpan: 2 },
      ]}
    />
  );
}
