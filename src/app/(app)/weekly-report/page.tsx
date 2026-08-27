"use client";

import { ResourceManager } from "@/components/shared/ResourceManager";
import { formatDate } from "@/lib/utils";
import type { ColumnDef } from "@/components/shared/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export default function WeeklyReportPage() {
  const { t, language } = useLanguage();

  const columns: ColumnDef<any>[] = [
    { key: "week_start", label: t("wr_col_start"), render: (r) => formatDate(r.week_start) },
    { key: "week_end", label: t("wr_col_end"), render: (r) => formatDate(r.week_end) },
    { key: "demo_count", label: t("wr_col_demo"), align: "right" },
    { key: "onboard_count", label: t("wr_col_onboard"), align: "right" },
    { key: "support_count", label: t("wr_col_support"), align: "right" },
    { key: "summary", label: t("wr_col_summary") },
  ];

  return (
    <ResourceManager
      table="weekly_reports"
      title={t("wr_title")}
      description={t("wr_desc")}
      addLabel={t("wr_add")}
      searchKeys={[]}
      columns={columns}
      formFields={[
        { key: "week_start", label: t("wr_col_start"), type: "date", required: true },
        { key: "week_end", label: t("wr_col_end"), type: "date", required: true },
        { key: "demo_count", label: language === "id" ? "Jumlah Demo" : "Demo Count", type: "number", required: true },
        { key: "onboard_count", label: language === "id" ? "Jumlah Onboarding" : "Onboard Count", type: "number", required: true },
        { key: "support_count", label: language === "id" ? "Jumlah Support" : "Support Count", type: "number", required: true },
        { key: "summary", label: language === "id" ? "Catatan / Insight Tambahan" : "Additional Notes / Insights", type: "textarea", colSpan: 2 },
      ]}
    />
  );
}
