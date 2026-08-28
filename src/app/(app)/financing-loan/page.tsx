"use client";

import { useEffect, useState } from "react";
import { FileUp } from "lucide-react";
import { ResourceManager } from "@/components/shared/ResourceManager";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { useMerchantOptions } from "@/lib/hooks/useMerchantOptions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatDate, formatRupiah } from "@/lib/utils";
import type { ColumnDef } from "@/components/shared/DataTable";
import { ImportExcelDialog } from "@/components/financing/ImportExcelDialog";
import { FinancingGrowthChart, type LoanGrowthPoint } from "@/components/financing/FinancingGrowthChart";
import { useLanguage } from "@/lib/LanguageContext";

export default function FinancingLoanPage() {
  const { t, language } = useLanguage();
  const merchantOptions = useMerchantOptions();
  const [importOpen, setImportOpen] = useState(false);
  const [reloadSignal, setReloadSignal] = useState(0);
  const [growthData, setGrowthData] = useState<LoanGrowthPoint[]>([]);

  const STATUS_OPTIONS = [
    { value: "diajukan", label: language === "id" ? "Diajukan" : "Submitted" },
    { value: "disetujui", label: language === "id" ? "Disetujui" : "Approved" },
    { value: "dicairkan", label: language === "id" ? "Dicairkan" : "Disbursed" },
    { value: "lunas", label: language === "id" ? "Lunas" : "Paid Off" },
    { value: "bermasalah", label: language === "id" ? "Bermasalah" : "In Default" },
  ];

  async function loadGrowthChart() {
    if (!isSupabaseConfigured) {
      setGrowthData([
        { merchant: "Kopi Kenangan", before: 45000000, after: 78000000 },
        { merchant: "Resto Padang Sederhana", before: 65000000, after: 110000000 },
        { merchant: "Toko Elektronik Maju", before: 80000000, after: 125000000 },
        { merchant: "Apotek Sehat Selalu", before: 35000000, after: 58000000 },
      ]);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("financing_loans")
      .select("loan_amount, revenue_before, revenue_after, merchant:merchants(name)")
      .not("revenue_before", "is", null)
      .not("revenue_after", "is", null)
      .order("loan_amount", { ascending: false })
      .limit(8);

    if (data && data.length > 0) {
      setGrowthData(
        data.map((d: any) => ({
          merchant: d.merchant?.name ?? "-",
          before: d.revenue_before ?? 0,
          after: d.revenue_after ?? 0,
        }))
      );
    } else {
      setGrowthData([
        { merchant: "Kopi Kenangan", before: 45000000, after: 78000000 },
        { merchant: "Resto Padang Sederhana", before: 65000000, after: 110000000 },
        { merchant: "Toko Elektronik Maju", before: 80000000, after: 125000000 },
      ]);
    }
  }

  useEffect(() => {
    loadGrowthChart();
  }, [reloadSignal]);

  const columns: ColumnDef<any>[] = [
    { key: "merchant", label: t("fl_col_merchant"), render: (r) => r.merchant?.name ?? "-" },
    { key: "loan_amount", label: t("fl_col_amount"), align: "right", render: (r) => formatRupiah(r.loan_amount) },
    { key: "disbursed_at", label: t("fl_col_disbursed"), render: (r) => formatDate(r.disbursed_at) },
    { key: "revenue_before", label: t("fl_col_rev_before"), align: "right", render: (r) => formatRupiah(r.revenue_before) },
    { key: "revenue_after", label: t("fl_col_rev_after"), align: "right", render: (r) => formatRupiah(r.revenue_after) },
    { key: "status", label: t("fl_col_status"), render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <FinancingGrowthChart data={growthData} />

      <ResourceManager
        table="financing_loans"
        title={t("fl_title")}
        description={t("fl_desc")}
        addLabel={t("fl_add")}
        selectQuery="*, merchant:merchants(name)"
        searchKeys={["pic", "notes"]}
        filters={[{ key: "status", label: t("fl_col_status"), options: STATUS_OPTIONS }]}
        defaultValues={{ status: "diajukan" }}
        columns={columns}
        reloadSignal={reloadSignal}
        extraHeaderAction={
          <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
            <FileUp className="h-4 w-4" /> {t("fl_import_btn")}
          </Button>
        }
        formFields={[
          { key: "merchant_id", label: t("fl_col_merchant"), type: "merchant_select", required: true, options: merchantOptions },
          { key: "loan_amount", label: t("fl_col_amount"), type: "currency", required: true },
          { key: "disbursed_at", label: t("fl_col_disbursed"), type: "date" },
          { key: "status", label: t("fl_col_status"), type: "select", required: true, options: STATUS_OPTIONS },
          { key: "revenue_before", label: t("fl_col_rev_before"), type: "currency" },
          { key: "revenue_after", label: t("fl_col_rev_after"), type: "currency" },
        ]}
      />

      <ImportExcelDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => setReloadSignal((s) => s + 1)}
      />
    </div>
  );
}
